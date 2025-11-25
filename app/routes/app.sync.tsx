import { useEffect, useState } from "react";
import type {
  ActionFunctionArgs,
  HeadersFunction,
  LoaderFunctionArgs,
} from "react-router";
import { Form, useActionData, useLoaderData, useNavigation } from "react-router";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { recalculateAllTiers } from "../services/tier-assignment.server";
import { syncAllCustomersToShopify } from "../services/shopify-sync.server";
import { useAppBridge } from "@shopify/app-bridge-react";
import prisma from "../db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  // Obtener estadísticas
  const totalTiers = await prisma.customerTier.count({
    where: { shop: session.shop, active: true },
  });

  const totalAssignments = await prisma.customerTierAssignment.count({
    where: { shop: session.shop },
  });

  return {
    totalTiers,
    totalAssignments,
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session, admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const action = formData.get("action");

  if (action === "recalculate") {
    try {
      const result = await recalculateAllTiers(admin, session.shop);
      return {
        success: true,
        type: "recalculate",
        message: `Recalculación completada: ${result.processed} clientes procesados, ${result.updated} actualizados`,
        data: result,
      };
    } catch (error) {
      console.error("Error recalculando niveles:", error);
      return {
        success: false,
        type: "recalculate",
        message: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  if (action === "sync") {
    try {
      const result = await syncAllCustomersToShopify(admin, session.shop);
      return {
        success: true,
        type: "sync",
        message: `Sincronización completada: ${result.synced} clientes sincronizados`,
        data: result,
      };
    } catch (error) {
      console.error("Error sincronizando con Shopify:", error);
      return {
        success: false,
        type: "sync",
        message: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  return { success: false, message: "Acción no válida" };
};

export default function SyncPage() {
  const { totalTiers, totalAssignments } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const shopify = useAppBridge();

  const isRecalculating =
    navigation.state === "submitting" &&
    navigation.formData?.get("action") === "recalculate";

  const isSyncing =
    navigation.state === "submitting" &&
    navigation.formData?.get("action") === "sync";

  useEffect(() => {
    if (actionData?.success) {
      shopify.toast.show(actionData.message || "Operación exitosa");
    }
  }, [actionData, shopify]);

  return (
    <s-page
      heading="Sincronización y Webhooks"
      backAction={{ content: "Regresar", url: "/app" }}
    >
      {/* Estado del sistema */}
      <s-section heading="Estado del Sistema">
        <s-stack direction="block" gap="base">
          <s-box padding="base" borderWidth="base" borderRadius="base">
            <s-stack direction="block" gap="small">
              <s-text variant="headingMd" as="h3">
                Niveles Activos
              </s-text>
              <s-text variant="headingLg" as="p">
                {totalTiers}
              </s-text>
              <s-text variant="bodySm" tone="subdued">
                niveles configurados y activos
              </s-text>
            </s-stack>
          </s-box>

          <s-box padding="base" borderWidth="base" borderRadius="base">
            <s-stack direction="block" gap="small">
              <s-text variant="headingMd" as="h3">
                Clientes con Nivel
              </s-text>
              <s-text variant="headingLg" as="p">
                {totalAssignments}
              </s-text>
              <s-text variant="bodySm" tone="subdued">
                clientes tienen un nivel asignado
              </s-text>
            </s-stack>
          </s-box>
        </s-stack>
      </s-section>

      {/* Webhooks */}
      <s-section heading="Webhooks">
        <s-stack direction="block" gap="base">
          <s-paragraph>
            Los webhooks se registran automáticamente cuando instalas la app. El webhook{" "}
            <code>orders/create</code> está configurado y se ejecutará cada vez que se
            cree un pedido nuevo.
          </s-paragraph>

          <s-box padding="base" borderWidth="base" borderRadius="base">
            <s-stack direction="block" gap="small">
              <s-stack direction="inline" gap="base" alignment="center">
                <s-text variant="bodyMd" as="span">
                  ✅
                </s-text>
                <s-stack direction="block" gap="none">
                  <s-text variant="bodyMd" as="p">
                    <strong>orders/create</strong>
                  </s-text>
                  <s-text variant="bodySm" tone="subdued">
                    Asigna niveles automáticamente cuando se crea un pedido
                  </s-text>
                </s-stack>
              </s-stack>
            </s-stack>
          </s-box>
        </s-stack>
      </s-section>

      {/* Resultados de acciones */}
      {actionData && !actionData.success && (
        <s-section>
          <s-banner tone="critical">
            <s-paragraph>{actionData.message}</s-paragraph>
          </s-banner>
        </s-section>
      )}

      {actionData && actionData.success && actionData.data && (
        <s-section heading="Resultados de la Última Operación">
          <s-box padding="base" borderWidth="base" borderRadius="base">
            <s-stack direction="block" gap="base">
              {actionData.type === "recalculate" && (
                <>
                  <s-text variant="bodyMd" as="p">
                    <strong>Recalculación Completada:</strong>
                  </s-text>
                  <s-stack direction="block" gap="small">
                    <s-text variant="bodySm">
                      • Clientes procesados: {(actionData.data as any).processed}
                    </s-text>
                    <s-text variant="bodySm">
                      • Clientes actualizados: {(actionData.data as any).updated}
                    </s-text>
                    <s-text variant="bodySm">
                      • Errores: {(actionData.data as any).errors}
                    </s-text>
                  </s-stack>
                </>
              )}

              {actionData.type === "sync" && (
                <>
                  <s-text variant="bodyMd" as="p">
                    <strong>Sincronización Completada:</strong>
                  </s-text>
                  <s-stack direction="block" gap="small">
                    <s-text variant="bodySm">
                      • Clientes sincronizados: {(actionData.data as any).synced}
                    </s-text>
                    <s-text variant="bodySm">
                      • Errores: {(actionData.data as any).errors}
                    </s-text>
                  </s-stack>
                </>
              )}
            </s-stack>
          </s-box>
        </s-section>
      )}

      {/* Acciones manuales */}
      <s-section heading="Acciones Manuales">
        <s-stack direction="block" gap="base">
          {/* Recalcular niveles */}
          <s-box padding="base" borderWidth="base" borderRadius="base">
            <s-stack direction="block" gap="base">
              <s-stack direction="block" gap="small">
                <s-text variant="headingMd" as="h3">
                  Recalcular Niveles
                </s-text>
                <s-paragraph>
                  Recalcula los niveles de TODOS los clientes basándose en su historial
                  de compras. Útil después de crear o modificar niveles.
                </s-paragraph>
              </s-stack>
              <Form method="post">
                <input type="hidden" name="action" value="recalculate" />
                <s-button
                  submit
                  variant="primary"
                  {...(isRecalculating ? { loading: true } : {})}
                >
                  {isRecalculating ? "Recalculando..." : "Recalcular Todos los Niveles"}
                </s-button>
              </Form>
            </s-stack>
          </s-box>

          {/* Sincronizar con Shopify */}
          <s-box padding="base" borderWidth="base" borderRadius="base">
            <s-stack direction="block" gap="base">
              <s-stack direction="block" gap="small">
                <s-text variant="headingMd" as="h3">
                  Sincronizar con Shopify
                </s-text>
                <s-paragraph>
                  Sincroniza los niveles asignados con Shopify agregando tags a los
                  clientes (ejemplo: <code>tier:vip</code>, <code>tier:premium</code>
                  ). Los tags pueden usarse para crear segmentos y descuentos.
                </s-paragraph>
              </s-stack>
              <Form method="post">
                <input type="hidden" name="action" value="sync" />
                <s-button
                  submit
                  variant="secondary"
                  {...(isSyncing ? { loading: true } : {})}
                >
                  {isSyncing ? "Sincronizando..." : "Sincronizar con Shopify"}
                </s-button>
              </Form>
            </s-stack>
          </s-box>
        </s-stack>
      </s-section>

      {/* Información adicional */}
      <s-section slot="aside" heading="¿Cómo funciona?">
        <s-unordered-list>
          <s-list-item>
            El webhook <code>orders/create</code> se ejecuta automáticamente cada vez que
            hay un pedido nuevo
          </s-list-item>
          <s-list-item>
            Se calcula el gasto total y número de pedidos del cliente
          </s-list-item>
          <s-list-item>
            Se asigna el nivel más alto que cumpla los requisitos
          </s-list-item>
          <s-list-item>
            Se sincroniza el nivel con Shopify usando tags
          </s-list-item>
        </s-unordered-list>
      </s-section>

      <s-section slot="aside" heading="Notas Importantes">
        <s-stack direction="block" gap="base">
          <s-paragraph>
            <strong>Recalcular niveles:</strong> Procesa todos los clientes de tu
            tienda. Puede tardar varios minutos si tienes muchos clientes.
          </s-paragraph>
          <s-paragraph>
            <strong>Sincronizar:</strong> Solo sincroniza clientes que ya tienen un
            nivel asignado.
          </s-paragraph>
        </s-stack>
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};