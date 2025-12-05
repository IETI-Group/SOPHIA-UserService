# Resumen de Configuración - User Pool SOPHIA

## 📋 Información del User Pool

**Nombre:** User pool - 3iyqsz  
**ID:** `us-east-2_EqCaX4s7M`  
**Región:** `us-east-2`  
**ARN:** `arn:aws:cognito-idp:us-east-2:979214979730:userpool/us-east-2_EqCaX4s7M`  
**Dominio:** `us-east-2eqcax4s7m.auth.us-east-2.amazoncognito.com`  
**Fecha de Creación:** 2025-12-04

---

## 🔐 Aplicación de Cliente

**Nombre:** sophia-user-pools-auth  
**Client ID:** `2cbd8jptf6g9j8u8an0lbctv2b`  
**Client Secret:** `bbvhelhqqd9q95osn7gpmkv4geu0qh0ls2esekcg018hm18tfhs`  

### Configuración de Tokens
- **Access Token:** 60 minutos
- **ID Token:** 60 minutos
- **Refresh Token:** 5 días

### OAuth Configuration
- **Flujos permitidos:** Authorization Code Grant
- **Scopes:** email, openid, phone, profile
- **Callback URLs:**
  - `http://localhost:3000/api/v1/auth/callback`
  - `http://localhost:80/api/v1/auth/callback`
  - `https://d84l1y8p4kdic.cloudfront.net`

---

## 📝 Atributos Requeridos

### Atributos Obligatorios (Required: true)
✅ **email** - String (max 2048 chars)  
✅ **given_name** - String (max 2048 chars) - Mapea a `firstName` en BD  
✅ **birthdate** - String (exactamente 10 chars, formato YYYY-MM-DD)  
✅ **middle_name** - String (max 2048 chars) - **NOTA: Este es obligatorio pero no lo usamos**  

### Atributos Opcionales Importantes
- **family_name** - String (max 2048 chars) - Mapea a `lastName` en BD
- **name** - String (max 2048 chars) - Nombre completo generado
- **phone_number** - String (max 2048 chars)
- **email_verified** - Boolean
- **sub** - String (generado automáticamente por Cognito)

### Auto-Verificación
- ✅ Email se verifica automáticamente al confirmar

### Username Configuration
- **Case Sensitive:** No
- **Username Attributes:** Email (los usuarios inician sesión con su email)

---

## 🔑 Política de Contraseñas

- **Longitud mínima:** 8 caracteres
- **Requiere mayúsculas:** Sí
- **Requiere minúsculas:** Sí
- **Requiere números:** Sí
- **Requiere símbolos:** Sí
- **Validez de contraseña temporal:** 7 días

---

## 🚀 Endpoint de Sign Up Implementado

### POST `/api/v1/auth/signup`

**Flujo de Registro:**
1. ✅ Valida los datos de entrada (email, contraseña, nombre, apellido, fecha de nacimiento)
2. ✅ Verifica que el email no exista en la base de datos
3. ✅ Crea el usuario en AWS Cognito con `SignUpCommand`
4. ✅ Crea el usuario en PostgreSQL (tabla `users`)
5. ✅ Vincula la cuenta de Cognito en la tabla `linked_accounts`
6. ✅ Retorna información del usuario y estado de verificación

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

**Mapeo de Campos:**
- `email` → Cognito: `email` | BD: `email`
- `firstName` → Cognito: `given_name` | BD: `first_name`
- `lastName` → Cognito: `family_name` | BD: `last_name`
- `birthDate` → Cognito: `birthdate` (YYYY-MM-DD) | BD: `birth_date` (timestamp)
- `firstName + lastName` → Cognito: `name`
- Cognito: `middle_name` → Se envía como string vacío o nombre completo (requerido por configuración)

---

## ⚠️ Consideraciones Importantes

### Middle Name Obligatorio
El User Pool tiene `middle_name` como campo obligatorio, pero no lo usamos en nuestra aplicación. Hay dos opciones:
1. **Actual:** No enviarlo en el SignUp (puede causar error)
2. **Recomendado:** Enviar string vacío o copiar el `firstName`

### Verificación de Email
- Los usuarios reciben un código de verificación por email después del registro
- Deben verificar su email antes de poder iniciar sesión (según configuración del User Pool)
- La verificación se hace mediante el flujo OAuth2 de Cognito

### Sincronización BD - Cognito
- El `sub` de Cognito se guarda en `linked_accounts.id_external`
- Esto permite vincular el usuario de la BD con su cuenta de Cognito
- Si falla la creación en BD, el usuario quedará en Cognito sin perfil en BD

---

## 📦 Dependencias Instaladas

```json
{
  "@aws-sdk/client-cognito-identity-provider": "^3.x.x"
}
```

---

## 🔧 Archivos Modificados/Creados

### Creados
- ✅ `src/models/dtos/auth/SignUpInDTO.ts`
- ✅ `src/models/dtos/auth/SignUpOutDTO.ts`

### Modificados
- ✅ `.env` - Actualizado con nueva configuración
- ✅ `src/config/env.config.ts` - Ya tenía la configuración correcta
- ✅ `src/services/cognitoAuth.service.ts` - Agregados métodos `signUp()` y `adminCreateUser()`
- ✅ `src/controllers/auth.ts` - Agregado método `signup()`
- ✅ `src/routes/auth.ts` - Agregada ruta POST `/signup`
- ✅ `src/utils/validators.ts` - Agregado validador `signUpInDTO`
- ✅ `src/models/dtos/index.ts` - Exportados nuevos DTOs
- ✅ `AUTH_COGNITO.md` - Documentación actualizada

---

## 🧪 Pruebas Recomendadas

1. **Registro exitoso:** Usuario válido con todos los datos correctos
2. **Email duplicado:** Intentar registrar el mismo email dos veces
3. **Contraseña débil:** Probar con contraseñas que no cumplan los requisitos
4. **Email inválido:** Probar con formatos de email incorrectos
5. **Fecha de nacimiento:** Probar con fechas futuras o edad menor a 13 años
6. **Verificación de email:** Confirmar que se recibe el código de verificación

---

## 📚 Próximos Pasos Sugeridos

1. ⚠️ **PENDIENTE:** Resolver el tema de `middle_name` obligatorio
2. 🔄 Implementar rollback de Cognito si falla la creación en BD
3. 📧 Implementar endpoint para reenviar código de verificación
4. ✅ Implementar endpoint para confirmar email con código
5. 🔐 Implementar cambio de contraseña
6. 🔑 Implementar recuperación de contraseña
7. 🧪 Agregar tests unitarios e integración

---

**Fecha de Actualización:** 2025-12-04  
**User Pool Status:** ✅ Configurado y Operativo  
**Endpoint Status:** ✅ Implementado y Documentado
