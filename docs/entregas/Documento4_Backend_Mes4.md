# SERVICIO NACIONAL DE APRENDIZAJE — SENA

**Etapa Productiva — Modalidad Proyecto Productivo**

*Competencia Técnica: Análisis y Desarrollo de Software*

---

## DOCUMENTO 4 — MES 4
# Arquitectura del Backend Node.js / Express y API REST

**Proyecto:** OdontoSoft — Sistema de Gestión Clínica Odontológica

*Alineación: Guía de Aprendizaje 4 — Desarrollar backend con Node.js*

*Stack: Node.js 24.x + Express + Mongoose + JWT*

**Aprendiz:** `[NOMBRE COMPLETO DEL APRENDIZ]`

**Ficha SENA:** `[NÚMERO DE FICHA]`

**Instructor:** `[NOMBRE DEL INSTRUCTOR]`

**Fecha de entrega:** `[FECHA]`

---

## Contenido

1. Introducción
2. Arquitectura del Backend
3. Stack Tecnológico y Dependencias
4. Estructura de Carpetas del Proyecto
5. Middleware Transversal
6. Integración con MongoDB Atlas mediante Mongoose
7. API REST — Diseño General
8. Endpoints del Sistema
9. Documentación en Postman
10. Manejo de Errores y Códigos HTTP
11. Pruebas Automatizadas end-to-end
12. Conclusiones

---

## 1. Introducción

El presente documento describe la arquitectura del backend del sistema OdontoSoft, construido con Node.js y Express, sobre la base de datos MongoDB documentada en el Documento 3. Se alinea con los objetivos de la Guía de Aprendizaje 4 (Desarrollar backend con Node.js) del programa de Análisis y Desarrollo de Software del SENA.

Un backend bien arquitecturado no consiste únicamente en escribir rutas y consultas: debe separar responsabilidades, exponer una API REST clara y documentada, aplicar seguridad transversal, y ofrecer trazabilidad de sus operaciones. Este documento presenta cómo se lograron esos objetivos para OdontoSoft, incluyendo diagramas de arquitectura, integración con Mongoose, definición formal de endpoints REST, documentación en Postman y estrategia de pruebas end-to-end.

---

## 2. Arquitectura del Backend

### 2.1. Patrón Aplicado — Arquitectura por Capas

El backend sigue una arquitectura por capas clásica, donde cada capa tiene una responsabilidad única y las dependencias fluyen en una sola dirección (de arriba hacia abajo):

```
     [ Cliente HTTP (Frontend Angular / Postman / curl) ]
                        |
                        v
  +--------------------------------------------------+
  |  1. RUTAS       (routes/*Routes.js)               |
  |     - Define endpoint + método + middlewares       |
  +--------------------------------------------------+
                        |
                        v
  +--------------------------------------------------+
  |  2. CONTROLADORES (controllers/*Controller.js)    |
  |     - Parsea request                              |
  |     - Llama al servicio                           |
  |     - Retorna response con codigo HTTP            |
  +--------------------------------------------------+
                        |
                        v
  +--------------------------------------------------+
  |  3. SERVICIOS    (services/*Service.js)           |
  |     - Logica de negocio pura                      |
  |     - Reglas de negocio (RN)                      |
  |     - Orquestacion de multiples modelos           |
  +--------------------------------------------------+
                        |
                        v
  +--------------------------------------------------+
  |  4. MODELOS      (models/*.js)                    |
  |     - Esquema Mongoose                            |
  |     - Validaciones a nivel de campo               |
  |     - Hooks pre/post                              |
  +--------------------------------------------------+
                        |
                        v
     [    MongoDB Atlas (cluster odontosoft)   ]
```

> **[ INSERTAR CAPTURA DE PANTALLA AQUÍ ]**
>
> *Figura 2.1. Diagrama de arquitectura del backend por capas. Recomendado dibujarlo en draw.io/Lucidchart con la estructura anterior.*

### 2.2. Ventajas del Patrón por Capas

- **Testabilidad**: cada capa puede probarse de forma aislada. Los servicios se prueban sin depender del framework HTTP.
- **Mantenibilidad**: un bug en la lógica de negocio se busca en `services/`; un problema de HTTP en `controllers/`. No hay que buscar entre todas las capas.
- **Reutilización**: un servicio puede ser invocado desde varios controladores (por ejemplo, `calcularSaldo()` se usa en `registrarPago()` y en `obtenerFactura()`).
- **Sustituibilidad**: si en el futuro se cambia MongoDB por PostgreSQL, solo cambian los modelos — la lógica de negocio permanece intacta.

### 2.3. Diagrama de Componentes por Módulo

Cada uno de los 9 módulos del sistema replica esta arquitectura de 4 capas. A modo de ejemplo, el módulo de Facturación se compone de los siguientes archivos:

| Capa | Archivo | Líneas aprox. |
|---|---|:---:|
| Rutas | `src/routes/facturaRoutes.js` | 40 |
| Controlador | `src/controllers/facturaController.js` | 180 |
| Servicio | `src/services/facturaService.js` | 320 |
| Modelo | `src/models/Factura.js` | 90 |

---

## 3. Stack Tecnológico y Dependencias

A continuación se detalla el stack tecnológico completo con la justificación de cada dependencia:

| Dependencia | Versión | Uso en el proyecto |
|---|:---:|---|
| `express` | `^4.x` | Framework HTTP del servidor |
| `mongoose` | `^7.x` | ODM para MongoDB (esquemas, validaciones, agregaciones) |
| `dotenv` | `^16.x` | Carga de variables de entorno desde `.env` |
| `bcrypt` | `^5.x` | Hash de contraseñas — Módulo 1 (RNF-01) |
| `jsonwebtoken` | `^9.x` | Generación y verificación de JWT — Módulo 1 |
| `cors` | `^2.x` | Habilitación de peticiones cross-origin desde el frontend |
| `express-rate-limit` | `^7.x` | Prevención de fuerza bruta en login (RNF-03) |
| `morgan` | `^1.x` | Logging de peticiones HTTP en desarrollo |
| `multer` | `^1.x` | Subida de archivos `multipart/form-data` — Módulo 4 |
| `sharp` | `^0.33.x` | Optimización automática de imágenes (RNF-09) |
| `pdfkit` | `^0.15.x` | Generación de PDF (facturas y reportes) |
| `exceljs` | `^4.x` | Exportación de reportes a Excel — Módulo 8 |
| `nodemailer` | `^6.x` | Envío de emails — Módulo 7 |
| `node-cron` | `^3.x` | Tareas programadas (job de recordatorios) — Módulo 7 |

### 3.1. package.json — resumen

```json
{
  "name": "backend",
  "version": "1.0.0",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  },
  "dependencies": { ... },
  "devDependencies": { "nodemon": "^3.x" }
}
```

---

## 4. Estructura de Carpetas del Proyecto

La organización de carpetas refleja la arquitectura por capas y el modularizado por dominio:

```
backend/
├── .env                    # Variables de entorno (no versionado)
├── .env.example            # Plantilla del .env
├── package.json
├── uploads/                # Archivos subidos (no versionado)
│   └── historias-clinicas/
├── src/
│   ├── app.js              # Configuracion Express (middlewares, rutas)
│   ├── server.js           # Punto de entrada — conexion a MongoDB + listen
│   ├── config/
│   │   └── db.js           # Conexion a MongoDB
│   ├── models/             # 12 modelos Mongoose
│   │   ├── Usuario.js
│   │   ├── Paciente.js
│   │   ├── Cita.js
│   │   ├── HistoriaClinica.js
│   │   ├── Factura.js
│   │   ├── Material.js
│   │   ├── Recordatorio.js
│   │   ├── ConfiguracionMensaje.js
│   │   ├── ArchivoRips.js
│   │   ├── LogAcceso.js
│   │   └── TokenInvalidado.js
│   ├── routes/             # 10 archivos de rutas (uno por modulo + auth)
│   ├── controllers/        # 10 archivos de controladores
│   ├── services/           # 9 archivos de servicios (logica de negocio)
│   ├── middlewares/        # Middlewares transversales
│   │   ├── authMiddleware.js       # verificarToken
│   │   ├── roleMiddleware.js       # permitirRoles
│   │   ├── rateLimitMiddleware.js  # rate limiting
│   │   └── uploadMiddleware.js     # multer para adjuntos
│   ├── jobs/               # Tareas programadas
│   │   └── recordatoriosJob.js     # node-cron cada hora
│   └── scripts/            # Scripts de datos iniciales
│       ├── seedAdmin.js
│       └── seedRoles.js
└── tests/
    ├── test-e2e-auth.sh
    ├── test-e2e-pacientes.sh
    ├── test-e2e-citas.sh
    ├── test-e2e-historia-clinica.sh
    ├── test-e2e-facturacion.sh
    ├── test-e2e-inventario.sh
    ├── test-e2e-recordatorios.sh
    ├── test-e2e-reportes.sh
    └── test-e2e-rips.sh
```

---

## 5. Middleware Transversal

Los middlewares aplicados globalmente o por grupos de rutas son:

### 5.1. verificarToken — Autenticación JWT

Extrae el token del header `Authorization: Bearer <token>`, verifica su firma, comprueba que no esté en `tokeninvalidados`, y adjunta `req.usuario` para las capas siguientes.

```javascript
// src/middlewares/authMiddleware.js
async function verificarToken(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ mensaje: "Token no proporcionado" });
  }

  const token = header.substring(7);

  try {
    const invalidado = await TokenInvalidado.findOne({ token });
    if (invalidado) {
      return res.status(401).json({ mensaje: "Token invalidado" });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = payload;
    return next();
  } catch (error) {
    return res.status(401).json({ mensaje: "Token invalido o expirado" });
  }
}
```

### 5.2. permitirRoles — Autorización por Rol

Middleware factory que retorna una función; recibe la lista de roles autorizados para el endpoint específico.

```javascript
// src/middlewares/roleMiddleware.js
function permitirRoles(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ mensaje: "No autenticado" });
    }
    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({ mensaje: "Acceso denegado" });
    }
    return next();
  };
}
```

### 5.3. Rate Limiting del Login (RNF-03)

```javascript
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10,                  // 10 intentos por IP
  standardHeaders: true,
  message: { mensaje: "Demasiados intentos. Intenta nuevamente en 15 minutos." }
});

router.post("/login", loginLimiter, authController.login);
```

### 5.4. Uso Combinado — Ejemplo de una Ruta Protegida

```javascript
router.post(
  "/",                                              // Ruta
  verificarToken,                                   // Autenticacion
  permitirRoles("ADMIN", "RECEPCIONISTA"),          // Autorizacion
  pacienteController.crear                          // Handler
);
```

---

## 6. Integración con MongoDB Atlas mediante Mongoose

### 6.1. Conexión a la Base de Datos

```javascript
// src/config/db.js
const mongoose = require("mongoose");

async function conectarDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB conectado");
  } catch (error) {
    console.error("Error de conexion a MongoDB:", error);
    process.exit(1);
  }
}

module.exports = conectarDB;
```

*La cadena `MONGO_URI` es la que se documentó en el Documento 3 (`mongodb+srv://...` apuntando al cluster odontosoft-cluster en Atlas).*

### 6.2. Ejemplo de Modelo Mongoose — Paciente

```javascript
// src/models/Paciente.js
const mongoose = require("mongoose");

const pacienteSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  apellido: { type: String, required: true, trim: true },
  tipoDocumento: {
    type: String,
    enum: ["CC", "TI", "CE", "PA", "RC"],
    required: true
  },
  numeroDocumento: { type: String, required: true, trim: true },
  fechaNacimiento: Date,
  sexo: { type: String, enum: ["M", "F", "O"] },
  telefono: { type: String, trim: true },
  email: { type: String, trim: true, lowercase: true },
  eps: { type: String, trim: true },
  estado: { type: String, enum: ["ACTIVO", "INACTIVO"], default: "ACTIVO" },
  creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario" }
}, { timestamps: true });

pacienteSchema.index(
  { tipoDocumento: 1, numeroDocumento: 1 },
  { unique: true }
);

module.exports = mongoose.model("Paciente", pacienteSchema);
```

*El esquema declara: tipos, validaciones (`required`, `enum`, `trim`), valores por defecto, timestamps automáticos y el índice único compuesto (RF-15).*

### 6.3. Ejemplo de Uso — CRUD con Mongoose

```javascript
// Crear
const paciente = await Paciente.create({ nombre, apellido, tipoDocumento, ... });

// Buscar con filtro + paginación
const pacientes = await Paciente
  .find({ estado: "ACTIVO" })
  .sort({ createdAt: -1 })
  .skip((pagina - 1) * limite)
  .limit(limite);

// Buscar por ID con populate
const paciente = await Paciente.findById(id).populate("creadoPor", "nombre email");

// Actualizar
await Paciente.findByIdAndUpdate(id, { telefono: nuevoTelefono });

// Delete lógico (RN-02)
await Paciente.findByIdAndUpdate(id, { estado: "INACTIVO" });
```

---

## 7. API REST — Diseño General

### 7.1. Convenciones de Rutas

Toda la API está bajo el prefijo `/api`. Los recursos usan plural, y las acciones siguen los verbos HTTP estándar:

| Verbo HTTP | Ejemplo | Semántica |
|:---:|---|---|
| **GET** | `/api/pacientes` | Listar recursos |
| **GET** | `/api/pacientes/:id` | Obtener un recurso específico |
| **POST** | `/api/pacientes` | Crear un nuevo recurso |
| **PATCH** | `/api/pacientes/:id` | Actualización parcial |
| **PATCH** | `/api/pacientes/:id/desactivar` | Acción específica (delete lógico) |

### 7.2. Convenciones de Respuesta

Todas las respuestas siguen un formato JSON consistente:

```javascript
// Éxito con un recurso
{
  "mensaje": "Paciente creado exitosamente",
  "paciente": { ... }
}

// Éxito con listado paginado
{
  "pacientes": [...],
  "paginacion": {
    "total": 45,
    "pagina": 1,
    "limite": 10,
    "totalPaginas": 5
  }
}

// Error
{
  "mensaje": "Descripción del error",
  "detalles": { ... }  // opcional
}
```

### 7.3. Autenticación en la API

Todos los endpoints excepto `POST /api/auth/login` requieren el header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6...
```

---

## 8. Endpoints del Sistema

A continuación se documentan los endpoints más representativos de cada uno de los 9 módulos del sistema, con su método HTTP, ruta, descripción, roles permitidos y códigos de estado esperados. Se selecciona un subconjunto que cubre las operaciones más críticas.

### 8.1. Módulo 1 — Autenticación

#### POST /api/auth/login

| Campo | Valor |
|---|---|
| **Método** | `POST` |
| **Ruta** | `/api/auth/login` |
| **Descripción** | Autentica al usuario y devuelve un token JWT + datos básicos del usuario. |
| **Roles permitidos** | Público (sin autenticación) |
| **Códigos de estado** | 200 OK · 401 Credenciales inválidas · 429 Too Many Requests |

**Body:**

```json
{ "email": "admin@odontosoft.com", "password": "Admin123!" }
```

**Respuesta 200:**

```json
{
  "mensaje": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "usuario": { "_id": "6a50...", "nombre": "Administrador General", "rol": "ADMIN" }
}
```

#### POST /api/auth/logout

| Campo | Valor |
|---|---|
| **Método** | `POST` |
| **Ruta** | `/api/auth/logout` |
| **Descripción** | Invalida el token JWT actual agregándolo a la lista negra (`tokeninvalidados`). |
| **Roles permitidos** | ADMIN, ODONTOLOGO, RECEPCIONISTA |
| **Códigos de estado** | 200 OK · 401 Unauthorized |

#### GET /api/auth/perfil

| Campo | Valor |
|---|---|
| **Método** | `GET` |
| **Ruta** | `/api/auth/perfil` |
| **Descripción** | Devuelve los datos del usuario autenticado a partir del token. |
| **Roles permitidos** | ADMIN, ODONTOLOGO, RECEPCIONISTA |
| **Códigos de estado** | 200 OK · 401 Unauthorized |

### 8.2. Módulo 2 — Pacientes

#### POST /api/pacientes

| Campo | Valor |
|---|---|
| **Método** | `POST` |
| **Ruta** | `/api/pacientes` |
| **Descripción** | Crea un paciente nuevo tras validar la unicidad de tipo+número de documento (RF-15). |
| **Roles permitidos** | RECEPCIONISTA |
| **Códigos de estado** | 201 Created · 400 Bad Request · 409 Conflict (documento duplicado) |

**Body:**

```json
{
  "nombre": "Carlos",
  "apellido": "Ramírez",
  "tipoDocumento": "CC",
  "numeroDocumento": "9988776655",
  "fechaNacimiento": "1985-03-20",
  "sexo": "M",
  "telefono": "3009998888",
  "email": "carlos.ramirez@example.com",
  "eps": "Nueva EPS"
}
```

#### GET /api/pacientes

| Campo | Valor |
|---|---|
| **Método** | `GET` |
| **Ruta** | `/api/pacientes?estado=ACTIVO&pagina=1&limite=10&busqueda=car` |
| **Descripción** | Lista los pacientes con filtros opcionales y paginación (RF-10, RF-11). |
| **Roles permitidos** | ADMIN, ODONTOLOGO, RECEPCIONISTA |
| **Códigos de estado** | 200 OK · 401 Unauthorized |

#### GET /api/pacientes/:id

| Campo | Valor |
|---|---|
| **Método** | `GET` |
| **Ruta** | `/api/pacientes/:id` |
| **Descripción** | Obtiene el detalle completo de un paciente (RF-12). |
| **Roles permitidos** | ADMIN, ODONTOLOGO, RECEPCIONISTA |
| **Códigos de estado** | 200 OK · 404 Not Found |

#### PATCH /api/pacientes/:id/desactivar

| Campo | Valor |
|---|---|
| **Método** | `PATCH` |
| **Ruta** | `/api/pacientes/:id/desactivar` |
| **Descripción** | Cambia el estado del paciente a INACTIVO (RN-02 — no elimina físicamente). |
| **Roles permitidos** | RECEPCIONISTA |
| **Códigos de estado** | 200 OK · 404 Not Found |

### 8.3. Módulo 3 — Citas y Agenda

#### POST /api/citas

| Campo | Valor |
|---|---|
| **Método** | `POST` |
| **Ruta** | `/api/citas` |
| **Descripción** | Crea una nueva cita, validando conflictos de horario (RN-01) y horario del consultorio (RN-07). |
| **Roles permitidos** | RECEPCIONISTA |
| **Códigos de estado** | 201 Created · 400 Bad Request · 409 Conflicto de horario |

**Body:**

```json
{
  "paciente": "6a52ace7736b50e45c2dbc3c",
  "odontologo": "6a51996301caa385b1b7c375",
  "fechaHora": "2026-07-25T10:00:00Z",
  "duracion": 30,
  "motivo": "Control mensual"
}
```

#### GET /api/citas/agenda

| Campo | Valor |
|---|---|
| **Método** | `GET` |
| **Ruta** | `/api/citas/agenda?fecha=2026-07-25&odontologo=6a51...` |
| **Descripción** | Obtiene la agenda del día para un odontólogo (RF-18). |
| **Roles permitidos** | ADMIN, ODONTOLOGO, RECEPCIONISTA |
| **Códigos de estado** | 200 OK |

#### PATCH /api/citas/:id/estado

| Campo | Valor |
|---|---|
| **Método** | `PATCH` |
| **Ruta** | `/api/citas/:id/estado` |
| **Descripción** | Actualiza el estado de la cita según su ciclo de vida (RF-20). |
| **Roles permitidos** | ODONTOLOGO (estados clínicos), RECEPCIONISTA (todos) |
| **Códigos de estado** | 200 OK · 400 Bad Request · 404 Not Found |

**Body:**

```json
{ "estado": "FINALIZADA" }
```

### 8.4. Módulo 4 — Historia Clínica y Odontograma

#### POST /api/historias-clinicas

| Campo | Valor |
|---|---|
| **Método** | `POST` |
| **Ruta** | `/api/historias-clinicas` |
| **Descripción** | Crea la historia clínica de un paciente, con odontograma inicializado en 32 dientes SANO (RF-25, RN-03). |
| **Roles permitidos** | ODONTOLOGO |
| **Códigos de estado** | 201 Created · 409 Ya existe historia |

#### POST /api/historias-clinicas/:id/evoluciones

| Campo | Valor |
|---|---|
| **Método** | `POST` |
| **Ruta** | `/api/historias-clinicas/:id/evoluciones` |
| **Descripción** | Registra una nueva evolución clínica (procedimiento realizado sobre un diente). |
| **Roles permitidos** | ODONTOLOGO |
| **Códigos de estado** | 201 Created · 404 Not Found |

#### POST /api/historias-clinicas/:id/evoluciones/:evolucionId/adjuntos

| Campo | Valor |
|---|---|
| **Método** | `POST` |
| **Ruta** | `/api/historias-clinicas/:id/evoluciones/:evolucionId/adjuntos` |
| **Descripción** | Sube adjunto a evolución (imagen se procesa con Sharp para optimización — RNF-09). |
| **Roles permitidos** | ODONTOLOGO |
| **Códigos de estado** | 201 Created · 400 Bad Request |

#### PATCH /api/historias-clinicas/:id/evoluciones/:evolucionId/desactivar

| Campo | Valor |
|---|---|
| **Método** | `PATCH` |
| **Ruta** | `/api/historias-clinicas/:id/evoluciones/:evolucionId/desactivar` |
| **Descripción** | Desactiva una evolución clínica errónea sin eliminarla (RN-10 — solo ADMIN). |
| **Roles permitidos** | ADMIN |
| **Códigos de estado** | 200 OK · 403 Forbidden · 404 Not Found |

### 8.5. Módulo 5 — Facturación y Pagos

#### POST /api/facturas

| Campo | Valor |
|---|---|
| **Método** | `POST` |
| **Ruta** | `/api/facturas` |
| **Descripción** | Crea una factura con múltiples ítems, calculando automáticamente valor total, IVA y saldo. |
| **Roles permitidos** | RECEPCIONISTA |
| **Códigos de estado** | 201 Created · 400 Bad Request |

#### POST /api/facturas/:id/pagos

| Campo | Valor |
|---|---|
| **Método** | `POST` |
| **Ruta** | `/api/facturas/:id/pagos` |
| **Descripción** | Registra un pago sobre la factura, validando que el monto no exceda el saldo (RN-05). |
| **Roles permitidos** | RECEPCIONISTA |
| **Códigos de estado** | 200 OK · 400 Bad Request (monto > saldo) · 409 (factura anulada) |

**Body:**

```json
{ "monto": 30000, "metodo": "EFECTIVO" }
```

#### PATCH /api/facturas/:id/anular

| Campo | Valor |
|---|---|
| **Método** | `PATCH` |
| **Ruta** | `/api/facturas/:id/anular` |
| **Descripción** | Anula la factura registrando motivo y usuario (RN-04 — nunca elimina). |
| **Roles permitidos** | RECEPCIONISTA, ADMIN |
| **Códigos de estado** | 200 OK · 409 (ya anulada) |

#### GET /api/facturas/:id/pdf

| Campo | Valor |
|---|---|
| **Método** | `GET` |
| **Ruta** | `/api/facturas/:id/pdf` |
| **Descripción** | Genera y descarga el PDF de la factura (pdfkit). |
| **Roles permitidos** | RECEPCIONISTA, ADMIN |
| **Códigos de estado** | 200 OK (application/pdf) · 404 Not Found |

### 8.6. Módulo 6 — Inventario

#### POST /api/inventario/materiales

| Campo | Valor |
|---|---|
| **Método** | `POST` |
| **Ruta** | `/api/inventario/materiales` |
| **Descripción** | Crea un material con stock inicial y stock mínimo (RF-41). |
| **Roles permitidos** | RECEPCIONISTA |
| **Códigos de estado** | 201 Created · 409 (nombre duplicado) |

#### POST /api/inventario/materiales/:id/movimientos

| Campo | Valor |
|---|---|
| **Método** | `POST` |
| **Ruta** | `/api/inventario/materiales/:id/movimientos` |
| **Descripción** | Registra un movimiento de entrada o salida con actualización de stock (RN-06). |
| **Roles permitidos** | RECEPCIONISTA |
| **Códigos de estado** | 200 OK · 400 Bad Request (stock insuficiente) |

**Body:**

```json
{ "tipo": "SALIDA", "cantidad": 3, "motivo": "Uso en consulta" }
```

#### GET /api/inventario/materiales/alertas

| Campo | Valor |
|---|---|
| **Método** | `GET` |
| **Ruta** | `/api/inventario/materiales/alertas` |
| **Descripción** | Lista materiales bajo el mínimo (RF-43). |
| **Roles permitidos** | ADMIN, RECEPCIONISTA |
| **Códigos de estado** | 200 OK |

### 8.7. Módulo 7 — Recordatorios Automáticos

#### GET /api/recordatorios/configuracion

| Campo | Valor |
|---|---|
| **Método** | `GET` |
| **Ruta** | `/api/recordatorios/configuracion` |
| **Descripción** | Obtiene la plantilla activa por canal (EMAIL/WHATSAPP). |
| **Roles permitidos** | ADMIN, RECEPCIONISTA |
| **Códigos de estado** | 200 OK |

#### PUT /api/recordatorios/configuracion

| Campo | Valor |
|---|---|
| **Método** | `PUT` |
| **Ruta** | `/api/recordatorios/configuracion` |
| **Descripción** | Actualiza las plantillas de mensajes (RF-46). |
| **Roles permitidos** | RECEPCIONISTA |
| **Códigos de estado** | 200 OK · 400 Bad Request |

#### GET /api/recordatorios/historial

| Campo | Valor |
|---|---|
| **Método** | `GET` |
| **Ruta** | `/api/recordatorios/historial?pagina=1&estado=ENVIADO` |
| **Descripción** | Lista los recordatorios enviados con paginación (RF-49). |
| **Roles permitidos** | ADMIN, RECEPCIONISTA |
| **Códigos de estado** | 200 OK |

*Nota: el envío en sí NO es un endpoint expuesto — se ejecuta automáticamente cada hora por el job node-cron (RN-08), no por petición HTTP.*

### 8.8. Módulo 8 — Reportes y Estadísticas

#### GET /api/reportes/ingresos

| Campo | Valor |
|---|---|
| **Método** | `GET` |
| **Ruta** | `/api/reportes/ingresos` |
| **Descripción** | Ingresos del mes en curso — agregación sobre pagos efectivos, no sobre facturación bruta (RF-50). |
| **Roles permitidos** | ADMIN, RECEPCIONISTA |
| **Códigos de estado** | 200 OK · 403 Forbidden |

#### GET /api/reportes/tratamientos

| Campo | Valor |
|---|---|
| **Método** | `GET` |
| **Ruta** | `/api/reportes/tratamientos` |
| **Descripción** | Tratamientos más realizados — pipeline con `$unwind` + `$group` + `$sort` (RF-52). |
| **Roles permitidos** | ADMIN, ODONTOLOGO |
| **Códigos de estado** | 200 OK · 403 Forbidden |

#### GET /api/reportes/exportar/:tipo/excel

| Campo | Valor |
|---|---|
| **Método** | `GET` |
| **Ruta** | `/api/reportes/exportar/:tipo/excel` |
| **Descripción** | Exporta reporte a Excel (`:tipo` puede ser ingresos, pacientes-nuevos, tratamientos, etc.). |
| **Roles permitidos** | ADMIN + rol específico del reporte |
| **Códigos de estado** | 200 OK (application/vnd...) · 400 Tipo inválido |

### 8.9. Módulo 9 — Integración con RIPS

#### GET /api/rips/validar

| Campo | Valor |
|---|---|
| **Método** | `GET` |
| **Ruta** | `/api/rips/validar?periodo=2026-07` |
| **Descripción** | Valida las atenciones del periodo — identifica cuáles están incompletas (RF-57). |
| **Roles permitidos** | ADMIN, RECEPCIONISTA |
| **Códigos de estado** | 200 OK · 400 Bad Request (formato inválido) |

**Respuesta:**

```json
{
  "validacion": {
    "periodo": "2026-07",
    "totalFacturas": 4,
    "completas": 1,
    "incompletas": [ { "facturaId": "...", "paciente": "Carlos...", "camposFaltantes": [...] } ]
  }
}
```

#### POST /api/rips/generar

| Campo | Valor |
|---|---|
| **Método** | `POST` |
| **Ruta** | `/api/rips/generar` |
| **Descripción** | Genera y descarga el archivo RIPS JSON (RF-56, RF-58). Falla si hay atenciones incompletas. |
| **Roles permitidos** | ADMIN, RECEPCIONISTA |
| **Códigos de estado** | 200 OK (application/json + Content-Disposition) · 404 Sin atenciones · 409 Atenciones incompletas |

#### GET /api/rips/historial

| Campo | Valor |
|---|---|
| **Método** | `GET` |
| **Ruta** | `/api/rips/historial` |
| **Descripción** | Lista el histórico de archivos RIPS generados (RF-59). |
| **Roles permitidos** | ADMIN, RECEPCIONISTA |
| **Códigos de estado** | 200 OK · 403 Forbidden |

---

## 9. Documentación en Postman

Se creó una colección de Postman que agrupa todos los endpoints documentados por módulo, con ejemplos de request y respuesta reales.

### 9.1. Estructura de la Colección

```
OdontoSoft API
├── 01. Auth
│   ├── Login
│   ├── Logout
│   └── Perfil
├── 02. Pacientes
│   ├── Crear paciente
│   ├── Listar pacientes
│   ├── Buscar por documento
│   ├── Ver detalle
│   ├── Editar
│   └── Desactivar
├── 03. Citas
│   ├── Crear cita
│   ├── Ver agenda del día
│   ├── Cambiar estado
│   └── Reasignar
├── 04. Historia Clínica
│   ├── Crear historia
│   ├── Actualizar odontograma
│   ├── Agregar evolución
│   ├── Subir adjunto
│   └── Desactivar evolución (ADMIN)
├── 05. Facturación
│   ├── Crear factura
│   ├── Registrar pago
│   ├── Anular factura
│   └── Descargar PDF
├── 06. Inventario
│   ├── Crear material
│   ├── Registrar movimiento
│   └── Ver alertas de stock
├── 07. Recordatorios
│   ├── Ver plantilla
│   ├── Actualizar plantilla
│   └── Ver historial
├── 08. Reportes
│   ├── Ingresos del mes
│   ├── Pacientes nuevos
│   ├── Tratamientos más realizados
│   ├── Tasa de asistencia
│   ├── Saldo pendiente
│   ├── Exportar a Excel
│   └── Exportar a PDF
└── 09. RIPS
    ├── Validar periodo
    ├── Generar RIPS
    └── Ver histórico
```

### 9.2. Variables de Entorno de Postman

Para facilitar el uso, la colección utiliza variables de entorno:

| Variable | Valor |
|---|---|
| `{{baseUrl}}` | `http://localhost:3000/api` (dev) o `https://odontosoft-backend-dwes.onrender.com/api` (prod) |
| `{{tokenAdmin}}` | Se autopobla al ejecutar "Login Admin" mediante script post-response |
| `{{tokenOdontologo}}` | Se autopobla al ejecutar "Login Odontologo" |
| `{{tokenRecepcionista}}` | Se autopobla al ejecutar "Login Recepcionista" |
| `{{pacienteId}}` | ObjectId de un paciente de prueba |

### 9.3. Script Post-Response para Captura Automática de Tokens

En la request "Login Admin", el script Tests captura automáticamente el token para las siguientes peticiones:

```javascript
// Postman Test script
const respuesta = pm.response.json();
pm.environment.set("tokenAdmin", respuesta.token);
pm.test("Login OK", () => {
  pm.expect(pm.response.code).to.equal(200);
  pm.expect(respuesta.token).to.be.a("string");
});
```

> **[ INSERTAR CAPTURA DE PANTALLA AQUÍ ]**
>
> *Figura 9.1. Colección de Postman con la estructura de carpetas por módulo.*

> **[ INSERTAR CAPTURA DE PANTALLA AQUÍ ]**
>
> *Figura 9.2. Ejemplo de request "Login Admin" con la respuesta 200 y el token capturado.*

> **[ INSERTAR CAPTURA DE PANTALLA AQUÍ ]**
>
> *Figura 9.3. Ejemplo de request "Crear paciente" (POST /api/pacientes) con Bearer token de recepcionista y body JSON.*

> **[ INSERTAR CAPTURA DE PANTALLA AQUÍ ]**
>
> *Figura 9.4. Ejemplo de request de reporte (GET /api/reportes/ingresos) con la respuesta agregada.*

---

## 10. Manejo de Errores y Códigos HTTP

El backend usa códigos de estado HTTP con semántica consistente en todos los módulos. La convención es la siguiente:

| Código | Significado | Cuándo lo devuelve la API |
|:---:|---|---|
| **200** | OK | Lectura exitosa o actualización exitosa |
| **201** | Created | Creación exitosa de un recurso nuevo |
| **400** | Bad Request | Datos inválidos: formato incorrecto, campo faltante, monto negativo, formato de periodo inválido |
| **401** | Unauthorized | No autenticado: token ausente, inválido o expirado; credenciales incorrectas |
| **403** | Forbidden | Autenticado correctamente pero el rol no tiene permiso para ese endpoint |
| **404** | Not Found | Recurso inexistente: ID no encontrado, o no hay datos para generar (ej. RIPS de un periodo sin atenciones) |
| **409** | Conflict | Estado actual impide la acción: documento duplicado, conflicto de horario, factura anulada, stock insuficiente |
| **429** | Too Many Requests | Rate limit del login activado (RNF-03) |
| **500** | Internal Server Error | Error no controlado del servidor (siempre logueado en consola) |

### 10.1. Middleware de Errores Centralizado

Todos los errores no capturados individualmente son manejados por un middleware final en `app.js`:

```javascript
// src/app.js
app.use((error, req, res, next) => {
  console.error("Error no controlado:", error);
  const codigo = error.status || 500;
  const mensaje = error.message || "Error interno del servidor";
  return res.status(codigo).json({ mensaje });
});
```

---

## 11. Pruebas Automatizadas end-to-end

Cada módulo cuenta con un script de pruebas end-to-end (`backend/tests/test-e2e-*.sh`) que valida el ciclo completo contra el backend real: obtención de tokens por rol, ejecución de operaciones CRUD, validación de reglas de negocio y control de acceso.

### 11.1. Cobertura de las Pruebas

| Módulo | Script | Pruebas |
|---|---|:---:|
| 1. Autenticación | `test-e2e-auth.sh` | 11/11 |
| 2. Pacientes | `test-e2e-pacientes.sh` | 11/11 |
| 3. Citas | `test-e2e-citas.sh` | 12/12 |
| 4. Historia Clínica | `test-e2e-historia-clinica.sh` | 13/13 |
| 5. Facturación | `test-e2e-facturacion.sh` | 12/12 |
| 6. Inventario | `test-e2e-inventario.sh` | 11/11 |
| 7. Recordatorios | `test-e2e-recordatorios.sh` | 9/9 |
| 8. Reportes | `test-e2e-reportes.sh` | 10/10 |
| 9. RIPS | `test-e2e-rips.sh` | 12/12 |

**Total: 101 pruebas end-to-end, todas pasando exitosamente.**

### 11.2. Ejemplo de Script — test-e2e-pacientes.sh (extracto)

```bash
#!/bin/bash

# Login como recepcionista
TOKEN_RECEP=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"recepcion@odontosoft.com","password":"Recepcion123!"}' \
  | node -pe "JSON.parse(require('fs').readFileSync(0,'utf8')).token")

# Crear paciente
echo "=== Crear paciente (esperado 201) ==="
curl -s -o /dev/null -w "Status: %{http_code}\n" -X POST \
  http://localhost:3000/api/pacientes \
  -H "Authorization: Bearer $TOKEN_RECEP" \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Prueba","apellido":"Test","tipoDocumento":"CC","numeroDocumento":"1234567"}'

# Intentar duplicado (esperado 409)
echo "=== Intentar duplicado (esperado 409) ==="
curl -s -o /dev/null -w "Status: %{http_code}\n" -X POST \
  http://localhost:3000/api/pacientes \
  -H "Authorization: Bearer $TOKEN_RECEP" \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Otro","tipoDocumento":"CC","numeroDocumento":"1234567"}'
```

> **[ INSERTAR CAPTURA DE PANTALLA AQUÍ ]**
>
> *Figura 11.1. Ejecución exitosa del script test-e2e-pacientes.sh mostrando los 11 casos pasando.*

---

## 12. Conclusiones

El presente documento evidencia la implementación completa del backend del sistema OdontoSoft sobre Node.js y Express, cumpliendo con los siguientes hitos:

- Arquitectura por capas con separación clara de responsabilidades (rutas, controladores, servicios, modelos).
- Integración con MongoDB Atlas mediante Mongoose, con esquemas validados y agregaciones de datos para reportes.
- Seguridad transversal aplicada: autenticación JWT, autorización por rol, rate limiting en login (RNF-03).
- API REST clara y consistente con convención de recursos + verbos HTTP + códigos de estado.
- Documentación completa en Postman con colección organizada por módulos y variables de entorno.
- 101 pruebas end-to-end automatizadas, todas pasando.

El backend queda listo para ser consumido por el frontend Angular (Documento 6) y para ser desplegado en la nube (Documento 5).

### Preparación para el Documento 5

El siguiente paso (Documento 5, Mes 5) consiste en desplegar el backend en la nube — específicamente en Render, apuntando a la base de datos ya en Atlas. Este despliegue transforma la aplicación local en un servicio accesible públicamente vía HTTPS.
