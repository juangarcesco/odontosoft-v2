**Especificación de Requisitos de Software (SRS) e Inicio del Proyecto**
**Sistema: OdontoSoft**

Juan Carlos Garcés Sierra
Juan Pablo Méndez Gil

Sistema Nacional de Aprendizaje — SENA
Ficha: 3186265

TÉCNICO EN PROGRAMACIÓN DE APLICACIONES
Y SERVICIOS PARA LA NUBE
Instructor: Nelson Armando Serrano Hincapié

Junio 2026

---

## Control de versiones

| Versión | Fecha | Autor(es) | Descripción del cambio |
| :---: | :---: | ----- | ----- |
| 1.0 | Junio 2026 | Garcés Sierra / Méndez Gil | Versión inicial del SRS |
| 2.0 | Junio 2026 | Garcés Sierra / Méndez Gil | Se elimina duplicidad en introducción; se agregan objetivos, reglas de negocio, modelo de datos, casos de uso, priorización MoSCoW, matriz de trazabilidad, riesgos, cronograma e instrumentos de recolección de datos completos |

---

# 1. Introducción

## 1.1 Propósito

Este documento describe los requisitos funcionales y no funcionales del sistema **OdontoSoft**, una aplicación web para la gestión integral de un consultorio dental individual en Colombia. Su propósito es servir como base formal de acuerdo entre el equipo de desarrollo y los interesados (instructor, cliente simulado y usuarios finales) sobre **qué** hará el sistema, delimitando claramente su alcance antes de iniciar el diseño y la construcción.

## 1.2 Alcance

OdontoSoft es un sistema web accesible desde cualquier navegador moderno, construido sobre el stack MEAN. Cubre la gestión de pacientes, citas, historia clínica y odontograma, facturación, inventario, recordatorios automáticos, reportes e **integración con RIPS** (Registro Individual de Prestación de Servicios de Salud del Ministerio de Salud de Colombia), generando los archivos correspondientes a partir de las atenciones registradas en el sistema. Está diseñado para un consultorio con **un** odontólogo principal, personal de recepción y un administrador del sistema (no contempla múltiples sedes ni múltiples odontólogos, ver sección 8).

## 1.3 Objetivos

### 1.3.1 Objetivo general

Desarrollar una aplicación web que digitalice y centralice los procesos administrativos y clínicos de un consultorio odontológico independiente en Colombia, reduciendo el uso de papel y hojas de cálculo, y mejorando la trazabilidad de la información del paciente.

### 1.3.2 Objetivos específicos

1. Implementar un módulo de autenticación seguro basado en roles (ADMIN, ODONTÓLOGO, RECEPCIONISTA).
2. Centralizar y mantener actualizada la información de los pacientes del consultorio.
3. Digitalizar la historia clínica y el odontograma de cada paciente, garantizando su confidencialidad.
4. Automatizar la agenda de citas, evitando el cruce de horarios.
5. Permitir la facturación y el control de pagos en pesos colombianos (COP).
6. Controlar el inventario de materiales e insumos odontológicos.
7. Enviar recordatorios automáticos de citas por WhatsApp y correo electrónico.
8. Generar reportes gerenciales que apoyen la toma de decisiones del consultorio.
9. Generar los archivos RIPS exigidos por el Ministerio de Salud a partir de las atenciones registradas en el sistema.

## 1.4 Definiciones, siglas y abreviaturas

| Término | Definición |
| :---: | ----- |
| SRS | Especificación de Requisitos de Software (Software Requirements Specification) |
| CRUD | Create, Read, Update, Delete (operaciones básicas de datos) |
| JWT | JSON Web Token (mecanismo de autenticación) |
| API | Interfaz de Programación de Aplicaciones |
| REST | Representational State Transfer (estilo de arquitectura de API) |
| COP | Peso Colombiano |
| RUT | Registro Único Tributario |
| CC | Cédula de Ciudadanía |
| CE | Cédula de Extranjería |
| TI | Tarjeta de Identidad |
| PA | Pasaporte |
| RC | Registro Civil |
| EPS | Entidad Promotora de Salud |
| RIPS | Registro Individual de Prestación de Servicios de Salud |
| JSON | JavaScript Object Notation (formato de intercambio de datos usado por el RIPS vigente) |
| FEV | Factura Electrónica de Venta en salud |
| MUV | Mecanismo Único de Validación del Ministerio de Salud (recibe y valida el RIPS junto con la FEV) |
| CUV | Código Único de Validación (código que certifica que un RIPS fue aprobado por el MUV) |
| DIAN | Dirección de Impuestos y Aduanas Nacionales |
| SPA | Single Page Application (aplicación de una sola página) |
| ODM | Object Document Mapper |
| RF | Requisito Funcional |
| RNF | Requisito No Funcional |

## 1.5 Contexto del negocio

El consultorio dental colombiano promedio maneja sus procesos en papel o en hojas de Excel, lo que genera pérdida de información, errores en la agenda y dificultad para hacer seguimiento a pagos e inventario. OdontoSoft busca reemplazar esos procesos con una solución digital que permita:

- Reducir errores en la agenda de citas.
- Tener historia clínica digital por paciente.
- Emitir facturas y controlar pagos en COP.
- Controlar el inventario de materiales.
- Enviar recordatorios automáticos a pacientes.
- Generar reportes de gestión.

---

# 2. Descripción General del Sistema

## 2.1 Perspectiva del producto

OdontoSoft es un producto nuevo, independiente, que no reemplaza ni se integra (en esta primera versión) con sistemas externos como RIPS, facturación electrónica DIAN o plataformas de las EPS. Está pensado como una solución **autocontenida** para un solo consultorio.

## 2.2 Arquitectura del sistema: stack tecnológico

La aplicación se organiza bajo el stack tecnológico **MEAN** (MongoDB, Express, Angular, Node.js), una solución integral para el desarrollo de aplicaciones web escalables.

## 2.3 Resumen de la arquitectura

| Capa | Componentes | Rol |
| :---: | ----- | ----- |
| **Frontend** | Angular | Interfaz de usuario y lógica del cliente. |
| **Backend** | Node.js + Express | Servidor de aplicaciones y API REST. |
| **Base de Datos** | MongoDB + Mongoose | Almacenamiento de datos NoSQL (documental). |

## 2.4 Detalle de las capas

### Frontend (Angular)

La capa de presentación utiliza Angular, un framework robusto que permite la creación de interfaces dinámicas, aplicaciones de una sola página (SPA) y una gestión eficiente de los componentes y servicios del lado del cliente.

### Backend (Node.js + Express)

El servidor utiliza Node.js como entorno de ejecución y Express como framework web. Esta capa actúa como el puente lógico, procesando las solicitudes HTTP provenientes del frontend y orquestando las operaciones necesarias con la base de datos, además de exponer la API REST protegida con JWT.

### Base de datos (MongoDB)

Se utiliza MongoDB como sistema de gestión de bases de datos. Al ser una base de datos orientada a documentos (NoSQL), permite una gran flexibilidad en el manejo de estructuras de datos, ideal para el desarrollo ágil y la integración nativa con formatos JSON utilizados en el stack.

## 2.5 Arquitectura de Despliegue

Mientras las secciones 2.3 y 2.4 describen la **arquitectura lógica** (qué hace cada capa), esta sección describe la **arquitectura de despliegue**: dónde vive físicamente cada componente en producción y cómo se comunican entre sí.

```
┌──────────────┐        HTTPS         ┌──────────────────────────────┐        ┌────────────────────┐
│  Navegador   │  ───────────────▶   │   AWS EC2 (t2.micro/t3.micro) │        │   MongoDB Atlas     │
│  (Cliente)   │  ◀───────────────   │   Nginx (proxy inverso)        │──────▶│   Tier M0 (gratis)  │
└──────────────┘                      │   ├─ Angular (build estático) │  URI  │                      │
                                       │   └─ Node.js + Express (API)  │       └────────────────────┘
                                       └──────────────────────────────┘
```

### 2.5.1 Componentes del despliegue

| Componente | Ubicación | Detalle |
| ----- | ----- | ----- |
| Cliente | Navegador del usuario | Consume la SPA de Angular vía HTTPS |
| Servidor web / proxy inverso | AWS EC2 | Nginx recibe las peticiones, sirve los archivos estáticos de Angular y redirige las peticiones `/api` al proceso de Express |
| Frontend (Angular build) | AWS EC2 (misma instancia) | Archivos estáticos generados con `ng build`, servidos por Nginx |
| Backend (Node.js + Express) | AWS EC2 (misma instancia) | Proceso Node corriendo en segundo plano (ej. con PM2), expone la API REST protegida con JWT |
| Base de datos | MongoDB Atlas (externa a EC2) | Instancia gestionada M0, conectada al backend mediante URI de conexión con credenciales |

### 2.5.2 Justificación de esta arquitectura

- Frontend y backend comparten la misma instancia EC2 para evitar el costo de un Load Balancer o de un servicio adicional de hosting estático, manteniendo el despliegue dentro de la capa gratuita de AWS (ver sección 12).
- La base de datos se mantiene **externa** a la instancia EC2 (en MongoDB Atlas) para no depender del almacenamiento efímero del servidor y facilitar backups automáticos (RNF-15).
- Esta arquitectura es adecuada para el volumen de un solo consultorio; si el sistema creciera (más tráfico, múltiples sedes), se recomendaría separar frontend y backend en servicios independientes (ver sección 13, Fuera del Alcance).

---

# 3. Usuarios del sistema

| Rol | Descripción | Accesos principales |
| ----- | ----- | ----- |
| **Administrador** | Gestiona la configuración del sistema, los usuarios y la disponibilidad de la plataforma; supervisa la operación mediante reportes, pero **no ejecuta las tareas operativas del día a día** (esas corresponden a Recepcionista y Odontólogo) | Configuración, usuarios, disponibilidad de la plataforma, reportes de todos los módulos |
| **Odontólogo** | Profesional de la salud | Historia clínica, odontograma, citas, tratamientos |
| **Recepcionista** | Personal administrativo | Pacientes, citas, pagos, inventario, recordatorios |

> **Nota de diseño (separación de funciones):** el rol Administrador no tiene mayor jerarquía operativa que Recepcionista o Odontólogo; tiene un alcance **distinto**. Administrador controla la configuración del sistema y supervisa mediante reportes (control), mientras que Recepcionista y Odontólogo ejecutan las operaciones diarias de cada módulo (operación). Por eso en varios módulos el Administrador tiene solo lectura o acceso a reportes, y no CRUD: no es una limitación por debajo de Recepcionista, sino una separación intencional de funciones para evitar que una sola persona opere y audite el mismo proceso.

## 3.1 Matriz de permisos por módulo

| Módulo | Administrador | Odontólogo | Recepcionista |
| ----- | :---: | :---: | :---: |
| Usuarios y configuración | CRUD | — | — |
| Pacientes | Lectura | Lectura | CRUD |
| Citas y agenda | Lectura | Lectura / Actualizar estado | CRUD |
| Historia clínica y odontograma | Sin acceso a edición | CRUD | Sin acceso |
| Facturación y pagos | Lectura (reportes) | Lectura | CRUD |
| Inventario | Lectura (reportes) | Sin acceso | CRUD |
| Reportes | Todos (incluye inventario, financieros, clínicos agregados y administrativos) | Clínicos | Administrativos, financieros e inventario |

## 3.2 Restricciones generales

- El sistema opera únicamente en Colombia (moneda COP, documentos CC/CE/TI/PA/RC).
- Requiere conexión a internet.
- Compatible con navegadores Chrome, Firefox, Edge y Safari (versiones actuales).
- Los datos deben cumplir con la Ley 1581 de 2012 (Protección de Datos Personales de Colombia).

---

# 4. Requisitos Funcionales

*Prioridad — M: Must have (obligatorio), S: Should have (importante), C: Could have (deseable).*

## 4.1 Módulo 1. Autenticación

| ID | Requisito | Prioridad |
| :---: | ----- | :---: |
| RF-01 | El sistema debe permitir iniciar sesión con email y contraseña | M |
| RF-02 | Las contraseñas deben almacenarse encriptadas con bcrypt | M |
| RF-03 | El sistema debe generar tokens JWT con expiración de 8 horas | M |
| RF-04 | Las rutas protegidas deben verificar el token antes de responder | M |
| RF-05 | El sistema debe tener tres roles: ADMIN, ODONTÓLOGO, RECEPCIONISTA | M |
| RF-06 | El usuario debe poder cerrar sesión | M |
| RF-07 | El campo de contraseña debe tener opción de mostrar/ocultar | S |
| RF-08 | El sistema debe redirigir al login si no hay sesión activa | M |

## 4.2 Módulo 2. Pacientes

| ID | Requisito | Prioridad |
| :---: | ----- | :---: |
| RF-09 | El sistema debe permitir registrar un nuevo paciente | M |
| RF-10 | El sistema debe listar todos los pacientes con paginación | M |
| RF-11 | El sistema debe permitir buscar pacientes por nombre o documento | M |
| RF-12 | El sistema debe permitir ver el detalle de un paciente | M |
| RF-13 | El sistema debe permitir editar los datos de un paciente | M |
| RF-14 | El sistema debe permitir desactivar un paciente (no eliminar) | M |
| RF-15 | Los datos del paciente deben incluir: nombre, apellido, tipo y número de documento, fecha de nacimiento, sexo, teléfono, email, dirección, ciudad, EPS, grupo sanguíneo, alergias, observaciones | M |
| RF-16 | El sistema debe validar que el número de documento no se repita | M |

## 4.3 Módulo 3. Citas y Agenda

| ID | Requisito | Prioridad |
| :---: | ----- | :---: |
| RF-17 | El sistema debe mostrar una agenda visual por día/semana/mes | M |
| RF-18 | El sistema debe permitir crear una cita asignada a un paciente | M |
| RF-19 | El sistema debe permitir definir duración de la cita (30, 45, 60 min) | S |
| RF-20 | El sistema debe permitir asignar un motivo/tipo de cita | S |
| RF-21 | El sistema debe controlar conflictos de horario | M |
| RF-22 | El sistema debe permitir cambiar el estado de la cita: Programada, Confirmada, En atención, Finalizada, Cancelada, No asistió | M |
| RF-23 | El sistema debe permitir editar y cancelar citas | M |
| RF-24 | El sistema debe mostrar las citas del día en el Dashboard | M |

## 4.4 Módulo 4. Historia Clínica y Odontograma

| ID | Requisito | Prioridad |
| :---: | ----- | :---: |
| RF-25 | Cada paciente debe tener una historia clínica única | M |
| RF-26 | El sistema debe incluir un odontograma digital interactivo (32 dientes) | M |
| RF-27 | El odontograma debe permitir registrar el estado de cada diente (sano, caries, extracción, corona, etc.) | M |
| RF-28 | El sistema debe permitir registrar evoluciones clínicas con fecha | M |
| RF-29 | El sistema debe registrar antecedentes médicos del paciente | M |
| RF-30 | El sistema debe permitir adjuntar imágenes (radiografías, fotos) | S |
| RF-31 | El sistema debe registrar los tratamientos realizados por diente | M |
| RF-32 | El sistema debe garantizar que la creación y edición del contenido clínico (evoluciones, odontograma) de la historia clínica sea de uso exclusivo del rol ODONTÓLOGO. El administrador gestiona la disponibilidad de la plataforma y, excepcionalmente, puede desactivar un registro clínico erróneo (ver RN-10), sin poder editarlo | M |

## 4.5 Módulo 5. Facturación y Pagos

| ID | Requisito | Prioridad |
| :---: | ----- | :---: |
| RF-33 | El sistema debe permitir crear una factura por atención | M |
| RF-34 | Las facturas deben mostrar los tratamientos realizados con valor en COP | M |
| RF-35 | El sistema debe registrar pagos parciales (abonos) | M |
| RF-36 | El sistema debe calcular el saldo pendiente automáticamente | M |
| RF-37 | El sistema debe permitir registrar el método de pago: efectivo, transferencia, tarjeta | M |
| RF-38 | El sistema debe permitir imprimir o exportar la factura en PDF | S |
| RF-39 | El sistema debe manejar IVA según aplique (servicios de salud exentos en Colombia) | S |
| RF-40 | El sistema debe mostrar el historial de pagos por paciente | M |

## 4.6 Módulo 6. Inventario de Materiales

| ID | Requisito | Prioridad |
| :---: | ----- | :---: |
| RF-41 | El sistema debe permitir registrar materiales e insumos | M |
| RF-42 | El sistema debe controlar el stock (entradas y salidas) | M |
| RF-43 | El sistema debe alertar cuando un material esté por debajo del stock mínimo | S |
| RF-44 | El sistema debe registrar el proveedor de cada material | C |
| RF-45 | El sistema debe permitir registrar el costo en COP | M |

## 4.7 Módulo 7. Recordatorios Automáticos

| ID | Requisito | Prioridad |
| :---: | ----- | :---: |
| RF-46 | El sistema debe enviar recordatorio de cita por WhatsApp 24 horas antes | S |
| RF-47 | El sistema debe enviar recordatorio por email | S |
| RF-48 | El sistema debe permitir configurar el mensaje del recordatorio | C |
| RF-49 | El sistema debe registrar si el recordatorio fue enviado exitosamente | S |

## 4.8 Módulo 8. Reportes y Estadísticas

| ID | Requisito | Prioridad |
| :---: | ----- | :---: |
| RF-50 | El sistema debe mostrar ingresos del mes en curso | M |
| RF-51 | El sistema debe mostrar número de pacientes nuevos por mes | S |
| RF-52 | El sistema debe mostrar los tratamientos más realizados | C |
| RF-53 | El sistema debe mostrar pacientes con saldo pendiente | M |
| RF-54 | El sistema debe mostrar tasa de asistencia a citas | C |
| RF-55 | Los reportes deben poder exportarse a Excel o PDF | S |

## 4.9 Módulo 9. Integración con RIPS

**Marco normativo vigente:** Resolución 948 de 2026 del Ministerio de Salud (deroga la Resolución 2275 de 2023 y sus modificatorias), que reglamenta el RIPS en **formato JSON** como soporte de la Factura Electrónica de Venta (FEV) en salud. Bajo esta norma, el RIPS se transmite junto con la FEV (XML) al **Mecanismo Único de Validación (MUV)** del Ministerio, que devuelve un **Código Único de Validación (CUV)** al aprobarlo.

**Delimitación de alcance:** el envío del RIPS al MUV y la obtención del CUV requieren que la factura esté acoplada a un facturador electrónico habilitado ante la DIAN. Como la **facturación electrónica DIAN está fuera del alcance de este proyecto** (sección 13), OdontoSoft **genera el archivo RIPS en formato JSON** con la estructura y campos exigidos por los Documentos Técnicos 1 y 2 del Ministerio, para que el consultorio lo radique manualmente o lo incorpore a un facturador electrónico externo cuando lo adquiera. La automatización del envío al MUV y la gestión del CUV quedan fuera de alcance de esta versión.

| ID | Requisito | Prioridad |
| :---: | ----- | :---: |
| RF-56 | El sistema debe generar el archivo RIPS en formato **JSON**, conforme a la estructura vigente del Ministerio de Salud (Resolución 948 de 2026), a partir de las atenciones y tratamientos registrados por paciente | M |
| RF-57 | El sistema debe validar que los datos obligatorios para el RIPS (tipo y número de documento del paciente, código CUPS del procedimiento, diagnóstico, fecha de atención) estén completos antes de generar el archivo, y debe listar las atenciones incompletas cuando falte algún dato | M |
| RF-58 | El sistema debe permitir descargar el archivo JSON generado, para su radicación manual o su uso por un facturador electrónico externo; el envío automático al Mecanismo Único de Validación (MUV) y la obtención del CUV no forman parte de esta versión | S |
| RF-59 | El sistema debe registrar el histórico de archivos RIPS generados, indicando el periodo, el usuario que los generó y la fecha de generación | S |

---

# 5. Requisitos No Funcionales

## 5.1 Seguridad

| ID | Requisito |
| ----- | ----- |
| RNF-01 | Las contraseñas deben encriptarse con bcrypt (mínimo 10 rondas) |
| RNF-02 | Todas las comunicaciones deben usar HTTPS en producción |
| RNF-03 | El sistema debe implementar rate limiting en el endpoint de login |
| RNF-04 | Los datos personales deben cumplir la Ley 1581 de 2012 (Colombia) |
| RNF-05 | La historia clínica sólo es accesible por personal autorizado |
| RNF-06 | Se debe registrar un log de accesos al sistema |

## 5.2 Rendimiento

| ID | Requisito |
| ----- | ----- |
| RNF-07 | El sistema debe responder en menos de 2 segundos para operaciones comunes |
| RNF-08 | El listado de pacientes debe usar paginación (máximo 20 por página) |
| RNF-09 | Las imágenes de la historia clínica deben optimizarse antes de guardarse |

## 5.3 Usabilidad

| ID | Requisito |
| ----- | ----- |
| RNF-10 | La interfaz debe ser responsive (funcionar en tablet y desktop) |
| RNF-11 | El sistema debe mostrar mensajes de error claros al usuario |
| RNF-12 | Las operaciones destructivas (eliminar, cancelar) deben pedir confirmación |
| RNF-13 | El sistema debe funcionar en Chrome, Firefox, Edge y Safari actuales |

## 5.4 Disponibilidad y mantenibilidad

| ID | Requisito |
| ----- | ----- |
| RNF-14 | El sistema debe estar disponible 99% del tiempo en horario laboral |
| RNF-15 | Debe existir un mecanismo de backup diario de la base de datos |
| RNF-16 | El código debe seguir una arquitectura por capas (rutas, controladores, servicios, modelos) que facilite el mantenimiento |
| RNF-17 | El sistema debe registrar logs de errores del servidor para facilitar la depuración |

---

# 6. Reglas de Negocio

| ID | Regla |
| :---: | ----- |
| RN-01 | No se puede crear una cita si el horario solicitado se cruza con otra cita ya programada o confirmada para el mismo odontólogo. |
| RN-02 | Un paciente no puede registrarse dos veces con el mismo número y tipo de documento. |
| RN-03 | Solo el rol ODONTÓLOGO puede crear o editar el **contenido clínico** (evoluciones y odontograma) de la historia clínica; el ADMIN no tiene acceso de edición a dicho contenido. |
| RN-04 | Una factura no puede eliminarse una vez generada; solo puede anularse dejando registro de la anulación. |
| RN-05 | El saldo pendiente de una factura se recalcula automáticamente cada vez que se registra un abono. |
| RN-06 | Un material no puede tener stock negativo; toda salida de inventario valida existencias antes de confirmarse. |
| RN-07 | Un paciente inactivo no puede ser agendado para nuevas citas hasta que sea reactivado. |
| RN-08 | El recordatorio automático solo se envía si la cita está en estado Programada o Confirmada. |
| RN-09 | Toda acción sobre la historia clínica (creación, edición) queda registrada con el usuario y la fecha/hora que la realizó. |
| RN-10 | El ADMIN puede **desactivar** (no editar ni eliminar) una evolución clínica o un registro de historia clínica en caso de error de captura, dejando constancia de quién y cuándo la desactivó; el registro desactivado permanece visible con esa marca para trazabilidad, pero no vuelve a mostrarse como información clínica vigente. Esta acción administrativa no equivale a la edición de contenido clínico restringida en RN-03. |

---

# 7. Modelo de Datos (Entidades Principales)

*Modelo conceptual orientado a documentos (MongoDB/Mongoose). La mayoría de las relaciones se representan mediante referencias (ObjectId) entre colecciones. Excepción: el odontograma y las evoluciones clínicas se modelan como **subdocumentos embebidos** dentro de `HistoriaClínica` (no como colecciones independientes), ya que siempre se consultan junto con la historia clínica del paciente y su tamaño está acotado (32 dientes, evoluciones de un solo paciente).*

| Entidad | Atributos principales | Relaciones |
| ----- | ----- | ----- |
| **Usuario** | nombre, email, passwordHash, rol, estado | — |
| **Paciente** | nombres, apellidos, tipoDocumento, numeroDocumento, fechaNacimiento, sexo, teléfono, email, dirección, ciudad, EPS, grupoSanguíneo, alergias, observaciones, estado | 1 → N Citas, 1 → 1 HistoriaClínica, 1 → N Facturas |
| **Cita** | paciente, odontólogo, fecha, hora, duración, motivo, estado | N → 1 Paciente |
| **HistoriaClínica** | paciente, antecedentesMédicos, odontograma (subdocumento embebido), evoluciones\[\] (subdocumentos embebidos), adjuntos\[\] | 1 → 1 Paciente |
| ↳ *Odontograma (embebido)* | dientes\[32\] (número, estado, observaciones) | Subdocumento de HistoriaClínica, sin colección propia |
| ↳ *Evolución clínica (embebida)* | fecha, odontólogo, descripción, tratamientosRealizados\[\] | Subdocumento de HistoriaClínica, sin colección propia |
| **Factura** | paciente, tratamientos\[\], valorTotal, saldoPendiente, estado, fechaEmisión | N → 1 Paciente |
| **Pago** | factura, valor, método, fecha | N → 1 Factura |
| **Material** | nombre, descripción, stockActual, stockMínimo, costoUnitario, proveedor | — |
| **MovimientoInventario** | material, tipo (entrada/salida), cantidad, fecha, responsable | N → 1 Material |
| **Recordatorio** | cita, canal (WhatsApp/email), mensaje, estadoEnvío, fechaEnvío | N → 1 Cita |
| **ArchivoRIPS** | periodo, formato (JSON), rutaArchivo, generadoPor, fechaGeneración, atencionesIncluidas\[\] | N → N Facturas (las atenciones incluidas en el periodo) |

**Nota técnica:** si en una fase posterior se requiere consultar evoluciones clínicas de forma independiente (por ejemplo, un reporte global de evoluciones entre todos los pacientes), se recomienda migrar `evoluciones` a una colección independiente referenciada por `paciente`. Para el alcance de este SRS, el diseño embebido es suficiente y más simple de implementar con Mongoose.

---

# 8. Casos de Uso Principales

## CU-01 Agendar cita

- **Actor principal:** Recepcionista.
- **Precondición:** El paciente debe estar registrado y activo.
- **Flujo básico:** El recepcionista busca al paciente → selecciona fecha/hora en la agenda → el sistema valida que no haya cruce de horario (RN-01) → se define motivo y duración → la cita queda en estado "Programada".
- **Flujo alterno:** Si hay cruce de horario, el sistema muestra un mensaje de error y sugiere horarios disponibles.

## CU-02 Registrar evolución clínica y odontograma

- **Actor principal:** Odontólogo.
- **Precondición:** El paciente tiene una historia clínica creada.
- **Flujo básico:** El odontólogo abre la historia clínica del paciente → actualiza el estado de los dientes en el odontograma → registra una evolución clínica con fecha y tratamientos realizados → adjunta imágenes si aplica.

## CU-03 Generar factura y registrar pago

- **Actor principal:** Recepcionista.
- **Precondición:** Existen tratamientos registrados para el paciente.
- **Flujo básico:** El recepcionista crea una factura seleccionando los tratamientos realizados → el sistema calcula el valor total en COP → se registra un pago (total o parcial) → el sistema recalcula el saldo pendiente (RN-05).

## CU-04 Enviar recordatorio de cita

- **Actor principal:** Sistema (proceso automático).
- **Precondición:** La cita está en estado Programada o Confirmada y falta 24 horas para su realización.
- **Flujo básico:** El sistema identifica citas próximas → envía recordatorio por WhatsApp y/o email → registra el resultado del envío.

## CU-05 Generar archivo RIPS

- **Actor principal:** Administrador o Recepcionista (según se defina en el análisis detallado).
- **Precondición:** Existen atenciones con tratamientos y facturación registrados en el periodo a reportar.
- **Flujo básico:** El usuario selecciona el periodo a reportar → el sistema recopila las atenciones del periodo → valida que los datos obligatorios estén completos (RF-57) → genera el archivo RIPS en formato JSON conforme a la Resolución 948 de 2026 (RF-56) → el usuario lo descarga (RF-58) → el sistema registra el archivo generado en el histórico (RF-59).
- **Flujo alterno:** Si falta un dato obligatorio en alguna atención (por ejemplo, tipo de documento del paciente o código CUPS), el sistema lista las atenciones incompletas y no genera el archivo hasta que se corrijan.
- **Fuera de este caso de uso:** el envío del archivo al Mecanismo Único de Validación (MUV) y la obtención del CUV, que dependen de un facturador electrónico DIAN externo al sistema.

---

# 9. Priorización de Requisitos (Resumen MoSCoW)

| Prioridad | Cantidad aproximada de RF | Descripción |
| :---: | :---: | ----- |
| **Must have (M)** | 41 | Funcionalidad crítica para el MVP: autenticación, pacientes, citas, historia clínica/odontograma, facturación básica, generación y validación de RIPS |
| **Should have (S)** | 14 | Importante pero no bloquea el lanzamiento inicial: exportar PDF, recordatorios, reportes exportables, formato de exportación RIPS, histórico de generación RIPS |
| **Could have (C)** | 4 | Deseable si el tiempo lo permite: proveedor de materiales, tasa de asistencia, configuración de mensajes |

---

# 10. Matriz de Trazabilidad (Objetivos → Módulos)

| Objetivo específico | Módulo(s) relacionado(s) |
| ----- | ----- |
| Autenticación segura por roles | Módulo 1 (RF-01 a RF-08) |
| Gestión centralizada de pacientes | Módulo 2 (RF-09 a RF-16) |
| Historia clínica y odontograma digital | Módulo 4 (RF-25 a RF-32) |
| Agenda de citas sin cruces | Módulo 3 (RF-17 a RF-24) |
| Facturación y pagos en COP | Módulo 5 (RF-33 a RF-40) |
| Control de inventario | Módulo 6 (RF-41 a RF-45) |
| Recordatorios automáticos | Módulo 7 (RF-46 a RF-49) |
| Reportes gerenciales | Módulo 8 (RF-50 a RF-55) |
| Integración con RIPS | Módulo 9 (RF-56 a RF-59) |

---

# 11. Riesgos del Proyecto

| ID | Riesgo | Impacto | Probabilidad | Mitigación |
| :---: | ----- | :---: | :---: | ----- |
| R-01 | Integración con WhatsApp Business API más compleja o costosa de lo previsto | Alto | Media | Definir un plan alterno solo con email; evaluar proveedores desde etapa temprana |
| R-02 | Cambios de alcance solicitados por el instructor/cliente durante el desarrollo | Medio | Alta | Congelar el alcance del MVP con este SRS; gestionar cambios como nuevas versiones |
| R-03 | Manejo inadecuado de datos sensibles de salud (incumplimiento Ley 1581 / Resolución 1995) | Alto | Baja | Cifrado de datos sensibles, control de acceso por rol, logs de auditoría |
| R-04 | Curva de aprendizaje del equipo con Angular/Mongoose | Medio | Media | Capacitación previa y documentación técnica del stack |
| R-05 | Pérdida de información por falta de backups | Alto | Baja | Implementar backup diario automatizado (RNF-15) |
| R-06 | La Resolución 948 de 2026 (RIPS/JSON) es reciente y ha tenido cambios de reglas de validación por fases (junio y julio de 2026); los Documentos Técnicos que definen la estructura exacta del JSON pueden actualizarse sin necesidad de una nueva resolución | Alto | Media | Generar el RIPS contra la versión vigente de los Documentos Técnicos 1 y 2 del Ministerio al momento del desarrollo; revisar el micrositio oficial antes de cada entrega; delimitar claramente que el envío al MUV/CUV no es responsabilidad de esta versión (ver Módulo 9) |

---

# 12. Restricciones Técnicas

| Restricción | Detalle |
| ----- | ----- |
| Entorno de desarrollo | GitHub Codespaces |
| Entorno de publicación / despliegue | AWS EC2 (instancia única t2.micro/t3.micro, sin Load Balancer, capa gratuita 12 meses) sirviendo backend (Node/Express) y frontend (Angular build) mediante Nginx como proxy inverso |
| Base de datos en producción | MongoDB Atlas, tier gratuito M0 (512 MB, gratis permanente), alojado en la misma región que la instancia EC2 |
| Node.js | v24 (LTS activa a la fecha de este documento — junio 2026; verificar vigencia antes del despliegue en producción, ver [nodejs.org/en/about/previous-releases](https://nodejs.org/en/about/previous-releases)) |
| ODM / ORM | Mongoose v8.x |
| Moneda | COP (Peso Colombiano) |
| Zona horaria | America/Bogota (UTC-5) |
| Idioma | Español |
| Documentos de identidad | CC, CE, TI, PA, RC |
| Cumplimiento legal | Ley 1581 de 2012 (Habeas Data), Resolución 1995 de 1999 (Gestión de Historias Clínicas) y Resolución 948 de 2026 (RIPS como soporte de la Factura Electrónica de Venta en salud, Ministerio de Salud) |
| Control de versiones | Git / GitHub |

---

# 13. Fuera del Alcance

- Facturación electrónica DIAN.
- Envío automático del RIPS al Mecanismo Único de Validación (MUV) del Ministerio de Salud y obtención del Código Único de Validación (CUV); esto depende de la integración con un facturador electrónico DIAN, ya excluida arriba. OdontoSoft solo genera el archivo JSON del RIPS (ver Módulo 9, RF-56 a RF-59).
- Integración con seguros o EPS.
- App móvil nativa.
- Múltiples sedes.
- Múltiples odontólogos por consultorio.
- Pasarela de pagos en línea (los pagos se registran manualmente en el sistema tras recibir efectivo o transferencia).
- Autenticación multifactor (verificación en dos pasos adicional a usuario y contraseña).

---

# 14. Instrumentos de Recolección de Datos

## 14.1 Instrumentos aplicados

Para levantar y validar los requisitos anteriores se aplicaron dos instrumentos: una **entrevista semiestructurada** al odontólogo (como dueño del proceso clínico y del negocio) y una **encuesta breve** al personal de recepción, orientada a los procesos administrativos del día a día.

### 14.1.1 Entrevista al odontólogo / propietario del consultorio

**Objetivo:** identificar los procesos clínicos actuales, sus puntos de dolor y los requisitos indispensables para el odontograma y la historia clínica.

Preguntas guía:

1. ¿Cómo registra actualmente la historia clínica y el odontograma de sus pacientes?
2. ¿Qué información considera indispensable tener a la mano antes de atender a un paciente?
3. ¿Quién debe tener acceso a la historia clínica y quién no debería tenerlo?
4. ¿Cómo maneja hoy el inventario de materiales e insumos?
5. ¿Qué reportes le gustaría revisar semanal o mensualmente para tomar decisiones?
6. ¿Ha tenido problemas de cruces de horario o inasistencia de pacientes? ¿Cómo los maneja hoy?

### 14.1.2 Encuesta al personal de recepción

**Objetivo:** validar los requisitos de agenda, pacientes, facturación y recordatorios desde la perspectiva operativa diaria.

Preguntas guía (escala de 1 a 5 de importancia, más pregunta abierta):

1. ¿Qué tan frecuentes son los errores o cruces al agendar citas manualmente?
2. ¿Qué datos del paciente consulta con más frecuencia al recibirlo?
3. ¿Cómo registra hoy los pagos y abonos de los pacientes?
4. ¿Qué canal prefieren los pacientes para recibir recordatorios: WhatsApp, email o llamada?
5. ¿Qué tan útil sería un sistema que le avise automáticamente cuando un material esté por agotarse?

## 14.2 Hallazgos principales

- La ausencia de una agenda centralizada es la causa más frecuente de cruces de horario, lo que sustenta la prioridad **Must have** de RF-21 (control de conflictos de horario).
- El odontólogo enfatizó que la historia clínica debe ser de **uso exclusivo** del rol clínico, lo que se formalizó en RF-32 y RN-03.
- El personal de recepción señaló que la mayoría de pagos se hacen por transferencia y efectivo, confirmando que una pasarela de pagos en línea no es prioritaria para esta primera versión (ver sección 13, Fuera del Alcance).
- WhatsApp fue identificado como el canal preferido por los pacientes para recordatorios, lo que justifica que RF-46 se mantenga aunque su implementación técnica represente el riesgo R-01.

---

# 15. Cronograma Tentativo (Fases del Proyecto)

| Fase | Contenido | Duración estimada |
| :---: | ----- | :---: |
| 1. Análisis y diseño | SRS (este documento), modelo de datos, diseño de interfaz | 2 semanas |
| 2. Backend base | Autenticación, modelo Usuario/Paciente, API REST inicial | 2 semanas |
| 3. Módulos clínicos | Citas, historia clínica, odontograma | 3 semanas |
| 4. Módulos administrativos | Facturación, pagos, inventario | 2 semanas |
| 5. Recordatorios, reportes y RIPS | Integración WhatsApp/email, dashboard de reportes, generación y validación de archivos RIPS | 2 semanas |
| 6. Pruebas y ajustes | Pruebas funcionales, corrección de errores, documentación final | 1 semana |
| 7. Despliegue | Publicación en una instancia EC2 única (backend y frontend con Nginx) conectada a MongoDB Atlas M0, configuración de HTTPS y variables de entorno de producción, dentro de la capa gratuita (ver sección 12) | 1 semana |

---

# 16. Aprobación del Documento

| Rol | Nombre | Firma / Aceptación | Fecha |
| ----- | ----- | :---: | :---: |
| Instructor | Nelson Armando Serrano Hincapié | | |
| Desarrollador | Juan Carlos Garcés Sierra | | |
| Desarrollador | Juan Pablo Méndez Gil | | |
