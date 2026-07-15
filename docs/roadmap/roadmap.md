# Roadmap Maestro — OdontoSoft

Registro de avance de todos los módulos del SRS. Se actualiza a medida que se cierra cada módulo.

**Convenciones de estado:** ✅ Completado y mergeado a `main` · 🔵 En progreso · ⏳ Pendiente

---

## Resumen general

| # | Módulo | Requisitos | Prioridad SRS | Estado |
|---|---|---|---|---|
| 1 | Autenticación y Control de Acceso | RF-01 a RF-08 | Must have | ✅ |
| 2 | Gestión de Pacientes | RF-09 a RF-16 | Must have | ✅ |
| 3 | Citas y Agenda | RF-17 a RF-24 | Must have | ✅ |
| 4 | Historia Clínica y Odontograma | RF-25 a RF-32 | Must have | 🔵 |
| 5 | Facturación y Pagos | RF-33 a RF-40 | Must have | ⏳ |
| 6 | Inventario de Materiales | RF-41 a RF-45 | Must/Should/Could | ⏳ |
| 7 | Recordatorios Automáticos | RF-46 a RF-49 | Should/Could | ⏳ |
| 8 | Reportes y Estadísticas | RF-50 a RF-55 | Must/Should/Could | ⏳ |
| 9 | Integración con RIPS | RF-56 a RF-59 | Must/Should | ⏳ |

---

## Módulo 1 — Autenticación y Control de Acceso ✅

**Rama:** `feature/modulo1-autenticacion` (mergeada)
**Requisitos:** RF-01 a RF-08, RNF-01, RNF-03, RNF-06, RNF-16
**Documentación:** `docs/Documentacion_Modulo1_Autenticacion.md`

- Login con JWT (expiración 8h), bcrypt (12 rounds)
- Middleware de verificación de token + control de acceso por rol
- Logout con lista negra de tokens (TTL)
- Rate limiting (5 intentos/15 min) y logging de auditoría
- Frontend: login con mostrar/ocultar contraseña, guard de rutas, interceptor JWT

---

## Módulo 2 — Gestión de Pacientes ✅

**Rama:** `feature/modulo2-pacientes` (mergeada) + `fix/permisos-pacientes-admin-lectura` (mergeada)
**Requisitos:** RF-09 a RF-16
**Documentación:** `docs/Documentacion_Modulo2_Pacientes.md`

- CRUD completo de pacientes con validación de documento único (RN-02)
- Búsqueda insensible a tildes por nombre/apellido/documento
- Paginación de listado
- Desactivación sin eliminación física
- **Permisos (corregidos según matriz del SRS):** solo RECEPCIONISTA tiene CRUD; ADMIN y ODONTOLOGO solo lectura

---

## Módulo 3 — Citas y Agenda ✅

**Rama:** `feature/modulo3-citas` (mergeada)
**Requisitos:** RF-17 a RF-24
**Documentación:** `docs/Documentacion_Modulo3_Citas.md`

- Modelo `Cita` con estados (Programada, Confirmada, En atención, Finalizada, Cancelada, No asistió)
- Control de conflictos de horario (RN-01) y paciente activo (RN-07)
- Agenda visual día/semana/mes en frontend
- Widget de citas del día en el dashboard
- **Permisos:** RECEPCIONISTA con CRUD; ODONTOLOGO puede cambiar estado; ADMIN solo lectura

---

## Módulo 4 — Historia Clínica y Odontograma 🔵

**Rama:** `feature/modulo4-historia-clinica` (en progreso)
**Requisitos:** RF-25 a RF-32
**Reglas de negocio críticas:** RN-03, RN-09, RN-10
**RNF relacionadas:** RNF-05 (acceso restringido), RNF-09 (optimización de imágenes)

### Permisos (matriz del SRS)

| Acción | ADMIN | ODONTOLOGO | RECEPCIONISTA |
|---|:---:|:---:|:---:|
| Crear/editar contenido clínico (odontograma, evoluciones) | ❌ | ✅ CRUD | ❌ Sin acceso |
| Desactivar evolución errónea (sin editar) | ✅ (RN-10) | ❌ | ❌ |

### Roadmap de pasos

| # | Paso | Requisitos | Estado |
|---|---|---|---|
| 1 | Modelo `HistoriaClinica` con odontograma (32 dientes) y evoluciones embebidas | RF-25, RF-26, RF-27, RF-31 | ✅ |
| 2 | Endpoint: crear historia clínica | RF-25 | 🔵 |
| 3 | Endpoint: obtener historia clínica de un paciente | RF-25, RNF-05 | ⏳ |
| 4 | Endpoint: actualizar odontograma (solo ODONTOLOGO) | RF-26, RF-27, RN-03 | ⏳ |
| 5 | Endpoint: agregar evolución clínica con tratamientos | RF-28, RF-31, RN-03, RN-09 | ⏳ |
| 6 | Endpoint: antecedentes médicos | RF-29 | ⏳ |
| 7 | Endpoint: desactivar evolución clínica (solo ADMIN) | RN-10 | ⏳ |
| 8 | Adjuntar imágenes (radiografías/fotos) con optimización | RF-30, RNF-09 | ⏳ |
| 9 | Pruebas end-to-end del backend completo | Todo | ⏳ |
| 10 | Frontend: servicio Angular de historia clínica | — | ⏳ |
| 11 | Frontend: odontograma interactivo (32 dientes) | RF-26, RF-27 | ⏳ |
| 12 | Frontend: registro de evoluciones con tratamientos | RF-28, RF-31 | ⏳ |
| 13 | Frontend: antecedentes médicos y vista general | RF-29, RF-25 | ⏳ |
| 14 | Pruebas end-to-end del módulo completo | Todo | ⏳ |

### Decisiones tomadas

- Odontograma y evoluciones modelados como **subdocumentos embebidos** dentro de `HistoriaClinica` (no colecciones separadas), tal como especifica el SRS explícitamente.
- RF-30 (adjuntar imágenes) incluido en el alcance de este módulo, pese a ser prioridad *Should have*, por decisión del usuario.
- `historiaClinicaRoutes` bloquea `RECEPCIONISTA` por completo — es el primer módulo donde este rol no tiene ningún acceso.

---

## Módulo 5 — Facturación y Pagos ⏳

**Requisitos:** RF-33 a RF-40
**Reglas de negocio relacionadas:** RN-04 (factura no se elimina, solo se anula), RN-05 (saldo se recalcula automáticamente con cada abono)

### Permisos (matriz del SRS)

| Acción | ADMIN | ODONTOLOGO | RECEPCIONISTA |
|---|:---:|:---:|:---:|
| Facturación y pagos | Lectura (reportes) | Lectura | CRUD |

### Alcance según el SRS

- Crear factura por atención, con tratamientos realizados y valor en COP
- Registrar pagos parciales (abonos) y calcular saldo pendiente automáticamente
- Métodos de pago: efectivo, transferencia, tarjeta
- Exportar/imprimir factura en PDF (Should have)
- Manejo de IVA (servicios de salud exentos en Colombia) (Should have)
- Historial de pagos por paciente

### Dependencias

- Requiere el Módulo 4 completo, ya que las facturas muestran "tratamientos realizados" (provenientes de las evoluciones clínicas).

---

## Módulo 6 — Inventario de Materiales ⏳

**Requisitos:** RF-41 a RF-45

### Permisos (matriz del SRS)

| Acción | ADMIN | ODONTOLOGO | RECEPCIONISTA |
|---|:---:|:---:|:---:|
| Inventario | Lectura (reportes) | Sin acceso | CRUD |

### Alcance según el SRS

- Registrar materiales e insumos, con costo en COP
- Control de stock (entradas y salidas), sin permitir stock negativo (RN-06)
- Alerta de stock por debajo del mínimo (Should have)
- Registro de proveedor por material (Could have)

### Nota

Este módulo es independiente de los anteriores — puede desarrollarse en paralelo si se requiere reordenar el roadmap.

---

## Módulo 7 — Recordatorios Automáticos ⏳

**Requisitos:** RF-46 a RF-49
**Regla de negocio relacionada:** RN-08 (solo se envía si la cita está Programada o Confirmada)

### Alcance según el SRS

- Recordatorio de cita por WhatsApp 24h antes (Should have)
- Recordatorio por email (Should have)
- Configuración del mensaje del recordatorio (Could have)
- Registro de éxito/fallo del envío (Should have)

### Dependencias

- Requiere el Módulo 3 (Citas) completo — ya cumplido.
- Requiere definir un proveedor de envío de WhatsApp/email (fuera del alcance de desarrollo puro; probablemente una integración con una API externa tipo Twilio o similar, a definir).

---

## Módulo 8 — Reportes y Estadísticas ⏳

**Requisitos:** RF-50 a RF-55

### Permisos (matriz del SRS)

| Rol | Acceso a reportes |
|---|---|
| ADMIN | Todos (inventario, financieros, clínicos agregados, administrativos) |
| ODONTOLOGO | Clínicos |
| RECEPCIONISTA | Administrativos, financieros, inventario |

### Alcance según el SRS

- Ingresos del mes en curso (Must have)
- Pacientes nuevos por mes (Should have)
- Tratamientos más realizados (Could have)
- Pacientes con saldo pendiente (Must have)
- Tasa de asistencia a citas (Could have)
- Exportación a Excel o PDF (Should have)

### Dependencias

- Requiere Módulos 2, 3, 4 y 5 completos, ya que agrega datos de todos ellos.

---

## Módulo 9 — Integración con RIPS ⏳

**Requisitos:** RF-56 a RF-59
**Marco normativo:** Resolución 948 de 2026 (Ministerio de Salud de Colombia)

### Alcance y delimitación (según el SRS)

- Generar archivo RIPS en formato **JSON** (Must have), conforme a los Documentos Técnicos 1 y 2 del Ministerio
- Validar datos obligatorios antes de generar (documento del paciente, código CUPS, diagnóstico, fecha de atención) y listar atenciones incompletas (Must have)
- Descargar el archivo JSON generado para radicación manual o uso por facturador externo (Should have)
- Histórico de archivos RIPS generados, con periodo, usuario y fecha (Should have)

**Fuera de alcance explícito:** el envío automático al Mecanismo Único de Validación (MUV) y la obtención del Código Único de Validación (CUV) no forman parte de esta versión, ya que requieren facturación electrónica DIAN (fuera del alcance del proyecto).

### Dependencias

- Requiere Módulos 2 (pacientes), 4 (historia clínica/tratamientos) y 5 (facturación) completos, ya que el RIPS se construye a partir de esos datos.

---

## Historial de correcciones importantes

| Fecha (sesión) | Módulo afectado | Corrección |
|---|---|---|
| Post Módulo 2 | Pacientes | Se corrigió la política de permisos: ADMIN pasó de CRUD a solo lectura, alineado con la matriz de permisos del SRS (sección 3.1) que no se había revisado antes de la implementación inicial |

---

## Cómo actualizar este documento

Cada vez que se cierre un módulo (merge a `main` confirmado), actualizar:
1. La tabla de resumen general (cambiar estado a ✅)
2. La sección del módulo correspondiente, marcando cada paso del roadmap interno como ✅
3. Agregar cualquier corrección relevante a la sección de "Historial de correcciones importantes"
