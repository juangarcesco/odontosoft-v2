# SERVICIO NACIONAL DE APRENDIZAJE — SENA

**Etapa Productiva — Modalidad Proyecto Productivo**

*Competencia Técnica: Análisis y Desarrollo de Software*

---

# Lógica de Programación y Estructura Funcional de la Aplicación

**Proyecto:** OdontoSoft — Sistema de Gestión Clínica Odontológica

**Cliente:** Consultorio Odontológico Dra. EM (Bogotá D.C.)

**Aprendices:** Juan Carlos Garces Sierra, Juan Pablo Mendez Gil

**Ficha SENA:** 3186265

**Instructor:** Nelson Armando Serrano Hincapie

**Fecha de entrega:** Agosto 2026

---

## Contenido

1. Introducción
2. Arquitectura General del Sistema
3. Estructura por Capas (Backend)
4. Estructura Funcional por Módulo
5. Modelo de Datos y Relaciones
6. Flujo General de una Petición HTTP
7. Convenciones de Programación Adoptadas
8. Conclusiones

---

## 1. Introducción

Este documento describe la lógica de programación y la estructura funcional interna de OdontoSoft, complementando el SRS y el informe de requisitos ya entregados. Su propósito es explicar **cómo** está construido el software — su arquitectura, capas, módulos y convenciones — de manera que cualquier desarrollador pueda entender el sistema sin necesidad de leer línea por línea el código fuente.

El sistema está compuesto por dos aplicaciones independientes que se comunican mediante una API REST:

- **Backend:** Node.js + Express + MongoDB (Mongoose), ubicado en `backend/src`.
- **Frontend:** Angular (standalone components), ubicado en `frontend/src/app`.

---

## 2. Arquitectura General del Sistema

```
┌─────────────────┐        HTTPS / JSON        ┌──────────────────────┐
│   Frontend       │ ─────────────────────────▶ │   Backend (Express)  │
│   Angular SPA    │ ◀───────────────────────── │   API REST           │
└─────────────────┘        Bearer JWT           └──────────┬───────────┘
                                                            │
                                                            ▼
                                                  ┌──────────────────────┐
                                                  │   MongoDB (Mongoose) │
                                                  └──────────────────────┘
```

El backend expone una API REST bajo el prefijo `/api`, protegida con autenticación **JWT** (JSON Web Token) y autorización **RBAC** (Role-Based Access Control) con tres roles: `ADMIN`, `ODONTOLOGO`, `RECEPCIONISTA`. El frontend consume esta API y no contiene lógica de negocio: toda regla de negocio vive en el backend.

---

## 3. Estructura por Capas (Backend)

El backend sigue una arquitectura en capas, con separación estricta de responsabilidades:

```
Request HTTP
   │
   ▼
routes/          → define el endpoint (verbo + ruta) y la cadena de middlewares
   │
   ▼
middlewares/     → autenticación (JWT), autorización (rol), rate limiting, subida de archivos
   │
   ▼
controllers/     → interpreta req/res, valida forma de la petición, delega al servicio
   │
   ▼
services/        → lógica de negocio pura (reglas RN-xx), no conoce req/res
   │
   ▼
models/          → esquemas Mongoose, validaciones de datos, acceso a MongoDB
```

**Regla de diseño aplicada:** los `services/*.js` nunca reciben ni devuelven objetos `req`/`res`; solo trabajan con datos y lanzan errores de negocio (`error.codigo`) que el controlador traduce a códigos HTTP. Esto permite probar la lógica de negocio de forma aislada (pruebas unitarias) sin levantar un servidor HTTP.

| Carpeta | Responsabilidad | Ejemplo |
|---|---|---|
| `routes/` | Enrutamiento y cadena de middlewares | `citaRoutes.js` |
| `middlewares/` | Cross-cutting concerns (seguridad, archivos) | `authMiddleware.js`, `roleMiddleware.js` |
| `controllers/` | Adaptador HTTP ↔ lógica de negocio | `citaController.js` |
| `services/` | Reglas de negocio (RN) | `citaService.js` |
| `models/` | Esquema de datos y validaciones estructurales | `Cita.js` |
| `jobs/` | Procesos automáticos programados (cron) | `recordatoriosJob.js` |
| `scripts/` | Utilidades de arranque (seed de roles/admin) | `seedAdmin.js` |

---

## 4. Estructura Funcional por Módulo

El sistema se organiza en 9 módulos funcionales, cada uno con su propio conjunto rutas → controlador → servicio → modelo:

| # | Módulo | Prefijo API | Servicio principal |
|---|---|---|---|
| 1 | Autenticación y Sesión | `/api/auth` | `authService.js`, `tokenService.js` |
| 2 | Gestión de Pacientes | `/api/pacientes` | `pacienteService.js` |
| 3 | Agenda de Citas | `/api/citas` | `citaService.js` |
| 4 | Historia Clínica y Odontograma | `/api/historias-clinicas` | `historiaClinicaService.js` |
| 5 | Facturación | `/api/facturas` | `facturaService.js` |
| 6 | Inventario de Materiales | `/api/materiales` | `materialService.js` |
| 7 | Recordatorios (Email/WhatsApp) | `/api/recordatorios` | `recordatorioService.js` |
| 8 | Reportes Gerenciales | `/api/reportes` | `reporteService.js` |
| 9 | RIPS (reporte normativo en salud) | `/api/rips` | `ripsService.js` |

Cada módulo es funcionalmente independiente, pero varios dependen de datos de otros (p. ej., Facturación lee los tratamientos registrados en Historia Clínica; RIPS lee Facturas y Pacientes). Estas dependencias son siempre de **lectura entre servicios**, nunca de escritura cruzada directa a modelos ajenos.

---

## 5. Modelo de Datos y Relaciones

```
Usuario ──< creadoPor >── Paciente ──1:1── HistoriaClinica ──< evoluciones (embebido)
   │                          │                                     │
   │                          │                                     └─< adjuntos (embebido)
   │                          └──< Cita >── (odontologo: Usuario)
   │                          └──< Factura >── (items embebidos, pagos embebidos)
   │
   ├──< Material >── movimientos (embebido: ENTRADA/SALIDA)
   ├──< Recordatorio >── (cita, paciente)
   ├──< ArchivoRips >── (facturas incluidas)
   ├──< LogAcceso >── (auditoría de login)
   └──< TokenInvalidado >── (blacklist de JWT tras logout)
```

- **Paciente ↔ HistoriaClinica:** relación 1:1; la historia se crea explícitamente por un odontólogo, no automáticamente al crear el paciente.
- **HistoriaClinica → evoluciones / odontograma:** subdocumentos embebidos (no colecciones separadas), porque siempre se leen y escriben junto con la historia completa.
- **Factura → items:** cada ítem referencia opcionalmente la evolución clínica de la que proviene (`evolucionId`), enlazando Facturación con Historia Clínica sin duplicar datos clínicos sensibles.

---

## 6. Flujo General de una Petición HTTP

Todas las peticiones (salvo `/api/auth/login` y `/api/health`) siguen el mismo patrón funcional:

1. **Enrutamiento:** Express hace match de método + path en el archivo `routes/*.js` correspondiente.
2. **Autenticación (`verificarToken`):** se exige encabezado `Authorization: Bearer <token>`; se valida la firma JWT y que el token no esté en la lista de invalidados (logout).
3. **Autorización (`permitirRoles(...)`):** se compara `req.usuario.rol` contra la lista blanca de roles permitidos para ese endpoint.
4. **Controlador:** parsea `req.body`/`req.params`/`req.query`, hace validaciones de forma (campos obligatorios presentes) y llama al servicio.
5. **Servicio:** aplica las reglas de negocio (RN-xx), consulta/actualiza MongoDB vía el modelo, y lanza errores tipados (`error.codigo`) si una regla no se cumple.
6. **Respuesta:** el controlador captura el resultado o el error y responde con el código HTTP y el cuerpo JSON correspondiente.

Este mismo patrón se documenta en detalle, con pseudocódigo y diagramas de flujo, en el documento **7 — Diagramas de Flujo y Pseudocódigo de los Algoritmos Principales**.

---

## 7. Convenciones de Programación Adoptadas

- **Idioma del dominio:** nombres de funciones, variables y colecciones en español (`crearCita`, `registrarPago`, `existeConflictoHorario`), reflejando el lenguaje del negocio real (consultorio odontológico colombiano).
- **Errores de negocio tipados:** todo error de regla de negocio incluye una propiedad `codigo` (ej. `CONFLICTO_HORARIO`, `STOCK_INSUFICIENTE`) que el frontend usa para mostrar mensajes específicos, en vez de depender del texto del mensaje.
- **Nunca confiar en el cliente para campos calculados o protegidos:** los servicios eliminan explícitamente del payload de entrada campos como `estado`, `creadoPor` o `saldoPendiente` antes de aplicar actualizaciones, recalculándolos siempre en el servidor (ver `facturaService.registrarPago`, `pacienteService.actualizarPaciente`).
- **Fallos no críticos no interrumpen el flujo principal:** por ejemplo, si falla el registro del log de acceso durante un login exitoso, el login continúa (ver `authController.registrarIntento`).
- **Idempotencia en procesos automáticos:** el job de recordatorios verifica existencia previa antes de reenviar, evitando duplicados en reintentos o ejecuciones concurrentes.

---

## 8. Conclusiones

La estructura funcional de OdontoSoft separa claramente el **transporte HTTP** (routes/controllers) de la **lógica de negocio** (services) y de la **persistencia** (models), lo que facilita el mantenimiento, la trazabilidad de reglas de negocio y las pruebas. Esta organización es la base sobre la cual se documentan, en los siguientes tres documentos, las entradas/procesos/salidas de las funciones críticas, sus algoritmos en pseudocódigo, y las pruebas de escritorio que verifican su correcto funcionamiento.

---

**Elaborado por:**

**Aprendices:** Juan Carlos Garces Sierra, Juan Pablo Mendez Gil

**Ficha SENA:** 3186265

**Fecha:** `[FECHA]`
