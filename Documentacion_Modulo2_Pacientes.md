# Documentación del Módulo 2 — Gestión de Pacientes

**Proyecto:** OdontoSoft
**Stack:** MEAN (MongoDB · Express · Angular · Node.js)
**Entorno de desarrollo:** GitHub Codespaces

---

## 0. Datos generales del módulo

| Campo | Valor |
|---|---|
| Módulo | 2 — Gestión de Pacientes |
| Rama de trabajo | `feature/modulo2-pacientes` |
| Requisitos cubiertos | RF-09 a RF-16 |
| Depende de | Módulo 1 (autenticación, roles, middlewares) |
| Responsable | Juan Carlos Garcés Sierra |
| Estado | ✅ Completado y probado end-to-end |

### Regla de negocio definida para este módulo

Según la **matriz de permisos por módulo** del SRS (sección 3.1):

| Acción | ADMIN | ODONTOLOGO | RECEPCIONISTA |
|---|:---:|:---:|:---:|
| Crear / editar / desactivar pacientes | ❌ (solo lectura) | ❌ (solo lectura) | ✅ CRUD |
| Listar / buscar / ver detalle | ✅ | ✅ | ✅ |

Esto es consistente con la nota de diseño del SRS sobre separación de funciones: el rol ADMIN controla la configuración del sistema y supervisa mediante reportes, pero no ejecuta las operaciones diarias — esas corresponden a RECEPCIONISTA (gestión de pacientes) y ODONTOLOGO (historia clínica).

> **Corrección aplicada:** la implementación inicial de este módulo otorgaba CRUD también a ADMIN, basada en una interpretación razonable pero incorrecta ante la ausencia inicial de revisión de la matriz de permisos del SRS. Se corrigió en la rama `fix/permisos-pacientes-admin-lectura`, restringiendo `permitirRoles('ADMIN', 'RECEPCIONISTA')` a `permitirRoles('RECEPCIONISTA')` en las rutas de creación, edición y desactivación.

---

## 1. Matriz de trazabilidad de requisitos

| Requisito | Descripción (SRS) | Implementado en | Método de verificación | Estado |
|---|---|---|---|---|
| RF-09 | Registro de nuevo paciente (solo RECEPCIONISTA) | `pacienteController.js` (`crear`), `pacienteService.js` (`crearPaciente`), `pacienteRoutes.js` (`permitirRoles('RECEPCIONISTA')`) | `test-e2e-pacientes.sh` bloques 2-3b; formulario `/pacientes/nuevo` | ✅ |
| RF-10 | Listado de pacientes con paginación | `pacienteService.js` (`listarPacientes`) | `test-e2e-pacientes.sh` bloque 5; componente `ListaPacientes` | ✅ |
| RF-11 | Búsqueda por nombre o documento | `pacienteService.js` (`buscarPacientes`), insensible a tildes | `test-e2e-pacientes.sh` bloque 6; buscador con debounce en frontend | ✅ |
| RF-12 | Ver detalle de un paciente | `pacienteController.js` (`obtenerDetalle`) | `test-e2e-pacientes.sh` bloques 7-8; componente `DetallePaciente` | ✅ |
| RF-13 | Editar datos de un paciente | `pacienteController.js` (`actualizar`) | `test-e2e-pacientes.sh` bloques 9-10; componente `FormPaciente` en modo edición | ✅ |
| RF-14 | Desactivar paciente (sin eliminación física) | `pacienteController.js` (`desactivar`), campo `estado` | `test-e2e-pacientes.sh` bloques 11-12; botón "Desactivar" en detalle | ✅ |
| RF-15 | Campos completos del paciente (datos personales y clínicos básicos) | Esquema `Paciente.js` | Revisión de modelo; formulario de registro con todos los campos | ✅ |
| RF-16 / RN-02 | No permitir documento duplicado | Índice único compuesto `{tipoDocumento, numeroDocumento}` en `Paciente.js` | `test-e2e-pacientes.sh` bloque 4 (409 en duplicado) | ✅ |

---

## 2. Evidencia de pruebas

### 2.1 Pruebas automatizadas (backend) — `backend/tests/test-e2e-pacientes.sh`

Resultado real de la ejecución final:

```
=== 0. Limpieza de datos de pruebas anteriores ===
Limpieza completada.
=== 1. Login RECEPCIONISTA, ODONTOLOGO, ADMIN ===
Tokens obtenidos.
=== 2. RECEPCIONISTA crea un paciente (debe dar 201) ===
201
ID creado: 6a5398b63f93560fb442109e
=== 3. ODONTOLOGO intenta crear paciente (debe dar 403) ===
Status: 403
=== 4. Crear paciente duplicado (debe dar 409) ===
Status: 409
=== 5. Listar pacientes (debe dar 200) ===
Status: 200
=== 6. Buscar por nombre parcial 'lau' (debe dar 200 con resultados) ===
1 resultado(s) encontrado(s)
=== 7. Ver detalle del paciente creado (debe dar 200) ===
Status: 200
=== 8. Ver detalle con ID inexistente (debe dar 404) ===
Status: 404
=== 9. Editar paciente (debe dar 200) ===
Status: 200
=== 10. ODONTOLOGO intenta editar (debe dar 403) ===
Status: 403
=== 11. Desactivar paciente (debe dar 200) ===
Status: 200
=== 12. Verificar que ya no aparece en el listado activo ===
OK: ya no aparece en el listado
```

**Resultado global: 12/12 pruebas con el comportamiento esperado.**

### 2.2 Pruebas puntuales adicionales durante el desarrollo

| Prueba | Resultado |
|---|---|
| Creación de paciente vía API con datos completos | ✅ 201, todos los campos correctos |
| Índice único rechaza documento duplicado a nivel de base de datos | ✅ `E11000 duplicate key error` |
| Búsqueda por nombre parcial sin tilde (`lopez`) | ✅ Encuentra a "Ana López" |
| Búsqueda por nombre con tilde vía URL-encoding (`l%C3%B3pez`) | ✅ Encuentra a "Ana López" |
| Búsqueda por número de documento parcial | ✅ Encuentra el paciente correspondiente |
| Edición no permite cambiar `estado` por esa vía | ✅ Campo ignorado, permanece `ACTIVO` |
| Detalle con ID mal formado | ✅ 400 "ID de paciente inválido" |
| Detalle con ID válido pero inexistente | ✅ 404 "Paciente no encontrado" |

### 2.3 Pruebas manuales (frontend)

| Caso de prueba | Resultado esperado | Verificado |
|---|---|---|
| Crear paciente desde `/pacientes/nuevo` | Redirige a `/pacientes`, aparece en la lista | ✅ |
| Editar paciente desde el detalle | Formulario precargado, cambios reflejados al guardar | ✅ |
| Buscar con y sin tilde | Ambos casos encuentran el resultado (gracias a `encodeURIComponent` automático de Angular) | ✅ |
| Paginación entre páginas del listado | Navega correctamente, botones se deshabilitan en los extremos | ✅ |
| Ver detalle con edad calculada | Muestra todos los campos y la edad derivada de la fecha de nacimiento | ✅ |
| Desactivar paciente desde el detalle | Pide confirmación, redirige a la lista sin ese paciente | ✅ |
| Acceso a ID inexistente desde el navegador | Muestra "Paciente no encontrado" sin romper la página | ✅ |
| Acceso a `/pacientes` sin sesión activa | El guard redirige a `/login` | ✅ |

---

## 3. Arquitectura del módulo

```
Cliente (Angular)                          Servidor (Express)                    Base de datos (MongoDB)
┌─────────────────────┐                   ┌──────────────────────────┐          ┌─────────────────┐
│  ListaPacientes        │──GET /pacientes──▶│  pacienteRoutes             │          │                 │
│  (paginación+buscador) │                   │   ├─ verificarToken          │          │                 │
│                       │                   │   └─ permitirRoles(según ruta)│          │                 │
│  FormPaciente          │──POST/PUT───────▶│                            │          │                 │
│  (crear/editar)        │                   │  pacienteController          │─────────▶│  Paciente        │
│                       │                   │   ├─ crear                  │          │  (índice único   │
│  DetallePaciente        │──GET/PATCH──────▶│   ├─ listar                 │          │   tipoDoc+numDoc)│
│  (ver, editar, desactivar)│                │   ├─ buscar                 │          │                 │
│                       │                   │   ├─ obtenerDetalle          │          │                 │
│  PacienteService        │                   │   ├─ actualizar             │          │                 │
│  (HttpClient, RxJS)     │                   │   └─ desactivar             │          │                 │
└─────────────────────┘                   └──────────────────────────┘          └─────────────────┘
        ▲
        │ (interceptor JWT del Módulo 1, reutilizado automáticamente)
```

**Flujo de búsqueda:** el input del buscador emite cambios a través de un `Subject` de RxJS con `debounceTime(400ms)` y `distinctUntilChanged()`, evitando disparar una petición HTTP en cada tecla presionada. La query se codifica automáticamente por Angular (`encodeURIComponent`), eliminando el problema de tildes que se observó al probar manualmente con `curl`.

---

## 4. Decisiones técnicas y su justificación

| Decisión | Alternativa descartada | Motivo |
|---|---|---|
| Índice único compuesto `{tipoDocumento, numeroDocumento}` | Índice único solo en `numeroDocumento` | Dos personas de tipos de documento distintos podrían compartir número (ej. CE vs CC); la combinación es lo que debe ser única |
| Búsqueda con regex construida manualmente (mapa de acentos) en vez de `$text` de MongoDB | Índice de texto nativo (`$text`) | `$text` tokeniza por palabras completas y no soporta coincidencias parciales de subcadena, necesarias para una búsqueda tipo autocompletar |
| `collation` descartado para la búsqueda | Usar `.collation({locale:'es', strength:1})` | El `collation` de MongoDB solo afecta comparaciones de igualdad/orden/`$text`, no tiene efecto sobre `$regex` — se comprobó en la práctica y se optó por normalizar tildes manualmente en el patrón regex |
| Endpoint de edición excluye explícitamente `estado`, `creadoPor`, `_id` del body recibido | Confiar en que el frontend nunca envíe esos campos | Evita que una petición de "editar datos" cambie el estado del paciente por una vía no destinada a eso; cada endpoint mantiene una sola responsabilidad |
| `PATCH /:id/desactivar` en vez de `DELETE /:id` | Eliminación física del registro | RF-14 exige preservar el historial; `DELETE` sería semánticamente engañoso ya que el registro permanece en la base con `estado: INACTIVO` |
| Un solo componente Angular (`FormPaciente`) para crear y editar | Dos componentes separados | Evita duplicar el formulario completo; la diferencia de comportamiento (POST vs PUT) se resuelve con un solo signal `modoEdicion()` |
| Edad calculada en el frontend a partir de `fechaNacimiento` | Almacenar la edad como campo en la base de datos | La edad es un dato derivado que cambia con el tiempo; almacenarla llevaría a datos desactualizados |
| `debounceTime(400ms)` en el buscador | Búsqueda en cada tecla presionada (sin debounce) | Evita saturar el backend con peticiones innecesarias mientras el usuario aún está escribiendo |

---

## 5. Bitácora de commits

```
test: agregar script end-to-end de pacientes con limpieza idempotente
feat(RF-12): implementar vista de detalle de paciente con desactivación
feat(RF-09,RF-13): implementar formulario de registro y edición de pacientes
feat(RF-10,RF-11): implementar listado de pacientes con paginación y buscador
feat: agregar PacienteService para consumir el CRUD de pacientes
chore: organizar scripts de pruebas end-to-end en carpeta tests/
feat(RF-14): implementar desactivación de paciente sin eliminación física
feat(RF-13): implementar edición de datos de paciente con control de rol
feat(RF-12): implementar consulta de detalle de paciente por ID
feat(RF-11): implementar búsqueda de pacientes por nombre, apellido o documento, insensible a tildes
feat(RF-10): implementar listado de pacientes con paginación
feat(RF-09,RF-16): implementar endpoint de creación de pacientes con control de rol
feat(RF-15,RF-16): agregar modelo Paciente con validación de documento único
```

*(Orden: del más reciente al más antiguo.)*

---

## 6. Problemas encontrados y soluciones

| # | Problema | Causa raíz | Solución |
|---|---|---|---|
| 1 | `ECONNREFUSED` al conectar a MongoDB al retomar el proyecto | El contenedor Docker de Mongo se detiene cuando el Codespace queda inactivo | Rutina de arranque: `docker compose up -d` antes de `npm run dev` en cada nueva sesión |
| 2 | Heredocs multilínea (`node -e "..."`) fallaban al pegarse en la terminal, mezclando líneas | Limitación de la terminal de Codespaces al pegar bloques largos | Usar comandos en una sola línea para pruebas de `curl`/`node -e`, y el editor visual de VS Code para archivos |
| 3 | `Cannot GET /api/pacientes` tras varias ediciones del archivo de rutas | La línea `router.get('/', verificarToken, listar)` se perdió entre ediciones manuales sucesivas | Revisión completa del archivo de rutas, restauración de la línea faltante |
| 4 | Búsqueda por "lopez" no encontraba a "López" | Comparación de texto sensible a tildes por defecto en JavaScript/MongoDB regex | Construcción de un patrón regex con clases de caracteres que aceptan vocal con y sin tilde |
| 5 | `.collation()` no resolvía el problema de tildes | El `collation` de MongoDB no tiene efecto sobre operadores `$regex` | Descartado; resuelto con la normalización manual del patrón (ver #4) |
| 6 | `curl` con tilde directa en la URL devolvía `400` | Codificación de caracteres especiales mal interpretada por la terminal al escribir la URL manualmente | Confirmado que no es un problema real de la aplicación: Angular codifica automáticamente vía `encodeURIComponent` en el navegador |
| 7 | Script de pruebas fallaba en la segunda ejecución (409 inesperado, cascada de errores) | El script no era idempotente: creaba un paciente con documento fijo que ya existía de una corrida anterior | Se agregó un bloque de limpieza (`db.pacientes.deleteMany(...)`) al inicio del script |
| 8 | `module.exports` duplicado dejaba funciones del servicio sin exportar | Al agregar nuevas funciones a `pacienteService.js`, se dejaba el `module.exports` anterior sin eliminar, y el último sobrescribía al primero | Revisión y consolidación en un único `module.exports` al final del archivo, con todas las funciones |
| 9 | ADMIN tenía permisos de CRUD sobre pacientes, contradiciendo el SRS | La política de roles se definió por inferencia razonable antes de revisar la matriz de permisos de la sección 3.1 del SRS, que especifica ADMIN con solo lectura | Corregido en `fix/permisos-pacientes-admin-lectura`: `permitirRoles('ADMIN', 'RECEPCIONISTA')` → `permitirRoles('RECEPCIONISTA')` en crear, editar y desactivar |

---

## 7. Pendientes / mejoras futuras identificadas

- [ ] Evaluar agregar validación de formato de teléfono y documento según el tipo (ej. longitud esperada por `tipoDocumento`).
- [ ] Considerar un endpoint de "reactivar" paciente, si el negocio lo requiere más adelante (actualmente solo existe desactivar).
- [ ] Evaluar si la búsqueda insensible a tildes debería extenderse también al campo `ciudad` o `eps`.
- [ ] Automatizar la limpieza de datos de prueba en todos los scripts `test-e2e-*.sh` desde su creación, no solo tras detectar el problema (lección aplicada retroactivamente en este módulo, aplicar desde el inicio en los siguientes).

---

## 8. Checklist de cierre de módulo

- [x] Todos los RF del módulo implementados (RF-09 a RF-16)
- [x] Pruebas automatizadas ejecutadas y evidenciadas (`test-e2e-pacientes.sh`, 12/12 exitosas)
- [x] Pruebas manuales de frontend verificadas
- [x] Commits con trazabilidad al SRS
- [x] Documentación del módulo completada
- [ ] Pull Request creado hacia `main`
- [ ] Pull Request revisado y aprobado
- [ ] Merge a `main` realizado

---

## 9. Estructura final de archivos del módulo

```
backend/
├── src/
│   ├── models/
│   │   └── Paciente.js
│   ├── services/
│   │   └── pacienteService.js
│   ├── controllers/
│   │   └── pacienteController.js
│   └── routes/
│       └── pacienteRoutes.js
└── tests/
    ├── test-e2e-auth.sh          (Módulo 1)
    └── test-e2e-pacientes.sh     (Módulo 2)

frontend/
└── src/app/
    ├── core/
    │   └── paciente.ts (PacienteService)
    └── features/
        └── pacientes/
            ├── lista-pacientes/
            │   ├── lista-pacientes.ts
            │   ├── lista-pacientes.html
            │   └── lista-pacientes.scss
            ├── form-paciente/
            │   ├── form-paciente.ts
            │   ├── form-paciente.html
            │   └── form-paciente.scss
            └── detalle-paciente/
                ├── detalle-paciente.ts
                ├── detalle-paciente.html
                └── detalle-paciente.scss
```

---

**Estado final del módulo:** ✅ Completado, probado end-to-end y documentado. Listo para revisión y merge a `main`.
