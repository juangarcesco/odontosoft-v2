# SERVICIO NACIONAL DE APRENDIZAJE — SENA

**Etapa Productiva — Modalidad Proyecto Productivo**

*Competencia Técnica: Análisis y Desarrollo de Software*

---

# ESPECIFICACIÓN DE REQUISITOS DE SOFTWARE (SRS)

**Documento del Mes 1 — Análisis del Sistema**

**Proyecto:** OdontoSoft — Sistema de Gestión Clínica Odontológica

**Cliente:** Consultorio Odontológico Dra. EM (Bogotá D.C.)

**Aprendices:** Juan Carlos Garces Sierra, Juan Pablo Mendez Gil

**Ficha SENA:** 3186265

**Instructor:** Nelson Armando Serrano Hincapie

**Fecha de entrega:** Agosto 2026

---

## CONTENIDO

1. Introducción
2. Descripción del Cliente
3. Metodología de Levantamiento de Información
4. Alcance del Sistema
5. Resumen de Requisitos
6. Modelo de Roles
7. Delimitaciones del Alcance
8. Documentos Anexos
9. Aprobación Formal

---

## 1. INTRODUCCIÓN

### 1.1. Propósito

Este documento constituye la **Especificación de Requisitos de Software (SRS)** del proyecto OdontoSoft, un sistema de gestión clínica odontológica desarrollado como parte de la Etapa Productiva del programa de Análisis y Desarrollo de Software del SENA.

El SRS se elabora como documento de síntesis que consolida el análisis del sistema y remite a **tres documentos independientes** donde se detallan de forma ampliada los instrumentos de recolección de datos aplicados, el catálogo completo de requisitos, y el modelo de roles del sistema.

### 1.2. Audiencia

Este documento está dirigido a:

- La cliente (Dra. EM), como resumen ejecutivo del análisis del sistema.
- El instructor SENA, como evidencia de la fase de análisis de la Etapa Productiva.
- El equipo desarrollador, como marco general del proyecto.

### 1.3. Estructura documental del proyecto

El presente SRS forma parte de una estructura documental de análisis compuesta por:

| Documento | Contenido | Extensión |
|---|---|---|
| **SRS (este documento)** | Síntesis y visión global del sistema | ~8 páginas |
| **Doc 1 — Instrumentos de Recolección** | Detalle de la entrevista, análisis de experiencia profesional y observación directa | ~14 páginas |
| **Doc 2 — Informe de Requisitos** | Catálogo completo de 59 RF, 14 RNF y 10 RN con matriz de trazabilidad | ~13 páginas |
| **Doc 3 — Definición de Roles** | Modelo RBAC completo y matriz de permisos por módulo | ~15 páginas |

El SRS es autocontenido para efectos de lectura ejecutiva, pero remite a los tres documentos anexos donde se encuentra el detalle ampliado de cada sección.

---

## 2. DESCRIPCIÓN DEL CLIENTE

### 2.1. Identificación

| Aspecto | Detalle |
|---|---|
| **Nombre del consultorio** | Consultorio Odontológico Dra. EM |
| **Nombre comercial** | OdontoSoft |
| **Odontóloga responsable** | Dra. EM |
| **Ubicación planeada** | Bogotá D.C., Colombia |
| **Estado del negocio** | En proceso de independización (apertura próxima) |
| **Experiencia profesional de la cliente** | 12 años ejerciendo odontología en clínicas del sector |
| **Personal previsto** | 1 odontóloga (fundadora) + 1 recepcionista + 1 administrador |

### 2.2. Motivación del proyecto

La Dra. EM decide independizarse tras 12 años de ejercicio profesional en clínicas del sector, donde ha utilizado de manera continua software profesional de gestión odontológica. Como parte de su plan de independización requiere un sistema propio adaptado a las particularidades de su nueva práctica, con tres características clave: consultorio de estructura reducida, sin dependencia de licencias de software recurrentes, y control total sobre sus datos clínicos y administrativos.

### 2.3. Ventaja del caso

El proyecto presenta una **ventaja metodológica poco común**: la cliente cuenta con 12 años de experiencia como usuaria activa de software profesional del sector, lo que reduce significativamente el margen de error en la definición de requisitos. En lugar de un proceso exploratorio típico, se realizó un proceso de **captura estructurada del conocimiento profesional acumulado**.

---

## 3. METODOLOGÍA DE LEVANTAMIENTO DE INFORMACIÓN

Para la fase de análisis se aplicaron **tres instrumentos complementarios**:

| Instrumento | Propósito | Duración |
|---|---|---|
| **Entrevista semiestructurada** | Visión estratégica y prioridades de la cliente | 60 min |
| **Análisis de experiencia profesional previa** | Sistematización de su conocimiento del sector (9 dominios funcionales) | 90 min |
| **Observación directa** | Validación en la práctica del flujo de trabajo real | 4 h |

Esta combinación ofrece una **visión 360°**: la estratégica (entrevista), la técnica-profesional (análisis de experiencia) y la operativa (observación).

> 📄 **El detalle completo de los instrumentos aplicados — incluyendo las 15 preguntas de la entrevista con las respuestas textuales de la cliente, los 9 dominios funcionales analizados con matriz de uso/decisión, y las observaciones registradas durante la jornada de acompañamiento — se encuentra en el documento independiente `01_Instrumentos_Recoleccion_Datos.md`.**

### 3.1. Consolidación de hallazgos

Del cruce de los tres instrumentos se identificaron los siguientes ejes que el sistema debe resolver:

| Eje identificado | Prioridad |
|---|:---:|
| Gestión completa de pacientes con búsqueda avanzada | Alta |
| Agenda visual con detección automática de conflictos | Alta |
| Historia clínica con odontograma interactivo por superficie | Crítica |
| Evoluciones cronológicas con adjuntos | Alta |
| Facturación con múltiples pagos parciales | Alta |
| Control de inventario con alertas | Media |
| Recordatorios automáticos 24 horas antes | Alta |
| Reportes gerenciales financieros y clínicos | Alta |
| Generación de archivo RIPS mensual | Alta (obligatorio legal) |
| Roles diferenciados por función | Alta |
| Alojamiento en la nube con respaldo automático | Alta |
| Sin dependencia de licencias externas recurrentes | Alta |

Cada eje se tradujo posteriormente a requisitos concretos (ver sección 5 y Doc 2).

---

## 4. ALCANCE DEL SISTEMA

### 4.1. Descripción general

**OdontoSoft** es una aplicación web para la gestión integral del consultorio odontológico independiente de la Dra. EM. El sistema digitaliza los procesos administrativos, clínicos y financieros del consultorio, siguiendo las funcionalidades estándar del sector odontológico validadas previamente con la cliente.

### 4.2. Módulos funcionales

El sistema se organiza en **9 módulos funcionales**:

| Módulo | Nombre | Responsabilidad |
|:---:|---|---|
| **M1** | Autenticación y control de acceso | Login, JWT, roles, auditoría |
| **M2** | Pacientes | Registro, búsqueda, ficha detallada |
| **M3** | Citas y agenda | Programación con detección de conflictos |
| **M4** | Historia clínica y odontograma | Registros clínicos, evoluciones, adjuntos |
| **M5** | Facturación y pagos | Facturas con pagos parciales |
| **M6** | Inventario | Materiales, movimientos, alertas de stock |
| **M7** | Recordatorios automáticos | Email + WhatsApp simulado, 24h antes |
| **M8** | Reportes y estadísticas | Reportes gerenciales financieros y clínicos |
| **M9** | Integración con RIPS | Generación de archivos JSON para el Ministerio |

### 4.3. Stack tecnológico

El sistema se implementa sobre el **stack MEAN** (MongoDB, Express, Angular, Node.js) y se despliega en la nube:

- **Base de datos:** MongoDB Atlas (cluster gratuito M0, AWS us-east-1)
- **Backend:** Node.js + Express (desplegado en Render)
- **Frontend:** Angular (desplegado en Render como sitio estático)
- **Autenticación:** JWT + bcrypt
- **Envío de correos:** Ethereal (SMTP de pruebas)
- **WhatsApp:** simulado en fase 1

Esta elección responde a la preferencia explícita de la cliente por soluciones en la nube (Entrevista P12) y sin dependencia de licencias externas recurrentes (Entrevista P2).

---

## 5. RESUMEN DE REQUISITOS

El sistema define un total de **59 Requisitos Funcionales (RF)**, **14 Requisitos No Funcionales (RNF)** y **10 Reglas de Negocio (RN)**, todos validados con la cliente durante la fase de levantamiento.

### 5.1. Distribución de Requisitos Funcionales por módulo

| Módulo | Rango de códigos | Cantidad |
|:---:|:---:|:---:|
| M1 — Autenticación | RF-01 a RF-08 | 8 |
| M2 — Pacientes | RF-09 a RF-16 | 8 |
| M3 — Citas y agenda | RF-17 a RF-24 | 8 |
| M4 — Historia clínica | RF-25 a RF-32 | 8 |
| M5 — Facturación | RF-33 a RF-40 | 8 |
| M6 — Inventario | RF-41 a RF-45 | 5 |
| M7 — Recordatorios | RF-46 a RF-49 | 4 |
| M8 — Reportes | RF-50 a RF-55 | 6 |
| M9 — RIPS | RF-56 a RF-59 | 4 |
| **Total** | | **59** |

### 5.2. Categorías de Requisitos No Funcionales

Los 14 RNF se agrupan en las siguientes categorías:

| Categoría | Códigos | Enfoque |
|---|---|---|
| Seguridad | RNF-01 a RNF-05 | bcrypt, JWT, rate limiting, RBAC, auditoría |
| Usabilidad | RNF-06 a RNF-07 | Responsive, idioma español |
| Rendimiento | RNF-08 a RNF-09 | ≤2s en consultas, optimización de imágenes |
| Mantenibilidad | RNF-10 a RNF-11 | Arquitectura por capas, commits trazables al SRS |
| Disponibilidad y portabilidad | RNF-12 a RNF-13 | Alojamiento en la nube, aplicación web multiplataforma |
| Escalabilidad | RNF-14 | Soporte a crecimiento sin refactorización |

### 5.3. Reglas de Negocio críticas

Las 10 RN son restricciones inviolables que el sistema valida automáticamente:

| Código | Regla resumida |
|---|---|
| **RN-01** | Un odontólogo no puede tener dos citas superpuestas. |
| **RN-02** | Los pacientes no se eliminan; se desactivan. |
| **RN-03** | El odontograma se inicializa con 32 dientes SANOS al crear la historia clínica. |
| **RN-04** | Las facturas no se eliminan; se anulan con motivo. |
| **RN-05** | La suma de pagos no puede exceder el valor de la factura. |
| **RN-06** | Todo movimiento de inventario queda registrado inmutablemente. |
| **RN-07** | Las citas solo se agendan dentro del horario del consultorio. |
| **RN-08** | Los recordatorios se envían automáticamente 24 horas antes de la cita. |
| **RN-09** | Solo el rol ODONTOLOGO puede acceder a la historia clínica. |
| **RN-10** | Solo el rol ADMIN puede desactivar evoluciones clínicas erróneas. |

> 📄 **El catálogo completo de los 59 RF con descripciones detalladas y prioridades, los 14 RNF ampliados y las 10 RN con su justificación, junto con la matriz de trazabilidad que vincula cada requisito al eje de origen — se encuentra en el documento independiente `02_Informe_Requisitos.md`.**

---

## 6. MODELO DE ROLES

El sistema implementa un modelo **RBAC (Role-Based Access Control)** con **tres roles diferenciados**, alineados con la estructura organizacional del consultorio.

### 6.1. Mapeo entre personal real y roles del sistema

| Cargo real | Persona | Rol técnico | Cantidad |
|---|---|---|:---:|
| Odontóloga fundadora | Dra. EM | **ODONTOLOGO** | 1 |
| Administrador | (por definir) | **ADMIN** | 1 |
| Recepcionista | (por definir) | **RECEPCIONISTA** | 1 |

### 6.2. Alcance sintético por rol

- **ADMIN** — Asumido por el administrador contratado. Control total sobre configuración, gestión de usuarios, reportes gerenciales avanzados, contabilidad, RIPS y auditoría. **No** puede intervenir directamente en la historia clínica (solo lectura y desactivación de registros erróneos por vía de RN-10).

- **ODONTOLOGO** — Asumido por la Dra. EM (y por odontólogos adicionales en el futuro). Responsable de toda la actividad clínica: creación de historia clínica, marcado del odontograma por diente y superficie, registro de evoluciones y adjuntos.

- **RECEPCIONISTA** — Asumido por la recepcionista contratada. Gestión operativa de agenda, registro de pacientes nuevos, facturación básica, cobros y consulta de inventario. **Sin acceso** a información clínica (aplicación de RN-09).

### 6.3. Principios rectores del modelo

- **Mínimo privilegio:** cada rol tiene únicamente los permisos estrictamente necesarios para su función.
- **Separación de funciones:** áreas clínica, administrativa y operativa claramente separadas.
- **Confidencialidad clínica:** solo los profesionales de la salud tienen acceso a datos clínicos sensibles.
- **Trazabilidad:** todas las acciones críticas registran usuario responsable.

### 6.4. Doble validación (defensa en profundidad)

El control de acceso se aplica **tanto en frontend como en backend**. El frontend oculta lo no permitido para mejorar la experiencia; el backend garantiza la seguridad real como única fuente autorizada de decisión sobre el acceso.

> 📄 **La definición detallada de cada rol con su descripción funcional, la matriz completa de permisos por módulo (más de 60 acciones documentadas), las reglas de aplicación operativa, los casos de uso típicos por jornada laboral y la implementación técnica del RBAC — se encuentran en el documento independiente `03_Definicion_Roles.md`.**

---

## 7. DELIMITACIONES DEL ALCANCE

Se documentan explícitamente las decisiones de alcance del proyecto, todas validadas con la cliente:

| Componente | Estado | Justificación |
|---|---|---|
| Facturación electrónica DIAN | **Excluida al inicio** | Costos de proveedor autorizado; pospuesta a fase 2 |
| Radicación automática RIPS | **Excluida** | Radicación manual en la plataforma del Ministerio |
| WhatsApp real (Twilio / Meta) | **Simulado en fase 1** | Integración real pospuesta a fase 2 |
| Portal del paciente / app móvil | **Excluidos** | La cliente los considera innecesarios en fase 1 |
| Videollamada / teleodontología | **Excluidas** | Fuera del enfoque del consultorio presencial |
| Integración con laboratorios | **Excluida** | No requerida para el volumen inicial |
| Pasarela de pagos en línea (PSE) | **Excluida** | Registro manual de pagos; pospuesta a fase 2 |
| Almacenamiento de archivos en la nube (S3) | **Excluido** | Almacenamiento en disco local del servidor |
| Autenticación de dos factores (2FA) | **Excluida al inicio** | Pospuesta a fase 2 |

Estas delimitaciones fueron aceptadas formalmente por la cliente durante la fase de levantamiento (ver Doc 1 y Doc 2).

---

## 8. DOCUMENTOS ANEXOS

Este SRS se complementa con los siguientes documentos independientes, que forman parte integral del análisis del sistema:

### 📄 Documento 1 — `01_Instrumentos_Recoleccion_Datos.md`

Contiene:
- Contexto detallado del cliente y del proyecto.
- Metodología de aplicación de los 3 instrumentos.
- Transcripción íntegra de la entrevista semiestructurada (15 preguntas en 5 bloques).
- Análisis funcional-comparativo de los 9 dominios de la experiencia profesional previa.
- Observaciones registradas durante la jornada de acompañamiento (4 horas).
- Consolidación y trazabilidad de los hallazgos.

### 📄 Documento 2 — `02_Informe_Requisitos.md`

Contiene:
- Catálogo completo de los 59 Requisitos Funcionales con descripción detallada y prioridad.
- Catálogo completo de los 14 Requisitos No Funcionales.
- Catálogo completo de las 10 Reglas de Negocio con su justificación.
- Matriz de trazabilidad entre ejes identificados y requisitos formulados.
- Delimitaciones detalladas del alcance validadas con la cliente.

### 📄 Documento 3 — `03_Definicion_Roles.md`

Contiene:
- Origen del modelo de roles desde la entrevista con la cliente.
- Mapeo entre personal real del consultorio y roles técnicos del sistema.
- Definición detallada de cada uno de los 3 roles (ADMIN, ODONTOLOGO, RECEPCIONISTA).
- Matriz completa de permisos por módulo (más de 60 acciones documentadas).
- Reglas de aplicación operativa del RBAC.
- Casos de uso típicos por rol durante una jornada laboral.
- Implementación técnica del RBAC (JWT, middlewares, guards de Angular).

---

## 9. APROBACIÓN FORMAL

Habiendo revisado el presente SRS junto con los tres documentos independientes que lo complementan, la cliente manifiesta su aprobación formal del análisis del sistema OdontoSoft.

Esta aprobación constituye el compromiso funcional entre las partes y sirve como base para las fases posteriores del proyecto:

- **Mes 2:** Lógica y algoritmos (Documento 2 del cronograma SENA).
- **Mes 3:** Diseño de base de datos MongoDB (Documento 3).
- **Mes 4:** Desarrollo del backend REST (Documento 4).
- **Mes 5:** Despliegue en la nube (Documento 5).
- **Mes 6:** Frontend Angular y cierre del proyecto (Documento 6).

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
