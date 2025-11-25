import type {
  HeadersFunction,
  LoaderFunctionArgs,
} from "react-router";
import { useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";
import prisma from "../db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  // Obtener estadísticas básicas
  const totalTiers = await prisma.customerTier.count({
    where: { shop: session.shop },
  });

  const activeTiers = await prisma.customerTier.count({
    where: {
      shop: session.shop,
      active: true
    },
  });

  const totalAssignments = await prisma.customerTierAssignment.count({
    where: { shop: session.shop },
  });

  return {
    totalTiers,
    activeTiers,
    totalAssignments,
  };
};

export default function Index() {
  const { totalTiers, activeTiers, totalAssignments } = useLoaderData<typeof loader>();

  return (
    <s-page heading="VIP Engine - Panel de Control">
      <s-section heading="Bienvenido a VIP Engine 🎉">
        <s-paragraph>
          Sistema de gestión de niveles de clientes VIP para tu tienda Shopify.
          Crea niveles personalizados, asigna clientes y ofrece beneficios exclusivos.
        </s-paragraph>
      </s-section>

      <s-section heading="Resumen">
        <s-stack direction="block" gap="base">
          <s-box
            padding="base"
            borderWidth="base"
            borderRadius="base"
          >
            <s-stack direction="block" gap="small">
              <s-text variant="headingMd" as="h3">
                Niveles de Clientes
              </s-text>
              <s-stack direction="inline" gap="base" alignment="center">
                <s-text variant="headingLg" as="p">
                  {totalTiers}
                </s-text>
                <s-text variant="bodyMd" as="span" tone="subdued">
                  niveles creados ({activeTiers} activos)
                </s-text>
              </s-stack>
            </s-stack>
          </s-box>

          <s-box
            padding="base"
            borderWidth="base"
            borderRadius="base"
          >
            <s-stack direction="block" gap="small">
              <s-text variant="headingMd" as="h3">
                Clientes Asignados
              </s-text>
              <s-stack direction="inline" gap="base" alignment="center">
                <s-text variant="headingLg" as="p">
                  {totalAssignments}
                </s-text>
                <s-text variant="bodyMd" as="span" tone="subdued">
                  clientes con nivel asignado
                </s-text>
              </s-stack>
            </s-stack>
          </s-box>
        </s-stack>
      </s-section>

      <s-section heading="Acciones Rápidas">
        <s-stack direction="block" gap="base">
          <s-box
            padding="base"
            borderWidth="base"
            borderRadius="base"
          >
            <s-stack direction="block" gap="small">
              <s-text variant="headingMd" as="h3">
                Gestionar Niveles
              </s-text>
              <s-paragraph>
                Crea, edita o elimina niveles de clientes VIP.
              </s-paragraph>
              <s-button href="/app/tiers">
                Ver niveles
              </s-button>
            </s-stack>
          </s-box>

          <s-box
            padding="base"
            borderWidth="base"
            borderRadius="base"
          >
            <s-stack direction="block" gap="small">
              <s-text variant="headingMd" as="h3">
                Asignar Clientes
              </s-text>
              <s-paragraph>
                Asigna manualmente niveles a tus clientes.
              </s-paragraph>
              <s-button disabled>
                Próximamente
              </s-button>
            </s-stack>
          </s-box>
        </s-stack>
      </s-section>

      <s-section slot="aside" heading="Próximos Pasos">
        <s-unordered-list>
          <s-list-item>
            {totalTiers === 0 ? (
              <>
                <s-link href="/app/tiers/new">
                  Crea tu primer nivel de cliente
                </s-link>
              </>
            ) : (
              <>Asigna niveles a tus clientes</>
            )}
          </s-list-item>
          <s-list-item>
            Configura descuentos automáticos
          </s-list-item>
          <s-list-item>
            Monitorea estadísticas de tus clientes VIP
          </s-list-item>
        </s-unordered-list>
      </s-section>

      <s-section slot="aside" heading="Recursos">
        <s-unordered-list>
          <s-list-item>
            <s-link
              href="https://shopify.dev/docs/api/admin-graphql"
              target="_blank"
            >
              Documentación de Shopify GraphQL
            </s-link>
          </s-list-item>
          <s-list-item>
            <s-link
              href="https://polaris.shopify.com/"
              target="_blank"
            >
              Polaris Design System
            </s-link>
          </s-list-item>
        </s-unordered-list>
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};