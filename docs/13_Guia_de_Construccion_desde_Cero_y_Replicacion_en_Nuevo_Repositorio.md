# Guía de Construcción desde Cero — Cómo Replicar OdontoSoft en un Nuevo Repositorio

**Propósito:** este documento reconstruye, a partir del historial real de commits del repositorio, el orden y las decisiones con las que se construyó OdontoSoft. Sirve como guía práctica para levantar un proyecto equivalente desde un repositorio vacío, sin depender de memoria ni de suposiciones.

---

## Contenido

1. Filosofía de construcción
2. Prerrequisitos
3. Paso 0 — Estructura inicial del repositorio
4. Paso 1 — Bootstrap del backend
5. Paso 2 — Módulo 1: Autenticación y control de acceso
6. Paso 3 — Módulo 2: Pacientes
7. Paso 4 — Módulos 3 a 9: repetir el patrón
8. Paso 5 — Bootstrap del frontend (Angular)
9. Paso 6 — Infraestructura local (Docker + Mongo)
10. Paso 7 — Pruebas end-to-end con scripts bash
11. Paso 8 — Despliegue (Render + MongoDB Atlas)
12. Paso 9 — Documentación en paralelo
13. Checklist resumido para un repo nuevo

---

## 1. Filosofía de construcción

El proyecto no se construyó "backend completo, luego frontend completo". Se construyó **módulo funcional por módulo funcional**, verticalmente: para cada módulo (Autenticación, Pacientes, Citas, Historia Clínica, Facturación, Inventario, Recordatorios, Reportes, RIPS) se hizo primero el modelo de datos, luego el servicio, luego el controlador y la ruta, y se cerró con un script de pruebas end-to-end antes de pasar al siguiente módulo. El frontend Angular llegó **después** de tener el backend de Autenticación y Pacientes funcionando, no en paralelo desde el día uno.

Esto se confirma en el propio historial de commits (`git log --oneline`, orden cronológico ascendente):

```
Initial commit
docs(backend): agregar plantilla de variables de entorno
chore: initialize backend package.json with dependencies and scripts
feat: agregar modelo de Usuario con esquema y validaciones
feat: agregar script para crear usuario administrador y servicio de autenticación
feat: implementar autenticación de usuario con login y generación de token
feat (RF-04,RF-05): agregar middleware de verificación de token y control de roles
feat(RF-06): implementar logout real con lista negra de tokens (TTL)
feat: agregar registro de intentos de inicio de sesión y limitador de tasa
feat(RF-08): configurar AuthService, interceptor JWT y guard de rutas en Angular
test: agregar scripts de seed de roles y pruebas end-to-end del Módulo 1
...
feat(RF-15,RF-16): agregar modelo Paciente con validación de documento único
feat(RF-09,RF-16): implementar endpoint de creación de pacientes con control de rol
feat(RF-10): implementar listado de pacientes con paginación
feat(RF-11): implementar búsqueda de pacientes por nombre, apellido o documento
feat(RF-12): implementar consulta de detalle de paciente por ID
feat(RF-13): implementar edición de datos de paciente con control de rol
feat(RF-14): implementar desactivación de paciente sin eliminación física
test: agregar pruebas unitarias para el servicio Paciente
feat: agregar PacienteService para consumir el CRUD de pacientes (Angular)
...
```

Es decir: **modelo → servicio → controlador/ruta → integración frontend → pruebas**, repetido módulo a módulo. Cada commit referencia el requisito funcional que resuelve (`RF-XX`), lo cual viene directamente del SRS (ver [`1_Especificación_de_Requisitos_de_Software`](./1_Especificación_de%20Requisitos%20de%20Software%20(SRS)_e_Inicio_del_Proyecto.md)).

**Regla de oro para replicar esto en un repo nuevo:** no empieces por el frontend, no empieces por "todos los modelos a la vez". Escoge el módulo más fundacional (aquí fue Autenticación, porque todo lo demás depende de roles y JWT), termínalo de punta a punta con su propio test, y solo entonces avanza al siguiente.

---

## 2. Prerrequisitos

- **Node.js** 20.x o superior y **npm** 10.x o superior.
- **Angular CLI** (`npm install -g @angular/cli`) — el proyecto usa Angular 21 con standalone components.
- **MongoDB** local (vía Docker) o una cuenta gratuita en MongoDB Atlas.
- **Git** y una cuenta en GitHub (o similar) para el repositorio remoto.
- **Docker** (opcional pero recomendado) para levantar Mongo sin instalarlo en el sistema.

---

## 3. Paso 0 — Estructura inicial del repositorio

```bash
mkdir mi-proyecto && cd mi-proyecto
git init
```

Crea la estructura de carpetas de nivel superior que separa backend, frontend y documentación:

```
mi-proyecto/
├── backend/
├── frontend/
├── docs/
├── scripts/
├── docker-compose.yml
├── .gitignore
└── README.md
```

`.gitignore` raíz (evita subir dependencias, credenciales y archivos generados):

```gitignore
backend/node_modules
backend/.env
frontend/node_modules
frontend/dist
backend/uploads/
```

Primer commit: `git commit -m "Initial commit"` — vacío o solo con `.gitignore`/`README.md`. No añadas código todavía; el objetivo de este commit es solo fijar el punto de partida.

---

## 4. Paso 1 — Bootstrap del backend

### 4.1 Inicializar el proyecto Node

```bash
cd backend
npm init -y
```

Instala las dependencias base según la necesidad real de cada módulo (no todas de una vez; en el historial real se fueron añadiendo a medida que cada módulo las necesitaba):

```bash
# Núcleo del servidor
npm install express cors morgan dotenv mongoose
npm install --save-dev nodemon

# Autenticación (Módulo 1)
npm install bcrypt jsonwebtoken express-rate-limit
```

Más adelante, según el módulo:

```bash
npm install multer sharp          # Historia clínica (adjuntos/imágenes)
npm install pdfkit exceljs        # Facturación y Reportes
npm install nodemailer node-cron  # Recordatorios automáticos
```

`package.json` — scripts mínimos:

```json
{
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js"
  }
}
```

### 4.2 Plantilla de variables de entorno

Crea `backend/.env.example` (se versiona) y `backend/.env` (NO se versiona, va en `.gitignore`):

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/odontosoft
JWT_SECRET=
JWT_EXPIRES_IN=8h
SEED_ADMIN_PASSWORD=
SEED_ODONTOLOGO_PASSWORD=
SEED_RECEPCIONISTA_PASSWORD=
```

Commit: `docs(backend): agregar plantilla de variables de entorno`.

### 4.3 Esqueleto de la aplicación Express

Estructura de carpetas dentro de `backend/src/` — este es el patrón arquitectónico que se repite para **todos** los módulos:

```
src/
├── config/       # conexión a base de datos
├── models/       # esquemas Mongoose
├── services/     # lógica de negocio, sin conocer HTTP
├── controllers/  # traducen HTTP <-> servicios
├── routes/       # definen los endpoints y aplican middlewares
├── middlewares/  # auth, roles, rate limiting, uploads
├── jobs/         # tareas programadas (node-cron)
├── scripts/      # scripts de un solo uso (seeds)
└── server.js / app.js
```

`src/config/db.js`:

```javascript
const mongoose = require('mongoose');

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB conectado');
  } catch (err) {
    console.error('Error al conectar a MongoDB:', err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
```

`src/app.js` (se define una sola vez y cada módulo nuevo solo añade una línea `app.use('/api/<recurso>', <recurso>Routes)`):

```javascript
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
app.set('trust proxy', 1); // necesario detrás de proxy (Codespaces, Render, etc.)

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'MiProyecto API' });
});

module.exports = app;
```

`src/server.js`:

```javascript
require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor escuchando en puerto ${PORT}`);
  });
});
```

Commit: `chore: initialize backend package.json with dependencies and scripts`.

---

## 5. Paso 2 — Módulo 1: Autenticación y control de acceso

Este fue el **primer módulo funcional real** y establece el patrón que se repite en todos los demás. El orden exacto seguido fue:

1. **Modelo** `Usuario` (esquema, hash de contraseña, roles como enum) — commit `feat: agregar modelo de Usuario con esquema y validaciones`.
2. **Script de seed** para crear el primer usuario ADMIN (`src/scripts/seedAdmin.js`) — necesario porque no hay UI para crear el primer usuario administrador:

   ```javascript
   require('dotenv').config();
   const mongoose = require('mongoose');
   const Usuario = require('../models/Usuario');
   const { hashPassword } = require('../services/authService');

   async function run() {
     await mongoose.connect(process.env.MONGO_URI);
     const passwordHash = await hashPassword(process.env.SEED_ADMIN_PASSWORD);
     await Usuario.create({ nombre: 'Administrador General', email: 'admin@...', passwordHash, rol: 'ADMIN' });
     await mongoose.disconnect();
   }
   run();
   ```

3. **Servicio de autenticación** (`authService.js`): hash/verify de contraseñas con bcrypt, generación de JWT.
4. **Login real** con generación de token — commit `feat: implementar autenticación de usuario con login y generación de token`.
5. **Middlewares de seguridad**, en este orden:
   - `authMiddleware.js` — verifica el JWT en el header `Authorization: Bearer <token>`.
   - `roleMiddleware.js` — restringe rutas por rol (`RF-04, RF-05`).
   - Logout real con **lista negra de tokens** (colección `TokenInvalidado` con TTL index de Mongo, para invalidar un JWT antes de su expiración natural) — `RF-06`.
   - `rateLimiter.js` con `express-rate-limit` + registro de intentos de login fallidos (protección contra fuerza bruta).
6. **Integración con el frontend Angular** (`AuthService`, interceptor JWT, guard de rutas) — solo se hizo *después* de tener el backend de auth 100% probado (`RF-08`).
7. **Script de seed de roles adicionales** (`ODONTOLOGO`, `RECEPCIONISTA`) y **primer script de pruebas end-to-end** (`test-e2e-auth.sh`) que cierra el módulo.

Patrón de capas usado en cada endpoint (documentado en detalle en [`10_Arquitectura_del_Backend`](./10_Arquitectura_del_Backend_Node_Express_y_API_REST.md)):

```
Ruta (routes/) → Middleware (auth, rol) → Controlador (controllers/) → Servicio (services/) → Modelo (models/, Mongoose)
```

El controlador nunca contiene lógica de negocio; solo traduce `req`/`res` y delega al servicio. El servicio nunca conoce Express (facilita testear la lógica sin levantar HTTP).

---

## 6. Paso 3 — Módulo 2: Pacientes

Con Autenticación ya funcionando, se repite exactamente el mismo patrón para el segundo módulo, en este orden real:

1. `feat: agregar modelo Paciente con validación de documento único` — el modelo define reglas de negocio a nivel de esquema (ej. índice único sobre número de documento).
2. `feat: implementar endpoint de creación de pacientes con control de rol` — ya reutiliza `authMiddleware` + `roleMiddleware` del Módulo 1.
3. `feat: implementar listado de pacientes con paginación`.
4. `feat: implementar búsqueda de pacientes por nombre, apellido o documento, insensible a tildes` (normalización de texto en el query, no en Mongo).
5. `feat: implementar consulta de detalle de paciente por ID`.
6. `feat: implementar edición de datos de paciente con control de rol`.
7. `feat: implementar desactivación de paciente sin eliminación física` (soft delete con un campo `activo: boolean`, nunca `deleteOne`).
8. Pruebas unitarias del servicio (Jest o equivalente) **antes** de tocar el frontend.
9. Recién entonces: `PacienteService` en Angular para consumir el CRUD, con sus propios formularios de registro/edición y vista de listado con buscador.
10. Cierre del módulo con `test-e2e-pacientes.sh`.

Nota de proceso real que vale la pena replicar: en el historial hay un commit posterior (`fix: restringir CRUD de pacientes solo a RECEPCIONISTA, según matriz de permisos del SRS`) que corrige una regla de negocio mal aplicada inicialmente. **Esto es normal** — la matriz de permisos por rol (ver [`4_Definicion_de_los_roles_de_usuario`](./4_Definicion_de_los_roles_de_usuario_que_interactuarán_con_la_plataforma_web.md)) debe volver a revisarse contra cada endpoint nuevo, porque es fácil que el control de acceso quede más permisivo de lo que el SRS exige.

---

## 7. Paso 4 — Módulos 3 a 9: repetir el patrón

El resto del sistema (Citas, Historia Clínica, Facturación, Inventario, Recordatorios, Reportes, RIPS) se construyó con la **misma secuencia** que Pacientes, cambiando solo la complejidad del dominio:

| Módulo | Particularidad del dominio a resolver |
|---|---|
| **Citas** (Módulo 3) | Validación de conflicto de horario (no solapar citas de un mismo profesional) y estado del ciclo de vida (`PROGRAMADA`, `CONFIRMADA`, `CANCELADA`, etc.). |
| **Historia Clínica** (Módulo 4) | Subida de archivos (`multer` + `sharp` para optimizar imágenes) y estructura de odontograma por diente/superficie (notación FDI). |
| **Facturación** (Módulo 5) | Generación de PDF (`pdfkit`), pagos parciales, anulación con motivo (nunca borrado físico). |
| **Inventario** (Módulo 6) | Movimientos de stock y alertas automáticas de stock bajo. |
| **Recordatorios** (Módulo 7) | Job programado con `node-cron` + envío de email con `nodemailer` (Ethereal en desarrollo). |
| **Reportes** (Módulo 8) | Agregaciones Mongo + exportación a Excel (`exceljs`) y PDF. |
| **RIPS** (Módulo 9) | Generación de archivos JSON conforme a normativa colombiana (Resolución 2275 de 2023). |

Checklist a repetir por cada módulo nuevo (extraído directamente del patrón de commits observado):

1. `feat: agregar modelo <Entidad> con validación de <regla de negocio clave>`
2. `feat(RF-XX): implementar creación de <recurso>` (aplicando roles desde el día uno, no como parche posterior)
3. `feat(RF-XX): implementar listado/búsqueda de <recurso>`
4. `feat(RF-XX): implementar detalle/edición/estado de <recurso>`
5. Pruebas unitarias del servicio backend
6. Servicio Angular (`core/<recurso>.ts`) + componentes en `features/<recurso>/`
7. `test: agregar script end-to-end de <recurso> con limpieza idempotente`
8. Documentar el módulo en `docs/modulos/Documentacion_ModuloN_<Nombre>.md`

El punto 7 (idempotencia) es importante: los scripts de prueba deben poder correr repetidamente sin dejar basura ni fallar por datos duplicados de una corrida anterior (por eso "con limpieza idempotente" aparece en varios mensajes de commit).

---

## 8. Paso 5 — Bootstrap del frontend (Angular)

El frontend se inicializa **después** de que el backend de Autenticación esté probado, no en paralelo:

```bash
cd frontend
npx @angular/cli new frontend --style=scss --routing --ssr=false
```

Estructura real usada:

```
frontend/src/app/
├── core/                # servicios HTTP, guard, interceptor — uno por entidad
│   ├── auth.ts / auth-guard.ts / auth-interceptor.ts
│   ├── paciente.ts, cita.ts, factura.ts, ...
├── features/             # una carpeta por pantalla/módulo funcional
│   ├── login/
│   ├── dashboard/
│   ├── pacientes/
│   ├── citas/
│   ├── historia-clinica/
│   ├── facturacion/
│   ├── inventario/
│   ├── recordatorios/
│   ├── reportes/
│   └── rips/
└── environments/
```

Convención por servicio en `core/`: un archivo `<entidad>.ts` con las llamadas HTTP (`HttpClient`) y su `<entidad>.spec.ts` de pruebas al lado. Cada `feature/<modulo>/` sigue el patrón standalone component de Angular: `<modulo>.ts`, `<modulo>.html`, `<modulo>.scss`, `<modulo>.spec.ts`.

Orden real de piezas del frontend:

1. `AuthService` + interceptor JWT (adjunta el token a cada request) + guard de rutas (bloquea acceso sin sesión) — esto se hizo antes que cualquier feature de negocio.
2. Pantalla de `login`.
3. Servicio + pantallas de `pacientes` (el primer CRUD de negocio).
4. Resto de features, módulo por módulo, en el mismo orden que el backend.

`src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
};
```

---

## 9. Paso 6 — Infraestructura local (Docker + Mongo)

`docker-compose.yml` en la raíz, para no depender de una instalación local de Mongo:

```yaml
services:
  mongo:
    image: mongo:7
    container_name: mi-proyecto-mongo
    restart: unless-stopped
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

volumes:
  mongo-data:
```

```bash
docker compose up -d
```

`MONGO_URI=mongodb://localhost:27017/mi-proyecto` en `backend/.env`.

---

## 10. Paso 7 — Pruebas end-to-end con scripts bash

En vez de (o además de) un framework de e2e pesado, el proyecto usa scripts bash simples con `curl` en `backend/tests/`, uno por módulo (`test-e2e-auth.sh`, `test-e2e-pacientes.sh`, `test-e2e-citas.sh`, …). Patrón usado en todos:

```bash
echo "=== 1. Login ADMIN ==="
TOKEN_ADMIN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@...","password":"..."}' \
  | node -pe "JSON.parse(require('fs').readFileSync(0,'utf8')).token")

echo "=== 2. ADMIN accede a un recurso protegido (debe dar 200) ==="
curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:3000/api/<recurso> \
  -H "Authorization: Bearer $TOKEN_ADMIN"

echo "=== 3. Un rol sin permiso intenta lo mismo (debe dar 403) ==="
curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:3000/api/<recurso> \
  -H "Authorization: Bearer $TOKEN_OTRO_ROL"
```

Cada script: hace login con cada rol relevante, prueba el camino feliz, y prueba explícitamente que los roles sin permiso reciben `403`. Esto verifica la matriz de permisos del SRS de forma ejecutable, no solo documentada.

---

## 11. Paso 8 — Despliegue (Render + MongoDB Atlas)

Documentado en detalle en [`11_Infraestructura_Cloud_Despliegue_y_Practicas_DevOps`](./11_Infraestructura_Cloud_Despliegue_y_Practicas_DevOps.md). Resumen para replicar:

1. **Base de datos**: crear un cluster gratuito (M0) en MongoDB Atlas, whitelist de IP (`0.0.0.0/0` para desarrollo o IPs específicas de Render en producción), usuario de base de datos dedicado.
2. **Backend**: Render Web Service apuntando a `backend/`, build command `npm install`, start command `npm start`, variables de entorno (`MONGO_URI`, `JWT_SECRET`, etc.) configuradas en el panel de Render, nunca en el repo.
3. **Frontend**: Render Static Site apuntando a `frontend/`, build command `npm run build`, publish directory `dist/frontend/browser`.
4. **CORS**: el backend debe permitir explícitamente el origen del static site de Render.
5. **Despliegue continuo**: conectar el repo de GitHub a ambos servicios de Render — cada push a `main` dispara build y deploy automático (CD ya resuelto por la integración nativa GitHub–Render, sin pipeline propio de CI adicional en la v1).

---

## 12. Paso 9 — Documentación en paralelo

La documentación no se escribió al final: cada módulo cerró con su propio archivo en `docs/modulos/Documentacion_ModuloN_<Nombre>.md`, y los documentos transversales (SRS, roles, arquitectura, DevOps, modelado de datos) se escribieron cuando el sistema ya tenía suficiente superficie real para describir con precisión (no se documentó código que aún no existía). Para un repo nuevo, replicar esto significa: un `docs/modulos/ModuloN.md` por cada módulo cerrado, más un puñado de documentos transversales al final (arquitectura, DevOps, modelo de datos), no antes.

---

## 13. Checklist resumido para un repo nuevo

```
[ ] git init + estructura backend/ frontend/ docs/ + .gitignore
[ ] backend: npm init, Express + Mongoose + dotenv, .env.example
[ ] backend: config/db.js, app.js, server.js (esqueleto mínimo, sin rutas de negocio)
[ ] Módulo fundacional (ej. Auth): modelo -> servicio -> middleware -> controlador -> ruta
[ ] Script de seed para el primer usuario/admin
[ ] Middlewares transversales: auth JWT, roles, rate limiting
[ ] Script de test e2e bash del módulo fundacional
[ ] Frontend: ng new, AuthService + interceptor + guard ANTES de features de negocio
[ ] Por cada módulo de negocio siguiente: repetir modelo -> servicio -> controlador -> ruta -> test e2e -> feature Angular
[ ] docker-compose.yml con Mongo para desarrollo local
[ ] Documentar cada módulo al cerrarlo en docs/modulos/
[ ] Despliegue: Atlas (DB) + Render (backend + frontend), variables de entorno solo en el panel del proveedor
[ ] Documentos transversales (arquitectura, DevOps, modelo de datos) al final, cuando ya reflejan el sistema real
```
