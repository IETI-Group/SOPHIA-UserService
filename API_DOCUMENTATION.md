# SOPHIA User Service - API Documentation

## Tabla de Contenidos
- [Información General](#información-general)
- [Base URL](#base-url)
- [Códigos de Respuesta](#códigos-de-respuesta)
- [Formato de Respuesta](#formato-de-respuesta)
- [Endpoints](#endpoints)
  - [Health Check](#health-check)
  - [Authentication](#authentication)
  - [Users](#users)
  - [Learning Paths](#learning-paths)
  - [Reviews](#reviews)
  - [Linked Accounts](#linked-accounts)
  - [Admin - Roles](#admin---roles)
  - [Admin - Role Assignations](#admin---role-assignations)
  - [Admin - Instructors](#admin---instructors)
  - [Instructors](#instructors)

---

## Información General

API RESTful para la gestión de usuarios, instructores, roles y recursos educativos del sistema SOPHIA.

**Versión:** 1.0.0  
**Tecnologías:** Node.js, Express, TypeScript, PostgreSQL

---

## Base URL

```
http://localhost:3000/api/v1
```

---

## Códigos de Respuesta

| Código | Descripción |
|--------|-------------|
| 200 | Operación exitosa |
| 201 | Recurso creado exitosamente |
| 400 | Solicitud inválida (error de validación) |
| 404 | Recurso no encontrado |
| 500 | Error interno del servidor |

---

## Formato de Respuesta

Todas las respuestas siguen este formato estándar:

```typescript
{
  success: boolean;
  message: string;
  data?: T;
  timestamp: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
```

---

# Endpoints

## Health Check

### GET /health
Verifica el estado del servicio.

**Respuesta (200):**
```json
{
  "status": "UP",
  "timestamp": "2025-11-20T10:30:00.000Z"
}
```

---

## Authentication

Endpoints para autenticación mediante AWS Cognito. El sistema soporta dos flujos de autenticación:
1. **Flujo principal:** Login con email y contraseña (`POST /auth/login`)
2. **Flujo alternativo:** OAuth2 con Cognito Hosted UI (`GET /auth/login/url` + `/auth/callback`)

### POST /auth/signup
Registra un nuevo usuario en la base de datos y en AWS Cognito.

**Acceso:** Público

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "birthDate": "1990-01-01",
  "profilePicture": "https://example.com/photo.jpg",
  "bio": "Estudiante apasionado por la tecnología",
  "learningStyle": "visual"
}
```

**Validaciones:**
- `firstName`: String requerido, no vacío
- `lastName`: String requerido, no vacío
- `email`: Email válido, requerido
- `password`: String requerido (mínimo 8 caracteres, mayúsculas, minúsculas, números y caracteres especiales)
- `birthDate`: Fecha ISO 8601 requerida
- `profilePicture`: URL válida (opcional)
- `bio`: String (opcional)
- `learningStyle`: Enum: visual, auditory, kinesthetic (opcional)

**Respuesta (201):**
```json
{
  "success": true,
  "message": "User registered successfully. Please check your email to confirm your account.",
  "data": {
    "userId": "uuid",
    "cognitoSub": "cognito-uuid"
  }
}
```

**Errores:**
| Código | Error | Descripción |
|--------|-------|-------------|
| 400 | VALIDATION_ERROR | Datos de entrada inválidos |
| 409 | USER_ALREADY_EXISTS | Email ya registrado |
| 500 | INTERNAL_SERVER_ERROR | Error en el registro |

---

### POST /auth/confirm-email
Confirma el email de un usuario usando el código de verificación enviado por email.

**Acceso:** Público

**Request Body:**
```json
{
  "email": "john@example.com",
  "confirmationCode": "123456"
}
```

**Validaciones:**
- `email`: Email válido, requerido
- `confirmationCode`: String requerido (código de 6 dígitos)

**Respuesta (200):**
```json
{
  "success": true,
  "message": "Email confirmed successfully. You can now login."
}
```

**Errores:**
| Código | Error | Descripción |
|--------|-------|-------------|
| 400 | VALIDATION_ERROR | Email o código inválido |
| 400 | INVALID_CODE | Código de verificación incorrecto |
| 404 | USER_NOT_FOUND | Usuario no encontrado |
| 500 | INTERNAL_SERVER_ERROR | Error al confirmar email |

---

### POST /auth/resend-confirmation
Reenvía el código de confirmación al email del usuario.

**Acceso:** Público

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Validaciones:**
- `email`: Email válido, requerido

**Respuesta (200):**
```json
{
  "success": true,
  "message": "Confirmation code resent successfully. Please check your email."
}
```

**Errores:**
| Código | Error | Descripción |
|--------|-------|-------------|
| 400 | VALIDATION_ERROR | Email inválido |
| 404 | USER_NOT_FOUND | Usuario no encontrado |
| 400 | ALREADY_CONFIRMED | Email ya confirmado |
| 500 | INTERNAL_SERVER_ERROR | Error al reenviar código |

---

### POST /auth/login
Login con email y contraseña (flujo principal de autenticación).

**Acceso:** Público

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Validaciones:**
- `email`: Email válido, requerido
- `password`: String requerido

**Respuesta (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJraWQiOiJ...",
    "idToken": "eyJraWQiOiJ...",
    "refreshToken": "eyJjdHkiOiJ...",
    "expiresIn": 3600,
    "tokenType": "Bearer",
    "user": {
      "sub": "uuid-cognito",
      "email": "john@example.com",
      "email_verified": true,
      "name": "John Doe"
    }
  }
}
```

**Errores:**
| Código | Error | Descripción |
|--------|-------|-------------|
| 400 | VALIDATION_ERROR | Email o contraseña no proporcionados |
| 401 | INVALID_CREDENTIALS | Email o contraseña incorrectos |
| 403 | EMAIL_NOT_CONFIRMED | Email no confirmado |
| 500 | INTERNAL_SERVER_ERROR | Error en el login |

---

### GET /auth/login/url
Obtiene la URL de login OAuth2 de AWS Cognito (flujo alternativo con Hosted UI).

**Acceso:** Público

**Respuesta (200):**
```json
{
  "success": true,
  "data": {
    "loginUrl": "https://your-domain.auth.us-east-1.amazoncognito.com/login?client_id=xxx&response_type=code&scope=openid+profile+email&redirect_uri=xxx&state=xxx",
    "state": "abc123"
  },
  "message": "Redirect to this URL to login with Cognito"
}
```

**Errores:**
| Código | Error | Descripción |
|--------|-------|-------------|
| 500 | INTERNAL_SERVER_ERROR | Error al generar la URL de login |

---

### GET /auth/callback
Callback de AWS Cognito después del login OAuth2. Intercambia el código de autorización por tokens.

**Acceso:** Público

**Query Parameters:**
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| code | string | Sí | Código de autorización de Cognito |

**Respuesta (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJraWQiOiJ...",
    "idToken": "eyJraWQiOiJ...",
    "refreshToken": "eyJjdHkiOiJ...",
    "expiresIn": 3600,
    "tokenType": "Bearer",
    "user": {
      "sub": "uuid-cognito",
      "email": "user@example.com",
      "email_verified": true,
      "name": "John Doe"
    }
  },
  "message": "Authentication successful"
}
```

**Errores:**
| Código | Error | Descripción |
|--------|-------|-------------|
| 400 | BAD_REQUEST | Código de autorización no proporcionado |
| 500 | AUTHENTICATION_FAILED | Fallo en la autenticación |

---

### GET /auth/logout
Obtiene la URL de logout de AWS Cognito.

**Acceso:** Público

**Respuesta (200):**
```json
{
  "success": true,
  "data": {
    "logoutUrl": "https://your-domain.auth.us-east-1.amazoncognito.com/logout?client_id=xxx&logout_uri=xxx"
  },
  "message": "Redirect to this URL to logout"
}
```

**Errores:**
| Código | Error | Descripción |
|--------|-------|-------------|
| 500 | INTERNAL_SERVER_ERROR | Error al generar la URL de logout |

---

### GET /auth/me
Obtiene la información del usuario autenticado.

**Acceso:** Privado (requiere token en header Authorization)

**Headers:**
| Header | Tipo | Requerido | Descripción |
|--------|------|-----------|-------------|
| Authorization | string | Sí | Bearer token (ej: `Bearer eyJraWQiOiJ...`) |

**Respuesta (200):**
```json
{
  "success": true,
  "data": {
    "sub": "uuid-cognito",
    "email": "user@example.com",
    "email_verified": true,
    "name": "John Doe"
  },
  "message": "User information retrieved successfully"
}
```

**Errores:**
| Código | Error | Descripción |
|--------|-------|-------------|
| 401 | UNAUTHORIZED | No autenticado o token inválido |
| 500 | INTERNAL_SERVER_ERROR | Error al obtener información del usuario |

---

### POST /auth/verify
Verifica si un token JWT es válido.

**Acceso:** Público

**Request Body:**
```json
{
  "token": "eyJraWQiOiJ..."
}
```

**Validaciones:**
- `token`: String requerido (JWT token)

**Respuesta (200) - Token válido:**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "user": {
      "sub": "uuid-cognito",
      "email": "user@example.com",
      "email_verified": true,
      "name": "John Doe"
    }
  },
  "message": "Token is valid"
}
```

**Errores:**
| Código | Error | Descripción |
|--------|-------|-------------|
| 400 | BAD_REQUEST | Token no proporcionado |
| 401 | INVALID_TOKEN | Token inválido o expirado |

**Respuesta (401) - Token inválido:**
```json
{
  "success": false,
  "data": {
    "valid": false
  },
  "message": "Invalid or expired token",
  "error": "INVALID_TOKEN"
}
```

---

## Users

### GET /api/v1/users
Obtiene todos los usuarios con paginación y filtros.

**Query Parameters:**
| Parámetro | Tipo | Requerido | Descripción | Valores |
|-----------|------|-----------|-------------|---------|
| page | number | No | Número de página | Default: 1 |
| size | number | No | Cantidad por página | Default: 10, Max: 100 |
| sort | string | No | Campo para ordenar | firstName, lastName, email, birthDate, createdAt, updatedAt |
| order | string | No | Orden de clasificación | asc, desc |
| light_dto | boolean | No | Usar DTO ligero | true, false (default) |
| first_name | string | No | Filtrar por nombre | |
| last_name | string | No | Filtrar por apellido | |
| birthday_from | string | No | Fecha desde (ISO 8601) | |
| birthday_to | string | No | Fecha hasta (ISO 8601) | |

**Respuesta (200):**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [
    {
      "userId": "uuid",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "birthDate": "1990-01-01",
      "profilePicture": "url",
      "bio": "...",
      "learningStyle": "visual",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "timestamp": "2025-11-20T10:30:00.000Z",
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

### GET /api/v1/users/id/:id
Obtiene un usuario por su ID.

**Path Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | string | ID del usuario (UUID) |

**Query Parameters:**
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| light_dto | boolean | No | Usar DTO ligero |

**Respuesta (200):**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "userId": "uuid",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "birthDate": "1990-01-01",
    "profilePicture": "url",
    "bio": "...",
    "learningStyle": "visual",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  "timestamp": "2025-11-20T10:30:00.000Z"
}
```

---

### GET /api/v1/users/email/:email
Obtiene un usuario por su correo electrónico.

**Path Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| email | string | Email del usuario |

**Query Parameters:**
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| light_dto | boolean | No | Usar DTO ligero |

**Respuesta (200):** Similar a GET /api/v1/users/id/:id

---

### POST /api/v1/users/batch
Obtiene múltiples usuarios por sus IDs.

**Request Body:**
```json
{
  "users": ["uuid1", "uuid2", "uuid3"]
}
```

**Query Parameters:**
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| sort | string | No | Campo para ordenar |
| order | string | No | Orden (asc/desc) |
| light_dto | boolean | No | Usar DTO ligero |

**Validaciones:**
- `users`: Array de 1-100 elementos

**Respuesta (200):**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [
    {
      "userId": "uuid",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com"
    }
  ],
  "timestamp": "2025-11-20T10:30:00.000Z"
}
```

---

### POST /api/v1/users
Crea un nuevo usuario.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "birthDate": "1990-01-01",
  "profilePicture": "https://example.com/photo.jpg",
  "bio": "Estudiante apasionado por la tecnología",
  "learningStyle": "visual"
}
```

**Validaciones:**
- `firstName`: String requerido, no vacío
- `lastName`: String requerido, no vacío
- `email`: Email válido, requerido
- `birthDate`: Fecha ISO 8601 requerida
- `profilePicture`: URL válida (opcional)
- `bio`: String (opcional)
- `learningStyle`: Enum: visual, auditory, kinesthetic (opcional)

**Respuesta (201):**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": "uuid-del-nuevo-usuario",
  "timestamp": "2025-11-20T10:30:00.000Z"
}
```

---

### PUT /api/v1/users/:id
Actualiza un usuario existente.

**Path Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | string | ID del usuario |

**Request Body:** (Todos los campos opcionales)
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "birthDate": "1990-01-01",
  "profilePicture": "https://example.com/photo.jpg",
  "bio": "Bio actualizada",
  "learningStyle": "auditory"
}
```

**Respuesta (200):**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": null,
  "timestamp": "2025-11-20T10:30:00.000Z"
}
```

---

### DELETE /api/v1/users/:id
Elimina un usuario.

**Path Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | string | ID del usuario |

**Respuesta (200):**
```json
{
  "success": true,
  "message": "User deleted successfully",
  "data": null,
  "timestamp": "2025-11-20T10:30:00.000Z"
}
```

---

## Learning Paths

### GET /api/v1/users/:id/learning-path
Obtiene el learning path de un usuario.

**Path Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | string | ID del usuario |

**Respuesta (200):**
```json
{
  "success": true,
  "message": "Learning path retrieved successfully",
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "currentLevel": "intermediate",
    "goals": "Dominar TypeScript",
    "completedCourses": 15,
    "currentCourse": "Advanced TypeScript",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  "timestamp": "2025-11-20T10:30:00.000Z"
}
```

---

### POST /api/v1/users/:id/learning-path
Crea un learning path para un usuario.

**Path Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | string | ID del usuario |

**Request Body:**
```json
{
  "currentLevel": "beginner",
  "goals": "Aprender desarrollo web",
  "currentCourse": "HTML & CSS Fundamentals"
}
```

**Validaciones:**
- `currentLevel`: String requerido
- `goals`: String requerido
- `currentCourse`: String (opcional)

**Respuesta (201):**
```json
{
  "success": true,
  "message": "Learning path created successfully",
  "data": "uuid-del-learning-path",
  "timestamp": "2025-11-20T10:30:00.000Z"
}
```

---

### PUT /api/v1/users/:id/learning-path
Actualiza el learning path de un usuario.

**Path Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | string | ID del usuario |

**Request Body:** (Todos los campos opcionales)
```json
{
  "currentLevel": "intermediate",
  "goals": "Metas actualizadas",
  "currentCourse": "Nuevo curso"
}
```

**Respuesta (200):**
```json
{
  "success": true,
  "message": "Learning path updated successfully",
  "data": null,
  "timestamp": "2025-11-20T10:30:00.000Z"
}
```

---

## Reviews

### GET /api/v1/users/:id/reviews
Obtiene todas las reviews de un usuario con paginación.

**Path Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | string | ID del usuario |

**Query Parameters:**
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| page | number | No | Número de página |
| size | number | No | Cantidad por página |
| sort | string | No | Campo para ordenar |
| order | string | No | Orden (asc/desc) |
| showInstructors | boolean | No | Incluir datos de instructores |
| showCourses | boolean | No | Incluir datos de cursos |
| reviewedId | string | No | ID del recurso revisado |

**Respuesta (200):**
```json
{
  "success": true,
  "message": "Reviews retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "reviewerId": "uuid",
      "reviewedId": "uuid",
      "reviewType": "instructor",
      "rating": 5,
      "comment": "Excelente instructor",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "timestamp": "2025-11-20T10:30:00.000Z",
  "pagination": {...}
}
```

---

### GET /api/v1/users/instructors/:instructorId/reviews
Obtiene todas las reviews de un instructor específico.

**Path Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| instructorId | string | ID del instructor |

**Query Parameters:** page, size, sort, order

**Respuesta (200):** Similar a GET /api/v1/users/:id/reviews

---

### GET /api/v1/users/courses/:courseId/reviews
Obtiene todas las reviews de un curso específico.

**Path Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| courseId | string | ID del curso |

**Query Parameters:** page, size, sort, order

**Respuesta (200):** Similar a GET /api/v1/users/:id/reviews

---

### POST /api/v1/users/:id/reviews
Crea una nueva review.

**Path Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | string | ID del reviewer |

**Request Body:**
```json
{
  "reviewedId": "uuid-instructor-o-curso",
  "reviewType": "instructor",
  "rating": 5,
  "comment": "Excelente experiencia de aprendizaje"
}
```

**Validaciones:**
- `reviewedId`: String requerido
- `reviewType`: Enum requerido: instructor, course
- `rating`: Number requerido, 1-5
- `comment`: String (opcional)

**Respuesta (201):**
```json
{
  "success": true,
  "message": "Review created successfully",
  "data": "uuid-de-la-review",
  "timestamp": "2025-11-20T10:30:00.000Z"
}
```

---

### PUT /api/v1/users/:id/reviews/:reviewId
Actualiza una review existente.

**Path Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | string | ID del usuario |
| reviewId | string | ID de la review |

**Request Body:** (Campos opcionales)
```json
{
  "rating": 4,
  "comment": "Comentario actualizado"
}
```

**Respuesta (200):**
```json
{
  "success": true,
  "message": "Review updated successfully",
  "data": null,
  "timestamp": "2025-11-20T10:30:00.000Z"
}
```

---

### DELETE /api/v1/users/:id/reviews/:reviewId
Elimina una review.

**Path Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | string | ID del usuario |
| reviewId | string | ID de la review |

**Respuesta (200):**
```json
{
  "success": true,
  "message": "Review deleted successfully",
  "data": null,
  "timestamp": "2025-11-20T10:30:00.000Z"
}
```

---

## Linked Accounts

### GET /api/v1/users/:id/linked-accounts
Obtiene todas las cuentas vinculadas de un usuario.

**Path Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | string | ID del usuario |

**Query Parameters:** page, size, sort, order

**Respuesta (200):**
```json
{
  "success": true,
  "message": "Linked accounts retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "platform": "google",
      "accountId": "google-account-id",
      "linkedAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "timestamp": "2025-11-20T10:30:00.000Z",
  "pagination": {...}
}
```

---

### GET /api/v1/users/:id/linked-accounts/:accountId
Obtiene una cuenta vinculada específica.

**Path Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | string | ID del usuario |
| accountId | string | ID de la cuenta vinculada |

**Respuesta (200):**
```json
{
  "success": true,
  "message": "Linked account retrieved successfully",
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "platform": "google",
    "accountId": "google-account-id",
    "linkedAt": "2025-01-01T00:00:00.000Z"
  },
  "timestamp": "2025-11-20T10:30:00.000Z"
}
```

---

### POST /api/v1/users/:id/linked-accounts
Vincula una nueva cuenta externa.

**Path Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | string | ID del usuario |

**Request Body:**
```json
{
  "platform": "google",
  "accountId": "google-account-id"
}
```

**Validaciones:**
- `platform`: String requerido
- `accountId`: String requerido

**Respuesta (201):**
```json
{
  "success": true,
  "message": "Linked account created successfully",
  "data": "uuid-de-la-cuenta-vinculada",
  "timestamp": "2025-11-20T10:30:00.000Z"
}
```

---

### PUT /api/v1/users/:id/linked-accounts/:accountId
Actualiza una cuenta vinculada.

**Path Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | string | ID del usuario |
| accountId | string | ID de la cuenta vinculada |

**Request Body:** (Campos opcionales)
```json
{
  "platform": "github",
  "accountId": "nuevo-account-id"
}
```

**Respuesta (200):**
```json
{
  "success": true,
  "message": "Linked account updated successfully",
  "data": null,
  "timestamp": "2025-11-20T10:30:00.000Z"
}
```

---

### DELETE /api/v1/users/:id/linked-accounts/:accountId
Elimina una cuenta vinculada.

**Path Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | string | ID del usuario |
| accountId | string | ID de la cuenta vinculada |

**Respuesta (200):**
```json
{
  "success": true,
  "message": "Linked account deleted successfully",
  "data": null,
  "timestamp": "2025-11-20T10:30:00.000Z"
}
```

---

## Admin - Roles

### GET /api/v1/admin/roles
Obtiene todos los roles con paginación.

**Access:** Admin

**Query Parameters:**
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| page | number | No | Número de página |
| size | number | No | Cantidad por página |
| sort | string | No | Campo para ordenar |
| order | string | No | Orden (asc/desc) |

**Respuesta (200):**
```json
{
  "success": true,
  "message": "Roles retrieved successfully",
  "data": [
    {
      "id_role": "uuid",
      "name": "admin",
      "description": "Administrator role with full access"
    }
  ],
  "timestamp": "2025-11-20T10:30:00.000Z",
  "pagination": {...}
}
```

---

### GET /api/v1/admin/roles/:name
Obtiene un rol por su nombre.

**Access:** Admin

**Path Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| name | string | Nombre del rol |

**Respuesta (200):**
```json
{
  "success": true,
  "message": "Role retrieved successfully",
  "data": {
    "id_role": "uuid",
    "name": "admin",
    "description": "Administrator role with full access"
  },
  "timestamp": "2025-11-20T10:30:00.000Z"
}
```

---

### POST /api/v1/admin/roles
Crea un nuevo rol.

**Access:** Admin

**Request Body:**
```json
{
  "name": "moderator",
  "description": "Moderator role with limited admin access"
}
```

**Validaciones:**
- `name`: String requerido, no vacío
- `description`: String (opcional)

**Respuesta (201):**
```json
{
  "success": true,
  "message": "Role created successfully",
  "data": "uuid-del-nuevo-rol",
  "timestamp": "2025-11-20T10:30:00.000Z"
}
```

---

### PUT /api/v1/admin/roles/:name
Actualiza un rol existente.

**Access:** Admin

**Path Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| name | string | Nombre del rol |

**Request Body:** (Campos opcionales)
```json
{
  "description": "Descripción actualizada del rol"
}
```

**Respuesta (200):**
```json
{
  "success": true,
  "message": "Role updated successfully",
  "data": null,
  "timestamp": "2025-11-20T10:30:00.000Z"
}
```

---

### DELETE /api/v1/admin/roles/:name
Elimina un rol.

**Access:** Admin

**Path Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| name | string | Nombre del rol |

**Respuesta (200):**
```json
{
  "success": true,
  "message": "Role deleted successfully",
  "data": null,
  "timestamp": "2025-11-20T10:30:00.000Z"
}
```

---

## Admin - Role Assignations

### GET /api/v1/admin/assignations
Obtiene todas las asignaciones de roles con filtros.

**Access:** Admin

**Query Parameters:**
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| page | number | No | Número de página |
| size | number | No | Cantidad por página |
| sort | string | No | Campo para ordenar |
| order | string | No | Orden (asc/desc) |
| role_status | string | No | Estado: active, inactive, suspended |
| role | string | No | Rol: admin, instructor, student, guest |
| assignment_start_date | string | No | Fecha inicio asignación (ISO 8601) |
| assignment_end_date | string | No | Fecha fin asignación (ISO 8601) |
| expiration_start_date | string | No | Fecha inicio expiración (ISO 8601) |
| expiration_end_date | string | No | Fecha fin expiración (ISO 8601) |

**Respuesta (200):**
```json
{
  "success": true,
  "message": "assignation retrieved successfully",
  "data": [
    {
      "id_user_role": "uuid",
      "user_id": "uuid",
      "role_id": "uuid",
      "assigned_at": "2025-01-01T00:00:00.000Z",
      "expires_at": "2026-01-01T00:00:00.000Z",
      "status": "active",
      "role_name": "instructor"
    }
  ],
  "timestamp": "2025-11-20T10:30:00.000Z",
  "pagination": {...}
}
```

---

### POST /api/v1/admin/assignations
Asigna un rol a un usuario.

**Access:** Admin

**Request Body:**
```json
{
  "userId": "uuid-del-usuario",
  "role": "instructor"
}
```

**Validaciones:**
- `userId`: String requerido
- `role`: Enum requerido: admin, instructor, student, guest

**Respuesta (201):**
```json
{
  "success": true,
  "message": "Role assigned successfully",
  "data": "uuid-de-la-asignacion",
  "timestamp": "2025-11-20T10:30:00.000Z"
}
```

---

### PUT /api/v1/admin/assignations/user/:userId/role/:role
Actualiza una asignación de rol por usuario y rol.

**Access:** Admin

**Path Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| userId | string | ID del usuario |
| role | string | Nombre del rol |

**Request Body:** (Campos opcionales)
```json
{
  "status": "inactive",
  "expiresAt": "2026-12-31T23:59:59.000Z"
}
```

**Validaciones:**
- `status`: Enum: active, inactive, suspended
- `expiresAt`: Fecha ISO 8601

**Respuesta (200):**
```json
{
  "success": true,
  "message": "Role assignation updated successfully",
  "data": {
    "id_user_role": "uuid",
    "user_id": "uuid",
    "role_id": "uuid",
    "assigned_at": "2025-01-01T00:00:00.000Z",
    "expires_at": "2026-12-31T23:59:59.000Z",
    "status": "inactive",
    "role_name": "instructor"
  },
  "timestamp": "2025-11-20T10:30:00.000Z"
}
```

---

### PUT /api/v1/admin/assignations/:assignationId
Actualiza una asignación de rol por ID de asignación.

**Access:** Admin

**Path Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| assignationId | string | ID de la asignación |

**Request Body:** Similar a PUT por userId/role

**Respuesta (200):** Similar a PUT por userId/role

---

### DELETE /api/v1/admin/assignations/user/:userId/role/:role
Revoca un rol de un usuario.

**Access:** Admin

**Path Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| userId | string | ID del usuario |
| role | string | Nombre del rol |

**Respuesta (200):**
```json
{
  "success": true,
  "message": "Role revoked from user successfully",
  "data": null,
  "timestamp": "2025-11-20T10:30:00.000Z"
}
```

---

### DELETE /api/v1/admin/assignations/:assignationId
Revoca una asignación de rol por ID.

**Access:** Admin

**Path Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| assignationId | string | ID de la asignación |

**Respuesta (200):**
```json
{
  "success": true,
  "message": "Role assignation {id} revoked",
  "data": null,
  "timestamp": "2025-11-20T10:30:00.000Z"
}
```

---

## Admin - Instructors

### GET /api/v1/admin/instructors
Obtiene todos los instructores con filtros.

**Access:** Admin

**Query Parameters:**
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| page | number | No | Número de página |
| size | number | No | Cantidad por página |
| sort | string | No | Campo para ordenar |
| order | string | No | Orden (asc/desc) |
| verification_status | string | No | Estado: verified, pending, rejected |

**Respuesta (200):**
```json
{
  "success": true,
  "message": "Instructors retrieved successfully",
  "data": [
    {
      "instructorId": "uuid",
      "verificationStatus": "verified",
      "verifiedAt": "2025-01-01T00:00:00.000Z",
      "totalRatings": 150,
      "totalStudents": 500,
      "totalCourses": 12,
      "averageRating": 4.8
    }
  ],
  "timestamp": "2025-11-20T10:30:00.000Z",
  "pagination": {...}
}
```

---

### POST /api/v1/admin/instructors
Crea un nuevo instructor.

**Access:** Admin

**Request Body:**
```json
{
  "instructorId": "uuid-del-usuario",
  "verificationStatus": "verified",
  "verifiedAt": "2025-11-20T10:30:00.000Z"
}
```

**Validaciones:**
- `instructorId`: String requerido
- `verificationStatus`: Enum opcional: verified, pending, rejected
- `verifiedAt`: Fecha ISO 8601 opcional

**Respuesta (201):**
```json
{
  "success": true,
  "message": "Instructor created successfully",
  "data": "uuid-del-instructor",
  "timestamp": "2025-11-20T10:30:00.000Z"
}
```

---

### PUT /api/v1/admin/instructors/:instructorId
Actualiza un instructor existente.

**Access:** Admin

**Path Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| instructorId | string | ID del instructor |

**Request Body:** (Todos los campos opcionales)
```json
{
  "verificationStatus": "verified",
  "verifiedAt": "2025-11-20T10:30:00.000Z"
}
```

**Respuesta (200):**
```json
{
  "success": true,
  "message": "Instructor updated successfully",
  "data": null,
  "timestamp": "2025-11-20T10:30:00.000Z"
}
```

---

### DELETE /api/v1/admin/instructors/:instructorId
Elimina un instructor.

**Access:** Admin

**Path Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| instructorId | string | ID del instructor |

**Respuesta (200):**
```json
{
  "success": true,
  "message": "Instructor deleted successfully",
  "data": null,
  "timestamp": "2025-11-20T10:30:00.000Z"
}
```

---

## Instructors

### GET /api/v1/instructors/:instructorId
Obtiene información de un instructor.

**Access:** Public

**Path Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| instructorId | string | ID del instructor |

**Respuesta (200):**
```json
{
  "success": true,
  "message": "Instructor retrieved successfully",
  "data": {
    "instructorId": "uuid",
    "verificationStatus": "verified",
    "verifiedAt": "2025-01-01T00:00:00.000Z",
    "totalRatings": 150,
    "totalStudents": 500,
    "totalCourses": 12,
    "averageRating": 4.8
  },
  "timestamp": "2025-11-20T10:30:00.000Z"
}
```

---

### POST /api/v1/instructors
Registra un nuevo instructor (auto-registro).

**Access:** Public

**Request Body:**
```json
{
  "instructorId": "uuid-del-usuario",
  "verificationStatus": "pending"
}
```

**Respuesta (201):**
```json
{
  "success": true,
  "message": "Instructor created successfully",
  "data": "uuid-del-instructor",
  "timestamp": "2025-11-20T10:30:00.000Z"
}
```

---

### PUT /api/v1/instructors/:instructorId
Actualiza información del instructor.

**Access:** Public

**Path Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| instructorId | string | ID del instructor |

**Request Body:** (Campos opcionales)
```json
{
  "verificationStatus": "pending",
  "verifiedAt": "2025-11-20T10:30:00.000Z"
}
```

**Respuesta (200):**
```json
{
  "success": true,
  "message": "Instructor updated successfully",
  "data": null,
  "timestamp": "2025-11-20T10:30:00.000Z"
}
```

---

### DELETE /api/v1/instructors/:instructorId
Elimina un instructor.

**Access:** Public

**Path Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| instructorId | string | ID del instructor |

**Respuesta (200):**
```json
{
  "success": true,
  "message": "Instructor deleted successfully",
  "data": null,
  "timestamp": "2025-11-20T10:30:00.000Z"
}
```

---

## Enums y Tipos

### Learning Styles
```typescript
enum LEARNING_STYLES {
  VISUAL = 'visual',
  AUDITORY = 'auditory',
  KINESTHETIC = 'kinesthetic'
}
```

### Roles
```typescript
enum ROLE {
  ADMIN = 'admin',
  INSTRUCTOR = 'instructor',
  STUDENT = 'student',
  GUEST = 'guest'
}
```

### Role Status
```typescript
enum ROLE_STATUS {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended'
}
```

### Review Types
```typescript
enum REVIEW_TYPE {
  INSTRUCTOR = 'instructor',
  COURSE = 'course'
}
```

---

## Errores Comunes

### Error de Validación (400)
```json
{
  "success": false,
  "message": "Validation error: Invalid email format",
  "timestamp": "2025-11-20T10:30:00.000Z"
}
```

### Recurso No Encontrado (404)
```json
{
  "success": false,
  "message": "User not found",
  "timestamp": "2025-11-20T10:30:00.000Z"
}
```

### Error Interno (500)
```json
{
  "success": false,
  "message": "Internal server error",
  "timestamp": "2025-11-20T10:30:00.000Z"
}
```

---

## Notas de Desarrollo

1. **Paginación**: Por defecto, todas las consultas paginadas retornan 10 elementos por página con un máximo de 100.

2. **Ordenamiento**: Los campos válidos para ordenar en usuarios son: firstName, lastName, email, birthDate, createdAt, updatedAt.

3. **DTO Ligero vs Pesado**: El parámetro `light_dto` permite obtener versiones simplificadas de los objetos para optimizar el rendimiento.

4. **Fechas**: Todas las fechas deben estar en formato ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ).

5. **IDs**: Todos los IDs son UUID v4.

6. **Validaciones**: Todas las rutas implementan validación de datos usando express-validator.

---

## Contacto y Soporte

Para reportar problemas o solicitar nuevas funcionalidades:
- **Repositorio**: [SOPHIA-UserService](https://github.com/IETI-Group/SOPHIA-UserService)
- **Branch**: feat/admininstructor
