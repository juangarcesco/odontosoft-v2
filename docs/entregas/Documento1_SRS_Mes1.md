# SERVICIO NACIONAL DE APRENDIZAJE — SENA

**Etapa Productiva — Modalidad Proyecto Productivo**

*Competencia Técnica: Análisis y Desarrollo de Software*

---

## DOCUMENTO 1 — MES 1
# Especificación de Requisitos de Software (SRS) e Inicio del Proyecto

**Proyecto:** OdontoSoft — Sistema de Gestión Clínica Odontológica

**Cliente:** Consultorio Odontológico OdontoSalud (Bogotá D.C.)

**Aprendiz:** `[NOMBRE COMPLETO DEL APRENDIZ]`

**Ficha SENA:** `[NÚMERO DE FICHA]`

**Instructor:** `[NOMBRE DEL INSTRUCTOR]`

**Fecha de entrega:** `[FECHA DE ENTREGA]`

---

## Contenido

1. Introducción
2. Alcance del Proyecto y Enfoque MEAN
3. Metodología de Recolección de Información
4. Instrumentos de Recolección Aplicados
   - 4.1. Entrevista Semiestructurada al Cliente
   - 4.2. Encuesta de Satisfacción Interna al Personal
5. Consolidación de Hallazgos
6. Definición de Roles de Usuario
7. Requisitos Funcionales (RF)
8. Requisitos No Funcionales (RNF)
9. Reglas de Negocio (RN)
10. Aprobación Formal del Alcance

---

## 1. Introducción

El presente documento constituye la Especificación de Requisitos de Software (SRS) del proyecto **OdontoSoft**, desarrollado en el marco de la etapa productiva del programa de Análisis y Desarrollo de Software del SENA, bajo la modalidad de Proyecto Productivo.

OdontoSoft es un sistema de gestión clínica odontológica diseñado para digitalizar los procesos administrativos, clínicos y financieros de consultorios de mediano tamaño. El proyecto se aborda con el stack tecnológico **MEAN** (MongoDB, Express, Angular, Node.js), aplicando una arquitectura basada en JavaScript de extremo a extremo, coherente con la Guía de Aprendizaje 1 (Construcción de requisitos).

Este documento recoge los resultados de la fase inicial del proyecto: identificación del cliente y sus necesidades, aplicación de instrumentos de recolección de información, consolidación de requisitos funcionales y no funcionales, definición de roles de usuario, y aprobación formal del alcance por parte del cliente.

---

## 2. Alcance del Proyecto y Enfoque MEAN

### 2.1. Descripción General del Producto

OdontoSoft es una aplicación web accesible desde navegador, orientada al personal administrativo y clínico de un consultorio odontológico. Permite gestionar pacientes, agenda de citas, historia clínica con odontograma, facturación, inventario de materiales, recordatorios automáticos, reportes gerenciales y generación de archivos RIPS conforme a la normativa colombiana (Resolución 948 de 2026).

### 2.2. Enfoque en el Stack MEAN

La elección del stack MEAN responde a los siguientes criterios técnicos:

- **MongoDB** (base de datos NoSQL): permite modelar entidades complejas como la historia clínica y el odontograma como documentos embebidos, evitando joins costosos y aprovechando la estructura natural del dominio.
- **Express.js**: framework minimalista para construir la API REST del backend, con middleware modular para autenticación, autorización, subida de archivos y manejo de errores.
- **Angular**: framework robusto para el desarrollo del frontend, con enrutamiento, formularios reactivos, componentes standalone y arquitectura basada en signals (Angular 20+).
- **Node.js**: entorno de ejecución JavaScript en el servidor, con un ecosistema maduro para procesamiento de imágenes (Sharp), generación de PDF/Excel (PDFKit, ExcelJS), envío de correos (Nodemailer) y tareas programadas (node-cron).

La homogeneidad del lenguaje (JavaScript/TypeScript) en todas las capas del sistema acelera el desarrollo, reduce la curva de aprendizaje y facilita el mantenimiento.

### 2.3. Delimitaciones del Proyecto

El proyecto contempla explícitamente las siguientes exclusiones de alcance, coherentes con la naturaleza académica de la etapa productiva:

- El envío automático al Mecanismo Único de Validación (MUV) del Ministerio de Salud y la obtención del Código Único de Validación (CUV) requieren facturación electrónica DIAN — fuera del alcance de este proyecto.
- El envío de mensajes por WhatsApp se implementa como simulación, con una interfaz reemplazable por un proveedor real (Twilio u otro) sin modificar el resto del sistema.
- El envío de correos electrónicos se realiza mediante Ethereal (servidor SMTP de pruebas), reemplazable por un proveedor definitivo en producción.
- El almacenamiento de archivos adjuntos (radiografías, evidencias fotográficas) se realiza en el disco local del servidor, no en un servicio en la nube.

---

## 3. Metodología de Recolección de Información

La construcción de los requisitos partió de una fase de análisis de contexto, en la cual se identificaron los actores involucrados en el consultorio odontológico y sus necesidades. Se aplicaron dos instrumentos complementarios de recolección de información:

### 3.1. Instrumentos Aplicados

| Instrumento | Población objetivo | Propósito |
|---|---|---|
| Entrevista semiestructurada | Odontólogo propietario del consultorio | Comprender la visión estratégica, las necesidades funcionales críticas y las expectativas de negocio |
| Encuesta de satisfacción interna | Personal operativo (recepcionista y auxiliar administrativo) | Identificar los "dolores" reales de los procesos manuales actuales y priorizar mejoras |

### 3.2. Contexto del Cliente

| Aspecto | Detalle |
|---|---|
| **Nombre del consultorio** | Consultorio Odontológico OdontoSalud |
| **Ubicación** | Bogotá D.C., Colombia |
| **Tipo de práctica** | Odontología general con pacientes ambulatorios |
| **Personal actual** | 1 odontólogo propietario, 1 recepcionista, 1 auxiliar administrativo |
| **Volumen aproximado** | Entre 15 y 25 pacientes atendidos por semana |
| **Estado tecnológico previo** | Procesos manuales sobre papel y hoja de cálculo básica |

---

## 4. Instrumentos de Recolección Aplicados

### 4.1. Entrevista Semiestructurada al Cliente

*Aplicada al odontólogo propietario del consultorio, con aproximadamente 15 años de experiencia. La entrevista se estructuró en cuatro bloques temáticos: procesos actuales, principales dificultades, expectativas del sistema y visión a mediano plazo.*

#### Bloque 1 — Procesos actuales

**Pregunta 1. ¿Cómo se registra actualmente la información de los pacientes?**

Respuesta: "Tenemos una carpeta física por paciente. Cada vez que llega alguien nuevo, la recepcionista abre una carpeta con datos básicos y una historia clínica en papel. El problema es que cuando el paciente vuelve al año siguiente, a veces no encontramos la carpeta o tenemos varias con el mismo nombre."

**Pregunta 2. ¿Cómo agendan las citas?**

Respuesta: "Todo en una agenda de papel dividida por horas. Si una cita se mueve, hay que borrar con corrector. Si dos personas piden la misma hora, no me doy cuenta hasta que llegan las dos."

**Pregunta 3. ¿Cómo llevan el registro clínico durante las consultas?**

Respuesta: "Escribo a mano lo que hago cada sesión en la hoja del paciente. Los dientes los marco con un dibujito de la boca que hicimos hace años en fotocopia. No es lo ideal, pero es lo que hay."

#### Bloque 2 — Principales dificultades

**Pregunta 4. ¿Cuál es el mayor problema del sistema actual?**

Respuesta: "La búsqueda. Si necesito ver qué tratamiento le hice a un paciente hace dos años, puedo demorar diez minutos revolviendo carpetas. También pierdo dinero: hay pacientes que quedan debiendo saldos y sin registro digital nunca les cobro."

**Pregunta 5. ¿Cómo manejan la facturación y los pagos?**

Respuesta: "Escribo la factura a mano en una cuadernilla numerada. Los abonos los apunto en la misma factura. A fin de mes, sacar cuentas del ingreso real es un lío."

**Pregunta 6. ¿Y el inventario de materiales?**

Respuesta: "No hay control. Compramos cuando se acaba algo y a veces se acaba en medio de una consulta. Ha pasado."

#### Bloque 3 — Expectativas del sistema

**Pregunta 7. ¿Qué es lo primero que le gustaría poder hacer con el sistema?**

Respuesta: "Buscar un paciente por nombre o cédula y verlo todo: sus datos, su historia, sus tratamientos, lo que debe. Todo en una pantalla."

**Pregunta 8. ¿Considera importante controlar quién puede ver o modificar qué información?**

Respuesta: "Fundamental. La recepcionista no tiene que ver historias clínicas. Yo no tengo que estar registrando pagos. Cada uno con su rol."

**Pregunta 9. ¿Qué reportes le serían útiles al final del mes?**

Respuesta: "Cuánto entró de dinero, quién me debe, cuántos pacientes nuevos llegaron, y de vez en cuando qué procedimientos son los más frecuentes para planear compras."

**Pregunta 10. ¿Le gustaría que el sistema envíe recordatorios automáticos a los pacientes?**

Respuesta: "Sí, especialmente por WhatsApp que es lo que usa la gente. También correo para los que son más formales. El día antes de la cita estaría bien."

#### Bloque 4 — Visión a mediano plazo

**Pregunta 11. ¿Piensa cumplir con la generación de RIPS ante el Ministerio?**

Respuesta: "Sí, lo he estado postergando por lo complicado del formato JSON. Si el sistema me lo genera, sería un alivio enorme."

**Pregunta 12. ¿Prefiere que el sistema viva en la nube o en el computador del consultorio?**

Respuesta: "En la nube. Si el disco duro se daña, no pierdo años de trabajo. Además me gustaría poder ver la agenda desde el celular en casa."

**Pregunta 13. ¿Está dispuesto a cambiar sus procesos actuales para adaptarse al sistema?**

Respuesta: "Sí, sé que va a ser un ajuste, pero el sistema actual me tiene bloqueado. Necesito modernizarme."

**Pregunta 14. ¿Qué considera crítico que el sistema NO haga mal?**

Respuesta: "Perder información. Si algo se guarda mal o desaparece un dato clínico, perdería la confianza al instante."

**Pregunta 15. ¿Cuál sería su indicador de éxito del proyecto en 6 meses?**

Respuesta: "Cerrar carpetas físicas. Que todo esté en el sistema. Y que yo pueda ver ingresos reales del mes con dos clics."

### 4.2. Encuesta de Satisfacción Interna al Personal

*Aplicada al personal operativo (recepcionista y auxiliar administrativo). Modalidad: cuestionario escrito con preguntas cerradas de escala 1-5 y espacio para comentarios libres.*

#### Consolidado de respuestas (2 encuestados)

| Aspecto evaluado | Recepcionista | Auxiliar | Promedio |
|---|:---:|:---:|:---:|
| Facilidad para encontrar historial de pacientes (1: muy difícil, 5: muy fácil) | 2 | 2 | 2.0 |
| Tiempo requerido para registrar una cita nueva | 3 | 3 | 3.0 |
| Confiabilidad del control de saldos pendientes | 1 | 2 | 1.5 |
| Control real del inventario de materiales | 1 | 1 | 1.0 |
| Facilidad para consultar reportes financieros | 2 | 1 | 1.5 |
| Riesgo percibido de pérdida de información | 5 | 5 | 5.0 |
| Interés en tener el sistema digital | 5 | 5 | 5.0 |

#### Comentarios libres

> *Recepcionista:* "Necesitamos poder buscar rápido y confirmar citas sin llamar una por una. Los recordatorios automáticos serían un cambio enorme."

> *Auxiliar administrativo:* "El inventario es crítico. Muchas veces he tenido que salir de urgencia a comprar un anestésico o una fresa porque no nos dimos cuenta que se había acabado. Un sistema que avise sería vital."

---

## 5. Consolidación de Hallazgos

A partir de los dos instrumentos aplicados, se identificaron los siguientes ejes problemáticos que el sistema debe abordar:

| Eje problemático | Impacto identificado | Módulo del sistema que lo resuelve |
|---|---|---|
| Búsqueda ineficiente de pacientes | Hasta 10 minutos por consulta manual; pérdida de historia clínica; duplicidad de carpetas | Módulo 2 (Pacientes) y Módulo 4 (Historia Clínica) |
| Conflictos de agenda no detectados | Sobreagendamientos; pacientes molestos; pérdida de tiempo del odontólogo | Módulo 3 (Agenda / Citas) |
| Pérdida financiera por saldos no registrados | Impacto directo en ingresos; imposibilidad de proyectar ingresos reales | Módulo 5 (Facturación y Pagos) |
| Inventario sin control | Interrupción de consultas por falta de material; compras de emergencia con sobrecosto | Módulo 6 (Inventario) |
| Ausentismo por olvido de citas | Consultas no aprovechadas; ingresos no realizados; agenda desbalanceada | Módulo 7 (Recordatorios Automáticos) |
| Sin visibilidad gerencial | Imposibilidad de tomar decisiones basadas en datos; no se conocen procedimientos frecuentes | Módulo 8 (Reportes y Estadísticas) |
| Incumplimiento normativo RIPS | Riesgo regulatorio; imposibilidad de reportar al Ministerio de Salud | Módulo 9 (Integración RIPS) |
| Falta de control de acceso | Riesgo de privacidad de datos clínicos; sin trazabilidad de acciones | Módulo 1 (Autenticación y Roles) |

---

## 6. Definición de Roles de Usuario

Se identificaron tres roles principales de usuario que interactuarán con la plataforma, coherentes con el organigrama del consultorio y con el principio de mínimo privilegio (RNF de seguridad):

### 6.1. Rol ADMIN (Administrador)

- Corresponde al odontólogo propietario o al gerente del consultorio.
- Responsable de la configuración general del sistema, gestión de usuarios y consulta de reportes.
- Puede desactivar evoluciones clínicas erróneas (RN-10) — última línea de auditoría.
- Acceso de lectura sobre todos los módulos operativos.

### 6.2. Rol ODONTOLOGO

- Corresponde al profesional que realiza la atención clínica directa.
- Acceso exclusivo a la historia clínica y odontograma de los pacientes.
- Puede consultar la agenda, actualizar el estado de las citas y consultar reportes clínicos.
- Sin acceso a información financiera ni administrativa.

### 6.3. Rol RECEPCIONISTA

- Corresponde al personal administrativo y de atención al cliente.
- CRUD completo sobre pacientes, citas, facturación, inventario y recordatorios.
- Genera archivos RIPS.
- Sin acceso a la historia clínica (RN privacidad).

### 6.4. Matriz Consolidada de Permisos por Módulo

| Módulo | ADMIN | ODONTOLOGO | RECEPCIONISTA |
|---|:---:|:---:|:---:|
| Usuarios y configuración | CRUD | — | — |
| Pacientes | Lectura | Lectura | CRUD |
| Citas y agenda | Lectura | Lectura / Estados | CRUD |
| Historia clínica y odontograma | Desactivar evoluciones | CRUD | Sin acceso |
| Facturación y pagos | Lectura | Lectura | CRUD |
| Inventario | Lectura | Sin acceso | CRUD |
| Recordatorios | Lectura | Sin acceso | CRUD |
| Reportes financieros/administrativos | Lectura | Sin acceso | Lectura |
| Reportes clínicos | Lectura | Lectura | Sin acceso |
| RIPS | Lectura y generación | Sin acceso | CRUD |

---

## 7. Requisitos Funcionales (RF)

El sistema OdontoSoft se organiza en 9 módulos que agrupan un total de 59 requisitos funcionales:

| Código | Módulo | Descripción |
|---|---|---|
| **RF-01** | Autenticación | Iniciar sesión con email y contraseña; generar JWT |
| **RF-02** | Autenticación | Cerrar sesión invalidando el token |
| **RF-03** | Autenticación | Encriptar contraseñas con bcrypt |
| **RF-04** | Autenticación | Validar el token en cada petición protegida |
| **RF-05** | Autenticación | Rechazar acceso con token inválido o expirado |
| **RF-06** | Autenticación | Restringir el acceso a rutas según el rol del usuario |
| **RF-07** | Autenticación | Registrar cada intento de acceso en logs de auditoría |
| **RF-08** | Autenticación | Persistir la sesión en el frontend hasta expiración o cierre |
| **RF-09** | Pacientes | Crear un paciente con datos personales completos |
| **RF-10** | Pacientes | Consultar el listado de pacientes con paginación |
| **RF-11** | Pacientes | Buscar pacientes por nombre, apellido o documento |
| **RF-12** | Pacientes | Ver el detalle completo de un paciente |
| **RF-13** | Pacientes | Editar los datos de un paciente |
| **RF-14** | Pacientes | Desactivar un paciente (RN-02: no eliminación física) |
| **RF-15** | Pacientes | Validar unicidad de tipo + número de documento |
| **RF-16** | Pacientes | Registrar quién creó y última actualización de cada paciente |
| **RF-17** | Citas | Crear una cita indicando paciente, odontólogo, fecha y duración |
| **RF-18** | Citas | Consultar la agenda por día y por odontólogo |
| **RF-19** | Citas | Detectar automáticamente conflictos de horario (RN-01) |
| **RF-20** | Citas | Actualizar el estado de una cita (Programada, Confirmada, Finalizada, etc.) |
| **RF-21** | Citas | Reasignar una cita a otra fecha u odontólogo |
| **RF-22** | Citas | Cancelar una cita registrando motivo |
| **RF-23** | Citas | Impedir citas fuera del horario del consultorio (RN-07) |
| **RF-24** | Citas | Ver las citas del día en el dashboard principal |
| **RF-25** | Historia Clínica | Crear la historia clínica única de un paciente |
| **RF-26** | Historia Clínica | Registrar antecedentes generales del paciente |
| **RF-27** | Historia Clínica | Gestionar el odontograma (32 dientes, RN-03) |
| **RF-28** | Historia Clínica | Agregar evoluciones clínicas cronológicas |
| **RF-29** | Historia Clínica | Adjuntar imágenes y documentos a evoluciones |
| **RF-30** | Historia Clínica | Optimizar imágenes automáticamente (RNF-09) |
| **RF-31** | Historia Clínica | Consultar el historial completo cronológico |
| **RF-32** | Historia Clínica | Desactivar evoluciones erróneas (solo ADMIN, RN-10) |
| **RF-33** | Facturación | Crear una factura para un paciente con múltiples ítems |
| **RF-34** | Facturación | Calcular automáticamente valor total, IVA y saldo |
| **RF-35** | Facturación | Registrar pagos parciales o totales sobre una factura |
| **RF-36** | Facturación | Consultar el estado (pendiente, pagada, anulada) |
| **RF-37** | Facturación | Anular una factura registrando motivo (RN-04) |
| **RF-38** | Facturación | Impedir eliminación física de facturas (RN-04) |
| **RF-39** | Facturación | Impedir cobros mayores al saldo pendiente (RN-05) |
| **RF-40** | Facturación | Generar el PDF descargable de la factura |
| **RF-41** | Inventario | Crear un material con stock inicial y stock mínimo |
| **RF-42** | Inventario | Registrar entradas y salidas de material (RN-06) |
| **RF-43** | Inventario | Detectar automáticamente materiales bajo el mínimo |
| **RF-44** | Inventario | Consultar el historial de movimientos de cada material |
| **RF-45** | Inventario | Impedir salidas que dejen stock negativo |
| **RF-46** | Recordatorios | Configurar la plantilla de mensajes (email y WhatsApp) |
| **RF-47** | Recordatorios | Enviar recordatorio 24 horas antes de la cita (RN-08) |
| **RF-48** | Recordatorios | Registrar el envío exitoso o el error del recordatorio |
| **RF-49** | Recordatorios | Consultar el historial de recordatorios enviados |
| **RF-50** | Reportes | Ver los ingresos del mes en curso |
| **RF-51** | Reportes | Ver los pacientes nuevos por mes (serie de 6 meses) |
| **RF-52** | Reportes | Ver los tratamientos más realizados |
| **RF-53** | Reportes | Ver los pacientes con saldo pendiente |
| **RF-54** | Reportes | Ver la tasa de asistencia a citas |
| **RF-55** | Reportes | Exportar reportes a Excel y PDF |
| **RF-56** | RIPS | Generar el archivo RIPS en formato JSON |
| **RF-57** | RIPS | Validar atenciones incompletas antes de generar |
| **RF-58** | RIPS | Descargar el archivo RIPS generado |
| **RF-59** | RIPS | Registrar el histórico de archivos RIPS generados |

---

## 8. Requisitos No Funcionales (RNF)

Los requisitos no funcionales definen las cualidades del sistema — cómo debe comportarse, no solo qué debe hacer.

| Código | Categoría | Descripción |
|---|---|---|
| **RNF-01** | Seguridad | Contraseñas encriptadas con bcrypt (factor de trabajo ≥ 10) |
| **RNF-02** | Seguridad | Autenticación mediante JWT con expiración configurable |
| **RNF-03** | Seguridad | Rate limiting en el login para prevenir ataques de fuerza bruta |
| **RNF-04** | Seguridad | Control de acceso basado en roles (RBAC) en todos los endpoints |
| **RNF-05** | Seguridad | Trazabilidad: cada acción crítica registra usuario y fecha |
| **RNF-06** | Usabilidad | Interfaz web responsive accesible desde escritorio y móvil |
| **RNF-07** | Usabilidad | Idioma español para todos los textos de interfaz |
| **RNF-08** | Rendimiento | Tiempo de respuesta ≤ 2 segundos para operaciones de consulta |
| **RNF-09** | Rendimiento | Optimización automática de imágenes cargadas (Sharp, formato WebP, máximo 1600 px) |
| **RNF-10** | Mantenibilidad | Arquitectura por capas (routes → controllers → services → models) |
| **RNF-11** | Mantenibilidad | Convención de commits con trazabilidad al SRS (tipo + código de RF/RNF/RN) |
| **RNF-12** | Disponibilidad | Alojamiento en la nube con backend en Render y base de datos en MongoDB Atlas |
| **RNF-13** | Portabilidad | Aplicación web multiplataforma; sin instalación en el cliente |
| **RNF-14** | Escalabilidad | Modelo de documentos embebidos apto para crecimiento del volumen sin joins costosos |

---

## 9. Reglas de Negocio (RN)

Las reglas de negocio son restricciones inviolables que el sistema debe validar automáticamente para preservar la integridad del dominio.

| Código | Regla | Módulo |
|---|---|---|
| **RN-01** | Un odontólogo no puede tener dos citas superpuestas en el mismo horario | Citas |
| **RN-02** | Los pacientes no se eliminan físicamente; solo se cambia su estado a INACTIVO | Pacientes |
| **RN-03** | El odontograma inicial se genera automáticamente con 32 dientes en estado SANO | Historia Clínica |
| **RN-04** | Las facturas no se eliminan; solo se anulan registrando motivo y usuario | Facturación |
| **RN-05** | La suma de pagos de una factura no puede exceder su valor total | Facturación |
| **RN-06** | Todo movimiento de inventario (entrada/salida) debe quedar registrado con usuario, fecha y motivo | Inventario |
| **RN-07** | Las citas solo pueden agendarse dentro del horario del consultorio (7 a.m. - 7 p.m.) | Citas |
| **RN-08** | Los recordatorios se envían automáticamente 24 horas antes de la cita, mediante tarea programada horaria | Recordatorios |
| **RN-09** | Solo el rol ODONTOLOGO puede crear o modificar la historia clínica | Historia Clínica |
| **RN-10** | Solo el rol ADMIN puede desactivar una evolución clínica ya registrada, y no puede eliminarla | Historia Clínica |

---

## 10. Aprobación Formal del Alcance

Habiendo revisado los requisitos funcionales, no funcionales y las reglas de negocio enunciadas en el presente documento, y habiendo participado en la fase de recolección de información mediante la entrevista y encuesta consolidadas, el cliente manifiesta su aprobación formal del alcance del proyecto OdontoSoft.

Esta aprobación constituye el punto de partida oficial para la fase de diseño lógico y arquitectura del sistema (Documento 2, Mes 2).

---

**Firma del Cliente:**

_______________________________________

Nombre: `[NOMBRE DEL ODONTÓLOGO CLIENTE]`

Cargo: Odontólogo propietario — Consultorio OdontoSalud

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
