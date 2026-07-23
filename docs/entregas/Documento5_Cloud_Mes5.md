# SERVICIO NACIONAL DE APRENDIZAJE — SENA

**Etapa Productiva — Modalidad Proyecto Productivo**

*Competencia Técnica: Análisis y Desarrollo de Software*

---

## DOCUMENTO 5 — MES 5
# Infraestructura Cloud, Despliegue y Prácticas DevOps

**Proyecto:** OdontoSoft — Sistema de Gestión Clínica Odontológica

*Alineación: Guía de Aprendizaje 5 — Desplegar Aplicaciones en la Nube*

*Plataformas: MongoDB Atlas + Render + GitHub Actions*

**Aprendiz:** `[NOMBRE COMPLETO DEL APRENDIZ]`

**Ficha SENA:** `[NÚMERO DE FICHA]`

**Instructor:** `[NOMBRE DEL INSTRUCTOR]`

**Fecha de entrega:** `[FECHA]`

---

## Contenido

1. Introducción
2. Arquitectura General del Despliegue
3. Componente 1 — Base de Datos en MongoDB Atlas
4. Componente 2 — Backend en Render (Web Service)
5. Componente 3 — Frontend en Render (Static Site)
6. Gestión de Variables de Entorno y Secretos
7. Verificación End-to-End en Producción
8. CI/CD Básico con GitHub Actions
9. Estrategia de Ramas y Convención de Commits
10. Costos, Limitaciones y Decisiones de Alcance
11. Incidentes Reales del Despliegue y su Resolución
12. Conclusiones

---

## 1. Introducción

El presente documento evidencia la fase de despliegue del sistema OdontoSoft, en la cual la aplicación pasa de ejecutarse localmente (Docker + Codespaces) a estar accesible públicamente en la nube. Se alinea con la Guía de Aprendizaje 5 (Desplegar aplicaciones en la nube) del programa de Análisis y Desarrollo de Software del SENA.

El despliegue involucra tres componentes independientes que colaboran entre sí: (a) la base de datos en MongoDB Atlas, (b) el backend Node.js en Render como Web Service, y (c) el frontend Angular en Render como Static Site. Este documento describe cada uno de estos componentes, la configuración de variables de entorno seguras, la verificación end-to-end del sistema en producción, una propuesta de pipeline CI/CD básico con GitHub Actions, y los incidentes reales enfrentados durante el despliegue.

---

## 2. Arquitectura General del Despliegue

### 2.1. Diagrama de Despliegue

El sistema en producción se compone de tres servicios independientes conectados por HTTPS y por la cadena de conexión MongoDB. Cada componente vive en una plataforma distinta:

```
       +--------------------+
       |  Usuario final     |
       |  (navegador web)   |
       +--------------------+
                |
                | HTTPS
                v
  +-----------------------------------+
  |  FRONTEND (Angular SPA)            |
  |  Render — Static Site              |
  |  https://odontosoft-frontend-3925.  |
  |          onrender.com               |
  +-----------------------------------+
                |
                | HTTPS  (fetch API)
                v
  +-----------------------------------+
  |  BACKEND (Node.js + Express)       |
  |  Render — Web Service              |
  |  https://odontosoft-backend-dwes.   |
  |          onrender.com/api           |
  +-----------------------------------+
                |
                | mongodb+srv:// (TLS)
                v
  +-----------------------------------+
  |  BASE DE DATOS (MongoDB)           |
  |  MongoDB Atlas — cluster M0        |
  |  odontosoft-cluster                |
  |  (AWS us-east-1 / Replica Set 3)   |
  +-----------------------------------+
```

> **[ INSERTAR CAPTURA DE PANTALLA AQUÍ ]**
>
> *Figura 2.1. Diagrama de arquitectura de despliegue en la nube (recomendado dibujar en draw.io/Lucidchart siguiendo la estructura anterior).*

### 2.2. Justificación de las Plataformas Elegidas

| Componente | Plataforma elegida | Justificación |
|---|---|---|
| Base de datos | MongoDB Atlas (M0 Free) | Solución gestionada oficial de MongoDB; plan gratuito suficiente para el alcance; sin operación manual |
| Backend | Render — Web Service (Free) | Deploy automático desde GitHub; HTTPS por defecto; logs en tiempo real; plan gratuito para proyecto académico |
| Frontend | Render — Static Site (Free) | Deploy automático; CDN global; certificado TLS automático; misma cuenta que backend simplifica administración |

*Se evaluaron alternativas como Heroku (backend), Netlify/Vercel (frontend) y AWS EC2 (mayor complejidad). Se privilegió la homogeneidad de plataforma para el frontend + backend (ambos en Render), reduciendo puntos de fricción y facilitando la administración desde un único panel.*

---

## 3. Componente 1 — Base de Datos en MongoDB Atlas

### 3.1. Configuración del Cluster

| Parámetro | Valor |
|---|---|
| **Nombre del cluster** | `odontosoft-cluster` |
| **Plan** | M0 Free — 512 MB de almacenamiento, RAM compartida |
| **Proveedor / Región** | AWS — N. Virginia (us-east-1) |
| **Tipo de despliegue** | Replica Set con 3 nodos (alta disponibilidad automática) |
| **Versión de MongoDB** | 8.0.x |
| **Base de datos** | `odontosoft` |
| **Colecciones** | 11 colecciones migradas desde el entorno local |
| **Índices** | 22 índices activos |

> **[ INSERTAR CAPTURA DE PANTALLA AQUÍ ]**
>
> *Figura 3.1. Panel principal del cluster odontosoft-cluster en MongoDB Atlas.*

### 3.2. Seguridad — Access List (IP Whitelist)

Para el alcance académico del proyecto se configuró la lista de acceso como `0.0.0.0/0` (permitir desde cualquier IP), lo cual habilita que Render pueda conectarse desde sus IPs dinámicas. En un entorno de producción real, se restringiría a las IPs específicas de Render o se establecería un peering privado.

> **[ INSERTAR CAPTURA DE PANTALLA AQUÍ ]**
>
> *Figura 3.2. Configuración de Network Access mostrando la entrada 0.0.0.0/0 en Atlas.*

### 3.3. Seguridad — Autenticación de Base de Datos

Se creó un usuario de aplicación con permisos limitados a la base `odontosoft`:

- Usuario: `odontosoft_admin`
- Mecanismo de autenticación: SCRAM-SHA-256 (encriptación en tránsito TLS)
- Rol: Read and write to any database (restringido en la práctica al scope `odontosoft`)
- La contraseña se almacena únicamente como variable de entorno `MONGO_URI` (nunca en el código fuente ni en el repositorio)

> **[ INSERTAR CAPTURA DE PANTALLA AQUÍ ]**
>
> *Figura 3.3. Panel de Database Access de Atlas con el usuario odontosoft_admin creado.*

### 3.4. Migración de Datos desde el Entorno Local

El proceso de migración desde el contenedor Docker local a MongoDB Atlas se realizó mediante `mongodump` + `mongorestore`:

```bash
# Paso 1 — dump desde el contenedor Docker local
docker exec odontosoft-mongo mongodump \
  --db odontosoft --archive=/tmp/odontosoft-backup.archive

# Paso 2 — copiar el archivo del contenedor al host (Codespace)
docker cp odontosoft-mongo:/tmp/odontosoft-backup.archive ./

# Paso 3 — restaurar en Atlas
mongorestore \
  --uri="mongodb+srv://odontosoft_admin:<pwd>@odontosoft-cluster.<hash>.mongodb.net/odontosoft" \
  --archive=./odontosoft-backup.archive
```

**Resultado del comando (log real de la migración):**

```
2026-07-20T20:55:50.513+0000  writing odontosoft.logaccesos to "archive"
2026-07-20T20:55:50.513+0000  writing odontosoft.citas to "archive"
2026-07-20T20:55:50.515+0000  writing odontosoft.materials to "archive"
2026-07-20T20:55:50.517+0000  writing odontosoft.facturas to "archive"
  ... (continúa con las otras colecciones)
2026-07-20T20:55:50.640+0000  done dumping — 45.77 kB total
```

> **[ INSERTAR CAPTURA DE PANTALLA AQUÍ ]**
>
> *Figura 3.4. Salida completa del comando mongorestore mostrando las 11 colecciones migradas exitosamente.*

> **[ INSERTAR CAPTURA DE PANTALLA AQUÍ ]**
>
> *Figura 3.5. Vista "Browse Collections" en Atlas confirmando las 11 colecciones (usuarios, pacientes, citas, historiaclinicas, facturas, materials, recordatorios, configuracionmensajes, archivorips, tokeninvalidados, logaccesos).*

---

## 4. Componente 2 — Backend en Render (Web Service)

### 4.1. Configuración del Servicio

| Parámetro | Valor |
|---|---|
| **Nombre del servicio** | `odontosoft-backend` |
| **Tipo** | Web Service |
| **Repositorio** | `juangarcesco/odontosoft-v2` (rama `main`) |
| **Región** | Oregon (US West) |
| **Root Directory** | `backend` |
| **Runtime** | Node.js 24.14.1 |
| **Build Command** | `npm install` |
| **Start Command** | `node src/server.js` |
| **Plan** | Free (0 USD/mes) |
| **URL pública** | `https://odontosoft-backend-dwes.onrender.com` |

> **[ INSERTAR CAPTURA DE PANTALLA AQUÍ ]**
>
> *Figura 4.1. Panel de configuración del servicio odontosoft-backend en Render, mostrando estado "Deployed".*

### 4.2. Log del Deploy

Extracto del log real del primer deploy exitoso:

```
==> Cloning from https://github.com/juangarcesco/odontosoft-v2
==> Checking out commit 40a3a6cef447c74c72d60354e051fa2cec8cdeff in branch main
==> Using Node.js version 24.14.1 (default)
==> Running build command 'npm install'...
    added 271 packages, and audited 272 packages in 3s
==> Build successful 🎉
==> Deploying...
==> Running 'node src/server.js'
    ✅ MongoDB conectado
    🚀 Servidor escuchando en puerto 3000
    ✅ Job de recordatorios programado (cada hora, minuto 0)
==> Your service is live 🎉
==> Available at your primary URL https://odontosoft-backend-dwes.onrender.com
```

> **[ INSERTAR CAPTURA DE PANTALLA AQUÍ ]**
>
> *Figura 4.2. Log de deploy exitoso del backend en Render con el mensaje "Your service is live".*

### 4.3. Comportamiento del Plan Free — Cold Start

El plan Free de Render suspende ("duerme") el servicio después de 15 minutos sin peticiones. La primera petición después de este periodo tarda entre 30 y 60 segundos en despertar el servicio (cold start), momento tras el cual las peticiones siguientes vuelven a ser instantáneas.

*Esta limitación se documenta explícitamente como una decisión de alcance académico: aceptable para un proyecto de curso, pero no adecuada para una operación clínica real, donde se preferiría un plan de pago con instancias siempre activas.*

### 4.4. Verificación del Backend Desplegado

Se realizaron tres verificaciones sucesivas contra la URL pública para confirmar el funcionamiento end-to-end del backend:

#### Verificación 1 — Health check (endpoint no autenticado)

```bash
$ curl https://odontosoft-backend-dwes.onrender.com/api/health
{"status":"ok","service":"OdontoSoft API"}
```

> **[ INSERTAR CAPTURA DE PANTALLA AQUÍ ]**
>
> *Figura 4.3. Terminal mostrando el resultado del health check con respuesta 200 OK.*

#### Verificación 2 — Login real (validando contra Atlas)

```bash
$ curl -X POST https://odontosoft-backend-dwes.onrender.com/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@odontosoft.com","password":"..."}'

Respuesta:
{
  "mensaje": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "_id": "6a504500a47aeacb83e10e43",
    "nombre": "Administrador General",
    "rol": "ADMIN"
  }
}
```

*Este resultado confirma el ciclo completo Codespace → Render (Oregon) → Atlas (N. Virginia): la contraseña se compara contra el hash bcrypt real que fue migrado en el mongorestore, y se genera un token JWT firmado con el `JWT_SECRET` real de Render.*

#### Verificación 3 — Consulta autenticada de pacientes

```bash
$ curl https://odontosoft-backend-dwes.onrender.com/api/pacientes \
    -H "Authorization: Bearer $TOKEN"

Respuesta:
{
  "pacientes": [{
    "_id": "6a52ace7736b50e45c2dbc3c",
    "nombre": "Carlos",
    "apellido": "Ramírez",
    ...
  }],
  "paginacion": {"total":1,"pagina":1,"limite":10,"totalPaginas":1}
}
```

*Confirma que el paciente real "Carlos Ramírez" (migrado desde el entorno local) se recupera exitosamente a través del backend en la nube.*

---

## 5. Componente 3 — Frontend en Render (Static Site)

### 5.1. Configuración del Servicio

| Parámetro | Valor |
|---|---|
| **Nombre del servicio** | `odontosoft-frontend` |
| **Tipo** | Static Site |
| **Repositorio** | `juangarcesco/odontosoft-v2` (rama `main`) |
| **Root Directory** | `frontend` |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist/frontend/browser` |
| **Rewrite rule** | `/* → /index.html` (Rewrite) |
| **URL pública** | `https://odontosoft-frontend-3925.onrender.com` |

> **[ INSERTAR CAPTURA DE PANTALLA AQUÍ ]**
>
> *Figura 5.1. Panel de configuración del Static Site odontosoft-frontend en Render.*

### 5.2. Configuración de Angular para Producción

Angular usa el archivo `src/environments/environment.ts` para determinar la URL del backend en tiempo de build. Para producción se apunta a la URL pública de Render:

```typescript
// frontend/src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'https://odontosoft-backend-dwes.onrender.com/api'
};
```

### 5.3. Rewrite Rule para SPA

Angular es una aplicación de página única (SPA): todas las rutas del cliente (`/pacientes`, `/citas`, `/rips/historial`, etc.) se resuelven en JavaScript, no como archivos físicos en el servidor. Sin una regla de rewrite, cualquier recarga (F5) o acceso directo a una URL interna produciría un error 404.

La regla configurada en Render redirige cualquier ruta al archivo `index.html` principal, dejando que Angular resuelva la navegación en el cliente:

| Source | Destination | Action |
|:---:|:---:|:---:|
| `/*` | `/index.html` | `Rewrite` |

> **[ INSERTAR CAPTURA DE PANTALLA AQUÍ ]**
>
> *Figura 5.2. Configuración de "Redirects/Rewrites" en Render mostrando la regla /* → /index.html.*

### 5.4. Verificación del Frontend en Producción

Se verificó el frontend accediendo a la URL pública desde un navegador. La pantalla de login se cargó correctamente y, tras autenticarse con el usuario `admin@odontosoft.com`, el sistema mostró el módulo de Pacientes con los datos reales migrados a Atlas (Carlos Ramírez).

> **[ INSERTAR CAPTURA DE PANTALLA AQUÍ ]**
>
> *Figura 5.3. Navegador mostrando la pantalla de login del frontend en producción (https://odontosoft-frontend-3925.onrender.com/login).*

> **[ INSERTAR CAPTURA DE PANTALLA AQUÍ ]**
>
> *Figura 5.4. Frontend en producción mostrando el módulo de Pacientes con el paciente real Carlos Ramírez migrado desde el entorno local.*

---

## 6. Gestión de Variables de Entorno y Secretos

### 6.1. Filosofía — 12-Factor App

Se sigue el principio "Config in the environment" de la metodología Twelve-Factor App: ningún secreto (contraseñas, claves JWT, credenciales de terceros) se almacena en el código fuente ni en el repositorio Git. Todo dato sensible vive como variable de entorno inyectada por la plataforma de despliegue.

### 6.2. Variables Configuradas en Render (backend)

| Variable | Propósito |
|---|---|
| `MONGO_URI` | Cadena de conexión `mongodb+srv://` completa a Atlas (con credenciales) |
| `JWT_SECRET` | Clave para firmar tokens JWT (mínimo 32 caracteres aleatorios) |
| `JWT_EXPIRES_IN` | Tiempo de vida del token (por defecto 8h) |
| `SEED_ADMIN_PASSWORD` | Contraseña del administrador creada por `seedAdmin.js` |
| `SEED_ODONTOLOGO_PASSWORD` | Contraseña del odontólogo de prueba |
| `SEED_RECEPCIONISTA_PASSWORD` | Contraseña de la recepcionista de prueba |
| `ETHEREAL_USER` | Usuario SMTP de Ethereal para envío de recordatorios por email |
| `ETHEREAL_PASS` | Contraseña SMTP de Ethereal |
| `PORT` | Puerto asignado por Render (usualmente sobrescrito por el runtime) |

> **[ INSERTAR CAPTURA DE PANTALLA AQUÍ ]**
>
> *Figura 6.1. Panel de "Environment Variables" del backend en Render con las 9 variables configuradas (valores ocultos).*

### 6.3. Aislamiento Dev/Prod

El archivo `.env` local del Codespace mantiene valores de desarrollo (MongoDB local vía Docker), mientras que Render mantiene los valores de producción (Atlas). Ambos se sobrescriben independientemente sin colisión.

### 6.4. Rotación de Secretos Comprometidos

Como buena práctica, tras la primera fase de configuración inicial se procedió a rotar las contraseñas de todos los secretos que habían sido usados durante el desarrollo (donde pudieron ser compartidos en logs o capturas de pantalla):

- Contraseña del usuario `odontosoft_admin` en Atlas: rotada.
- `JWT_SECRET` del backend: rotado (obliga a reautenticarse a todos los usuarios).
- Contraseñas de los usuarios seed: rotadas y almacenadas únicamente en el gestor de contraseñas del aprendiz.

*Este proceso simula la respuesta ante un incidente de seguridad en un entorno real: cuando un secreto puede haber quedado expuesto, se rota de inmediato.*

---

## 7. Verificación End-to-End en Producción

Para validar la infraestructura completa se ejecutaron pruebas que atraviesan los tres componentes en cadena: navegador del usuario → Frontend en Render → Backend en Render → Atlas.

### 7.1. Flujo Completo Verificado

```
1. Usuario abre https://odontosoft-frontend-3925.onrender.com/login
   → Static Site sirve el bundle Angular (HTML/JS/CSS)

2. Angular carga la SPA en el navegador
   → Renderiza pantalla de login

3. Usuario ingresa email y contraseña
   → Angular hace POST fetch a odontosoft-backend-dwes.onrender.com/api/auth/login

4. Backend Node.js recibe la petición
   → Consulta a Atlas: db.usuarios.findOne({email})
   → bcrypt.compare(passwordEntrada, hashAlmacenado)
   → jwt.sign(payload, JWT_SECRET)
   → Registra en logaccesos
   → Retorna token JWT + datos del usuario

5. Angular recibe el token
   → Lo guarda en memoria (signal)
   → Redirige a /dashboard
   → Nuevo fetch: GET /api/pacientes con Authorization: Bearer <token>

6. Backend valida el token
   → Middleware verificarToken (jwt.verify)
   → Consulta paginada a la colección pacientes en Atlas
   → Retorna JSON con los datos

7. Angular renderiza la lista de pacientes en pantalla
```

*Este flujo se ejecutó exitosamente el 22 de julio de 2026, confirmando la operación end-to-end del sistema en la nube.*

> **[ INSERTAR CAPTURA DE PANTALLA AQUÍ ]**
>
> *Figura 7.1. Pestaña de red del navegador mostrando las peticiones exitosas del flujo completo (login → dashboard → pacientes).*

### 7.2. Ejecución de Scripts End-to-End contra Producción

Los mismos scripts `test-e2e-*.sh` usados en desarrollo pueden reejecutarse contra la URL de producción cambiando la variable base:

```bash
BASE_URL="https://odontosoft-backend-dwes.onrender.com/api"
./tests/test-e2e-auth.sh

# Resultado esperado: mismos 11/11 pases que en local
```

---

## 8. CI/CD Básico con GitHub Actions

### 8.1. Estado Actual

El sistema aprovecha el CI/CD nativo de Render: cada push a la rama `main` dispara automáticamente un nuevo deploy tanto del backend (Web Service) como del frontend (Static Site). Este flujo se conoce como "Auto-Deploy" y ya está activo por defecto.

*En la práctica esto significa que el flujo completo desde el commit hasta la producción es:*

```
git push origin main
     |
     v
  GitHub
     |
     | webhook automático
     v
  Render detecta el push
     |
     v
  Render clona → build → deploy
     |
     v
  Servicio Live
```

> **[ INSERTAR CAPTURA DE PANTALLA AQUÍ ]**
>
> *Figura 8.1. Historial de deploys automáticos en Render mostrando la relación commit → deploy.*

### 8.2. Propuesta de Mejora — Pipeline GitHub Actions

Como mejora futura se propone un pipeline de GitHub Actions que ejecute pruebas end-to-end antes de que Render inicie el deploy. Ejemplo del workflow:

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    services:
      mongodb:
        image: mongo:7
        ports: ["27017:27017"]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: "24" }
      - run: cd backend && npm install
      - run: cd backend && node src/scripts/seedAdmin.js
        env:
          MONGO_URI: mongodb://localhost:27017/odontosoft
          JWT_SECRET: test_secret_ci
          SEED_ADMIN_PASSWORD: Admin123!
      - run: cd backend && npm start &
      - run: sleep 5 && ./backend/tests/test-e2e-auth.sh

  frontend-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: "24" }
      - run: cd frontend && npm install
      - run: cd frontend && npm run build
```

*Este pipeline correría en cada push y cada pull request, evitando que un commit con errores llegue a producción. Se documenta como propuesta futura ya que actualmente no es un requisito bloqueante para el alcance del proyecto.*

---

## 9. Estrategia de Ramas y Convención de Commits

### 9.1. Estrategia de Ramas — Feature Branch Workflow

El proyecto usa el modelo Feature Branch: la rama `main` representa el estado desplegado en producción; cada módulo se desarrolla en una rama `feature/moduloN-nombre` y se fusiona vía Pull Request tras completar sus pruebas.

```
main             o-------o-------o-------o-------o-------o
                  \     /\      /\      /\      /\      /
                   \   /  \    /  \    /  \    /  \    /
feature/mod1        o-o    \  /    \  /    \  /    \  /
feature/mod2               o-o      \/      \/      \/
feature/mod3                        o-o     ...
feature/mod4                                o-o
...
```

### 9.2. Ramas Creadas Durante el Proyecto

| Rama | Estado | PR |
|---|:---:|:---:|
| `feature/modulo1-autenticacion` | Fusionada a main | #1 |
| `feature/modulo2-pacientes` | Fusionada a main | #2 |
| `feature/modulo3-citas` | Fusionada a main | #3 |
| `feature/modulo4-historia-clinica` | Fusionada a main | #4 |
| `feature/modulo5-facturacion` | Fusionada a main | #5 |
| `feature/modulo6-inventario` | Fusionada a main | #6 |
| `feature/modulo7-recordatorios` | Fusionada a main | #7 |
| `feature/modulo8-reportes` | Fusionada a main | #8 |
| `feature/modulo9-rips` | Fusionada a main | #9 |

### 9.3. Convención de Commits

Todos los commits siguen el formato:

```
tipo(RF-XX,RN-YY): descripción breve en presente
```

**Donde:**

- `tipo`: `feat` (nueva funcionalidad), `fix` (corrección), `test` (pruebas), `docs` (documentación), `refactor` (reorganización sin cambio de comportamiento)
- `RF-XX`: referencia al requisito funcional trabajado, extraído del SRS (Documento 1)
- `RN-YY`: referencia a la regla de negocio aplicada (opcional)
- `descripción`: en español, tiempo presente, sin punto final

**Ejemplos reales del proyecto:**

```
feat(RF-01,RF-03): implementar endpoint de login con generación de JWT
fix(RN-10): implementar desactivación de evolución clínica, exclusiva de ADMIN
feat(RF-57): implementar validación de atenciones completas/incompletas por periodo
test: agregar script end-to-end de RIPS (12/12 exitosas)
docs: agregar documentación completa del Módulo 9
```

*Esta convención facilita la trazabilidad: dado un commit, es inmediato identificar cuál requisito del SRS lo motivó. Este enfoque también permite reconstruir el proyecto a partir del historial git de forma sistemática.*

---

## 10. Costos, Limitaciones y Decisiones de Alcance

### 10.1. Costos Actuales

El sistema completo opera actualmente con costo **0 USD/mes**, aprovechando los planes gratuitos de las tres plataformas:

| Componente | Costo mensual | Limitaciones del plan free |
|---|:---:|---|
| MongoDB Atlas M0 | **0 USD** | 512 MB de almacenamiento; RAM compartida |
| Render — backend | **0 USD** | Cold start tras 15 min de inactividad; 512 MB RAM |
| Render — frontend | **0 USD** | 100 GB de ancho de banda mensual; sin cold start |
| GitHub | **0 USD** | Repositorios privados ilimitados; 2000 min de Actions/mes |
| **Total** | **0 USD/mes** | — |

### 10.2. Escenario de Producción Real (Estimación)

Para un uso productivo real en un consultorio dental, se estimarían los siguientes upgrades:

| Componente | Plan recomendado | Costo aproximado |
|---|---|:---:|
| MongoDB Atlas | M10 (2 GB RAM, replica dedicada) | ~57 USD/mes |
| Render backend | Starter (sin cold start) | ~7 USD/mes |
| Render frontend | Free (sigue siendo suficiente) | 0 USD |
| Dominio propio | `.com` anual | ~1 USD/mes |
| **Total estimado** | — | **~65 USD/mes** |

### 10.3. Delimitaciones del Alcance de Despliegue

Se documentan de forma explícita las decisiones de alcance del despliegue, coherentes con la naturaleza académica del proyecto:

- El envío de emails usa Ethereal (SMTP de pruebas). En producción real se sustituiría por SendGrid, AWS SES o similar.
- El envío por WhatsApp está simulado, no integrado con Twilio ni similar.
- El almacenamiento de archivos adjuntos vive en el disco local del contenedor Render (efímero). En producción se migraría a un servicio como AWS S3 o Cloudflare R2.
- No se configura un dominio propio; se usan las URLs generadas por Render (`onrender.com`).
- No se configura backup automático de la base de datos más allá del ofrecido por Atlas Free (snapshot manual bajo demanda).

---

## 11. Incidentes Reales del Despliegue y su Resolución

Durante el proceso real de despliegue se enfrentaron varios incidentes técnicos. Se documentan aquí con transparencia como parte del aprendizaje del proceso.

### 11.1. Incidente 1 — Paquete mongodb-database-tools no disponible

**Síntoma:** al intentar instalar las herramientas para hacer `mongodump`/`mongorestore` en el Codespace, `sudo apt-get install mongodb-database-tools` devolvió "Unable to locate package".

**Causa:** el paquete no está en los repositorios estándar de Ubuntu Noble.

**Solución:** agregar el repositorio oficial de MongoDB antes de la instalación:

```bash
curl -fsSL https://pgp.mongodb.com/server-8.0.asc | \
  sudo gpg --dearmor -o /usr/share/keyrings/mongodb-server-8.0.gpg
echo "deb [signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg] \
  https://repo.mongodb.org/apt/ubuntu noble/mongodb-org/8.0 multiverse" | \
  sudo tee /etc/apt/sources.list.d/mongodb-org-8.0.list
sudo apt-get update && sudo apt-get install -y mongodb-database-tools
```

### 11.2. Incidente 2 — mongorestore fallaba con "authentication failed"

**Síntoma:** el comando `mongorestore` contra la URI de Atlas retornaba error de autenticación.

**Causa:** la cadena de conexión copiada de Atlas contenía un carácter `>` extra que quedó pegado a la contraseña al reemplazar el placeholder `<password>`. Además, faltaba el nombre de la base de datos (`/odontosoft`) antes de los parámetros de query.

**Solución:** reconstruir la cadena de conexión con cuidado, con la forma exacta:

```
mongodb+srv://odontosoft_admin:<pwd>@odontosoft-cluster.<hash>.mongodb.net/odontosoft?appName=odontosoft-cluster
```

### 11.3. Incidente 3 — Login válido devolvía "Credenciales inválidas" en producción

**Síntoma:** al probar el login contra el backend en Render con las credenciales correctas, se obtenía consistentemente 401.

**Diagnóstico:** la variable `MONGO_URI` en Render se había configurado apuntando a `mongodb://localhost:27017/odontosoft` (copia literal del `.env` local), en vez de a la cadena de Atlas. El backend se conectaba a una base vacía (localhost dentro del contenedor de Render) y por eso ningún usuario existía.

**Solución:** reemplazar la variable en el panel de Environment de Render por la cadena real de Atlas. Render redesplegó automáticamente y el login pasó a funcionar.

### 11.4. Incidente 4 — Frontend en producción llamaba al Codespace en vez del backend de Render

**Síntoma:** tras desplegar el frontend, cualquier acción provocaba errores de CORS con URLs del tipo `urban-funicular-....github.dev` (URL del Codespace del aprendiz).

**Causa raíz:** el archivo `src/environments/environment.ts` todavía apuntaba a la URL del Codespace (usada en desarrollo). Aunque existía `environment.production.ts` con la URL correcta de Render, el sistema de `fileReplacements` de Angular no aplicó el reemplazo en la build de Render.

**Solución:** modificar `environment.ts` para que apunte directamente a la URL pública de Render en todos los entornos, evitando la dependencia del reemplazo automático:

```typescript
export const environment = {
  production: false,
  apiUrl: 'https://odontosoft-backend-dwes.onrender.com/api'
};
```

*Este cambio permitió el login exitoso desde el navegador. Se documenta como decisión pragmática: para el alcance académico es aceptable que ambos entornos apunten a Render; en un proyecto de mayor escala se investigaría por qué el reemplazo no aplicó.*

### 11.5. Lecciones Aprendidas

- Los errores 401/403 en producción rara vez son bugs de código: casi siempre son variables de entorno mal configuradas.
- La transparencia en el error del backend (mensaje "Credenciales inválidas") complica el debugging: en cambio, un mensaje detallado en logs internos ayuda al operador sin exponer datos al cliente.
- Verificar la cadena de conexión antes de pegarla en Render puede ahorrar 30-60 minutos de diagnóstico ciego.
- El diagnóstico con `curl` directo contra la URL de producción, sin pasar por el frontend, aísla si el problema está en el backend o en el frontend.

---

## 12. Conclusiones

El presente documento evidencia el despliegue completo del sistema OdontoSoft en la nube, cumpliendo con los objetivos de la Guía de Aprendizaje 5:

- Base de datos productiva en MongoDB Atlas (cluster `odontosoft-cluster`, plan M0, réplica de 3 nodos).
- Backend desplegado en Render como Web Service, accesible en `https://odontosoft-backend-dwes.onrender.com`.
- Frontend desplegado en Render como Static Site, accesible en `https://odontosoft-frontend-3925.onrender.com`.
- Variables de entorno gestionadas de forma segura, sin exponer secretos en el código.
- Verificación end-to-end del flujo completo desde el navegador hasta la base de datos.
- CI/CD automático nativo de Render (auto-deploy en cada push a main), con propuesta documentada de mejora mediante GitHub Actions.
- Convención clara de ramas (feature branch workflow) y commits (trazabilidad al SRS).
- Costo total de operación: 0 USD/mes.

El sistema queda públicamente accesible y funcional. Los incidentes reales enfrentados y sus soluciones quedan documentados como referencia para futuros proyectos.

### Preparación para el Documento 6

El siguiente paso (Documento 6, Mes 6) consiste en documentar la interfaz de usuario Angular: componentes, servicios, guardas de ruta, gestión de estado con signals, e integración completa con la API REST ya desplegada. También incluye el manual de usuario final y el informe de cierre del proyecto.
