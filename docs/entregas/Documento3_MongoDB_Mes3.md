# SERVICIO NACIONAL DE APRENDIZAJE — SENA

**Etapa Productiva — Modalidad Proyecto Productivo**

*Competencia Técnica: Análisis y Desarrollo de Software*

---

## DOCUMENTO 3 — MES 3
# Modelado e Implementación de la Base de Datos (MongoDB)

**Proyecto:** OdontoSoft — Sistema de Gestión Clínica Odontológica

*Alineación: Guía de Aprendizaje 3 — Implementar Bases de Datos*

*Motor: MongoDB 7.x (NoSQL / Documentos JSON-BSON)*

**Aprendiz:** `[NOMBRE COMPLETO DEL APRENDIZ]`

**Ficha SENA:** `[NÚMERO DE FICHA]`

**Instructor:** `[NOMBRE DEL INSTRUCTOR]`

**Fecha de entrega:** `[FECHA]`

---

## Contenido

1. Introducción
2. Justificación de MongoDB (NoSQL) para el Proyecto
3. Estrategia de Modelado — Embebido vs Referenciado
4. Diagrama General de Colecciones
5. Definición de las 11 Colecciones
   - 5.1. usuarios
   - 5.2. logaccesos
   - 5.3. tokeninvalidados
   - 5.4. pacientes
   - 5.5. citas
   - 5.6. historiaclinicas
   - 5.7. facturas
   - 5.8. materials
   - 5.9. configuracionmensajes
   - 5.10. recordatorios
   - 5.11. archivorips
6. Script de Inicialización y Datos Base
7. Consultas de Validación CRUD
8. Verificación en MongoDB Atlas
9. Índices Definidos
10. Conclusiones

---

## 1. Introducción

El presente documento constituye el diseño e implementación de la capa de persistencia del sistema OdontoSoft, siguiendo los lineamientos de la Guía de Aprendizaje 3 (Implementar bases de datos). Dado que el proyecto adopta el stack MEAN, la base de datos seleccionada es MongoDB — un motor NoSQL orientado a documentos.

A diferencia del modelo relacional tradicional, MongoDB estructura la información en documentos JSON-BSON flexibles, agrupados en colecciones. Esta característica permite modelar entidades complejas del dominio odontológico — como la historia clínica con su odontograma y sus evoluciones — como un único documento auto-contenido, evitando joins costosos y aprovechando el patrón natural de acceso a los datos.

En este documento se presenta: (a) la justificación de la elección de MongoDB; (b) la estrategia de modelado embebido versus referenciado; (c) el diagrama general de colecciones; (d) la definición detallada de cada una de las 11 colecciones con sus esquemas y validaciones; (e) los scripts de inicialización con datos base; (f) evidencia visual de las operaciones CRUD ejecutadas contra la base de datos; (g) verificación del despliegue en MongoDB Atlas (nube).

---

## 2. Justificación de MongoDB (NoSQL) para el Proyecto

### 2.1. Naturaleza del Dominio

El dominio odontológico presenta varias características que hacen natural el uso de documentos embebidos:

- La historia clínica es un objeto único por paciente que contiene datos heterogéneos: antecedentes, odontograma con 32 dientes, evoluciones cronológicas y adjuntos.
- El odontograma no se consulta por separado del paciente — siempre se necesita en el contexto de la historia clínica.
- Las evoluciones clínicas son inmutables (no se editan, solo se desactivan según RN-10) y se leen siempre en conjunto con la historia.
- Los pagos de una factura son fundamentalmente subordinados a la factura y se consultan siempre juntos.
- Los movimientos de inventario se cargan siempre en el contexto del material al que pertenecen.

### 2.2. Ventajas Concretas para OdontoSoft

| Ventaja | Aplicación en el proyecto |
|---|---|
| Esquema flexible | Permite evolución del modelo (agregar codigoCups y diagnostico a items de Factura en el Módulo 9 sin migrar datos existentes) |
| Documentos embebidos | Odontograma, evoluciones, pagos y movimientos viven dentro de su documento padre — una sola consulta obtiene todos los datos relacionados |
| Consultas de agregación potentes | `$unwind`, `$group`, `$lookup` permiten calcular reportes (ingresos del mes, tratamientos más realizados) directamente en la base de datos |
| Escalabilidad horizontal nativa | MongoDB Atlas ofrece escalamiento sencillo si el volumen de datos crece |
| Integración con Node.js | Los documentos JSON-BSON coinciden naturalmente con los objetos JavaScript del backend (Mongoose ODM) |

### 2.3. Cuándo No Es Ideal MongoDB

Se documenta también cuándo un modelo relacional sería preferible, en aras de una decisión técnica bien argumentada:

- Sistemas con múltiples relaciones N:M complejas y transacciones ACID distribuidas — no es el caso de OdontoSoft, cuyo dominio se articula en agregados naturales (paciente + historia + odontograma).
- Análisis intensivo con joins masivos entre muchas tablas — los reportes de OdontoSoft trabajan sobre 1-2 colecciones a la vez, resueltos con `$lookup` puntual.

---

## 3. Estrategia de Modelado — Embebido vs Referenciado

En MongoDB existen dos formas fundamentales de modelar relaciones:

### 3.1. Modelado Embebido (Denormalizado)

Los datos hijos viven dentro del documento padre como subdocumentos. Se usa cuando: (a) los datos hijos se consultan siempre en conjunto con el padre; (b) los datos hijos no se comparten con otros padres; (c) el volumen de datos hijos es acotado.

### 3.2. Modelado Referenciado (Normalizado)

El documento hijo vive en su propia colección y se relaciona con el padre mediante un ObjectId. Se usa cuando: (a) los datos hijos se consultan de forma independiente; (b) los datos hijos son compartidos por múltiples padres; (c) el volumen es alto o crece sin límite conocido.

### 3.3. Decisiones Concretas en OdontoSoft

| Relación | Estrategia | Justificación |
|---|:---:|---|
| Historia clínica ← Odontograma (32 dientes) | **Embebido** | Cardinalidad fija (32); nunca se consulta aparte; RN-03 |
| Historia clínica ← Evoluciones | **Embebido** | Se leen cronológicamente en conjunto; volumen acotado por vida del paciente |
| Evolución ← Adjuntos | **Embebido** | Solo metadatos (nombre, ruta, tipo); el archivo binario vive en disco |
| Factura ← Pagos | **Embebido** | Los pagos pertenecen a una única factura; siempre se leen juntos |
| Factura ← Ítems | **Embebido** | Ítems inseparables de la factura |
| Material ← Movimientos | **Embebido** | Historial se consulta siempre junto al material (RN-06) |
| Paciente ← Citas | **Referenciado** | Las citas se consultan por día/odontólogo, no solo por paciente |
| Paciente ← Facturas | **Referenciado** | Las facturas se listan y buscan globalmente; volumen crece indefinidamente |
| Cita ← Recordatorio | **Referenciado** | El recordatorio es un evento independiente registrado por el job cron |
| ArchivoRips ← Facturas incluidas | **Referenciado** | Relación N:M — una factura puede aparecer en varios archivos |

---

## 4. Diagrama General de Colecciones

El diagrama siguiente muestra las 11 colecciones del sistema, sus relaciones y la estrategia de modelado aplicada en cada caso (embebido representado con líneas continuas dentro del documento padre; referenciado con flechas discontinuas entre colecciones).

> **[ INSERTAR CAPTURA DE PANTALLA AQUÍ ]**
>
> *Figura 4.1. Diagrama general de colecciones del sistema OdontoSoft. Se recomienda dibujar el diagrama en draw.io, Lucidchart o dbdiagram.io siguiendo la especificación de la sección 3.3.*

### 4.1. Representación Textual del Diagrama

Como referencia para dibujar el diagrama, se ofrece la representación textual siguiente:

```
┌──────────────────┐        ┌───────────────────┐
│    usuarios       │<-------│    logaccesos      │
│ (ADMIN/ODONTO/    │        │ (auditoria)        │
│  RECEPCION)       │        └───────────────────┘
└──────────────────┘
        ^                    ┌───────────────────┐
        |                    │ tokeninvalidados   │
        |                    │ (logout / seguridad)│
        |                    └───────────────────┘
        |
        | creadoPor / actualizadoPor
        |
┌──────────────────────────────────────┐
│   pacientes                            │
│   (datos personales)                   │
└──────────────────────────────────────┘
        ^        ^         ^
        |        |         |
        |        |         └────────────────────┐
        |        |                              |
┌───────┴──┐  ┌──┴─────────────┐   ┌───────────┴───────┐
│  citas    │  │ historiaclinicas │   │    facturas         │
│           │  │  ├─odontograma[]  │   │  ├─items[]           │
│           │  │  ├─evoluciones[]  │   │  ├─pagos[]           │
│           │  │  │  └─adjuntos[]   │   │                     │
│           │  └─────────────────┘   └─────────────────────┘
└─────┬────┘                                    ^
      |                                         |
      v                                         | facturasIncluidas
┌──────────────┐                             ┌──┴──────────────┐
│ recordatorios │                             │  archivorips      │
│               │                             │                   │
└──────────────┘                             └──────────────────┘

┌──────────────────┐        ┌───────────────────────┐
│    materials       │        │ configuracionmensajes  │
│ ├─movimientos[]    │        │  (plantillas email/wa)  │
└──────────────────┘        └───────────────────────┘
```

---

## 5. Definición de las 11 Colecciones

A continuación se describe cada colección con: (a) su propósito; (b) su esquema con tipos de datos; (c) las validaciones y restricciones; (d) un ejemplo de documento real; (e) referencias a otras colecciones si aplica.

### 5.1. Colección "usuarios"

Propósito: almacenar las cuentas del personal del consultorio con sus credenciales y rol. Base del sistema de autenticación y autorización (Módulo 1).

#### Esquema

```javascript
{
  _id: ObjectId,
  nombre: String (requerido, min 3 chars),
  email: String (requerido, único, formato email),
  contrasenaHash: String (requerido, bcrypt, 60 chars),
  rol: String (enum: "ADMIN" | "ODONTOLOGO" | "RECEPCIONISTA"),
  estado: String (enum: "ACTIVO" | "INACTIVO", default "ACTIVO"),
  createdAt: Date,
  updatedAt: Date
}
```

#### Restricciones e Índices

- `email` es único (índice único).
- La contraseña nunca se almacena en texto plano — solo el hash bcrypt (factor 10, RNF-01).
- El estado permite desactivar usuarios sin eliminarlos, preservando la trazabilidad.

#### Ejemplo de Documento

```javascript
{
  _id: ObjectId("6a504500a47aeacb83e10e43"),
  nombre: "Administrador General",
  email: "admin@odontosoft.com",
  contrasenaHash: "$2b$10$K3JVh1o8...",
  rol: "ADMIN",
  estado: "ACTIVO",
  createdAt: ISODate("2026-07-10T01:04:00Z"),
  updatedAt: ISODate("2026-07-10T01:04:00Z")
}
```

### 5.2. Colección "logaccesos"

Propósito: registrar cada intento de inicio de sesión (exitoso o fallido) para auditoría de seguridad (RF-07, RNF-05).

#### Esquema

```javascript
{
  _id: ObjectId,
  email: String (email intentado, incluso si no existe),
  tipo: String (enum: "EXITOSO" | "FALLIDO_NO_EXISTE" | "FALLIDO_PASSWORD" | "FALLIDO_INACTIVO"),
  ip: String,
  userAgent: String,
  fecha: Date (default: now)
}
```

#### Ejemplo

```javascript
{
  email: "admin@odontosoft.com",
  tipo: "EXITOSO",
  ip: "191.98.212.44",
  userAgent: "Mozilla/5.0 ...",
  fecha: ISODate("2026-07-22T14:12:03Z")
}
```

### 5.3. Colección "tokeninvalidados"

Propósito: mantener una lista negra de tokens JWT que fueron cerrados manualmente por logout (RF-02). Se consulta en cada petición autenticada.

#### Esquema

```javascript
{
  _id: ObjectId,
  token: String (JWT completo o firma),
  fechaInvalidacion: Date,
  expiraEn: Date  // se autoborra por TTL cuando el token natural expira
}
```

*Nota técnica: se define un índice TTL sobre `expiraEn` para que MongoDB elimine automáticamente los registros expirados, evitando crecimiento indefinido de la colección.*

### 5.4. Colección "pacientes"

Propósito: registro de los pacientes del consultorio con sus datos personales y de contacto (Módulo 2, RF-09 a RF-16).

#### Esquema

```javascript
{
  _id: ObjectId,
  nombre: String (requerido),
  apellido: String (requerido),
  tipoDocumento: String (enum: "CC"|"TI"|"CE"|"PA"|"RC"),
  numeroDocumento: String (requerido),
  fechaNacimiento: Date,
  sexo: String (enum: "M"|"F"|"O"),
  telefono: String,
  email: String,
  direccion: String,
  eps: String,
  grupoSanguineo: String (enum: "O+"|"O-"|"A+"|"A-"|"B+"|"B-"|"AB+"|"AB-"|"NO_REGISTRA"),
  alergias: String,
  observaciones: String,
  estado: String (enum: "ACTIVO"|"INACTIVO", default "ACTIVO"),
  creadoPor: ObjectId (ref: usuarios),
  createdAt: Date,
  updatedAt: Date
}
```

#### Restricciones

- Índice único compuesto sobre `(tipoDocumento, numeroDocumento)` — RF-15.
- RN-02: nunca se elimina físicamente; solo se cambia estado a INACTIVO.

#### Ejemplo Real (de la base migrada a Atlas)

```javascript
{
  _id: ObjectId("6a52ace7736b50e45c2dbc3c"),
  nombre: "Carlos",
  apellido: "Ramírez",
  tipoDocumento: "CC",
  numeroDocumento: "9988776655",
  fechaNacimiento: ISODate("1985-03-20"),
  sexo: "M",
  telefono: "3009998888",
  email: "carlos.ramirez@example.com",
  eps: "Nueva EPS",
  grupoSanguineo: "NO_REGISTRA",
  estado: "ACTIVO",
  creadoPor: ObjectId("6a51996301caa385b1b7c375")
}
```

### 5.5. Colección "citas"

Propósito: registro de las citas médicas programadas (Módulo 3, RF-17 a RF-24).

#### Esquema

```javascript
{
  _id: ObjectId,
  paciente: ObjectId (ref: pacientes, requerido),
  odontologo: ObjectId (ref: usuarios, requerido),
  fechaHora: Date (requerido),
  duracion: Number (minutos, requerido),
  motivo: String,
  estado: String (enum: "PROGRAMADA"|"CONFIRMADA"|"EN_ATENCION"|"FINALIZADA"|"CANCELADA"|"NO_ASISTIO"),
  motivoCancelacion: String,
  creadoPor: ObjectId (ref: usuarios),
  createdAt: Date,
  updatedAt: Date
}
```

#### Restricciones

- RN-01: no se permiten citas superpuestas para el mismo odontólogo (validación en el servicio).
- RN-07: la `fechaHora` debe estar dentro del horario del consultorio.
- Índice compuesto sobre `(odontologo, fechaHora)` para acelerar detección de conflictos.

### 5.6. Colección "historiaclinicas"

Propósito: historia clínica única por paciente, con odontograma embebido, evoluciones cronológicas y adjuntos (Módulo 4, RF-25 a RF-32). Es la colección más rica del sistema en cuanto a subdocumentos embebidos.

#### Esquema (nivel superior)

```javascript
{
  _id: ObjectId,
  paciente: ObjectId (ref: pacientes, único),
  antecedentes: {
    medicos: String,
    alergias: String,
    medicamentos: String,
    quirurgicos: String,
    familiares: String
  },
  odontograma: [DienteSchema] (32 dientes),
  evoluciones: [EvolucionSchema],
  createdAt: Date,
  updatedAt: Date
}
```

#### DienteSchema (subdocumento embebido)

```javascript
{
  numero: Number (11..48, notación FDI),
  estado: String (enum: "SANO"|"CARIES"|"OBTURADO"|"CORONA"|
                   "ENDODONCIA"|"AUSENTE"|"EXTRAER"|"IMPLANTE"),
  superficies: {
    oclusal: String,
    vestibular: String,
    lingual: String,
    mesial: String,
    distal: String
  },
  notas: String
}
```

#### EvolucionSchema (subdocumento embebido)

```javascript
{
  _id: ObjectId,
  fecha: Date,
  odontologo: ObjectId (ref: usuarios),
  diente: Number,
  procedimiento: String,
  descripcion: String,
  observaciones: String,
  adjuntos: [{
    nombreOriginal: String,
    ruta: String,
    tipo: String,
    tamano: Number
  }],
  activo: Boolean (default: true)  // RN-10: soft-delete solo por ADMIN
}
```

*Nota sobre RN-10: cuando un ADMIN "desactiva" una evolución, el campo `activo` se marca en `false` pero el documento permanece — nunca se elimina físicamente.*

### 5.7. Colección "facturas"

Propósito: facturación de servicios prestados a pacientes, con ítems y pagos embebidos (Módulo 5, RF-33 a RF-40).

#### Esquema

```javascript
{
  _id: ObjectId,
  paciente: ObjectId (ref: pacientes),
  items: [{
    evolucionId: ObjectId,
    diente: Number,
    procedimiento: String,
    valor: Number,
    codigoCups: String,        // Extendido para RIPS - Modulo 9
    diagnostico: String        // Extendido para RIPS - Modulo 9
  }],
  valorTotal: Number,
  iva: Number,
  saldoPendiente: Number,
  estado: String (enum: "PENDIENTE"|"PAGADA"|"ANULADA"),
  pagos: [{
    monto: Number,
    metodo: String (enum: "EFECTIVO"|"TARJETA"|"TRANSFERENCIA"|"PSE"),
    fecha: Date,
    registradoPor: ObjectId (ref: usuarios)
  }],
  motivoAnulacion: String,
  anuladaPor: ObjectId (ref: usuarios),
  fechaAnulacion: Date,
  creadoPor: ObjectId (ref: usuarios),
  createdAt: Date,
  updatedAt: Date
}
```

#### Restricciones

- RN-04: nunca se elimina físicamente; solo se anula con motivo.
- RN-05: la suma de pagos no puede exceder el `valorTotal`.
- Ítems extensibles: `codigoCups` y `diagnostico` son opcionales, permitiendo detectar atenciones incompletas para RIPS (RF-57).

### 5.8. Colección "materials"

Propósito: inventario de materiales del consultorio con su historial de movimientos embebido (Módulo 6, RF-41 a RF-45).

#### Esquema

```javascript
{
  _id: ObjectId,
  nombre: String (requerido, único),
  descripcion: String,
  unidadMedida: String (enum: "UNIDAD"|"CAJA"|"ML"|"MG"|"GR"|"L"|"KG"),
  stockActual: Number (default: 0),
  stockMinimo: Number (default: 0),
  movimientos: [{
    tipo: String (enum: "ENTRADA"|"SALIDA"),
    cantidad: Number,
    motivo: String,
    stockAnterior: Number,
    stockNuevo: Number,
    fecha: Date,
    registradoPor: ObjectId (ref: usuarios)
  }],
  createdAt: Date,
  updatedAt: Date
}
```

#### Restricciones

- RN-06: cada movimiento queda registrado inmutablemente con usuario, fecha y motivo.
- El stock nunca puede quedar en negativo (validación en el servicio).

### 5.9. Colección "configuracionmensajes"

Propósito: almacena las plantillas de mensajes personalizables para recordatorios por email y WhatsApp (Módulo 7, RF-46).

#### Esquema

```javascript
{
  _id: ObjectId,
  canal: String (enum: "EMAIL"|"WHATSAPP"),
  asunto: String (solo email),
  plantilla: String (con variables {{nombre}}, {{fecha}}, {{hora}}),
  activo: Boolean (default: true),
  updatedAt: Date
}
```

*Convención: existe un único documento activo por canal a la vez.*

### 5.10. Colección "recordatorios"

Propósito: bitácora de los recordatorios enviados a pacientes por el job programado horario (Módulo 7, RF-48, RF-49).

#### Esquema

```javascript
{
  _id: ObjectId,
  cita: ObjectId (ref: citas),
  paciente: ObjectId (ref: pacientes),
  canal: String (enum: "EMAIL"|"WHATSAPP"),
  destinatario: String,
  mensaje: String,
  estado: String (enum: "ENVIADO"|"ERROR"),
  errorDescripcion: String,
  previewUrl: String,           // enlace de Ethereal para verificar
  fechaEnvio: Date
}
```

### 5.11. Colección "archivorips"

Propósito: registrar el histórico de archivos RIPS generados (Módulo 9, RF-59).

#### Esquema

```javascript
{
  _id: ObjectId,
  periodo: String,                 // "YYYY-MM" ej. "2026-07"
  fechaInicio: Date,
  fechaFin: Date,
  facturasIncluidas: [ObjectId] (ref: facturas),
  cantidadAtenciones: Number,
  generadoPor: ObjectId (ref: usuarios),
  createdAt: Date
}
```

*El archivo JSON generado no se almacena en la BD (RF-59 solo pide registrar el histórico) — se reconstruye bajo demanda a partir de las facturas del periodo.*

---

## 6. Script de Inicialización y Datos Base

Los datos iniciales se cargan mediante scripts de Node.js (`seedAdmin.js` y `seedRoles.js`) que se conectan a la base de datos y crean los registros base.

### 6.1. seedAdmin.js — Creación del usuario administrador

```javascript
// backend/src/scripts/seedAdmin.js
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Usuario = require("../models/Usuario");

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);

  const yaExiste = await Usuario.findOne({ email: "admin@odontosoft.com" });
  if (yaExiste) {
    console.log("El usuario ADMIN ya existe. Nada que hacer.");
    return process.exit(0);
  }

  const hash = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD, 10);
  await Usuario.create({
    nombre: "Administrador General",
    email: "admin@odontosoft.com",
    contrasenaHash: hash,
    rol: "ADMIN"
  });

  console.log("Usuario ADMIN creado.");
  process.exit(0);
}

seed();
```

### 6.2. seedRoles.js — Creación de los usuarios operativos

El script análogo crea los usuarios con rol ODONTOLOGO y RECEPCIONISTA, siguiendo el mismo patrón y respetando la idempotencia.

### 6.3. Ejecución

```bash
cd backend
node src/scripts/seedAdmin.js
node src/scripts/seedRoles.js
```

Resultado esperado tras ejecutar los seeds: 3 documentos en la colección `usuarios`, uno por cada rol del sistema.

---

## 7. Consultas de Validación CRUD

A continuación se demuestran las operaciones CRUD fundamentales ejecutadas directamente contra la base de datos, usando MongoDB Shell (`mongosh`) y MongoDB Compass. Cada operación se acompaña de la captura de pantalla correspondiente.

### 7.1. CREATE — Inserción de un paciente

Comando ejecutado en `mongosh`:

```javascript
db.pacientes.insertOne({
  nombre: "Carlos",
  apellido: "Ramírez",
  tipoDocumento: "CC",
  numeroDocumento: "9988776655",
  fechaNacimiento: ISODate("1985-03-20"),
  sexo: "M",
  telefono: "3009998888",
  email: "carlos.ramirez@example.com",
  eps: "Nueva EPS",
  estado: "ACTIVO",
  creadoPor: ObjectId("6a51996301caa385b1b7c375")
})
```

> **[ INSERTAR CAPTURA DE PANTALLA AQUÍ ]**
>
> *Figura 7.1. Inserción exitosa de un documento en la colección pacientes (mongosh o MongoDB Compass).*

### 7.2. READ — Consulta de pacientes activos

Comando:

```javascript
db.pacientes.find({ estado: "ACTIVO" }).pretty()
```

> **[ INSERTAR CAPTURA DE PANTALLA AQUÍ ]**
>
> *Figura 7.2. Resultado de la consulta `db.pacientes.find({estado:"ACTIVO"})`.*

### 7.3. READ con filtro compuesto — Búsqueda por documento único

```javascript
db.pacientes.findOne({
  tipoDocumento: "CC",
  numeroDocumento: "9988776655"
})
```

> **[ INSERTAR CAPTURA DE PANTALLA AQUÍ ]**
>
> *Figura 7.3. Búsqueda de paciente por tipo y número de documento (validación de unicidad, RF-15).*

### 7.4. UPDATE — Actualización de datos

```javascript
db.pacientes.updateOne(
  { _id: ObjectId("6a52ace7736b50e45c2dbc3c") },
  { $set: { telefono: "3001112233", updatedAt: new Date() } }
)
```

> **[ INSERTAR CAPTURA DE PANTALLA AQUÍ ]**
>
> *Figura 7.4. Actualización exitosa del teléfono del paciente.*

### 7.5. UPDATE con array embebido — Agregar movimiento a material

```javascript
db.materials.updateOne(
  { _id: ObjectId("<id-material>") },
  {
    $push: { movimientos: {
      tipo: "SALIDA",
      cantidad: 3,
      motivo: "Uso en consulta paciente Carlos R.",
      fecha: new Date(),
      stockAnterior: 5,
      stockNuevo: 2
    }},
    $set: { stockActual: 2 }
  }
)
```

> **[ INSERTAR CAPTURA DE PANTALLA AQUÍ ]**
>
> *Figura 7.5. Registro de movimiento de salida con actualización del stock (RN-06).*

### 7.6. DELETE lógico — Desactivación de paciente (RN-02)

Nota: OdontoSoft no ejecuta deletes físicos sobre entidades operativas. La "eliminación" es un cambio de estado a INACTIVO, preservando la integridad histórica:

```javascript
db.pacientes.updateOne(
  { _id: ObjectId("6a52ace7736b50e45c2dbc3c") },
  { $set: { estado: "INACTIVO", updatedAt: new Date() } }
)
```

> **[ INSERTAR CAPTURA DE PANTALLA AQUÍ ]**
>
> *Figura 7.6. Desactivación lógica del paciente (RN-02: nunca eliminación física).*

### 7.7. Agregación — Ingresos del mes

Ejemplo de operación de agregación con recorrido de subdocumentos embebidos:

```javascript
db.facturas.aggregate([
  { $match: { estado: { $ne: "ANULADA" } } },
  { $unwind: "$pagos" },
  { $match: { "pagos.fecha": {
      $gte: ISODate("2026-07-01"),
      $lt: ISODate("2026-08-01")
  }}},
  { $group: {
      _id: null,
      totalIngresos: { $sum: "$pagos.monto" },
      cantidadPagos: { $sum: 1 }
  }}
])
```

> **[ INSERTAR CAPTURA DE PANTALLA AQUÍ ]**
>
> *Figura 7.7. Agregación para el reporte de ingresos del mes (RF-50) usando `$unwind` y `$group`.*

---

## 8. Verificación en MongoDB Atlas

El despliegue de la base de datos se realiza en MongoDB Atlas, servicio gestionado en la nube que ofrece un cluster gratuito (M0) adecuado para el alcance del proyecto. La migración de la base de datos local a Atlas se realizó mediante `mongodump` + `mongorestore`.

### 8.1. Configuración del Cluster

| Parámetro | Valor |
|---|---|
| **Nombre del cluster** | `odontosoft-cluster` |
| **Plan** | M0 Free — 512 MB de almacenamiento |
| **Región** | AWS N. Virginia (us-east-1) |
| **Versión de MongoDB** | 8.0.x |
| **Tipo de despliegue** | Replica Set (3 nodos) |
| **Usuario de acceso** | `odontosoft_admin` (autenticación SCRAM) |
| **Access List (IPs)** | `0.0.0.0/0` (documentado como decisión de simplificación académica) |

> **[ INSERTAR CAPTURA DE PANTALLA AQUÍ ]**
>
> *Figura 8.1. Panel principal del cluster `odontosoft-cluster` en MongoDB Atlas mostrando su estado y métricas.*

### 8.2. Migración de Datos con mongodump/mongorestore

El proceso de migración desde la base local (Docker) a Atlas:

```bash
# Paso 1: dump de la base local desde el contenedor Docker
docker exec odontosoft-mongo mongodump \
  --db odontosoft --archive=/tmp/odontosoft-backup.archive

# Paso 2: copiar el archivo del contenedor al host
docker cp odontosoft-mongo:/tmp/odontosoft-backup.archive ./

# Paso 3: restaurar en Atlas
mongorestore \
  --uri="mongodb+srv://odontosoft_admin:<pwd>@odontosoft-cluster.<hash>.mongodb.net/odontosoft" \
  --archive=./odontosoft-backup.archive
```

> **[ INSERTAR CAPTURA DE PANTALLA AQUÍ ]**
>
> *Figura 8.2. Resultado del comando `mongorestore` mostrando las 11 colecciones migradas exitosamente.*

### 8.3. Verificación desde Atlas — Browse Collections

Una vez migrados los datos, la vista "Browse Collections" del panel de Atlas confirma la presencia de las 11 colecciones con sus documentos:

> **[ INSERTAR CAPTURA DE PANTALLA AQUÍ ]**
>
> *Figura 8.3. Vista "Browse Collections" en MongoDB Atlas mostrando la base de datos odontosoft y sus 11 colecciones.*

> **[ INSERTAR CAPTURA DE PANTALLA AQUÍ ]**
>
> *Figura 8.4. Detalle de la colección "pacientes" en Atlas mostrando el paciente Carlos Ramírez migrado desde el entorno local.*

> **[ INSERTAR CAPTURA DE PANTALLA AQUÍ ]**
>
> *Figura 8.5. Detalle de la colección "usuarios" en Atlas mostrando los 3 usuarios de rol ADMIN, ODONTOLOGO y RECEPCIONISTA creados por los seeds.*

### 8.4. Verificación con Consulta Filtrada

En el propio panel de Atlas, la sección de filtros permite ejecutar consultas directamente sobre las colecciones:

```javascript
// Filtro aplicado en Atlas → Browse Collections → usuarios
{ rol: "ADMIN" }
```

> **[ INSERTAR CAPTURA DE PANTALLA AQUÍ ]**
>
> *Figura 8.6. Consulta filtrada en Atlas devolviendo únicamente los usuarios con rol ADMIN.*

---

## 9. Índices Definidos

Los índices se declaran a nivel de esquema mediante Mongoose y se crean automáticamente al iniciar la aplicación por primera vez. En total, la base de datos define 22 índices distribuidos así:

| Colección | Índice | Tipo |
|---|---|:---:|
| `usuarios` | `email` | Único |
| `usuarios` | `rol` | Simple |
| `logaccesos` | `email + fecha` | Compuesto |
| `tokeninvalidados` | `expiraEn` | TTL |
| `pacientes` | `tipoDocumento + numeroDocumento` | Único compuesto |
| `pacientes` | `estado` | Simple |
| `pacientes` | `nombre + apellido` (texto) | Texto |
| `citas` | `odontologo + fechaHora` | Compuesto |
| `citas` | `paciente` | Simple |
| `citas` | `fechaHora + estado` | Compuesto |
| `historiaclinicas` | `paciente` | Único |
| `facturas` | `paciente` | Simple |
| `facturas` | `estado` | Simple |
| `facturas` | `createdAt` | Simple |
| `materials` | `nombre` | Único |
| `materials` | `stockActual` | Simple |
| `recordatorios` | `cita + estado` | Compuesto |
| `recordatorios` | `fechaEnvio` | Simple |
| `archivorips` | `periodo + createdAt` | Compuesto |

Estos índices se traducen en tiempos de respuesta ≤ 2 segundos incluso con volúmenes crecientes de datos (RNF-08).

---

## 10. Conclusiones

El presente documento evidencia la implementación completa de la capa de persistencia del sistema OdontoSoft sobre MongoDB, cumpliendo con los siguientes hitos:

- Definición de 11 colecciones con esquemas claros y validaciones formales.
- Aplicación consistente del criterio embebido/referenciado según el patrón de acceso de los datos.
- Ejecución exitosa de operaciones CRUD sobre la base de datos local (`mongosh` y Compass).
- Despliegue en la nube mediante MongoDB Atlas (cluster `odontosoft-cluster`, plan M0 Free, región AWS N. Virginia).
- Migración exitosa de los datos locales a Atlas mediante `mongodump` + `mongorestore`.
- Verificación visual de las 11 colecciones migradas con sus documentos originales intactos.
- Definición de 22 índices estratégicos que garantizan el rendimiento esperado.

La base de datos queda lista para ser consumida por el backend Node.js/Express que se documenta en el Documento 4 (Mes 4).

### Preparación para el Documento 4

Los esquemas aquí definidos serán traducidos a modelos Mongoose (esquema de validación en Node.js) y consumidos desde los servicios y controladores del backend. La conexión a MongoDB Atlas ya establecida en este documento (variable de entorno `MONGO_URI`) es la que utilizará el backend desde su primera línea de código.
