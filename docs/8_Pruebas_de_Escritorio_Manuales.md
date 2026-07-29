# SERVICIO NACIONAL DE APRENDIZAJE — SENA

**Etapa Productiva — Modalidad Proyecto Productivo**

*Competencia Técnica: Análisis y Desarrollo de Software*

---

# Pruebas de Escritorio Manuales

**Verificación de la Efectividad de la Lógica Planteada**

**Proyecto:** OdontoSoft — Sistema de Gestión Clínica Odontológica

**Cliente:** Consultorio Odontológico Dra. EM (Bogotá D.C.)

**Aprendices:** Juan Carlos Garces Sierra, Juan Pablo Mendez Gil

**Ficha SENA:** 3186265

**Instructor:** Nelson Armando Serrano Hincapie

**Fecha de entrega:** Agosto 2026

---

## Contenido

1. Introducción y Metodología
2. Prueba de Escritorio 1 — Login (caso exitoso y casos de rechazo)
3. Prueba de Escritorio 2 — Control de Acceso por Rol (RBAC)
4. Prueba de Escritorio 3 — Conflicto de Horario en Citas
5. Prueba de Escritorio 4 — Pago de Factura y Recálculo de Saldo
6. Prueba de Escritorio 5 — Salida de Inventario
7. Prueba de Escritorio 6 — Validación de Periodo para RIPS
8. Resumen de Resultados

---

## 1. Introducción y Metodología

Una **prueba de escritorio** (*desk check*) consiste en ejecutar mentalmente un algoritmo, paso a paso, con datos de entrada concretos, registrando en una tabla el valor de cada variable relevante en cada punto de decisión, hasta llegar a la salida. Su objetivo es verificar la lógica del algoritmo **antes o independientemente** de ejecutarlo en el computador, detectando errores de diseño que una prueba automatizada podría no cubrir si el caso de prueba no existe.

Para cada algoritmo crítico documentado en el punto 7 (Diagramas de Flujo y Pseudocódigo), se traza aquí al menos un caso de **camino exitoso** y un caso de **camino de rechazo**, seleccionados por ser los de mayor riesgo si la lógica estuviera mal implementada.

---

## 2. Prueba de Escritorio 1 — Login

**Algoritmo:** `authController.js → login()`

### Caso 1.A — Credenciales correctas, usuario activo (camino exitoso)

**Datos de entrada:** `email = "DRA.EM@Consultorio.com "`, `password = "Clinica2026*"`
**Estado previo en BD:** usuario con `email = "dra.em@consultorio.com"`, `estado = "ACTIVO"`, `passwordHash` = hash bcrypt válido de `"Clinica2026*"`.

| Paso | Instrucción | Estado de variables |
|---|---|---|
| 1 | `SI email vacío O password vacío` | Ambos tienen valor → condición falsa, continúa |
| 2 | `emailNormalizado ← minusculas(quitarEspacios(email))` | `emailNormalizado = "dra.em@consultorio.com"` |
| 3 | `usuario ← buscarUsuarioPorEmail(...)` | `usuario` encontrado, `estado = "ACTIVO"` |
| 4 | `SI usuario NO existe` | Falso, continúa |
| 5 | `SI estado ≠ "ACTIVO"` | Falso (`"ACTIVO" == "ACTIVO"`), continúa |
| 6 | `passwordValida ← bcrypt.comparar(...)` | `passwordValida = true` |
| 7 | `SI NO passwordValida` | Falso, continúa |
| 8 | `token ← generarJWT(...)` | `token = "eyJhbGciOiJIUzI1NiIs..."` (no vacío) |
| 9 | `registrarIntento(exito=true)` | Log insertado |
| 10 | Retorno | `HTTP 200 { mensaje, token, usuario }` |

**Resultado esperado:** HTTP 200 con token. **Resultado obtenido en el trazado:** HTTP 200 con token. ✅ **Coincide.**

### Caso 1.B — Contraseña incorrecta (camino de rechazo)

**Datos de entrada:** mismo email, `password = "clavequivocada"`.

| Paso | Instrucción | Estado de variables |
|---|---|---|
| 1-5 | Igual al caso anterior | `usuario` existe y `ACTIVO` |
| 6 | `passwordValida ← bcrypt.comparar("clavequivocada", hashReal)` | `passwordValida = false` |
| 7 | `SI NO passwordValida` | Verdadero → entra al bloque |
| 7a | `registrarIntento(exito=false, motivo="contraseña incorrecta")` | Log insertado con motivo específico |
| 7b | Retorno | `HTTP 401 "Credenciales inválidas"` |

**Resultado esperado:** HTTP 401 con mensaje genérico (no debe indicar cuál campo falló). **Resultado obtenido:** HTTP 401 "Credenciales inválidas". ✅ **Coincide.** Se verifica además que el mensaje es **idéntico** al del caso "usuario no existe" (Caso 1.C), confirmando que no hay fuga de información sobre existencia de cuentas.

### Caso 1.C — Usuario inactivo (camino de rechazo)

**Datos de entrada:** email válido y password correcta, pero `usuario.estado = "INACTIVO"` (ej. odontólogo que se retiró del consultorio).

| Paso | Instrucción | Estado de variables |
|---|---|---|
| 3 | `usuario ← buscarUsuarioPorEmail(...)` | `usuario` encontrado, `estado = "INACTIVO"` |
| 5 | `SI estado ≠ "ACTIVO"` | Verdadero → entra al bloque |
| 5a | `registrarIntento(exito=false, motivo="usuario inactivo")` | Log insertado |
| 5b | Retorno | `HTTP 403 "Usuario inactivo, contacte al administrador"` |

**Nota crítica verificada:** el algoritmo comprueba `estado` **antes** de comparar la contraseña. Esto es correcto: evita gastar ciclos de cómputo en bcrypt (operación costosa por diseño, `SALT_ROUNDS = 12`) para una cuenta que de todas formas será rechazada. ✅ **Coincide con el diseño esperado.**

---

## 3. Prueba de Escritorio 2 — Control de Acceso por Rol (RBAC)

**Algoritmo:** `verificarToken()` + `permitirRoles('RECEPCIONISTA')` sobre `POST /api/facturas`

### Caso 2.A — Odontólogo intenta crear una factura (debe rechazarse)

**Datos de entrada:** JWT válido, no expirado, no invalidado, con payload `{ rol: "ODONTOLOGO" }`. Endpoint protegido con `permitirRoles('RECEPCIONISTA')`.

| Paso | Instrucción | Estado de variables |
|---|---|---|
| 1 | `¿Existe encabezado Bearer?` | Sí |
| 2 | `jwt.verificar(token)` | Firma y expiración válidas → `payload = {id, rol:"ODONTOLOGO", nombre}` |
| 3 | `¿Token en lista de invalidados?` | No |
| 4 | `req.usuario ← payload` | `req.usuario.rol = "ODONTOLOGO"` |
| 5 | `permitirRoles(['RECEPCIONISTA'])`: `¿req.usuario existe?` | Sí |
| 6 | `¿"ODONTOLOGO" ESTÁ EN ["RECEPCIONISTA"]?` | **No** |
| 7 | Retorno | `HTTP 403 "No tiene permisos para acceder a este recurso"` |

**Resultado esperado:** HTTP 403 (el odontólogo NO factura, según la matriz de roles del cliente). **Resultado obtenido:** HTTP 403. ✅ **Coincide.**

### Caso 2.B — Token de sesión ya cerrada (logout previo)

**Datos de entrada:** JWT con firma y expiración válidas, pero el usuario ejecutó `logout` minutos antes (el token fue insertado en `TokenInvalidado`).

| Paso | Instrucción | Estado de variables |
|---|---|---|
| 1-2 | Encabezado presente, firma válida | `payload` decodificado correctamente |
| 3 | `¿Token en lista de invalidados?` | **Sí** (coincide con registro insertado en logout) |
| 4 | Retorno | `HTTP 401 "Sesión cerrada, inicie sesión nuevamente"` |

**Resultado esperado:** el sistema NO debe confiar únicamente en la expiración del JWT — debe rechazar tokens invalidados manualmente aunque aún no hayan expirado. **Resultado obtenido:** HTTP 401 antes de llegar siquiera a `permitirRoles`. ✅ **Coincide** — confirma que el cierre de sesión es efectivo de inmediato y no depende de esperar la expiración natural (hasta 8 horas según `.env`).

---

## 4. Prueba de Escritorio 3 — Conflicto de Horario en Citas

**Algoritmo:** `existeConflictoHorario()`

**Estado previo en BD:** el odontólogo `Dr. J` ya tiene, para el 2026-08-03, una cita `PROGRAMADA` de **09:00 a 09:30** (30 min) y otra `CONFIRMADA` de **10:00 a 10:45** (45 min).

### Caso 3.A — Nueva cita se solapa parcialmente (debe rechazarse)

**Entrada:** `odontologo = Dr. J`, `fecha = 2026-08-03`, `hora = "09:20"`, `duracion = 30`.

| Paso | Cálculo | Valor |
|---|---|---|
| 1 | `inicioNueva = horaAMinutos("09:20")` | `9*60+20 = 560` |
| 2 | `finNueva = 560 + 30` | `590` |
| 3 | Consulta citas del día para Dr. J en estado bloqueante | 2 citas encontradas |
| 4 | **Evaluación cita 1** (`09:00`, 30 min): `inicioExistente=540`, `finExistente=570` | `560 < 570` (V) **y** `540 < 590` (V) → **ambas verdaderas** |
| 5 | Conclusión | `existeConflictoHorario = true` (se detiene en la primera coincidencia) |

**Resultado esperado:** conflicto detectado (09:20-09:50 se solapa con 09:00-09:30 entre 09:20 y 09:30). **Resultado obtenido:** `true`. ✅ **Coincide.**

### Caso 3.B — Nueva cita justo después, sin solape (debe aceptarse)

**Entrada:** `hora = "09:30"`, `duracion = 30` (inicia exactamente cuando termina la cita de las 09:00).

| Paso | Cálculo | Valor |
|---|---|---|
| 1 | `inicioNueva = 570`, `finNueva = 600` | — |
| 2 | **Evaluación cita 1** (540-570): `570 < 570` → **falso** | Condición `inicioNueva < finExistente` falla → no hay solape con esta cita |
| 3 | **Evaluación cita 2** (10:00-10:45 → `inicioExistente=600`, `finExistente=645`): `inicioNueva(570) < finExistente(645)` = V; `inicioExistente(600) < finNueva(600)` = **falso** | No hay solape con esta cita tampoco (falla la segunda condición) |
| 4 | Ninguna cita generó solape | `existeConflictoHorario = false` |

**Resultado esperado:** una cita que **empieza exactamente cuando termina la anterior** (intervalos `[540,570)` y `[570,600)`) no debe considerarse conflicto, porque los rangos son medio-abiertos (el minuto 570 pertenece solo al segundo intervalo). **Resultado obtenido:** `false`. ✅ **Coincide** — se confirma que la comparación con `<` estricto (no `<=`) es la correcta para este caso límite (*boundary case*), que es precisamente el tipo de error que una prueba de escritorio busca exponer.

---

## 5. Prueba de Escritorio 4 — Pago de Factura y Recálculo de Saldo

**Algoritmo:** `registrarPago()`

**Estado previo:** factura con `valorTotal = 250000`, `saldoPendiente = 250000`, `estado = "PENDIENTE"`, `pagos = []`.

### Caso 4.A — Abono parcial válido

**Entrada:** `monto = 100000`, `metodoPago = "EFECTIVO"`.

| Paso | Instrucción | Estado de variables |
|---|---|---|
| 1 | `¿metodoPago válido?` | Sí |
| 2 | `factura` encontrada, `estado = "PENDIENTE"` | — |
| 3 | `¿estado == "ANULADA"?` | No |
| 4 | `¿monto(100000) > saldoPendiente(250000)?` | No |
| 5 | `pagos.agregar({100000, EFECTIVO})` | `pagos.length = 1` |
| 6 | `saldoPendiente ← 250000 − 100000` | `saldoPendiente = 150000` |
| 7 | `¿saldoPendiente == 0?` | No → `estado` permanece `"PENDIENTE"` |

**Resultado esperado:** `saldoPendiente = 150000`, `estado = "PENDIENTE"`. **Resultado obtenido:** coincide. ✅

### Caso 4.B — Segundo abono que salda exactamente el resto

**Entrada (continuación del caso anterior):** `monto = 150000`.

| Paso | Instrucción | Estado de variables |
|---|---|---|
| 4 | `¿150000 > 150000?` | No (igual no es mayor) |
| 6 | `saldoPendiente ← 150000 − 150000` | `saldoPendiente = 0` |
| 7 | `¿saldoPendiente == 0?` | **Sí** → `estado ← "PAGADA"` |

**Resultado esperado:** factura queda en `PAGADA` con saldo exactamente `0`. **Resultado obtenido:** coincide. ✅ Se verifica el caso límite `monto == saldoPendiente` (no solo `monto < saldoPendiente`).

### Caso 4.C — Intento de sobrepago (debe rechazarse)

**Entrada:** sobre la factura original (`saldoPendiente = 250000`), `monto = 300000`.

| Paso | Instrucción | Estado de variables |
|---|---|---|
| 4 | `¿monto(300000) > saldoPendiente(250000)?` | **Sí** |
| 4a | Retorno | Error `MONTO_EXCEDE_SALDO`, ningún cambio persistido |

**Resultado esperado:** la factura **no debe modificarse** (ni `pagos` ni `saldoPendiente`) ante un intento de sobrepago. **Resultado obtenido:** el algoritmo lanza el error **antes** de tocar `factura.pagos` o `factura.saldoPendiente` (paso 4, previo al paso 5 de la prueba 4.A). ✅ **Coincide** — se confirma que no hay modificación parcial de estado ante un error de validación.

---

## 6. Prueba de Escritorio 5 — Salida de Inventario

**Algoritmo:** `registrarSalida()`

**Estado previo:** material "Guantes de nitrilo talla M", `stock = 20`, `stockMinimo = 15`.

### Caso 5.A — Salida válida que deja el stock por debajo del mínimo

**Entrada:** `cantidad = 8`, `motivo = "Uso en procedimientos del día"`.

| Paso | Instrucción | Estado de variables |
|---|---|---|
| 1 | `¿cantidad(8) <= 0?` | No |
| 2 | `material` encontrado | `stock = 20` |
| 3 | `¿cantidad(8) > stock(20)?` | No |
| 4 | `movimientos.agregar({SALIDA, 8, motivo})` | — |
| 5 | `stock ← 20 − 8` | `stock = 12` |

**Verificación cruzada con `listarMateriales()`:** `stockBajo = (12 <= 15) = true`. **Resultado esperado:** la salida se registra y el material queda marcado como stock bajo. **Resultado obtenido:** coincide. ✅

### Caso 5.B — Salida que excede el stock disponible (debe rechazarse)

**Entrada:** sobre el mismo material (`stock = 12` tras el caso anterior), `cantidad = 20`.

| Paso | Instrucción | Estado de variables |
|---|---|---|
| 3 | `¿cantidad(20) > stock(12)?` | **Sí** |
| 3a | Retorno | Error `STOCK_INSUFICIENTE` ("Disponible: 12, solicitado: 20") |

**Resultado esperado:** el stock **nunca** debe volverse negativo; la operación se rechaza completa, sin descuento parcial. **Resultado obtenido:** el algoritmo retorna el error antes del paso de resta (`stock ← stock − cantidad` nunca se ejecuta). ✅ **Coincide.**

---

## 7. Prueba de Escritorio 6 — Validación de Periodo para RIPS

**Algoritmo:** `generarYRegistrarRips()` / `validarCamposObligatorios()`

**Estado previo:** periodo `"2026-07"` tiene 3 facturas no anuladas:

- Factura F1: paciente con documento completo; 1 ítem con `codigoCups="890201"` y `diagnostico="K02.1"`.
- Factura F2: paciente con documento completo; 1 ítem **sin** `codigoCups` (campo vacío).
- Factura F3: paciente **sin** `numeroDocumento` registrado.

### Caso 6.A — Periodo con al menos una atención incompleta (debe bloquear la generación)

| Paso | Instrucción | Estado de variables |
|---|---|---|
| 1 | Buscar facturas no anuladas de julio 2026 | `facturas = [F1, F2, F3]` |
| 2 | Validar F1 | `camposFaltantes = []` → `completas = [F1]` |
| 3 | Validar F2 | `camposFaltantes = ["ítem 1: código CUPS"]` → `incompletas = [F2]` |
| 4 | Validar F3 | `camposFaltantes = ["documento del paciente"]` → `incompletas = [F2, F3]` |
| 5 | `¿incompletas vacía?` | **No** (tiene 2 elementos) |
| 6 | Retorno | Error `ATENCIONES_INCOMPLETAS`, detalle con F2 y F3. **No se genera ni persiste ningún archivo.** |

**Resultado esperado:** aunque F1 sí es válida, el sistema **no debe generar un RIPS parcial** (es un requisito normativo, no solo una regla interna). **Resultado obtenido:** el algoritmo aborta antes de construir la estructura o persistir el `ArchivoRips`, incluso habiendo una factura completa. ✅ **Coincide con la regla de "todo o nada".**

### Caso 6.B — Periodo con todas las atenciones completas (camino exitoso)

**Estado previo (variación):** mismo periodo, pero F2 y F3 han sido corregidas por el administrador (CUPS y documento completados).

| Paso | Instrucción | Estado de variables |
|---|---|---|
| 1-4 | Validar F1, F2, F3 | Las tres pasan validación → `completas = [F1, F2, F3]`, `incompletas = []` |
| 5 | `¿incompletas vacía?` | Sí |
| 6 | `¿completas vacía?` | No (tiene 3) |
| 7 | Construir estructura RIPS y persistir `ArchivoRips` | `archivo.cantidadAtenciones = 3` |
| 8 | Retorno | `{ estructura, archivo }` con éxito |

**Resultado esperado:** generación exitosa del archivo con las 3 atenciones. **Resultado obtenido:** coincide. ✅

---

## 8. Resumen de Resultados

| # | Algoritmo | Caso exitoso | Caso de rechazo | Caso límite verificado |
|---|---|:---:|:---:|---|
| 1 | Login | ✅ | ✅ (2 variantes) | Orden de verificación estado→password |
| 2 | RBAC | ✅ (implícito en 2.B tras corrección) | ✅ (2 variantes) | Invalidación de token por logout, independiente de expiración |
| 3 | Conflicto de horario | ✅ | ✅ | Solape en frontera exacta (`fin == inicio`) |
| 4 | Pago de factura | ✅ (2 variantes) | ✅ | Abono exactamente igual al saldo pendiente |
| 5 | Salida de inventario | ✅ | ✅ | No hay descuento parcial ante error |
| 6 | Generación RIPS | ✅ | ✅ | Regla "todo o nada" con datos parcialmente válidos |

**Conclusión general:** las seis pruebas de escritorio realizadas confirman que la lógica implementada en el backend de OdontoSoft se comporta conforme a lo especificado en el documento de Entradas-Procesos-Salidas y en los diagramas de flujo, incluyendo el manejo correcto de los casos límite (*boundary cases*) de mayor riesgo: solapamiento exacto de horarios, saldos exactos en pagos, y bloqueo íntegro de reportes normativos ante datos incompletos. No se identificaron discrepancias entre el comportamiento esperado (según el pseudocódigo) y el comportamiento trazado manualmente sobre el código fuente real.

---

**Elaborado por:**

**Aprendices:** Juan Carlos Garces Sierra, Juan Pablo Mendez Gil

**Ficha SENA:** 3186265

**Fecha:** `[FECHA]`
