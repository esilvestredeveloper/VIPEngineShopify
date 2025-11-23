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

### LECCIÓN 9: Control de Versiones con Git y GitHub

**¿Qué es Git?**
- Sistema de control de versiones
- Guarda historial completo de cambios
- Permite volver a versiones anteriores
- Esencial en desarrollo profesional

**¿Qué es GitHub?**
- Plataforma en la nube para alojar repositorios Git
- Backup de tu código
- Colaboración con otros desarrolladores
- Portfolio profesional

---

#### Conceptos Básicos de Git

**Repositorio (Repo)**
- Carpeta con historial de cambios
- Contiene todo el código y su historia

**Commit**
- "Foto" del estado del proyecto en un momento
- Incluye mensaje descriptivo
- No se puede modificar (inmutable)

**Branch (Rama)**
- Línea de desarrollo paralela
- `main` = rama principal
- Puedes crear ramas para features

**Remote (Remoto)**
- Repositorio en GitHub (o GitLab, Bitbucket)
- `origin` = nombre típico del remoto principal

---

#### Flujo de Trabajo Básico

```bash
# 1. Inicializar repositorio (solo primera vez)
git init

# 2. Ver estado de archivos
git status

# 3. Agregar archivos al staging area
git add .                    # Todos los archivos
git add archivo.txt          # Archivo específico

# 4. Crear commit
git commit -m "Mensaje descriptivo"

# 5. Conectar con GitHub (solo primera vez)
git remote add origin https://github.com/usuario/repo.git

# 6. Subir cambios a GitHub
git push -u origin main      # Primera vez
git push                     # Siguientes veces

# 7. Traer cambios desde GitHub
git pull
```

---

#### Convenciones de Mensajes de Commit

**Buenos commits:**
```bash
git commit -m "Añadir modelo CustomerTier a Prisma"
git commit -m "Corregir error en validación de formulario"
git commit -m "Actualizar dependencias de seguridad"
```

**Malos commits:**
```bash
git commit -m "cambios"
git commit -m "fix"
git commit -m "asdf"
```

**Estructura recomendada:**
```
[Tipo]: Descripción breve

Tipo puede ser:
- feat: Nueva funcionalidad
- fix: Corrección de bug
- docs: Documentación
- style: Formato (sin cambios de código)
- refactor: Refactorización
- test: Tests
- chore: Tareas de mantenimiento
```

**Idioma de commits:**
- **Español:** Proyectos personales, equipos hispanohablantes
- **Inglés:** Proyectos open source, portfolio internacional

---

#### Autenticación con GitHub

**⚠️ IMPORTANTE:** GitHub NO acepta contraseñas desde 2021.

**Opciones de autenticación:**

1. **Personal Access Token (PAT)** - Más común
2. **SSH Keys** - Más seguro
3. **GitHub CLI** - Más moderno

---

#### Personal Access Tokens (PAT)

**Tipos de tokens:**

| | **Classic Token** | **Fine-grained Token** |
|---|---|---|
| **Permisos** | Todo o nada | Granular por repo |
| **Alcance** | Todos tus repos | Repos específicos |
| **Configuración** | Simple (2 min) | Compleja (5 min) |
| **Seguridad** | Menor | Mayor |
| **Expiración** | Opcional | Máximo 1 año |
| **Uso** | Desarrollo personal | Producción |

---

#### Crear Classic Token (Recomendado para empezar)

**Paso 1:** Ve a https://github.com/settings/tokens

**Paso 2:** Tokens (classic) → Generate new token (classic)

**Paso 3:** Configurar:
- **Note:** `VIPEngineShopify Development`
- **Expiration:** `90 days` (o lo que prefieras)
- **Scopes:** Marca `repo` ✅

**Paso 4:** Generate token → **COPIA EL TOKEN** (empieza con `ghp_`)

**Paso 5:** Guárdalo de forma segura (no lo compartas)

---

#### Crear Fine-grained Token (Más seguro)

**Paso 1:** Ve a https://github.com/settings/personal-access-tokens

**Paso 2:** Fine-grained tokens → Generate new token

**Paso 3:** Configurar:
- **Token name:** `VIPEngineShopify`
- **Expiration:** `90 days`
- **Repository access:** Only select repositories
  - Selecciona: `VIPEngineShopify`
- **Permissions:**
  - Contents: `Read and write` ✅
  - Metadata: `Read-only` (automático)

**Paso 4:** Generate token → **COPIA EL TOKEN**

---

#### Usar el Token

Cuando Git pida credenciales:

```
Username: tu-usuario-github
Password: ghp_tu_token_aqui  (NO tu contraseña)
```

**Ejemplo:**
```
Username: esilvestredeveloper
Password: ghp_1234567890abcdefghijklmnopqrstuvwxyz
```

---

#### Evitar Ingresar Credenciales Cada Vez

**OPCIÓN 1: Guardar permanentemente (Más fácil)**

```bash
git config --global credential.helper store
```

**¿Qué hace?**
- Primera vez: ingresas usuario + token
- Git los guarda en `~/.git-credentials`
- Nunca más te los pide

**⚠️ Seguridad:**
- Token guardado en texto plano en disco
- Seguro si tu PC es personal y tiene contraseña

---

**OPCIÓN 2: Cache temporal (Más seguro)**

```bash
git config --global credential.helper cache
git config --global credential.helper 'cache --timeout=3600'
```

**¿Qué hace?**
- Guarda en RAM (no en disco)
- Por 1 hora (3600 segundos)
- Después vuelve a pedir

---

**OPCIÓN 3: SSH Keys (Profesional) ⭐ RECOMENDADO**

No usa tokens, usa claves criptográficas.

**Ventajas:**
- ✅ Nunca pide credenciales
- ✅ Más seguro que tokens
- ✅ Estándar profesional
- ✅ Más rápido (no valida token cada vez)
- ✅ Soporta múltiples cuentas fácilmente

**Configuración básica:**

```bash
# 1. Generar clave SSH (si no tienes una)
ssh-keygen -t ed25519 -C "tu-email@example.com"
# Presiona Enter para usar la ubicación por defecto (~/.ssh/id_ed25519)
# Opcionalmente, ingresa una contraseña para la clave

# 2. Iniciar el agente SSH
eval "$(ssh-agent -s)"

# 3. Agregar la clave al agente
ssh-add ~/.ssh/id_ed25519

# 4. Copiar clave pública
cat ~/.ssh/id_ed25519.pub
# Copia todo el contenido que aparece

# 5. Agregar en GitHub
# Ve a: https://github.com/settings/keys
# Click "New SSH key"
# Title: "Mi PC - VIPEngine"
# Key: Pega la clave pública
# Click "Add SSH key"

# 6. Verificar conexión
ssh -T git@github.com
# Debería decir: "Hi usuario! You've successfully authenticated"

# 7. Cambiar URL del remoto a SSH
git remote set-url origin git@github.com:usuario/repo.git
```

---

#### Manejo de Múltiples Cuentas SSH

**Escenario común:** Tienes varias cuentas de GitHub (personal, trabajo, cliente).

**Método 1: ssh-add manual (Simple pero temporal)**

```bash
# Listar claves cargadas
ssh-add -l

# Cargar clave específica para cuenta personal
ssh-add ~/.ssh/id_ed25519_personal

# Cargar clave para cuenta de trabajo
ssh-add ~/.ssh/id_ed25519_trabajo

# Limpiar todas las claves (útil para cambiar de cuenta)
ssh-add -D

# Cargar la clave que necesitas para el proyecto actual
ssh-add ~/.ssh/id_ed25519_personal
```

**Ventajas:**
- Simple y directo
- Control manual de qué clave usar

**Desventajas:**
- Tienes que cambiar manualmente cada vez
- Las claves se pierden al reiniciar

---

**Método 2: ~/.ssh/config (Automático y persistente) ⭐**

Crea/edita el archivo `~/.ssh/config`:

```ssh
# Cuenta personal
Host github.com-personal
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_personal
  IdentitiesOnly yes

# Cuenta de trabajo
Host github.com-trabajo
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_trabajo
  IdentitiesOnly yes

# Cuenta de cliente
Host github.com-cliente
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_cliente
  IdentitiesOnly yes
```

**Uso en cada proyecto:**

```bash
# Proyecto personal
git remote set-url origin git@github.com-personal:usuario-personal/repo.git

# Proyecto de trabajo
git remote set-url origin git@github.com-trabajo:usuario-trabajo/repo.git

# Proyecto de cliente
git remote set-url origin git@github.com-cliente:usuario-cliente/repo.git
```

**Ventajas:**
- ✅ Automático (Git elige la clave correcta según el host)
- ✅ Persistente (no se pierde al reiniciar)
- ✅ No necesitas ssh-add cada vez
- ✅ Menos errores humanos

---

**Método 3: Incluir en ~/.ssh/config con AddKeysToAgent**

Para que las claves se carguen automáticamente:

```ssh
Host *
  AddKeysToAgent yes
  UseKeychain yes  # Solo en macOS

# Cuenta personal
Host github.com-personal
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_personal
  IdentitiesOnly yes
```

---

**Buenas prácticas con múltiples cuentas:**

1. **Nombres descriptivos para claves:**
   ```bash
   ~/.ssh/id_ed25519_personal
   ~/.ssh/id_ed25519_trabajo
   ~/.ssh/id_ed25519_cliente_acme
   ```

2. **Generar claves separadas:**
   ```bash
   ssh-keygen -t ed25519 -C "personal@email.com" -f ~/.ssh/id_ed25519_personal
   ssh-keygen -t ed25519 -C "trabajo@empresa.com" -f ~/.ssh/id_ed25519_trabajo
   ```

3. **Verificar qué clave se usa:**
   ```bash
   ssh -T git@github.com-personal
   # Hi usuario-personal! You've successfully authenticated

   ssh -T git@github.com-trabajo
   # Hi usuario-trabajo! You've successfully authenticated
   ```

4. **Configurar nombre y email por proyecto:**
   ```bash
   # En proyectos personales
   git config user.name "Tu Nombre"
   git config user.email "personal@email.com"

   # En proyectos de trabajo
   git config user.name "Tu Nombre Profesional"
   git config user.email "trabajo@empresa.com"
   ```

---

**Comandos útiles para depurar SSH:**

```bash
# Ver qué claves están cargadas
ssh-add -l

# Probar conexión con debug
ssh -vT git@github.com

# Ver qué clave se usaría
ssh -T git@github.com-personal

# Limpiar y recargar
ssh-add -D
ssh-add ~/.ssh/id_ed25519_personal
```

---

#### Archivo .gitignore

**¿Qué es?**
Lista de archivos/carpetas que Git debe ignorar.

**¿Por qué?**
- No subir archivos sensibles (`.env`, tokens)
- No subir archivos grandes (`node_modules/`)
- No subir archivos temporales (`.DS_Store`, `*.log`)

**Ejemplo para Shopify + Remix:**

```gitignore
# Dependencias
node_modules/

# Archivos de build
/build
/.cache

# Base de datos local
/prisma/dev.sqlite
/prisma/dev.sqlite-journal

# Variables de entorno (¡NUNCA SUBIR!)
.env
.env.*

# Archivos de Shopify CLI
.shopify/
.shopify.lock

# IDE
.idea/
.vscode/
.cursor/

# Sistema operativo
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
```

**⚠️ CRÍTICO - Nunca subir a Git:**
- Archivos `.env` (contienen secretos)
- Tokens o API keys
- Contraseñas
- Bases de datos de producción
- `node_modules/` (se reinstalan con npm install)

---

#### Comandos Git Esenciales

```bash
# Ver historial de commits
git log
git log --oneline              # Versión compacta
git log --graph --oneline      # Con gráfico

# Ver cambios antes de commit
git diff

# Deshacer cambios (antes de commit)
git restore archivo.txt        # Restaurar archivo
git restore .                  # Restaurar todos

# Deshacer último commit (sin perder cambios)
git reset --soft HEAD~1

# Ver ramas
git branch                     # Listar ramas
git branch nueva-rama          # Crear rama
git checkout nueva-rama        # Cambiar a rama
git checkout -b nueva-rama     # Crear y cambiar

# Sincronizar con GitHub
git fetch                      # Traer info (no aplica cambios)
git pull                       # Traer y aplicar cambios
git push                       # Subir cambios
```

---

#### Solución de Problemas Comunes

**Error: "remote: Permission denied"**

Causa: Token incorrecto o sin permisos

Solución:
```bash
# Limpiar credenciales cacheadas
git credential reject <<EOF
protocol=https
host=github.com
EOF

# Volver a hacer push (pedirá credenciales de nuevo)
git push
```

---

**Error: "fatal: not a git repository"**

Causa: No estás en un directorio con Git inicializado

Solución:
```bash
git init
```

---

**Error: "Updates were rejected"**

Causa: GitHub tiene commits que tú no tienes

Solución:
```bash
git pull --rebase origin main
git push
```

---

**Error: "upstream branch" no configurado**

Causa: Primera vez que haces push de una rama

Solución:
```bash
git push -u origin nombre-rama
```

---

#### Mejores Prácticas

✅ **Hacer commits frecuentes**
- Pequeños y enfocados
- Más fácil revertir si algo falla

✅ **Mensajes descriptivos**
- "Qué" hiciste, no "cómo"
- Futuro tú agradecerá entenderlo

✅ **Revisar antes de commit**
```bash
git status              # ¿Qué archivos cambié?
git diff                # ¿Qué líneas cambié?
```

✅ **No subir secretos**
- Usar `.env` para secretos
- Verificar `.gitignore`

✅ **Sincronizar regularmente**
```bash
git pull               # Antes de empezar a trabajar
git push               # Al terminar el día
```

❌ **Evitar:**
- Commits genéricos: "cambios", "fix", "update"
- Subir archivos grandes (usar Git LFS si necesario)
- Hacer commit de `node_modules/`
- Subir tokens o contraseñas

---

#### Flujo Completo: Primer Push a GitHub

```bash
# 1. Crear repo en GitHub (sin README, sin .gitignore)
# https://github.com/new

# 2. En tu proyecto local
git init
git add .
git commit -m "Initial commit: VIP Engine"

# 3. Conectar con GitHub
git remote add origin https://github.com/usuario/VIPEngineShopify.git

# 4. Configurar credential helper (opcional pero recomendado)
git config --global credential.helper store

# 5. Subir código
git push -u origin main

# Ingresar credenciales cuando pida:
# Username: tu-usuario
# Password: tu-token (NO contraseña)

# 6. Siguientes cambios
git add .
git commit -m "Descripción del cambio"
git push  # Ya no necesita -u origin main
```

---

## 🔜 Lecciones Pendientes

### LECCIÓN 10: Crear Páginas con Remix (Próxima)

- Crear ruta para lista de niveles
- Usar loader para cargar datos
- Renderizar tabla con Polaris
- Agregar botón para crear nivel

### LECCIÓN 11: Formularios en Remix

- Crear formulario para nuevo nivel
- Validación de datos
- Usar action para guardar
- Feedback al usuario (toast)

### LECCIÓN 12: Webhooks de Shopify

- Qué son los webhooks
- Configurar `orders/create`
- Procesar pedidos automáticamente
- Actualizar nivel de cliente

### LECCIÓN 13: Lógica de Asignación Automática

- Calcular gasto total del cliente
- Determinar nivel según criterios
- Actualizar asignación en DB
- Sincronizar con Shopify (tags/metafields)

### LECCIÓN 14: API de Descuentos de Shopify

- Crear descuentos automáticos
- Aplicar por nivel de cliente
- Gestionar reglas de descuento
- Validar y probar descuentos

### LECCIÓN 15: Dashboard de Estadísticas

- Agregar datos por nivel
- Crear gráficos
- Mostrar métricas clave
- Exportar reportes

### LECCIÓN 16: Extensiones de Tema

- Mostrar badge de nivel al cliente
- App blocks en Shopify 2.0
- Liquid + JavaScript
- Personalización visual

### LECCIÓN 17: Testing y Depuración

- Pruebas unitarias
- Pruebas de integración
- Depurar con DevTools
- Logs y monitoreo

### LECCIÓN 18: Despliegue y Producción

- Cambiar de SQLite a PostgreSQL
- Variables de entorno
- Desplegar en hosting (Fly.io, Heroku)
- Monitoreo de producción

### LECCIÓN 19: Publicación en App Store

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
