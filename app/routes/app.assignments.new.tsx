import { useEffect, useState } from "react";
import type {
  ActionFunctionArgs,
  HeadersFunction,
  LoaderFunctionArgs,
} from "react-router";
import { Form, useActionData, useLoaderData, useNavigation } from "react-router";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";
import prisma from "../db.server";
import { useAppBridge } from "@shopify/app-bridge-react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session, admin } = await authenticate.admin(request);

  // Obtener niveles disponibles
  const tiers = await prisma.customerTier.findMany({
    where: {
      shop: session.shop,
      active: true,
    },
    orderBy: { priority: "desc" },
  });

  // Obtener clientes de Shopify con GraphQL
  const response = await admin.graphql(
    `#graphql
      query getCustomers {
        customers(first: 50) {
          edges {
            node {
              id
              firstName
              lastName
              email
              numberOfOrders
              amountSpent {
                amount
                currencyCode
              }
            }
          }
        }
      }
    `
  );

  const data = await response.json();
  const customers = data.data?.customers?.edges?.map((edge: any) => edge.node) || [];

  return {
    tiers,
    customers,
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();

  const customerId = formData.get("customerId") as string;
  const tierId = formData.get("tierId") as string;

  // Validación
  if (!customerId || !tierId) {
    return {
      error: "Debes seleccionar un cliente y un nivel",
    };
  }

  try {
    // Verificar si ya existe una asignación para este cliente
    const existingAssignment = await prisma.customerTierAssignment.findFirst({
      where: {
        shop: session.shop,
        customerId,
      },
    });

    if (existingAssignment) {
      // Actualizar asignación existente
      await prisma.customerTierAssignment.update({
        where: { id: existingAssignment.id },
        data: {
          tierId,
          assignedAt: new Date(),
        },
      });
    } else {
      // Crear nueva asignación
      await prisma.customerTierAssignment.create({
        data: {
          shop: session.shop,
          customerId,
          tierId,
          assignedAt: new Date(),
        },
      });
    }

    return {
      success: true,
      message: "Nivel asignado correctamente",
    };
  } catch (error) {
    console.error("Error al asignar nivel:", error);
    return {
      error: "Error al asignar nivel. Por favor intenta nuevamente.",
    };
  }
};

export default function AssignTier() {
  const { tiers, customers } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const shopify = useAppBridge();

  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedTier, setSelectedTier] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const isSubmitting = navigation.state === "submitting";

  // Mostrar toast cuando se complete la acción
  useEffect(() => {
    if (actionData?.success) {
      shopify.toast.show(actionData.message || "Nivel asignado correctamente");
      // Limpiar formulario
      setSelectedCustomer("");
      setSelectedTier("");
    }
  }, [actionData, shopify]);

  // Filtrar clientes por búsqueda
  const filteredCustomers = customers.filter((customer: any) => {
    const searchLower = searchTerm.toLowerCase();
    const fullName = `${customer.firstName || ""} ${customer.lastName || ""}`.toLowerCase();
    const email = (customer.email || "").toLowerCase();
    return fullName.includes(searchLower) || email.includes(searchLower);
  });

  // Obtener información del cliente seleccionado
  const selectedCustomerData = customers.find((c: any) => c.id === selectedCustomer);

  return (
    <s-page
      heading="Asignar Nivel a Cliente"
      backAction={{ content: "Regresar", url: "/app" }}
    >
      {tiers.length === 0 ? (
        <s-section>
          <s-banner tone="warning">
            <s-paragraph>
              No tienes niveles activos. Primero debes{" "}
              <s-link href="/app/tiers/new">crear un nivel</s-link>.
            </s-paragraph>
          </s-banner>
        </s-section>
      ) : (
        <Form method="post">
          <s-section>
            {actionData?.error && (
              <s-banner tone="critical">
                <s-paragraph>{actionData.error}</s-paragraph>
              </s-banner>
            )}

            <s-stack direction="block" gap="large">
              {/* Búsqueda de clientes */}
              <s-stack direction="block" gap="base">
                <s-text variant="headingMd" as="h3">
                  1. Buscar cliente
                </s-text>
                <s-text-field
                  label="Buscar por nombre o email"
                  value={searchTerm}
                  onInput={(e: any) => setSearchTerm(e.target.value)}
                  placeholder="Escribe para buscar..."
                />
              </s-stack>

              {/* Lista de clientes */}
              <s-stack direction="block" gap="base">
                <s-text variant="headingMd" as="h3">
                  2. Seleccionar cliente
                </s-text>

                {filteredCustomers.length === 0 ? (
                  <s-banner tone="info">
                    <s-paragraph>
                      {searchTerm
                        ? "No se encontraron clientes con ese criterio de búsqueda."
                        : "No hay clientes en tu tienda. Agrega clientes primero en Shopify Admin."}
                    </s-paragraph>
                  </s-banner>
                ) : (
                  <s-stack direction="block" gap="small">
                    {filteredCustomers.slice(0, 10).map((customer: any) => (
                      <s-box
                        key={customer.id}
                        padding="base"
                        borderWidth="base"
                        borderRadius="base"
                        {...(selectedCustomer === customer.id
                          ? { background: "subdued" }
                          : {})}
                      >
                        <s-stack direction="inline" gap="base" alignment="center">
                          <input
                            type="radio"
                            name="customerId"
                            value={customer.id}
                            checked={selectedCustomer === customer.id}
                            onChange={(e) => setSelectedCustomer(e.target.value)}
                            style={{ cursor: "pointer" }}
                          />
                          <s-stack direction="block" gap="none">
                            <s-text variant="bodyMd" as="p">
                              <strong>
                                {customer.firstName} {customer.lastName}
                              </strong>
                            </s-text>
                            <s-text variant="bodySm" as="p" tone="subdued">
                              {customer.email}
                            </s-text>
                            <s-text variant="bodySm" as="p" tone="subdued">
                              {customer.numberOfOrders} pedidos • {customer.amountSpent?.amount}{" "}
                              {customer.amountSpent?.currencyCode}
                            </s-text>
                          </s-stack>
                        </s-stack>
                      </s-box>
                    ))}
                    {filteredCustomers.length > 10 && (
                      <s-text variant="bodySm" tone="subdued">
                        Mostrando 10 de {filteredCustomers.length} clientes. Usa la búsqueda
                        para encontrar más.
                      </s-text>
                    )}
                  </s-stack>
                )}
              </s-stack>

              {/* Selección de nivel */}
              {selectedCustomer && (
                <s-stack direction="block" gap="base">
                  <s-text variant="headingMd" as="h3">
                    3. Seleccionar nivel
                  </s-text>
                  <s-stack direction="block" gap="small">
                    {tiers.map((tier) => (
                      <s-box
                        key={tier.id}
                        padding="base"
                        borderWidth="base"
                        borderRadius="base"
                        {...(selectedTier === tier.id ? { background: "subdued" } : {})}
                      >
                        <s-stack direction="inline" gap="base" alignment="center">
                          <input
                            type="radio"
                            name="tierId"
                            value={tier.id}
                            checked={selectedTier === tier.id}
                            onChange={(e) => setSelectedTier(e.target.value)}
                            style={{ cursor: "pointer" }}
                          />
                          <s-stack direction="block" gap="none">
                            <s-text variant="bodyMd" as="p">
                              <strong>{tier.name}</strong>
                            </s-text>
                            {tier.description && (
                              <s-text variant="bodySm" as="p" tone="subdued">
                                {tier.description}
                              </s-text>
                            )}
                            <s-text variant="bodySm" as="p" tone="subdued">
                              Descuento: {tier.discountPercentage}% • Mínimo: $
                              {tier.minSpent} • {tier.minOrders} pedidos
                            </s-text>
                          </s-stack>
                        </s-stack>
                      </s-box>
                    ))}
                  </s-stack>
                </s-stack>
              )}

              {/* Resumen */}
              {selectedCustomer && selectedTier && (
                <s-box padding="base" borderWidth="base" borderRadius="base">
                  <s-stack direction="block" gap="small">
                    <s-text variant="headingMd" as="h3">
                      Resumen
                    </s-text>
                    <s-paragraph>
                      Se asignará el nivel{" "}
                      <strong>{tiers.find((t) => t.id === selectedTier)?.name}</strong> al
                      cliente{" "}
                      <strong>
                        {selectedCustomerData?.firstName} {selectedCustomerData?.lastName}
                      </strong>
                    </s-paragraph>
                  </s-stack>
                </s-box>
              )}

              {/* Botón de enviar */}
              <s-stack direction="inline" gap="base">
                <s-button
                  submit
                  variant="primary"
                  disabled={!selectedCustomer || !selectedTier || isSubmitting}
                  {...(isSubmitting ? { loading: true } : {})}
                >
                  Asignar nivel
                </s-button>
                <s-button href="/app">Cancelar</s-button>
              </s-stack>
            </s-stack>
          </s-section>
        </Form>
      )}
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};