# SERVICIO NACIONAL DE APRENDIZAJE — SENA

**Etapa Productiva — Modalidad Proyecto Productivo**

*Competencia Técnica: Análisis y Desarrollo de Software*

---

## DOCUMENTO 6 — MES 6
# Frontend Angular, Manual de Usuario e Informe Final del Proyecto

**Proyecto:** OdontoSoft — Sistema de Gestión Clínica Odontológica

*Alineación: Guía de Aprendizaje 6 — Desarrollar Frontend y Entrega Final*

*Framework: Angular 20 (standalone components + signals)*

**Aprendiz:** `[NOMBRE COMPLETO DEL APRENDIZ]`

**Ficha SENA:** `[NÚMERO DE FICHA]`

**Instructor:** `[NOMBRE DEL INSTRUCTOR]`

**Fecha de entrega:** `[FECHA]`

---

## Contenido

### PARTE I — Documentación Técnica del Frontend

1. Introducción
2. Stack del Frontend y Justificación
3. Arquitectura y Estructura de Carpetas
4. Rutas y Navegación
5. Servicios y Comunicación con la API
6. Guards y Control de Acceso
7. Signals — Gestión de Estado Reactivo
8. Decisión sobre Materialize CSS

### PARTE II — Manual de Usuario

9. Introducción al Manual
10. Inicio de Sesión
11. Módulo de Pacientes
12. Módulo de Agenda
13. Módulo de Historia Clínica
14. Módulo de Facturación
15. Módulo de Inventario
16. Módulo de Recordatorios
17. Módulo de Reportes
18. Módulo RIPS

### PARTE III — Informe Final del Proyecto

19. Métricas del Proyecto
20. Cumplimiento de Requisitos
21. Cumplimiento de Reglas de Negocio
22. Lecciones Aprendidas
23. Mejoras Futuras
24. Cierre del Proyecto

---

# PARTE I

# Documentación Técnica del Frontend

---

## 1. Introducción

El presente documento constituye el cierre formal del proyecto OdontoSoft, integrando tres bloques temáticos: (I) la documentación técnica del frontend Angular; (II) el manual de usuario final del sistema; y (III) el informe final del proyecto con métricas, cumplimiento de requisitos y lecciones aprendidas.

Se alinea con la Guía de Aprendizaje 6 (Desarrollar frontend y entrega final del proyecto) del programa de Análisis y Desarrollo de Software del SENA.

---

## 2. Stack del Frontend y Justificación

### 2.1. Componentes Principales

| Tecnología | Versión | Uso |
|---|:---:|---|
| `Angular` | 20.x | Framework SPA principal |
| `TypeScript` | 5.x | Tipado estático de todo el código del frontend |
| `RxJS` | 7.x | Manejo reactivo de HttpClient y observables |
| `SCSS` | — | Estilos con anidamiento, variables y mixins |
| `Angular CLI` | 20.x | Generación de componentes/servicios, build de producción |

### 2.2. Novedades de Angular 20+ Adoptadas

- **Standalone components**: los componentes se declaran con `standalone: true`, eliminando la necesidad de `NgModules`.
- **Signals**: gestión de estado reactivo nativo, más simple que los `BehaviorSubject` de RxJS.
- **Sintaxis de control de flujo**: `@if`, `@for` y `@switch` reemplazan a `*ngIf`, `*ngFor` y `*ngSwitch`.
- **`inject()`**: función global para inyección de dependencias, más ergonómica que constructor.
- **Nueva estructura de nombres**: los archivos ya no usan sufijos `.component.ts` sino simplemente `nombre.ts`, y la clase se llama `Nombre` (sin sufijo `Component`).

---

## 3. Arquitectura y Estructura de Carpetas

El código del frontend se organiza siguiendo el principio de "features" (dominios de negocio) con recursos transversales bajo `core/` y `environments/`:

```
frontend/
├── src/
│   ├── environments/
│   │   ├── environment.ts              # Config runtime (URL del backend)
│   │   └── environment.production.ts   # Config para producción
│   ├── styles.scss                     # Estilos globales
│   ├── index.html
│   ├── main.ts                         # Bootstrap Angular
│   └── app/
│       ├── app.ts                      # Componente raíz standalone
│       ├── app.routes.ts               # Configuración de rutas
│       ├── app.config.ts               # Providers globales (HttpClient, interceptors)
│       ├── core/                       # Servicios y guards transversales
│       │   ├── auth.ts
│       │   ├── auth-guard.ts
│       │   ├── auth-interceptor.ts
│       │   ├── paciente.ts             # Cada servicio expone una API tipada
│       │   ├── cita.ts
│       │   ├── historia.ts
│       │   ├── factura.ts
│       │   ├── material.ts
│       │   ├── recordatorio.ts
│       │   ├── reporte.ts
│       │   └── rips.ts
│       └── features/                   # Componentes por dominio
│           ├── login/
│           ├── dashboard/
│           ├── pacientes/
│           │   ├── lista-pacientes/
│           │   ├── form-paciente/
│           │   └── detalle-paciente/
│           ├── citas/
│           │   ├── agenda/
│           │   └── form-cita/
│           ├── historia-clinica/
│           │   └── vista-historia/
│           ├── facturacion/
│           │   ├── lista-facturas/
│           │   └── form-factura/
│           ├── inventario/
│           │   ├── lista-materiales/
│           │   ├── form-material/
│           │   └── detalle-material/
│           ├── recordatorios/
│           │   ├── config-mensaje/
│           │   └── historial-recordatorios/
│           ├── reportes/
│           │   ├── dashboard-reportes/
│           │   └── reporte-clinico/
│           └── rips/
│               ├── validacion-periodo/
│               └── historial-rips/
├── angular.json
├── package.json
└── tsconfig.json
```

---

## 4. Rutas y Navegación

Las rutas se configuran en `app.routes.ts` usando lazy loading a nivel de componente (`loadComponent`), lo cual optimiza el bundle inicial:

```typescript
// src/app/app.routes.ts (extracto)
import { Routes } from "@angular/router";
import { authGuard } from "./core/auth-guard";

export const routes: Routes = [
  { path: "", redirectTo: "login", pathMatch: "full" },
  { path: "login",
    loadComponent: () => import("./features/login/login").then(m => m.Login) },
  { path: "dashboard", canActivate: [authGuard],
    loadComponent: () => import("./features/dashboard/dashboard").then(m => m.Dashboard) },
  { path: "pacientes", canActivate: [authGuard],
    loadComponent: () => import("./features/pacientes/lista-pacientes/lista-pacientes")
        .then(m => m.ListaPacientes) },
  { path: "pacientes/nuevo", canActivate: [authGuard],
    loadComponent: () => import("./features/pacientes/form-paciente/form-paciente")
        .then(m => m.FormPaciente) },
  { path: "pacientes/:id", canActivate: [authGuard],
    loadComponent: () => import("./features/pacientes/detalle-paciente/detalle-paciente")
        .then(m => m.DetallePaciente) },
  // ... resto de rutas por módulo
  { path: "**", redirectTo: "login" }  // catch-all
];
```

*Total: 25+ rutas cubriendo los 9 módulos del sistema, todas protegidas por `authGuard` excepto `/login`.*

---

## 5. Servicios y Comunicación con la API

Cada dominio del backend tiene su servicio equivalente en `core/`, encapsulando las llamadas HTTP con tipos TypeScript claros.

### 5.1. Ejemplo — PacienteService

```typescript
// src/app/core/paciente.ts
import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";

export interface Paciente {
  _id?: string;
  nombre: string;
  apellido: string;
  tipoDocumento: "CC" | "TI" | "CE" | "PA" | "RC";
  numeroDocumento: string;
  telefono?: string;
  email?: string;
  estado?: "ACTIVO" | "INACTIVO";
  createdAt?: string;
}

@Injectable({ providedIn: "root" })
export class PacienteService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/pacientes`;

  listar(pagina = 1, busqueda = ""): Observable<any> {
    const params = `?pagina=${pagina}&busqueda=${busqueda}`;
    return this.http.get(`${this.baseUrl}${params}`);
  }

  crear(datos: Paciente): Observable<any> {
    return this.http.post(`${this.baseUrl}`, datos);
  }

  obtener(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  actualizar(id: string, datos: Partial<Paciente>): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${id}`, datos);
  }

  desactivar(id: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${id}/desactivar`, {});
  }
}
```

### 5.2. Interceptor JWT — Autenticación Transparente

Se registra un interceptor HTTP que adjunta automáticamente el token JWT a cada petición saliente, evitando repetir la lógica en cada servicio:

```typescript
// src/app/core/auth-interceptor.ts
import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { AuthService } from "./auth";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getToken();

  if (token) {
    const withAuth = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
    return next(withAuth);
  }

  return next(req);
};
```

*El interceptor se registra en `app.config.ts` junto al `HttpClient`, activándose para todas las peticiones sin código adicional en los componentes.*

---

## 6. Guards y Control de Acceso

El `authGuard` protege las rutas que requieren usuario autenticado. Si no hay token válido, redirige al login.

```typescript
// src/app/core/auth-guard.ts
import { inject } from "@angular/core";
import { Router, CanActivateFn } from "@angular/router";
import { AuthService } from "./auth";

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.estaAutenticado()) {
    return true;
  }

  router.navigate(["/login"]);
  return false;
};
```

*Nota: el control de acceso por rol (ADMIN/ODONTOLOGO/RECEPCIONISTA) se aplica principalmente en el backend con `permitirRoles()`. El frontend condiciona la visibilidad de enlaces en el menú, pero el rechazo definitivo lo hace el servidor con HTTP 403.*

---

## 7. Signals — Gestión de Estado Reactivo

Los componentes usan `signal()` para el estado local, un mecanismo reactivo introducido en Angular 16+ que reemplaza el uso tradicional de `BehaviorSubject` o propiedades simples:

### 7.1. Ejemplo — ListaPacientes

```typescript
import { Component, OnInit, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";
import { PacienteService } from "../../../core/paciente";

@Component({
  selector: "app-lista-pacientes",
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: "./lista-pacientes.html",
  styleUrl: "./lista-pacientes.scss",
})
export class ListaPacientes implements OnInit {
  private pacienteService = inject(PacienteService);

  pacientes = signal<Paciente[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.cargar();
  }

  private cargar(): void {
    this.cargando.set(true);
    this.pacienteService.listar().subscribe({
      next: (r) => {
        this.pacientes.set(r.pacientes);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set("Error al cargar pacientes");
        this.cargando.set(false);
      }
    });
  }
}
```

*En el template, se accede al valor invocando el signal como función: `pacientes()`. Angular detecta los cambios automáticamente sin necesidad de zone.js para las señales.*

---

## 8. Decisión sobre Materialize CSS

La Guía de Aprendizaje del SENA sugiere Materialize CSS como framework de estilos para el frontend. Se decidió alternativamente usar SCSS personalizado por las siguientes razones:

- **Reducción del bundle final**: sin Materialize CSS (~150 KB), el frontend arranca más rápido.
- **Mayor control visual**: los estilos propios permiten alinear la identidad visual de OdontoSalud sin sobrescribir estilos de librería.
- **Sistema de diseño coherente**: uso consistente de variables SCSS (colores primarios, espaciados, tipografía).
- **Menor curva de aprendizaje futura**: mantener el proyecto es más simple sin dependencia externa.

*Esta decisión se documenta explícitamente como una desviación consciente respecto a la guía, con justificación técnica. Como alternativa, el instructor puede solicitar el uso de Materialize CSS y el proyecto se puede refactorizar añadiendo la librería sin modificar la arquitectura.*

### 8.1. Sistema de Estilos Aplicado

```scss
// src/styles.scss — variables globales
:root {
  --color-primario: #2980b9;
  --color-primario-oscuro: #2471a3;
  --color-exito: #27ae60;
  --color-alerta: #e74c3c;
  --color-texto: #2c3e50;
  --color-secundario: #7f8c8d;
  --fondo-tarjeta: #ffffff;
  --borde-suave: #ecf0f1;
  --radio-borde: 8px;
}
```

---

# PARTE II

# Manual de Usuario

---

## 9. Introducción al Manual

Este manual describe paso a paso el uso del sistema OdontoSoft para los tres perfiles de usuario definidos: **ADMIN**, **ODONTOLOGO** y **RECEPCIONISTA**. Se acompaña de capturas de pantalla que evidencian cada acción esperada.

### 9.1. Acceso al Sistema

El sistema es accesible desde cualquier navegador web moderno (Chrome, Firefox, Edge, Safari) en la siguiente URL:

```
https://odontosoft-frontend-3925.onrender.com
```

### 9.2. Requisitos Mínimos

- Navegador actualizado (últimos 2 años)
- Conexión a internet estable
- Resolución mínima recomendada: 1280 × 720 (funciona también en móvil, con adaptación responsive)

### 9.3. Convenciones del Manual

- Los botones se resaltan en negrita, por ejemplo: presione **Guardar**.
- Las rutas del sistema aparecen en fuente monoespaciada, por ejemplo: `/pacientes`.
- Los mensajes del sistema se citan entre comillas: "Paciente creado exitosamente".

---

## 10. Inicio de Sesión

Al ingresar por primera vez, el usuario ve la pantalla de login.

> **[ INSERTAR CAPTURA DE PANTALLA AQUÍ ]**
>
> *Figura 10.1. Pantalla de inicio de sesión de OdontoSoft.*

### 10.2. Pasos para Iniciar Sesión

- Ingresar el correo electrónico registrado (ejemplo: `admin@odontosoft.com`).
- Ingresar la contraseña asignada.
- Presionar el botón **Ingresar**.

Si las credenciales son correctas, el usuario es redirigido al Dashboard principal. Si son incorrectas, se muestra el mensaje "Error al iniciar sesión. Intente nuevamente".

### 10.3. Cierre de Sesión

Para cerrar sesión, el usuario presiona el botón **Cerrar sesión** ubicado en la barra superior. El token JWT actual queda invalidado y se redirige al login.

---

## 11. Módulo de Pacientes

**Perfiles con acceso:** RECEPCIONISTA (CRUD), ADMIN y ODONTOLOGO (solo lectura).

### 11.1. Listar Pacientes

Desde el Dashboard, presione **Ver Pacientes** o navegue a `/pacientes`. El sistema muestra la lista paginada de pacientes activos.

> **[ INSERTAR CAPTURA DE PANTALLA AQUÍ ]**
>
> *Figura 11.1. Vista de listado de pacientes con búsqueda y paginación.*

### 11.2. Buscar un Paciente

En el campo **Buscar por nombre, apellido o documento…** escriba el término de búsqueda. La lista se filtra en tiempo real conforme se escribe.

### 11.3. Crear un Nuevo Paciente

- Presione el botón **+ Nuevo paciente**.
- Complete los campos obligatorios: nombre, apellido, tipo de documento, número de documento.
- Complete opcionalmente los datos de contacto: teléfono, email, dirección, EPS.
- Presione **Guardar**.

El sistema valida que no exista otro paciente con la misma combinación de tipo y número de documento (RF-15). Si es válido, retorna al listado con el nuevo paciente incluido.

> **[ INSERTAR CAPTURA DE PANTALLA AQUÍ ]**
>
> *Figura 11.2. Formulario de creación de paciente.*

### 11.4. Ver Detalle y Editar

Presione el enlace **Ver** del paciente correspondiente. Se muestran los datos completos y las acciones disponibles: **Editar** y **Desactivar**.

> **[ INSERTAR CAPTURA DE PANTALLA AQUÍ ]**
>
> *Figura 11.3. Vista de detalle de paciente con datos completos.*

### 11.5. Desactivar un Paciente (RN-02)

El sistema no permite eliminar físicamente pacientes; solo desactivarlos. Un paciente desactivado deja de aparecer en el listado principal pero conserva su historia completa.

---

## 12. Módulo de Agenda

**Perfiles con acceso:** RECEPCIONISTA (CRUD), ADMIN y ODONTOLOGO (lectura + cambio de estado).

### 12.1. Ver la Agenda del Día

Navegue a `/citas`. El sistema muestra la agenda del día actual por defecto, con las citas ordenadas por hora.

> **[ INSERTAR CAPTURA DE PANTALLA AQUÍ ]**
>
> *Figura 12.1. Vista de agenda del día con las citas programadas.*

### 12.2. Crear una Nueva Cita

- Presione **+ Nueva cita**.
- Seleccione el paciente (autocompletado por nombre o cédula).
- Seleccione el odontólogo.
- Elija la fecha y hora de inicio.
- Indique la duración en minutos.
- Escriba el motivo de la consulta.
- Presione **Guardar**.

El sistema valida automáticamente que no haya conflicto de horario para el odontólogo seleccionado (RN-01) y que la `fechaHora` esté dentro del horario del consultorio (RN-07).

### 12.3. Cambiar el Estado de una Cita

Las citas fluyen por los siguientes estados: PROGRAMADA → CONFIRMADA → EN_ATENCIÓN → FINALIZADA. También pueden marcarse como CANCELADA o NO_ASISTIO. La recepcionista puede cambiar todos los estados; el odontólogo puede cambiar los estados clínicos (EN_ATENCIÓN, FINALIZADA).

---

## 13. Módulo de Historia Clínica

**Perfiles con acceso:** ODONTOLOGO (CRUD), ADMIN (desactivar evoluciones erróneas).

### 13.1. Abrir la Historia de un Paciente

Desde el detalle del paciente, presione **Ver historia clínica**. Si el paciente aún no tiene historia, el sistema permite crearla — automáticamente se genera el odontograma con los 32 dientes en estado SANO (RN-03).

> **[ INSERTAR CAPTURA DE PANTALLA AQUÍ ]**
>
> *Figura 13.1. Vista de historia clínica con odontograma y evoluciones.*

### 13.2. Registrar Antecedentes

Los antecedentes (médicos, alérgicos, medicamentos, quirúrgicos, familiares) se completan en la parte superior de la historia y pueden actualizarse cuando el paciente reporta cambios en su condición.

### 13.3. Interactuar con el Odontograma

El odontograma muestra los 32 dientes numerados en notación FDI. Al hacer clic sobre un diente, se abre un panel donde el odontólogo puede cambiar el estado general (SANO, CARIES, OBTURADO, CORONA, ENDODONCIA, AUSENTE, EXTRAER, IMPLANTE) y el estado por superficie (oclusal, vestibular, lingual, mesial, distal).

### 13.4. Agregar una Evolución

- Presione **+ Nueva evolución**.
- Seleccione el diente involucrado.
- Indique el procedimiento realizado (ejemplo: "Obturación con resina").
- Escriba la descripción detallada.
- Opcionalmente, adjunte imágenes (radiografías, fotos) — el sistema las optimiza automáticamente para uso web (RNF-09).
- Presione **Guardar**.

### 13.5. Desactivar una Evolución Errónea (Solo ADMIN)

Si se detecta que una evolución fue registrada por error, únicamente el usuario ADMIN puede desactivarla presionando el ícono correspondiente. La evolución no se elimina físicamente (RN-10); queda marcada como inactiva y no aparecerá en los reportes clínicos ni en el RIPS.

---

## 14. Módulo de Facturación

**Perfiles con acceso:** RECEPCIONISTA (CRUD), ADMIN (lectura + anulación).

### 14.1. Crear una Factura

- Navegue a `/facturas` y presione **+ Nueva factura**.
- Seleccione el paciente.
- Agregue uno o más ítems con procedimiento y valor.
- El sistema calcula automáticamente el subtotal, el IVA y el valor total.
- Presione **Guardar**.

> **[ INSERTAR CAPTURA DE PANTALLA AQUÍ ]**
>
> *Figura 14.1. Formulario de creación de factura.*

### 14.2. Registrar un Pago

- En el detalle de la factura, presione **+ Registrar pago**.
- Indique el monto y el método de pago (EFECTIVO, TARJETA, TRANSFERENCIA, PSE).
- Presione **Confirmar**.

El sistema valida que el monto no exceda el saldo pendiente (RN-05). Si el saldo llega a cero, el estado de la factura cambia automáticamente a PAGADA.

### 14.3. Anular una Factura

En el detalle de la factura, presione **Anular**. Indique el motivo de la anulación. La factura no se elimina físicamente (RN-04): queda marcada como ANULADA con motivo, usuario y fecha registrados.

### 14.4. Descargar el PDF de la Factura

En el detalle de la factura, presione **Descargar PDF**. El sistema genera y descarga el archivo con los datos del consultorio, del paciente, los ítems, los pagos y el saldo pendiente.

---

## 15. Módulo de Inventario

**Perfiles con acceso:** RECEPCIONISTA (CRUD), ADMIN (lectura y reportes).

### 15.1. Registrar un Nuevo Material

- Navegue a `/inventario` y presione **+ Nuevo material**.
- Indique nombre, descripción, unidad de medida, stock inicial y stock mínimo.
- Presione **Guardar**.

### 15.2. Registrar Entrada de Stock

Cuando se recibe una compra, en el detalle del material presione **Registrar entrada**, indique la cantidad y el motivo, y presione **Confirmar**.

### 15.3. Registrar Salida de Stock

Cada vez que se usa material en una consulta, se registra una salida con la cantidad y el motivo. El sistema no permite salidas que dejen el stock en negativo y advierte cuando el stock cae bajo el mínimo (RF-43).

> **[ INSERTAR CAPTURA DE PANTALLA AQUÍ ]**
>
> *Figura 15.1. Detalle de material con historial de movimientos.*

### 15.4. Ver Alertas de Stock Bajo

En la parte superior del listado, se muestra un contador de materiales bajo el mínimo. Presione la alerta para ver la lista completa y planificar las compras.

---

## 16. Módulo de Recordatorios

**Perfiles con acceso:** RECEPCIONISTA (configuración), ADMIN (lectura del historial).

### 16.1. Configurar las Plantillas de Mensajes

Navegue a `/recordatorios/configuracion`. Verá las plantillas actuales de email y WhatsApp con las variables disponibles: `{{nombre}}`, `{{fecha}}`, `{{hora}}`.

Modifique el texto según las necesidades del consultorio y presione **Guardar**. Los cambios se aplican inmediatamente a los siguientes recordatorios que envíe el sistema.

### 16.2. Envío Automático de Recordatorios

El sistema envía automáticamente un recordatorio 24 horas antes de cada cita (RN-08). Esta tarea corre cada hora en segundo plano — el usuario no necesita hacer nada.

### 16.3. Ver el Historial de Recordatorios

Navegue a `/recordatorios/historial` para consultar todos los recordatorios enviados, con el estado (ENVIADO o ERROR), el destinatario, la cita relacionada y la fecha. Los recordatorios enviados por email tienen un enlace de "vista previa" que abre la interfaz de Ethereal para inspeccionar el mensaje real.

---

## 17. Módulo de Reportes

**Perfiles con acceso:** ADMIN (todos los reportes), RECEPCIONISTA (financieros/administrativos), ODONTOLOGO (clínicos).

### 17.1. Dashboard Financiero y Administrativo

Navegue a `/reportes`. Se muestran cuatro tarjetas simultáneamente: ingresos del mes, tasa de asistencia, gráfico de pacientes nuevos por mes (últimos 6 meses) y tabla de pacientes con saldo pendiente.

> **[ INSERTAR CAPTURA DE PANTALLA AQUÍ ]**
>
> *Figura 17.1. Dashboard de reportes financieros y administrativos.*

### 17.2. Reporte Clínico — Tratamientos más Realizados

Los usuarios ADMIN y ODONTOLOGO pueden acceder al reporte clínico en `/reportes/clinicos`, que muestra los procedimientos más realizados ordenados por frecuencia como gráfico de barras horizontales.

### 17.3. Exportar Reportes

Cada reporte incluye botones **Excel** y **PDF** que descargan el archivo correspondiente.

---

## 18. Módulo RIPS

**Perfiles con acceso:** RECEPCIONISTA (CRUD), ADMIN (lectura y generación).

### 18.1. Validar un Periodo

- Navegue a `/rips`.
- Seleccione el mes a reportar (por defecto se precarga el mes actual).
- Presione **Validar periodo**.

El sistema muestra el resumen: cuántas atenciones se encontraron en total, cuántas están completas y cuáles están incompletas. Para las incompletas, se detallan exactamente qué campos faltan por corregir (código CUPS, diagnóstico, documento del paciente, etc.).

> **[ INSERTAR CAPTURA DE PANTALLA AQUÍ ]**
>
> *Figura 18.1. Vista de validación de periodo mostrando atenciones completas e incompletas.*

### 18.2. Generar el Archivo RIPS

Si todas las atenciones están completas, aparece la sección **Generar y descargar RIPS**. Presione el botón para descargar el archivo JSON, listo para ser radicado en el Ministerio de Salud (proceso manual, fuera del alcance del sistema).

### 18.3. Ver el Histórico de Archivos Generados

Presione **Ver historial →** para consultar todos los archivos RIPS que se han generado en el sistema, con su periodo, cantidad de atenciones incluidas, usuario que lo generó y fecha.

---

# PARTE III

# Informe Final del Proyecto

---

## 19. Métricas del Proyecto

### 19.1. Métricas Cuantitativas

| Métrica | Valor |
|---|:---:|
| Módulos funcionales completados | **9 de 9 (100%)** |
| Requisitos funcionales (RF) implementados | **59 de 59 (100%)** |
| Reglas de negocio (RN) implementadas y verificadas | **10 de 10 (100%)** |
| Requisitos no funcionales (RNF) cumplidos | **14 de 14 (100%)** |
| Colecciones de MongoDB | 11 |
| Índices activos en la base de datos | 22 |
| Endpoints REST del backend | 60+ |
| Componentes Angular del frontend | 25+ |
| Pruebas end-to-end automatizadas | **101 (todas exitosas)** |
| Pull Requests fusionados a main | 9 |
| Documentos de módulo creados | 9 |
| Documentos SENA de entregables mensuales | **6** |
| Servicios en producción | 3 (Atlas + Backend + Frontend) |
| Costo mensual de operación | **0 USD** |

### 19.2. Métricas Cualitativas

- **Cobertura funcional**: 100% del alcance definido en el SRS original.
- **Trazabilidad**: cada commit y cada línea de código relaciona con un RF/RN identificable.
- **Documentación técnica**: cada módulo tiene su propio documento markdown en `docs/`.
- **Producción real**: sistema publicado y accesible al mundo (no solo en local).

---

## 20. Cumplimiento de Requisitos

A continuación se resume el cumplimiento de los 59 requisitos funcionales, agrupados por módulo:

| Módulo | Descripción | RF | Estado |
|:---:|---|:---:|:---:|
| **1** | Autenticación y control de acceso | 01-08 (8) | ✅ 8/8 |
| **2** | Pacientes | 09-16 (8) | ✅ 8/8 |
| **3** | Agenda y citas | 17-24 (8) | ✅ 8/8 |
| **4** | Historia clínica y odontograma | 25-32 (8) | ✅ 8/8 |
| **5** | Facturación y pagos | 33-40 (8) | ✅ 8/8 |
| **6** | Inventario | 41-45 (5) | ✅ 5/5 |
| **7** | Recordatorios automáticos | 46-49 (4) | ✅ 4/4 |
| **8** | Reportes y estadísticas | 50-55 (6) | ✅ 6/6 |
| **9** | Integración con RIPS | 56-59 (4) | ✅ 4/4 |
| **Total** | | **59** | **✅ 59/59 (100%)** |

---

## 21. Cumplimiento de Reglas de Negocio

| Código | Regla | Dónde se aplica |
|---|---|---|
| **RN-01** | Un odontólogo no puede tener dos citas superpuestas | `citaService.detectarConflicto` |
| **RN-02** | Los pacientes no se eliminan físicamente; solo se desactivan | `pacienteController.desactivar` |
| **RN-03** | El odontograma se inicializa con 32 dientes en estado SANO | `historiaService.crear` |
| **RN-04** | Las facturas no se eliminan; solo se anulan con motivo | `facturaService.anular` |
| **RN-05** | La suma de pagos no puede exceder el valor total de la factura | `facturaService.registrarPago` |
| **RN-06** | Todo movimiento de inventario queda registrado con auditoría | `materialService.registrarMovimiento` |
| **RN-07** | Las citas solo pueden agendarse dentro del horario del consultorio | `citaService.validarHorario` |
| **RN-08** | Los recordatorios se envían automáticamente 24h antes de la cita | `jobs/recordatoriosJob.js` |
| **RN-09** | Solo el rol ODONTOLOGO puede crear o modificar la historia clínica | `roleMiddleware` |
| **RN-10** | Solo el rol ADMIN puede desactivar una evolución clínica | `historiaController.desactivarEvolucion` |

**Total: 10/10 reglas de negocio implementadas, verificadas en pruebas end-to-end y documentadas.**

---

## 22. Lecciones Aprendidas

### 22.1. Técnicas

- Aprovechar el modelo de documentos de MongoDB para embeber subdocumentos (odontograma, evoluciones, pagos, movimientos) simplifica las consultas y evita joins costosos.
- Angular 20 con signals ofrece una experiencia de desarrollo más simple que RxJS puro para el estado local de componentes.
- Los interceptors de HttpClient permiten centralizar la lógica de autenticación en un único punto.
- Los índices únicos compuestos (`tipoDocumento + numeroDocumento`) son más eficaces que validaciones en aplicación.
- Las agregaciones (`$unwind`, `$group`, `$lookup`) son suficientes para todos los reportes del proyecto sin necesitar un motor OLAP separado.

### 22.2. De Proceso

- El feature branch workflow con un módulo por rama facilita la revisión y evita conflictos.
- Los scripts end-to-end automáticos ahorran tiempo en regresiones y sirven como documentación viva.
- La convención de commits con referencia al RF/RN permite reconstruir la historia del proyecto de forma sistemática.
- Documentar decisiones de alcance explícitamente (fuera de alcance, delimitaciones) evita malentendidos con el cliente.

### 22.3. De Despliegue en la Nube

- La mayoría de errores de "no funciona en producción" son variables de entorno mal configuradas, no bugs de código.
- Verificar cada componente por separado (`curl` al backend, browser al frontend) antes de sospechar un problema de integración.
- Los planes gratuitos son suficientes para proyectos académicos, pero el cold start hay que documentarlo.

---

## 23. Mejoras Futuras

Se identifican las siguientes mejoras para una próxima iteración del proyecto:

### 23.1. Funcionales

- Integración real con la DIAN para facturación electrónica y radicación automática de RIPS.
- Integración con Twilio o Meta WhatsApp Business API para el envío real por WhatsApp.
- Módulo de teleodontología con videollamada integrada.
- Portal del paciente con acceso a su historia y sus citas.
- Pasarela de pagos en línea (PSE, tarjeta) integrada.

### 23.2. Técnicas

- Migración de archivos adjuntos a un servicio de almacenamiento en la nube (S3, R2).
- Pipeline CI/CD con GitHub Actions ejecutando las pruebas antes de deploy.
- Monitoreo con Sentry o similar para captura de errores en producción.
- Pruebas unitarias e integración además de las end-to-end.
- Modo offline en el frontend con Service Workers.

### 23.3. De Producto

- Aplicación móvil nativa para consulta rápida de agenda.
- Módulo de nómina y horarios del personal.
- Reportes avanzados con predicción de flujo de pacientes.
- Multi-tenant (soportar varios consultorios en una misma instalación).

---

## 24. Cierre del Proyecto

El proyecto OdontoSoft cumplió con la totalidad de los objetivos planteados en la fase de análisis (Documento 1): un sistema de gestión clínica odontológica funcional, desplegado en la nube, accesible al usuario final, con documentación técnica y de usuario completa.

Los 6 documentos SENA de entregables mensuales, los 9 documentos técnicos por módulo, el código completo del backend y del frontend, los scripts de pruebas automatizadas y los servicios en producción constituyen la evidencia integral del trabajo realizado durante la etapa productiva.

### 24.1. URLs de Producción

- **Frontend:** `https://odontosoft-frontend-3925.onrender.com`
- **Backend API:** `https://odontosoft-backend-dwes.onrender.com/api`
- **Base de datos:** MongoDB Atlas cluster `odontosoft-cluster`
- **Repositorio:** `https://github.com/juangarcesco/odontosoft-v2`

### 24.2. Agradecimientos

Al SENA por el marco formativo del programa de Análisis y Desarrollo de Software. Al instructor por la orientación durante la etapa productiva. A la comunidad de código abierto que sustenta las tecnologías utilizadas (Node.js, MongoDB, Angular, Express y todas las dependencias que hacen posible este tipo de proyectos).

---

**Fin del Documento 6 — Cierre del Proyecto OdontoSoft**

---

**Firma del Aprendiz:**

_______________________________________

Nombre: `[NOMBRE COMPLETO DEL APRENDIZ]`

Ficha SENA: `[NÚMERO DE FICHA]`

Fecha: `[FECHA]`

---

**Aprobación del Instructor:**

_______________________________________

Nombre: `[NOMBRE DEL INSTRUCTOR]`

Rol: Instructor SENA — Análisis y Desarrollo de Software

Fecha: `[FECHA]`
