# Documentación del Módulo 8 — Reportes y Estadísticas

**Proyecto:** OdontoSoft
**Stack:** MEAN (MongoDB · Express · Angular · Node.js)
**Entorno de desarrollo:** GitHub Codespaces

---

## 0. Datos generales del módulo

| Campo | Valor |
|---|---|
| Módulo | 8 — Reportes y Estadísticas |
| Rama de trabajo | `feature/modulo8-reportes` |
| Requisitos cubiertos | RF-50 a RF-55 |
| Reglas de negocio relacionadas | RN-10 (consumida, no nueva) |
| Depende de | Módulos 2, 3, 4 y 5 (agrega datos de todos ellos) |
| Responsable | Juan Carlos Garcés Sierra |
| Estado | ✅ Completado y probado end-to-end |

A diferencia de los módulos anteriores, este **no introduce entidades nuevas ni reglas de negocio propias** — es un módulo de consultas analíticas que agrega y presenta datos ya existentes de Pacientes, Citas, Historia Clínica y Facturación.

### Permisos de este módulo (matriz del SRS, sección 3.1) — el control de acceso más granular del proyecto

| Reporte | Categoría | ADMIN | ODONTOLOGO | RECEPCIONISTA |
|---|---|:---:|:---:|:---:|
| Ingresos del mes (RF-50) | Financiero | ✅ | ❌ | ✅ |
| Pacientes nuevos por mes (RF-51) | Administrativo | ✅ | ❌ | ✅ |
| Tratamientos más realizados (RF-52) | Clínico | ✅ | ✅ | ❌ |
| Pacientes con saldo pendiente (RF-53) | Financiero | ✅ | ❌ | ✅ |
| Tasa de asistencia (RF-54) | Administrativo | ✅ | ❌ | ✅ |

---

## 1. Matriz de trazabilidad de requisitos

| Requisito | Descripción (SRS) | Implementado en | Método de verificación | Estado |
|---|---|---|---|---|
| RF-50 | Ingresos del mes en curso | `reporteService.js` (`obtenerIngresosMesActual`), basado en pagos efectivos, no en facturación bruta | `test-e2e-reportes.sh` bloque 5 (estructura correcta) | ✅ |
| RF-51 | Pacientes nuevos por mes | `reporteService.js` (`obtenerPacientesNuevosPorMes`), serie de 6 meses | `test-e2e-reportes.sh` bloque 6 (6 meses en la serie) | ✅ |
| RF-52 | Tratamientos más realizados | `reporteService.js` (`obtenerTratamientosMasRealizados`), agregación de MongoDB, respeta RN-10 | `test-e2e-reportes.sh` bloque 4 (acceso ODONTOLOGO) | ✅ |
| RF-53 | Pacientes con saldo pendiente | `reporteService.js` (`obtenerPacientesConSaldoPendiente`), consolidado con `$lookup` | Prueba manual: agregación confirmada con datos reales | ✅ |
| RF-54 | Tasa de asistencia a citas | `reporteService.js` (`obtenerTasaAsistencia`), excluye estados sin desenlace conocido | Revisión de lógica; estructura de respuesta con `tasaAsistencia: number \| null` | ✅ |
| RF-55 | Exportación a Excel y PDF | `generarExcelReporte` (exceljs), `generarPdfReporteCompleto` (pdfkit) | `test-e2e-reportes.sh` bloques 7-9 (archivos válidos, tipo inválido rechazado) | ✅ |

---

## 2. Evidencia de pruebas

### 2.1 Pruebas automatizadas (backend) — `backend/tests/test-e2e-reportes.sh`

Resultado real de la ejecución final (posterior a la finalización del frontend completo):

```
=== 1. Login RECEPCIONISTA, ODONTOLOGO, ADMIN ===
Tokens obtenidos.
=== 2. ADMIN accede a los 5 reportes (todos deben dar 200) ===
  ingresos: 200
  saldo-pendiente: 200
  pacientes-nuevos: 200
  tasa-asistencia: 200
  tratamientos: 200
=== 3. RECEPCIONISTA accede a reportes financieros/administrativos (200) y clínico (403) ===
  ingresos: 200
  saldo-pendiente: 200
  pacientes-nuevos: 200
  tasa-asistencia: 200
  tratamientos (debe ser 403): 403
=== 4. ODONTOLOGO accede a reporte clínico (200) y financieros/administrativos (403) ===
  tratamientos: 200
  ingresos (debe ser 403): 403
  saldo-pendiente (debe ser 403): 403
  pacientes-nuevos (debe ser 403): 403
  tasa-asistencia (debe ser 403): 403
=== 5. Contenido del reporte de ingresos (verificar estructura) ===
Mes: julio de 2026 / Ingresos: 60000
=== 6. Contenido del reporte de pacientes nuevos (debe ser array de 6 meses) ===
6 meses en la serie
=== 7. Exportar a Excel (debe dar 200, archivo válido) ===
Status: 200
/tmp/test-reporte.xlsx: Microsoft Excel 2007+
=== 8. Exportar a PDF (debe dar 200, archivo válido) ===
Status: 200
/tmp/test-reporte.pdf: PDF document, version 1.3, 1 page(s)
=== 9. Exportar tipo de reporte inválido (debe dar 400) ===
Excel: 400
PDF: 400
=== 10. RECEPCIONISTA exporta reporte financiero a Excel (debe dar 200) ===
Status: 200
```

**Resultado global: 10/10 pruebas con el comportamiento esperado**, verificado en dos ejecuciones (backend recién completado, y tras finalizar todo el frontend).

### 2.2 Pruebas puntuales adicionales durante el desarrollo

| Prueba | Resultado |
|---|---|
| Reporte de saldo pendiente con base de datos vacía (todas las facturas pagadas/anuladas) | ✅ Devuelve array vacío correctamente, sin error |
| Reporte de saldo pendiente con una factura pendiente real | ✅ Agregación `$group` + `$lookup` consolida correctamente por paciente, trae nombre/apellido/teléfono |
| Reporte de tratamientos más realizados con pipeline de agregación (`$unwind` doble + `$group` + `$sort` + `$limit`) | ✅ Confirmado con datos reales del Módulo 4 |
| Reporte de pacientes nuevos: verificación de conteo correcto por mes usando `createdAt` | ✅ Mes actual mostró la cantidad real de pacientes creados durante el desarrollo |

### 2.3 Pruebas manuales (frontend)

| Caso de prueba | Resultado esperado | Verificado |
|---|---|---|
| RECEPCIONISTA/ADMIN visitan `/reportes` | 4 tarjetas: ingresos, tasa de asistencia, gráfico de pacientes nuevos, tabla de saldo pendiente | ✅ |
| Gráfico de barras de pacientes nuevos | Barras proporcionales al máximo de la serie, etiquetas de mes legibles | ✅ |
| Descarga de Excel/PDF de reportes financieros/administrativos | Archivos válidos, se abren correctamente | ✅ |
| ADMIN navega al reporte clínico | Barras horizontales ordenadas por frecuencia | ✅ |
| ODONTOLOGO clic en "Reportes" desde el dashboard | Redirige directo al reporte clínico, no al dashboard financiero (sin acceso) | ✅ |
| Descarga de Excel/PDF del reporte clínico | Archivo válido | ✅ |
| RECEPCIONISTA intenta acceder al reporte clínico | Ruta carga, petición HTTP rechazada (403) | ✅ |
| ODONTOLOGO intenta acceder al dashboard financiero | Ruta carga, peticiones HTTP rechazadas (403) | ✅ |

---

## 3. Arquitectura del módulo

```
Cliente (Angular)                                   Servidor (Express)                              Fuentes de datos (MongoDB)
┌─────────────────────────────┐                    ┌────────────────────────────────┐              ┌─────────────────┐
│  DashboardReportes                 │──GET 4 reportes─────▶│  reporteRoutes                        │              │  Factura          │
│  (financieros/administrativos,       │  (Promise.all)         │   ├─ verificarToken                     │              │  (ingresos,       │
│   gráfico de barras)                │                    │   └─ permitirRoles(diferenciado          │              │   saldo pendiente)│
│                                 │                    │        por tipo de reporte)             │              │                 │
│  ReporteClinico                    │──GET tratamientos───▶│                                    │              │  Paciente         │
│  (barras horizontales)              │                    │  reporteController                     │─────────────▶│  (pacientes       │
│                                 │──GET excel/pdf───────▶│   ├─ ingresos / pacientesNuevos /        │              │   nuevos)         │
│  ReporteService                    │  (blob)                │   │   tratamientosMasRealizados /     │              │                 │
│  (HttpClient)                       │                    │   │   saldoPendiente / tasaAsistencia │              │  HistoriaClinica   │
└─────────────────────────────┘                    │   ├─ exportarExcel (exceljs)              │              │  (tratamientos,   │
                                                     │   └─ exportarPdf (pdfkit)                 │              │   respeta RN-10)  │
                                                     │        │                                   │─────────────▶│                 │
                                                     │        ▼                                   │              │  Cita             │
                                                     │  reporteService.js                            │              │  (tasa de         │
                                                     │   (pipelines de agregación de MongoDB:          │─────────────▶│   asistencia)     │
                                                     │    $unwind, $group, $lookup, $sort)             │              └─────────────────┘
                                                     └────────────────────────────────┘
```

**Patrón de generación de exportables:** tanto Excel como PDF reutilizan la misma función `obtenerDatosReporte(tipo)` para obtener los datos — solo difieren en cómo los presentan (hoja de cálculo vs. documento de texto), evitando que ambos formatos puedan desincronizarse si cambia la lógica de algún reporte.

---

## 4. Decisiones técnicas y su justificación

| Decisión | Alternativa descartada | Motivo |
|---|---|---|
| "Ingresos" calculado sobre `pagos` reales, no sobre `valorTotal` facturado | Sumar el valor total de las facturas creadas en el mes | Una factura creada este mes pero pagada el próximo no es ingreso de este mes; "ingresos" implica flujo de caja efectivamente recibido, coherente con la fecha real del pago |
| Serie de 6 meses para pacientes nuevos, no solo el mes actual | Un único número del mes en curso | RF-51 sugiere análisis de tendencia; un dato aislado tiene poco valor comparado con una serie que permite visualizar crecimiento o estacionalidad |
| Pipeline de agregación de MongoDB (`$unwind`/`$group`/`$sort`) para tratamientos, en vez de traer todo a JavaScript | Cargar todas las historias clínicas y contar en el servidor Node | El trabajo pesado ocurre dentro de MongoDB, optimizado para esto; solo el resultado final (máx. 10 filas) viaja a la aplicación |
| Filtro `evoluciones.activo: true` en el reporte de tratamientos | Contar todos los tratamientos sin filtrar | Conecta con RN-10 (Módulo 4): una evolución desactivada por el ADMIN por ser errónea no debería distorsionar las estadísticas de tratamientos reales |
| `$lookup` en vez de `.populate()` para el reporte de saldo pendiente | Usar `.populate()` de Mongoose | Al ser una consulta de agregación (`aggregate()`), Mongoose no permite `.populate()` directamente; `$lookup` es el equivalente nativo dentro del pipeline |
| Tasa de asistencia excluye `PROGRAMADA`, `CONFIRMADA`, `EN_ATENCION` y `CANCELADA` | Incluir todos los estados de cita en el cálculo | Solo `FINALIZADA` y `NO_ASISTIO` tienen desenlace conocido; incluir citas aún pendientes distorsionaría el indicador, y una cancelación explícita no equivale a "no asistencia" |
| `tasaAsistencia: null` en vez de `0%` cuando no hay datos suficientes | Devolver siempre un porcentaje, incluso sin datos | `null` comunica correctamente "aún no hay suficiente información", evitando que el frontend muestre una estadística engañosa |
| `obtenerDatosReporte()` centralizada, reutilizada por Excel y PDF | Cada formato de exportación con su propia lógica de obtención de datos | Evita que Excel y PDF puedan desincronizarse si cambia algún reporte; un solo lugar para actualizar |
| `Promise.all()` para cargar los 4 reportes del dashboard en paralelo | Peticiones secuenciales encadenadas | El dashboard carga tan rápido como el reporte más lento, no como la suma de los 4 tiempos de espera |
| Gráfico de barras construido con `<div>`s de altura/ancho variable, sin librería externa | Integrar Chart.js u otra librería de gráficos | Suficiente para 6-10 barras simples; evita agregar una dependencia pesada solo para visualizaciones básicas |

---

## 5. Bitácora de commits

```
test: confirmar 10/10 pruebas end-to-end del Módulo 8 tras completar el frontend
feat(RF-52,RF-55): implementar reporte clínico de tratamientos más realizados
feat(RF-50,RF-51,RF-53,RF-54,RF-55): implementar dashboard de reportes financieros y administrativos
feat: agregar ReporteService para consumir los 5 reportes y sus exportaciones
test: agregar script end-to-end de reportes (10/10 exitosas)
feat(RF-55): implementar exportación de reportes a PDF con pdfkit
feat(RF-55): implementar exportación de reportes a Excel con exceljs
feat(RF-50,RF-51,RF-52,RF-53,RF-54): implementar endpoints de reportes con control de acceso diferenciado por tipo
feat(RF-54): implementar reporte de tasa de asistencia a citas
feat(RF-53): implementar reporte de pacientes con saldo pendiente consolidado por paciente
feat(RF-52,RN-10): implementar reporte de tratamientos más realizados con agregación de MongoDB
feat(RF-51): implementar reporte de pacientes nuevos por mes (serie de 6 meses)
feat(RF-50): implementar reporte de ingresos del mes en curso, basado en pagos efectivos
```

*(Orden: del más reciente al más antiguo.)*

---

## 6. Problemas encontrados y soluciones

| # | Problema | Causa raíz | Solución |
|---|---|---|---|
| 1 | Reporte de saldo pendiente devolvió array vacío en la primera prueba | Todas las facturas existentes en la base estaban en estado `PAGADA` o `ANULADA` en ese momento (dato de prueba, no bug) | Verificación directa en MongoDB antes de asumir un error; se creó una factura de prueba con saldo pendiente para confirmar la lógica con datos reales |

Este fue el módulo con menos incidentes técnicos de todo el proyecto — probablemente porque no introduce archivos de rutas/controladores nuevos en cada paso incremental (a diferencia de módulos anteriores), sino que expande progresivamente un único servicio (`reporteService.js`) con funciones independientes entre sí.

---

## 7. Pendientes / mejoras futuras identificadas

- [ ] Permitir configurar el rango de meses del reporte de pacientes nuevos (actualmente fijo en 6), en vez de un valor hardcodeado.
- [ ] Evaluar agregar filtros de fecha personalizados a los reportes financieros (actualmente "ingresos" está fijo al mes en curso).
- [ ] Considerar cachear los reportes de agregación pesada si el volumen de datos crece significativamente, para evitar recalcular en cada petición.
- [ ] Evaluar reemplazar los gráficos de barras hechos a mano por una librería como Chart.js si se requieren visualizaciones más complejas en el futuro.

---

## 8. Checklist de cierre de módulo

- [x] Todos los RF del módulo implementados (RF-50 a RF-55)
- [x] Pruebas automatizadas ejecutadas y evidenciadas (`test-e2e-reportes.sh`, 10/10 exitosas, verificado dos veces)
- [x] Pruebas manuales de frontend verificadas
- [x] Commits con trazabilidad al SRS
- [x] Documentación del módulo completada
- [ ] Pull Request creado hacia `main`
- [ ] Pull Request revisado y aprobado
- [ ] Merge a `main` realizado

---

## 9. Estructura final de archivos del módulo

```
backend/
├── src/
│   ├── services/
│   │   └── reporteService.js       (5 reportes + exportación Excel/PDF)
│   ├── controllers/
│   │   └── reporteController.js
│   └── routes/
│       └── reporteRoutes.js
└── tests/
    ├── test-e2e-auth.sh                (Módulo 1)
    ├── test-e2e-pacientes.sh           (Módulo 2)
    ├── test-e2e-citas.sh               (Módulo 3)
    ├── test-e2e-historia-clinica.sh    (Módulo 4)
    ├── test-e2e-facturacion.sh         (Módulo 5)
    ├── test-e2e-inventario.sh          (Módulo 6)
    ├── test-e2e-recordatorios.sh       (Módulo 7)
    └── test-e2e-reportes.sh            (Módulo 8)

frontend/
└── src/app/
    ├── core/
    │   └── reporte.ts (ReporteService)
    └── features/
        └── reportes/
            ├── dashboard-reportes/
            │   ├── dashboard-reportes.ts
            │   ├── dashboard-reportes.html
            │   └── dashboard-reportes.scss
            └── reporte-clinico/
                ├── reporte-clinico.ts
                ├── reporte-clinico.html
                └── reporte-clinico.scss
```

---

**Estado final del módulo:** ✅ Completado, probado end-to-end (backend y frontend) y documentado. Listo para revisión y merge a `main`. Solo queda el Módulo 9 (RIPS) para cerrar el proyecto completo.
