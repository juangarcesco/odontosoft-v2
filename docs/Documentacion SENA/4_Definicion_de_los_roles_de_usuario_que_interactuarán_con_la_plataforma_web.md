# SERVICIO NACIONAL DE APRENDIZAJE — SENA

**Etapa Productiva — Modalidad Proyecto Productivo**

*Competencia Técnica: Análisis y Desarrollo de Software*

---

# DEFINICIÓN DE ROLES DEL SISTEMA

**Modelo de Control de Acceso Basado en Roles (RBAC)**

**Proyecto:** OdontoSoft — Sistema de Gestión Clínica Odontológica

**Cliente:** Consultorio Odontológico Dra. EM (Bogotá D.C.)

**Aprendices:** Juan Carlos Garces Sierra, Juan Pablo Mendez Gil

**Ficha SENA:** 3186265

**Instructor:** Nelson Armando Serrano Hincapie

**Fecha de entrega:** Agosto 2026

---

## CONTENIDO

1. Introducción
2. Origen del Modelo de Roles
3. Mapeo entre Personal Real y Roles del Sistema
4. Modelo Conceptual de Roles y Permisos
5. Definición Detallada de Roles
6. Matriz de Permisos por Módulo
7. Reglas de Aplicación de los Roles
8. Casos de Uso Típicos por Rol
9. Implementación Técnica del RBAC
10. Aprobación Formal

---

## 1. INTRODUCCIÓN

El presente documento define el **modelo de control de acceso basado en roles (RBAC — Role-Based Access Control)** para el sistema OdontoSoft. Establece con precisión qué usuarios pueden acceder a qué funcionalidades del sistema, garantizando el cumplimiento de los principios de mínimo privilegio, separación de funciones y confidencialidad de la información clínica.

La definición de roles es una consecuencia directa de los hallazgos de la fase de levantamiento de información — específicamente de la pregunta 8 de la entrevista aplicada a la Dra. EM — y responde a la necesidad expresada por la cliente de que "cada usuario del sistema tenga acceso únicamente a lo que corresponde a su cargo, sin cruzar funciones".

Este documento complementa al **Informe de Requisitos** (documento independiente), donde ya se establecieron los requisitos RF-06 (control de acceso por rol) y RNF-04 (implementación RBAC), y las reglas RN-09 y RN-10 relativas al acceso restringido a datos clínicos.

---

## 2. ORIGEN DEL MODELO DE ROLES

Durante la entrevista semiestructurada aplicada a la Dra. EM, se identificó con precisión la estructura organizacional prevista para el consultorio OdontoSoft. Su respuesta a la pregunta 8 fue determinante:

> "Tres personas: yo como odontóloga, una recepcionista para agenda y cobros, y un administrador que ayudará con la contabilidad y los reportes. Cada uno tendrá funciones distintas, así que necesito que el sistema controle bien los permisos de cada rol. Por ejemplo, la recepcionista no debe ver historias clínicas, y el administrador no debe registrar procedimientos."
> *— Dra. EM, entrevista de levantamiento de requisitos*

Este testimonio establece:

- **Tres cargos funcionales distintos:** odontóloga fundadora, recepcionista, administrador.
- **Tres perfiles de acceso diferenciados** con responsabilidades claramente separadas.
- **Dos restricciones explícitas de la cliente:**
  1. La recepcionista **no debe ver historias clínicas** (protección de información sensible).
  2. El administrador **no debe registrar procedimientos** (separación entre gestión clínica y administrativa).

Adicionalmente, durante el análisis de experiencia profesional previa (Dominio 9), la cliente confirmó como imprescindible la implementación de "roles diferenciados por función" con separación clara entre las áreas clínica, administrativa y de recepción.

Estos hallazgos determinan la definición de **tres roles técnicos** en el sistema.

---

## 3. MAPEO ENTRE PERSONAL REAL Y ROLES DEL SISTEMA

El consultorio OdontoSoft contará con **tres personas físicas** desempeñando **tres roles técnicos** distintos en el sistema:

| Cargo real en el consultorio | Persona | Rol técnico del sistema | Cantidad prevista |
|---|---|---|:---:|
| Odontóloga fundadora | Dra. EM | **ODONTOLOGO** | 1 |
| Administrador | (por definir) | **ADMIN** | 1 |
| Recepcionista | (por definir) | **RECEPCIONISTA** | 1 |

### 3.1. Nota sobre la asignación de roles

Esta correspondencia uno-a-uno refleja el estado inicial del consultorio. La Dra. EM en la entrevista (P11) manifestó su expectativa de crecimiento a mediano plazo, incluyendo la posible contratación de un segundo odontólogo. El sistema debe soportar esta escalabilidad sin cambios estructurales al modelo de roles: bastará con crear un nuevo usuario con rol ODONTOLOGO cuando llegue el momento.

### 3.2. Sobre el rol ADMIN

Es importante clarificar que en el modelo de OdontoSoft el rol técnico **ADMIN** es asumido por el **administrador del consultorio** — no por la odontóloga fundadora. Esta separación fue explícitamente solicitada por la cliente para mantener la separación de funciones entre la gestión clínica (responsabilidad del odontólogo) y la gestión administrativa/financiera (responsabilidad del administrador).

En consecuencia:

- La **Dra. EM** utiliza el sistema principalmente con rol **ODONTOLOGO** para su labor clínica diaria.
- El **administrador contratado** utiliza el sistema con rol **ADMIN** para configuración, contabilidad, reportes gerenciales y RIPS.
- La **recepcionista** utiliza el sistema con rol **RECEPCIONISTA** para agenda, registro de pacientes y facturación.

En caso de ausencia del administrador, la Dra. EM — como propietaria del consultorio — dispone de credenciales de rol ADMIN de respaldo para operaciones críticas. Esta doble asignación queda documentada como decisión operativa de la cliente.

---

## 4. MODELO CONCEPTUAL DE ROLES Y PERMISOS

El sistema OdontoSoft implementa un modelo **RBAC estricto de tres niveles**:

```
┌──────────────────────────────────────────────┐
│                   ADMIN                      │
│  (Control total: configuración, contabilidad │
│   avanzada, RIPS, gestión de usuarios)       │
└──────────────────────────────────────────────┘
                     │
                     │ superconjunto de
                     ▼
┌──────────────────────────────────────────────┐
│                ODONTOLOGO                    │
│  (Gestión clínica: historia clínica,         │
│   odontograma, evoluciones, agenda propia)   │
└──────────────────────────────────────────────┘
                     │
                     │ (rol independiente)
                     ▼
┌──────────────────────────────────────────────┐
│              RECEPCIONISTA                   │
│  (Gestión operativa: pacientes, agenda,      │
│   facturación básica, sin acceso clínico)    │
└──────────────────────────────────────────────┘
```

### 4.1. Principios rectores

El modelo se rige por los siguientes principios:

- **Principio de mínimo privilegio:** cada rol tiene únicamente los permisos estrictamente necesarios para su función.
- **Principio de separación de funciones:** las áreas clínica, administrativa y operativa están claramente separadas.
- **Principio de confidencialidad clínica:** solo los profesionales de la salud (rol ODONTOLOGO) tienen acceso a datos clínicos sensibles.
- **Principio de trazabilidad:** todas las acciones críticas quedan registradas indicando el usuario responsable.

### 4.2. Nota sobre la relación entre ADMIN y ODONTOLOGO

El rol ADMIN **no incluye automáticamente** los permisos clínicos del rol ODONTOLOGO. El administrador puede consultar reportes agregados y estadísticas clínicas, pero **no** puede crear ni modificar evoluciones, ni marcar procedimientos en el odontograma. Esta restricción responde a la petición explícita de la cliente ("el administrador no debe registrar procedimientos") y al principio de separación entre gestión y ejercicio clínico.

---

## 5. DEFINICIÓN DETALLADA DE ROLES

### 5.1. Rol ADMIN — Administrador del Consultorio

**Descripción:**
Rol asignado al administrador del consultorio. Tiene control total sobre la configuración del sistema, gestión de usuarios, reportes gerenciales avanzados, contabilidad y generación de archivos RIPS. Es el rol de mayor privilegio en el sistema pero, por decisión de la cliente, **no incluye** capacidad de intervenir directamente en la historia clínica de los pacientes.

**Persona que lo asume:** El administrador contratado por el consultorio (y la Dra. EM como respaldo).

**Alcance funcional:**
- Configuración general del sistema (horarios, plantillas, parámetros globales).
- Gestión completa de usuarios (crear, activar/desactivar, cambiar contraseñas, asignar roles).
- Acceso completo a todos los reportes gerenciales, financieros y estadísticos.
- Generación y descarga de archivos RIPS mensuales.
- Auditoría del sistema (logs de acceso, historial de acciones críticas).
- Anulación de facturas y desactivación de evoluciones clínicas erróneas.
- Consulta (solo lectura) de historia clínica para efectos de auditoría, sin capacidad de modificarla.

**Limitaciones:**
- **No puede** crear ni modificar evoluciones clínicas.
- **No puede** marcar hallazgos en el odontograma.
- **No puede** registrar procedimientos clínicos.

**Justificación:**
Estas limitaciones responden a la separación explícita solicitada por la cliente entre gestión administrativa y ejercicio clínico. Un administrador que no es profesional de la salud no debe intervenir directamente en registros clínicos, aunque sí pueda desactivar registros erróneos por vía de auditoría (RN-10).

---

### 5.2. Rol ODONTOLOGO — Profesional Clínico

**Descripción:**
Rol asignado a los odontólogos que ejercen en el consultorio. Responsable de toda la actividad clínica: creación y modificación de historia clínica, marcado del odontograma, registro de evoluciones, y prescripción de tratamientos. Tiene acceso a la agenda propia y a la información de sus pacientes.

**Persona que lo asume:** La Dra. EM en la fase inicial. Podrá asignarse a odontólogos adicionales en el futuro (Entrevista P11).

**Alcance funcional:**
- Consulta y actualización de la ficha del paciente.
- Creación y actualización de la historia clínica.
- Marcado del odontograma por diente y por superficie.
- Registro de evoluciones clínicas con adjuntos (radiografías, fotos).
- Consulta de su propia agenda de citas.
- Actualización del estado de sus citas (confirmar, iniciar atención, finalizar).
- Consulta de reportes clínicos propios (pacientes atendidos, tratamientos realizados).

**Limitaciones:**
- **No puede** gestionar usuarios ni cambiar contraseñas ajenas.
- **No puede** anular facturas emitidas.
- **No puede** desactivar evoluciones clínicas propias ya registradas (solo el ADMIN puede hacerlo, según RN-10).
- **No puede** modificar parámetros globales del sistema.
- **No puede** ver la agenda de otros odontólogos (privacidad clínica).

**Justificación:**
Este rol concentra las funciones clínicas del ejercicio profesional. La restricción de desactivar evoluciones propias garantiza la integridad histórica del registro clínico, aspecto crítico ante eventuales auditorías médico-legales.

---

### 5.3. Rol RECEPCIONISTA — Personal de Recepción y Atención

**Descripción:**
Rol asignado al personal de recepción. Responsable de la gestión operativa de la agenda, el registro de pacientes nuevos, la facturación básica y el cobro. **No tiene acceso a información clínica** — restricción explícita solicitada por la cliente.

**Persona que lo asume:** La recepcionista contratada por el consultorio.

**Alcance funcional:**
- Registro de pacientes nuevos con datos personales y de contacto.
- Consulta y actualización de datos administrativos del paciente (contacto, EPS, dirección).
- Creación y gestión de citas para cualquier odontólogo.
- Actualización del estado de las citas (confirmada, no asistió).
- Emisión de facturas y registro de pagos.
- Consulta de facturas emitidas y saldos pendientes.
- Consulta del inventario (con alertas de stock bajo).
- Registro de movimientos básicos de inventario (entradas y salidas ordinarias).

**Limitaciones:**
- **No puede** ver ni acceder a historias clínicas de pacientes (aplicación de RN-09).
- **No puede** ver ni marcar el odontograma.
- **No puede** consultar evoluciones clínicas.
- **No puede** ver antecedentes médicos, alergias, ni medicamentos.
- **No puede** anular facturas emitidas.
- **No puede** generar archivos RIPS.
- **No puede** acceder a reportes financieros gerenciales avanzados.
- **No puede** gestionar usuarios del sistema.

**Justificación:**
La restricción de acceso a datos clínicos responde a la exigencia explícita de la cliente ("la recepcionista no debe ver historias clínicas") y al cumplimiento de los principios de confidencialidad de la información en salud, en línea con la Ley 1581 de 2012 (Habeas Data) y la Resolución 1995 de 1999 del Ministerio de Salud sobre manejo de historia clínica.

---

## 6. MATRIZ DE PERMISOS POR MÓDULO

La siguiente matriz consolida los permisos por rol para cada módulo funcional del sistema.

**Notación:** ✅ Permitido | ❌ No permitido | 👁️ Solo lectura | 📊 Solo agregados/estadísticas

### Módulo 1 — Autenticación y Usuarios

| Acción | ADMIN | ODONTOLOGO | RECEPCIONISTA |
|---|:---:|:---:|:---:|
| Iniciar sesión | ✅ | ✅ | ✅ |
| Cambiar contraseña propia | ✅ | ✅ | ✅ |
| Crear usuarios | ✅ | ❌ | ❌ |
| Editar usuarios (rol, estado) | ✅ | ❌ | ❌ |
| Desactivar usuarios | ✅ | ❌ | ❌ |
| Ver log de auditoría | ✅ | ❌ | ❌ |

### Módulo 2 — Pacientes

| Acción | ADMIN | ODONTOLOGO | RECEPCIONISTA |
|---|:---:|:---:|:---:|
| Crear paciente | ✅ | ✅ | ✅ |
| Consultar listado | ✅ | ✅ | ✅ |
| Ver ficha detallada | ✅ | ✅ | ✅ |
| Editar datos personales | ✅ | ✅ | ✅ |
| Desactivar paciente | ✅ | ❌ | ❌ |

### Módulo 3 — Citas y Agenda

| Acción | ADMIN | ODONTOLOGO | RECEPCIONISTA |
|---|:---:|:---:|:---:|
| Crear citas | ✅ | ✅ | ✅ |
| Consultar agenda propia | ✅ | ✅ | ✅ |
| Consultar agenda de otros odontólogos | ✅ | ❌ | ✅ |
| Reasignar citas | ✅ | ✅ | ✅ |
| Cancelar citas | ✅ | ✅ | ✅ |
| Confirmar / marcar en atención / finalizar | ✅ | ✅ | ✅ |
| Marcar no-asistencia | ✅ | ✅ | ✅ |

### Módulo 4 — Historia Clínica y Odontograma

| Acción | ADMIN | ODONTOLOGO | RECEPCIONISTA |
|---|:---:|:---:|:---:|
| Ver historia clínica | 👁️ | ✅ | ❌ |
| Crear historia clínica | ❌ | ✅ | ❌ |
| Actualizar antecedentes | ❌ | ✅ | ❌ |
| Ver odontograma | 👁️ | ✅ | ❌ |
| Marcar odontograma | ❌ | ✅ | ❌ |
| Registrar evoluciones | ❌ | ✅ | ❌ |
| Adjuntar imágenes / documentos | ❌ | ✅ | ❌ |
| Consultar historial cronológico | 👁️ | ✅ | ❌ |
| Desactivar evolución errónea (RN-10) | ✅ | ❌ | ❌ |

### Módulo 5 — Facturación y Pagos

| Acción | ADMIN | ODONTOLOGO | RECEPCIONISTA |
|---|:---:|:---:|:---:|
| Crear factura | ✅ | ✅ | ✅ |
| Registrar pagos | ✅ | ✅ | ✅ |
| Consultar facturas | ✅ | ✅ | ✅ |
| Anular factura (RN-04) | ✅ | ❌ | ❌ |
| Ver reporte de cartera / saldos | ✅ | 👁️ (propias) | ✅ |
| Descargar PDF de factura | ✅ | ✅ | ✅ |

### Módulo 6 — Inventario

| Acción | ADMIN | ODONTOLOGO | RECEPCIONISTA |
|---|:---:|:---:|:---:|
| Consultar materiales | ✅ | ✅ | ✅ |
| Crear materiales | ✅ | ❌ | ❌ |
| Editar stock mínimo | ✅ | ❌ | ❌ |
| Registrar entrada de material | ✅ | ❌ | ✅ |
| Registrar salida de material | ✅ | ✅ | ✅ |
| Ver historial de movimientos | ✅ | 👁️ | 👁️ |
| Ver alertas de stock bajo | ✅ | ✅ | ✅ |

### Módulo 7 — Recordatorios

| Acción | ADMIN | ODONTOLOGO | RECEPCIONISTA |
|---|:---:|:---:|:---:|
| Ver historial de recordatorios enviados | ✅ | ❌ | ✅ |
| Configurar plantillas | ✅ | ❌ | ❌ |
| Reenviar recordatorio manual | ✅ | ❌ | ✅ |

### Módulo 8 — Reportes

| Acción | ADMIN | ODONTOLOGO | RECEPCIONISTA |
|---|:---:|:---:|:---:|
| Reporte de ingresos del mes | ✅ | 📊 | ❌ |
| Reporte de saldos pendientes | ✅ | ❌ | ✅ |
| Reporte de tratamientos más realizados | ✅ | ✅ | ❌ |
| Reporte de tasa de asistencia | ✅ | ✅ (propia) | ✅ |
| Reporte de pacientes nuevos | ✅ | 📊 | ✅ |
| Exportar reportes a Excel / PDF | ✅ | ✅ | ❌ |

### Módulo 9 — RIPS

| Acción | ADMIN | ODONTOLOGO | RECEPCIONISTA |
|---|:---:|:---:|:---:|
| Generar archivo RIPS mensual | ✅ | ❌ | ❌ |
| Validar completitud de atenciones | ✅ | ❌ | ❌ |
| Descargar archivo RIPS | ✅ | ❌ | ❌ |
| Ver histórico de archivos generados | ✅ | ❌ | ❌ |

---

## 7. REGLAS DE APLICACIÓN DE LOS ROLES

Las siguientes reglas rigen el funcionamiento del control de acceso a nivel operativo:

- **REG-01** — Cada usuario del sistema tiene **exactamente un rol** asignado en un momento dado. No existen usuarios multi-rol simultáneos.
- **REG-02** — La asignación de rol se realiza en el momento de la creación del usuario y solo puede modificarse por un usuario con rol ADMIN.
- **REG-03** — La validación del rol se aplica **tanto en frontend como en backend**, para prevenir accesos no autorizados por manipulación del cliente.
- **REG-04** — El backend valida el rol en cada petición HTTP mediante middleware antes de ejecutar la lógica de negocio. Cualquier acceso no autorizado retorna HTTP 403 Forbidden.
- **REG-05** — El frontend oculta o deshabilita las opciones de menú y botones a los que el usuario no tiene acceso, brindando una experiencia de usuario coherente con sus permisos.
- **REG-06** — Todo intento de acceso rechazado por rol insuficiente queda registrado en el log de auditoría con usuario, endpoint, timestamp e IP.
- **REG-07** — La desactivación de un usuario (por ejemplo, tras la salida de un empleado) impide su acceso al sistema pero preserva la trazabilidad histórica de las acciones que ejecutó.
- **REG-08** — En caso de emergencia operativa (ausencia del ADMIN principal), la Dra. EM dispone de credenciales de rol ADMIN de respaldo para operaciones críticas. Toda acción con este acceso queda registrada.

---

## 8. CASOS DE USO TÍPICOS POR ROL

Esta sección ilustra el flujo operativo típico de cada rol durante una jornada laboral del consultorio OdontoSoft.

### 8.1. Jornada típica del rol ADMIN

*Persona: administrador del consultorio.*

- **08:00** — Ingresa al sistema. Revisa el dashboard general y el log de auditoría de la jornada anterior.
- **08:30** — Consulta el reporte de ingresos de la semana. Verifica que los pagos registrados por la recepcionista coincidan con la caja física.
- **10:00** — Revisa la alerta de stock bajo en el inventario. Crea un pedido de reposición.
- **13:00** — Detecta una factura mal emitida (paciente equivocado). La anula formalmente registrando el motivo y notifica a la recepcionista para reemisión.
- **15:00** — Recibe solicitud del odontólogo: una evolución fue registrada con diente erróneo. La desactiva bajo la regla RN-10.
- **17:00** — Genera el archivo RIPS del mes anterior. Valida la completitud, descarga el archivo, lo radica manualmente en la plataforma del Ministerio.
- **18:00** — Exporta el reporte financiero mensual para la contabilidad externa.

### 8.2. Jornada típica del rol ODONTOLOGO

*Persona: Dra. EM.*

- **07:30** — Ingresa al sistema. Consulta su agenda del día — reconoce 10 pacientes programados.
- **08:00** — Recibe al primer paciente. Consulta la historia clínica: revisa antecedentes, alergias, medicamentos y el histórico de evoluciones (ordenadas de la más reciente a la más antigua). Marca la cita como EN_ATENCION.
- **08:30** — Realiza limpieza dental. En el odontograma marca los dientes tratados por superficie. Registra la evolución del día con descripción del procedimiento y adjunta la fotografía intraoral. Marca la cita como FINALIZADA.
- **11:00** — Detecta caries en paciente nuevo. Actualiza el odontograma marcando los dientes afectados. Registra el plan de tratamiento en la evolución.
- **14:30** — Consulta el reporte propio de "tratamientos más realizados en el último mes" para revisar tendencias personales.
- **17:30** — Cierra la jornada revisando que todas las evoluciones estén completas antes de terminar.

### 8.3. Jornada típica del rol RECEPCIONISTA

*Persona: recepcionista del consultorio.*

- **07:30** — Ingresa al sistema. Consulta la agenda del día para preparar los pacientes previstos.
- **07:45** — Recibe llamada telefónica. Registra un paciente nuevo con datos completos.
- **08:00** — Al llegar el primer paciente, actualiza su cita a CONFIRMADA.
- **09:15** — Al terminar la primera consulta, emite la factura con los procedimientos realizados y registra el pago (tarjeta débito). Descarga el PDF y lo envía al paciente por correo.
- **10:30** — Registra la entrada de material recibido del proveedor.
- **12:00** — Recibe cancelación telefónica de una cita. La cancela registrando el motivo. Reasigna el horario libre a un paciente en lista de espera.
- **15:00** — Revisa el reporte de saldos pendientes. Llama a pacientes con deudas antiguas para gestionar cobro.
- **17:00** — Verifica el listado de recordatorios que se enviarán mañana. Consulta el historial de envíos del día para asegurar que no hubo errores.

---

## 9. IMPLEMENTACIÓN TÉCNICA DEL RBAC

### 9.1. Almacenamiento del rol

El rol se almacena en la colección `usuarios` de MongoDB como campo `rol` de tipo `String` con validación de enum:

```javascript
rol: {
  type: String,
  enum: ['ADMIN', 'ODONTOLOGO', 'RECEPCIONISTA'],
  required: true,
  default: 'RECEPCIONISTA'
}
```

### 9.2. Inclusión del rol en el JWT

Al iniciar sesión (RF-01), el backend genera un token JWT que incluye el rol del usuario en el payload:

```javascript
const payload = {
  id: usuario._id,
  email: usuario.email,
  rol: usuario.rol,
  nombre: usuario.nombre
};
const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
```

Esto permite que el rol viaje con cada petición sin necesidad de consultar la base de datos en cada acción.

### 9.3. Middleware de validación en el backend

Se implementan dos middlewares Express en cadena:

**1. Middleware de autenticación** (`verificarToken`): valida el token JWT y adjunta el usuario a `req.usuario`.

**2. Middleware de autorización** (`verificarRol`): verifica que el rol del usuario esté entre los permitidos para el endpoint.

Ejemplo de aplicación en una ruta:

```javascript
router.post(
  '/historias-clinicas/:id/evoluciones',
  verificarToken,
  verificarRol(['ODONTOLOGO']),
  historiaController.crearEvolucion
);

router.delete(
  '/facturas/:id',
  verificarToken,
  verificarRol(['ADMIN']),
  facturaController.anular
);

router.get(
  '/pacientes',
  verificarToken,
  verificarRol(['ADMIN', 'ODONTOLOGO', 'RECEPCIONISTA']),
  pacienteController.listar
);
```

### 9.4. Control de acceso en el frontend (Angular)

Se implementa mediante:

- **AuthGuard:** intercepta las rutas y verifica que exista un token JWT válido.
- **RoleGuard:** verifica que el rol del usuario tenga acceso a la ruta.
- **Directiva estructural `*appHasRole`:** oculta elementos del DOM según el rol del usuario.

Ejemplo de uso en plantilla Angular:

```html
<button *appHasRole="['ADMIN']" (click)="anularFactura()">
  Anular Factura
</button>

<a *appHasRole="['ADMIN', 'ODONTOLOGO']" routerLink="/historia-clinica">
  Ver Historia Clínica
</a>
```

### 9.5. Doble validación (defensa en profundidad)

La validación se aplica **tanto en frontend como en backend**, siguiendo el principio de defensa en profundidad. El frontend mejora la experiencia del usuario ocultando lo no permitido; el backend garantiza la seguridad real al ser la única fuente autorizada de decisión sobre el acceso.

---

## 10. APROBACIÓN FORMAL

La cliente, tras revisar la definición de los tres roles del sistema, la matriz de permisos por módulo y las reglas de aplicación descritas, manifiesta su aprobación formal del modelo de control de acceso.

El modelo cumple con las condiciones explícitas expresadas durante la fase de levantamiento:

- ✅ Existen tres roles claramente diferenciados que corresponden a los tres cargos previstos en el consultorio.
- ✅ La recepcionista **no** tiene acceso a la historia clínica ni al odontograma.
- ✅ El administrador **no** puede registrar procedimientos ni evoluciones clínicas.
- ✅ La odontóloga tiene control total sobre la información clínica.
- ✅ El modelo permite crecer sin refactorización (adición de nuevos odontólogos).

---

**Firma del Cliente:**

_______________________________________

Nombre: Dra. EM

Cargo: Odontóloga fundadora — Consultorio OdontoSoft

Fecha: `[FECHA]`

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
