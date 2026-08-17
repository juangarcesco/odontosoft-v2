# SERVICIO NACIONAL DE APRENDIZAJE — SENA

**Etapa Productiva — Modalidad Proyecto Productivo**

*Competencia Técnica: Análisis y Desarrollo de Software*

---

# DEFINICIÓN DE ENTRADAS, PROCESOS Y SALIDAS DE LAS FUNCIONES CRÍTICAS DEL SISTEMA

**Proyecto:** OdontoSoft — Sistema de Gestión Clínica Odontológica

**Cliente:** Consultorio Odontológico Dra. EM (Bogotá D.C.)

**Aprendices:** Juan Carlos Garces Sierra, Juan Pablo Mendez Gil

**Ficha SENA:** 3186265

**Instructor:** Nelson Armando Serrano Hincapie

**Fecha de entrega:** Agosto 2026

---

## CONTENIDO

1. Introducción
2. Criterio de Selección de Funciones Críticas
3. Módulo de Autenticación y Control de Acceso
4. Módulo de Agenda de Citas
5. Módulo de Facturación
6. Módulo de Inventario de Materiales
7. Módulo de Historia Clínica
8. Módulo de RIPS
9. Resumen de Códigos de Error de Negocio

---

## 1. INTRODUCCIÓN

Este documento especifica, en formato **Entrada → Proceso → Salida (E-P-S)**, las funciones consideradas críticas de OdontoSoft: aquellas que implementan una regla de negocio (RN-xx) cuyo fallo o mal funcionamiento generaría un daño operativo, financiero, clínico o de seguridad (acceso indebido a historias clínicas, doble reserva de citas, facturación incorrecta, pérdida de trazabilidad de inventario, incumplimiento normativo RIPS).

## 2. CRITERIO DE SELECCIÓN DE FUNCIONES CRÍTICAS

Se considera crítica toda función que cumpla al menos uno de estos criterios:

- Decide si una operación se autoriza o se rechaza (seguridad / control de acceso).
- Calcula o modifica un valor monetario (facturación).
- Modifica un recurso compartido con riesgo de conflicto (agenda, stock).
- Alimenta un reporte con validez legal/normativa (RIPS).
- Modifica datos clínicos sensibles (historia clínica).

---

## 3. MÓDULO DE AUTENTICACIÓN Y CONTROL DE ACCESO

### 3.1 `login(req, res)` — `authController.js`

| Aspecto | Detalle |
|---|---|
| **Entradas** | `email` (string), `password` (string, texto plano) desde `req.body` |
| **Precondiciones** | Ninguna sesión previa requerida (endpoint público) |
| **Proceso** | 1) Valida que `email` y `password` no sean vacíos. 2) Normaliza el email (`toLowerCase().trim()`). 3) Busca el usuario por email exacto. 4) Verifica `estado === 'ACTIVO'`. 5) Compara el password recibido contra el hash almacenado con `bcrypt.compare`. 6) Si todo es válido, genera un JWT firmado (`generarToken`) con payload `{id, rol, nombre}` y expiración configurable (`JWT_EXPIRES_IN`). 7) Registra el intento (exitoso o fallido) en `LogAcceso`, sin bloquear el flujo si el log falla. |
| **Salidas (éxito)** | HTTP 200, `{ mensaje, token, usuario }` (el `usuario` nunca incluye `passwordHash`, eliminado por el transform de `toJSON` del modelo) |
| **Salidas (error)** | HTTP 400 (faltan campos) · HTTP 401 (usuario inexistente o password inválida — mismo mensaje genérico "Credenciales inválidas" para no filtrar cuál de los dos falló) · HTTP 403 (usuario `INACTIVO`) · HTTP 500 (error interno) |
| **Efecto colateral** | Inserta un documento en `LogAcceso` con `email`, `exito`, `motivo`, `ip`, `userAgent` |

### 3.2 `verificarToken(req, res, next)` — `authMiddleware.js`

| Aspecto | Detalle |
|---|---|
| **Entradas** | Encabezado HTTP `Authorization: Bearer <token>` |
| **Proceso** | 1) Verifica que el encabezado exista y tenga el prefijo `Bearer `. 2) Extrae y verifica la firma/expiración del JWT con `jwt.verify`. 3) Consulta si el token está en la colección `TokenInvalidado` (sesión cerrada manualmente). 4) Si todo es válido, adjunta el payload decodificado a `req.usuario` y continúa (`next()`). |
| **Salidas (éxito)** | Continúa la cadena de middlewares; `req.usuario = { id, rol, nombre }` |
| **Salidas (error)** | HTTP 401 en los cuatro casos: token ausente, token en lista negra ("Sesión cerrada"), token expirado ("Sesión expirada"), token inválido/manipulado |

### 3.3 `permitirRoles(...rolesPermitidos)` — `roleMiddleware.js`

| Aspecto | Detalle |
|---|---|
| **Entradas** | Lista blanca de roles definida en la ruta (ej. `permitirRoles('ADMIN','RECEPCIONISTA')`); `req.usuario.rol` inyectado previamente por `verificarToken` |
| **Proceso** | Verifica que `req.usuario` exista (autenticado) y que `req.usuario.rol` esté incluido en la lista blanca del endpoint |
| **Salidas (éxito)** | Continúa la cadena (`next()`) |
| **Salidas (error)** | HTTP 401 si no hay `req.usuario` (no autenticado) · HTTP 403 si el rol no está autorizado para ese recurso |

---

## 4. MÓDULO DE AGENDA DE CITAS

### 4.1 `existeConflictoHorario({odontologo, fecha, hora, duracion, citaIdExcluir})` — `citaService.js`

| Aspecto | Detalle |
|---|---|
| **Entradas** | `odontologo` (ObjectId), `fecha` (Date), `hora` ("HH:MM"), `duracion` (minutos, entero), `citaIdExcluir` (ObjectId opcional, para ediciones) |
| **Proceso** | 1) Convierte `hora` a minutos desde medianoche y calcula el rango `[inicioNueva, finNueva)`. 2) Calcula el rango del día completo en UTC (`00:00:00.000` a `23:59:59.999`). 3) Consulta las citas del mismo odontólogo, mismo día, en estado `PROGRAMADA` o `CONFIRMADA` (estados que "bloquean" el horario), excluyendo la propia cita si se está editando. 4) Para cada cita existente, evalúa solapamiento de rangos: `inicioNueva < finExistente && inicioExistente < finNueva`. |
| **Salidas** | `true` si existe solapamiento con al menos una cita existente; `false` en caso contrario |
| **Regla de negocio** | Solo bloquean el horario las citas `PROGRAMADA`/`CONFIRMADA`; una cita `CANCELADA`, `FINALIZADA` o `NO_ASISTIO` libera el horario y no genera falso conflicto |

### 4.2 `crearCita(datos, usuarioId)` — `citaService.js`

| Aspecto | Detalle |
|---|---|
| **Entradas** | `datos` = `{paciente, odontologo, fecha, hora, duracion, motivo,...}`; `usuarioId` (recepcionista autenticado) |
| **Proceso** | 1) Verifica que el paciente exista. 2) Verifica que el paciente esté `ACTIVO`. 3) Invoca `existeConflictoHorario`. 4) Si no hay conflicto, crea el documento `Cita` con `creadoPor = usuarioId` y `duracion` por defecto de 30 minutos si no se especifica. |
| **Salidas (éxito)** | Documento `Cita` recién creado |
| **Salidas (error)** | Error con `codigo = PACIENTE_NO_EXISTE` · `PACIENTE_INACTIVO` · `CONFLICTO_HORARIO` (el controlador traduce estos códigos a HTTP 404/409 según corresponda) |

### 4.3 `cambiarEstadoCita(id, nuevoEstado)` — `citaService.js`

| Aspecto | Detalle |
|---|---|
| **Entradas** | `id` (ObjectId de la cita), `nuevoEstado` (string) |
| **Proceso** | Valida que `nuevoEstado` pertenezca a la lista cerrada `['PROGRAMADA','CONFIRMADA','EN_ATENCION','FINALIZADA','CANCELADA','NO_ASISTIO']`; actualiza el documento |
| **Salidas** | Cita actualizada, o error `ESTADO_INVALIDO` si el valor no está en la lista |

---

## 5. MÓDULO DE FACTURACIÓN

### 5.1 `crearFactura(pacienteId, items, usuarioId)` — `facturaService.js`

| Aspecto | Detalle |
|---|---|
| **Entradas** | `pacienteId` (ObjectId), `items` (arreglo de `{procedimiento, valor, diente?, codigoCups?, diagnostico?}`), `usuarioId` |
| **Proceso** | 1) Rechaza si `items` está vacío. 2) Calcula `valorTotal = Σ item.valor` (reduce). 3) Crea la factura con `saldoPendiente = valorTotal` (nada pagado aún) y `estado` por defecto `PENDIENTE`. |
| **Salidas (éxito)** | Documento `Factura` creado |
| **Salidas (error)** | Error `SIN_ITEMS` si no hay ítems |

### 5.2 `registrarPago(facturaId, monto, metodoPago, usuarioId)` — `facturaService.js`

| Aspecto | Detalle |
|---|---|
| **Entradas** | `facturaId`, `monto` (número > 0), `metodoPago` (`EFECTIVO`\|`TRANSFERENCIA`\|`TARJETA`), `usuarioId` |
| **Proceso** | 1) Valida que `metodoPago` esté en la lista permitida. 2) Busca la factura; error si no existe. 3) Rechaza si la factura está `ANULADA`. 4) **Rechaza si `monto > saldoPendiente`** (no se permite sobrepago). 5) Agrega el pago al arreglo `pagos`. 6) Recalcula `saldoPendiente = saldoPendiente - monto` **en el servidor** (nunca se acepta un saldo enviado por el cliente — RN-05). 7) Si `saldoPendiente === 0`, cambia `estado` a `PAGADA`. |
| **Salidas (éxito)** | Factura actualizada, con `pagos` y `saldoPendiente` recalculados |
| **Salidas (error)** | `METODO_INVALIDO` · `FACTURA_NO_EXISTE` · `FACTURA_ANULADA` · `MONTO_EXCEDE_SALDO` |

### 5.3 `anularFactura(facturaId, motivo, usuarioId)` — `facturaService.js`

| Aspecto | Detalle |
|---|---|
| **Entradas** | `facturaId`, `motivo` (string obligatorio, no vacío), `usuarioId` |
| **Proceso** | Valida existencia, que no esté ya anulada, y que `motivo` no sea vacío; marca `estado = ANULADA`, registra `anuladaPor` y `fechaAnulacion` |
| **Salidas (error)** | `FACTURA_NO_EXISTE` · `YA_ANULADA` · `MOTIVO_REQUERIDO` |

---

## 6. MÓDULO DE INVENTARIO DE MATERIALES

### 6.1 `registrarSalida(materialId, cantidad, motivo, usuarioId)` — `materialService.js`

| Aspecto | Detalle |
|---|---|
| **Entradas** | `materialId`, `cantidad` (número > 0), `motivo` (string opcional), `usuarioId` |
| **Proceso** | 1) Rechaza `cantidad <= 0` o ausente. 2) Verifica existencia del material. 3) **Rechaza si `cantidad > material.stock`** (no permite stock negativo — control de existencias). 4) Registra el movimiento tipo `SALIDA` en el historial embebido. 5) Descuenta `stock = stock - cantidad`. |
| **Salidas (éxito)** | Material con `stock` actualizado y nuevo movimiento en el historial |
| **Salidas (error)** | `CANTIDAD_INVALIDA` · `MATERIAL_NO_EXISTE` · `STOCK_INSUFICIENTE` (mensaje incluye stock disponible vs. solicitado) |

### 6.2 `listarMateriales()` — `materialService.js`

| Aspecto | Detalle |
|---|---|
| **Proceso** | Lista materiales `ACTIVO`s ordenados por nombre y calcula, por cada uno, el indicador derivado `stockBajo = stock <= stockMinimo` |
| **Salidas** | Arreglo de materiales enriquecido con la bandera `stockBajo`, usada por el frontend para alertar reabastecimiento |

---

## 7. MÓDULO DE HISTORIA CLÍNICA

### 7.1 `agregarEvolucion(pacienteId, datosEvolucion, odontologoId)` — `historiaClinicaService.js`

| Aspecto | Detalle |
|---|---|
| **Entradas** | `pacienteId`, `datosEvolucion = {fecha?, descripcion, tratamientosRealizados[]}`, `odontologoId` (autenticado, siempre el que ejecuta la acción — RN-09) |
| **Proceso** | Verifica que exista historia clínica para el paciente; construye el subdocumento de evolución con `odontologo = odontologoId` (no editable por el cliente) y lo agrega al arreglo `evoluciones` |
| **Salidas (error)** | `HISTORIA_NO_EXISTE` |

### 7.2 `agregarAdjunto(pacienteId, archivo, tipo, usuarioId)` — `historiaClinicaService.js`

| Aspecto | Detalle |
|---|---|
| **Entradas** | `archivo` (buffer en memoria, vía `multer`), `tipo` (string), `usuarioId` |
| **Proceso** | 1) Verifica existencia de historia clínica. 2) Genera nombre único con `crypto.randomUUID()` + extensión `.webp`. 3) Procesa la imagen con `sharp`: redimensiona a máx. 1600px de ancho (`withoutEnlargement: true`, no agranda imágenes pequeñas) y comprime a calidad 80 en formato WebP (RNF-09, optimización de almacenamiento). 4) Guarda el archivo físico en `uploads/historias-clinicas/`. 5) Agrega el metadato del adjunto al arreglo `adjuntos`. |
| **Salidas (error)** | `HISTORIA_NO_EXISTE` |

---

## 8. MÓDULO DE RIPS

### 8.1 `validarCamposObligatorios(factura, paciente)` — `ripsService.js`

| Aspecto | Detalle |
|---|---|
| **Entradas** | Documento `factura` (con `items`), documento `paciente` |
| **Proceso** | Verifica: documento del paciente completo (`tipoDocumento` + `numeroDocumento`); cada ítem de la factura tiene `codigoCups` y `diagnostico` no vacíos; la factura tiene fecha de creación |
| **Salidas** | Arreglo `camposFaltantes` (vacío = factura apta para RIPS; no vacío = lista de campos faltantes descriptivos) |

### 8.2 `generarYRegistrarRips(periodo, usuarioId)` — `ripsService.js`

| Aspecto | Detalle |
|---|---|
| **Entradas** | `periodo` (string `"AAAA-MM"`), `usuarioId` |
| **Proceso** | 1) Genera la estructura RIPS del periodo, transformando cada factura no anulada en un bloque `usuarios[].servicios.procedimientos[]`. 2) Si existe **al menos una** atención con campos incompletos, **aborta todo el proceso** sin generar el archivo (RN normativa: RIPS no admite registros parciales). 3) Si no hay atenciones completas, aborta también. 4) Si todo es válido, persiste un documento `ArchivoRips` con la lista de facturas incluidas y quién lo generó. |
| **Salidas (éxito)** | `{ estructura, archivo }` |
| **Salidas (error)** | `ATENCIONES_INCOMPLETAS` (incluye el detalle `incompletas`) · `SIN_ATENCIONES` |

---

## 9. RESUMEN DE CÓDIGOS DE ERROR DE NEGOCIO

| Código | Módulo | Significado |
|---|---|---|
| `PACIENTE_NO_EXISTE` | Citas / Historia Clínica | El paciente referenciado no existe en la base de datos |
| `PACIENTE_INACTIVO` | Citas | No se agenda cita para un paciente dado de baja |
| `CONFLICTO_HORARIO` | Citas | El odontólogo ya tiene una cita que se solapa en ese rango |
| `ESTADO_INVALIDO` | Citas | Transición a un estado fuera del catálogo permitido |
| `SIN_ITEMS` | Facturación | Factura sin ningún ítem facturable |
| `METODO_INVALIDO` | Facturación | Método de pago fuera del catálogo permitido |
| `FACTURA_NO_EXISTE` | Facturación | Factura referenciada inexistente |
| `FACTURA_ANULADA` | Facturación | Operación no permitida sobre factura anulada |
| `MONTO_EXCEDE_SALDO` | Facturación | El abono supera el saldo pendiente |
| `YA_ANULADA` / `MOTIVO_REQUERIDO` | Facturación | Reglas de anulación |
| `CANTIDAD_INVALIDA` | Inventario | Cantidad de entrada/salida ≤ 0 |
| `MATERIAL_NO_EXISTE` | Inventario | Material referenciado inexistente |
| `STOCK_INSUFICIENTE` | Inventario | Salida solicitada mayor al stock disponible |
| `HISTORIA_NO_EXISTE` | Historia Clínica | El paciente no tiene historia clínica creada |
| `DIENTE_INVALIDO` | Historia Clínica | Número de diente fuera del odontograma (1-32) |
| `EVOLUCION_NO_EXISTE` / `YA_DESACTIVADA` | Historia Clínica | Reglas de desactivación de evoluciones |
| `ATENCIONES_INCOMPLETAS` / `SIN_ATENCIONES` | RIPS | Bloqueo de generación de RIPS por datos faltantes |

---

**Elaborado por:**

**Aprendices:** Juan Carlos Garces Sierra, Juan Pablo Mendez Gil

**Ficha SENA:** 3186265

**Fecha:** `[FECHA]`
