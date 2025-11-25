import { useEffect } from "react";
import type {
  ActionFunctionArgs,
  HeadersFunction,
  LoaderFunctionArgs,
} from "react-router";
import { Form, useActionData, useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";
import prisma from "../db.server";
import { useAppBridge } from "@shopify/app-bridge-react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session, admin } = await authenticate.admin(request);

  // Obtener todas las asignaciones de la tienda
  const assignments = await prisma.customerTierAssignment.findMany({
    where: { shop: session.shop },
    include: {
      tier: true,
    },
    orderBy: { assignedAt: "desc" },
  });

  // Obtener información de los clientes desde Shopify
  const customerIds = assignments.map((a) => a.customerId);

  let customers: any[] = [];
  if (customerIds.length > 0) {
    // GraphQL query para obtener múltiples clientes
    const idsQuery = customerIds.map((id) => `"${id}"`).join(" OR ");

    const response = await admin.graphql(
      `#graphql
        query getCustomers {
          customers(first: 250, query: "id:${idsQuery}") {
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
    customers = data.data?.customers?.edges?.map((edge: any) => edge.node) || [];
  }

  // Combinar asignaciones con información de clientes
  const assignmentsWithCustomers = assignments.map((assignment) => {
    const customer = customers.find((c) => c.id === assignment.customerId);
    return {
      ...assignment,
      customer,
    };
  });

  return {
    assignments: assignmentsWithCustomers,
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const action = formData.get("action");
  const assignmentId = formData.get("assignmentId") as string;

  if (action === "delete" && assignmentId) {
    try {
      await prisma.customerTierAssignment.delete({
        where: { id: assignmentId },
      });

      return {
        success: true,
        message: "Asignación eliminada correctamente",
      };
    } catch (error) {
      console.error("Error al eliminar asignación:", error);
      return {
        error: "Error al eliminar la asignación",
      };
    }
  }

  return { error: "Acción no válida" };
};

export default function AssignmentsList() {
  const { assignments } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const shopify = useAppBridge();

  // Mostrar toast cuando se complete una acción
  useEffect(() => {
    if (actionData?.success) {
      shopify.toast.show(actionData.message || "Operación exitosa");
    }
  }, [actionData, shopify]);

  const handleDelete = (assignmentId: string, customerName: string) => {
    if (
      confirm(
        `¿Estás seguro de que quieres eliminar el nivel asignado a ${customerName}?`
      )
    ) {
      const form = document.getElementById(
        `delete-form-${assignmentId}`
      ) as HTMLFormElement;
      form?.submit();
    }
  };

  return (
    <s-page heading="Clientes con Niveles Asignados">
      <s-button slot="primary-action" href="/app/assignments/new" variant="primary">
        Asignar nivel
      </s-button>

      {actionData?.error && (
        <s-section>
          <s-banner tone="critical">
            <s-paragraph>{actionData.error}</s-paragraph>
          </s-banner>
        </s-section>
      )}

      {assignments.length === 0 ? (
        <s-section>
          <s-banner tone="info">
            <s-stack direction="block" gap="base">
              <s-paragraph>
                No hay clientes con niveles asignados todavía.
              </s-paragraph>
              <s-button href="/app/assignments/new" variant="primary">
                Asignar primer nivel
              </s-button>
            </s-stack>
          </s-banner>
        </s-section>
      ) : (
        <s-section>
          <s-stack direction="block" gap="base">
            <s-text variant="bodyMd" as="p" tone="subdued">
              {assignments.length} {assignments.length === 1 ? "cliente" : "clientes"}{" "}
              con nivel asignado
            </s-text>

            {assignments.map((assignment) => {
              const customer = assignment.customer;
              const customerName = customer
                ? `${customer.firstName || ""} ${customer.lastName || ""}`.trim()
                : "Cliente desconocido";

              return (
                <s-box
                  key={assignment.id}
                  padding="base"
                  borderWidth="base"
                  borderRadius="base"
                >
                  <s-stack direction="block" gap="base">
                    <s-stack direction="inline" gap="base" alignment="space-between">
                      <s-stack direction="block" gap="small">
                        <s-text variant="headingMd" as="h3">
                          {customerName}
                        </s-text>
                        {customer && (
                          <>
                            <s-text variant="bodySm" tone="subdued">
                              {customer.email}
                            </s-text>
                            <s-text variant="bodySm" tone="subdued">
                              {customer.numberOfOrders} pedidos •{" "}
                              {customer.amountSpent?.amount}{" "}
                              {customer.amountSpent?.currencyCode} gastados
                            </s-text>
                          </>
                        )}
                      </s-stack>

                      <s-stack direction="block" gap="small" alignment="end">
                        <s-box
                          padding="small"
                          borderWidth="base"
                          borderRadius="base"
                          background="subdued"
                        >
                          <s-text variant="bodySm" as="span">
                            <strong>{assignment.tier.name}</strong>
                          </s-text>
                        </s-box>
                        <s-text variant="bodySm" tone="subdued">
                          {assignment.tier.discountPercentage}% descuento
                        </s-text>
                      </s-stack>
                    </s-stack>

                    <s-stack direction="inline" gap="small">
                      <s-text variant="bodySm" tone="subdued">
                        Asignado:{" "}
                        {new Date(assignment.assignedAt).toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </s-text>
                    </s-stack>

                    <s-stack direction="inline" gap="base">
                      <s-button
                        href="/app/assignments/new"
                        variant="secondary"
                        size="slim"
                      >
                        Cambiar nivel
                      </s-button>
                      <Form
                        method="post"
                        id={`delete-form-${assignment.id}`}
                        style={{ display: "inline" }}
                      >
                        <input type="hidden" name="action" value="delete" />
                        <input type="hidden" name="assignmentId" value={assignment.id} />
                        <s-button
                          onClick={() => handleDelete(assignment.id, customerName)}
                          variant="plain"
                          tone="critical"
                          size="slim"
                          type="button"
                        >
                          Eliminar
                        </s-button>
                      </Form>
                    </s-stack>
                  </s-stack>
                </s-box>
              );
            })}
          </s-stack>
        </s-section>
      )}
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};