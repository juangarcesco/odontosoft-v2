# OdontoSoft

**Sistema de Gestión Clínica Odontológica** — Aplicación web completa para consultorios dentales de tamaño mediano.

![Estado](https://img.shields.io/badge/Estado-En%20producción-brightgreen)
![Stack](https://img.shields.io/badge/Stack-MEAN-blue)
![Node](https://img.shields.io/badge/Node.js-24.x-green)
![Angular](https://img.shields.io/badge/Angular-20-red)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)
![Licencia](https://img.shields.io/badge/Uso-Académico%20SENA-orange)

---

## 🌐 Sistema en Producción

| Componente | URL |
|---|---|
| **Frontend (Angular)** | https://odontosoft-frontend-3925.onrender.com |
| **Backend (API REST)** | https://odontosoft-backend-dwes.onrender.com/api |
| **Base de datos** | MongoDB Atlas · cluster `odontosoft-cluster` |
| **Repositorio** | https://github.com/juangarcesco/odontosoft-v2 |

**Costo mensual de operación:** 0 USD (planes gratuitos).

---

## 📖 Tabla de Contenidos

- [Descripción General](#-descripción-general)
- [Contexto Académico](#-contexto-académico)
- [Módulos del Sistema](#-módulos-del-sistema)
- [Stack Tecnológico](#-stack-tecnológico)
- [Arquitectura](#-arquitectura)
- [Instalación Local](#-instalación-local)
- [Despliegue en Producción](#-despliegue-en-producción)
- [Documentación](#-documentación)
- [Pruebas](#-pruebas)
- [Métricas del Proyecto](#-métricas-del-proyecto)
- [Autor](#-autor)

---

## 📋 Descripción General

OdontoSoft digitaliza los procesos administrativos, clínicos y financieros de un consultorio odontológico:

- **Gestión de pacientes** con validación de documento único
- **Agenda de citas** con detección automática de conflictos de horario
- **Historia clínica** con odontograma interactivo (32 dientes, notación FDI) y evoluciones cronológicas
- **Facturación y pagos** con cálculo automático de saldos e IVA
- **Inventario de materiales** con alertas de stock bajo
- **Recordatorios automáticos** por email 24 horas antes de cada cita
- **Reportes gerenciales** (ingresos, tratamientos, saldos, tasa de asistencia)
- **Generación de RIPS** (Registros Individuales de Prestación de Servicios) conforme a normativa colombiana

**Cliente:** Consultorio Odontológico OdontoSalud (Bogotá D.C.) — caso simulado con perfil realista de 15-25 pacientes/semana.

---

## 🎓 Contexto Académico

Proyecto desarrollado como **Etapa Productiva** del programa **Análisis y Desarrollo de Software** del SENA, bajo la modalidad de **Proyecto Productivo**.

- **Competencia técnica:** Análisis y Desarrollo de Software
- **Duración:** 6 meses (6 entregables mensuales alineados a las Guías de Aprendizaje 1-6)
- **Modalidad:** Individual con cliente simulado

---

## 🧩 Módulos del Sistema

| # | Módulo | Requisitos Funcionales | Reglas de Negocio |
|:---:|---|:---:|:---:|
| 1 | Autenticación y control de acceso | RF-01 a RF-08 | RNF-01 a RNF-05 |
| 2 | Pacientes | RF-09 a RF-16 | RN-02 |
| 3 | Agenda y citas | RF-17 a RF-24 | RN-01, RN-07 |
| 4 | Historia clínica y odontograma | RF-25 a RF-32 | RN-03, RN-09, RN-10 |
| 5 | Facturación y pagos | RF-33 a RF-40 | RN-04, RN-05 |
| 6 | Inventario | RF-41 a RF-45 | RN-06 |
| 7 | Recordatorios automáticos | RF-46 a RF-49 | RN-08 |
| 8 | Reportes y estadísticas | RF-50 a RF-55 | — |
| 9 | Integración con RIPS | RF-56 a RF-59 | — |
| **Total** | | **59 RF** | **10 RN** |

**Cobertura:** 9/9 módulos · 59/59 RF · 10/10 RN · 14/14 RNF · 101/101 pruebas E2E pasando.

---

## 💻 Stack Tecnológico

### Backend
- **Runtime:** Node.js 24.x
- **Framework:** Express 4.x
- **ODM:** Mongoose 7.x
- **Autenticación:** JWT (jsonwebtoken 9.x) + bcrypt 5.x
- **Seguridad:** express-rate-limit 7.x, CORS 2.x
- **Procesamiento:** Sharp (imágenes), PDFKit (PDFs), ExcelJS (Excel), Nodemailer (email)
- **Tareas programadas:** node-cron 3.x

### Frontend
- **Framework:** Angular 20.x
- **Lenguaje:** TypeScript 5.x
- **Estado reactivo:** Signals (Angular nativo, no RxJS puro)
- **Estilos:** SCSS con variables CSS
- **HTTP:** HttpClient + Interceptors

### Base de datos
- **Motor:** MongoDB 8.0.x
- **Hosting:** MongoDB Atlas (M0 Free, AWS us-east-1, Replica Set 3 nodos)
- **11 colecciones + 22 índices activos**

### Despliegue
- **Backend:** Render — Web Service (plan Free, región Oregon)
- **Frontend:** Render — Static Site (plan Free)
- **CI/CD:** Auto-deploy nativo de Render (webhook en cada push a `main`)
- **Repositorio:** GitHub

---

## 🏗️ Arquitectura

### Alto nivel

```
    Usuario final (navegador)
              │
              │ HTTPS
              ▼
    ┌─────────────────────┐
    │  FRONTEND (Angular) │  ← Render Static Site
    │  SPA con signals    │
    └─────────────────────┘
              │
              │ HTTPS (fetch API + JWT)
              ▼
    ┌─────────────────────┐
    │  BACKEND (Node.js)  │  ← Render Web Service
    │  Express + Mongoose │
    └─────────────────────┘
              │
              │ mongodb+srv:// (TLS)
              ▼
    ┌─────────────────────┐
    │  MongoDB Atlas      │  ← Replica Set (3 nodos)
    │  cluster odontosoft │
    └─────────────────────┘
```

### Backend — Arquitectura por Capas

```
Rutas          →  Definen endpoints + middlewares
   ↓
Controladores  →  Parsean request, retornan response
   ↓
Servicios      →  Lógica de negocio + reglas de negocio
   ↓
Modelos        →  Esquemas Mongoose + validaciones
   ↓
MongoDB Atlas
```

### Estructura de Carpetas

```
odontosoft-v2/
├── backend/
│   ├── src/
│   │   ├── models/         # 12 modelos Mongoose
│   │   ├── routes/         # 10 archivos de rutas
│   │   ├── controllers/    # 10 controladores
│   │   ├── services/       # 9 servicios (lógica de negocio)
│   │   ├── middlewares/    # auth, roles, rate-limit, uploads
│   │   ├── jobs/           # node-cron (recordatorios)
│   │   ├── scripts/        # seedAdmin.js, seedRoles.js
│   │   ├── config/         # conexión MongoDB
│   │   ├── app.js
│   │   └── server.js
│   └── tests/              # 9 scripts E2E (101 pruebas)
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/       # servicios, guards, interceptor
│   │   │   └── features/   # componentes por dominio
│   │   ├── environments/
│   │   └── styles.scss
│   └── angular.json
├── docs/                   # Documentación técnica por módulo
└── docker-compose.yml      # Solo para desarrollo local
```

---

## 🚀 Instalación Local

### Requisitos

- Node.js 24.x o superior
- Docker + Docker Compose (para MongoDB local)
- Git

### Pasos

**1. Clonar el repositorio**

```bash
git clone https://github.com/juangarcesco/odontosoft-v2.git
cd odontosoft-v2
```

**2. Levantar MongoDB local**

```bash
docker-compose up -d
```

Esto inicia un contenedor MongoDB en `localhost:27017` con base de datos `odontosoft`.

**3. Configurar el backend**

```bash
cd backend
cp .env.example .env
# Editar .env con tus valores locales
npm install
```

Contenido mínimo del `.env`:

```env
MONGO_URI=mongodb://localhost:27017/odontosoft
JWT_SECRET=tu_secreto_de_al_menos_32_caracteres
JWT_EXPIRES_IN=8h
SEED_ADMIN_PASSWORD=Admin123!
SEED_ODONTOLOGO_PASSWORD=Odonto123!
SEED_RECEPCIONISTA_PASSWORD=Recepcion123!
ETHEREAL_USER=tu_usuario_ethereal
ETHEREAL_PASS=tu_password_ethereal
PORT=3000
```

**4. Sembrar datos iniciales**

```bash
node src/scripts/seedAdmin.js
node src/scripts/seedRoles.js
```

Crea los usuarios `admin@odontosoft.com`, `odontologo@odontosoft.com`, `recepcion@odontosoft.com`.

**5. Iniciar el backend**

```bash
npm run dev    # con nodemon
# o
npm start      # producción
```

Backend disponible en `http://localhost:3000/api`.

**6. Configurar el frontend**

```bash
cd ../frontend
npm install
```

Verificar que `src/environments/environment.ts` apunte al backend local (o a Render si prefieres):

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
```

**7. Iniciar el frontend**

```bash
npm start
```

Frontend disponible en `http://localhost:4200`.

### Credenciales de prueba (después del seed)

| Rol | Email | Contraseña |
|---|---|---|
| ADMIN | `admin@odontosoft.com` | valor de `SEED_ADMIN_PASSWORD` |
| ODONTOLOGO | `odontologo@odontosoft.com` | valor de `SEED_ODONTOLOGO_PASSWORD` |
| RECEPCIONISTA | `recepcion@odontosoft.com` | valor de `SEED_RECEPCIONISTA_PASSWORD` |

---

## ☁️ Despliegue en Producción

El sistema completo está desplegado en 3 componentes independientes.

### 1. Base de datos — MongoDB Atlas

| Parámetro | Valor |
|---|---|
| Cluster | `odontosoft-cluster` |
| Plan | M0 Free (512 MB) |
| Región | AWS N. Virginia (us-east-1) |
| Tipo | Replica Set (3 nodos) |
| Versión | MongoDB 8.0.x |

**Migración de datos del entorno local a Atlas:**

```bash
# Dump desde Docker local
docker exec odontosoft-mongo mongodump \
  --db odontosoft --archive=/tmp/odontosoft-backup.archive

# Copiar al host
docker cp odontosoft-mongo:/tmp/odontosoft-backup.archive ./

# Restaurar en Atlas
mongorestore \
  --uri="mongodb+srv://<user>:<pwd>@odontosoft-cluster.<hash>.mongodb.net/odontosoft" \
  --archive=./odontosoft-backup.archive
```

### 2. Backend — Render (Web Service)

| Parámetro | Valor |
|---|---|
| Root Directory | `backend` |
| Build Command | `npm install` |
| Start Command | `node src/server.js` |
| Runtime | Node.js 24.14.1 |
| Plan | Free |
| URL | `https://odontosoft-backend-dwes.onrender.com` |

**Variables de entorno configuradas en Render:**

- `MONGO_URI` — cadena `mongodb+srv://` de Atlas
- `JWT_SECRET`, `JWT_EXPIRES_IN`
- `SEED_ADMIN_PASSWORD`, `SEED_ODONTOLOGO_PASSWORD`, `SEED_RECEPCIONISTA_PASSWORD`
- `ETHEREAL_USER`, `ETHEREAL_PASS`
- `PORT` (asignado automáticamente por Render)

⚠️ **Cold start:** el plan Free duerme el servicio tras 15 min de inactividad. La primera petición tarda 30-60 seg en despertarlo.

### 3. Frontend — Render (Static Site)

| Parámetro | Valor |
|---|---|
| Root Directory | `frontend` |
| Build Command | `npm install && npm run build` |
| Publish Directory | `dist/frontend/browser` |
| Rewrite Rule | `/* → /index.html` (Rewrite) |
| Plan | Free |
| URL | `https://odontosoft-frontend-3925.onrender.com` |

⚠️ **Rewrite Rule crítico:** sin esta regla, cualquier ruta interna (`/pacientes`, `/citas`, etc.) dará 404 al recargar. La regla permite que Angular resuelva la navegación como SPA.

### 4. CI/CD Automático

Render tiene auto-deploy activado: cada `git push origin main` dispara un nuevo build y deploy tanto del backend como del frontend automáticamente. No requiere configuración adicional.

Como mejora futura se documenta la posibilidad de agregar un pipeline de GitHub Actions con las pruebas E2E antes del deploy.

---

## 📚 Documentación

### Documentos SENA — Entregables mensuales

| # | Documento | Alineación | Ubicación |
|:---:|---|---|---|
| 1 | **SRS e Inicio del Proyecto** | Guía 1 — Construcción de requisitos | `docs/Documento1_SRS_Mes1.md` |
| 2 | **Lógica de Programación y Algoritmia** | Guía 2 — Solución de problemas con algoritmia | `docs/Documento2_Logica_Mes2.md` |
| 3 | **Modelado e Implementación MongoDB** | Guía 3 — Implementar bases de datos | `docs/Documento3_MongoDB_Mes3.md` |
| 4 | **Backend Node.js + API REST** | Guía 4 — Desarrollar backend con Node.js | `docs/Documento4_Backend_Mes4.md` |
| 5 | **Infraestructura Cloud y DevOps** | Guía 5 — Desplegar aplicaciones en la nube | `docs/Documento5_Cloud_Mes5.md` |
| 6 | **Frontend + Manual + Cierre** | Guía 6 — Desarrollar frontend y entrega final | `docs/Documento6_Cierre_Mes6.md` |

### Documentación Técnica por Módulo

Cada uno de los 9 módulos tiene su propio documento en `docs/`:

- `Documentacion_Modulo1_Autenticacion.md`
- `Documentacion_Modulo2_Pacientes.md`
- `Documentacion_Modulo3_Citas.md`
- `Documentacion_Modulo4_HistoriaClinica.md`
- `Documentacion_Modulo5_Facturacion.md`
- `Documentacion_Modulo6_Inventario.md`
- `Documentacion_Modulo7_Recordatorios.md`
- `Documentacion_Modulo8_Reportes.md`
- `Documentacion_Modulo9_RIPS.md`

### Otros

- `SRS_OdontoSoft_v2.md` — Especificación completa de requisitos
- `roadmap.md` — Plan maestro del proyecto

---

## 🧪 Pruebas

### Pruebas End-to-End Automatizadas

Cada módulo cuenta con un script bash que valida el ciclo completo contra el backend real:

```bash
cd backend/tests

./test-e2e-auth.sh                    # 11/11 pruebas
./test-e2e-pacientes.sh               # 11/11 pruebas
./test-e2e-citas.sh                   # 12/12 pruebas
./test-e2e-historia-clinica.sh        # 13/13 pruebas
./test-e2e-facturacion.sh             # 12/12 pruebas
./test-e2e-inventario.sh              # 11/11 pruebas
./test-e2e-recordatorios.sh           # 9/9 pruebas
./test-e2e-reportes.sh                # 10/10 pruebas
./test-e2e-rips.sh                    # 12/12 pruebas
```

**Total: 101 pruebas, todas pasando.**

Los scripts validan:

- Obtención de tokens JWT por rol
- Operaciones CRUD completas
- Aplicación de reglas de negocio (RN-01 a RN-10)
- Control de acceso por rol (HTTP 401/403)
- Códigos HTTP correctos (200, 201, 400, 401, 403, 404, 409)

### Ejecución contra producción

Los mismos scripts pueden ejecutarse contra el backend en Render cambiando la URL base:

```bash
BASE_URL="https://odontosoft-backend-dwes.onrender.com/api" ./test-e2e-auth.sh
```

---

## 📊 Métricas del Proyecto

| Métrica | Valor |
|---|:---:|
| Módulos funcionales completados | **9 de 9 (100%)** |
| Requisitos funcionales implementados | **59 de 59 (100%)** |
| Reglas de negocio verificadas | **10 de 10 (100%)** |
| Requisitos no funcionales cumplidos | **14 de 14 (100%)** |
| Colecciones de MongoDB | 11 |
| Índices activos | 22 |
| Endpoints REST | 60+ |
| Componentes Angular | 25+ |
| Pruebas end-to-end | **101 (todas pasando)** |
| Pull Requests fusionados | 9 |
| Servicios en producción | 3 |
| **Costo mensual** | **0 USD** |

---

## 🌳 Estrategia de Ramas y Commits

**Feature branch workflow:** `main` = producción, cada módulo en su rama `feature/moduloN-nombre`, se fusiona vía PR.

**Convención de commits:**

```
tipo(RF-XX,RN-YY): descripción breve en presente
```

Donde `tipo` es `feat`, `fix`, `test`, `docs`, `refactor`.

**Ejemplos reales:**

```
feat(RF-01,RF-03): implementar endpoint de login con generación de JWT
fix(RN-10): implementar desactivación de evolución clínica, exclusiva de ADMIN
feat(RF-57): implementar validación de atenciones completas/incompletas por periodo
test: agregar script end-to-end de RIPS (12/12 exitosas)
```

Esta convención permite trazabilidad directa entre cada commit y el requisito del SRS que lo motivó.

---

## ⚠️ Delimitaciones del Alcance

Se documentan explícitamente las decisiones de alcance del proyecto:

- **Email:** vía Ethereal (SMTP de pruebas). No integrado con SendGrid/SES para envío real.
- **WhatsApp:** simulado. No integrado con Twilio o Meta WhatsApp Business API.
- **Archivos adjuntos:** almacenamiento en disco local del contenedor Render (efímero). No S3/R2.
- **RIPS:** genera el archivo JSON pero no lo radica automáticamente ante el Ministerio de Salud (radicación manual).
- **Dominio:** se usan las URLs `onrender.com` (no dominio propio).
- **DIAN:** no integrado con facturación electrónica.

---

## 🔒 Seguridad

- Contraseñas encriptadas con bcrypt (factor 10)
- JWT con expiración configurable (8h por defecto)
- Rate limiting en el endpoint de login (10 intentos por 15 min)
- Control de acceso basado en roles (RBAC) en todos los endpoints
- Trazabilidad: cada acción crítica registra usuario y fecha
- Rotación de secretos aplicada tras la fase inicial de desarrollo
- Variables sensibles nunca versionadas (uso estricto de `.env` + `.gitignore`)

---

## 🐛 Incidentes de Despliegue Documentados

Durante el despliegue real se enfrentaron y resolvieron 4 incidentes técnicos, documentados con transparencia en el Documento 5:

1. **Paquete `mongodb-database-tools` no disponible** en Ubuntu Noble → agregar repositorio oficial de MongoDB.
2. **`mongorestore` fallaba con "authentication failed"** → carácter `>` extra en la contraseña + falta de `/odontosoft` en la URI.
3. **Login válido devolvía "Credenciales inválidas" en producción** → `MONGO_URI` en Render apuntaba a `localhost` en vez de a Atlas.
4. **Frontend en producción llamaba al Codespace en lugar del backend de Render** → `fileReplacements` de Angular no aplicó; solución: `environment.ts` directo a Render.

---

## 👤 Autor

**Aprendiz:** `[NOMBRE COMPLETO DEL APRENDIZ]`

**Ficha SENA:** `[NÚMERO DE FICHA]`

**Programa:** Análisis y Desarrollo de Software

**Institución:** Servicio Nacional de Aprendizaje — SENA

**Instructor:** `[NOMBRE DEL INSTRUCTOR]`

**Contacto:** juangarcesco (GitHub)

---

## 📜 Licencia

Proyecto académico desarrollado como Etapa Productiva del SENA. Uso educativo. El código puede ser consultado libremente como referencia de aprendizaje.

---

## 🙏 Agradecimientos

Al SENA por el marco formativo del programa de Análisis y Desarrollo de Software. Al instructor por la orientación durante la etapa productiva. A la comunidad de código abierto que sustenta las tecnologías utilizadas (Node.js, MongoDB, Angular, Express y todas las dependencias que hacen posible este tipo de proyectos).

---

*Última actualización: Julio 2026 — Proyecto en producción y funcional.*
