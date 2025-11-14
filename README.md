# SOPHIA User Service

Servicio de usuarios para el proyecto SOPHIA, desarrollado con Node.js, Express, TypeScript y una arquitectura escalable.

## � Descripción del Proyecto

SOPHIA User Service es un microservicio backend diseñado para gestionar usuarios dentro del ecosistema SOPHIA. Este servicio proporciona una API RESTful robusta y escalable para operaciones relacionadas con usuarios, incluyendo autorización y gestión de perfiles. Construido con tecnologías modernas como Node.js y TypeScript, implementa mejores prácticas de desarrollo, incluyendo manejo centralizado de errores, logging estructurado, testing automatizado y contenerización con Docker.

## 🔧 Versión del Lenguaje

- **Node.js**: 24.x
- **TypeScript**: 5.9.2

## 📦 Dependencias Principales

### Dependencias de Producción
- **express**: ^5.1.0 - Framework web para Node.js
- **cors**: ^2.8.5 - Middleware para Cross-Origin Resource Sharing
- **helmet**: ^8.1.0 - Middleware de seguridad HTTP
- **morgan**: ^1.10.1 - HTTP request logger middleware
- **winston**: ^3.17.0 - Sistema de logging avanzado y flexible
- **dotenv**: 17.2.2 - Carga variables de entorno desde archivo .env
- **@types/express**: ^5.0.3 - Definiciones de tipos para Express

### Dependencias de Desarrollo
- **typescript**: 5.9.2 - Compilador y herramientas de TypeScript
- **@biomejs/biome**: 2.2.2 - Linter, formatter y organizador de imports
- **vitest**: 3.2.4 - Framework de testing moderno y rápido
- **@vitest/coverage-istanbul**: 3.2.4 - Plugin de cobertura de código
- **nodemon**: 3.1.10 - Monitor de archivos para desarrollo
- **tsx**: 4.20.5 - Ejecutor de TypeScript en tiempo real
- **supertest**: ^7.1.4 - Testing de endpoints HTTP
- **typedoc**: 0.28.12 - Generador de documentación para TypeScript

**Gestor de Paquetes**: pnpm@10.15.1

## ⚡ Instrucciones de Instalación y Ejecución

### Prerrequisitos
- Node.js 24.x o superior
- pnpm (recomendado) o npm

### Instalación

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/IETI-Group/SOPHIA-UserService.git
   cd SOPHIA-UserService
   ```

2. **Instalar dependencias:**
   ```bash
   pnpm install
   ```

3. **Configurar variables de entorno:**
   ```bash
   cp .env.example .env
   
   ```

### Ejecución

#### Desarrollo (con hot reload)
```bash
pnpm dev
```

#### Producción
```bash
# Compilar TypeScript
pnpm build

# Ejecutar versión compilada
pnpm start
```

#### Verificación
- Servidor: `http://localhost:3000`
- Health check: `http://localhost:3000/api/v1/health`

## 📋 Documento de Planeación

**[📊 Tablero de Planeación en Trello](https://trello.com/invite/b/68be127bf45c3eaecf8cc70d/ATTI6891bb77d37b8e0184327426470801ed6871D57B/sophia)**

Este tablero contiene:
- **Backlog del Producto**: Historias de usuario y épicas pendientes
- **Sprint Actual**: Tareas en desarrollo y asignaciones
- **Historias de Usuario**: Definición detallada de funcionalidades
- **Tareas Técnicas**: Actividades de desarrollo, testing y despliegue
- **Criterios de Aceptación**: Definición de "Terminado" para cada funcionalidad
- **Roadmap**: Planificación temporal del desarrollo

## �🚀 Tecnologías

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

```

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
