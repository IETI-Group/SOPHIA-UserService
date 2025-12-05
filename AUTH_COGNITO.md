# Autenticación con AWS Cognito

Autenticación con AWS Cognito.

## Configuración

### Variables de Entorno

Para el correcto funcionamiento del sistema de autenticación, se requiere configurar las siguientes variables en el archivo de entorno (`.env`):

| Variable | Descripción | Ejemplo |
| :--- | :--- | :--- |
| `COGNITO_USER_POOL_ID` | Identificador único del **User Pool** en AWS Cognito. | `us-east-2_EqCaX4s7M` |
| `COGNITO_REGION` | Región de AWS donde reside el User Pool. | `us-east-2` |
| `AUTH_CLIENT_ID` | Client ID de la aplicación en el User Pool. | `2cbd8jptf6g9j8u8an0lbctv2b` |
| `AUTH_CLIENT_SECRET` | Client Secret de la aplicación (si aplica). | `bbvhelhqqd9q95osn7gpmkv4geu0qh0ls2esekcg018hm18tfhs` |
| `COGNITO_DOMAIN` | Dominio de la interfaz de usuario alojada de Cognito. | `us-east-2eqcax4s7m.auth.us-east-2.amazoncognito.com` |
| `COGNITO_CALLBACK_URL` | URL de redireccionamiento después de un login exitoso. | `http://localhost:80/api/v1/auth/callback` |
| `COGNITO_LOGOUT_URL` | URL de redireccionamiento después de cerrar sesión. | `http://localhost:80` |
| `COGNITO_ISSUER` | URL del emisor de tokens para la verificación JWT. | `https://cognito-idp.us-east-2.amazonaws.com/us-east-2_EqCaX4s7M` |
| `COGNITO_JWKS_URI` | URI para obtener las claves públicas de verificación de tokens. | `https://cognito-idp.us-east-2.amazonaws.com/us-east-2_EqCaX4s7M/.well-known/jwks.json` |

> **Nota:** Los valores de `AUTH_CLIENT_ID` y `AUTH_CLIENT_SECRET` deben corresponder a la configuración real del App Client en AWS Cognito.

### Configuración en AWS Cognito

1. **Callback URLs:** Agregar `http://localhost:3000/api/v1/auth/callback` y URL de producción
2. **Sign out URLs:** Agregar `http://localhost:3000` y URL de producción
3. **OAuth Flows:** Habilitar "Authorization code grant"
4. **OAuth Scopes:** Habilitar `email`, `openid`, `phone`, y `profile`

## Endpoints de Autenticación

### 1. Iniciar Login

**GET** `/api/v1/auth/login`

Retorna la URL de login de AWS Cognito para redirigir al usuario.

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "loginUrl": "https://...",
    "state": "abc123"
  },
  "message": "Redirect to this URL to login with Cognito"
}
```

**Uso en el frontend:**
```javascript
const response = await fetch('/api/v1/auth/login');
const { data } = await response.json();
window.location.href = data.loginUrl;
```

### 2. Callback de Autenticación

**GET** `/api/v1/auth/callback?code=<authorization_code>`

Este endpoint es llamado automáticamente por AWS Cognito después del login exitoso.

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJraWQiOiI...",
    "idToken": "eyJraWQiOiI...",
    "refreshToken": "eyJjdHkiOiI...",
    "expiresIn": 3600,
    "tokenType": "Bearer",
    "user": {
      "userId": "sub-value",
      "username": "johndoe",
      "email": "john@example.com",
      "emailVerified": true,
      "groups": ["admin"]
    }
  },
  "message": "Authentication successful"
}
```

**Importante:** Guardar el `idToken` o `accessToken` en el localStorage/sessionStorage del frontend para usarlo en peticiones posteriores.

### 3. Obtener Información del Usuario

**GET** `/api/v1/auth/me`

Requiere autenticación (token en el header).

**Headers:**
```
Authorization: Bearer <id_token_o_access_token>
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "userId": "sub-value",
    "username": "johndoe",
    "email": "john@example.com",
    "emailVerified": true,
    "groups": ["admin"]
  },
  "message": "User information retrieved successfully"
}
```

### 4. Verificar Token

**POST** `/api/v1/auth/verify`

Verifica si un token es válido.

**Body:**
```json
{
  "token": "eyJraWQiOiI..."
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "user": {
      "userId": "sub-value",
      "username": "johndoe",
      "email": "john@example.com"
    }
  },
  "message": "Token is valid"
}
```

### 5. Cerrar Sesión

**GET** `/api/v1/auth/logout`

Retorna la URL de logout de AWS Cognito.

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "logoutUrl": "https://..."
  },
  "message": "Redirect to this URL to logout"
}
```

**Uso en el frontend:**
```javascript
const response = await fetch('/api/v1/auth/logout');
const { data } = await response.json();
localStorage.removeItem('token'); // Limpiar token local
window.location.href = data.logoutUrl;
```

### 6. Registro de Usuario (Sign Up)

**POST** `/api/v1/auth/signup`

Registra un nuevo usuario en la base de datos y en AWS Cognito. Este endpoint crea el usuario en ambos sistemas y vincula la cuenta de Cognito con el perfil de usuario en la base de datos.

**Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "Password123!",
  "firstName": "Juan",
  "lastName": "Pérez",
  "birthDate": "1990-05-15"
}
```

**Validaciones:**
- **email**: Debe ser un email válido, máximo 254 caracteres
- **password**: Mínimo 8 caracteres, debe contener al menos una mayúscula, una minúscula, un número y un carácter especial
- **firstName**: Entre 2 y 60 caracteres
- **lastName**: Entre 2 y 100 caracteres
- **birthDate**: Formato YYYY-MM-DD, el usuario debe tener al menos 13 años

**Respuesta Exitosa (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "userId": "uuid-del-usuario",
      "email": "usuario@ejemplo.com",
      "firstName": "Juan",
      "lastName": "Pérez",
      "birthDate": "1990-05-15T00:00:00.000Z",
      "createdAt": "2025-12-04T18:30:00.000Z"
    },
    "cognitoSub": "cognito-user-sub-id",
    "message": "User registered successfully. Please check your email to verify your account.",
    "emailVerificationRequired": true
  },
  "message": "User registered successfully"
}
```

**Respuestas de Error:**

- **400 Bad Request** - Validación fallida
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "password",
      "message": "Password must contain at least one uppercase letter..."
    }
  ]
}
```

- **409 Conflict** - El usuario ya existe
```json
{
  "success": false,
  "message": "User already exists with this email",
  "error": "USER_ALREADY_EXISTS"
}
```

- **500 Internal Server Error** - Error en Cognito o Base de Datos
```json
{
  "success": false,
  "message": "Failed to create user in authentication system",
  "error": "COGNITO_SIGNUP_FAILED"
}
```

**Notas Importantes:**
1. El usuario recibirá un email de verificación de Cognito después del registro
2. El usuario debe verificar su email antes de poder iniciar sesión (dependiendo de la configuración del User Pool)
3. La contraseña debe cumplir con la política de seguridad de Cognito (8+ caracteres, mayúscula, minúscula, número, símbolo)
4. Se crea automáticamente una entrada en `linked_accounts` para rastrear la relación con Cognito

**Uso en el frontend:**
```javascript
const signUp = async (userData) => {
  try {
    const response = await fetch('/api/v1/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const result = await response.json();

    if (response.ok) {
      console.log('User registered:', result.data.user);
      if (result.data.emailVerificationRequired) {
        alert('Please check your email to verify your account');
      }
    } else {
      console.error('Registration failed:', result.message);
    }
  } catch (error) {
    console.error('Error during registration:', error);
  }
};
```

## Proteger Rutas

### Autenticación Requerida

Para proteger una ruta y requerir autenticación:

```typescript
import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

// Ruta protegida - requiere token válido
router.get('/courses/:id', authenticate, (req, res) => {
  // req.user contiene la información del usuario autenticado
  console.log(req.user);
  
  res.json({
    success: true,
    data: { /* datos del curso */ }
  });
});
```

### Autenticación Opcional

Para rutas donde la autenticación es opcional:

```typescript
import { optionalAuthenticate } from '../middlewares/auth.js';

// Ruta con autenticación opcional
router.get('/courses', optionalAuthenticate, (req, res) => {
  // req.user estará disponible si hay un token válido
  // Si no hay token o es inválido, req.user será undefined
  
  if (req.user) {
    // Usuario autenticado - mostrar cursos personalizados
  } else {
    // Usuario anónimo - mostrar cursos públicos
  }
});
```

### Requerir Grupos Específicos

Para restringir acceso por grupos de Cognito:

```typescript
import { authenticate, requireGroup, requireAnyGroup } from '../middlewares/auth.js';

// Solo usuarios del grupo 'admin'
router.delete('/courses/:id', authenticate, requireGroup('admin'), (req, res) => {
  // Solo usuarios con el grupo 'admin' pueden acceder
});

// Usuarios de 'admin'
router.put('/courses/:id', authenticate, requireAnyGroup(['admin', 'moderator']), (req, res) => {
  // Usuarios con 'admin' pueden acceder
});
```

## Flujo de Autenticación Completo

### Frontend (React/Vue/Angular)

```javascript
// 1. Iniciar login
async function login() {
  const response = await fetch('/api/v1/auth/login');
  const { data } = await response.json();
  window.location.href = data.loginUrl;
}

// 2. Manejar callback (en la página de callback)
async function handleCallback() {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  
  if (code) {
    const response = await fetch(`/api/v1/auth/callback?code=${code}`);
    const { data } = await response.json();
    
    // Guardar token
    localStorage.setItem('token', data.idToken);
    
    // Redirigir al dashboard
    window.location.href = '/dashboard';
  }
}

// 3. Hacer peticiones autenticadas
async function getCourses() {
  const token = localStorage.getItem('token');
  
  const response = await fetch('/api/v1/courses', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.json();
}

// 4. Cerrar sesión
async function logout() {
  const response = await fetch('/api/v1/auth/logout');
  const { data } = await response.json();
  
  localStorage.removeItem('token');
  window.location.href = data.logoutUrl;
}
```

## Ejemplo de Integración Frontend-Backend

```typescript
// Frontend - Servicio de Autenticación
class AuthService {
  private baseUrl = '/api/v1/auth';
  
  async login(): Promise<void> {
    const response = await fetch(`${this.baseUrl}/login`);
    const { data } = await response.json();
    window.location.href = data.loginUrl;
  }
  
  async handleCallback(code: string): Promise<UserInfo> {
    const response = await fetch(`${this.baseUrl}/callback?code=${code}`);
    const { data } = await response.json();
    
    localStorage.setItem('token', data.idToken);
    return data.user;
  }
  
  async getCurrentUser(): Promise<UserInfo> {
    const token = this.getToken();
    const response = await fetch(`${this.baseUrl}/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  }
  
  async logout(): Promise<void> {
    const response = await fetch(`${this.baseUrl}/logout`);
    const { data } = await response.json();
    
    localStorage.removeItem('token');
    window.location.href = data.logoutUrl;
  }
  
  getToken(): string | null {
    return localStorage.getItem('token');
  }
  
  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authService = new AuthService();
```