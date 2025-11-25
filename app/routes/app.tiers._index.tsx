import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { useLoaderData, useNavigate, useFetcher } from "react-router";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  // Cargar todos los niveles de la tienda actual
  const tiers = await prisma.customerTier.findMany({
    where: {
      shop: session.shop,
    },
    orderBy: {
      priority: "desc", // Ordenar por prioridad (mayor a menor)
    },
  });

  return { tiers };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const action = formData.get("action");
  const tierId = formData.get("tierId");

  if (action === "delete" && tierId) {
    // Eliminar el nivel
    await prisma.customerTier.delete({
      where: {
        id: tierId as string,
      },
    });

    return { success: true, message: "Nivel eliminado correctamente" };
  }

  return { success: false, message: "Acción no válida" };
};

export default function TiersIndex() {
  const { tiers } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const fetcher = useFetcher();

  const handleDelete = (tierId: string, tierName: string) => {
    if (confirm(`¿Estás seguro de que quieres eliminar el nivel "${tierName}"?`)) {
      const formData = new FormData();
      formData.append("action", "delete");
      formData.append("tierId", tierId);
      fetcher.submit(formData, { method: "POST" });
    }
  };

  return (
    <s-page heading="Niveles de Clientes">
      <s-button
        slot="primary-action"
        onClick={() => navigate("/app/tiers/new")}
        variant="primary"
      >
        Crear Nivel
      </s-button>

      <s-section>
        {tiers.length === 0 ? (
          <s-section>
            <s-paragraph>
              No hay niveles creados aún. Crea tu primer nivel para comenzar a organizar tus clientes.
            </s-paragraph>
          </s-section>
        ) : (
          <s-stack direction="block" gap="base">
            {tiers.map((tier) => (
              <s-box
                key={tier.id}
                padding="base"
                borderWidth="base"
                borderRadius="base"
                background="subdued"
              >
                <s-stack direction="block" gap="tight">
                  <s-stack direction="inline" gap="base">
                    <s-heading>{tier.name}</s-heading>
                    <s-badge status={tier.active ? "success" : "subdued"}>
                      {tier.active ? "Activo" : "Inactivo"}
                    </s-badge>
                  </s-stack>

                  {tier.description && (
                    <s-paragraph>{tier.description}</s-paragraph>
                  )}

                  <s-stack direction="inline" gap="base">
                    <s-text>
                      Gasto mínimo: <strong>${tier.minSpent}</strong>
                    </s-text>
                    <s-text>
                      Pedidos mínimos: <strong>{tier.minOrders}</strong>
                    </s-text>
                    <s-text>
                      Descuento: <strong>{tier.discountPercentage}%</strong>
                    </s-text>
                    <s-text>
                      Prioridad: <strong>{tier.priority}</strong>
                    </s-text>
                  </s-stack>

                  <s-stack direction="inline" gap="tight">
                    <s-button
                      onClick={() => navigate(`/app/tiers/${tier.id}`)}
                      variant="secondary"
                    >
                      Editar
                    </s-button>
                    <s-button
                      onClick={() => handleDelete(tier.id, tier.name)}
                      variant="tertiary"
                      tone="critical"
                    >
                      Eliminar
                    </s-button>
                  </s-stack>
                </s-stack>
              </s-box>
            ))}
          </s-stack>
        )}
      </s-section>

      <s-section slot="aside" heading="Sobre los niveles">
        <s-paragraph>
          Los niveles de clientes te permiten organizar a tus clientes según su comportamiento de compra.
        </s-paragraph>
        <s-unordered-list>
          <s-list-item>
            Define criterios como gasto mínimo y número de pedidos
          </s-list-item>
          <s-list-item>
            Asigna descuentos automáticos por nivel
          </s-list-item>
          <s-list-item>
            La prioridad determina qué nivel se asigna si un cliente cumple múltiples criterios
          </s-list-item>
        </s-unordered-list>
      </s-section>
    </s-page>
  );
}
