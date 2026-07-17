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
| 4 | Historia Clínica y Odontograma | RF-25 a RF-32 | Must have | ✅ |
| 5 | Facturación y Pagos | RF-33 a RF-40 | Must have | ✅ |
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

## Módulo 4 — Historia Clínica y Odontograma ✅

**Rama:** `feature/modulo4-historia-clinica` (probado end-to-end, pendiente de PR/merge)
**Requisitos:** RF-25 a RF-32
**Reglas de negocio:** RN-03, RN-09, RN-10
**RNF relacionadas:** RNF-05 (acceso restringido), RNF-09 (optimización de imágenes)
**Documentación:** `docs/Documentacion_Modulo4_HistoriaClinica.md`

- Modelo `HistoriaClinica` con odontograma (32 dientes), evoluciones y adjuntos como **subdocumentos embebidos** (decisión explícita del SRS)
- Odontograma interactivo en frontend (clic en diente → cambiar estado)
- Registro de evoluciones clínicas con tratamientos por diente (`FormArray` dinámico)
- Antecedentes médicos editables
- Adjuntos (imágenes/radiografías) con optimización automática (Sharp → WebP)
- Desactivación administrativa de evoluciones erróneas (RN-10), sin edición ni eliminación
- **Permisos:** ODONTOLOGO con CRUD exclusivo sobre contenido clínico; ADMIN solo lectura + desactivar evoluciones; RECEPCIONISTA sin ningún acceso (único módulo donde este rol queda completamente excluido)

### Roadmap de pasos (14/14 completados)

| # | Paso | Estado |
|---|---|---|
| 1 | Modelo `HistoriaClinica` con odontograma y evoluciones embebidas | ✅ |
| 2 | Endpoint: crear historia clínica | ✅ |
| 3 | Endpoint: obtener historia clínica de un paciente | ✅ |
| 4 | Endpoint: actualizar odontograma (solo ODONTOLOGO) | ✅ |
| 5 | Endpoint: agregar evolución clínica con tratamientos | ✅ |
| 6 | Endpoint: antecedentes médicos | ✅ |
| 7 | Endpoint: desactivar evolución clínica (solo ADMIN) | ✅ |
| 8 | Adjuntar imágenes con optimización (Multer + Sharp) | ✅ |
| 9 | Pruebas end-to-end del backend completo (16/16) | ✅ |
| 10 | Frontend: servicio Angular de historia clínica | ✅ |
| 11 | Frontend: odontograma interactivo (32 dientes) | ✅ |
| 12 | Frontend: registro de evoluciones con tratamientos | ✅ |
| 13 | Frontend: antecedentes médicos y vista general | ✅ |
| 14 | Pruebas end-to-end del módulo completo (16/16, verificado dos veces) | ✅ |

---

## Módulo 5 — Facturación y Pagos ✅

**Rama:** `feature/modulo5-facturacion` (probada end-to-end, pendiente de PR/merge)
**Requisitos:** RF-33 a RF-40
**Reglas de negocio:** RN-04, RN-05
**Documentación:** `docs/Documentacion_Modulo5_Facturacion.md`

- Modelo `Factura` con ítems y pagos como subdocumentos embebidos
- Endpoint de "tratamientos facturables" con vista limitada de historia clínica, respetando RNF-05
- Cálculo de `valorTotal` y `saldoPendiente` siempre en el servidor, nunca recibidos del cliente
- Anulación de factura sin eliminación física (RN-04)
- Exportación a PDF con `pdfkit`, descarga autenticada vía blob en el frontend
- **Permisos:** RECEPCIONISTA con CRUD; ADMIN y ODONTOLOGO con lectura del historial y PDF

### Roadmap de pasos (13/13 completados)

| # | Paso | Estado |
|---|---|---|
| 1 | Modelo `Factura` (ítems, pagos, saldo, estado) | ✅ |
| 2 | Endpoint: tratamientos facturables (vista limitada) | ✅ |
| 3 | Endpoint: crear factura | ✅ |
| 4 | Endpoint: registrar abono/pago (RN-05) | ✅ |
| 5 | Endpoint: anular factura (RN-04) | ✅ |
| 6 | Endpoint: listar facturas / historial por paciente | ✅ |
| 7 | Exportar factura a PDF | ✅ |
| 8 | Pruebas end-to-end del backend completo (17/17) | ✅ |
| 9 | Frontend: servicio Angular de facturación | ✅ |
| 10 | Frontend: crear factura seleccionando tratamientos | ✅ |
| 11 | Frontend: registrar pagos/abonos | ✅ |
| 12 | Frontend: historial de facturas y pagos por paciente | ✅ |
| 13 | Pruebas end-to-end del módulo completo (17/17, verificado dos veces) | ✅ |

### Herramienta de soporte creada

`scripts/dev-start.sh`: arranca Mongo, backend y frontend, y guarda tokens de los 3 roles de prueba en `.tokens.env` para agilizar el trabajo tras reinicios del Codespace.

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

- Requiere Módulos 2, 3, 4 y 5 (✅ todos cumplidos), ya que agrega datos de todos ellos.

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

- Requiere Módulos 2 (✅), 4 (✅) y 5 (✅) completos, ya que el RIPS se construye a partir de esos datos.

---

## Historial de correcciones importantes

| Fecha (sesión) | Módulo afectado | Corrección |
|---|---|---|
| Post Módulo 2 | Pacientes | Se corrigió la política de permisos: ADMIN pasó de CRUD a solo lectura, alineado con la matriz de permisos del SRS (sección 3.1) que no se había revisado antes de la implementación inicial |
| Durante Módulo 4 | Historia Clínica | Corrección de sintaxis en el modelo: `evoluciones`/`adjuntos` definidos como `{ type: [...], default: [] }` impedían el `populate()` de Mongoose sobre paths anidados; corregido a la sintaxis directa `campo: [subSchema]` |
| Al iniciar Módulo 5 | Sincronización de ramas | El `main` local y el remoto divergieron tras el cierre del Módulo 4; se resolvió con `git fetch origin` + `git reset --hard origin/main`, sincronizando el local exactamente con el remoto |

---

## Cómo actualizar este documento

Cada vez que se cierre un módulo (merge a `main` confirmado), actualizar:
1. La tabla de resumen general (cambiar estado a ✅)
2. La sección del módulo correspondiente, marcando cada paso del roadmap interno como ✅
3. Agregar cualquier corrección relevante a la sección de "Historial de correcciones importantes"
