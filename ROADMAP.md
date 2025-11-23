# 🗺️ Roadmap del Proyecto: VIP Engine - App de Niveles de Clientes

> **Guía completa de progreso del proyecto**
> Este documento te permite retomar el proyecto exactamente donde lo dejaste.

---

## 📊 Estado General del Proyecto

| Métrica | Valor |
|---------|-------|
| **Progreso general** | 35% |
| **Última sesión** | 2025-11-23 |
| **Fase actual** | Configuración y Fundamentos ✅ |
| **Próximo paso** | Crear interfaz de gestión de niveles |
| **Repositorio GitHub** | [VIPEngineShopify](https://github.com/esilvestredeveloper/VIPEngineShopify) |
| **Estado servidor dev** | ✅ Funcionando (`npm run dev`) |

---

## 🎯 Objetivo del Proyecto

Desarrollar una **aplicación completa de gestión de niveles de clientes** para Shopify que permita:

- ✅ Definir niveles personalizados (Básico, Premium, VIP)
- ⏳ Asignar niveles automáticamente según criterios
- ⏳ Aplicar beneficios (descuentos, envío gratis, productos exclusivos)
- ⏳ Monitorear estadísticas de clientes por nivel
- ⏳ Publicar en Shopify App Store (opcional)

---

## 📋 Fases del Proyecto

### 🟢 FASE 1: Configuración y Fundamentos (COMPLETADA)

**Objetivo:** Preparar el entorno y entender las bases de apps de Shopify

**Estado:** ✅ Completada (100%)

**Última actualización:** 2025-11-23

#### Tareas Completadas:

- [x] **1.1** Instalar Shopify CLI y dependencias
  - Node.js v20.x ✅
  - Shopify CLI 3.87.4 ✅
  - Git configurado ✅

- [x] **1.2** Crear cuenta en Shopify Partners
  - Cuenta creada ✅
  - Tienda de desarrollo: quickstart-01e9a1bd.myshopify.com ✅

- [x] **1.3** Generar estructura base de la app
  - Template: Remix + TypeScript ✅
  - Configuración OAuth ✅
  - App embebida funcionando ✅

- [x] **1.4** Configurar base de datos con Prisma
  - SQLite configurado ✅
  - Modelo CustomerTier creado ✅
  - Modelo CustomerTierAssignment creado ✅
  - Migración `create_customer_tiers` aplicada ✅

- [x] **1.5** Configurar control de versiones
  - Git inicializado ✅
  - Repositorio GitHub creado ✅
  - SSH configurado ✅
  - Primer commit realizado ✅

- [x] **1.6** Entender arquitectura de la app
  - Remix y sistema de rutas ✅
  - Loaders y Actions ✅
  - GraphQL y Shopify API ✅
  - Polaris components ✅

#### Archivos Clave Creados:

```
✅ prisma/schema.prisma           # Modelos de datos
✅ .gitignore                      # Archivos a ignorar
✅ LECCIONES.md                    # Documentación educativa
✅ ROADMAP.md                      # Este archivo
```

#### Conocimientos Adquiridos:

- ✅ Arquitectura de apps embebidas de Shopify
- ✅ OAuth y autenticación
- ✅ Remix framework (loaders, actions, routes)
- ✅ GraphQL para APIs
- ✅ Prisma ORM y migraciones
- ✅ Git, GitHub y SSH con múltiples cuentas

---

### 🟡 FASE 2: Interfaz de Gestión de Niveles (EN PROGRESO)

**Objetivo:** Crear la interfaz CRUD para gestionar niveles de clientes

**Estado:** ⏳ Pendiente (0%)

**Fecha estimada de inicio:** Próxima sesión

#### Tareas Pendientes:

- [ ] **2.1** Crear ruta `/app/tiers`
  - Archivo: `app/routes/app.tiers._index.tsx`
  - Loader para cargar niveles desde DB
  - Renderizar tabla con Polaris

- [ ] **2.2** Implementar lista de niveles
  - Tabla con columnas: Nombre, Gasto mínimo, Pedidos mínimos, Descuento, Estado
  - Botón "Crear nivel"
  - Botones de acción por nivel (Editar, Eliminar)

- [ ] **2.3** Crear formulario para nuevo nivel
  - Archivo: `app/routes/app.tiers.new.tsx`
  - Campos: name, description, minSpent, minOrders, discountPercentage, priority
  - Validación de datos
  - Action para guardar en DB

- [ ] **2.4** Implementar edición de niveles
  - Archivo: `app/routes/app.tiers.$id.tsx`
  - Cargar datos del nivel existente
  - Formulario pre-poblado
  - Action para actualizar

- [ ] **2.5** Implementar eliminación de niveles
  - Modal de confirmación
  - Action para eliminar de DB
  - Feedback con toast message

#### Archivos a Crear:

```
⏳ app/routes/app.tiers._index.tsx    # Lista de niveles
⏳ app/routes/app.tiers.new.tsx       # Crear nivel
⏳ app/routes/app.tiers.$id.tsx       # Editar nivel
```

#### Conocimientos a Adquirir:

- ⏳ Polaris DataTable component
- ⏳ Formularios en Remix
- ⏳ Validación de datos
- ⏳ CRUD completo con Prisma
- ⏳ Toast messages y feedback al usuario

---

### ⚪ FASE 3: Asignación Manual de Niveles

**Objetivo:** Permitir asignar niveles a clientes manualmente

**Estado:** ⏳ Pendiente (0%)

**Estimación:** 2-3 horas

#### Tareas Pendientes:

- [ ] **3.1** Integrar GraphQL para obtener clientes
  - Query para listar clientes de Shopify
  - Paginación
  - Búsqueda de clientes

- [ ] **3.2** Crear interfaz de asignación
  - Selector de cliente
  - Selector de nivel
  - Guardar asignación en CustomerTierAssignment

- [ ] **3.3** Mostrar clientes asignados
  - Tabla de asignaciones
  - Filtrar por nivel
  - Ver detalles del cliente

#### Archivos a Crear:

```
⏳ app/routes/app.assignments._index.tsx    # Lista de asignaciones
⏳ app/routes/app.assignments.new.tsx       # Asignar nivel a cliente
```

---

### ⚪ FASE 4: Webhooks y Asignación Automática

**Objetivo:** Automatizar la asignación de niveles según criterios

**Estado:** ⏳ Pendiente (0%)

**Estimación:** 3-4 horas

#### Tareas Pendientes:

- [ ] **4.1** Configurar webhook `orders/create`
  - Registrar webhook en Shopify
  - Endpoint: `app/routes/webhooks.orders.create.tsx`
  - Verificar firma HMAC

- [ ] **4.2** Implementar lógica de cálculo
  - Obtener historial de pedidos del cliente (GraphQL)
  - Calcular gasto total acumulado
  - Contar número de pedidos

- [ ] **4.3** Asignar nivel automáticamente
  - Evaluar criterios de cada nivel
  - Asignar nivel más alto que cumpla criterios
  - Guardar en CustomerTierAssignment
  - Actualizar si cambia de nivel

- [ ] **4.4** Sincronizar con Shopify
  - Agregar tag al cliente (ej: "VIP")
  - O usar metafield para guardar nivel
  - Actualizar cuando cambie de nivel

#### Archivos a Crear:

```
⏳ app/routes/webhooks.orders.create.tsx    # Webhook de pedidos
⏳ app/services/tier-assignment.server.ts   # Lógica de asignación
⏳ app/services/shopify-sync.server.ts      # Sincronización con Shopify
```

---

### ⚪ FASE 5: Descuentos Automáticos

**Objetivo:** Aplicar descuentos según el nivel del cliente

**Estado:** ⏳ Pendiente (0%)

**Estimación:** 2-3 horas

#### Tareas Pendientes:

- [ ] **5.1** Crear descuentos con API de Shopify
  - Usar GraphQL mutation `discountAutomaticAppCreate`
  - Configurar condiciones (customer tag = "VIP")
  - Definir porcentaje de descuento

- [ ] **5.2** Gestionar descuentos desde la app
  - Crear descuento al activar nivel
  - Actualizar descuento si cambia configuración
  - Eliminar descuento si se desactiva nivel

- [ ] **5.3** Mostrar descuentos aplicados
  - Lista de descuentos activos
  - Asociar con niveles
  - Estadísticas de uso

#### Archivos a Crear:

```
⏳ app/services/discount-manager.server.ts    # Gestión de descuentos
⏳ app/routes/app.discounts._index.tsx        # Ver descuentos
```

---

### ⚪ FASE 6: Dashboard y Estadísticas

**Objetivo:** Mostrar métricas y estadísticas del sistema

**Estado:** ⏳ Pendiente (0%)

**Estimación:** 2-3 horas

#### Tareas Pendientes:

- [ ] **6.1** Crear dashboard principal
  - Resumen de niveles activos
  - Número de clientes por nivel
  - Ingresos generados por nivel

- [ ] **6.2** Implementar gráficos
  - Distribución de clientes por nivel (pie chart)
  - Evolución de asignaciones en el tiempo (line chart)
  - Top clientes VIP

- [ ] **6.3** Reportes descargables
  - Exportar a CSV
  - Filtros por fecha
  - Reportes personalizados

#### Archivos a Crear:

```
⏳ app/routes/app.dashboard.tsx        # Dashboard principal
⏳ app/services/analytics.server.ts    # Cálculo de métricas
```

---

### ⚪ FASE 7: Extensiones de Tema (Opcional)

**Objetivo:** Mostrar badges e información al cliente en el storefront

**Estado:** ⏳ Pendiente (0%)

**Estimación:** 3-4 horas

#### Tareas Pendientes:

- [ ] **7.1** Crear app block para Shopify 2.0
  - Extension: Theme app extension
  - Mostrar badge del nivel del cliente
  - Personalizable desde el editor de temas

- [ ] **7.2** Bloquear productos/colecciones
  - Solo accesibles para niveles específicos
  - Mensaje para clientes que no cumplen requisitos

- [ ] **7.3** Banner de beneficios
  - Mostrar beneficios del nivel actual
  - Incentivar subir de nivel

#### Archivos a Crear:

```
⏳ extensions/customer-tier-badge/    # App block
⏳ extensions/tier-benefits/          # Banner de beneficios
```

---

### ⚪ FASE 8: Testing y Pulido

**Objetivo:** Asegurar calidad y preparar para producción

**Estado:** ⏳ Pendiente (0%)

**Estimación:** 2-3 horas

#### Tareas Pendientes:

- [ ] **8.1** Pruebas funcionales
  - Crear niveles
  - Asignar manualmente
  - Asignación automática con pedidos de prueba
  - Aplicar descuentos

- [ ] **8.2** Manejo de errores
  - Validaciones
  - Mensajes de error claros
  - Logs para debugging

- [ ] **8.3** Optimizaciones
  - Performance de queries
  - Caching si es necesario
  - UX/UI pulido

---

### ⚪ FASE 9: Despliegue

**Objetivo:** Publicar la app en producción

**Estado:** ⏳ Pendiente (0%)

**Estimación:** 2-3 horas

#### Tareas Pendientes:

- [ ] **9.1** Migrar a PostgreSQL
  - Cambiar de SQLite a PostgreSQL
  - Configurar base de datos en hosting
  - Aplicar migraciones

- [ ] **9.2** Desplegar en hosting
  - Opción recomendada: Fly.io o Railway
  - Configurar variables de entorno
  - Configurar dominio

- [ ] **9.3** Configurar en Shopify Partners
  - URLs de producción
  - Configuración OAuth
  - Webhook URLs

- [ ] **9.4** Pruebas en producción
  - Instalar en tienda de desarrollo
  - Verificar todos los flujos
  - Monitoreo de errores

---

### ⚪ FASE 10: Publicación en App Store (Opcional)

**Objetivo:** Hacer la app pública en Shopify App Store

**Estado:** ⏳ Pendiente (0%)

**Estimación:** 4-6 horas

#### Tareas Pendientes:

- [ ] **10.1** Revisar requisitos de Shopify
  - Políticas de apps
  - Requisitos técnicos
  - Requisitos de diseño

- [ ] **10.2** Preparar documentación
  - Descripción de la app
  - Screenshots
  - Video demo
  - Guía de instalación

- [ ] **10.3** Definir modelo de monetización
  - Gratis
  - Freemium
  - Suscripción mensual

- [ ] **10.4** Enviar para revisión
  - Completar formulario de envío
  - Esperar aprobación de Shopify
  - Responder a feedback

---

## 📝 Registro de Sesiones

### Sesión 1 - 2025-11-23

**Duración:** ~3 horas
**Progreso:** Fase 1 completada al 100%

**Lo que se logró:**
1. ✅ Configuración completa del entorno (Shopify CLI, Node.js)
2. ✅ Creación de la app con Remix + TypeScript
3. ✅ Configuración de Prisma con SQLite
4. ✅ Diseño e implementación del modelo de datos
5. ✅ Configuración de Git y GitHub con SSH
6. ✅ Creación de documentación completa (LECCIONES.md)
7. ✅ Aprendizaje de conceptos fundamentales

**Problemas encontrados y soluciones:**
- ❌ Error de versión de Node.js (18.x) → ✅ Actualizado a Node.js 20.x
- ❌ Error de permisos con cloudflared → ✅ Solucionado con `chown`
- ❌ Error 403 en GitHub push → ✅ Configurado SSH en lugar de HTTPS

**Siguiente paso para la próxima sesión:**
👉 Comenzar Fase 2: Crear la interfaz de gestión de niveles

**Archivos importantes:**
- `LECCIONES.md` - Referencia educativa completa
- `prisma/schema.prisma` - Modelos de datos
- `ROADMAP.md` - Este archivo (hoja de ruta)

---

## 🚀 Próxima Sesión: Guía Rápida

### Para retomar el proyecto:

1. **Abrir el proyecto:**
   ```bash
   cd ~/Documentos/Proyectos/VIPEngineShopify
   ```

2. **Revisar este archivo (ROADMAP.md)** para ver dónde quedaste

3. **Ver el "Siguiente paso" de la última sesión** (arriba en Sesión 1)

4. **Iniciar servidor de desarrollo:**
   ```bash
   npm run dev
   ```

5. **Decirle a Claude:**
   > "Hola, quiero continuar con el proyecto VIP Engine.
   > Por favor lee el archivo ROADMAP.md y continuemos desde donde lo dejamos."

6. **Claude verificará:**
   - El archivo ROADMAP.md
   - El estado del proyecto
   - El siguiente paso pendiente
   - Y continuará enseñándote desde ahí

---

## 📖 Recursos Rápidos

### Comandos Útiles

```bash
# Iniciar servidor de desarrollo
npm run dev

# Ver base de datos
npx prisma studio

# Hacer commit
git add .
git commit -m "tu mensaje"
git push

# Ver estado de Git
git status
```

### Archivos Importantes

| Archivo | Propósito |
|---------|-----------|
| `ROADMAP.md` | Este archivo - Tu progreso |
| `LECCIONES.md` | Referencia educativa completa |
| `TODO.md` | Idea original del proyecto |
| `prisma/schema.prisma` | Modelos de base de datos |
| `app/routes/` | Páginas de la app |

### Enlaces Útiles

- **Repositorio:** https://github.com/esilvestredeveloper/VIPEngineShopify
- **Shopify Partners:** https://partners.shopify.com/
- **Documentación Shopify:** https://shopify.dev/docs/apps
- **Polaris Components:** https://polaris.shopify.com/components
- **Remix Docs:** https://remix.run/docs

---

## 💡 Consejos para Próximas Sesiones

1. **Siempre lee ROADMAP.md al inicio** para recordar dónde quedaste
2. **Actualiza la sección "Registro de Sesiones"** al terminar cada sesión
3. **Haz commits frecuentes** con mensajes descriptivos
4. **Consulta LECCIONES.md** si necesitas repasar conceptos
5. **No te saltes fases** - cada una construye sobre la anterior

---

**Última actualización:** 2025-11-23
**Próxima revisión:** Inicio de Sesión 2
**Autor:** Emilio (con guía de Claude Code)
