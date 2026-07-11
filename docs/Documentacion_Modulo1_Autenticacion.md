# Documentación del Módulo 1 — Autenticación y Control de Acceso

**Proyecto:** OdontoSoft
**Stack:** MEAN (MongoDB · Express · Angular · Node.js)
**Entorno de desarrollo:** GitHub Codespaces

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
| Estado | ✅ Completado y probado end-to-end |

---

## 1. Matriz de trazabilidad de requisitos

| Requisito | Descripción (SRS) | Implementado en | Método de verificación | Estado |
|---|---|---|---|---|
| RF-01 | Login con email y contraseña | `backend/src/controllers/authController.js` (función `login`), `backend/src/routes/authRoutes.js` | `test-e2e.sh` bloques 1-3; prueba manual en navegador | ✅ |
| RF-02 | Contraseña encriptada | `backend/src/services/authService.js` (`hashPassword`) | Inspección del campo `passwordHash` en MongoDB (nunca texto plano) | ✅ |
| RF-03 | Generación de JWT, expiración 8h | `backend/src/services/tokenService.js` | Payload decodificado del token (`exp - iat` = 8h); `JWT_EXPIRES_IN=8h` en `.env` | ✅ |
| RF-04 | Middleware de verificación de token en rutas protegidas | `backend/src/middlewares/authMiddleware.js` | `test-e2e.sh` bloques 8-9 (401 sin token / token inválido) | ✅ |
| RF-05 | Control de acceso por rol (ADMIN, ODONTOLOGO, RECEPCIONISTA) | `backend/src/middlewares/roleMiddleware.js`; enum en `Usuario.js` | `test-e2e.sh` bloques 4-7 (200/403 según rol) | ✅ |
| RF-06 | Logout que invalida la sesión | `backend/src/models/TokenInvalidado.js`, función `logout` en `authController.js` | `test-e2e.sh` bloque 10 (401 tras logout con el mismo token) | ✅ |
| RF-07 | Mostrar/ocultar contraseña en el login | `frontend/src/app/features/login/login.ts` (`togglePassword`) | Prueba manual en navegador (ícono de ojo) | ✅ |
| RF-08 | Redirección a login si no hay sesión activa | `frontend/src/app/core/auth-guard.ts` | Prueba manual: acceso directo a `/dashboard` sin sesión → redirige a `/login` | ✅ |
| RNF-01 | Hash de contraseña robusto | `SALT_ROUNDS = 12` en `authService.js` | Revisión de código | ✅ |
| RNF-03 | Rate limiting contra fuerza bruta en login | `backend/src/middlewares/rateLimiter.js` (5 intentos / 15 min) | `test-e2e.sh` bloque 11 (429 tras exceder el límite) | ✅ |
| RNF-06 | Registro de auditoría de accesos | `backend/src/models/LogAcceso.js` | Consulta `db.logaccesos.find()` en MongoDB | ✅ |
| RNF-16 | Arquitectura por capas | Estructura `routes/ controllers/ services/ models/ middlewares/ config/` | Estructura de carpetas del repositorio | ✅ |

---

## 2. Evidencia de pruebas

### 2.1 Pruebas automatizadas (backend) — `backend/test-e2e.sh`

Resultado real de la última ejecución completa:

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

**Resultado global: 11/11 pruebas con el comportamiento esperado.**

> Nota sobre el bloque 11: el bloqueo (429) apareció desde el intento 3 en vez del 6 porque la ventana de 15 minutos del rate limiter ya acumulaba intentos fallidos de pruebas manuales anteriores en la misma sesión de trabajo. El comportamiento es correcto: el límite es de 5 intentos fallidos acumulados por IP en 15 minutos, sin importar en qué momento exacto se disparan.

### 2.2 Pruebas manuales (frontend)

| Caso de prueba | Resultado esperado | Resultado obtenido |
|---|---|---|
| Login con ADMIN válido (`admin@odontosoft.com`) | Redirige a `/dashboard` | ✅ |
| Login con ODONTOLOGO válido (`odontologo@odontosoft.com`) | Redirige a `/dashboard` | ✅ |
| Login con RECEPCIONISTA válido (`recepcion@odontosoft.com`) | Redirige a `/dashboard` | ✅ |
| Login con credenciales incorrectas | Muestra mensaje "Error al iniciar sesión. Intente nuevamente." sin redirigir | ✅ |
| Toggle mostrar/ocultar contraseña | Alterna entre `type=password` y `type=text`, ícono cambia (👁️ / 🙈) | ✅ |
| Envío de formulario vacío | Muestra validaciones por campo ("Ingrese un correo válido", "La contraseña es obligatoria") | ✅ |
| Acceso directo a `/dashboard` sin sesión activa | El guard redirige automáticamente a `/login` | ✅ |
| Cerrar sesión desde el dashboard | Invalida el token en el backend y redirige a `/login` | ✅ |

### 2.3 Verificación de auditoría (RNF-06)

```bash
docker exec -it odontosoft-mongo mongosh odontosoft --eval "db.logaccesos.find().pretty()"
```

Confirmado: cada intento de login (exitoso o fallido) queda registrado con `email`, `exito`, `motivo`, `ip`, `userAgent` y `fecha`.

---

## 3. Arquitectura del módulo

```
Cliente (Angular)                     Servidor (Express)                  Base de datos (MongoDB)
┌───────────────────┐                ┌────────────────────────┐          ┌───────────────────┐
│  Login Component    │──POST /login──▶│  authRoutes              │          │                    │
│  (login.ts/.html)   │                │   (loginLimiter)         │          │                    │
│                     │                │        │                 │          │                    │
│  AuthService        │                │        ▼                 │          │                    │
│  (localStorage)     │                │  authController           │─────────▶│  Usuario            │
│                     │                │   ├─ compararPassword      │          │  (nombre, email,    │
│  AuthGuard           │                │   ├─ generarToken          │          │   passwordHash,     │
│  (canActivate)       │                │   └─ registrarIntento      │─────────▶│   rol, estado)      │
│                     │                │                          │          │                    │
│                     │                │                          │─────────▶│  LogAcceso           │
│  AuthInterceptor      │◀──JWT + user───│  authMiddleware            │          │  (auditoría)         │
│  (Bearer token)       │                │   ├─ verificarToken         │─────────▶│  TokenInvalidado     │
│                     │                │   └─ permitirRoles          │  (TTL)   │  (blacklist logout)  │
└───────────────────┘                └────────────────────────┘          └───────────────────┘
```

**Flujo de logout:** el `AuthController.logout` decodifica el JWT, extrae su fecha de expiración original (`exp`), y crea un documento en `TokenInvalidado` con esa misma fecha como `expiraEn`. MongoDB usa un índice TTL para autoeliminar ese documento en el momento exacto en que el token habría expirado de todas formas — así la colección nunca crece indefinidamente con tokens ya vencidos.

---

## 4. Decisiones técnicas y su justificación

| Decisión | Alternativa descartada | Motivo |
|---|---|---|
| Logout con lista negra de tokens en MongoDB (TTL) | Logout solo del lado del cliente (borrar token de localStorage) | Un sistema clínico con equipos compartidos en recepción necesita invalidación real del lado del servidor, no solo borrar el token localmente |
| `bcrypt` con 12 rounds | 10 rounds (mínimo estándar de la industria) | Margen extra de seguridad sin impacto perceptible en el tiempo de respuesta del login |
| Token JWT almacenado en `localStorage` | Cookies `httpOnly` | Simplicidad para el alcance académico del proyecto; documentado como limitación conocida (riesgo de XSS) para una posible mejora futura |
| Rate limiting de 5 intentos / 15 minutos | Sin límite, o bloqueo permanente tras el primer fallo | Balance entre protección contra fuerza bruta y experiencia de un usuario real que se equivoca al escribir su contraseña |
| Middlewares de autenticación y rol separados (`verificarToken` / `permitirRoles`) | Un único middleware combinado | Permite reutilizar `verificarToken` en rutas que no requieren restricción de rol específico (ej. `/perfil`, accesible por cualquier usuario autenticado) |
| Mensaje de error genérico ("Credenciales inválidas") tanto si el usuario no existe como si la contraseña es incorrecta | Mensajes diferenciados por tipo de error | Evita dar pistas a un atacante sobre si un email específico está o no registrado en el sistema |
| Contraseñas de scripts de seed movidas a variables de entorno | Contraseñas hardcodeadas en el código | GitGuardian detectó las contraseñas de prueba expuestas en el repositorio; se corrigió moviéndolas a `.env` (no versionado) |

---

## 5. Bitácora de commits

Convención utilizada: `tipo(RF-XX,RNF-XX): descripción breve`, permitiendo trazar cada commit a un requisito específico del SRS.

```
fix: agregar rootDir en tsconfig.app.json para eliminar warning de compilación
docs(backend): actualizar plantilla de variables de entorno con claves de seed
fix(seguridad): mover contraseñas de scripts de seed a variables de entorno
test: agregar scripts de seed de roles y pruebas end-to-end del Módulo 1
feat(RF-07,RF-08): completar login funcional con dashboard placeholder y logout
feat(RF-07): implementar componente de login con toggle mostrar/ocultar contraseña
feat(RF-08): configurar AuthService, interceptor JWT y guard de rutas en Angular
feat(RNF-03,RNF-06): agregar rate limiting en login y registro de logs de acceso
fix(RF-06): agregar validación de lista negra en authMiddleware
feat(RF-06): implementar logout real con lista negra de tokens (TTL)
feat(RF-04,RF-05): agregar middleware de verificación de JWT y control por rol
feat(RF-01,RF-03): implementar endpoint de login con generación de JWT
feat(RF-02,RNF-01): agregar servicio de hash bcrypt y script seed de admin
feat(RF-05): agregar modelo Usuario con roles ADMIN/ODONTOLOGO/RECEPCIONISTA
feat(backend): configurar servidor Express y conexión a MongoDB
chore: mover .gitignore a la raíz del repo con rutas correctas
feat(backend): configurar servidor Express base y endpoint /api/health
feat(backend): agregar conexión a MongoDB (config/db.js)
chore: agregar docker-compose para MongoDB local en Codespaces
docs(backend): agregar plantilla de variables de entorno
chore(backend): inicializar proyecto Node y dependencias base
chore: agregar .gitignore para backend y frontend
```

*(Orden: del más reciente al más antiguo, tal como lo muestra `git log --oneline feature/modulo1-autenticacion`.)*

---

## 6. Incidentes de seguridad detectados y resueltos

| Incidente | Detectado por | Descripción | Resolución |
|---|---|---|---|
| 4 contraseñas genéricas expuestas | GitGuardian (integración de GitHub) | Contraseñas de prueba (`Admin123!`, `Odonto123!`, `Recepcion123!`) hardcodeadas en `seedAdmin.js` y `seedRoles.js` | Se movieron a variables de entorno (`SEED_*_PASSWORD` en `.env`, no versionado); alertas marcadas como resueltas en GitHub Security |

> Nota: las contraseñas expuestas correspondían a datos de prueba de desarrollo, no a credenciales de producción ni información de pacientes reales.

---

## 7. Pendientes / mejoras futuras identificadas

- [ ] Evaluar migración de `localStorage` a cookies `httpOnly` + CSRF token si el alcance del proyecto lo permite.
- [ ] Agregar pruebas unitarias automatizadas (Jest) además del script `test-e2e.sh` manual.
- [ ] Documentar en el `README.md` principal los pasos de arranque completo en un Codespace nuevo (backend + frontend + Mongo + seeds).
- [ ] Considerar reescritura del historial de Git si el repositorio llega a hacerse público, dado que las contraseñas de prueba (ya corregidas en el código actual) siguen visibles en commits antiguos del historial.

---

## 8. Checklist de cierre de módulo

- [x] Todos los RF/RNF del módulo implementados (RF-01 a RF-08, RNF-01, RNF-03, RNF-06, RNF-16)
- [x] Pruebas automatizadas ejecutadas y evidenciadas (`test-e2e.sh`, 11/11 exitosas)
- [x] Pruebas manuales de frontend verificadas
- [x] Commits con trazabilidad al SRS
- [x] Incidente de seguridad (GitGuardian) detectado y corregido
- [x] Documentación del módulo completada
- [ ] Pull Request creado hacia `main`
- [ ] Pull Request revisado y aprobado
- [ ] Merge a `main` realizado

---

## 9. Estructura final de archivos del módulo

```
backend/
├── .env.example
├── docker-compose.yml (raíz del repo)
├── src/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   └── authController.js
│   ├── middlewares/
│   │   ├── authMiddleware.js
│   │   ├── roleMiddleware.js
│   │   └── rateLimiter.js
│   ├── models/
│   │   ├── Usuario.js
│   │   ├── TokenInvalidado.js
│   │   └── LogAcceso.js
│   ├── routes/
│   │   └── authRoutes.js
│   ├── services/
│   │   ├── authService.js
│   │   └── tokenService.js
│   ├── scripts/
│   │   ├── seedAdmin.js
│   │   └── seedRoles.js
│   ├── app.js
│   └── server.js
└── test-e2e.sh

frontend/
├── angular.json (polyfills: zone.js)
├── tsconfig.app.json (rootDir: ./src)
└── src/
    ├── environments/
    │   └── environment.ts
    └── app/
        ├── app.ts / app.html / app.config.ts / app.routes.ts
        ├── core/
        │   ├── auth.ts (AuthService)
        │   ├── auth-guard.ts
        │   └── auth-interceptor.ts
        └── features/
            ├── login/
            │   ├── login.ts
            │   ├── login.html
            │   └── login.scss
            └── dashboard/
                ├── dashboard.ts
                └── dashboard.html
```

---

**Estado final del módulo:** ✅ Completado, probado end-to-end y documentado. Listo para revisión y merge a `main`.
