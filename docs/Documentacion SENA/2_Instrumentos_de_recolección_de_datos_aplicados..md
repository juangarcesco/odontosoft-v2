# SERVICIO NACIONAL DE APRENDIZAJE — SENA

**Etapa Productiva — Modalidad Proyecto Productivo**

*Competencia Técnica: Análisis y Desarrollo de Software*

---

# INSTRUMENTOS DE RECOLECCIÓN DE DATOS

**Aplicación de Metodologías de Levantamiento de Información**

**Proyecto:** OdontoSoft — Sistema de Gestión Clínica Odontológica

**Cliente:** Consultorio Odontológico Dra. EM (Bogotá D.C.)

**Aprendices:** Juan Carlos Garces Sierra, Juan Pablo Mendez Gil

**Ficha SENA:** 3186265

**Instructor:** Nelson Armando Serrano Hincapie

**Fecha de entrega:** Agosto 2026

---

## CONTENIDO

1. Introducción
2. Contexto del Cliente
3. Metodología de Levantamiento de Información
4. Instrumento 1 — Entrevista Semiestructurada a la Cliente
5. Instrumento 2 — Análisis de Experiencia Profesional Previa
6. Instrumento 3 — Observación Directa del Flujo de Trabajo Actual
7. Consolidación de Hallazgos
8. Conclusiones

---

## 1. INTRODUCCIÓN

El presente documento describe la aplicación de las metodologías de levantamiento de información empleadas en la fase inicial del proyecto **OdontoSoft**, un sistema de gestión clínica odontológica desarrollado como parte de la Etapa Productiva del programa de Análisis y Desarrollo de Software del SENA.

El objetivo de esta fase fue **comprender con precisión las necesidades reales de la cliente**, aprovechando una circunstancia particular: se trata de una odontóloga con 12 años de experiencia profesional, usuaria activa de software profesional de gestión odontológica durante toda su carrera clínica. Esta condición particular determinó la selección de los instrumentos aplicados: en lugar de una fase exploratoria típica, se optó por una **fase de captura estructurada del conocimiento profesional acumulado** por la cliente.

Se aplicaron tres instrumentos complementarios: una entrevista semiestructurada, un análisis sistemático de su experiencia previa con herramientas profesionales del sector, y una observación directa de su flujo de trabajo actual.

Los hallazgos aquí consolidados constituyen la base sobre la cual se elabora posteriormente el **Informe de Requisitos** (documento independiente) y la **Definición de Roles** (documento independiente).

---

## 2. CONTEXTO DEL CLIENTE

Antes de aplicar los instrumentos se caracterizó al cliente objetivo:

| Aspecto | Detalle |
|---|---|
| **Nombre del consultorio** | Consultorio Odontológico Dra. EM — nombre comercial: **OdontoSoft** |
| **Odontóloga responsable** | Dra. EM |
| **Ubicación planeada** | Bogotá D.C., Colombia |
| **Estado del negocio** | En proceso de independización (apertura próxima) |
| **Experiencia profesional** | 12 años ejerciendo odontología en clínicas del sector |
| **Personal previsto** | 1 odontóloga (fundadora) + 1 recepcionista + 1 administrador |
| **Uso previo de software** | Usuaria experta de sistemas profesionales de gestión odontológica durante toda su trayectoria |

### 2.1. Motivación del Proyecto

La Dra. EM ha decidido independizarse tras 12 años de ejercicio profesional en clínicas del sector, donde ha utilizado de manera continua software profesional de gestión odontológica. Como parte de su plan de independización requiere un sistema propio adaptado a las particularidades de su nueva práctica:

- Consultorio de estructura reducida (una odontóloga + apoyo administrativo).
- Sin dependencia de licencias de software de terceros que impliquen costos recurrentes.
- Control total sobre sus datos clínicos y administrativos.
- Interfaz enfocada en el flujo de trabajo específico que ella ha optimizado durante años.

Esta motivación configura un caso técnicamente favorable: la cliente **ya sabe con precisión qué necesita**, y su rol en el proyecto es principalmente el de **transferir su conocimiento profesional acumulado** al equipo desarrollador.

---

## 3. METODOLOGÍA DE LEVANTAMIENTO DE INFORMACIÓN

Se combinaron **tres técnicas de recolección** con propósitos complementarios:

| Técnica | Propósito | Fuente |
|---|---|---|
| **Entrevista semiestructurada** | Comprender la visión estratégica, funcionalidades imprescindibles según su criterio profesional, y expectativas para el nuevo consultorio | Dra. EM |
| **Análisis de experiencia profesional previa** | Identificar el estándar de funcionalidades del sector odontológico que la cliente considera imprescindibles y aquellas que quiere simplificar | Conocimiento acumulado de la cliente |
| **Observación directa** | Documentar el flujo real de trabajo diario en un consultorio odontológico para validar los hallazgos de la entrevista | Jornada de acompañamiento profesional |

### 3.1. Justificación de la Metodología

La selección de estos tres instrumentos responde a las particularidades del caso:

- **La entrevista** captura la visión estratégica y las prioridades personales de la cliente.
- **El análisis de experiencia previa** aprovecha los 12 años de trayectoria profesional como fuente autorizada de requisitos, en lugar de partir del vacío como en proyectos con clientes sin conocimiento tecnológico.
- **La observación directa** valida en la práctica lo declarado en la entrevista y detecta detalles operativos que la cliente puede haber dado por obvios.

Esta combinación ofrece una **visión 360°**: la estratégica (entrevista), la técnica-profesional (análisis de experiencia), y la operativa (observación).

### 3.2. Cronograma de Aplicación

| Instrumento | Modalidad | Duración |
|---|---|---|
| Entrevista semiestructurada | Presencial | 60 minutos |
| Análisis de experiencia profesional previa | Sesión guiada de trabajo colaborativo | 90 minutos |
| Observación directa | Acompañamiento en jornada laboral típica de la cliente en su lugar de trabajo actual | 4 horas |

---

## 4. INSTRUMENTO 1 — ENTREVISTA SEMIESTRUCTURADA A LA CLIENTE

*Aplicada a la Dra. EM, odontóloga con 12 años de experiencia profesional. La entrevista se estructuró en cinco bloques temáticos.*

### Bloque 1 — Trayectoria profesional y contexto

**Pregunta 1. Cuéntenos brevemente su trayectoria profesional y el momento actual de su carrera.**

> Respuesta: "Soy odontóloga general con 12 años de experiencia. He trabajado en tres clínicas distintas en Bogotá durante estos años y en todas he manejado software profesional de gestión odontológica. Ahora quiero dar el paso a mi propia consulta independiente porque siento que ya tengo la experiencia y el flujo de trabajo claros. Quiero un sistema que sea mío, adaptado a mi forma de trabajar, sin depender de una plataforma externa con costos mensuales."

**Pregunta 2. ¿Qué le motiva específicamente a tener un sistema propio y no simplemente contratar un servicio comercial existente?**

> Respuesta: "Tres razones. Primera, el costo: los sistemas del sector cobran entre 200.000 y 500.000 pesos mensuales, y para un consultorio que empieza es una carga. Segunda, la personalización: las plataformas son genéricas, tienen módulos que no necesito y me faltan detalles que quiero. Tercera, la propiedad de los datos: quiero que la historia clínica de mis pacientes esté en un sistema que yo controle, no rentado."

### Bloque 2 — Funcionalidades imprescindibles según su experiencia

**Pregunta 3. Basándose en su experiencia profesional, ¿cuáles son las funcionalidades absolutamente imprescindibles en un sistema de gestión odontológica?**

> Respuesta: "Después de 12 años lo tengo muy claro. Imprescindibles son: la ficha del paciente completa con datos personales y de contacto; la agenda visual con detección automática de choques de horario; la historia clínica digital con odontograma interactivo y evoluciones cronológicas; el registro de facturas y pagos con control de saldos; el inventario de materiales; los recordatorios automáticos a pacientes; los reportes financieros mensuales; y la generación de archivos RIPS para el reporte al Ministerio."

**Pregunta 4. Del odontograma, ¿qué es lo que más valora en su experiencia?**

> Respuesta: "Que sea clickeable, que pueda marcar por superficie (oclusal, vestibular, lingual, mesial, distal), y que la información quede ligada a la evolución del día. También que muestre visualmente el estado de cada diente con colores diferentes. Es el corazón de la historia clínica."

**Pregunta 5. ¿Y la agenda? ¿Qué considera crítico?**

> Respuesta: "Vista diaria por odontólogo, con las citas de cada hora claramente marcadas. Detección de conflictos: que el sistema no me deje agendar dos citas a la misma hora. Estados visibles: programada, confirmada, en atención, finalizada, cancelada, no asistió. Y que se pueda mover una cita fácilmente cuando hay que reprogramar."

### Bloque 3 — Funcionalidades que quiere simplificar o eliminar

**Pregunta 6. En su experiencia con sistemas profesionales, ¿qué funcionalidades le parecen excesivas o innecesarias para el caso de un consultorio individual como el suyo?**

> Respuesta: "Muchos sistemas incluyen módulos de multi-sede, integración con laboratorios dentales, campañas de marketing, portal del paciente con app móvil, videollamada integrada... Para mi caso todo eso sobra. Yo necesito lo esencial bien hecho, no cien funcionalidades a medias."

**Pregunta 7. ¿Considera necesario integrar facturación electrónica DIAN desde el inicio?**

> Respuesta: "No al inicio. Es un componente complejo, con costos adicionales de proveedor autorizado, y por el volumen de facturación que tendré al principio no se justifica. Podría agregarse en una segunda fase cuando el consultorio esté consolidado. Por ahora manejo facturas internas y punto."

### Bloque 4 — Adaptaciones al nuevo contexto

**Pregunta 8. ¿Cómo será la operación diaria del consultorio en términos de personal?**

> Respuesta: "Tres personas: yo como odontóloga, una recepcionista para agenda y cobros, y un administrador que ayudará con la contabilidad y los reportes. Cada uno tendrá funciones distintas, así que necesito que el sistema controle bien los permisos de cada rol. Por ejemplo, la recepcionista no debe ver historias clínicas, y el administrador no debe registrar procedimientos."

**Pregunta 9. ¿Qué reportes considera esenciales?**

> Respuesta: "Ingresos del mes, pacientes con saldo pendiente, tratamientos más realizados, tasa de asistencia y RIPS mensual. Con esos cinco reportes tengo cubierto el 90% de las decisiones gerenciales."

**Pregunta 10. ¿Le gustaría que el sistema envíe recordatorios a los pacientes?**

> Respuesta: "Sí, es fundamental. WhatsApp de preferencia porque es lo que usa la gente, pero también correo electrónico para los pacientes formales. El día antes de la cita es lo ideal. En mi experiencia esto reduce el ausentismo entre 20% y 30%."

### Bloque 5 — Visión de mediano y largo plazo

**Pregunta 11. ¿Cómo se ve el consultorio en 2 años?**

> Respuesta: "Consolidado, con base de pacientes fieles, quizás con un odontólogo asociado. El sistema debe permitir crecer sin refactorizar todo. Si mañana contrato otro odontólogo, tengo que poder agregarlo sin problema."

**Pregunta 12. ¿Prefiere que el sistema esté en la nube o instalado localmente?**

> Respuesta: "En la nube absolutamente. Los sistemas locales están obsoletos, dependes del computador físico, no tienes respaldo automático, no puedes trabajar desde casa si necesitas. La nube es lo estándar y lo seguro."

**Pregunta 13. ¿Está dispuesta a participar activamente durante el desarrollo?**

> Respuesta: "Sí, estoy disponible para reuniones semanales de 30 minutos para revisar avances y ajustar detalles. Es mi propio negocio, así que me importa que quede bien hecho."

**Pregunta 14. ¿Qué considera crítico que el sistema no haga mal?**

> Respuesta: "Perder información clínica o financiera. Un dato clínico perdido es un problema legal potencial. Un pago mal registrado es plata perdida. Confiabilidad de los datos por encima de todo."

**Pregunta 15. ¿Cuál sería su indicador de éxito del proyecto?**

> Respuesta: "Que a los 6 meses de apertura pueda operar cómodamente todo el consultorio con este sistema, sin extrañar las plataformas que usé antes. Que la eficiencia sea igual o mejor. Y que los pacientes noten la profesionalización — recordatorios que llegan, facturas bien emitidas, historia clínica organizada."

---

## 5. INSTRUMENTO 2 — ANÁLISIS DE EXPERIENCIA PROFESIONAL PREVIA

*Sesión guiada de trabajo colaborativo con la cliente para sistematizar su conocimiento profesional acumulado sobre software del sector odontológico. Este instrumento se distingue de la entrevista porque se enfoca específicamente en el análisis funcional-comparativo, con base en su experiencia como usuaria durante 12 años.*

### 5.1. Objetivo del Instrumento

Aprovechar la experiencia profesional de la cliente como fuente autorizada de requisitos, evitando el ciclo tradicional de descubrimiento por prueba y error. Se busca responder con precisión:

- ¿Qué funcionalidades del estándar del sector considera imprescindibles?
- ¿Qué funcionalidades del estándar considera prescindibles para su caso?
- ¿Qué adaptaciones específicas requiere su nuevo contexto?

### 5.2. Metodología Aplicada

Sesión de 90 minutos estructurada en 9 dominios funcionales (uno por cada módulo previsto del sistema). Para cada dominio, la cliente enumeró:

1. **Funcionalidades del estándar del sector** que conoce por experiencia.
2. **Nivel de uso personal** de cada funcionalidad (diario / semanal / mensual / nunca).
3. **Adaptación específica** que requiere para su nuevo consultorio.

### 5.3. Consolidado de Hallazgos por Dominio

#### Dominio 1 — Gestión de Pacientes

| Funcionalidad del estándar | Uso personal | Decisión para OdontoSoft |
|---|:---:|---|
| Registro con datos personales completos | Diario | Se incluye |
| Búsqueda por nombre o documento | Diario | Se incluye |
| Ficha detallada con datos de contacto y salud | Diario | Se incluye |
| Fotografía del paciente | Semanal | Se incluye |
| Portal del paciente con app móvil | Nunca | Se descarta (fuera de alcance inicial) |
| Encuestas de satisfacción digitales | Nunca | Se descarta |

#### Dominio 2 — Agenda y Citas

| Funcionalidad del estándar | Uso personal | Decisión para OdontoSoft |
|---|:---:|---|
| Vista diaria por odontólogo | Diario | Se incluye |
| Detección de conflictos de horario | Diario | Se incluye |
| Estados de cita (programada, confirmada, etc.) | Diario | Se incluye |
| Reasignación de citas | Semanal | Se incluye |
| Vista semanal y mensual | Semanal | Se incluye (versión simple) |
| Sincronización con Google Calendar externo | Nunca | Se descarta |

#### Dominio 3 — Historia Clínica y Odontograma

| Funcionalidad del estándar | Uso personal | Decisión para OdontoSoft |
|---|:---:|---|
| Odontograma interactivo por superficie | Diario | Se incluye (crítico) |
| Evoluciones clínicas cronológicas | Diario | Se incluye |
| Antecedentes médicos y alergias | Diario | Se incluye |
| Adjuntos (radiografías, fotos) | Diario | Se incluye |
| Plantillas de tratamiento predefinidas | Mensual | Se pospone a fase 2 |
| Integración con software de imágenes 3D | Nunca | Se descarta |

#### Dominio 4 — Facturación y Pagos

| Funcionalidad del estándar | Uso personal | Decisión para OdontoSoft |
|---|:---:|---|
| Facturación interna con ítems múltiples | Diario | Se incluye |
| Registro de pagos parciales o totales | Diario | Se incluye |
| Múltiples métodos de pago | Diario | Se incluye |
| PDF descargable de factura | Diario | Se incluye |
| Anulación con motivo | Semanal | Se incluye |
| Facturación electrónica DIAN | Semanal | Se descarta al inicio (fase 2) |
| Pasarela de pagos en línea | Nunca | Se descarta (fase 2) |

#### Dominio 5 — Inventario

| Funcionalidad del estándar | Uso personal | Decisión para OdontoSoft |
|---|:---:|---|
| Registro de materiales con stock | Diario | Se incluye |
| Alertas de stock bajo | Semanal | Se incluye |
| Movimientos de entrada y salida | Diario | Se incluye |
| Integración con proveedores | Nunca | Se descarta |
| Códigos de barras | Nunca | Se descarta |

#### Dominio 6 — Recordatorios

| Funcionalidad del estándar | Uso personal | Decisión para OdontoSoft |
|---|:---:|---|
| Recordatorios automáticos por email | Diario | Se incluye |
| Recordatorios por WhatsApp | Diario | Se incluye (simulado en fase 1) |
| Recordatorios por SMS | Semanal | Se descarta (WhatsApp lo reemplaza) |
| Plantillas personalizables | Mensual | Se incluye |
| Confirmación bidireccional del paciente | Semanal | Se pospone a fase 2 |

#### Dominio 7 — Reportes

| Funcionalidad del estándar | Uso personal | Decisión para OdontoSoft |
|---|:---:|---|
| Ingresos del mes | Mensual (crítico) | Se incluye |
| Pacientes con saldo pendiente | Mensual (crítico) | Se incluye |
| Tratamientos más realizados | Mensual | Se incluye |
| Tasa de asistencia | Mensual | Se incluye |
| Pacientes nuevos por mes | Mensual | Se incluye |
| Reportes de rentabilidad por procedimiento | Nunca | Se descarta |
| Dashboard con predicciones | Nunca | Se descarta |

#### Dominio 8 — Integración RIPS

| Funcionalidad del estándar | Uso personal | Decisión para OdontoSoft |
|---|:---:|---|
| Generación de archivo RIPS JSON | Mensual (obligatorio legal) | Se incluye |
| Validación de completitud antes de generar | Mensual | Se incluye |
| Histórico de archivos generados | Mensual | Se incluye |
| Radicación automática al MUV | Mensual | Se descarta (radicación manual) |

#### Dominio 9 — Seguridad y Roles

| Funcionalidad del estándar | Uso personal | Decisión para OdontoSoft |
|---|:---:|---|
| Roles diferenciados por función | Diario | Se incluye (ADMIN, ODONTOLOGO, RECEPCIONISTA) |
| Autenticación con contraseña | Diario | Se incluye |
| Registro de auditoría | Semanal | Se incluye |
| Autenticación biométrica | Nunca | Se descarta |
| Autenticación de dos factores (2FA) | Nunca | Se pospone a fase 2 |

### 5.4. Conclusión del Análisis

Del análisis surge un principio orientador del proyecto:

> **"Menos funcionalidades, mejor implementadas."**

La cliente prefiere un sistema **con el 40% de las funcionalidades del estándar del sector, pero con esa parte perfectamente hecha**, que un sistema con el 100% de las funcionalidades pero con partes inconsistentes. Esta filosofía orienta las decisiones de alcance del proyecto.

---

## 6. INSTRUMENTO 3 — OBSERVACIÓN DIRECTA DEL FLUJO DE TRABAJO ACTUAL

*Se acompañó a la Dra. EM durante una jornada laboral típica de 4 horas en su lugar de trabajo actual, observando su interacción con el software profesional que utiliza y su rutina operativa. Este instrumento sirve para validar y complementar los hallazgos de la entrevista y del análisis de experiencia.*

### 6.1. Observaciones Registradas

**Sobre el uso de la agenda:**

- La cliente consulta la agenda del día al iniciar su jornada, en promedio 8-10 veces.
- Actualiza el estado de cada cita (confirmada → en atención → finalizada) en tiempo real.
- Cuando hay una cancelación, la reasignación de la hora libre se resuelve en menos de 2 minutos.

**Sobre el manejo de la historia clínica:**

- Antes de atender a un paciente, revisa sus antecedentes durante 1-2 minutos.
- Durante la consulta, marca hallazgos en el odontograma directamente.
- Al finalizar, escribe la evolución del día — texto entre 3 y 8 líneas.
- Al mes atiende aproximadamente 80-100 pacientes, con un promedio de 2 evoluciones por paciente.

**Sobre facturación y cobros:**

- La facturación se realiza al final de la consulta, con el paciente todavía en el consultorio.
- Los pagos parciales son frecuentes: aproximadamente 40% de las facturas se pagan en 2 o 3 abonos.
- El método de pago más común es tarjeta débito, seguido de efectivo y transferencia.

**Sobre el inventario:**

- Actualmente en el consultorio donde trabaja, el inventario lo maneja un auxiliar dedicado.
- La cliente considera que en su consultorio propio esta tarea la asumirá inicialmente la recepcionista.
- La alerta de stock bajo se recibe por correo en el sistema actual.

**Sobre los recordatorios:**

- El sistema actual envía recordatorios automáticos por WhatsApp y email 24 horas antes.
- Ella nota que aproximadamente 15% de los pacientes responden confirmando.
- Aproximadamente 5% de las citas resultan en no asistencia (ausentismo).

### 6.2. Detalles Detectados por Observación (no verbalizados en entrevista)

Durante la observación se detectaron algunos aspectos que la cliente daba por obvios y no mencionó en la entrevista:

- **Búsqueda insensible a tildes:** la cliente busca a "María" escribiendo "Maria" y espera que el sistema encuentre ambas variantes.
- **Búsqueda parcial por documento:** ingresa solo los últimos 4 dígitos y espera que el sistema encuentre coincidencias.
- **Ordenamiento cronológico de evoluciones:** siempre lee de la más reciente a la más antigua.
- **Vista compacta del odontograma:** prefiere una vista donde vea los 32 dientes en pantalla sin scroll.

Estos hallazgos se documentan como **requisitos derivados** que enriquecen el sistema.

---

## 7. CONSOLIDACIÓN DE HALLAZGOS

A partir del cruce de los tres instrumentos, se identifican los siguientes ejes que el sistema deberá resolver:

| Eje identificado | Fuente | Prioridad |
|---|---|:---:|
| Gestión completa de pacientes con búsqueda avanzada | Entrevista P3 + Observación 6.2 | Alta |
| Agenda visual con detección de conflictos | Entrevista P5 + Observación 6.1 | Alta |
| Historia clínica con odontograma interactivo por superficie | Entrevista P4 + Análisis Dominio 3 | Crítica |
| Evoluciones cronológicas con adjuntos | Análisis Dominio 3 + Observación 6.1 | Alta |
| Facturación con múltiples pagos parciales | Análisis Dominio 4 + Observación 6.1 | Alta |
| Control de inventario con alertas | Entrevista P3 + Análisis Dominio 5 | Media |
| Recordatorios automáticos 24 horas antes | Entrevista P10 + Análisis Dominio 6 | Alta |
| Reportes gerenciales financieros y clínicos | Entrevista P9 + Análisis Dominio 7 | Alta |
| Generación de archivo RIPS mensual | Entrevista P3 + Análisis Dominio 8 | Alta (obligatorio legal) |
| Roles diferenciados por función | Entrevista P8 + Análisis Dominio 9 | Alta |
| Alojamiento en la nube con respaldo automático | Entrevista P12 | Alta |
| Sin dependencia de licencias externas recurrentes | Entrevista P2 | Alta |

Adicionalmente se identifican **decisiones de alcance ya validadas con la cliente**:

- Facturación electrónica DIAN: **excluida al inicio**, pospuesta a fase 2.
- Radicación automática RIPS: **excluida**, radicación manual.
- Portal del paciente y app móvil: **excluidos** al inicio.
- Videollamada y teleodontología: **excluidas**.
- Integración con laboratorios y proveedores: **excluida**.
- WhatsApp: **simulado en fase 1**, integración real pospuesta a fase 2.

---

## 8. CONCLUSIONES

La aplicación de los tres instrumentos (entrevista semiestructurada, análisis de experiencia profesional previa y observación directa) permitió obtener una comprensión precisa y de alta calidad de los requisitos del sistema OdontoSoft.

El caso presenta una **ventaja metodológica poco común**: la cliente cuenta con 12 años de experiencia como usuaria activa de software profesional del sector, lo que reduce significativamente el margen de error en la definición de requisitos. En lugar de un proceso exploratorio típico (donde el analista debe descubrir necesidades no verbalizadas), se realizó un proceso de **captura estructurada del conocimiento profesional acumulado**.

Los hallazgos son consistentes entre los tres instrumentos y traducibles a módulos concretos del sistema:

| Eje identificado | Módulo del sistema propuesto |
|---|---|
| Gestión de pacientes | Módulo 2 — Pacientes |
| Agenda con detección de conflictos | Módulo 3 — Agenda y Citas |
| Historia clínica y odontograma | Módulo 4 — Historia Clínica |
| Facturación y pagos parciales | Módulo 5 — Facturación |
| Inventario con alertas | Módulo 6 — Inventario |
| Recordatorios automáticos | Módulo 7 — Recordatorios |
| Reportes gerenciales | Módulo 8 — Reportes |
| Generación de RIPS | Módulo 9 — Integración RIPS |
| Roles diferenciados | Módulo 1 — Autenticación y Roles |

Estos hallazgos constituyen el insumo directo para la elaboración del **Informe de Requisitos Funcionales y No Funcionales** (documento independiente).

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
