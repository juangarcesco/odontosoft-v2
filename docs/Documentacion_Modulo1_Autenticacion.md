# Documentación del Módulo — OdontoSoft

> Plantilla reutilizable. Copia este archivo como `Documentacion_ModuloN_NombreModulo.md` al iniciar cada módulo nuevo, y complétalo a medida que avanzas (no esperes al final).

---

## 0. Datos generales del módulo

| Campo | Valor |
|---|---|
| Módulo | 1 — Autenticación y Control de Acceso |
| Rama de trabajo | `feature/modulo1-autenticacion` |
| Requisitos cubiertos | RF-01 a RF-08, RNF-01, RNF-03, RNF-06, RNF-16 |
| Fecha de inicio | 10/07/2026 |
| Fecha de cierre | 11/07/2026 |
| Responsable | Juan Carlos Garcés Sierra |
| Estado | ✅ Completado |

---

## 1. Matriz de trazabilidad de requisitos

| Requisito | Descripción (SRS) | Implementado en | Método de verificación | Estado |
|---|---|---|---|---|
| RF-01 | Login con email y contraseña | `backend/src/controllers/authController.js` (función `login`), `backend/src/routes/authRoutes.js` | `test-e2e.sh` bloque 1-3; prueba manual en navegador | ✅ |
| RF-02 | Contraseña encriptada | `backend/src/services/authService.js` (`hashPassword`) | Inspección de campo `passwordHash` en Mongo (nunca texto plano) | ✅ |
| RF-03 | Generación de JWT, expiración 8h | `backend/src/services/tokenService.js` | Payload decodificado del token (`exp - iat` = 8h) | ✅ |
| RF-04 | Middleware de verificación de token en rutas protegidas | `backend/src/middlewares/authMiddleware.js` | `test-e2e.sh` bloques 8-9 (401 sin token / token inválido) | ✅ |
| RF-05 | Control de acceso por rol (ADMIN, ODONTOLOGO, RECEPCIONISTA) | `backend/src/middlewares/roleMiddleware.js`, enum en `Usuario.js` | `test-e2e.sh` bloques 4-7 (200/403 según rol) | ✅ |
| RF-06 | Logout que invalida la sesión | `backend/src/models/TokenInvalidado.js`, función `logout` en `authController.js` | `test-e2e.sh` bloque 10 (401 tras logout con mismo token) | ✅ |
| RF-07 | Mostrar/ocultar contraseña en el login | `frontend/src/app/features/login/login.ts` (`togglePassword`) | Prueba manual en navegador | ✅ |
| RF-08 | Redirección a login si no hay sesión activa | `frontend/src/app/core/auth-guard.ts` | Prueba manual: acceso directo a `/dashboard` sin sesión | ✅ |
| RNF-01 | Hash de contraseña robusto | `SALT_ROUNDS = 12` en `authService.js` | Revisión de código | ✅ |
| RNF-03 | Rate limiting contra fuerza bruta en login | `backend/src/middlewares/rateLimiter.js` (5 intentos / 15 min) | `test-e2e.sh` bloque 11 (429 tras exceder el límite) | ✅ |
| RNF-06 | Registro de auditoría de accesos | `backend/src/models/LogAcceso.js` | Consulta `db.logaccesos.find()` en MongoDB | ✅ |
| RNF-16 | Arquitectura por capas | Estructura `routes/ controllers/ services/ models/ middlewares/ config/` | Estructura de carpetas del repo | ✅ |

---

## 2. Evidencia de pruebas

### 2.1 Pruebas automatizadas (backend)

Script: `backend/test-e2e.sh`

```
=== 1. Login ADMIN ===
Token ADMIN obtenido: eyJhbGciOiJIUzI1NiIs...
=== 2. Login ODONTOLOGO ===
Token ODONTOLOGO obtenido: eyJhbGciOiJIUzI1NiIs...
=== 3. Login RECEPCIONISTA ===
Token RECEPCIONISTA obtenido: eyJhbGciOiJIUzI1NiIs...
=== 4. ADMIN accede a /solo-admin (debe dar 200) ===
Status: 200
=== 5. ODONTOLOGO intenta /solo-admin (debe dar 403) ===
Status: 403
=== 6. RECEPCIONISTA intenta /solo-admin (debe dar 403) ===
Status: 403
=== 7. Los 3 roles pueden acceder a /perfil (deben dar 200) ===
ADMIN perfil: 200
ODONTOLOGO perfil: 200
RECEPCIONISTA perfil: 200
=== 8. Sin token (debe dar 401) ===
Status: 401
=== 9. Token inválido (debe dar 401) ===
Status: 401
=== 10. Logout ADMIN y reintento con el mismo token (debe dar 401) ===
Logout status: 200
Reintento tras logout: 401
=== 11. Rate limiting: intentos fallidos consecutivos ===
Intento 1: 401
Intento 2: 401
Intento 3: 429
Intento 4: 429
Intento 5: 429
Intento 6: 429
```

**Nota sobre el bloque 11:** el bloqueo apareció desde el intento 3 en vez del 6 porque la ventana de 15 minutos del rate limiter ya acumulaba intentos fallidos de pruebas anteriores en la misma sesión. El comportamiento es correcto: bloquea tras 5 intentos fallidos acumulados por IP.

### 2.2 Pruebas manuales (frontend)

| Caso de prueba | Resultado esperado | Resultado obtenido |
|---|---|---|
| Login con ADMIN válido | Redirige a `/dashboard` | ✅ |
| Login con ODONTOLOGO válido | Redirige a `/dashboard` | ✅ |
| Login con RECEPCIONISTA válido | Redirige a `/dashboard` | ✅ |
| Login con credenciales incorrectas | Muestra mensaje de error, no redirige | ✅ |
| Toggle mostrar/ocultar contraseña | Alterna entre `type=password` y `type=text` | ✅ |
| Envío de formulario vacío | Muestra validaciones por campo | ✅ |
| Acceso directo a `/dashboard` sin sesión | Redirige a `/login` (guard activo) | ✅ |
| Cerrar sesión desde el dashboard | Invalida token y redirige a `/login` | ✅ |

> Adjuntar aquí capturas de pantalla del navegador para cada caso, o el link a la carpeta de evidencias si las subes aparte.

---

## 3. Arquitectura del módulo

```
Cliente (Angular)                    Servidor (Express)                 Base de datos (MongoDB)
┌─────────────────┐                 ┌──────────────────────┐           ┌─────────────────┐
│  Login Component │──POST /login──▶│  authRoutes           │           │                 │
│                  │                │       │                │           │                 │
│  AuthService     │                │       ▼                │           │                 │
│  (localStorage)  │                │  authController        │──────────▶│  Usuario         │
│                  │                │   ├─ compararPassword   │           │  (roles, hash)   │
│  AuthGuard       │                │   ├─ generarToken       │           │                 │
│  (canActivate)   │                │   └─ registrarIntento   │──────────▶│  LogAcceso       │
│                  │                │                        │           │                 │
│  AuthInterceptor │◀──JWT + user───│  authMiddleware         │──────────▶│  TokenInvalidado │
│  (Bearer token)  │                │   ├─ verificarToken     │   (TTL)   │  (blacklist)     │
└─────────────────┘                │   └─ permitirRoles      │           └─────────────────┘
                                     └──────────────────────┘
```

*(Diagrama en texto plano; se recomienda rehacerlo en draw.io o similar para la sustentación final.)*

---

## 4. Decisiones técnicas y su justificación

| Decisión | Alternativa descartada | Motivo |
|---|---|---|
| Logout con lista negra de tokens en Mongo (TTL) | Logout solo del lado del cliente | Un sistema clínico con equipos compartidos en recepción necesita invalidación real, no solo borrar el token localmente |
| `bcrypt` con 12 rounds | 10 rounds (mínimo estándar) | Margen extra de seguridad sin impacto perceptible en tiempo de respuesta |
| Token JWT en `localStorage` | Cookies `httpOnly` | Simplicidad para el alcance académico del proyecto; documentado como limitación conocida (riesgo XSS) para posible mejora futura |
| Rate limiting de 5 intentos / 15 min | Sin límite / bloqueo permanente | Balance entre protección contra fuerza bruta y experiencia de usuario que se equivoca al escribir su contraseña |
| Middlewares de auth y rol separados | Un único middleware combinado | Permite reutilizar `verificarToken` en rutas que no requieren restricción de rol específico |

---

## 5. Bitácora de commits

```
$ git log --oneline feature/modulo1-autenticacion

<pegar aquí la salida real de tu git log una vez cerrado el módulo>
```

Convención usada: `tipo(RF-XX,RNF-XX): descripción breve`, por ejemplo:
```
feat(RF-01,RF-03): implementar endpoint de login con generación de JWT
feat(RF-06): implementar logout real con lista negra de tokens (TTL)
```

---

## 6. Pendientes / mejoras futuras identificadas

- [ ] Evaluar migración de `localStorage` a cookies `httpOnly` + CSRF token si el alcance del proyecto lo permite.
- [ ] Agregar pruebas unitarias automatizadas (Jest) en vez de solo el script `test-e2e.sh` manual.
- [ ] Documentar en el README los pasos de arranque en un Codespace nuevo (backend + frontend + Mongo).

---

## 7. Checklist de cierre de módulo

- [x] Todos los RF/RNF del módulo implementados
- [x] Pruebas ejecutadas y evidenciadas
- [x] Commits con trazabilidad al SRS
- [x] Pull Request creado hacia `main`
- [ ] Pull Request revisado y aprobado
- [ ] Merge a `main` realizado
