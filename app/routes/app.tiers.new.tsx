import type { ActionFunctionArgs } from "react-router";
import { useNavigate, useActionData, Form } from "react-router";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { useEffect } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();

  // Obtener datos del formulario
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const minSpent = parseFloat(formData.get("minSpent") as string);
  const minOrders = parseInt(formData.get("minOrders") as string);
  const discountPercentage = parseFloat(formData.get("discountPercentage") as string);
  const priority = parseInt(formData.get("priority") as string);
  const active = formData.get("active") === "true";

  // Validaciones
  const errors: Record<string, string> = {};

  if (!name || name.trim() === "") {
    errors.name = "El nombre es obligatorio";
  }

  if (isNaN(minSpent) || minSpent < 0) {
    errors.minSpent = "El gasto mínimo debe ser un número positivo";
  }

  if (isNaN(minOrders) || minOrders < 0) {
    errors.minOrders = "El número de pedidos debe ser un número positivo";
  }

  if (isNaN(discountPercentage) || discountPercentage < 0 || discountPercentage > 100) {
    errors.discountPercentage = "El descuento debe estar entre 0 y 100";
  }

  if (isNaN(priority) || priority < 0) {
    errors.priority = "La prioridad debe ser un número positivo";
  }

  // Si hay errores, devolverlos
  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  // Crear el nivel en la base de datos
  await prisma.customerTier.create({
    data: {
      shop: session.shop,
      name: name.trim(),
      description: description?.trim() || null,
      minSpent,
      minOrders,
      discountPercentage,
      priority,
      active,
    },
  });

  return { success: true };
};

export default function NewTier() {
  const navigate = useNavigate();
  const actionData = useActionData<typeof action>();
  const shopify = useAppBridge();

  useEffect(() => {
    if (actionData?.success) {
      shopify.toast.show("Nivel creado correctamente");
      navigate("/app/tiers");
    }
  }, [actionData?.success, navigate, shopify]);

  return (
    <s-page
      heading="Crear Nivel de Cliente"
      backAction={{ onClick: () => navigate("/app/tiers") }}
    >
      <Form method="post">
        <s-section>
          <s-stack direction="block" gap="base">
            {/* Nombre */}
            <s-stack direction="block" gap="tight">
              <s-text variant="headingMd" as="h3">
                Nombre del nivel *
              </s-text>
              <s-text-field
                name="name"
                placeholder="Ej: VIP, Premium, Básico"
                autoComplete="off"
                required
              />
              {actionData?.errors?.name && (
                <s-text tone="critical">{actionData.errors.name}</s-text>
              )}
            </s-stack>

            {/* Descripción */}
            <s-stack direction="block" gap="tight">
              <s-text variant="headingMd" as="h3">
                Descripción (opcional)
              </s-text>
              <s-text-field
                name="description"
                placeholder="Describe los beneficios de este nivel"
                autoComplete="off"
                multiline={3}
              />
            </s-stack>

            {/* Gasto mínimo */}
            <s-stack direction="block" gap="tight">
              <s-text variant="headingMd" as="h3">
                Gasto mínimo total *
              </s-text>
              <s-text-field
                name="minSpent"
                type="number"
                placeholder="0.00"
                step="0.01"
                min="0"
                prefix="$"
                autoComplete="off"
                required
              />
              {actionData?.errors?.minSpent && (
                <s-text tone="critical">{actionData.errors.minSpent}</s-text>
              )}
              <s-text tone="subdued">
                Cantidad total que el cliente debe haber gastado
              </s-text>
            </s-stack>

            {/* Pedidos mínimos */}
            <s-stack direction="block" gap="tight">
              <s-text variant="headingMd" as="h3">
                Número mínimo de pedidos *
              </s-text>
              <s-text-field
                name="minOrders"
                type="number"
                placeholder="0"
                step="1"
                min="0"
                autoComplete="off"
                required
              />
              {actionData?.errors?.minOrders && (
                <s-text tone="critical">{actionData.errors.minOrders}</s-text>
              )}
              <s-text tone="subdued">
                Número de pedidos completados requeridos
              </s-text>
            </s-stack>

            {/* Porcentaje de descuento */}
            <s-stack direction="block" gap="tight">
              <s-text variant="headingMd" as="h3">
                Porcentaje de descuento *
              </s-text>
              <s-text-field
                name="discountPercentage"
                type="number"
                placeholder="0"
                step="0.01"
                min="0"
                max="100"
                suffix="%"
                autoComplete="off"
                required
              />
              {actionData?.errors?.discountPercentage && (
                <s-text tone="critical">
                  {actionData.errors.discountPercentage}
                </s-text>
              )}
              <s-text tone="subdued">
                Descuento que recibirán los clientes de este nivel
              </s-text>
            </s-stack>

            {/* Prioridad */}
            <s-stack direction="block" gap="tight">
              <s-text variant="headingMd" as="h3">
                Prioridad *
              </s-text>
              <s-text-field
                name="priority"
                type="number"
                placeholder="0"
                step="1"
                min="0"
                autoComplete="off"
                required
              />
              {actionData?.errors?.priority && (
                <s-text tone="critical">{actionData.errors.priority}</s-text>
              )}
              <s-text tone="subdued">
                Mayor número = mayor prioridad. Si un cliente cumple criterios de múltiples niveles, se asignará el de mayor prioridad.
              </s-text>
            </s-stack>

            {/* Activo */}
            <s-stack direction="block" gap="tight">
              <s-checkbox name="active" value="true" defaultChecked>
                Nivel activo
              </s-checkbox>
              <s-text tone="subdued">
                Los niveles inactivos no se asignarán automáticamente
              </s-text>
            </s-stack>

            {/* Botones */}
            <s-stack direction="inline" gap="base">
              <s-button type="submit" variant="primary">
                Crear Nivel
              </s-button>
              <s-button onClick={() => navigate("/app/tiers")}>
                Cancelar
              </s-button>
            </s-stack>
          </s-stack>
        </s-section>
      </Form>

      <s-section slot="aside" heading="Consejos">
        <s-unordered-list>
          <s-list-item>
            Define criterios claros para cada nivel
          </s-list-item>
          <s-list-item>
            Usa la prioridad para establecer una jerarquía
          </s-list-item>
          <s-list-item>
            Los descuentos se aplicarán automáticamente en el checkout
          </s-list-item>
        </s-unordered-list>
      </s-section>
    </s-page>
  );
}