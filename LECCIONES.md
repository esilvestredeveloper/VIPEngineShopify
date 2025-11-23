# 📚 Guía de Aprendizaje: App de Niveles VIP para Shopify

> Documento de referencia con todas las lecciones del proyecto VIP Engine

---

## 📑 Índice

1. [Introducción al Proyecto](#introducción-al-proyecto)
2. [Arquitectura de Apps de Shopify](#arquitectura-de-apps-de-shopify)
3. [Tecnologías Utilizadas](#tecnologías-utilizadas)
4. [Lecciones Completadas](#lecciones-completadas)
5. [Lecciones Pendientes](#lecciones-pendientes)
6. [Conceptos Clave](#conceptos-clave)
7. [Recursos Útiles](#recursos-útiles)

---

## 🎯 Introducción al Proyecto

### ¿Qué estamos construyendo?

Una **aplicación de gestión de niveles de clientes** para Shopify que permite:

- Definir varios niveles de cliente (Básico, Premium, VIP)
- Asignar niveles automáticamente según criterios (gasto acumulado, número de pedidos)
- Aplicar beneficios automáticos (descuentos, envío gratis, productos exclusivos)
- Monitorear estadísticas de clientes por nivel

### ¿Por qué es útil?

- **Para comerciantes:** Fidelizar clientes y aumentar ventas
- **Para ti:** Aprender desarrollo de apps Shopify con tecnologías modernas
- **Comercialmente viable:** La fidelización es tendencia clave en Shopify App Store

---

## 🏗️ Arquitectura de Apps de Shopify

### Las 3 Capas de una App Embebida

```
┌─────────────────────────────────────────┐
│  1. FRONTEND (React/Polaris)            │
│  - Lo que el comerciante VE             │
│  - Interfaz embebida en Shopify Admin   │
│  - Componentes de diseño (Polaris)      │
└─────────────────────────────────────────┘
           ↕️ Comunicación
┌─────────────────────────────────────────┐
│  2. BACKEND (Node.js + Remix)           │
│  - Procesa peticiones                   │
│  - Se comunica con Shopify API          │
│  - Gestiona base de datos               │
│  - Maneja webhooks                      │
└─────────────────────────────────────────┘
           ↕️ API GraphQL
┌─────────────────────────────────────────┐
│  3. SHOPIFY PLATFORM                    │
│  - Datos de la tienda                   │
│  - Productos, clientes, pedidos         │
│  - Sistema de autenticación OAuth       │
└─────────────────────────────────────────┘
```

### Flujo de una App Embebida

1. El comerciante abre la app desde el Admin de Shopify
2. Shopify carga tu app en un iframe
3. Tu app se autentica con OAuth
4. El comerciante interactúa con tu interfaz
5. Tu backend procesa acciones y se comunica con Shopify API
6. Los cambios se reflejan en la tienda

---

## 🛠️ Tecnologías Utilizadas

### Framework y Librerías

| Tecnología | Propósito | ¿Qué hace? |
|------------|-----------|------------|
| **Remix** | Framework web | Gestiona rutas, renderizado, y comunicación cliente-servidor |
| **React** | Interfaz de usuario | Crea componentes interactivos |
| **TypeScript** | Lenguaje | JavaScript con tipos para mayor seguridad |
| **Prisma** | ORM (Object-Relational Mapping) | Facilita comunicación con base de datos |
| **SQLite** | Base de datos | Almacena datos (desarrollo) |
| **GraphQL** | Lenguaje de consultas | Comunica con Shopify API |
| **Polaris** | Sistema de diseño | Componentes de interfaz de Shopify |
| **Shopify CLI** | Herramienta de desarrollo | Crea, prueba y despliega apps |

### Estructura de Archivos del Proyecto

```
VIPEngineShopify/
├── app/
│   ├── routes/                    # Páginas de la app
│   │   ├── app._index.tsx         # Página principal
│   │   ├── app.additional.tsx     # Página adicional (ejemplo)
│   │   ├── auth.$.tsx             # Autenticación
│   │   └── webhooks.*.tsx         # Endpoints para webhooks
│   ├── shopify.server.ts          # Configuración de Shopify
│   ├── db.server.ts               # Conexión a base de datos
│   └── root.tsx                   # Componente raíz
├── prisma/
│   ├── schema.prisma              # Modelos de base de datos
│   ├── migrations/                # Historial de migraciones
│   └── dev.sqlite                 # Archivo de base de datos (no subir a Git)
├── extensions/                    # Extensiones de temas (futuro)
├── public/                        # Archivos estáticos
├── package.json                   # Dependencias
├── shopify.web.toml               # Configuración de la app
└── README.md                      # Documentación del proyecto
```

---

## ✅ Lecciones Completadas

### LECCIÓN 1: ¿Qué es una App de Shopify?

**Concepto:** Una app de Shopify es una aplicación web que se integra con la plataforma Shopify.

**Tipos de apps:**
- **Apps embebidas:** Se ejecutan dentro del Admin de Shopify (iframe)
- **Apps públicas:** Cualquier tienda puede instalarlas desde el App Store
- **Apps personalizadas:** Solo para una tienda específica

**Tu app es embebida y pública** (potencialmente para App Store).

---

### LECCIÓN 2: Autenticación con OAuth

**¿Qué es OAuth?**
- Sistema de autenticación seguro
- Permite que tu app acceda a datos de Shopify sin guardar contraseñas
- El comerciante autoriza permisos (scopes)

**Flujo de OAuth:**
1. Usuario hace clic en "Instalar app"
2. Shopify redirige al usuario para autorizar permisos
3. Shopify devuelve un token de acceso
4. Tu app usa ese token para hacer peticiones a la API

**Archivo clave:** `app/shopify.server.ts`

```typescript
const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: process.env.SCOPES?.split(","),
  // ... más configuración
});
```

---

### LECCIÓN 3: Remix - Sistema de Rutas

**¿Qué es Remix?**
- Framework moderno de React
- Cada archivo en `app/routes/` es una ruta automática

**Sistema de archivos = Sistema de rutas:**

| Archivo | URL | Propósito |
|---------|-----|-----------|
| `app._index.tsx` | `/app` | Página principal |
| `app.additional.tsx` | `/app/additional` | Página adicional |
| `app.tiers.tsx` | `/app/tiers` | Lista de niveles (crearemos) |

**Anatomía de una ruta en Remix:**

```typescript
// 1. LOADER - Se ejecuta en el servidor ANTES de renderizar
export const loader = async ({ request }) => {
  await authenticate.admin(request);
  const data = await prisma.customerTier.findMany();
  return json(data);
};

// 2. ACTION - Se ejecuta cuando el usuario envía un formulario
export const action = async ({ request }) => {
  const formData = await request.formData();
  // Procesar datos...
  return json({ success: true });
};

// 3. COMPONENT - La interfaz que ve el usuario
export default function MiPagina() {
  const data = useLoaderData<typeof loader>();
  return <div>{/* Tu interfaz */}</div>;
}
```

---

### LECCIÓN 4: GraphQL - Comunicación con Shopify

**¿Qué es GraphQL?**
- Lenguaje de consultas para APIs
- Pides exactamente los datos que necesitas
- Más eficiente que REST

**Ejemplo de Mutation (crear producto):**

```graphql
mutation CrearProducto($producto: ProductCreateInput!) {
  productCreate(product: $producto) {
    product {
      id
      title
      handle
    }
  }
}
```

**Ejemplo de Query (obtener clientes):**

```graphql
query ObtenerClientes {
  customers(first: 10) {
    edges {
      node {
        id
        displayName
        email
      }
    }
  }
}
```

**Cómo usar en tu código:**

```typescript
const { admin } = await authenticate.admin(request);

const response = await admin.graphql(`
  query {
    customers(first: 10) {
      edges {
        node {
          id
          displayName
        }
      }
    }
  }
`);

const data = await response.json();
```

---

### LECCIÓN 5: Prisma - ORM para Base de Datos

**¿Qué es Prisma?**
- Traductor entre tu código TypeScript y la base de datos
- No necesitas escribir SQL
- Type-safe: TypeScript sabe qué campos existen

**Sin Prisma (SQL directo):**
```sql
SELECT * FROM customers WHERE level = 'VIP';
```

**Con Prisma (TypeScript):**
```typescript
await prisma.customer.findMany({
  where: { level: 'VIP' }
});
```

**Schema de Prisma:**

```prisma
model CustomerTier {
  id      String   @id @default(uuid())
  name    String
  minSpent Float   @default(0)
  active  Boolean  @default(true)
}
```

**Operaciones comunes:**

```typescript
// Crear
await prisma.customerTier.create({
  data: { name: "VIP", minSpent: 1000 }
});

// Buscar todos
const tiers = await prisma.customerTier.findMany();

// Buscar uno
const tier = await prisma.customerTier.findUnique({
  where: { id: "123" }
});

// Actualizar
await prisma.customerTier.update({
  where: { id: "123" },
  data: { minSpent: 2000 }
});

// Eliminar
await prisma.customerTier.delete({
  where: { id: "123" }
});
```

---

### LECCIÓN 6: Migraciones de Base de Datos

**¿Qué es una migración?**
- Un "manual de instrucciones" para modificar la base de datos
- Historial versionado de cambios
- Se pueden aplicar o revertir

**Comandos de Prisma:**

```bash
# Crear nueva migración y aplicarla
npx prisma migrate dev --name nombre_descriptivo

# Aplicar migraciones pendientes (producción)
npx prisma migrate deploy

# Generar Prisma Client (después de cambios en schema)
npx prisma generate

# Abrir interfaz visual de la base de datos
npx prisma studio
```

**Flujo de trabajo:**
1. Modificas `schema.prisma`
2. Ejecutas `npx prisma migrate dev`
3. Prisma genera SQL automáticamente
4. Se aplica a la base de datos
5. Se regenera Prisma Client

---

### LECCIÓN 7: Modelo de Datos de VIP Engine

**Tablas creadas:**

#### 1. CustomerTier (Niveles)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | String (UUID) | Identificador único |
| `shop` | String | Dominio de la tienda |
| `name` | String | Nombre del nivel (VIP, Premium) |
| `description` | String (opcional) | Descripción |
| `minSpent` | Float | Gasto mínimo requerido |
| `minOrders` | Int | Número mínimo de pedidos |
| `discountPercentage` | Float | % de descuento |
| `active` | Boolean | Si está activo |
| `priority` | Int | Prioridad (mayor = más alto) |
| `createdAt` | DateTime | Fecha de creación |
| `updatedAt` | DateTime | Última actualización |

#### 2. CustomerTierAssignment (Asignaciones)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | String (UUID) | Identificador único |
| `shop` | String | Dominio de la tienda |
| `customerId` | String | ID del cliente en Shopify |
| `tierId` | String | ID del nivel asignado |
| `assignedAt` | DateTime | Fecha de asignación |

**Relaciones:**
- Un `CustomerTier` puede tener muchas `CustomerTierAssignment`
- Cada `CustomerTierAssignment` pertenece a un `CustomerTier`
- Un cliente solo puede tener un nivel por tienda (unique constraint)

---

### LECCIÓN 8: Polaris - Sistema de Diseño de Shopify

**¿Qué es Polaris?**
- Sistema de diseño oficial de Shopify
- Componentes pre-construidos
- Tu app se ve nativa en Shopify Admin

**Componentes web usados:**

```tsx
<s-page heading="Título de la página">
  <s-button variant="primary" onClick={handleClick}>
    Guardar
  </s-button>

  <s-section heading="Sección">
    <s-paragraph>Texto explicativo</s-paragraph>
  </s-section>

  <s-card>
    <s-stack direction="block" gap="base">
      <s-text>Contenido</s-text>
    </s-stack>
  </s-card>
</s-page>
```

**Ventajas:**
- Diseño consistente con Shopify
- Accesible (A11Y)
- Responsive (móvil/desktop)
- Actualizaciones automáticas

---

## 🔜 Lecciones Pendientes

### LECCIÓN 9: Crear Páginas con Remix (Próxima)

- Crear ruta para lista de niveles
- Usar loader para cargar datos
- Renderizar tabla con Polaris
- Agregar botón para crear nivel

### LECCIÓN 10: Formularios en Remix

- Crear formulario para nuevo nivel
- Validación de datos
- Usar action para guardar
- Feedback al usuario (toast)

### LECCIÓN 11: Webhooks de Shopify

- Qué son los webhooks
- Configurar `orders/create`
- Procesar pedidos automáticamente
- Actualizar nivel de cliente

### LECCIÓN 12: Lógica de Asignación Automática

- Calcular gasto total del cliente
- Determinar nivel según criterios
- Actualizar asignación en DB
- Sincronizar con Shopify (tags/metafields)

### LECCIÓN 13: API de Descuentos de Shopify

- Crear descuentos automáticos
- Aplicar por nivel de cliente
- Gestionar reglas de descuento
- Validar y probar descuentos

### LECCIÓN 14: Dashboard de Estadísticas

- Agregar datos por nivel
- Crear gráficos
- Mostrar métricas clave
- Exportar reportes

### LECCIÓN 15: Extensiones de Tema

- Mostrar badge de nivel al cliente
- App blocks en Shopify 2.0
- Liquid + JavaScript
- Personalización visual

### LECCIÓN 16: Testing y Depuración

- Pruebas unitarias
- Pruebas de integración
- Depurar con DevTools
- Logs y monitoreo

### LECCIÓN 17: Despliegue y Producción

- Cambiar de SQLite a PostgreSQL
- Variables de entorno
- Desplegar en hosting (Fly.io, Heroku)
- Monitoreo de producción

### LECCIÓN 18: Publicación en App Store

- Revisar requisitos de Shopify
- Preparar documentación
- Screenshots y videos
- Proceso de revisión

---

## 💡 Conceptos Clave

### Glosario de Términos

**App Bridge**
- Librería JavaScript de Shopify
- Permite comunicación entre tu app embebida y Shopify Admin
- Funciones: navegación, modales, toast messages

**Scopes**
- Permisos que solicita tu app
- Ejemplos: `read_customers`, `write_products`, `read_orders`
- El comerciante debe aprobarlos

**Session Storage**
- Almacena tokens de autenticación
- En tu caso: Prisma Session Storage (tabla `Session`)

**GraphQL Admin API**
- API principal de Shopify
- Versiones (estás usando: October25)
- Documentación: https://shopify.dev/docs/api/admin-graphql

**Metafields**
- Campos personalizados en objetos de Shopify
- Puedes guardar datos extra en productos, clientes, pedidos
- Útil para marcar nivel de cliente

**Tags**
- Etiquetas en objetos de Shopify
- Más simple que metafields
- Ejemplo: agregar tag "VIP" al cliente

**Webhooks**
- Notificaciones de eventos en Shopify
- Tu app recibe POST cuando ocurre algo
- Ejemplos: `orders/create`, `customers/update`

---

## 📖 Recursos Útiles

### Documentación Oficial

- **Shopify App Development:** https://shopify.dev/docs/apps
- **GraphQL Admin API:** https://shopify.dev/docs/api/admin-graphql
- **Polaris Design System:** https://polaris.shopify.com/
- **Remix Framework:** https://remix.run/docs
- **Prisma ORM:** https://www.prisma.io/docs

### Herramientas

- **GraphiQL Admin API Explorer:** https://shopify.dev/docs/apps/tools/graphiql-admin-api
- **Shopify CLI Docs:** https://shopify.dev/docs/apps/tools/cli
- **Polaris Components:** https://polaris.shopify.com/components

### Comunidad

- **Shopify Community Forums:** https://community.shopify.com/
- **Shopify Partners Discord:** https://discord.gg/shopifypartners
- **GitHub Discussions:** https://github.com/Shopify/shopify-app-template-remix

---

## 🎯 Próximos Pasos

1. ✅ Configurar Git y GitHub
2. 🔄 Crear página de lista de niveles
3. 🔄 Implementar CRUD de niveles
4. 🔄 Configurar webhooks
5. 🔄 Implementar lógica de asignación
6. 🔄 Integrar descuentos
7. 🔄 Crear dashboard

---

## 📝 Notas de Desarrollo

### Comandos Útiles

```bash
# Iniciar servidor de desarrollo
npm run dev

# Ver base de datos visualmente
npx prisma studio

# Crear migración
npx prisma migrate dev --name nombre_descriptivo

# Generar tipos de GraphQL
npm run graphql-codegen

# Verificar tipos de TypeScript
npm run typecheck

# Lint del código
npm run lint
```

### Variables de Entorno Importantes

```env
SHOPIFY_API_KEY=tu_api_key
SHOPIFY_API_SECRET=tu_api_secret
SCOPES=read_products,write_customers,read_orders
SHOPIFY_APP_URL=https://tu-app.com
```

---

**Última actualización:** 2025-11-23
**Versión:** 1.0
**Autor:** Emilio (con guía de Claude Code)
