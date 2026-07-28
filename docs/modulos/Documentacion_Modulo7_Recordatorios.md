# Documentación del Módulo 7 — Recordatorios Automáticos

**Proyecto:** OdontoSoft
**Stack:** MEAN (MongoDB · Express · Angular · Node.js)
**Entorno de desarrollo:** GitHub Codespaces

---

## 0. Datos generales del módulo

| Campo | Valor |
|---|---|
| Módulo | 7 — Recordatorios Automáticos |
| Rama de trabajo | `feature/modulo7-recordatorios` |
| Requisitos cubiertos | RF-46 a RF-49 (todos prioridad Should/Could) |
| Regla de negocio | RN-08 |
| Depende de | Módulo 3 (Citas) |
| Responsable | Juan Carlos Garcés Sierra |
| Estado | ✅ Completado y probado end-to-end |

Con el cierre de este módulo, **las 10 reglas de negocio del SRS quedan completamente implementadas y verificadas** (ver `docs/matriz_reglas_negocio.md`).

### Permisos de este módulo (asumidos, ya que el SRS no los especifica explícitamente)

| Acción | ADMIN | ODONTOLOGO | RECEPCIONISTA |
|---|:---:|:---:|:---:|
| Configurar plantilla, ejecutar envío | ❌ | ❌ Sin acceso | ✅ |
| Consultar historial de recordatorios | ✅ (lectura) | ❌ Sin acceso | ✅ |

---

## 1. Decisión de alcance clave: envío real vs. simulado

Ninguno de los 4 requisitos de este módulo es *Must have* — todos son *Should* o *Could*. El envío real por WhatsApp requiere un proveedor externo (Twilio u otro) con fricciones de aprobación/costo desproporcionadas para el alcance académico del proyecto. Se decidió, de forma consciente y documentada (mismo criterio ya aplicado en el Módulo 9 del SRS, que excluye explícitamente el envío automático al MUV real):

- **RF-47 (email): implementación real** con `nodemailer` + **Ethereal** (servicio SMTP de pruebas gratuito, sin necesidad de cuenta real). Genera una URL de vista previa pública donde el correo puede verse exactamente como se habría recibido — evidencia concreta y verificable de que el envío funciona.
- **RF-46 (WhatsApp): implementación simulada**, con la misma interfaz que tendría una integración real (`enviarWhatsApp(cita, mensaje)` → `{ exito, error? }`). Incluye una probabilidad de fallo simulada (~5%) para poder ejercitar también el camino de `estado: FALLIDO` en las pruebas. Lista para conectar un proveedor real sin cambiar el resto del sistema.

---

## 2. Matriz de trazabilidad de requisitos

| Requisito | Descripción (SRS) | Implementado en | Método de verificación | Estado |
|---|---|---|---|---|
| RF-46 | Recordatorio de cita por WhatsApp 24h antes | `recordatorioService.js` (`enviarWhatsApp`, simulado); `recordatoriosJob.js` (cron cada hora) | `test-e2e-recordatorios.sh` bloque 8 (envío exitoso) | ✅ |
| RF-47 | Recordatorio por email | `recordatorioService.js` (`enviarEmail`, real vía nodemailer + Ethereal) | Verificación manual de `previewUrl` en el navegador | ✅ |
| RF-48 | Configurar el mensaje del recordatorio | Modelo `ConfiguracionMensaje` (singleton); componente `ConfigMensaje` | `test-e2e-recordatorios.sh` bloques 3, 5, 6, 7 | ✅ |
| RF-49 | Registrar éxito/fallo del envío | Modelo `Recordatorio` (`estado: ENVIADO/FALLIDO`, `detalleError`); componente `HistorialRecordatorios` | `test-e2e-recordatorios.sh` bloques 8, 11, 12 | ✅ |
| RN-08 | Solo se envía si la cita está Programada o Confirmada | `recordatorioService.js` → `obtenerCitasElegibles()`: filtro `estado: { $in: ['PROGRAMADA', 'CONFIRMADA'] }` | Prueba manual: solo citas en esos 2 estados aparecen como elegibles | ✅ |

---

## 3. Evidencia de pruebas

### 3.1 Pruebas automatizadas (backend) — `backend/tests/test-e2e-recordatorios.sh`

Resultado real de la ejecución final (posterior a la finalización del frontend completo):

```
=== 0. Limpieza de datos de pruebas anteriores ===
Limpieza completada.
=== 1. Login RECEPCIONISTA, ODONTOLOGO, ADMIN ===
Tokens obtenidos.
=== 2. Crear cita elegible para recordatorio (debe dar 201) ===
Status: 201
=== 3. RECEPCIONISTA obtiene configuración de plantilla (debe dar 200) ===
Status: 200
=== 4. ODONTOLOGO intenta obtener configuración (debe dar 403) ===
Status: 403
=== 5. RECEPCIONISTA actualiza plantilla (debe dar 200) ===
Status: 200
=== 6. Actualizar con plantilla vacia (debe dar 400) ===
Status: 400
=== 7. ADMIN intenta actualizar plantilla (debe dar 403) ===
Status: 403
=== 8. RECEPCIONISTA ejecuta envío de recordatorios (debe dar 200) ===
Resultados: 4 (EMAIL:ENVIADO, WHATSAPP:ENVIADO, EMAIL:ENVIADO, WHATSAPP:ENVIADO)
=== 9. ODONTOLOGO intenta ejecutar envío (debe dar 403) ===
Status: 403
=== 10. Ejecutar de nuevo, debe omitir por duplicado (verifica 'omitido') ===
Todos omitidos: true
=== 11. RECEPCIONISTA consulta historial (debe dar 200) ===
Status: 200
=== 12. ADMIN consulta historial (lectura permitida, debe dar 200) ===
Status: 200
=== 13. ODONTOLOGO intenta consultar historial (debe dar 403) ===
Status: 403
```

**Resultado global: 13/13 pruebas con el comportamiento esperado**, verificado en dos ejecuciones (backend recién completado, y tras finalizar todo el frontend).

> Nota sobre el bloque 8 (4 resultados en vez de 2): la limpieza inicial no eliminó una cita de prueba manual anterior con un motivo ligeramente distinto al filtro de limpieza del script, por lo que el job encontró 2 citas elegibles en lugar de 1. El comportamiento en sí fue correcto (4/4 `ENVIADO`); fue una observación sobre el dato de prueba, no un defecto de la lógica.

### 3.2 Pruebas puntuales adicionales durante el desarrollo

| Prueba | Resultado |
|---|---|
| Envío real de email verificado abriendo la `previewUrl` de Ethereal en el navegador | ✅ Correo visible con asunto, remitente y cuerpo correctos |
| Reemplazo de placeholders (`{nombrePaciente}`, `{fecha}`, `{hora}`) en el mensaje real | ✅ Verificado: "Hola Carlos Ramírez, te recordamos tu cita... el 18 de julio de 2026 a las 11:43" |
| Índice único `{cita, canal}` previene reenvío duplicado sin necesidad de lógica adicional en el cron | ✅ Confirmado en ejecuciones repetidas |
| Detección de citas elegibles limitada a `PROGRAMADA`/`CONFIRMADA`, dentro de ventana de 24h | ✅ Confirmado con script aislado (requiere registrar manualmente los modelos `Paciente`/`Usuario` para el `populate`, mismo patrón del Módulo 4) |

### 3.3 Pruebas manuales (frontend)

| Caso de prueba | Resultado esperado | Verificado |
|---|---|---|
| RECEPCIONISTA edita y guarda la plantilla | Mensaje de éxito, cambio persistido | ✅ |
| Clic en "Ejecutar envío ahora" | Muestra resultados con estado y enlace de vista previa | ✅ |
| Clic en "Ver correo →" | Abre la vista previa real de Ethereal | ✅ |
| Navegación a "Ver historial →" | Tabla con recordatorios y resumen de contadores | ✅ |
| ADMIN visita `/recordatorios` | Plantilla en solo lectura, sin botones de acción | ✅ |
| ADMIN visita el historial | Ve todo (lectura permitida) | ✅ |
| ODONTOLOGO intenta ambas rutas | Rutas cargan, peticiones HTTP rechazadas (403) | ✅ |

---

## 4. Arquitectura del módulo

```
Cliente (Angular)                              Servidor (Express)                            Base de datos (MongoDB)
┌─────────────────────────┐                   ┌───────────────────────────────┐            ┌──────────────────────┐
│  ConfigMensaje              │──GET/PUT config──▶│  recordatorioRoutes                │            │                       │
│  (plantilla, envío manual)     │──POST ejecutar────▶│   ├─ verificarToken                 │            │                       │
│                            │                   │   └─ permitirRoles(según ruta)       │            │                       │
│  HistorialRecordatorios       │──GET historial────▶│                                   │            │                       │
│                            │                   │  recordatorioController                │───────────▶│  ConfiguracionMensaje    │
│  RecordatorioService          │                   │   ├─ obtenerConfig / actualizarConfig │            │  (singleton)          │
│  (HttpClient)                │                   │   ├─ ejecutarEnvio                    │            │                       │
└─────────────────────────┘                   │   └─ listar                            │            │  Recordatorio          │
                                                │        │                              │            │  (índice único         │
                                                │        ▼                              │───────────▶│   cita+canal)          │
                                                │  recordatorioService.js                  │            │                       │
                                                │   ├─ obtenerCitasElegibles (RN-08)         │            └──────────────────────┘
                                                │   ├─ enviarEmail (nodemailer/Ethereal)     │
                                                │   └─ enviarWhatsApp (simulado)             │
                                                └───────────────────────────────┘
                                                            ▲
                                                            │ (también invocado automáticamente)
                                                ┌───────────────────────────────┐
                                                │  recordatoriosJob.js (node-cron) │
                                                │  cron.schedule('0 * * * *', ...)  │
                                                └───────────────────────────────┘
```

**Flujo de ejecución (manual o automático, misma función):** tanto el botón "Ejecutar envío ahora" del frontend como el cron programado invocan exactamente la misma función `ejecutarEnvioRecordatorios()` — no hay duplicación de lógica entre el disparo manual y el automático.

---

## 5. Decisiones técnicas y su justificación

| Decisión | Alternativa descartada | Motivo |
|---|---|---|
| Email real (nodemailer + Ethereal) / WhatsApp simulado | Simular ambos canales, o integrar un proveedor real de WhatsApp | Balance entre demostrar una integración real funcional (email) y evitar la fricción desproporcionada de aprobación/costo de WhatsApp Business API para el alcance académico |
| Ventana de "próximas 24 horas" en vez de "exactamente 24h antes" | Comparación de igualdad exacta de tiempo | Un job que corre periódicamente necesita un rango, no un instante exacto, para no perder la ventana por segundos de diferencia |
| Índice único `{cita, canal}` en `Recordatorio` | Verificar duplicados solo con una consulta previa en el servicio | Garantía a nivel de base de datos, inquebrantable incluso ante ejecuciones concurrentes del cron |
| Verificar `yaExiste` antes de enviar, no solo confiar en el índice único | Enviar primero y manejar el error de duplicado después | Evita gastar un envío real (email) innecesariamente si ya se sabe de antemano que sería rechazado |
| `ConfiguracionMensaje` como documento único (singleton perezoso) | Múltiples plantillas o un archivo de configuración estático | RF-48 pide configurar "el" mensaje, en singular; el patrón perezoso evita necesitar un script de seed obligatorio |
| Cron cada hora (`0 * * * *`) | Una vez al día | Con una ventana de elegibilidad de 24h, una frecuencia horaria asegura que una cita entre a su ventana poco después de corresponder, sin depender de que el ciclo diario coincida |
| Botón de "Ejecutar envío manual" además del cron automático | Solo el job automático, sin disparador manual | Útil para pruebas, demostración, y para que RECEPCIONISTA pueda forzar un envío inmediato sin esperar el próximo ciclo |
| Probabilidad simulada de ~5% de fallo en `enviarWhatsApp` | Simular siempre éxito | Permite ejercitar también el camino de `estado: FALLIDO` (necesario para RF-49), como tendría cualquier envío real |

---

## 6. Bitácora de commits

```
test: confirmar 13/13 pruebas end-to-end del Módulo 7 tras completar el frontend
feat(RF-49): implementar historial de recordatorios enviados en el frontend
feat(RF-48): implementar configuración de plantilla y envío manual de recordatorios
feat: agregar RecordatorioService para consumir configuración, ejecución e historial
test: agregar script end-to-end de recordatorios (13/13 exitosas)
feat(RF-46,RF-47): implementar programación automática de recordatorios con node-cron (cada hora)
feat(RF-49): implementar historial de recordatorios enviados
feat(RF-46,RF-47,RF-49): implementar ejecución de envío de recordatorios con registro de éxito/fallo
feat(RF-48): implementar configuración de la plantilla de mensaje de recordatorio
feat(RF-46): implementar envío simulado de recordatorios por WhatsApp
feat(RF-47): implementar envío real de recordatorios por email con nodemailer y Ethereal
feat(RN-08): implementar detección de citas elegibles para recordatorio (24h, Programada/Confirmada)
feat(RF-48,RF-49): agregar modelos Recordatorio y ConfiguracionMensaje
```

*(Orden: del más reciente al más antiguo.)*

---

## 7. Problemas encontrados y soluciones

| # | Problema | Causa raíz | Solución |
|---|---|---|---|
| 1 | `MissingSchemaError: Schema hasn't been registered for model "Paciente"` en pruebas aisladas con `node -e` | Mismo patrón ya visto en el Módulo 4: un script aislado que solo carga `recordatorioService.js` no registra los modelos `Paciente`/`Usuario` que necesita el `populate` | Se agregó `require('./src/models/Paciente')` y `require('./src/models/Usuario')` explícitamente antes de invocar la función en scripts de prueba aislados |
| 2 | 71 errores en cascada en `config-mensaje.ts` (`ngOnInit` faltante, tipos rotos, etc.) | El archivo quedó con contenido mezclado/corrupto tras varios intentos de edición fragmentada (una interfaz multilínea que se rompió al pegarse) | Reconstrucción completa del archivo: `Ctrl+A`, borrar todo, pegar el contenido íntegro de una sola vez, verificado con `wc -l` para confirmar el conteo de líneas esperado |
| 3 | El PR de un módulo anterior (Módulo 6) se cerró accidentalmente sin mergear ("Closed with unmerged commits") | Clic en el botón de cerrar en vez de "Merge pull request" | Reabrir el PR ("Reopen pull request"), resolver el conflicto resultante en `docs/roadmap.md` con `git merge origin/main` + `git checkout --ours`, y completar el merge correctamente |
| 4 | Estilo `.encabezado-pagina` no se aplicó visualmente (título y enlace de historial quedaron apilados en vez de alineados) | Posible colisión de nombre de clase `.btn-secundario` con un estilo preexistente, o el bloque SCSS no se guardó | Ajuste cosmético menor documentado; no afectó funcionalidad, solo presentación |

---

## 8. Actualización de la matriz de reglas de negocio

Con el cierre de este módulo, **RN-08 pasa a ✅**, completando las 10 reglas de negocio del SRS:

| Estado | Cantidad |
|---|---|
| ✅ Implementada y verificada | 10 de 10 (todas) |

---

## 9. Pendientes / mejoras futuras identificadas

- [ ] Reemplazar la simulación de WhatsApp por una integración real (Twilio u otro proveedor) si el proyecto avanza más allá del alcance académico — la interfaz de `enviarWhatsApp()` ya está diseñada para ese reemplazo sin tocar el resto del sistema.
- [ ] Migrar el envío de email de Ethereal (pruebas) a un proveedor SMTP real (SendGrid, Gmail API, etc.) para producción.
- [ ] Evaluar si el cron debería ajustarse a un horario laboral específico (por ejemplo, no enviar recordatorios de madrugada) en vez de correr cada hora sin restricción.
- [ ] Ajustar el estilo cosmético menor de alineación en la pantalla de configuración de plantilla.
- [ ] Considerar agregar un mecanismo de reintento automático para recordatorios marcados como `FALLIDO`.

---

## 10. Checklist de cierre de módulo

- [x] Todos los RF del módulo implementados (RF-46 a RF-49)
- [x] Regla de negocio aplicada y verificada (RN-08 — última pendiente del SRS)
- [x] Pruebas automatizadas ejecutadas y evidenciadas (`test-e2e-recordatorios.sh`, 13/13 exitosas, verificado dos veces)
- [x] Pruebas manuales de frontend verificadas
- [x] Commits con trazabilidad al SRS
- [x] Documentación del módulo completada
- [x] Matriz de reglas de negocio actualizada (10/10 completas)
- [ ] Pull Request creado hacia `main`
- [ ] Pull Request revisado y aprobado
- [ ] Merge a `main` realizado

---

## 11. Estructura final de archivos del módulo

```
backend/
├── src/
│   ├── models/
│   │   ├── Recordatorio.js           (índice único cita+canal)
│   │   └── ConfiguracionMensaje.js   (singleton)
│   ├── services/
│   │   └── recordatorioService.js
│   ├── controllers/
│   │   └── recordatorioController.js
│   ├── routes/
│   │   └── recordatorioRoutes.js
│   └── jobs/
│       └── recordatoriosJob.js       (node-cron, cada hora)
└── tests/
    ├── test-e2e-auth.sh                (Módulo 1)
    ├── test-e2e-pacientes.sh           (Módulo 2)
    ├── test-e2e-citas.sh               (Módulo 3)
    ├── test-e2e-historia-clinica.sh    (Módulo 4)
    ├── test-e2e-facturacion.sh         (Módulo 5)
    ├── test-e2e-inventario.sh          (Módulo 6)
    └── test-e2e-recordatorios.sh       (Módulo 7)

frontend/
└── src/app/
    ├── core/
    │   └── recordatorio.ts (RecordatorioService)
    └── features/
        └── recordatorios/
            ├── config-mensaje/
            │   ├── config-mensaje.ts
            │   ├── config-mensaje.html
            │   └── config-mensaje.scss
            └── historial-recordatorios/
                ├── historial-recordatorios.ts
                ├── historial-recordatorios.html
                └── historial-recordatorios.scss
```

---

**Estado final del módulo:** ✅ Completado, probado end-to-end (backend y frontend) y documentado. Listo para revisión y merge a `main`.
