# SERVICIO NACIONAL DE APRENDIZAJE — SENA

**Etapa Productiva — Modalidad Proyecto Productivo**

*Competencia Técnica: Análisis y Desarrollo de Software*

---

# Informe de Requisitos

**Consolidación detallada de Requisitos Funcionales y No Funcionales**

**Proyecto:** OdontoSoft — Sistema de Gestión Clínica Odontológica

**Cliente:** Consultorio Odontológico Dra. EM (Bogotá D.C.)

**Aprendiz:** `[NOMBRE COMPLETO DEL APRENDIZ]`

**Ficha SENA:** `[NÚMERO DE FICHA]`

**Instructor:** `[NOMBRE DEL INSTRUCTOR]`

**Fecha de entrega:** `[FECHA]`

---

## Contenido

1. Introducción
2. Alcance del Sistema
3. Módulos Funcionales del Sistema
4. Requisitos Funcionales (RF)
5. Requisitos No Funcionales (RNF)
6. Reglas de Negocio (RN)
7. Matriz de Trazabilidad
8. Delimitaciones del Alcance
9. Aprobación Formal

---

## 1. Introducción

El presente documento constituye el **Informe de Requisitos** del proyecto OdontoSoft. Consolida de forma detallada los requisitos funcionales (RF), no funcionales (RNF) y las reglas de negocio (RN) que el sistema debe cumplir.

Este informe es el resultado directo del análisis de los hallazgos obtenidos mediante los instrumentos de recolección de datos aplicados en la fase previa (ver documento *Instrumentos de Recolección de Datos*). Cada requisito aquí definido responde a una necesidad expresada por la cliente durante la entrevista, al análisis de su experiencia profesional previa, o a los hallazgos de la observación directa de su flujo de trabajo actual.

El propósito de este documento es servir como **contrato funcional** entre la cliente (Dra. EM) y el equipo de desarrollo, estableciendo con precisión qué debe hacer el sistema, cómo debe comportarse y qué restricciones inviolables debe respetar.

---

## 2. Alcance del Sistema

**OdontoSoft** es una aplicación web para la gestión integral del consultorio odontológico independiente de la Dra. EM en Bogotá D.C. El sistema digitaliza los procesos administrativos, clínicos y financieros del consultorio, siguiendo las funcionalidades estándar del sector odontológico validadas previamente con la cliente.

El sistema ofrece:

- Gestión completa de pacientes con historia clínica y odontograma interactivo
- Agenda de citas con detección automática de conflictos
- Facturación con múltiples pagos parciales
- Inventario de materiales con alertas de stock bajo
- Recordatorios automáticos por email (y WhatsApp simulado en fase 1)
- Reportes gerenciales (financieros, clínicos, administrativos)
- Generación de archivos RIPS conforme a normativa colombiana

El sistema se implementa sobre el **stack MEAN** (MongoDB, Express, Angular, Node.js) y se despliega en la nube para acceso multiplataforma vía navegador web, cumpliendo con la preferencia explícita de la cliente por soluciones en la nube (Entrevista P12).

---

## 3. Módulos Funcionales del Sistema

El sistema se organiza en **9 módulos funcionales**, cada uno responsable de un dominio específico del negocio:

| Módulo | Nombre | Requisitos | Reglas de Negocio |
|:---:|---|:---:|:---:|
| **M1** | Autenticación y control de acceso | RF-01 a RF-08 | RNF-01 a RNF-05 |
| **M2** | Pacientes | RF-09 a RF-16 | RN-02 |
| **M3** | Citas y agenda | RF-17 a RF-24 | RN-01, RN-07 |
| **M4** | Historia clínica y odontograma | RF-25 a RF-32 | RN-03, RN-09, RN-10 |
| **M5** | Facturación y pagos | RF-33 a RF-40 | RN-04, RN-05 |
| **M6** | Inventario | RF-41 a RF-45 | RN-06 |
| **M7** | Recordatorios automáticos | RF-46 a RF-49 | RN-08 |
| **M8** | Reportes y estadísticas | RF-50 a RF-55 | — |
| **M9** | Integración con RIPS | RF-56 a RF-59 | — |
| **Total** | | **59 RF** | **10 RN** |

---

## 4. Requisitos Funcionales (RF)

Los requisitos funcionales definen las **capacidades específicas** que el sistema debe ofrecer. Cada RF fue validado con la cliente durante la fase de levantamiento y responde a una necesidad concreta identificada en sus 12 años de experiencia profesional.

### 4.1. Módulo 1 — Autenticación

| Código | Descripción | Prioridad |
|---|---|:---:|
| **RF-01** | El sistema debe permitir el inicio de sesión mediante email y contraseña, generando un token JWT válido tras la autenticación exitosa. | Alta |
| **RF-02** | El sistema debe permitir cerrar sesión invalidando el token JWT activo mediante una lista negra de tokens. | Alta |
| **RF-03** | El sistema debe encriptar todas las contraseñas de usuarios utilizando bcrypt (factor de trabajo ≥ 10) antes de almacenarlas en la base de datos. | Alta |
| **RF-04** | El sistema debe validar el token JWT en cada petición HTTP a rutas protegidas. | Alta |
| **RF-05** | El sistema debe rechazar cualquier acceso con token inválido, expirado o incluido en la lista negra, retornando código HTTP 401. | Alta |
| **RF-06** | El sistema debe restringir el acceso a cada endpoint según el rol del usuario autenticado (ADMIN, ODONTOLOGO, RECEPCIONISTA), retornando HTTP 403 en caso de rol no autorizado. | Alta |
| **RF-07** | El sistema debe registrar cada intento de inicio de sesión (exitoso o fallido) en un log de auditoría, con email, IP, timestamp y tipo de resultado. | Media |
| **RF-08** | El sistema debe persistir la sesión del usuario en el frontend hasta que expire el token o se cierre manualmente la sesión. | Alta |

*Origen: Entrevista P8 (permisos por rol), P14 (confiabilidad de datos), Análisis Dominio 9.*

### 4.2. Módulo 2 — Pacientes

| Código | Descripción | Prioridad |
|---|---|:---:|
| **RF-09** | El sistema debe permitir crear un paciente ingresando datos personales completos: nombre, apellido, tipo y número de documento, fecha de nacimiento, sexo, teléfono, email, dirección, EPS. | Alta |
| **RF-10** | El sistema debe permitir consultar el listado de pacientes con paginación (10 por página por defecto). | Alta |
| **RF-11** | El sistema debe permitir buscar pacientes por nombre, apellido o número de documento, con búsqueda parcial e insensible a tildes. | Alta |
| **RF-12** | El sistema debe permitir consultar el detalle completo de un paciente por su identificador. | Alta |
| **RF-13** | El sistema debe permitir editar los datos de un paciente existente. | Alta |
| **RF-14** | El sistema debe permitir desactivar un paciente cambiando su estado a INACTIVO, sin eliminarlo físicamente (aplicación de RN-02). | Alta |
| **RF-15** | El sistema debe validar la unicidad de la combinación tipo de documento + número de documento antes de crear un paciente. | Alta |
| **RF-16** | El sistema debe registrar automáticamente el usuario que creó cada paciente y la fecha/hora de la última actualización. | Media |

*Origen: Análisis Dominio 1 + Observación 6.2 (búsqueda insensible a tildes, búsqueda parcial por documento).*

### 4.3. Módulo 3 — Citas y Agenda

| Código | Descripción | Prioridad |
|---|---|:---:|
| **RF-17** | El sistema debe permitir crear una cita indicando paciente, odontólogo, fecha, hora de inicio, duración en minutos y motivo. | Alta |
| **RF-18** | El sistema debe permitir consultar la agenda del día por odontólogo, mostrando todas las citas ordenadas por hora. | Alta |
| **RF-19** | El sistema debe detectar automáticamente conflictos de horario para el mismo odontólogo antes de crear una cita (aplicación de RN-01). | Alta |
| **RF-20** | El sistema debe permitir actualizar el estado de una cita a través de su ciclo de vida: PROGRAMADA → CONFIRMADA → EN_ATENCION → FINALIZADA, o marcarla como CANCELADA / NO_ASISTIO. | Alta |
| **RF-21** | El sistema debe permitir reasignar una cita a otra fecha, hora u odontólogo. | Media |
| **RF-22** | El sistema debe permitir cancelar una cita registrando el motivo de cancelación. | Media |
| **RF-23** | El sistema debe impedir la creación de citas fuera del horario del consultorio (aplicación de RN-07). | Alta |
| **RF-24** | El sistema debe mostrar las citas del día en curso en el dashboard principal. | Media |

*Origen: Entrevista P5 (detección de conflictos, estados visibles) + Análisis Dominio 2 + Observación 6.1 (consulta 8-10 veces por día).*

### 4.4. Módulo 4 — Historia Clínica y Odontograma

| Código | Descripción | Prioridad |
|---|---|:---:|
| **RF-25** | El sistema debe permitir crear la historia clínica única de un paciente. | Alta |
| **RF-26** | El sistema debe permitir registrar los antecedentes médicos, alergias, medicamentos, quirúrgicos y familiares del paciente. | Alta |
| **RF-27** | El sistema debe generar automáticamente un odontograma con los 32 dientes en estado SANO al crear la historia (aplicación de RN-03). | Alta |
| **RF-28** | El sistema debe permitir agregar evoluciones clínicas cronológicas indicando fecha, odontólogo, diente involucrado, procedimiento, descripción y observaciones. | Alta |
| **RF-29** | El sistema debe permitir adjuntar imágenes y documentos a cada evolución clínica. | Media |
| **RF-30** | El sistema debe optimizar automáticamente las imágenes cargadas (compresión y redimensionamiento máximo 1600 px). | Media |
| **RF-31** | El sistema debe permitir consultar el historial cronológico completo de un paciente, ordenado de la evolución más reciente a la más antigua. | Alta |
| **RF-32** | El sistema debe permitir a los usuarios con rol ADMIN desactivar evoluciones clínicas erróneas sin eliminarlas (aplicación de RN-10). | Media |

*Origen: Entrevista P4 (odontograma clickeable por superficie) + Análisis Dominio 3 + Observación 6.1 (2 evoluciones promedio por paciente, ordenamiento cronológico inverso).*

### 4.5. Módulo 5 — Facturación y Pagos

| Código | Descripción | Prioridad |
|---|---|:---:|
| **RF-33** | El sistema debe permitir crear una factura para un paciente con uno o más ítems (procedimientos con valor unitario). | Alta |
| **RF-34** | El sistema debe calcular automáticamente el valor total, el IVA aplicable y el saldo pendiente de cada factura. | Alta |
| **RF-35** | El sistema debe permitir registrar pagos parciales o totales sobre una factura, indicando monto, método (EFECTIVO, TARJETA, TRANSFERENCIA, PSE) y fecha. | Alta |
| **RF-36** | El sistema debe permitir consultar el estado de la factura: PENDIENTE, PAGADA o ANULADA. | Alta |
| **RF-37** | El sistema debe permitir anular una factura registrando el motivo, el usuario y la fecha de anulación (aplicación de RN-04). | Alta |
| **RF-38** | El sistema debe impedir la eliminación física de facturas (aplicación de RN-04). | Alta |
| **RF-39** | El sistema debe impedir el registro de un pago cuyo monto exceda el saldo pendiente de la factura (aplicación de RN-05). | Alta |
| **RF-40** | El sistema debe generar el PDF descargable de la factura con datos del consultorio, del paciente, ítems, pagos y saldo. | Media |

*Origen: Análisis Dominio 4 + Observación 6.1 (40% de facturas se pagan en 2-3 abonos, tarjeta débito es el método más común).*

### 4.6. Módulo 6 — Inventario

| Código | Descripción | Prioridad |
|---|---|:---:|
| **RF-41** | El sistema debe permitir crear un material con nombre, descripción, unidad de medida, stock inicial y stock mínimo. | Alta |
| **RF-42** | El sistema debe permitir registrar entradas y salidas de material, actualizando el stock y guardando el histórico (aplicación de RN-06). | Alta |
| **RF-43** | El sistema debe detectar automáticamente y listar los materiales cuyo stock esté por debajo del mínimo definido. | Alta |
| **RF-44** | El sistema debe permitir consultar el historial completo de movimientos de cada material. | Media |
| **RF-45** | El sistema debe impedir el registro de salidas que dejen el stock en cantidad negativa. | Alta |

*Origen: Entrevista P3 + Análisis Dominio 5.*

### 4.7. Módulo 7 — Recordatorios Automáticos

| Código | Descripción | Prioridad |
|---|---|:---:|
| **RF-46** | El sistema debe permitir configurar las plantillas de mensajes de recordatorio para los canales EMAIL y WHATSAPP, incluyendo variables dinámicas: nombre del paciente, fecha y hora de la cita. | Alta |
| **RF-47** | El sistema debe enviar automáticamente un recordatorio a cada paciente 24 horas antes de su cita programada (aplicación de RN-08). | Alta |
| **RF-48** | El sistema debe registrar cada recordatorio enviado con su estado (ENVIADO / ERROR), destinatario, canal y timestamp. | Alta |
| **RF-49** | El sistema debe permitir consultar el historial completo de recordatorios enviados con paginación y filtros por estado. | Media |

*Origen: Entrevista P10 (WhatsApp preferido, email para pacientes formales, 24h antes) + Observación 6.1 (5% de ausentismo con recordatorios).*

### 4.8. Módulo 8 — Reportes y Estadísticas

| Código | Descripción | Prioridad |
|---|---|:---:|
| **RF-50** | El sistema debe generar el reporte de ingresos del mes en curso, basado en los pagos efectivamente registrados. | Alta |
| **RF-51** | El sistema debe generar el reporte de pacientes nuevos por mes, con serie de los últimos 6 meses. | Media |
| **RF-52** | El sistema debe generar el reporte de tratamientos más realizados, ordenado por frecuencia. | Media |
| **RF-53** | El sistema debe generar el reporte de pacientes con saldo pendiente, ordenado de mayor a menor. | Alta |
| **RF-54** | El sistema debe generar el reporte de tasa de asistencia a citas del último mes. | Media |
| **RF-55** | El sistema debe permitir exportar cualquier reporte a formatos Excel y PDF. | Media |

*Origen: Entrevista P9 (los 5 reportes esenciales para el 90% de las decisiones gerenciales).*

### 4.9. Módulo 9 — Integración con RIPS

| Código | Descripción | Prioridad |
|---|---|:---:|
| **RF-56** | El sistema debe permitir generar el archivo RIPS del período seleccionado (mes) en formato JSON conforme a la Resolución del Ministerio de Salud. | Alta |
| **RF-57** | El sistema debe validar la completitud de las atenciones antes de generar el archivo, identificando las que tengan campos faltantes obligatorios (código CUPS, diagnóstico, documento del paciente). | Alta |
| **RF-58** | El sistema debe permitir descargar el archivo RIPS generado. | Alta |
| **RF-59** | El sistema debe registrar el histórico de archivos RIPS generados, indicando periodo, cantidad de atenciones incluidas, usuario que lo generó y fecha. | Media |

*Origen: Entrevista P3 (obligatorio legal) + Análisis Dominio 8 (radicación manual por decisión de la cliente).*

---

## 5. Requisitos No Funcionales (RNF)

Los requisitos no funcionales definen las **cualidades** del sistema — cómo debe comportarse, no solo qué debe hacer.

| Código | Categoría | Descripción |
|---|---|---|
| **RNF-01** | Seguridad | Todas las contraseñas deben almacenarse encriptadas con bcrypt (factor de trabajo ≥ 10). Nunca deben viajar ni almacenarse en texto plano. |
| **RNF-02** | Seguridad | La autenticación debe realizarse mediante tokens JWT firmados con clave secreta, con tiempo de expiración configurable (por defecto 8 horas). |
| **RNF-03** | Seguridad | El sistema debe aplicar rate limiting en el endpoint de login para prevenir ataques de fuerza bruta (máximo 10 intentos por IP en 15 minutos). |
| **RNF-04** | Seguridad | El sistema debe implementar control de acceso basado en roles (RBAC) en todos los endpoints, con validación tanto en frontend como en backend. |
| **RNF-05** | Seguridad | Cada acción crítica (login, creación, modificación, anulación) debe registrar en logs el usuario responsable y la fecha/hora, garantizando trazabilidad. |
| **RNF-06** | Usabilidad | La interfaz web debe ser responsive, accesible desde dispositivos de escritorio, tabletas y móviles. |
| **RNF-07** | Usabilidad | La totalidad de los textos de la interfaz debe estar en idioma español. |
| **RNF-08** | Rendimiento | El tiempo de respuesta del sistema para operaciones de consulta debe ser menor o igual a 2 segundos bajo carga normal. |
| **RNF-09** | Rendimiento | Las imágenes cargadas al sistema deben ser optimizadas automáticamente (Sharp, formato WebP, máximo 1600 px de ancho). |
| **RNF-10** | Mantenibilidad | El backend debe seguir una arquitectura por capas claramente separadas: rutas → controladores → servicios → modelos. |
| **RNF-11** | Mantenibilidad | Los commits del proyecto deben seguir una convención con trazabilidad al SRS, indicando el código de RF, RNF o RN abordado. |
| **RNF-12** | Disponibilidad | El sistema debe estar alojado en la nube (preferencia explícita de la cliente): backend en Render, base de datos en MongoDB Atlas. |
| **RNF-13** | Portabilidad | El sistema debe ser accesible como aplicación web multiplataforma, sin requerir instalación en el cliente. |
| **RNF-14** | Escalabilidad | El modelo de datos debe soportar crecimiento del volumen y la posibilidad de contratación de un segundo odontólogo (Entrevista P11) sin refactorización mayor. |

---

## 6. Reglas de Negocio (RN)

Las reglas de negocio son **restricciones inviolables** que el sistema debe validar automáticamente para preservar la integridad del dominio.

| Código | Regla | Módulo |
|---|---|:---:|
| **RN-01** | Un odontólogo no puede tener dos citas superpuestas en el mismo horario. El sistema debe detectar el conflicto y rechazar la creación. | M3 |
| **RN-02** | Los pacientes no se eliminan físicamente de la base de datos. La "eliminación" corresponde a un cambio de estado a INACTIVO, preservando la historia. | M2 |
| **RN-03** | Al crear la historia clínica de un paciente, el odontograma debe inicializarse automáticamente con los 32 dientes en estado SANO (notación FDI 11-48). | M4 |
| **RN-04** | Las facturas no se eliminan físicamente. La "eliminación" corresponde a una anulación con registro del motivo, el usuario y la fecha. | M5 |
| **RN-05** | La suma de todos los pagos registrados sobre una factura no puede exceder su valor total. El sistema debe rechazar pagos que violen esta regla. | M5 |
| **RN-06** | Todo movimiento de inventario (entrada o salida) debe quedar registrado inmutablemente con usuario responsable, fecha, motivo, stock anterior y stock nuevo. | M6 |
| **RN-07** | Las citas solo pueden agendarse dentro del horario definido del consultorio (por defecto: 7:00 a.m. a 7:00 p.m.). | M3 |
| **RN-08** | Los recordatorios se envían automáticamente 24 horas antes de la cita, mediante tarea programada que ejecuta cada hora. | M7 |
| **RN-09** | Solo los usuarios con rol ODONTOLOGO pueden crear o modificar la historia clínica de los pacientes. La recepcionista y el administrador no tienen acceso a datos clínicos. | M4 |
| **RN-10** | Solo los usuarios con rol ADMIN pueden desactivar una evolución clínica ya registrada. No se permite la eliminación física de evoluciones. | M4 |

---

## 7. Matriz de Trazabilidad

La siguiente matriz vincula los ejes identificados en el levantamiento de información con los requisitos formulados:

| Eje identificado (origen) | Requisitos que lo resuelven | Módulo |
|---|---|:---:|
| Gestión de pacientes con búsqueda avanzada | RF-09, RF-10, RF-11, RF-15 | M2 |
| Agenda con detección de conflictos | RF-17, RF-19, RN-01, RN-07 | M3 |
| Historia clínica con odontograma por superficie | RF-25, RF-27 (RN-03), RF-28 | M4 |
| Evoluciones cronológicas con adjuntos | RF-28, RF-29, RF-30, RF-31 | M4 |
| Facturación con múltiples pagos parciales | RF-33, RF-34, RF-35, RF-39 (RN-05) | M5 |
| Inventario con alertas | RF-41, RF-42, RF-43 (RN-06) | M6 |
| Recordatorios automáticos 24h antes | RF-46, RF-47 (RN-08), RF-48 | M7 |
| Reportes gerenciales | RF-50, RF-51, RF-52, RF-53, RF-54, RF-55 | M8 |
| Generación de RIPS | RF-56, RF-57, RF-58, RF-59 | M9 |
| Roles diferenciados por función | RF-06, RNF-04 | M1 |
| Alojamiento en la nube | RNF-12 | Transversal |
| Confiabilidad de datos críticos | RN-02, RN-04, RN-06, RN-10, RNF-05 | Transversal |

Esta matriz garantiza que **cada necesidad identificada durante el levantamiento tiene al menos un requisito que la aborda**.

---

## 8. Delimitaciones del Alcance

Se documentan explícitamente las decisiones de alcance del proyecto, todas validadas con la cliente durante la fase de levantamiento:

- **Facturación electrónica DIAN:** el sistema genera facturas internas pero **no** se integra con la DIAN para facturación electrónica (Entrevista P7 — pospuesta a fase 2 por consolidación del negocio).
- **Radicación automática RIPS:** el sistema genera el archivo RIPS pero la radicación es manual, **no** se envía automáticamente al Mecanismo Único de Validación (Análisis Dominio 8).
- **WhatsApp:** el envío por WhatsApp está simulado, **no** integrado con Twilio o Meta WhatsApp Business API (Análisis Dominio 6 — fase 1).
- **Email:** el envío se realiza vía Ethereal (servidor SMTP de pruebas), reemplazable por un proveedor de producción en el futuro.
- **Archivos adjuntos:** se almacenan en el disco local del servidor, **no** en servicios de almacenamiento en la nube (AWS S3, Cloudflare R2).
- **Pasarela de pagos en línea:** el sistema registra pagos pero **no** procesa cobros en línea (PSE, tarjetas).
- **Portal del paciente y app móvil:** excluidos al inicio (Análisis Dominio 1 — la cliente los considera innecesarios en fase 1).
- **Videollamada y teleodontología:** excluidas (Entrevista P6).
- **Integración con laboratorios dentales y proveedores:** excluida (Entrevista P6, Análisis Dominio 5).

---

## 9. Aprobación Formal

Habiendo revisado en detalle los 59 requisitos funcionales, los 14 requisitos no funcionales y las 10 reglas de negocio enunciadas en el presente documento, la cliente manifiesta su aprobación formal del alcance del proyecto OdontoSoft.

Esta aprobación constituye el compromiso funcional entre las partes y sirve como base para las fases posteriores de diseño técnico, implementación y despliegue.

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
