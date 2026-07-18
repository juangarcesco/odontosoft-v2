# OdontoSoft

Sistema de gestión clínica odontológica desarrollado con el stack **MEAN** (MongoDB · Express · Angular · Node.js), con enfoque en documentos embebidos de MongoDB para historias clínicas y odontogramas.

**Proyecto completo: 9/9 módulos, 59/59 requisitos funcionales, 10/10 reglas de negocio.**

## Tabla de contenidos

- [Stack tecnológico](#stack-tecnológico)
- [Estado del proyecto](#estado-del-proyecto)
- [Requisitos previos](#requisitos-previos)
- [Instalación y arranque](#instalación-y-arranque)
- [Variables de entorno](#variables-de-entorno)
- [Usuarios de prueba (seed)](#usuarios-de-prueba-seed)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Dependencias del proyecto](#dependencias-del-proyecto)
- [Convención de códigos de estado HTTP](#convención-de-códigos-de-estado-http)
- [Pruebas](#pruebas)
- [Solución de problemas comunes](#solución-de-problemas-comunes)
- [Flujo de trabajo con Git](#flujo-de-trabajo-con-git)
- [Documentación por módulo](#documentación-por-módulo)
- [Alcance y delimitaciones del proyecto](#alcance-y-delimitaciones-del-proyecto)

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
| Email | Nodemailer + Ethereal (pruebas) |
| Tareas programadas | node-cron |
| Exportación de documentos | ExcelJS (Excel), PDFKit (PDF) |
| Entorno de desarrollo | GitHub Codespaces + Docker |

## Estado del proyecto

| Módulo | Descripción | Requisitos | Estado |
|---|---|---|---|
| 1 | Autenticación y control de acceso | RF-01 a RF-08 | ✅ Completado |
| 2 | Gestión de pacientes | RF-09 a RF-16 | ✅ Completado |
| 3 | Agenda / Citas | RF-17 a RF-24 | ✅ Completado |
| 4 | Historia clínica y odontograma | RF-25 a RF-32 | ✅ Completado |
| 5 | Facturación y pagos | RF-33 a RF-40 | ✅ Completado |
| 6 | Inventario de materiales | RF-41 a RF-45 | ✅ Completado |
| 7 | Recordatorios automáticos | RF-46 a RF-49 | ✅ Completado |
| 8 | Reportes y estadísticas | RF-50 a RF-55 | ✅ Completado |
| 9 | Integración con RIPS | RF-56 a RF-59 | ✅ Completado |

Documentación detallada de cada módulo disponible en [`docs/`](./docs), incluyendo el [roadmap maestro](./docs/roadmap.md) y la [matriz de reglas de negocio](./docs/matriz_reglas_negocio.md) (10/10 reglas implementadas y verificadas).

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
✅ Job de recordatorios programado (cada hora, minuto 0)
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

O usar el script de arranque automático (levanta todo y captura tokens de los 3 roles de prueba):

```bash
./scripts/dev-start.sh
source .tokens.env   # carga los tokens en la terminal actual
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
ETHEREAL_USER=<usuario_generado_por_nodemailer.createTestAccount()>
ETHEREAL_PASS=<contraseña_generada_por_nodemailer.createTestAccount()>
```

> Para generar credenciales de Ethereal (envío de email de prueba, Módulo 7): `node -e "require('nodemailer').createTestAccount().then(c => console.log(c.user, c.pass))"`

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
| Recordatorios | Lectura del historial | Sin acceso | CRUD |
| Reportes financieros/administrativos | Lectura | Sin acceso | Lectura |
| Reportes clínicos | Lectura | Lectura | Sin acceso |
| RIPS | Lectura y generación | Sin acceso | CRUD |

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
│   ├── Documentacion_Modulo5_Facturacion.md
│   ├── Documentacion_Modulo6_Inventario.md
│   ├── Documentacion_Modulo7_Recordatorios.md
│   ├── Documentacion_Modulo8_Reportes.md
│   ├── Documentacion_Modulo9_RIPS.md
│   └── Modulo1_Autenticacion_PasoAPaso.md
├── scripts/
│   └── dev-start.sh          # arranque rápido con captura de tokens
├── backend/
│   ├── .env.example
│   ├── uploads/               # archivos subidos (no versionado)
│   ├── src/
│   │   ├── config/            # Conexión a MongoDB
│   │   ├── controllers/       # Lógica de request/response
│   │   ├── middlewares/       # Autenticación, roles, rate limiting, uploads
│   │   ├── models/            # Esquemas de Mongoose
│   │   ├── routes/            # Definición de endpoints
│   │   ├── services/          # Lógica de negocio
│   │   ├── scripts/           # Seeds de datos iniciales
│   │   ├── jobs/               # Tareas programadas (node-cron)
│   │   ├── app.js
│   │   └── server.js
│   └── tests/                 # 9 scripts de pruebas end-to-end (uno por módulo)
└── frontend/
    └── src/
        ├── environments/
        └── app/
            ├── core/           # Servicios transversales (auth, http interceptor, guards)
            └── features/       # Componentes por dominio (login, dashboard, pacientes,
                                 # citas, historia-clinica, facturacion, inventario,
                                 # recordatorios, reportes, rips)
```

Arquitectura del backend organizada por capas: `routes → controllers → services → models`, cada una con una única responsabilidad. Odontograma, evoluciones clínicas, movimientos de inventario, pagos de factura y adjuntos se modelan como subdocumentos embebidos, siguiendo la decisión explícita del SRS de aprovechar el modelo de documentos de MongoDB para datos siempre consultados en conjunto.

---

## Dependencias del proyecto

### Backend (`backend/package.json`)

| Dependencia | Uso en el proyecto |
|---|---|
| `express` | Framework del servidor HTTP |
| `mongoose` | ODM para MongoDB (esquemas, validaciones, agregaciones) |
| `dotenv` | Carga de variables de entorno desde `.env` |
| `bcrypt` | Hash de contraseñas (Módulo 1) |
| `jsonwebtoken` | Generación y verificación de JWT (Módulo 1) |
| `cors` | Habilitación de CORS para el frontend |
| `express-rate-limit` | Limitación de intentos de login (RNF-03, Módulo 1) |
| `morgan` | Logging de peticiones HTTP en desarrollo |
| `multer` | Subida de archivos multipart/form-data (adjuntos de historia clínica, Módulo 4) |
| `sharp` | Optimización de imágenes subidas (RNF-09, Módulo 4) |
| `pdfkit` | Generación de documentos PDF (facturas y reportes, Módulos 5 y 8) |
| `nodemailer` | Envío de correos electrónicos (recordatorios, Módulo 7) |
| `node-cron` | Programación de tareas periódicas (envío automático de recordatorios, Módulo 7) |
| `exceljs` | Generación de archivos Excel (exportación de reportes, Módulo 8) |
| `nodemon` (dev) | Reinicio automático del servidor en desarrollo |

### Frontend (`frontend/package.json`)

| Dependencia | Uso en el proyecto |
|---|---|
| `@angular/core`, `@angular/common`, `@angular/router` | Framework Angular base |
| `@angular/forms` | Formularios reactivos (ReactiveFormsModule, FormArray) |
| `rxjs` | Manejo de observables (peticiones HTTP, debounce de búsqueda) |
| `zone.js` | Detección de cambios de Angular (requerido según configuración del proyecto) |

> El frontend no incorpora librerías de gráficos ni componentes UI de terceros — los gráficos de barras (reportes, Módulo 8) y todos los estilos están construidos con HTML/CSS/SCSS puro, priorizando un bundle liviano sobre funcionalidades avanzadas de visualización.

---

## Convención de códigos de estado HTTP

Referencia rápida de cómo la API de OdontoSoft usa cada código de estado, consistente en los 9 módulos:

| Código | Significado | Cuándo lo devuelve la API |
|---|---|---|
| **200** | OK | Lectura exitosa (listar, obtener detalle) o actualización exitosa (editar, cambiar estado, registrar pago/movimiento) |
| **201** | Created | Creación exitosa de un recurso nuevo (paciente, cita, historia clínica, evolución, factura, material, etc.) |
| **400** | Bad Request | Datos inválidos: campo faltante, formato incorrecto, ID mal formado, estado/método no permitido, monto que excede un límite, formato de periodo inválido |
| **401** | Unauthorized | No autenticado: falta el token, token inválido/expirado, o credenciales de login incorrectas |
| **403** | Forbidden | Autenticado correctamente, pero el rol no tiene permiso para esa acción específica |
| **404** | Not Found | El recurso con ese ID no existe, o no hay datos para generar lo solicitado (ej. RIPS de un periodo sin atenciones) |
| **409** | Conflict | El estado actual del recurso impide la acción: documento duplicado, conflicto de horario, evolución ya desactivada, factura ya anulada, stock insuficiente, atenciones RIPS incompletas |
| **429** | Too Many Requests | Rate limiting del login activado (RNF-03) |
| **500** | Internal Server Error | Error no controlado del servidor (siempre logueado con `console.error` para diagnóstico) |

---

## Pruebas

Cada módulo cuenta con un script de pruebas end-to-end en `backend/tests/`, que valida el flujo completo contra el backend real (requiere que el servidor esté corriendo).

```bash
cd backend
./tests/test-e2e-auth.sh               # Módulo 1: login, roles, logout, rate limiting
./tests/test-e2e-pacientes.sh          # Módulo 2: CRUD de pacientes, control de rol, duplicados
./tests/test-e2e-citas.sh              # Módulo 3: agenda, conflictos de horario, estados
./tests/test-e2e-historia-clinica.sh   # Módulo 4: odontograma, evoluciones, adjuntos, RN-10
./tests/test-e2e-facturacion.sh        # Módulo 5: facturas, pagos, anulación, PDF
./tests/test-e2e-inventario.sh         # Módulo 6: stock, entradas/salidas, RN-06
./tests/test-e2e-recordatorios.sh      # Módulo 7: email real, WhatsApp simulado, cron
./tests/test-e2e-reportes.sh           # Módulo 8: 5 reportes, exportación Excel/PDF
./tests/test-e2e-rips.sh               # Módulo 9: validación, generación, historial RIPS
```

> Los scripts incluyen un paso de limpieza de datos de prueba al inicio, por lo que pueden ejecutarse repetidamente sin generar conflictos por datos duplicados.

---

## Solución de problemas comunes

Problemas recurrentes durante el desarrollo en Codespaces, con su causa y solución rápida.

### `{"mensaje":"Token no proporcionado"}` o `401` en pruebas que antes funcionaban

**Causa:** las variables de shell (`$TOKEN_RECEP`, `$TOKEN_ODONTO`, `$TOKEN_ADMIN`, `$PACIENTE_ID`, etc.) **no persisten entre pestañas de terminal distintas**, ni sobreviven a un reinicio de terminal. Si el login se hizo en una pestaña y el `curl` se corre en otra, la variable llega vacía.

**Solución:** volver a loguearse y capturar las variables necesarias en la **misma** ejecución de comando donde se van a usar, encadenando con `&&`, o usar `./scripts/dev-start.sh` + `source .tokens.env`.

### `Unexpected end of JSON input` al parsear la respuesta de `curl`

**Causa:** el backend no devolvió nada (probablemente crasheó), no necesariamente un bug de lógica.

**Solución:** verificar primero que el backend esté vivo:
```bash
curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:3000/api/health
```

### `ReferenceError: express is not defined` / funciones "perdidas" al reiniciar el backend

**Causa recurrente en este proyecto:** al reemplazar un archivo de rutas/servicio/controlador completo durante una edición, se pierde accidentalmente algún `require(...)` o función definida previamente.

**Solución:** antes de asumir que un archivo quedó bien tras una edición, verificar con `head`, `tail`, `grep` o `cat` que todo el contenido esperado siga presente.

### `Cannot GET /uploads/...` o una imagen que no carga en el frontend

**Causa:** las URLs de archivos servidos por Express (adjuntos de historia clínica) se guardan como rutas relativas, pensadas para el backend (puerto 3000). El frontend (puerto 4200) las resuelve contra su propio dominio si se usan tal cual.

**Solución:** construir la URL completa a partir de `environment.apiUrl`, quitando el sufijo `/api`.

### MongoDB no conecta (`ECONNREFUSED ::1:27017`) al retomar el proyecto

**Causa:** el contenedor Docker de Mongo se detiene cuando el Codespace queda inactivo por un tiempo.

**Solución:**
```bash
docker compose up -d
docker ps
```

### `main` local y remoto divergen tras varias sesiones de trabajo

**Causa:** un merge parcial, un PR cerrado accidentalmente sin mergear, o un commit local aislado que no llegó a subirse antes de que otros cambios se mergearan en GitHub.

**Solución (tras confirmar que el remoto tiene la versión correcta y completa):**
```bash
git fetch origin
git reset --hard origin/main
```
⚠️ Descarta cualquier commit local en esa rama que no esté en GitHub — usar solo tras confirmar que el trabajo real ya vive en el remoto.

### Al mergear un Pull Request en GitHub

Verificar siempre hacer clic específicamente en **"Merge pull request"**, no en un botón de cerrar — un clic equivocado puede cerrar el PR sin integrar los cambios ("Closed with unmerged commits"), requiriendo reabrirlo y resolver conflictos posteriores.

---

## Flujo de trabajo con Git

- Una rama por módulo: `feature/moduloN-nombre`.
- Convención de commits: `tipo(RF-XX,RNF-XX): descripción breve`, trazando cada cambio a un requisito del SRS. Ejemplos:
  ```
  feat(RF-01,RF-03): implementar endpoint de login con generación de JWT
  fix(RN-10): implementar desactivación de evolución clínica, exclusiva de ADMIN
  test: agregar script end-to-end de RIPS (12/12 exitosas)
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
- [Documentación Módulo 5 — Facturación y Pagos](./docs/Documentacion_Modulo5_Facturacion.md)
- [Documentación Módulo 6 — Inventario de Materiales](./docs/Documentacion_Modulo6_Inventario.md)
- [Documentación Módulo 7 — Recordatorios Automáticos](./docs/Documentacion_Modulo7_Recordatorios.md)
- [Documentación Módulo 8 — Reportes y Estadísticas](./docs/Documentacion_Modulo8_Reportes.md)
- [Documentación Módulo 9 — Integración con RIPS](./docs/Documentacion_Modulo9_RIPS.md)

---

## Alcance y delimitaciones del proyecto

Decisiones de alcance documentadas conscientemente, coherentes con la delimitación del propio SRS (sección 13):

- **WhatsApp (Módulo 7):** envío simulado, con la misma interfaz que tendría una integración real (Twilio u otro proveedor) — reemplazable sin tocar el resto del sistema.
- **Email (Módulo 7):** envío real vía Ethereal (SMTP de pruebas), con vista previa verificable. En producción real requeriría un proveedor SMTP definitivo.
- **RIPS (Módulo 9):** estructura JSON simplificada, cubriendo los campos obligatorios mínimos exigidos por RF-57. La estructura oficial completa (habilitación REPS, catálogos CIE-10/CUPS validados, CUFE de facturación electrónica) excede el alcance académico del proyecto.
- **Facturación electrónica DIAN:** fuera de alcance en su totalidad — el envío del RIPS al Mecanismo Único de Validación (MUV) y la obtención del Código Único de Validación (CUV) dependen de esta integración, explícitamente excluida.
- **Almacenamiento de archivos (Módulo 4):** disco local del servidor, no un servicio en la nube — suficiente para el alcance académico.
