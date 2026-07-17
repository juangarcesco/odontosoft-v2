# Documentación del Módulo 5 — Facturación y Pagos

**Proyecto:** OdontoSoft
**Stack:** MEAN (MongoDB · Express · Angular · Node.js)
**Entorno de desarrollo:** GitHub Codespaces

---

## 0. Datos generales del módulo

| Campo | Valor |
|---|---|
| Módulo | 5 — Facturación y Pagos |
| Rama de trabajo | `feature/modulo5-facturacion` |
| Requisitos cubiertos | RF-33 a RF-40 |
| Reglas de negocio | RN-04, RN-05 |
| Depende de | Módulo 2 (pacientes), Módulo 4 (tratamientos de historia clínica) |
| Responsable | Juan Carlos Garcés Sierra |
| Estado | ✅ Completado y probado end-to-end |

### Permisos de este módulo (matriz del SRS, sección 3.1)

| Acción | ADMIN | ODONTOLOGO | RECEPCIONISTA |
|---|:---:|:---:|:---:|
| Crear factura / registrar pagos / anular | ❌ (solo lectura) | ❌ (solo lectura) | ✅ CRUD |
| Consultar historial de facturas y descargar PDF | ✅ | ✅ | ✅ |
| Consultar tratamientos facturables | ❌ | ❌ | ✅ (exclusivo, ver decisión de diseño) |

---

## 1. Decisión de diseño clave: origen de los ítems facturados

El SRS exige que la factura muestre "tratamientos realizados" (RF-34). Se decidió vincular los ítems de la factura con los tratamientos reales registrados en la historia clínica (Módulo 4), priorizando trazabilidad sobre la alternativa de captura manual libre.

**El desafío:** RECEPCIONISTA (quien factura) no tiene ningún acceso a historia clínica (RNF-05, Módulo 4).

**La solución:** se creó un endpoint de "tratamientos facturables" (`GET /api/facturas/tratamientos-facturables/:pacienteId`) que expone **únicamente** los campos mínimos necesarios para facturar — `evolucionId`, `fecha`, `diente`, `procedimiento` — nunca la descripción clínica completa, el odontograma, los antecedentes médicos ni los adjuntos. Este endpoint es exclusivo de RECEPCIONISTA y actúa como una "ventana" controlada hacia la historia clínica, sin comprometer RNF-05.

---

## 2. Matriz de trazabilidad de requisitos

| Requisito | Descripción (SRS) | Implementado en | Método de verificación | Estado |
|---|---|---|---|---|
| RF-33 | Crear factura por atención | `facturaService.js` (`crearFactura`); componente `FormFactura` | `test-e2e-facturacion.sh` bloque 4 (201) | ✅ |
| RF-34 | Tratamientos realizados con valor en COP | `itemFacturaSchema`; endpoint de tratamientos facturables | `test-e2e-facturacion.sh` bloque 2; formulario con selección de tratamientos | ✅ |
| RF-35 | Registrar pagos parciales (abonos) | `facturaService.js` (`registrarPago`); componente `FormPago` | `test-e2e-facturacion.sh` bloque 7 (abono parcial) | ✅ |
| RF-36 | Calcular saldo pendiente automáticamente | `saldoPendiente` recalculado en `registrarPago()`, nunca recibido del cliente | `test-e2e-facturacion.sh` bloques 7-9 (saldo correcto tras cada abono) | ✅ |
| RF-37 | Método de pago (efectivo, transferencia, tarjeta) | Enum `metodoPago` en `pagoSchema` | Formulario `FormPago` con selector de método | ✅ |
| RF-38 | Exportar/imprimir factura en PDF | `facturaService.js` (`generarPdfFactura`, con `pdfkit`); descarga autenticada vía blob en el frontend | `test-e2e-facturacion.sh` bloque 10 (PDF válido, 1 página) | ✅ |
| RF-39 | Manejo de IVA (servicios de salud exentos) | Campo `iva` en `Factura.js`, `default: 0` | Revisión de modelo; prueba de creación con `iva: 0` | ✅ |
| RF-40 | Historial de pagos por paciente | `facturaService.js` (`listarFacturasPorPaciente`); componente `ListaFacturas` | `test-e2e-facturacion.sh` bloques 11-12 (200 para RECEPCIONISTA y ADMIN) | ✅ |
| RN-04 | Factura no se elimina, solo se anula | `facturaService.js` (`anularFactura`); campos `estado: ANULADA`, `motivoAnulacion`, `anuladaPor`, `fechaAnulacion` | `test-e2e-facturacion.sh` bloques 14-17 (motivo obligatorio, doble anulación rechazada, pagos bloqueados tras anular) | ✅ |
| RN-05 | Saldo se recalcula automáticamente con cada abono | `registrarPago()`: `saldoPendiente -= monto`, nunca recibido del cliente | `test-e2e-facturacion.sh` bloques 7-9 | ✅ |

---

## 3. Evidencia de pruebas

### 3.1 Pruebas automatizadas (backend) — `backend/tests/test-e2e-facturacion.sh`

Resultado real de la ejecución final (posterior a la finalización del frontend completo):

```
=== 0. Limpieza de datos de pruebas anteriores ===
Limpieza completada.
=== 1. Login RECEPCIONISTA, ODONTOLOGO, ADMIN ===
Tokens obtenidos.
=== 2. RECEPCIONISTA consulta tratamientos facturables (debe dar 200) ===
Status: 200
=== 3. ODONTOLOGO intenta consultar tratamientos facturables (debe dar 403) ===
Status: 403
=== 4. RECEPCIONISTA crea factura (debe dar 201) ===
Factura creada exitosamente
=== 5. ODONTOLOGO intenta crear factura (debe dar 403) ===
Status: 403
=== 6. Crear factura sin items (debe dar 400) ===
Status: 400
=== 7. Registrar abono parcial de 20000 (debe dar 200, saldo=40000) ===
Saldo: 40000 / Estado: PENDIENTE
=== 8. Intentar pagar monto mayor al saldo (debe dar 400) ===
Status: 400
=== 9. Registrar abono del saldo restante (debe dar 200, saldo=0, estado=PAGADA) ===
Saldo: 0 / Estado: PAGADA
=== 10. Descargar PDF de la factura (debe dar 200) ===
Status: 200
/tmp/factura-e2e.pdf: PDF document, version 1.3, 1 page(s)
=== 11. Historial de facturas por paciente (debe dar 200) ===
Status: 200
=== 12. ADMIN consulta historial (lectura permitida, debe dar 200) ===
Status: 200
=== 13. Crear segunda factura para probar anulación (debe dar 201) ===
Segunda factura: 6a5a1ee619fcaee0c4eb5e32
=== 14. Anular sin motivo (debe dar 400) ===
Status: 400
=== 15. Anular con motivo (debe dar 200) ===
Status: 200
=== 16. Anular de nuevo, ya anulada (debe dar 409) ===
Status: 409
=== 17. Pagar sobre factura anulada (debe dar 409) ===
Status: 409
```

**Resultado global: 17/17 pruebas con el comportamiento esperado**, verificado en dos ejecuciones (una tras el backend, otra tras completar el frontend).

### 3.2 Pruebas puntuales adicionales durante el desarrollo

| Prueba | Resultado |
|---|---|
| `valorTotal` de la factura calculado en el servidor a partir de los ítems, no recibido del cliente | ✅ Confirmado revisando el código y el comportamiento en pruebas |
| Índice único de historia clínica no interfiere con la creación de facturas (módulos independientes) | ✅ |
| `populate('pagos.registradoPor', ...)` funciona sin corrección adicional, gracias a definir `pagos` directamente como `[pagoSchema]` desde el diseño inicial (lección aplicada del bug del Módulo 4) | ✅ |
| Descarga de PDF con autenticación JWT vía blob en el frontend (patrón `createObjectURL` + enlace temporal) | ✅ Verificado manualmente en navegador |

### 3.3 Pruebas manuales (frontend)

| Caso de prueba | Resultado esperado | Verificado |
|---|---|---|
| RECEPCIONISTA crea factura seleccionando tratamientos | Redirige al historial, factura aparece PENDIENTE | ✅ |
| Total se recalcula en tiempo real al marcar/desmarcar ítems | Cálculo correcto sin recargar (`computed()`) | ✅ |
| Registro de abono parcial y final | Saldo se actualiza; estado cambia a PAGADA al llegar a $0 | ✅ |
| Intento de pago mayor al saldo | Mensaje de error, sin romper la página | ✅ |
| Descarga de PDF desde el navegador | Se descarga y abre correctamente con los datos reales | ✅ |
| Anulación de factura pendiente | Pide motivo, pasa a ANULADA con marca visible | ✅ |
| ODONTOLOGO/ADMIN visitan el historial de facturación | Ven todo en solo lectura, sin botones de pago/anular | ✅ |

---

## 4. Arquitectura del módulo

```
Cliente (Angular)                              Servidor (Express)                          Base de datos (MongoDB)
┌───────────────────────┐                     ┌──────────────────────────────┐            ┌─────────────────┐
│  FormFactura              │──GET tratamientos───▶│  facturaRoutes                   │            │                 │
│  (selección de ítems)      │  facturables         │   ├─ verificarToken               │            │                 │
│                          │──POST factura───────▶│   └─ permitirRoles(según ruta)     │            │                 │
│  ListaFacturas             │──GET historial──────▶│                                  │            │                 │
│   ├─ FormPago               │──PATCH pagar────────▶│  facturaController                │───────────▶│  Factura         │
│   └─ descarga PDF (blob)     │──GET pdf (blob)──────▶│   ├─ tratamientosFacturables       │            │  (pagos e ítems  │
│                          │──PATCH anular───────▶│   ├─ crear                       │            │   embebidos)     │
│  FacturaService             │                     │   ├─ pagar                       │            │                 │
│  (HttpClient, blobs)        │                     │   ├─ anular                      │            │                 │
└───────────────────────┘                     │   ├─ listarPorPaciente             │            │                 │
        ▲                                     │   └─ descargarPdf (pdfkit)          │            │                 │
        │ (interceptor JWT del Módulo 1)         └──────────────────────────────┘            └─────────────────┘
                                                              │
                                                              ▼
                                                    facturaService.js también
                                                    lee HistoriaClinica (Módulo 4)
                                                    para construir tratamientos facturables,
                                                    exponiendo solo campos mínimos (RNF-05)
```

**Flujo de descarga de PDF autenticado:** a diferencia de un simple `<a href>`, el frontend solicita el PDF vía `HttpClient` con `responseType: 'blob'` (así el interceptor JWT adjunta el header `Authorization`), convierte la respuesta en una URL temporal del navegador (`URL.createObjectURL`), simula un clic en un enlace invisible para disparar la descarga nativa, y libera la memoria con `URL.revokeObjectURL`.

---

## 5. Decisiones técnicas y su justificación

| Decisión | Alternativa descartada | Motivo |
|---|---|---|
| Endpoint dedicado de "tratamientos facturables" con vista limitada | Dar a RECEPCIONISTA acceso completo a `GET /historias-clinicas/paciente/:id` | Respeta RNF-05 (acceso restringido a historia clínica) sin bloquear la operación real de facturación |
| `valorTotal` calculado en el servidor a partir de los ítems | Recibir `valorTotal` directamente del cliente | Evita que un cliente manipule la petición para alterar el monto real de la factura |
| `saldoPendiente` recalculado restando el monto del valor almacenado (nunca recibido del cliente) | Recibir el nuevo saldo como parámetro | Implementación literal de RN-05; el saldo es siempre una consecuencia de los pagos, no un dato editable directamente |
| Cambio automático a `estado: PAGADA` al llegar el saldo a $0 | Requerir que alguien marque manualmente la factura como pagada | Reduce inconsistencia entre el saldo real y el estado mostrado |
| `estado: ANULADA` en vez de eliminar el documento | `deleteOne`/`findByIdAndDelete` | Implementación literal de RN-04 |
| `motivo` obligatorio al anular (a diferencia de RN-10 en Módulo 4, que no lo exige) | Anulación sin motivo, igual que la desactivación de evoluciones clínicas | Una anulación de factura tiene implicaciones contables/fiscales que ameritan justificación explícita |
| `pdfkit` en vez de un navegador headless (Puppeteer) para generar PDFs | Renderizar HTML a PDF con Puppeteer | Más liviano y directo para un documento simple y estructurado como una factura; evita la sobrecarga de un navegador completo en el servidor |
| Descarga de PDF vía blob + enlace temporal en el frontend | `<a href>` directo al endpoint | El endpoint requiere JWT; un `<a href>` normal no puede adjuntar el header `Authorization` |
| `pagos` definido directamente como `[pagoSchema]` desde el diseño inicial | Repetir el patrón `{ type: [...], default: [] }` | Lección aplicada del bug de `populate` en el Módulo 4 — se evitó el mismo problema desde el diseño, sin necesitar corrección posterior |

---

## 6. Bitácora de commits

```
test: confirmar 17/17 pruebas end-to-end del Módulo 5 tras completar el frontend
chore: agregar script de arranque rápido del entorno con captura automática de tokens
feat(RF-38,RF-40): implementar historial de facturas con descarga de PDF autenticada y registro de pagos
feat(RF-33): agregar enlaces de facturación desde el detalle del paciente
feat(RF-35,RF-36,RF-37): implementar componente de registro de pagos/abonos
feat(RF-33,RF-34): implementar creación de factura seleccionando tratamientos de historia clínica
feat: agregar FacturaService para consumir facturación, pagos y anulaciones
test: agregar script end-to-end de facturación (17/17 exitosas)
feat(RF-38): implementar exportación de factura a PDF con pdfkit
feat(RN-04): implementar anulación de factura sin eliminación física
feat(RF-40): implementar historial de facturas y pagos por paciente
feat(RF-35,RF-36,RF-37,RN-05): implementar registro de pagos con recálculo automático de saldo
feat(RF-33,RF-34): implementar creación de factura con cálculo de total en el servidor
feat(RF-34,RNF-05): implementar endpoint de tratamientos facturables con vista limitada de historia clínica
feat(RF-33,RF-34,RF-36,RF-37,RN-04): agregar modelo Factura con pagos embebidos y anulación
```

*(Orden: del más reciente al más antiguo.)*

---

## 7. Problemas encontrados y soluciones

| # | Problema | Causa raíz | Solución |
|---|---|---|---|
| 1 | `main` local y remoto divergieron (`have 1 and 18 different commits each`) al crear la rama del Módulo 5 | El PR del Módulo 4 se había mergeado en GitHub, pero el `main` local no se había actualizado antes de crear la nueva rama, y un merge previo aislado generó una historia distinta | `git fetch origin` + `git reset --hard origin/main` para sincronizar el `main` local exactamente con el remoto, tras confirmar que GitHub tenía la versión completa y correcta |
| 2 | El modelo `Factura.js` "desapareció" tras resolver el problema de ramas | El archivo nunca se creó realmente en el Codespace — la sesión se desvió a resolver el conflicto de ramas justo después de compartir el contenido, sin confirmar la creación | Se recreó el archivo y se confirmó con la prueba del modelo antes de continuar |
| 3 | Pruebas repetidas de facturas mezclaron datos de sesiones anteriores (saldo inesperado tras un pago) | Múltiples facturas de prueba con `estado: PENDIENTE` coexistían; `findOne({estado:'PENDIENTE'})` tomó una distinta a la esperada | Verificación directa en MongoDB (`db.facturas.find(...)`) antes de asumir un bug; limpieza de la colección antes de continuar |
| 4 | Bloque 12 del script E2E dio `401` en vez de `200` en una ejecución | Rate limiting (RNF-03, Módulo 1) activado tras múltiples intentos de login repetidos durante la sesión de pruebas — no un bug de la ruta | Reinicio del proceso del backend para resetear el contador en memoria del rate limiter; confirmado que la ruta funcionaba correctamente una vez fuera del bloqueo |
| 5 | Componente `form-pago` no aparecía en `git status` al intentar comitearlo | El componente nunca se creó en el Codespace — mismo patrón que el problema 2, contenido compartido en el chat pero no confirmado como creado | Verificación explícita con `ls` antes de asumir que un archivo existe |

---

## 8. Herramienta de soporte creada durante este módulo

Como consecuencia directa de los problemas 3 y 4 (necesidad frecuente de re-loguearse y verificar datos), se creó `scripts/dev-start.sh`: un script que levanta Mongo, backend y frontend, espera a que estén disponibles, y guarda los tokens de los 3 roles de prueba en `.tokens.env` (no versionado) para cargarlos rápidamente en cualquier terminal nueva con `source .tokens.env`. Documentado también en el README, sección "Solución de problemas comunes".

---

## 9. Pendientes / mejoras futuras identificadas

- [ ] Evaluar agregar un endpoint de "reembolso" o reversión de pagos si el negocio lo requiere (actualmente los pagos, una vez registrados, no pueden revertirse individualmente — solo la factura completa puede anularse).
- [ ] Considerar agregar validación de formato de fecha límite de pago si se requiere control de mora en el futuro.
- [ ] Evaluar si el manejo de IVA (actualmente fijo en 0) necesita configurarse para productos gravados si se integra el Módulo 6 (Inventario) con venta de insumos.
- [ ] Agregar la tabla de dependencias del proyecto al README (backend y frontend), pendiente de una sesión dedicada a consolidar toda la documentación del proyecto.

---

## 10. Checklist de cierre de módulo

- [x] Todos los RF del módulo implementados (RF-33 a RF-40)
- [x] Reglas de negocio aplicadas y verificadas (RN-04, RN-05)
- [x] Pruebas automatizadas ejecutadas y evidenciadas (`test-e2e-facturacion.sh`, 17/17 exitosas, verificado dos veces)
- [x] Pruebas manuales de frontend verificadas
- [x] Commits con trazabilidad al SRS
- [x] Documentación del módulo completada
- [x] Matriz de reglas de negocio actualizada (RN-04 y RN-05 verificadas)
- [ ] Pull Request creado hacia `main`
- [ ] Pull Request revisado y aprobado
- [ ] Merge a `main` realizado

---

## 11. Estructura final de archivos del módulo

```
backend/
├── src/
│   ├── models/
│   │   └── Factura.js               (items y pagos embebidos)
│   ├── services/
│   │   └── facturaService.js
│   ├── controllers/
│   │   └── facturaController.js
│   └── routes/
│       └── facturaRoutes.js
└── tests/
    ├── test-e2e-auth.sh              (Módulo 1)
    ├── test-e2e-pacientes.sh         (Módulo 2)
    ├── test-e2e-citas.sh             (Módulo 3)
    ├── test-e2e-historia-clinica.sh  (Módulo 4)
    └── test-e2e-facturacion.sh       (Módulo 5)

frontend/
└── src/app/
    ├── core/
    │   └── factura.ts (FacturaService)
    └── features/
        └── facturacion/
            ├── form-factura/
            │   ├── form-factura.ts
            │   ├── form-factura.html
            │   └── form-factura.scss
            ├── form-pago/
            │   ├── form-pago.ts
            │   ├── form-pago.html
            │   └── form-pago.scss
            └── lista-facturas/
                ├── lista-facturas.ts
                ├── lista-facturas.html
                └── lista-facturas.scss

scripts/
└── dev-start.sh    (arranque rápido del entorno completo)
```

---

**Estado final del módulo:** ✅ Completado, probado end-to-end (backend y frontend) y documentado. Listo para revisión y merge a `main`.
