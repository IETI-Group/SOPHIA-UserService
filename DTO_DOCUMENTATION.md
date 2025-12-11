# SOPHIA User Service - DTO Documentation

Esta documentación detalla los Data Transfer Objects (DTOs) utilizados en la aplicación para la transferencia de datos entre las capas del sistema.

## Tabla de Contenidos
- [User DTOs](#user-dtos)
- [Learning Path DTOs](#learning-path-dtos)
- [Review DTOs](#review-dtos)
- [Linked Account DTOs](#linked-account-dtos)
- [Admin & Instructor DTOs](#admin--instructor-dtos)
- [Request & Response DTOs](#request--response-dtos)

---

## User DTOs

### UserInDTO
Datos de entrada para crear un usuario.
```typescript
interface UserInDTO {
  email: string;
  firstName: string;
  lastName: string;
  birthDate: Date;
}
```

### UserOutDTO
Datos básicos de salida de un usuario.
```typescript
interface UserOutDTO {
  userId: string;
  role: ROLE;
}
```

### UserUpdateDTO
Datos para actualizar un usuario (extiende UserOutDTO).
```typescript
interface UserUpdateDTO extends UserOutDTO {
  email: string;
  firstName: string;
  lastName: string;
  birthDate: Date;
  bio: string;
}
```

### UserHeavyOutDTO
Datos completos de salida de un usuario (extiende UserUpdateDTO).
```typescript
interface UserHeavyOutDTO extends UserUpdateDTO {
  createdAt: Date;
  updatedAt: Date | null;
}
```

---

## Learning Path DTOs

### LearningPathInDTO
Datos de entrada para crear/actualizar un learning path.
```typescript
interface LearningPathInDTO {
  primaryStyle: LEARNING_STYLES;
  secondaryStyle: LEARNING_STYLES;
  pacePreference: PACE_PREFERENCE;
  interactivityPreference: number;
  gamificationEnabled: boolean;
}
```

### LearningPathOutDTO
Datos de salida de un learning path (extiende LearningPathInDTO).
```typescript
interface LearningPathOutDTO extends LearningPathInDTO {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Review DTOs

### ReviewInDTO
Datos de entrada para crear una reseña.
```typescript
interface ReviewInDTO {
  reviewerId: string;
  reviewedId: string;
  discriminant: REVIEW_DISCRIMINANT;
  rate: number;
  recommended: boolean;
  comments?: string;
}
```

### ReviewOutDTO
Datos de salida de una reseña (extiende ReviewInDTO).
```typescript
interface ReviewOutDTO extends ReviewInDTO {
  reviewerId: string;
  id: string;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Linked Account DTOs

### LinkedAccountInDTO
Datos de entrada para vincular una cuenta externa.
```typescript
interface LinkedAccountInDTO {
  userId: string;
  provider: string;
  issuer: string;
  idExternal: string;
  email: string;
  isPrimary: boolean;
}
```

### LinkedAccountOutDTO
Datos de salida de una cuenta vinculada (extiende LinkedAccountInDTO).
```typescript
interface LinkedAccountOutDTO extends LinkedAccountInDTO {
  idLinkedAccount: string;
  linkedAt: Date;
  emailVerified: boolean;
}
```

---

## Admin & Instructor DTOs

Estos tipos se definen en los repositorios correspondientes.

### InstructorInput
Datos de entrada para crear/actualizar un instructor.
```typescript
type InstructorInput = {
  instructorId: string;
  verificationStatus?: VERIFICATION_STATUS;
  verifiedAt?: Date;
};
```

### InstructorRecord
Datos de salida de un instructor (mapeo de DB).
```typescript
type InstructorRecord = {
  id_instructor: string;
  total_students: number;
  total_courses: number;
  average_rating: string;
  total_reviews: number;
  verification_status: VERIFICATION_STATUS;
  verified_at: Date | null;
};
```

### RoleInput
Datos de entrada para crear/actualizar un rol.
```typescript
type RoleInput = {
  name: ROLE;
  description?: string;
};
```

### RoleRecord
Datos de salida de un rol.
```typescript
type RoleRecord = {
  id_role: string;
  name: ROLE;
  description: string | null;
};
```

### RoleAssignationInput
Datos de entrada para asignar un rol.
```typescript
type RoleAssignationInput = {
  userId: string;
  role: ROLE;
  expiresAt?: Date;
  status?: ROLE_STATUS;
};
```

### RoleAssignationRecord
Datos de salida de una asignación de rol.
```typescript
type RoleAssignationRecord = {
  id_user_role: string;
  user_id: string;
  role_id: string;
  role_name: ROLE;
  assigned_at: Date;
  expires_at: Date | null;
  status: ROLE_STATUS;
};
```

---

## Request & Response DTOs

### ApiRequestQuery
Parámetros base para consultas paginadas.
```typescript
interface ApiRequestQuery {
  page: number;
  size: number;
  sort?: string;
  order: 'asc' | 'desc';
  lightDTO?: boolean;
}
```

### UsersQuery
Parámetros específicos para consulta de usuarios (extiende ApiRequestQuery).
```typescript
interface UsersQuery extends ApiRequestQuery {
  firstName?: string;
  lastName?: string;
  birthDayFrom?: Date;
  birthDayTo?: Date;
}
```

### ApiRequestBatchUsers
Solicitud para obtener usuarios por lote.
```typescript
interface ApiRequestBatchUsers extends ApiRequestQuery {
  users: string[];
}
```

### ApiResponse<T>
Estructura estándar de respuesta exitosa.
```typescript
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  timestamp: string;
}
```

### PaginatedResponse<T>
Respuesta paginada (extiende ApiResponse).
```typescript
interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
```

### ApiErrorResponse
Estructura estándar de respuesta de error.
```typescript
interface ApiErrorResponse {
  success: false;
  error: string;
  timestamp: string;
  stack?: string;
}
```
