# ODONTOSOFT EXPLICADO EN SIMPLE — PARA QUIEN NO SABE NADA DE ESTO

**¿Para quién es este documento?** Para cualquier persona sin conocimientos de programación ni de sistemas: un familiar, un cliente, un instructor que evalúa el resultado final, o el propio dentista que va a usar el sistema. No vas a encontrar aquí código ni tecnicismos sin explicar — cada palabra "rara" se explica con una comparación de la vida real.

---

## 1. ¿QUÉ ES ODONTOSOFT, EN UNA FRASE?

OdontoSoft es un **programa de computador al que se accede desde internet** (como Gmail o Netflix, pero para un consultorio odontológico) que reemplaza el cuaderno, las carpetas de papel y el Excel con los que normalmente se administra un consultorio dental pequeño.

En vez de tener:
- una libreta para las citas,
- carpetas físicas con la historia clínica de cada paciente,
- un cuaderno de cuentas para las facturas,
- y otro cuaderno para controlar los materiales que se van gastando (guantes, anestesia, algodón...),

todo eso vive **en un solo sitio, en internet**, ordenado, buscable, y sin que se pueda perder o mojar con agua como el papel.

---

## 2. ¿QUÉ PROBLEMA RESUELVE REALMENTE?

Un consultorio odontológico independiente (uno que no pertenece a una cadena grande) normalmente tiene tres dolores de cabeza:

1. **Los programas que existen para esto son caros.** Cuestan entre 200.000 y 500.000 pesos colombianos *cada mes*, como una suscripción.
2. **Esos programas son genéricos.** Están hechos para "cualquier consultorio" y no calzan exactamente con cómo trabaja un profesional en particular.
3. **El dueño del consultorio no es dueño de sus propios datos.** Si mañana el proveedor del software cierra o sube el precio, el consultorio puede quedar atrapado o perder su información.

OdontoSoft se construyó a la medida, conversando directamente con una odontóloga real con más de 10 años de experiencia, para resolver exactamente su flujo de trabajo, sin mensualidades eternas y con los datos siempre bajo control del consultorio.

---

## 3. ¿CÓMO SE VE "POR FUERA"? (LA EXPERIENCIA DE USO)

Quien usa OdontoSoft simplemente abre un navegador de internet (como Chrome), entra a una dirección web, escribe su usuario y contraseña, y ve una pantalla con menús. No instala nada en su computador — es como entrar a la página del banco.

Dependiendo de **quién** entra, ve cosas distintas. Hay tres tipos de usuario (roles):

| Rol | Es como... | Puede hacer |
|---|---|---|
| **Administrador** | El dueño del consultorio | Ve todo, controla usuarios, ve reportes financieros |
| **Odontólogo/a** | El profesional que atiende | Ve su agenda, escribe la historia clínica, revisa el odontograma |
| **Recepcionista** | Quien atiende el mostrador | Agenda citas, registra pacientes nuevos, cobra facturas |

Esto se llama **control de acceso por roles**: cada quien ve y puede hacer solamente lo que le corresponde a su función, igual que en un banco un cajero no puede aprobar un crédito hipotecario.

---

## 4. LAS 9 "CAJAS" EN LAS QUE ESTÁ DIVIDIDO EL SISTEMA

Todo el sistema se organiza en 9 partes (módulos). Piensa en cada una como un cajón distinto de un archivador físico:

1. **🔐 Autenticación** — la puerta de entrada. Aquí se valida usuario/contraseña y se decide qué puede ver cada persona según su rol.
2. **👥 Pacientes** — la ficha de cada paciente: nombre, documento, contacto. Se puede buscar por nombre, apellido o número de documento, incluso sin escribir tildes.
3. **📅 Citas y Agenda** — el calendario del consultorio. Evita que dos pacientes queden agendados en el mismo horario con el mismo profesional (eso se llama "detección de conflictos").
4. **🦷 Historia Clínica** — el expediente médico-dental de cada paciente: qué se le ha hecho, diente por diente (el "odontograma", que es literalmente un mapa de los 32 dientes donde se marca qué tiene cada uno), con fotos si hace falta.
5. **💰 Facturación** — las cuentas de cobro. Permite que un paciente pague en varias partes (abonos) y con distintos métodos de pago.
6. **📦 Inventario** — el control de materiales que se gastan (guantes, anestesia, etc.), con una alerta automática cuando algo se está acabando.
7. **🔔 Recordatorios** — envía automáticamente un correo al paciente un día antes de su cita, para que no se le olvide.
8. **📊 Reportes** — resúmenes financieros y clínicos que el administrador puede descargar en Excel o PDF, en vez de sumar cuentas a mano.
9. **🏥 RIPS** — un archivo especial que exige el Ministerio de Salud de Colombia para reportar la atención brindada. Es un requisito legal, no opcional, y el sistema lo genera automáticamente en el formato que pide la ley (Resolución 2275 de 2023).

---

## 5. ¿CÓMO FUNCIONA "POR DENTRO"? (SIN TECNICISMOS)

Imagina un restaurante:

- **El salón donde comen los clientes** es lo que la gente ve en su navegador: botones, formularios, el calendario de citas. A esto técnicamente se le llama **frontend**. En este proyecto se construyó con una herramienta llamada **Angular**.
- **La cocina**, que el cliente nunca ve pero que prepara todo lo que pidió el salón, es el **backend**: recibe la petición ("dame la lista de pacientes"), la procesa, y responde. Se construyó con **Node.js** (el "motor" que ejecuta las instrucciones) y **Express** (que ordena cómo se reciben los pedidos).
- **La despensa/bodega**, donde se guarda todo permanentemente, es la **base de datos**: aquí quedan realmente guardados los pacientes, las citas, las facturas. Se usa **MongoDB**, que guarda la información en un formato parecido a fichas o documentos, no en tablas rígidas de Excel.

Estas tres partes están separadas a propósito (esto se llama **arquitectura en capas**): si un día se quiere cambiar cómo se ve la aplicación, no hay que tocar la cocina ni la bodega. Es la misma lógica de que en un restaurante puedes remodelar el salón sin cerrar la cocina.

### ¿Cómo sabe el sistema quién soy cuando entro?

Cuando alguien inicia sesión correctamente, el sistema le entrega algo parecido a **una pulsera de un concierto**: un código (llamado *token* o JWT) que el navegador guarda y muestra en cada petición siguiente ("dame mis citas de hoy"), para no tener que escribir la contraseña cada vez. Si la pulsera es falsa o venció, el sistema no deja pasar. Esa pulsera además dice qué rol tiene la persona, por eso el sistema sabe qué mostrarle.

### ¿Dónde vive todo esto físicamente?

No hay un computador especial en el consultorio funcionando como "servidor". Todo vive en internet, en servicios que alquilan esa capacidad:
- El salón (frontend) y la cocina (backend) viven en un servicio llamado **Render**.
- La bodega (base de datos) vive en un servicio llamado **MongoDB Atlas**.

Esto significa que el consultorio no necesita comprar ni mantener un servidor propio, y se puede entrar desde cualquier computador, tablet o celular con internet.

---

## 6. UN EJEMPLO DE PRINCIPIO A FIN (UN DÍA CUALQUIERA)

1. La **recepcionista** entra con su usuario y contraseña.
2. Ve que llega un paciente nuevo. Lo registra en el módulo de **Pacientes** (nombre, documento, teléfono).
3. Le agenda una cita para el jueves a las 3pm con la doctora, en el módulo de **Citas**. El sistema revisa solo que ese horario esté libre para esa doctora.
4. Un día antes de la cita, el sistema **automáticamente** le manda un correo al paciente recordándole la cita (módulo de **Recordatorios**), sin que nadie tenga que acordarse de hacerlo.
5. El jueves, la **doctora** entra con su propio usuario, ve su agenda del día, atiende al paciente y anota en la **Historia Clínica** qué le hizo, marcando el diente correspondiente en el odontograma.
6. Al terminar, la recepcionista genera la **factura**, el paciente paga la mitad de una vez y queda un saldo pendiente (pago parcial).
7. Al final del mes, el **administrador** entra al módulo de **Reportes** y descarga en Excel cuánto ingresó el consultorio ese mes, sin tener que sumar facturas a mano.
8. Cuando corresponde, el sistema genera el archivo **RIPS** que se debe enviar al Ministerio de Salud, cumpliendo con la ley.

Todo esto sin papel, sin carpetas físicas, y con cada usuario viendo solo lo que le corresponde según su rol.

---

## 7. GLOSARIO RÁPIDO DE PALABRAS "RARAS" USADAS ARRIBA

| Palabra | Qué significa en simple |
|---|---|
| Frontend | Lo que el usuario ve y toca en pantalla |
| Backend | El "cerebro" que procesa todo por detrás, sin interfaz visual |
| Base de datos | El lugar donde se guarda permanentemente toda la información |
| API / endpoint | Un "punto de pedido" concreto al que el frontend le pregunta algo a la cocina (ej: "dame los pacientes") |
| Rol | El "cargo" de la persona dentro del sistema (Administrador, Odontólogo, Recepcionista) |
| Token / JWT | La "pulsera digital" que prueba que ya iniciaste sesión, sin repetir la contraseña |
| Odontograma | El mapa de los 32 dientes donde se anota qué se le ha hecho a cada uno |
| RIPS | Reporte obligatorio que exige el gobierno colombiano sobre la atención en salud brindada |
| Despliegue / deploy | El proceso de "publicar" el sistema en internet para que cualquiera pueda usarlo desde su navegador |
| Nube / cloud | Computadores de otra empresa (Render, MongoDB Atlas) que alquilan su capacidad, en vez de tener un servidor propio en el consultorio |

---

## 8. PARA PROFUNDIZAR

Este documento es la puerta de entrada en lenguaje simple. Si quieres entender el detalle técnico real de cómo se construyó cada pieza, la carpeta `docs/` tiene documentos más profundos y ordenados por tema (requisitos, roles, arquitectura del backend, base de datos, frontend, despliegue, etc.), y `docs/modulos/` tiene un documento por cada uno de los 9 módulos descritos en la sección 4.
