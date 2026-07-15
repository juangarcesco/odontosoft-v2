# Documentación del Módulo 3 — Citas y Agenda

**Proyecto:** OdontoSoft
**Stack:** MEAN (MongoDB · Express · Angular · Node.js)
**Entorno de desarrollo:** GitHub Codespaces

---

## 0. Datos generales del módulo

| Campo | Valor |
|---|---|
| Módulo | 3 — Citas y Agenda |
| Rama de trabajo | `feature/modulo3-citas` |
| Requisitos cubiertos | RF-17 a RF-24 |
| Depende de | Módulo 1 (autenticación, roles), Módulo 2 (pacientes) |
| Responsable | Juan Carlos Garcés Sierra |
| Estado | ✅ Completado y probado end-to-end |

### Permisos de este módulo (matriz del SRS, sección 3.1)

| Acción | ADMIN | ODONTOLOGO | RECEPCIONISTA |
|---|:---:|:---:|:---:|
| Crear / editar / cancelar citas | ❌ (solo lectura) | ❌ (solo lectura) | ✅ CRUD |
| Cambiar estado de la cita | ❌ | ✅ | ✅ |
| Ver agenda | ✅ | ✅ | ✅ |

### Reglas de negocio aplicadas

- **RN-01**: no se puede crear una cita si el horario se cruza con otra ya Programada o Confirmada del mismo odontólogo.
- **RN-07**: un paciente con `estado: INACTIVO` no puede ser agendado.

### Decisión de diseño: referencia explícita al odontólogo

Aunque el SRS establece que el consultorio tiene un solo odontólogo principal, el modelo `Cita` referencia al odontólogo como `ObjectId` de `Usuario` (no como valor fijo/implícito). Esto deja el sistema preparado para escalar a más de un odontólogo sin requerir cambios estructurales, a costo de complejidad adicional mínima.

---

## 1. Matriz de trazabilidad de requisitos

| Requisito | Descripción (SRS) | Implementado en | Método de verificación | Estado |
|---|---|---|---|---|
| RF-17 | Agenda visual por día/semana/mes | `citaService.js` (`listarCitasPorRango`), componente `Agenda` (Angular) | `test-e2e-citas.sh` bloque 6; navegación manual entre vistas | ✅ |
| RF-18 | Crear cita asignada a un paciente | `citaService.js` (`crearCita`) | `test-e2e-citas.sh` bloque 3; formulario `/citas/nueva` | ✅ |
| RF-19 | Duración de la cita (30, 45, 60 min) | Enum en modelo `Cita.js`, `<select>` en `FormCita` | Revisión de modelo y formulario | ✅ |
| RF-20 | Motivo/tipo de cita | Campo `motivo` en modelo `Cita.js` | Formulario de creación/edición | ✅ |
| RF-21 | Control de conflictos de horario | `citaService.js` (`existeConflictoHorario`), RN-01 | `test-e2e-citas.sh` bloque 5 (409 en conflicto) | ✅ |
| RF-22 | Cambiar estado de la cita (6 estados) | `citaService.js` (`cambiarEstadoCita`), `<select>` en `Agenda` | `test-e2e-citas.sh` bloques 7-8 | ✅ |
| RF-23 | Editar y cancelar citas | `citaService.js` (`editarCita`, `cancelarCita`) | `test-e2e-citas.sh` bloques 9-12 | ✅ |
| RF-24 | Citas del día en el Dashboard | `citaService.js` (`obtenerCitasDeHoy`), widget en `Dashboard` | `test-e2e-citas.sh` bloque 13; widget visual | ✅ |

---

## 2. Evidencia de pruebas

### 2.1 Pruebas automatizadas (backend) — `backend/tests/test-e2e-citas.sh`

Resultado real de la ejecución final (posterior a la finalización del frontend completo):

```
=== 0. Limpieza de datos de pruebas anteriores ===
Limpieza completada.
=== 1. Login RECEPCIONISTA, ODONTOLOGO, ADMIN ===
Tokens obtenidos.
=== 2. Obtener IDs de paciente activo y odontologo ===
Paciente: 6a52ace7736b50e45c2dbc3c / Odontologo: 6a51996301caa385b1b7c374
=== 3. RECEPCIONISTA crea cita (debe dar 201) ===
Cita creada exitosamente
=== 4. ODONTOLOGO intenta crear cita (debe dar 403) ===
Status: 403
=== 5. Crear cita con conflicto de horario (debe dar 409) ===
Status: 409
=== 6. Listar citas por rango (debe dar 200) ===
Status: 200
=== 7. ODONTOLOGO cambia estado a CONFIRMADA (debe dar 200) ===
Status: 200
=== 8. ADMIN intenta cambiar estado (debe dar 403) ===
Status: 403
=== 9. RECEPCIONISTA edita motivo de la cita (debe dar 200) ===
Status: 200
=== 10. ODONTOLOGO intenta editar (debe dar 403) ===
Status: 403
=== 11. RECEPCIONISTA cancela la cita (debe dar 200) ===
Status: 200
=== 12. Crear cita nueva en el horario liberado (debe dar 201) ===
Status: 201
=== 13. Endpoint citas de hoy responde (debe dar 200) ===
Status: 200
```

**Resultado global: 13/13 pruebas con el comportamiento esperado**, verificado en dos ejecuciones independientes (una tras completar el backend, otra tras completar el frontend), confirmando estabilidad del backend ante cambios posteriores.

### 2.2 Pruebas puntuales adicionales durante el desarrollo

| Prueba | Resultado |
|---|---|
| Crear cita 10:00-10:30, luego intentar 10:15-10:45 (mismo odontólogo) | ✅ 409, conflicto detectado |
| Crear cita 11:00 el mismo día (sin solapamiento real) | ✅ 201, sin conflicto |
| Cancelar una cita y crear una nueva en el mismo horario liberado | ✅ 201, confirma que citas `CANCELADA` no bloquean el horario |
| Editar solo el `motivo` sin tocar horario | ✅ 200, no revalida conflicto innecesariamente |
| Editar la `hora` a un horario en conflicto (excluyendo la propia cita) | ✅ 409, revalidación de conflicto en edición funciona correctamente |
| Endpoint de detalle de cita (`GET /:id`) con populate de paciente/odontólogo | ✅ 200, datos poblados correctamente |
| Endpoint de listado de odontólogos activos | ✅ 200, devuelve solo usuarios con `rol: ODONTOLOGO` y `estado: ACTIVO` |

### 2.3 Pruebas manuales (frontend)

| Caso de prueba | Resultado esperado | Verificado |
|---|---|---|
| Crear cita desde `/citas/nueva`, con buscador de paciente | Redirige a `/citas`, aparece en la agenda | ✅ |
| Crear cita en horario ocupado | Muestra mensaje de conflicto (409) sin romper la página | ✅ |
| Navegación Día/Semana/Mes en la agenda | Cambia de vista, recarga citas del rango correcto | ✅ |
| Botones Anterior/Siguiente/Hoy | Navegan correctamente por fechas | ✅ |
| ODONTOLOGO cambia estado desde `<select>` en la agenda | Se actualiza sin recargar toda la página | ✅ |
| ADMIN ve la agenda | Solo ve badges de estado, sin controles interactivos | ✅ |
| RECEPCIONISTA edita/cancela cita desde la agenda | Formulario precargado; cancelación pide confirmación | ✅ |
| Widget "Citas de hoy" en el dashboard | Muestra citas fechadas para el día actual | ✅ |
| Clic en cita del widget del dashboard | Lleva al formulario de edición | ✅ |

---

## 3. Arquitectura del módulo

```
Cliente (Angular)                             Servidor (Express)                        Base de datos (MongoDB)
┌───────────────────────┐                    ┌──────────────────────────────┐          ┌─────────────────┐
│  Agenda                  │──GET /citas────────▶│  citaRoutes                    │          │                 │
│  (día/semana/mes)         │                    │   ├─ verificarToken             │          │                 │
│                          │──PATCH estado──────▶│   └─ permitirRoles(según ruta)   │          │                 │
│  FormCita                 │──POST/PUT──────────▶│                                │          │                 │
│  (crear/editar)           │                    │  citaController                 │─────────▶│  Cita            │
│                          │                    │   ├─ crear                     │          │  (índice         │
│  Dashboard (widget)       │──GET /citas/hoy────▶│   ├─ listar                    │          │   odontologo+    │
│                          │                    │   ├─ cambiarEstado              │          │   fecha)         │
│  CitaService              │                    │   ├─ editar                    │          │                 │
│  UsuarioService            │──GET odontologos───▶│   ├─ cancelar                  │          │                 │
│  (HttpClient, RxJS)        │                    │   ├─ citasDeHoy                 │          │                 │
└───────────────────────┘                    │   └─ obtenerDetalle              │          │                 │
                                              └──────────────────────────────┘          └─────────────────┘
        ▲
        │ (interceptor JWT del Módulo 1, reutilizado automáticamente)
        │ (PacienteService del Módulo 2, reutilizado para el buscador del formulario)
```

**Flujo de detección de conflicto de horario (RN-01):** al crear o editar una cita, `existeConflictoHorario` consulta todas las citas del mismo odontólogo en el mismo día con estado `PROGRAMADA` o `CONFIRMADA`, convierte las horas a minutos desde medianoche, y aplica la fórmula estándar de solapamiento de intervalos: `inicioNueva < finExistente && inicioExistente < finNueva`. En edición, la cita propia se excluye de la comparación mediante el parámetro `citaIdExcluir`.

---

## 4. Decisiones técnicas y su justificación

| Decisión | Alternativa descartada | Motivo |
|---|---|---|
| `odontologo` como referencia explícita a `Usuario` | Campo fijo/implícito (solo hay un odontólogo) | Deja el modelo preparado para escalar a más de un odontólogo sin reescritura estructural |
| `fecha` (Date) + `hora` (String "HH:mm") separados | Un solo campo `DateTime` combinado | Simplifica la agrupación por día para la agenda visual y evita complejidad de zonas horarias en cada consulta |
| Verificación de conflicto con fórmula de solapamiento de intervalos | Comparar solo igualdad de hora de inicio | La fórmula `inicioNueva < finExistente && inicioExistente < finNueva` detecta cualquier tipo de solapamiento (parcial, total, contenido) sin casos especiales |
| Reutilizar `listarCitasPorRango` para `obtenerCitasDeHoy` | Escribir una consulta nueva específica para "hoy" | Evita duplicar lógica de consulta (populate, ordenamiento) que tendría que mantenerse en dos lugares |
| Endpoint de cancelación separado (`PATCH /:id/cancelar`) además de `cambiarEstado` | Usar únicamente `cambiarEstado` para cancelar | Semánticamente más claro en las rutas, y permite service que las citas `CANCELADA` liberan el horario en `existeConflictoHorario` sin ambigüedad |
| Revalidar conflicto de horario en edición solo si cambia fecha/hora/duración/odontólogo | Revalidar en cada edición, sin importar qué campo cambie | Evita consultas innecesarias a la base de datos cuando solo se edita el `motivo` u otro campo no relacionado al horario |
| Sin librería de calendario externa (agenda construida con HTML/CSS agrupado por día) | Integrar FullCalendar u otra librería de calendario | Mantiene el proyecto simple y sin dependencias adicionales, suficiente para el alcance académico |
| `nombrePaciente`/`nombreOdontologo`/`claseEstado` duplicadas en `Agenda` y `Dashboard` | Extraer a una función utilitaria compartida | Duplicación menor aceptada por simplicidad en el alcance actual; anotada como mejora futura |

---

## 5. Bitácora de commits

```
test: confirmar 13/13 pruebas end-to-end del Módulo 3 tras completar el frontend
feat(RF-24): implementar widget de citas del día en el dashboard
feat(RF-22): implementar cambio de estado y cancelación de citas desde la agenda, respetando roles
feat(RF-18,RF-19,RF-20,RF-23): implementar formulario de creación y edición de citas
feat: agregar endpoint de detalle de cita y listado de odontólogos disponibles
feat(RF-17): implementar vista de agenda con navegación día/semana/mes
feat: agregar CitaService para consumir el CRUD de citas y agenda
test: agregar script end-to-end de citas con limpieza idempotente
feat(RF-24): implementar endpoint de citas del día para el dashboard
feat(RF-23): implementar cancelación de cita, liberando el horario para nuevas reservas
feat(RF-23): implementar edición de cita con revalidación de conflicto de horario
feat(RF-22): implementar cambio de estado de cita, accesible a RECEPCIONISTA y ODONTOLOGO
feat(RF-17): implementar listado de citas por rango de fechas para la agenda
feat(RF-18,RN-01,RN-07): implementar creación de cita con validación de conflicto de horario y paciente activo
feat(RF-18,RF-19,RF-20,RF-22): agregar modelo Cita con estados y validación de duración
```

*(Orden: del más reciente al más antiguo.)*

---

## 6. Problemas encontrados y soluciones

| # | Problema | Causa raíz | Solución |
|---|---|---|---|
| 1 | `ReferenceError: express is not defined` en `citaRoutes.js`, en más de una ocasión | Al reemplazar el archivo de rutas completo durante ediciones sucesivas, se perdía la línea `const express = require('express')` al inicio | Verificación explícita con `head -3`/`cat` antes de asumir que el archivo quedó completo; recomendación de usar `Ctrl+A` + reemplazo total en el editor en vez de ediciones parciales repetidas |
| 2 | `ReferenceError: verificarToken is not defined` | Mismo patrón que el problema 1, pero con los imports de middlewares | Reescritura completa y verificada del archivo de rutas |
| 3 | Pruebas con `curl` mostraban texto cortado o "Unexpected end of JSON input" en las capturas de terminal | Las capturas de pantalla truncaban líneas largas de JSON; en otros casos, el backend efectivamente había crasheado y no había respuesta real | Formatear la respuesta con `node -e "...JSON.stringify(JSON.parse(d), null, 2)..."` para forzar múltiples líneas cortas; verificar siempre `$TOKEN_*` con `echo` antes de asumir que una petición falló por otra causa |
| 4 | Variables de shell (`$TOKEN_RECEP`, etc.) aparentemente "perdidas" entre comandos | Las variables de entorno de shell no persisten entre pestañas de terminal distintas en Codespaces | Volver a ejecutar el login en la terminal activa antes de cada batería de pruebas nueva |
| 5 | Faltaban 2 endpoints no contemplados en el roadmap original (detalle de cita, listado de odontólogos) | El roadmap inicial no anticipó que el formulario de edición y el selector de odontólogo del frontend necesitarían esos endpoints | Se agregaron como ajuste dentro del Paso 11, con su propia prueba y commit |
| 6 | Ruta `citas/:id/editar` inicialmente escrita fuera del arreglo `routes` (objeto suelto tras el `];` de cierre) | Error de edición manual al agregar una nueva ruta al archivo `app.routes.ts` | Corregido moviendo el objeto dentro del arreglo, antes del cierre `];` |

---

## 7. Pendientes / mejoras futuras identificadas

- [ ] Extraer `nombrePaciente`, `nombreOdontologo` y `claseEstado` a una función utilitaria compartida entre `Agenda` y `Dashboard`, en vez de duplicarlas.
- [ ] Evaluar una vista de calendario más visual (tipo grilla horaria) si el tiempo del proyecto lo permite, en vez de la lista agrupada por día actual.
- [ ] Preparar el modelo `Cita` para el Módulo 7 (Recordatorios), que requiere identificar citas en `PROGRAMADA`/`CONFIRMADA` a 24 horas de su fecha (RN-08).
- [ ] Considerar agregar un endpoint de "citas por paciente" para mostrar el historial de citas dentro del detalle de un paciente (Módulo 2), si el negocio lo requiere.

---

## 8. Checklist de cierre de módulo

- [x] Todos los RF del módulo implementados (RF-17 a RF-24)
- [x] Reglas de negocio aplicadas (RN-01, RN-07)
- [x] Pruebas automatizadas ejecutadas y evidenciadas (`test-e2e-citas.sh`, 13/13 exitosas, verificado dos veces)
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
│   │   └── Cita.js
│   ├── services/
│   │   ├── citaService.js
│   │   └── usuarioService.js
│   ├── controllers/
│   │   ├── citaController.js
│   │   └── usuarioController.js
│   └── routes/
│       ├── citaRoutes.js
│       └── usuarioRoutes.js
└── tests/
    ├── test-e2e-auth.sh          (Módulo 1)
    ├── test-e2e-pacientes.sh     (Módulo 2)
    └── test-e2e-citas.sh         (Módulo 3)

frontend/
└── src/app/
    ├── core/
    │   ├── cita.ts (CitaService)
    │   └── usuario.ts (UsuarioService)
    └── features/
        ├── dashboard/
        │   ├── dashboard.ts (widget citas de hoy)
        │   ├── dashboard.html
        │   └── dashboard.scss
        └── citas/
            ├── agenda/
            │   ├── agenda.ts
            │   ├── agenda.html
            │   └── agenda.scss
            └── form-cita/
                ├── form-cita.ts
                ├── form-cita.html
                └── form-cita.scss
```

---

**Estado final del módulo:** ✅ Completado, probado end-to-end (backend y frontend) y documentado. Listo para revisión y merge a `main`.
