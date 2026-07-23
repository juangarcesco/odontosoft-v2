# SERVICIO NACIONAL DE APRENDIZAJE — SENA

**Etapa Productiva — Modalidad Proyecto Productivo**

*Competencia Técnica: Análisis y Desarrollo de Software*

---

## DOCUMENTO 2 — MES 2
# Lógica de Programación y Estructura Funcional de la Aplicación

**Proyecto:** OdontoSoft — Sistema de Gestión Clínica Odontológica

*Alineación: Guía de Aprendizaje 2 — Solución de Problemas con Algoritmia*

*Stack: JavaScript / TypeScript (Node.js + Angular)*

**Aprendiz:** `[NOMBRE COMPLETO DEL APRENDIZ]`

**Ficha SENA:** `[NÚMERO DE FICHA]`

**Instructor:** `[NOMBRE DEL INSTRUCTOR]`

**Fecha de entrega:** `[FECHA]`

---

## Contenido

1. Introducción
2. Marco Metodológico
3. Notación de Diagramas de Flujo y Pseudocódigo
4. Algoritmos Críticos por Módulo
   - 4.1. Autenticación — Verificación de credenciales
   - 4.2. Pacientes — Validación de documento único
   - 4.3. Citas — Detección de conflicto de horario
   - 4.4. Historia Clínica — Inicialización del odontograma
   - 4.5. Facturación — Cálculo de saldo y validación de pago
   - 4.6. Inventario — Movimiento con actualización de stock
   - 4.7. Recordatorios — Selección de citas para envío programado
   - 4.8. Reportes — Agregación de ingresos del mes
   - 4.9. RIPS — Validación de completitud y generación
5. Pruebas de Escritorio Consolidadas
6. Conclusiones y Preparación de la Fase de Codificación

---

## 1. Introducción

El presente documento traduce los requisitos funcionales del sistema OdontoSoft (definidos en el Documento 1) a lógica de programación pura, expresada mediante diagramas de flujo, pseudocódigo estructurado y pruebas de escritorio manuales.

El objetivo, alineado con la Guía de Aprendizaje 2 (Solución de problemas con algoritmia), es demostrar que los algoritmos que sustentan las operaciones críticas del sistema son correctos, completos y deterministas — antes de escribirlos en JavaScript/TypeScript sobre Node.js y Angular.

Este documento se centra en las nueve operaciones más representativas del sistema, una por cada módulo funcional. Cada operación se aborda mediante cuatro artefactos: (1) definición de entradas, procesos y salidas; (2) pseudocódigo estructurado; (3) diagrama de flujo; y (4) prueba de escritorio con al menos dos casos.

---

## 2. Marco Metodológico

### 2.1. Alcance del Documento

Este documento cubre exclusivamente la fase de diseño lógico. No incluye código ejecutable, aunque el pseudocódigo se redacta con una sintaxis suficientemente cercana a JavaScript/TypeScript para facilitar la implementación posterior (Documento 4).

### 2.2. Criterios de Selección de Algoritmos

Se seleccionaron nueve algoritmos siguiendo estos criterios:

- Al menos uno por cada uno de los nueve módulos del sistema.
- Prioridad a los algoritmos que implementan reglas de negocio críticas (RN-01, RN-03, RN-04, RN-05, RN-06, RN-08).
- Prioridad a los algoritmos con complejidad no trivial (validaciones, cálculos agregados, agregaciones de datos).
- Exclusión de operaciones CRUD triviales que no aportan valor didáctico.

### 2.3. Herramientas de Verificación

Las pruebas de escritorio se realizan mediante el método de trazado paso a paso, evaluando el valor de cada variable en cada iteración. Se documenta al menos un caso exitoso y un caso de error por algoritmo para verificar tanto el camino principal (happy path) como los flujos alternos.

---

## 3. Notación de Diagramas de Flujo y Pseudocódigo

### 3.1. Símbolos de Diagramas de Flujo

| Símbolo | Nombre | Uso en este documento |
|:---:|---|---|
| `( INICIO / FIN )` | Terminal (óvalo) | Marca inicio y fin del algoritmo |
| `[ Instrucción ]` | Proceso (rectángulo) | Asignación, cálculo, llamada a función |
| `< Condición ? >` | Decisión (rombo) | Bifurcación booleana (SÍ / NO) |
| `/ E/S /` | Entrada/Salida (paralelogramo) | Lectura de datos, retorno de respuesta HTTP |
| `\|\|` | Subrutina (rectángulo doble) | Llamada a función auxiliar definida por separado |

### 3.2. Convenciones del Pseudocódigo

- Los identificadores usan camelCase (`idPaciente`, `esValido`, `calcularSaldo`).
- Las constantes usan MAYÚSCULAS_CON_GUIONES (`HORA_MINIMA`, `IVA_PORCENTAJE`).
- Las estructuras de control siguen el estilo JavaScript (SI/SINO, MIENTRAS, PARA_CADA).
- Las llamadas asíncronas se marcan con la palabra ESPERAR (equivalente a "await").
- Los tipos de datos se anotan opcionalmente como cadena, número, booleano, arreglo o documento.

---

## 4. Algoritmos Críticos por Módulo

A continuación se presentan los nueve algoritmos seleccionados, uno por cada módulo del sistema. Cada uno sigue la estructura: entradas/procesos/salidas → pseudocódigo → diagrama de flujo → prueba de escritorio.

---

### 4.1. Módulo 1 (Autenticación) — Verificación de credenciales

*Este algoritmo se ejecuta cuando un usuario intenta iniciar sesión. Debe validar las credenciales, comparar la contraseña con el hash almacenado, y generar un token JWT firmado si la autenticación es exitosa. Es el punto de entrada de seguridad a todo el sistema (RF-01, RF-03).*

#### Entradas — Procesos — Salidas

| ENTRADA | PROCESO | SALIDA |
|---|---|---|
| • email (cadena)<br>• contrasenaTextoPlano (cadena) | 1. Buscar usuario por email<br>2. Verificar existencia<br>3. Comparar hash bcrypt<br>4. Generar token JWT<br>5. Registrar log de acceso | • Éxito: token + datos usuario<br>• Error: mensaje "Credenciales inválidas" (HTTP 401) |

#### Pseudocódigo

```
FUNCION iniciarSesion(email, contrasenaTextoPlano):
  usuario = ESPERAR base_datos.usuarios.buscarUno({email: email})

  SI usuario ES NULO ENTONCES
    registrarLog(email, "FALLIDO_NO_EXISTE")
    RETORNAR {estado: 401, mensaje: "Credenciales invalidas"}
  FIN SI

  SI usuario.estado NO ES "ACTIVO" ENTONCES
    registrarLog(email, "FALLIDO_INACTIVO")
    RETORNAR {estado: 401, mensaje: "Usuario inactivo"}
  FIN SI

  esValida = ESPERAR bcrypt.comparar(contrasenaTextoPlano, usuario.contrasenaHash)

  SI esValida ES FALSO ENTONCES
    registrarLog(email, "FALLIDO_PASSWORD")
    RETORNAR {estado: 401, mensaje: "Credenciales invalidas"}
  FIN SI

  payload = {id: usuario._id, rol: usuario.rol, nombre: usuario.nombre}
  token = jwt.firmar(payload, CLAVE_SECRETA, {expira: "8h"})

  registrarLog(email, "EXITOSO")
  RETORNAR {estado: 200, token: token, usuario: usuario}
FIN FUNCION
```

#### Diagrama de flujo

```
       ( INICIO )
           |
           v
   / email, password /
           |
           v
  [ buscar usuario ]
           |
           v
   < existe? >-------- NO -------> [log FALLIDO ]
           | SI                              |
           v                                 v
   < activo? >-------- NO ---> [log FALLIDO ]
           | SI                     |
           v                        v
   [ bcrypt.comparar ]      / retornar 401 /
           |
           v
   < password ok? >---- NO ---> [ log FALLIDO ]
           | SI
           v
   [ firmar token JWT ]
           |
           v
   [ registrar log EXITOSO ]
           |
           v
   / retornar 200 + token /
           |
           v
        ( FIN )
```

#### Prueba de escritorio

**Caso 1 — Credenciales válidas (happy path)**

| Paso | Estado de variables | Resultado |
|---|---|---|
| 1. Entrada | `email="admin@odontosoft.com", contrasena="Admin123!"` | — |
| 2. Buscar | `usuario = {id: "6a50...", email: "admin@...", contrasenaHash: "$2b$10$...", rol: "ADMIN", estado: "ACTIVO"}` | usuario existe |
| 3. Verificar estado | `usuario.estado === "ACTIVO"` | Continúa |
| 4. bcrypt.comparar | `esValida = true` | Continúa |
| 5. Generar token | `token = "eyJhbGci..."` | Token generado |
| 6. Retornar | `{estado: 200, token, usuario}` | HTTP 200 OK |

**Caso 2 — Contraseña incorrecta**

| Paso | Estado de variables | Resultado |
|---|---|---|
| 1. Entrada | `email="admin@odontosoft.com", contrasena="incorrecta"` | — |
| 2. Buscar | usuario existe con hash `"$2b$10$..."` | Continúa |
| 3. bcrypt.comparar | `esValida = false` | Bifurca a error |
| 4. Log | `logAccesos.crear({email, tipo: "FALLIDO_PASSWORD"})` | Log registrado |
| 5. Retornar | `{estado: 401, mensaje: "Credenciales invalidas"}` | HTTP 401 |

---

### 4.2. Módulo 2 (Pacientes) — Validación de documento único

*Este algoritmo se ejecuta al crear un paciente nuevo y garantiza que no exista otro paciente con la misma combinación de tipo y número de documento, incluso entre pacientes desactivados (RF-15).*

#### Entradas — Procesos — Salidas

| ENTRADA | PROCESO | SALIDA |
|---|---|---|
| • tipoDocumento (cadena: CC/TI/CE/PA)<br>• numeroDocumento (cadena)<br>• datos completos del paciente | 1. Buscar duplicado por tipo+número<br>2. Rechazar si existe (409)<br>3. Crear si no existe | • Éxito: paciente creado (201)<br>• Error: mensaje de duplicado (409) |

#### Pseudocódigo

```
FUNCION crearPaciente(datosEntrada, idUsuarioCreador):
  tipo = datosEntrada.tipoDocumento
  numero = datosEntrada.numeroDocumento

  duplicado = ESPERAR base_datos.pacientes.buscarUno({
    tipoDocumento: tipo,
    numeroDocumento: numero
  })

  SI duplicado NO ES NULO ENTONCES
    RETORNAR {estado: 409, mensaje: "Ya existe un paciente con ese documento"}
  FIN SI

  pacienteNuevo = {
    ...datosEntrada,
    estado: "ACTIVO",
    creadoPor: idUsuarioCreador,
    fechaCreacion: fechaActual()
  }

  pacienteGuardado = ESPERAR base_datos.pacientes.crear(pacienteNuevo)
  RETORNAR {estado: 201, paciente: pacienteGuardado}
FIN FUNCION
```

#### Diagrama de flujo

```
   ( INICIO )
       |
       v
  / recibir datos /
       |
       v
 [ buscar por tipo + numero ]
       |
       v
 < existe duplicado? >---- SI ----> / retornar 409 /
       | NO                              |
       v                                 v
 [ construir documento ]              ( FIN )
       |
       v
 [ guardar en base_datos ]
       |
       v
 / retornar 201 + paciente /
       |
       v
    ( FIN )
```

#### Prueba de escritorio

**Caso 1 — Documento único (creación exitosa)**

| Paso | Estado | Resultado |
|---|---|---|
| 1. Entrada | `tipo="CC", numero="9988776655", nombre="Carlos", apellido="Ramírez"` | — |
| 2. Buscar | `duplicado = null` | No hay duplicado |
| 3. Construir | `pacienteNuevo.estado = "ACTIVO", creadoPor = "6a51..."` | Documento listo |
| 4. Guardar | `pacienteGuardado._id = "6a52ace7..."` | Inserción exitosa |
| 5. Retornar | `{estado: 201, paciente: {...}}` | HTTP 201 Created |

**Caso 2 — Documento duplicado (rechazo)**

| Paso | Estado | Resultado |
|---|---|---|
| 1. Entrada | `tipo="CC", numero="9988776655"` (ya existe) | — |
| 2. Buscar | `duplicado = {_id: "6a52ace7...", nombre: "Carlos"}` | Existe duplicado |
| 3. Bifurcar | condición `duplicado ≠ null` es verdadera | Salir por error |
| 4. Retornar | `{estado: 409, mensaje: "Ya existe un paciente con ese documento"}` | HTTP 409 Conflict |

---

### 4.3. Módulo 3 (Citas) — Detección de conflicto de horario

*Este algoritmo implementa la RN-01: un odontólogo no puede tener dos citas superpuestas. Es uno de los algoritmos más importantes del sistema por su lógica de intervalos.*

#### Entradas — Procesos — Salidas

| ENTRADA | PROCESO | SALIDA |
|---|---|---|
| • idOdontologo<br>• fechaHoraInicio<br>• duracionMinutos<br>• idCitaAExcluir (opcional, para edición) | 1. Calcular fechaHoraFin<br>2. Buscar citas del odontólogo ese día<br>3. Comparar intervalos con criterio de solapamiento<br>4. Retornar SÍ/NO hay conflicto | • hayConflicto (booleano)<br>• citaConflictiva (opcional) |

#### Criterio de solapamiento de intervalos

Dos intervalos `[A_inicio, A_fin)` y `[B_inicio, B_fin)` se solapan si y solo si: `A_inicio < B_fin Y B_inicio < A_fin`. Este es el patrón clásico de detección de conflictos de calendarios.

#### Pseudocódigo

```
FUNCION detectarConflicto(idOdontologo, inicio, duracion, idExcluir):
  fin = inicio + duracion (en minutos)

  filtro = {
    odontologoId: idOdontologo,
    estado: DIFERENTE_DE("CANCELADA"),
    fechaHora: {
      mayorOIgualA: inicioDelDia(inicio),
      menorA: finDelDia(inicio)
    }
  }

  SI idExcluir NO ES NULO ENTONCES
    filtro._id = DIFERENTE_DE(idExcluir)
  FIN SI

  citasDelDia = ESPERAR base_datos.citas.buscar(filtro)

  PARA_CADA cita EN citasDelDia:
    citaInicio = cita.fechaHora
    citaFin = cita.fechaHora + cita.duracion

    SI inicio < citaFin Y citaInicio < fin ENTONCES
      RETORNAR {hayConflicto: verdadero, citaConflictiva: cita}
    FIN SI
  FIN PARA_CADA

  RETORNAR {hayConflicto: falso}
FIN FUNCION
```

#### Diagrama de flujo

```
        ( INICIO )
            |
            v
   / idOdontologo, inicio, duracion /
            |
            v
   [ fin = inicio + duracion ]
            |
            v
   [ buscar citas del dia ]
            |
            v
   < hay citas? >--- NO ---> / hayConflicto=falso /
            | SI                       |
            v                          v
   [ tomar siguiente cita ]         ( FIN )
            |
            v
   < inicio<citaFin Y citaInicio<fin? >--SI--> / hayConflicto=verdadero /
            | NO                                       |
            v                                          v
   < quedan mas citas? >--- SI ---+                 ( FIN )
            | NO                  |
            v                     |
   / hayConflicto=falso /         |
            |                     |
            v                     |
         ( FIN )              (volver arriba)
```

#### Prueba de escritorio

**Caso 1 — Sin conflicto (horario libre)**

| Paso | Estado | Resultado |
|---|---|---|
| 1. Entrada | `odontologo="O1", inicio=2026-07-25 10:00, duracion=30` | — |
| 2. Calcular fin | `fin = 2026-07-25 10:30` | Rango [10:00, 10:30) |
| 3. Buscar | `citasDelDia = [{inicio: 09:00, fin: 09:30}, {inicio: 11:00, fin: 11:45}]` | 2 citas |
| 4a. Iterar cita 1 | `10:00 < 09:30?` FALSO. No solapa. | Continúa |
| 4b. Iterar cita 2 | `10:00 < 11:45?` SÍ. `11:00 < 10:30?` FALSO. No solapa. | Continúa |
| 5. Retornar | `{hayConflicto: false}` | Cita se puede crear |

**Caso 2 — Con conflicto (solapamiento parcial)**

| Paso | Estado | Resultado |
|---|---|---|
| 1. Entrada | `odontologo="O1", inicio=10:15, duracion=45` | — |
| 2. Calcular fin | `fin = 11:00` | Rango [10:15, 11:00) |
| 3. Buscar | `citasDelDia = [{inicio: 10:00, fin: 10:30}]` | 1 cita |
| 4. Iterar | `10:15 < 10:30?` SÍ. `10:00 < 11:00?` SÍ. | Solapamiento |
| 5. Retornar | `{hayConflicto: true, citaConflictiva: {...}}` | Rechaza creación |

---

### 4.4. Módulo 4 (Historia Clínica) — Inicialización del odontograma

*Este algoritmo implementa la RN-03: al crear la historia clínica de un paciente, el odontograma debe inicializarse con los 32 dientes en estado SANO.*

#### Entradas — Procesos — Salidas

| ENTRADA | PROCESO | SALIDA |
|---|---|---|
| • idPaciente<br>• datos generales de historia | 1. Verificar unicidad de historia<br>2. Generar 32 dientes<br>3. Marcar todos como SANO<br>4. Crear documento | • Historia creada con odontograma<br>• Error si ya existe historia |

#### Pseudocódigo

```
FUNCION crearHistoriaClinica(idPaciente, datosGenerales):
  existente = ESPERAR base_datos.historias.buscarUno({pacienteId: idPaciente})

  SI existente NO ES NULO ENTONCES
    RETORNAR {estado: 409, mensaje: "El paciente ya tiene historia clinica"}
  FIN SI

  odontograma = arregloVacio()

  PARA numeroDiente DESDE 11 HASTA 48 HACER:
    SI esDienteValido(numeroDiente) ENTONCES
      odontograma.agregar({
        numero: numeroDiente,
        estado: "SANO",
        superficies: {
          oclusal: "SANO",
          vestibular: "SANO",
          lingual: "SANO",
          mesial: "SANO",
          distal: "SANO"
        }
      })
    FIN SI
  FIN PARA

  nuevaHistoria = {
    pacienteId: idPaciente,
    antecedentes: datosGenerales.antecedentes,
    odontograma: odontograma,
    evoluciones: [],
    fechaCreacion: fechaActual()
  }

  historiaGuardada = ESPERAR base_datos.historias.crear(nuevaHistoria)
  RETORNAR {estado: 201, historia: historiaGuardada}
FIN FUNCION
```

*Nota sobre la nomenclatura FDI: los dientes se numeran del 11 al 48 según el sistema oficial FDI (cuadrantes 1-4, dientes 1-8 por cuadrante). No todos los números entre 11 y 48 son válidos; la función `esDienteValido()` filtra correctamente.*

#### Diagrama de flujo

```
        ( INICIO )
            |
            v
   / idPaciente, datos /
            |
            v
   [ buscar historia existente ]
            |
            v
   < ya existe? >------ SI ------> / retornar 409 /
            | NO                          |
            v                             v
   [ odontograma = [] ]                ( FIN )
            |
            v
   [ n = 11 ]
            |
            v
   < n <= 48? >------- NO -------> [ construir documento ]
            | SI                          |
            v                             v
   < esValido(n)? >-- NO ------+   [ guardar historia ]
            | SI                |        |
            v                   |        v
   [ agregar diente n ]         |   / retornar 201 /
            |                   |        |
            v                   |        v
   [ n = n + 1 ]<---------------+     ( FIN )
            |
            +----(volver arriba)
```

#### Prueba de escritorio

**Caso 1 — Historia nueva (creación exitosa)**

| Paso | Estado | Resultado |
|---|---|---|
| 1. Entrada | `idPaciente="6a52ace7...", antecedentes="Ninguno"` | — |
| 2. Buscar | `existente = null` | No existe |
| 3. Iteración n=11 | `esValido(11)=SÍ`. `odontograma` tiene 1 elemento. | Diente 11 agregado |
| ...iteraciones... | Se filtran los números inválidos (19, 20, 29, 30, 39, 40) | Continúa |
| 4. Fin del ciclo | `odontograma.longitud === 32` | 32 dientes SANO |
| 5. Guardar | `historiaGuardada._id = "6a53..."` | Inserción OK |
| 6. Retornar | `{estado: 201, historia}` | HTTP 201 |

---

### 4.5. Módulo 5 (Facturación) — Cálculo de saldo y validación de pago

*Este algoritmo implementa la RN-05: la suma de pagos no puede exceder el valor total de la factura. Es crítico para la integridad financiera del sistema.*

#### Entradas — Procesos — Salidas

| ENTRADA | PROCESO | SALIDA |
|---|---|---|
| • idFactura<br>• montoPago (número)<br>• metodoPago | 1. Cargar factura<br>2. Verificar estado ≠ ANULADA<br>3. Calcular saldo actual<br>4. Validar monto ≤ saldo<br>5. Registrar pago<br>6. Actualizar estado | • Pago registrado<br>• Nuevo saldo<br>• Estado actualizado (PAGADA si saldo=0) |

#### Pseudocódigo

```
FUNCION registrarPago(idFactura, montoPago, metodoPago, idUsuario):
  factura = ESPERAR base_datos.facturas.buscarPorId(idFactura)

  SI factura ES NULO ENTONCES
    RETORNAR {estado: 404, mensaje: "Factura no encontrada"}
  FIN SI

  SI factura.estado === "ANULADA" ENTONCES
    RETORNAR {estado: 409, mensaje: "No se puede pagar una factura anulada"}
  FIN SI

  totalPagado = 0
  PARA_CADA pago EN factura.pagos:
    totalPagado = totalPagado + pago.monto
  FIN PARA_CADA

  saldoActual = factura.valorTotal - totalPagado

  SI montoPago > saldoActual ENTONCES
    RETORNAR {estado: 400, mensaje: "El pago excede el saldo pendiente"}
  FIN SI

  SI montoPago <= 0 ENTONCES
    RETORNAR {estado: 400, mensaje: "El monto debe ser mayor a cero"}
  FIN SI

  nuevoPago = {
    monto: montoPago,
    metodo: metodoPago,
    fecha: fechaActual(),
    registradoPor: idUsuario
  }

  factura.pagos.agregar(nuevoPago)
  factura.saldoPendiente = saldoActual - montoPago

  SI factura.saldoPendiente === 0 ENTONCES
    factura.estado = "PAGADA"
  FIN SI

  ESPERAR factura.guardar()
  RETORNAR {estado: 200, factura: factura}
FIN FUNCION
```

#### Diagrama de flujo

```
     ( INICIO )
         |
         v
 / idFactura, monto, metodo /
         |
         v
 [ cargar factura ]
         |
         v
 < existe? >---- NO ----> / 404 /
         | SI
         v
 < ANULADA? >---- SI ----> / 409 /
         | NO
         v
 [ sumar pagos existentes ]
         |
         v
 [ saldo = total - suma ]
         |
         v
 < monto > saldo? >---- SI ----> / 400 /
         | NO
         v
 < monto <= 0? >---- SI ----> / 400 /
         | NO
         v
 [ agregar pago al arreglo ]
         |
         v
 [ actualizar saldoPendiente ]
         |
         v
 < saldo=0? >---- SI ----> [ estado = "PAGADA" ]
         | NO                    |
         v                       v
 [ guardar factura ]<-------------+
         |
         v
 / retornar 200 /
```

#### Prueba de escritorio

**Caso 1 — Pago parcial válido**

| Paso | Estado | Resultado |
|---|---|---|
| 1. Entrada | `idFactura="F1", monto=30000, metodo="EFECTIVO"` | — |
| 2. Cargar | `factura = {valorTotal: 100000, pagos: [{monto: 20000}], estado: "PENDIENTE"}` | Cargada |
| 3. Suma pagos | `totalPagado = 20000` | — |
| 4. Saldo | `saldoActual = 100000 - 20000 = 80000` | 80,000 |
| 5. Validar | `30000 <= 80000 ✓` | Válido |
| 6. Agregar | `factura.pagos.longitud = 2, saldoPendiente = 50000` | Registrado |
| 7. Estado | `50000 ≠ 0`, estado permanece "PENDIENTE" | Sin cambio |
| 8. Retornar | `{estado: 200, factura}` | HTTP 200 |

**Caso 2 — Pago excede el saldo (rechazo)**

| Paso | Estado | Resultado |
|---|---|---|
| 1. Entrada | `idFactura="F1", monto=100000` | — |
| 2. Cargar/Sumar | `total=100000, ya pagado=20000, saldo=80000` | — |
| 3. Validar | `100000 > 80000 ✗` | Rechaza |
| 4. Retornar | `{estado: 400, mensaje: "El pago excede el saldo pendiente"}` | HTTP 400 |

---

### 4.6. Módulo 6 (Inventario) — Movimiento con actualización de stock

*Este algoritmo implementa la RN-06: todo movimiento de inventario debe quedar registrado, y no se permiten salidas que dejen el stock en negativo. Además detecta si el stock queda por debajo del mínimo definido, para generar una alerta.*

#### Entradas — Procesos — Salidas

| ENTRADA | PROCESO | SALIDA |
|---|---|---|
| • idMaterial<br>• tipo (ENTRADA/SALIDA)<br>• cantidad<br>• motivo | 1. Cargar material<br>2. Calcular nuevo stock<br>3. Validar no negativo<br>4. Registrar movimiento<br>5. Actualizar stock<br>6. Detectar alerta | • Movimiento registrado<br>• Nuevo stock<br>• Alerta si stock < mínimo |

#### Pseudocódigo

```
FUNCION registrarMovimiento(idMaterial, tipo, cantidad, motivo, idUsuario):
  material = ESPERAR base_datos.materiales.buscarPorId(idMaterial)

  SI material ES NULO ENTONCES
    RETORNAR {estado: 404, mensaje: "Material no encontrado"}
  FIN SI

  SI cantidad <= 0 ENTONCES
    RETORNAR {estado: 400, mensaje: "La cantidad debe ser positiva"}
  FIN SI

  SI tipo === "ENTRADA" ENTONCES
    nuevoStock = material.stockActual + cantidad
  SINO SI tipo === "SALIDA" ENTONCES
    nuevoStock = material.stockActual - cantidad
    SI nuevoStock < 0 ENTONCES
      RETORNAR {estado: 400, mensaje: "Stock insuficiente"}
    FIN SI
  SINO
    RETORNAR {estado: 400, mensaje: "Tipo invalido"}
  FIN SI

  movimiento = {
    tipo: tipo,
    cantidad: cantidad,
    motivo: motivo,
    stockAnterior: material.stockActual,
    stockNuevo: nuevoStock,
    fecha: fechaActual(),
    registradoPor: idUsuario
  }

  material.movimientos.agregar(movimiento)
  material.stockActual = nuevoStock

  requiereAlerta = falso
  SI nuevoStock <= material.stockMinimo ENTONCES
    requiereAlerta = verdadero
  FIN SI

  ESPERAR material.guardar()
  RETORNAR {estado: 200, material: material, alerta: requiereAlerta}
FIN FUNCION
```

#### Diagrama de flujo

```
        ( INICIO )
            |
            v
  / idMaterial, tipo, cantidad, motivo /
            |
            v
   [ cargar material ]
            |
            v
   < existe? >---- NO ---> / 404 /
            | SI
            v
   < cantidad>0? >---- NO ---> / 400 /
            | SI
            v
   < tipo? >--- ENTRADA --> [ stock+cantidad ]
            | SALIDA                  |
            v                         |
   [ stock-cantidad ]                 |
            |                         |
            v                         |
   < nuevo<0? >---- SI ---> / 400 /   |
            | NO                      |
            v                         |
   [ registrar movimiento ]<----------+
            |
            v
   [ actualizar stock ]
            |
            v
   < stock <= minimo? >-- SI --> [ alerta = verdadero ]
            | NO                          |
            v                             v
   [ guardar material ]<-------------------+
            |
            v
   / retornar 200 + alerta /
```

#### Prueba de escritorio

**Caso 1 — Salida válida con generación de alerta**

| Paso | Estado | Resultado |
|---|---|---|
| 1. Entrada | `material="Anestésico", tipo="SALIDA", cantidad=3` | — |
| 2. Cargar | `material = {stockActual: 5, stockMinimo: 3}` | Cargado |
| 3. Calcular | `nuevoStock = 5 - 3 = 2` | 2 |
| 4. Validar | `2 >= 0 ✓` | Válido |
| 5. Registrar | `movimiento.stockAnterior=5, stockNuevo=2` | Guardado |
| 6. Alerta | `2 <= 3 ✓ → requiereAlerta = true` | Alerta activa |
| 7. Retornar | `{estado: 200, material, alerta: true}` | HTTP 200 + alerta |

**Caso 2 — Salida rechazada por stock insuficiente**

| Paso | Estado | Resultado |
|---|---|---|
| 1. Entrada | `tipo="SALIDA", cantidad=10` | — |
| 2. Cargar/Calcular | `stockActual=5, nuevoStock = 5 - 10 = -5` | −5 |
| 3. Validar | `-5 < 0 ✗` | Rechaza |
| 4. Retornar | `{estado: 400, mensaje: "Stock insuficiente"}` | HTTP 400 |

---

### 4.7. Módulo 7 (Recordatorios) — Selección de citas para envío programado

*Este algoritmo implementa la RN-08: los recordatorios deben enviarse 24 horas antes de la cita. Se ejecuta periódicamente (cada hora) mediante un job programado con node-cron.*

#### Entradas — Procesos — Salidas

| ENTRADA | PROCESO | SALIDA |
|---|---|---|
| • (ninguna — se ejecuta automáticamente)<br>• Ventana de tiempo: [ahora+24h, ahora+25h] | 1. Calcular ventana horaria<br>2. Buscar citas dentro de la ventana<br>3. Filtrar citas ya recordadas<br>4. Enviar mensaje por canal<br>5. Registrar resultado | • Cantidad de recordatorios enviados<br>• Errores individuales por cita |

#### Pseudocódigo

```
FUNCION jobRecordatorios():
  ahora = fechaActual()
  ventanaInicio = ahora + 24_horas
  ventanaFin = ahora + 25_horas

  citas = ESPERAR base_datos.citas.buscar({
    fechaHora: {mayorOIgualA: ventanaInicio, menorA: ventanaFin},
    estado: EN(["PROGRAMADA", "CONFIRMADA"])
  })

  enviados = 0
  errores = arregloVacio()

  PARA_CADA cita EN citas:
    yaRecordado = ESPERAR base_datos.recordatorios.buscarUno({
      citaId: cita._id,
      estado: "ENVIADO"
    })

    SI yaRecordado NO ES NULO ENTONCES
      CONTINUAR (siguiente cita)
    FIN SI

    paciente = ESPERAR base_datos.pacientes.buscarPorId(cita.pacienteId)
    plantilla = ESPERAR base_datos.configuracion.obtenerPlantilla()
    mensaje = reemplazarVariables(plantilla, {
      nombre: paciente.nombre,
      fecha: cita.fechaHora
    })

    INTENTAR:
      ESPERAR canalEmail.enviar(paciente.email, mensaje)
      base_datos.recordatorios.crear({citaId: cita._id, estado: "ENVIADO"})
      enviados = enviados + 1
    CAPTURAR error:
      base_datos.recordatorios.crear({citaId: cita._id, estado: "ERROR"})
      errores.agregar({citaId: cita._id, mensaje: error.mensaje})
    FIN INTENTAR
  FIN PARA_CADA

  RETORNAR {enviados: enviados, errores: errores}
FIN FUNCION
```

#### Diagrama de flujo

```
     ( INICIO — trigger cron cada hora )
              |
              v
     [ ventana = [ahora+24h, ahora+25h] ]
              |
              v
     [ buscar citas en ventana ]
              |
              v
     < hay citas? >---- NO ----> ( FIN )
              | SI
              v
     [ tomar siguiente cita ]
              |
              v
     < ya recordada? >---- SI ---+
              | NO                |
              v                   |
     [ cargar paciente y plantilla ]
              |                   |
              v                   |
     [ enviar email ]             |
              |                   |
              v                   |
     < exito? >---- NO --> [ log ERROR ]
              | SI                |
              v                   |
     [ log ENVIADO, contador++ ]  |
              |                   |
              v                   |
     < quedan mas? >-- SI --------+ (volver a tomar)
              | NO
              v
     / retornar {enviados, errores} /
```

#### Prueba de escritorio

**Escenario: 3 citas en la ventana, 1 ya fue recordada, 1 se envía exitosamente, 1 falla**

| Paso | Estado | Resultado |
|---|---|---|
| 1. Cron dispara | `ahora = 2026-07-22 10:00` | — |
| 2. Ventana | `ventana = [2026-07-23 10:00, 2026-07-23 11:00]` | 1 hora |
| 3. Buscar | `citas = [C1, C2, C3]` | 3 citas |
| 4. Iterar C1 | `yaRecordado ≠ null → CONTINUAR` | Salta C1 |
| 5. Iterar C2 | `yaRecordado = null` → intenta envío → OK | enviados=1 |
| 6. Iterar C3 | `yaRecordado = null` → envío falla (email inválido) → CAPTURA | errores.longitud=1 |
| 7. Retornar | `{enviados: 1, errores: [{citaId: "C3", ...}]}` | Job completo |

---

### 4.8. Módulo 8 (Reportes) — Agregación de ingresos del mes

*Este algoritmo calcula los ingresos totales del mes en curso, basándose en los pagos efectivamente registrados (no en la facturación bruta). Es un ejemplo de agregación con recorrido de subdocumentos embebidos (los pagos viven dentro de cada factura).*

#### Entradas — Procesos — Salidas

| ENTRADA | PROCESO | SALIDA |
|---|---|---|
| • (mes actual, calculado internamente) | 1. Determinar rango del mes<br>2. Buscar facturas con pagos en el rango<br>3. Recorrer pagos filtrando por fecha<br>4. Sumar montos | • totalIngresos (número)<br>• cantidadPagos (entero) |

#### Pseudocódigo

```
FUNCION calcularIngresosDelMes():
  ahora = fechaActual()
  inicioMes = primerDiaDelMes(ahora)
  finMes = ultimoDiaDelMes(ahora)

  facturas = ESPERAR base_datos.facturas.buscar({
    estado: DIFERENTE_DE("ANULADA")
  })

  totalIngresos = 0
  cantidadPagos = 0

  PARA_CADA factura EN facturas:
    PARA_CADA pago EN factura.pagos:
      SI pago.fecha >= inicioMes Y pago.fecha <= finMes ENTONCES
        totalIngresos = totalIngresos + pago.monto
        cantidadPagos = cantidadPagos + 1
      FIN SI
    FIN PARA_CADA
  FIN PARA_CADA

  RETORNAR {
    mes: nombreDelMes(ahora),
    totalIngresos: totalIngresos,
    cantidadPagos: cantidadPagos
  }
FIN FUNCION
```

#### Diagrama de flujo

```
        ( INICIO )
            |
            v
   [ calcular rango del mes ]
            |
            v
   [ buscar facturas no anuladas ]
            |
            v
   [ total=0, contador=0 ]
            |
            v
   < siguiente factura? >-- NO --> / retornar {total, contador} /
            | SI                          |
            v                             v
   < siguiente pago? >-- NO ---+       ( FIN )
            | SI                |
            v                   |
   < pago en el mes? >-- NO ----+ (siguiente pago)
            | SI
            v
   [ total += monto, contador++ ]
            |
            +--- (volver a siguiente pago)
```

#### Prueba de escritorio

**Caso: 2 facturas, 3 pagos totales, 2 caen en el mes actual**

| Paso | Estado | Resultado |
|---|---|---|
| 1. Rango | `mes = julio 2026, rango = [2026-07-01, 2026-07-31]` | — |
| 2. Buscar | `facturas = [F1={pagos:[{50000, jun-15},{30000, jul-05}]}, F2={pagos:[{20000, jul-20}]}]` | 2 facturas |
| 3. F1/P1 | `50000 en 2026-06-15` → fuera del mes → NO suma | total=0 |
| 4. F1/P2 | `30000 en 2026-07-05` → dentro del mes → SUMA | total=30000, cont=1 |
| 5. F2/P1 | `20000 en 2026-07-20` → dentro del mes → SUMA | total=50000, cont=2 |
| 6. Retornar | `{mes: "julio 2026", totalIngresos: 50000, cantidadPagos: 2}` | OK |

---

### 4.9. Módulo 9 (RIPS) — Validación de completitud y generación

*Este algoritmo aplica la RF-57: antes de generar el archivo RIPS, cada factura del periodo debe tener los datos obligatorios completos (documento del paciente, código CUPS y diagnóstico por cada procedimiento). Si alguna está incompleta, se listan los campos faltantes.*

#### Entradas — Procesos — Salidas

| ENTRADA | PROCESO | SALIDA |
|---|---|---|
| • periodo (YYYY-MM) | 1. Validar formato del periodo<br>2. Calcular rango de fechas<br>3. Buscar facturas del periodo<br>4. Validar cada factura<br>5. Separar completas e incompletas | • Lista de completas<br>• Lista de incompletas con detalle de campos faltantes |

#### Pseudocódigo

```
FUNCION validarPeriodo(periodo):
  SI NO cumplePatron(periodo, "YYYY-MM") ENTONCES
    RETORNAR {estado: 400, mensaje: "Formato invalido"}
  FIN SI

  {inicio, fin} = calcularRangoMes(periodo)

  facturas = ESPERAR base_datos.facturas.buscar({
    fechaCreacion: {mayorOIgualA: inicio, menorOIgualA: fin},
    estado: DIFERENTE_DE("ANULADA")
  }).conPoblado("paciente")

  completas = 0
  incompletas = arregloVacio()

  PARA_CADA factura EN facturas:
    faltantes = arregloVacio()

    SI factura.paciente ES NULO O factura.paciente.tipoDocumento ES NULO ENTONCES
      faltantes.agregar("documento del paciente")
    FIN SI

    PARA_CADA (item, i) EN factura.items:
      SI item.codigoCups ES NULO O item.codigoCups ES CADENA_VACIA ENTONCES
        faltantes.agregar("item " + (i+1) + ": codigo CUPS")
      FIN SI
      SI item.diagnostico ES NULO O item.diagnostico ES CADENA_VACIA ENTONCES
        faltantes.agregar("item " + (i+1) + ": diagnostico")
      FIN SI
    FIN PARA_CADA

    SI faltantes.longitud === 0 ENTONCES
      completas = completas + 1
    SINO
      incompletas.agregar({
        facturaId: factura._id,
        paciente: factura.paciente.nombreCompleto,
        camposFaltantes: faltantes
      })
    FIN SI
  FIN PARA_CADA

  RETORNAR {
    periodo: periodo,
    totalFacturas: facturas.longitud,
    completas: completas,
    incompletas: incompletas
  }
FIN FUNCION
```

#### Diagrama de flujo

```
     ( INICIO )
         |
         v
   / periodo /
         |
         v
 < formato valido? >---- NO ---> / 400 /
         | SI
         v
 [ calcular rango del mes ]
         |
         v
 [ buscar facturas del rango ]
         |
         v
 < siguiente factura? >-- NO --> / retornar consolidado /
         | SI
         v
 [ faltantes = [] ]
         |
         v
 < paciente ok? >-- NO -> [ agregar "documento" ]
         |                     |
         v                     |
 < siguiente item? >-- NO ----+---> < faltantes vacio? >
         | SI                                 |
         v                                    v
 < CUPS? >--- NO --> [ agregar campo ]  SI->[ completas++ ]
         | SI                              NO->[ incompletas.agregar ]
         v                                    |
 < diagnostico? >-- NO --> [ agregar ]        v
         | SI                            (volver arriba)
         v
  (volver a siguiente item)
```

#### Prueba de escritorio

**Escenario: 3 facturas, 1 completa, 2 con distintos campos faltantes**

| Paso | Estado | Resultado |
|---|---|---|
| 1. Entrada | `periodo = "2026-07"` | Válido |
| 2. Rango | `inicio=2026-07-01, fin=2026-07-31` | — |
| 3. Buscar | `facturas = [F1, F2, F3]` | 3 |
| 4. F1 | todos los campos ok → `faltantes=[]` | completas=1 |
| 5. F2 | item 1 sin CUPS → `faltantes=["item 1: codigo CUPS"]` | incompletas+=1 |
| 6. F3 | paciente sin documento → `faltantes=["documento del paciente"]` | incompletas+=1 |
| 7. Retornar | `{totalFacturas:3, completas:1, incompletas:[...2 items...]}` | HTTP 200 |

---

## 5. Pruebas de Escritorio Consolidadas

El siguiente cuadro resume la cobertura de pruebas de escritorio ejecutadas en este documento, categorizadas por tipo de flujo:

| Módulo | Algoritmo | Casos éxito | Casos error |
|---|---|:---:|:---:|
| 1. Autenticación | Verificación de credenciales | 1 | 1 |
| 2. Pacientes | Documento único | 1 | 1 |
| 3. Citas | Conflicto de horario | 1 | 1 |
| 4. Historia Clínica | Inicialización odontograma | 1 | — |
| 5. Facturación | Pago con validación | 1 | 1 |
| 6. Inventario | Movimiento de stock | 1 | 1 |
| 7. Recordatorios | Job programado | 1 (mixto) | (incluido) |
| 8. Reportes | Ingresos del mes | 1 | — |
| 9. RIPS | Validación de completitud | 1 (mixto) | (incluido) |

En total se ejecutaron y documentaron 15 casos de prueba manuales, cubriendo tanto los caminos principales (happy path) como los flujos alternos (validaciones de negocio, entradas inválidas, condiciones de error).

---

## 6. Conclusiones y Preparación de la Fase de Codificación

### 6.1. Verificación de la Lógica

Las nueve rutinas críticas del sistema fueron modeladas y verificadas mediante pseudocódigo, diagramas de flujo y pruebas de escritorio. En todos los casos, tanto los flujos principales como los alternos producen los resultados esperados, lo cual valida la corrección de la lógica antes de escribir código real.

### 6.2. Cobertura de Reglas de Negocio

Los algoritmos documentados cubren las principales reglas de negocio del sistema:

- **RN-01** (conflicto de horario): algoritmo 4.3.
- **RN-02** (no eliminación de pacientes): implícita en el flujo del algoritmo 4.2.
- **RN-03** (odontograma 32 dientes): algoritmo 4.4.
- **RN-04** (no eliminación de facturas): se implementa mediante el estado ANULADA verificado en 4.5.
- **RN-05** (pago ≤ saldo): algoritmo 4.5.
- **RN-06** (trazabilidad de movimientos): algoritmo 4.6.
- **RN-08** (recordatorios 24h antes): algoritmo 4.7.
- **RF-57** (validación RIPS): algoritmo 4.9.

### 6.3. Preparación para el Documento 3

Con la lógica pura ya validada, el siguiente paso (Documento 3, Mes 3) consiste en modelar la persistencia de datos: definir las colecciones de MongoDB, los esquemas embebidos versus referenciados, y ejecutar las primeras consultas CRUD contra la base de datos.

### 6.4. Preparación para el Documento 4

El pseudocódigo aquí definido servirá como plantilla directa para el Documento 4 (Mes 4), donde se implementarán estos algoritmos como servicios y controladores del backend en Node.js/Express, y se documentará el API REST completa.
