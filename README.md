# OdontoSoft

Sistema de gestión clínica odontológica desarrollado con el stack **MEAN** (MongoDB · Express · Angular · Node.js), con enfoque en documentos embebidos de MongoDB para historias clínicas y odontogramas.

## Tabla de contenidos

- [Stack tecnológico](#stack-tecnológico)
- [Estado del proyecto](#estado-del-proyecto)
- [Requisitos previos](#requisitos-previos)
- [Instalación y arranque](#instalación-y-arranque)
- [Variables de entorno](#variables-de-entorno)
- [Usuarios de prueba (seed)](#usuarios-de-prueba-seed)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Pruebas](#pruebas)
- [Flujo de trabajo con Git](#flujo-de-trabajo-con-git)
- [Documentación por módulo](#documentación-por-módulo)

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | Angular (standalone components, signals) |
| Backend | Node.js + Express |
| Base de datos | MongoDB (Mongoose) |
| Autenticación | JWT + bcrypt |
| Procesamiento de imágenes | Sharp (optimización, RNF-09) |
| Subida de archivos | Multer |
| Entorno de desarrollo | GitHub Codespaces + Docker |

## Estado del proyecto

| Módulo | Descripción | Requisitos | Estado |
|---|---|---|---|
| 1 | Autenticación y control de acceso | RF-01 a RF-08 | ✅ Completado |
| 2 | Gestión de pacientes | RF-09 a RF-16 | ✅ Completado |
| 3 | Agenda / Citas | RF-17 a RF-24 | ✅ Completado |
| 4 | Historia clínica y odontograma | RF-25 a RF-32 | ✅ Completado |
| 5 | Facturación y pagos | RF-33 a RF-40 | 🔵 En progreso |
| 6 | Inventario de materiales | RF-41 a RF-45 | ⏳ Pendiente |
| 7 | Recordatorios automáticos | RF-46 a RF-49 | ⏳ Pendiente |
| 8 | Reportes y estadísticas | RF-50 a RF-55 | ⏳ Pendiente |
| 9 | Integración con RIPS | RF-56 a RF-59 | ⏳ Pendiente |

Documentación detallada de cada módulo disponible en [`docs/`](./docs), incluyendo el [roadmap maestro](./docs/roadmap.md) y la [matriz de reglas de negocio](./docs/matriz_reglas_negocio.md).

---

## Requisitos previos

- Node.js v24.x
- Docker (para levantar MongoDB localmente)
- Cuenta de GitHub con acceso al repositorio

Este proyecto está pensado para ejecutarse en **GitHub Codespaces**, donde Node y Docker ya vienen preinstalados. Si se ejecuta en un entorno local, verificar que ambos estén disponibles:

```bash
node -v     # debe mostrar v24.x
docker -v
```

---

## Instalación y arranque

### 1. Clonar el repositorio (si no se usa Codespaces)

```bash
git clone https://github.com/juangarcesco/odontosoft-v2.git
cd odontosoft-v2
```

### 2. Levantar la base de datos (MongoDB vía Docker)

Desde la raíz del repositorio:

```bash
docker compose up -d
docker ps   # confirmar que el contenedor odontosoft-mongo está corriendo
```

### 3. Configurar variables de entorno del backend

```bash
cd backend
cp .env.example .env
```

Editar `.env` y completar los valores (ver sección [Variables de entorno](#variables-de-entorno)).

### 4. Instalar dependencias e iniciar el backend

```bash
npm install
npm run dev
```

Debe mostrar:
```
✅ MongoDB conectado
🚀 Servidor escuchando en puerto 3000
```

Verificar que responde:
```bash
curl http://localhost:3000/api/health
```

### 5. Crear usuarios de prueba (seed)

En otra terminal, con el backend corriendo:

```bash
cd backend
node src/scripts/seedAdmin.js
node src/scripts/seedRoles.js
```

### 6. Instalar dependencias e iniciar el frontend

En una tercera terminal:

```bash
cd frontend
npm install
ng serve --host 0.0.0.0
```

### 7. Acceder a la aplicación

- **En Codespaces:** usar la URL pública del puerto `4200` (pestaña **Puertos** de VS Code). El puerto `3000` (backend) también debe estar configurado como **Public** para que el frontend pueda comunicarse con él, y la variable `apiUrl` en `frontend/src/environments/environment.ts` debe apuntar a esa URL pública del puerto 3000, no a `localhost`.
- **En local:** `http://localhost:4200`

> **Nota para Codespaces:** el navegador se ejecuta en la máquina local del usuario, no dentro del Codespace. Usar `http://localhost:3000` en `environment.ts` no funcionará — debe usarse la URL pública reenviada (`https://<nombre-codespace>-3000.app.github.dev`). Esto también aplica a los archivos servidos estáticamente (adjuntos de historia clínica): sus URLs se construyen a partir de esa misma variable, quitando el sufijo `/api`.

### Rutina de arranque rápido (sesiones posteriores)

Cada vez que se retome el proyecto tras una pausa, el contenedor de Mongo puede haberse detenido. Ejecutar en orden:

```bash
docker compose up -d                      # Terminal 1 (una vez)
cd backend && npm run dev                 # Terminal 2
cd frontend && ng serve --host 0.0.0.0    # Terminal 3
```

Se recomienda mantener terminales dedicadas para el backend y el frontend, y usar una terminal adicional para comandos sueltos (`curl`, `git`, `docker exec`, etc.), evitando interrumpir los procesos activos.

---

## Variables de entorno

Archivo `backend/.env` (no se versiona; ver plantilla en `backend/.env.example`):

```
PORT=3000
MONGO_URI=mongodb://localhost:27017/odontosoft
JWT_SECRET=<secreto_largo_y_aleatorio>
JWT_EXPIRES_IN=8h
SEED_ADMIN_PASSWORD=<contraseña_para_el_admin_de_prueba>
SEED_ODONTOLOGO_PASSWORD=<contraseña_para_el_odontologo_de_prueba>
SEED_RECEPCIONISTA_PASSWORD=<contraseña_para_la_recepcionista_de_prueba>
```

Archivo `frontend/src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api', // ajustar a la URL pública en Codespaces
};
```

---

## Usuarios de prueba (seed)

Tras ejecutar los scripts de seed, quedan disponibles los siguientes usuarios (contraseñas definidas en `.env`):

| Rol | Email | Contraseña (definida en `.env`) |
|---|---|---|
| ADMIN | admin@odontosoft.com | `SEED_ADMIN_PASSWORD` |
| ODONTOLOGO | odontologo@odontosoft.com | `SEED_ODONTOLOGO_PASSWORD` |
| RECEPCIONISTA | recepcion@odontosoft.com | `SEED_RECEPCIONISTA_PASSWORD` |

### Matriz de permisos por módulo (según SRS, sección 3.1)

| Módulo | ADMIN | ODONTOLOGO | RECEPCIONISTA |
|---|:---:|:---:|:---:|
| Usuarios y configuración | CRUD | — | — |
| Pacientes | Lectura | Lectura | CRUD |
| Citas y agenda | Lectura | Lectura / Actualizar estado | CRUD |
| Historia clínica y odontograma | Sin acceso a edición (solo puede desactivar evoluciones erróneas) | CRUD | Sin acceso |
| Facturación y pagos | Lectura (reportes) | Lectura | CRUD |
| Inventario | Lectura (reportes) | Sin acceso | CRUD |
| Reportes | Todos | Clínicos | Administrativos, financieros e inventario |

> Nota: la política de permisos de Pacientes fue corregida durante el desarrollo del Módulo 2 para alinearse con esta matriz — ver `docs/roadmap.md`, sección "Historial de correcciones importantes".

---

## Estructura del proyecto

```
odontosoft-v2/
├── docker-compose.yml
├── README.md
├── docs/
│   ├── roadmap.md
│   ├── matriz_reglas_negocio.md
│   ├── Documentacion_Modulo1_Autenticacion.md
│   ├── Documentacion_Modulo2_Pacientes.md
│   ├── Documentacion_Modulo3_Citas.md
│   ├── Documentacion_Modulo4_HistoriaClinica.md
│   └── Modulo1_Autenticacion_PasoAPaso.md
├── backend/
│   ├── .env.example
│   ├── uploads/                  # archivos subidos (no versionado)
│   ├── src/
│   │   ├── config/          # Conexión a MongoDB
│   │   ├── controllers/     # Lógica de request/response
│   │   ├── middlewares/     # Autenticación, roles, rate limiting, uploads
│   │   ├── models/          # Esquemas de Mongoose
│   │   ├── routes/          # Definición de endpoints
│   │   ├── services/        # Lógica de negocio
│   │   ├── scripts/         # Seeds de datos iniciales
│   │   ├── app.js
│   │   └── server.js
│   └── tests/
│       ├── test-e2e-auth.sh
│       ├── test-e2e-pacientes.sh
│       ├── test-e2e-citas.sh
│       └── test-e2e-historia-clinica.sh
└── frontend/
    └── src/
        ├── environments/
        └── app/
            ├── core/         # Servicios transversales (auth, http interceptor, guards)
            └── features/     # Componentes por dominio (login, dashboard, pacientes, citas, historia-clinica)
```

Arquitectura del backend organizada por capas: `routes → controllers → services → models`, cada una con una única responsabilidad. Odontograma, evoluciones clínicas y adjuntos se modelan como subdocumentos embebidos dentro de `HistoriaClinica`, siguiendo la decisión explícita del SRS de aprovechar el modelo de documentos de MongoDB para datos siempre consultados en conjunto.

---

## Pruebas

Cada módulo cuenta con un script de pruebas end-to-end en `backend/tests/`, que valida el flujo completo contra el backend real (requiere que el servidor esté corriendo).

```bash
cd backend
./tests/test-e2e-auth.sh               # Módulo 1: login, roles, logout, rate limiting
./tests/test-e2e-pacientes.sh          # Módulo 2: CRUD de pacientes, control de rol, duplicados
./tests/test-e2e-citas.sh              # Módulo 3: agenda, conflictos de horario, estados
./tests/test-e2e-historia-clinica.sh   # Módulo 4: odontograma, evoluciones, adjuntos, RN-10
```

> Los scripts incluyen un paso de limpieza de datos de prueba al inicio, por lo que pueden ejecutarse repetidamente sin generar conflictos por datos duplicados.

---

## Flujo de trabajo con Git

- Una rama por módulo: `feature/moduloN-nombre`.
- Convención de commits: `tipo(RF-XX,RNF-XX): descripción breve`, trazando cada cambio a un requisito del SRS. Ejemplos:
  ```
  feat(RF-01,RF-03): implementar endpoint de login con generación de JWT
  fix(RN-10): implementar desactivación de evolución clínica, exclusiva de ADMIN
  test: agregar script end-to-end de historia clínica y odontograma (16/16 exitosas)
  ```
- Cada módulo se cierra con un Pull Request hacia `main`, documentado con su matriz de trazabilidad.

---

## Documentación por módulo

Cada módulo cuenta con documentación detallada en [`docs/`](./docs), incluyendo matriz de trazabilidad de requisitos, evidencia de pruebas, arquitectura, decisiones técnicas justificadas y problemas encontrados durante el desarrollo:

- [Roadmap maestro de todos los módulos](./docs/roadmap.md)
- [Matriz de reglas de negocio (RN)](./docs/matriz_reglas_negocio.md)
- [Documentación Módulo 1 — Autenticación](./docs/Documentacion_Modulo1_Autenticacion.md)
- [Documentación Módulo 2 — Pacientes](./docs/Documentacion_Modulo2_Pacientes.md)
- [Documentación Módulo 3 — Citas y Agenda](./docs/Documentacion_Modulo3_Citas.md)
- [Documentación Módulo 4 — Historia Clínica y Odontograma](./docs/Documentacion_Modulo4_HistoriaClinica.md)
