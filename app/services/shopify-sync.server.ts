import type { AdminApiContext } from "@shopify/shopify-app-remix/server";
import prisma from "../db.server";

/**
 * Servicio para sincronizar datos entre nuestra app y Shopify
 * Usa tags de clientes para marcar el nivel asignado
 */

const TIER_TAG_PREFIX = "tier:";

/**
 * Sincroniza el nivel de un cliente con sus tags en Shopify
 */
export async function syncCustomerTierToShopify(
  admin: AdminApiContext,
  customerId: string,
  shop: string
): Promise<{ success: boolean; message: string }> {
  try {
    // 1. Obtener la asignación actual del cliente
    const assignment = await prisma.customerTierAssignment.findFirst({
      where: {
        shop,
        customerId,
      },
      include: {
        tier: true,
      },
    });

    // 2. Obtener tags actuales del cliente
    const customerResponse = await admin.graphql(
      `#graphql
        query getCustomer($id: ID!) {
          customer(id: $id) {
            id
            tags
          }
        }
      `,
      {
        variables: { id: customerId },
      }
    );

    const customerData = await customerResponse.json();
    const currentTags = customerData.data?.customer?.tags || [];

    // 3. Filtrar tags existentes (remover tags de tier antiguos)
    const tagsWithoutTier = currentTags.filter(
      (tag: string) => !tag.startsWith(TIER_TAG_PREFIX)
    );

    // 4. Agregar nuevo tag de tier si existe asignación
    let newTags = [...tagsWithoutTier];
    if (assignment && assignment.tier) {
      const tierTag = `${TIER_TAG_PREFIX}${assignment.tier.name.toLowerCase().replace(/\s+/g, "-")}`;
      newTags.push(tierTag);
    }

    // 5. Actualizar tags del cliente en Shopify
    const updateResponse = await admin.graphql(
      `#graphql
        mutation updateCustomerTags($input: CustomerInput!) {
          customerUpdate(input: $input) {
            customer {
              id
              tags
            }
            userErrors {
              field
              message
            }
          }
        }
      `,
      {
        variables: {
          input: {
            id: customerId,
            tags: newTags,
          },
        },
      }
    );

    const updateData = await updateResponse.json();
    const userErrors = updateData.data?.customerUpdate?.userErrors || [];

    if (userErrors.length > 0) {
      console.error(`[ShopifySync] Errors updating customer ${customerId}:`, userErrors);
      return {
        success: false,
        message: `Failed to update tags: ${userErrors.map((e: any) => e.message).join(", ")}`,
      };
    }

    const tierName = assignment?.tier?.name || "None";
    console.log(`[ShopifySync] Updated customer ${customerId} with tier: ${tierName}`);

    return {
      success: true,
      message: `Successfully synced tier "${tierName}" to Shopify`,
    };
  } catch (error) {
    console.error(`[ShopifySync] Error syncing customer ${customerId}:`, error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Sincroniza TODOS los clientes con asignaciones a Shopify
 * Útil para sincronización inicial o después de cambios masivos
 */
export async function syncAllCustomersToShopify(
  admin: AdminApiContext,
  shop: string
): Promise<{
  synced: number;
  errors: number;
}> {
  let synced = 0;
  let errors = 0;

  // Obtener todas las asignaciones de la tienda
  const assignments = await prisma.customerTierAssignment.findMany({
    where: { shop },
    include: { tier: true },
  });

  console.log(`[ShopifySync] Starting sync for ${assignments.length} customers`);

  for (const assignment of assignments) {
    const result = await syncCustomerTierToShopify(admin, assignment.customerId, shop);
    if (result.success) {
      synced++;
    } else {
      errors++;
    }
  }

  console.log(`[ShopifySync] Sync complete: ${synced} synced, ${errors} errors`);

  return { synced, errors };
}

/**
 * Obtiene el nombre del tag de tier para un nivel específico
 */
export function getTierTagName(tierName: string): string {
  return `${TIER_TAG_PREFIX}${tierName.toLowerCase().replace(/\s+/g, "-")}`;
}

/**
 * Extrae el nombre del tier desde un tag
 */
export function parseTierFromTag(tag: string): string | null {
  if (!tag.startsWith(TIER_TAG_PREFIX)) {
    return null;
  }
  return tag.substring(TIER_TAG_PREFIX.length);
}