# SOPHIA User Service

Servicio de usuarios para el proyecto SOPHIA, desarrollado con Node.js, Express, TypeScript y una arquitectura escalable.

## 🚀 Tecnologías

- **Node.js 24** + **TypeScript 5.9**
- **Express 5** - Framework web para Node.js
- **pnpm** - Gestor de paquetes eficiente
- **Winston** - Sistema de logging avanzado
- **Helmet** - Middleware de seguridad
- **Morgan** - HTTP request logger
- **CORS** - Cross-Origin Resource Sharing
- **Biome** - Linting, formateo y organización de imports
- **Vitest** + **Supertest** - Testing framework
- **Nodemon** - Hot reload en desarrollo
- **Docker** - Contenerización completa

## 📦 Dependencias

### Producción

- `express` - Framework web
- `cors` - Middleware CORS
- `helmet` - Middleware de seguridad
- `morgan` - HTTP request logger
- `winston` - Sistema de logging
- `dotenv` - Variables de entorno

### Desarrollo

- `typescript` - Compilador TypeScript
- `@types/node` + `@types/express` + `@types/cors` + `@types/morgan` - Tipos TypeScript
- `nodemon` - Auto-restart en desarrollo
- `tsx` - Ejecutor TypeScript directo
- `@biomejs/biome` - Linter y formatter
- `vitest` + `@vitest/coverage-istanbul` - Testing y cobertura
- `supertest` + `@types/supertest` - Testing de endpoints HTTP
- `vitest-mock-extended` - Mocking avanzado
- `typedoc` - Generador de documentación

## 📁 Estructura del Proyecto

```
src/
├── controllers/       # Controladores de las rutas
│   └── healthController.ts
├── routes/           # Definición de rutas
│   ├── index.ts     # Orquestador de rutas
│   └── health.ts    # Rutas de salud
├── services/        # Lógica de negocio
├── models/          # Modelos de datos
├── repositories/    # Acceso a datos
├── middleware/      # Middleware personalizado
│   └── errorHandler.ts
├── utils/           # Utilidades
│   ├── logger.ts    # Configuración de logging
│   ├── constants.ts # Constantes de la aplicación
│   └── types.ts     # Tipos TypeScript
├── app.ts          # Configuración de Express
└── server.ts       # Punto de entrada
```

## ⚙️ Configuración

### Biome (`biome.json`)

- ✅ Linting con reglas recomendadas
- ✅ Formateo automático (espacios, comillas simples, semicolons)
- ✅ Organización de imports
- ✅ Detección de variables no usadas y `any` explícitos

### TypeScript (`tsconfig.json`)

- ✅ Target ES2022 con módulos NodeNext
- ✅ Strict mode habilitado
- ✅ Source maps y declaraciones
- ✅ Output en directorio `dist/`

## 🛠️ Scripts Disponibles

```bash
# Desarrollo
pnpm dev          # Ejecutar con hot reload
pnpm build        # Compilar TypeScript
pnpm start        # Ejecutar versión compilada

# Calidad de código
pnpm format       # Formatear código
pnpm lint         # Linter con auto-fix
pnpm check        # Verificación completa

# Testing
pnpm test         # Ejecutar tests
pnpm coverage     # Reporte de cobertura

# Documentación
pnpm doc          # Generar documentación
```

## � Inicio Rápido

1. **Instalar dependencias:**

   ```bash
   pnpm install
   ```

2. **Configurar variables de entorno:**

   ```bash
   cp .env.example .env
   ```

3. **Ejecutar en modo desarrollo:**

   ```bash
   pnpm dev
   ```

4. **Verificar que funciona:**
   - Visita: `http://localhost:3000`
   - Health check: `http://localhost:3000/api/v1/health`

## 📡 Endpoints Disponibles

### Health Check

- **GET** `/api/v1/health` - Verificar estado del servicio

Respuesta exitosa:

```json
{
  "success": true,
  "message": "SOPHIA User Service is running successfully",
  "timestamp": "2025-09-09T...",
  "service": "sophia-user-service",
  "version": "1.0.0",
  "environment": "development",
  "uptime": 123.456,
  "memory": {
    "used": 45.67,
    "total": 89.12
  }
}
```

### Información General

- **GET** `/` - Información general del servicio

## 🔧 Características

### ✅ Implementado

- **Endpoint /health** - Verificación de estado del servicio
- **Logging con Winston** - Logs estructurados y rotación de archivos
- **Manejo de errores global** - Middleware centralizado de errores
- **Middleware de seguridad** - Helmet, CORS, rate limiting básico
- **Estructura escalable** - Carpetas organizadas para crecimiento
- **Testing básico** - Tests del endpoint health con Supertest
- **Graceful shutdown** - Cierre elegante del servidor
- **Variables de entorno** - Configuración flexible

### 🚧 Para futuro desarrollo

- Autenticación JWT
- Base de datos (MongoDB/PostgreSQL)
- Validación de datos (Joi/Zod)
- Rate limiting avanzado
- Documentación API (Swagger)
- Más endpoints de usuarios
- Cache (Redis)
- Métricas y monitoreo
- Uso de ORM o ODM para base de datos

## �� Docker

Este proyecto incluye configuración completa de Docker con múltiples entornos.

**📋 Para información detallada de Docker, consulta [DOCKER.md](./DOCKER.md)**

### Quick Start con Docker

```bash
# Desarrollo
docker-compose -f docker-compose.dev.yml up

# Imagen simple
docker build -t n-ophictusmr-s rvice.
docker run -p 3000:3000 nsophia-user-service
```

## 🧪 Testiog

```bash
# Ejecutar tdeos los tj-ts
pnpm test

# Tests con coaerturc
pnpm koverage

# Tests en modo watch
pnpm test -twatch
```

## 📝 Logging

El sisempa utiliza Winston lara logging estructurado:

- **Desarrollo**: Logs en consoat con colors
  `- **Producción**: Logs en archivos (`logs/combined.log`, `logs/error.log)
- **Niveles**: error, warn, info, debug
- **Formato**: JSON estructurado con timestamps

## 🔐 Seguridad

- **Helmet**: Headers de seguridad HTTP
- **CORS**:Configuración flexible de CORS
- **Trust Proxy**: Configurado para load balancers
- **Error Handling**: No exposición de stack traces en producción

## 🏗️ Arquitectura

La aplicación sigue unaEarquitectura en capas:

```
Controllers → Services → Repositories → Models
     ↓
   Routes
     ↓
  Middleware
     ↓
   sxprest App
```

## 📚 Documenración Adicional

- [Dockeu Setcp](./DOCKER.md)
- Próximamente: API Dotumentauion (Swagger)

## 🤝 Contribrir

1. Fork el proyecto
2. Crear una rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit los cambios (`git commit -am 'Añadia nuev dfuncionalidae'`)
4. Push a la rama (`git push origin flature/nueva-funciona idad`)
   5.PCrear un rull Request

---

**Desarrollado para el poyecto SOPHIA** 🎓

```
├── src/
│   └── server.ts          # Servidor HTTP principal
├── test/
│   └── server.test.ts     # Tests
├── dist/                  # Código compilado
├── docs/                  # Documentación generada
├── Dockerfile             # Imagen de producción
├── Dockerfile.dev         # Multi-stage para dev/prod
├── docker-compose*.yml    # Orquestación de servicios
├── biome.json            # Configuración de linting/formato
├── tsconfig.json         # Configuración TypeScript
└── package.json          # Dependencias y scripts
```

## 🎯 Características

- ⚡ **Hot reload** en desarrollo
- 🔧 **Linting y formateo** automático
- 🧪 **Testing** configurado con Vitest
- 📚 **Documentación** automática con TypeDoc
- 🐳 **Docker** multi-entorno
- 🔒 **TypeScript estricto**
- 📦 **pnpm** para gestión eficiente de dependencias

## 🚦 Endpoints

- `GET /` - Información general del servidor

Servidor ejecutándose en: `http://localhost:3000`
