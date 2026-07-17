# Documentación del Módulo 6 — Inventario de Materiales

**Proyecto:** OdontoSoft
**Stack:** MEAN (MongoDB · Express · Angular · Node.js)
**Entorno de desarrollo:** GitHub Codespaces

---

## 0. Datos generales del módulo

| Campo | Valor |
|---|---|
| Módulo | 6 — Inventario de Materiales |
| Rama de trabajo | `feature/modulo6-inventario` |
| Requisitos cubiertos | RF-41 a RF-45 |
| Regla de negocio | RN-06 |
| Depende de | Módulo 1 (autenticación, roles) |
| Responsable | Juan Carlos Garcés Sierra |
| Estado | ✅ Completado y probado end-to-end |

### Permisos de este módulo (matriz del SRS, sección 3.1)

| Acción | ADMIN | ODONTOLOGO | RECEPCIONISTA |
|---|:---:|:---:|:---:|
| Crear / editar material, registrar entradas y salidas | ❌ (solo lectura) | ❌ Sin acceso | ✅ CRUD |
| Consultar listado de materiales | ✅ | ❌ Sin acceso | ✅ |

> Este módulo tiene el patrón de permisos más restrictivo de todo el proyecto junto con Historia Clínica: ODONTOLOGO queda completamente excluido (ni siquiera lectura), ya que el manejo de insumos no forma parte de su rol clínico.

---

## 1. Matriz de trazabilidad de requisitos

| Requisito | Descripción (SRS) | Implementado en | Método de verificación | Estado |
|---|---|---|---|---|
| RF-41 | Registrar materiales e insumos | `materialService.js` (`crearMaterial`); componente `FormMaterial` | `test-e2e-inventario.sh` bloque 2 (201) | ✅ |
| RF-42 | Control de stock (entradas y salidas) | `materialService.js` (`registrarEntrada`, `registrarSalida`); componente `DetalleMaterial` | `test-e2e-inventario.sh` bloques 8-11 | ✅ |
| RF-43 | Alerta de stock por debajo del mínimo | Campo calculado `stockBajo` en `listarMateriales()`; alerta visual en `ListaMateriales` | `test-e2e-inventario.sh` bloques 5 y 13 (`stockBajo` correcto antes/después de movimientos) | ✅ |
| RF-44 | Registro de proveedor por material | Campo `proveedor` en `Material.js` | Formulario de creación/edición | ✅ |
| RF-45 | Registrar el costo en COP | Campo `costoUnitario` en `Material.js` | Formulario, formateo con `toLocaleString('es-CO')` | ✅ |
| RN-06 | Stock nunca negativo | `materialService.js` → `registrarSalida()`: valida `cantidad > material.stock` antes de mutar el documento | `test-e2e-inventario.sh` bloque 11 (409 al intentar exceso) | ✅ |

---

## 2. Evidencia de pruebas

### 2.1 Pruebas automatizadas (backend) — `backend/tests/test-e2e-inventario.sh`

Resultado real de la ejecución final (posterior a la finalización del frontend completo):

```
=== 0. Limpieza de datos de pruebas anteriores ===
Limpieza completada.
=== 1. Login RECEPCIONISTA, ODONTOLOGO, ADMIN ===
Tokens obtenidos.
=== 2. RECEPCIONISTA crea material (debe dar 201) ===
Material registrado exitosamente
=== 3. ODONTOLOGO intenta crear material (debe dar 403) ===
Status: 403
=== 4. ADMIN intenta crear material (debe dar 403) ===
Status: 403
=== 5. Listar materiales, verificar stockBajo=false (debe dar 200) ===
stockBajo: false
=== 6. ADMIN puede listar (lectura permitida, debe dar 200) ===
Status: 200
=== 7. ODONTOLOGO no puede listar (debe dar 403) ===
Status: 403
=== 8. Registrar entrada de 15 unidades (debe dar 200, stock=35) ===
Stock: 35
=== 9. Entrada con cantidad invalida (debe dar 400) ===
Status: 400
=== 10. Registrar salida de 25 unidades (debe dar 200, stock=10) ===
Stock: 10
=== 11. Intentar salida mayor al stock disponible (debe dar 409, RN-06) ===
Status: 409
=== 12. ADMIN intenta registrar salida (debe dar 403) ===
Status: 403
=== 13. Verificar stockBajo=true tras las salidas (stock=10, minimo=10) ===
stockBajo: true
=== 14. Editar material sin tocar el stock (debe dar 200, stock sigue en 10) ===
Costo: 40000 / Stock: 10
=== 15. ADMIN intenta editar (debe dar 403) ===
Status: 403
```

**Resultado global: 15/15 pruebas con el comportamiento esperado**, verificado en dos ejecuciones (una tras completar el backend, otra tras finalizar todo el frontend).

### 2.2 Pruebas puntuales adicionales durante el desarrollo

| Prueba | Resultado |
|---|---|
| Creación de material con valores por defecto (`estado: ACTIVO`, `movimientos: []`) | ✅ Confirmado vía `node -e` aislado |
| `stockBajo` recalculado correctamente tras cada movimiento (antes: `false` con 30/10; después: `true` con 10/10) | ✅ |
| Edición de material excluye explícitamente el campo `stock` del cuerpo permitido | ✅ Confirmado: stock permaneció en 10 tras editar costo y proveedor |

### 2.3 Pruebas manuales (frontend)

| Caso de prueba | Resultado esperado | Verificado |
|---|---|---|
| Crear material desde `/inventario/nuevo` | Aparece en el listado con stock inicial correcto | ✅ |
| Alerta visual (fila amarilla + badge) en materiales con stock bajo | Coincide con `stockBajo` del backend | ✅ |
| Editar material sin tocar stock | Cambios reflejados, stock intacto; campo de stock deshabilitado en modo edición | ✅ |
| Registrar entrada desde el detalle | Stock aumenta, aparece en historial de movimientos | ✅ |
| Registrar salida válida | Stock disminuye correctamente | ✅ |
| Intentar salida mayor al stock disponible | Mensaje de error visible, sin romper la página | ✅ |
| ADMIN visita el inventario | Solo lectura: sin botones de creación/edición/movimientos | ✅ |
| ODONTOLOGO intenta acceder | Ruta carga, pero peticiones HTTP rechazadas (403) | ✅ |
| Historial de movimientos ordenado del más reciente al más antiguo | Confirmado visualmente | ✅ |

---

## 3. Arquitectura del módulo

```
Cliente (Angular)                             Servidor (Express)                        Base de datos (MongoDB)
┌───────────────────────┐                    ┌──────────────────────────────┐          ┌─────────────────┐
│  ListaMateriales           │──GET materiales────▶│  materialRoutes                 │          │                 │
│  (alerta stock bajo)        │                    │   ├─ verificarToken             │          │                 │
│                          │──POST material─────▶│   └─ permitirRoles(según ruta)   │          │                 │
│  FormMaterial               │──PUT material──────▶│                                │          │                 │
│  (crear/editar,             │                    │  materialController              │─────────▶│  Material        │
│   stock deshabilitado         │                    │   ├─ crear                     │          │  (movimientos    │
│   en edición)              │                    │   ├─ listar                    │          │   embebidos)     │
│                          │                    │   ├─ entrada                   │          │                 │
│  DetalleMaterial            │──PATCH entrada──────▶│   ├─ salida                    │          │                 │
│  (movimientos, historial)     │──PATCH salida───────▶│   └─ actualizar                 │          │                 │
│                          │                    └──────────────────────────────┘          └─────────────────┘
│  MaterialService              │
│  (HttpClient)               │
└───────────────────────┘
        ▲
        │ (interceptor JWT del Módulo 1)
```

**Cálculo de `stockBajo`:** no se almacena como campo persistente en MongoDB — se calcula al vuelo en `listarMateriales()` comparando `stock <= stockMinimo`. Esto evita el riesgo de que el flag quede desincronizado si alguien olvida actualizarlo tras un movimiento; siempre refleja el estado real en el momento de la consulta.

**Separación de responsabilidades en la edición:** el endpoint `PUT /:id` excluye explícitamente `stock` del cuerpo permitido (mismo patrón usado en `actualizarDiente`/`actualizarPaciente` de módulos anteriores) — el stock solo cambia a través de los endpoints dedicados de entrada/salida, preservando siempre el historial de movimientos como única fuente de verdad de cómo llegó el inventario a su cantidad actual.

---

## 4. Decisiones técnicas y su justificación

| Decisión | Alternativa descartada | Motivo |
|---|---|---|
| `movimientos` definido directamente como `[movimientoSchema]` desde el diseño inicial | Repetir el patrón `{ type: [...], default: [] }` | Lección aplicada del bug de `populate` en el Módulo 4; se evitó desde el diseño en vez de corregir después |
| `stockBajo` calculado al vuelo, no almacenado | Campo persistente actualizado en cada movimiento | Evita inconsistencia si algún flujo futuro modificara `stock` sin pasar por los endpoints dedicados; el cálculo derivado siempre es correcto |
| `stockMinimo` configurable por material (no un umbral global) | Un valor fijo de alerta para todo el inventario | Distintos insumos tienen distintos ritmos de consumo y umbrales de reposición razonables |
| Endpoint de edición excluye explícitamente `stock` del cuerpo permitido | Confiar en que el frontend nunca envíe ese campo | Mismo patrón de seguridad usado en Pacientes (Módulo 2) e Historia Clínica (Módulo 4): cada endpoint mantiene una sola responsabilidad |
| Sin endpoint dedicado de "obtener material por ID"; el frontend reutiliza `listar()` y filtra localmente | Construir un endpoint `GET /:id` específico | Suficiente para el volumen esperado de materiales de una clínica; anotado como mejora futura si el inventario creciera significativamente |
| ODONTOLOGO sin ningún acceso a inventario (ni lectura) | Dar acceso de solo lectura, como en otros módulos | Refleja fielmente la matriz de permisos del SRS, que no otorga ningún acceso a este rol sobre inventario |

---

## 5. Bitácora de commits

```
test: confirmar 15/15 pruebas end-to-end del Módulo 6 tras completar el frontend
feat(RF-42): implementar registro de entradas/salidas de stock con historial de movimientos
feat(RF-41,RF-44,RF-45): implementar formulario de registro y edición de materiales
feat(RF-41,RF-43): implementar listado de materiales con alerta visual de stock bajo
feat: agregar MaterialService para consumir inventario, entradas y salidas de stock
feat(RF-44,RF-45): implementar edición de material, excluyendo stock del cuerpo permitido / test: agregar script end-to-end de inventario (15/15 exitosas)
feat(RF-42,RN-06): implementar registro de salida de stock, sin permitir valores negativos
feat(RF-42): implementar registro de entrada de stock con historial de movimientos
feat(RF-41,RF-43): implementar listado de materiales con indicador de stock bajo
feat(RF-41,RF-44,RF-45): implementar creación de material, exclusiva de RECEPCIONISTA
feat(RF-41,RF-44,RF-45,RN-06): agregar modelo Material con movimientos embebidos
```

*(Orden: del más reciente al más antiguo.)*

---

## 6. Problemas encontrados y soluciones

| # | Problema | Causa raíz | Solución |
|---|---|---|---|
| 1 | `ReferenceError: listarMateriales is not defined` en `materialService.js` | Al agregar `registrarEntrada` (Paso 4), el `module.exports` se actualizó para incluir `listarMateriales`, pero la función en sí (del Paso 3) no se conservó al reemplazar el archivo | Reconstrucción del archivo completo con las 3 funciones, verificado con `cat` antes de continuar |
| 2 | `ReferenceError: listar is not defined` en `materialController.js` | Mismo patrón que el problema 1, pero en el controlador — la función `listar` del Paso 3 se perdió al agregar `entrada` (Paso 4) | Reconstrucción del archivo completo, mismo enfoque |
| 3 | `Cannot read properties of null (reading '_id')` al buscar un material por nombre en MongoDB | El material de prueba se había eliminado en una limpieza previa durante el diagnóstico de otro problema | Verificación directa con `mongosh` antes de asumir que el material existía; captura del ID directamente de la respuesta de creación en vez de buscarlo después |
| 4 | Bloques 14 y 15 del script E2E fallaron (`HTML` de error / `404`) tras aparentemente completar el Paso 6 | La ruta `PUT /:id` y la función `actualizar` del controlador nunca se guardaron — mismo patrón recurrente de funciones "perdidas" al editar archivos existentes | Reconstrucción completa de los 3 archivos (servicio, controlador, rutas) verificando con `grep`/`tail` antes de asumir que el código estaba completo |

> **Patrón recurrente identificado en este módulo:** de los 6 problemas documentados en todo el proyecto hasta ahora, 3 de ellos (la mitad) ocurrieron en este único módulo, y todos comparten la misma causa raíz: al pedir "agregar esto a un archivo existente", el contenido previo se perdía en vez de conservarse. La solución adoptada de aquí en adelante fue dar siempre el **archivo completo** (servicio, controlador y rutas enteros) en cada paso que tocara un archivo ya existente, en vez de fragmentos a insertar manualmente.

---

## 7. Pendientes / mejoras futuras identificadas

- [ ] Construir un endpoint dedicado `GET /materiales/:id` si el inventario crece lo suficiente como para que filtrar del lado del cliente deje de ser eficiente.
- [ ] Evaluar agregar un estado `INACTIVO` explícito (descontinuar un material) con su propio endpoint, ya que el modelo lo contempla pero no se construyó la funcionalidad completa en este roadmap.
- [ ] Considerar reportes de valorización de inventario (costo total del stock actual) cuando se desarrolle el Módulo 8 (Reportes).
- [ ] Evaluar si el "motivo" de entrada/salida debería ser obligatorio en vez de opcional, para mejorar la trazabilidad de auditoría.

---

## 8. Checklist de cierre de módulo

- [x] Todos los RF del módulo implementados (RF-41 a RF-45)
- [x] Regla de negocio aplicada y verificada (RN-06)
- [x] Pruebas automatizadas ejecutadas y evidenciadas (`test-e2e-inventario.sh`, 15/15 exitosas, verificado dos veces)
- [x] Pruebas manuales de frontend verificadas
- [x] Commits con trazabilidad al SRS
- [x] Documentación del módulo completada
- [x] Matriz de reglas de negocio actualizada (RN-06 verificada)
- [ ] Pull Request creado hacia `main`
- [ ] Pull Request revisado y aprobado
- [ ] Merge a `main` realizado

---

## 9. Estructura final de archivos del módulo

```
backend/
├── src/
│   ├── models/
│   │   └── Material.js              (movimientos embebidos)
│   ├── services/
│   │   └── materialService.js
│   ├── controllers/
│   │   └── materialController.js
│   └── routes/
│       └── materialRoutes.js
└── tests/
    ├── test-e2e-auth.sh              (Módulo 1)
    ├── test-e2e-pacientes.sh         (Módulo 2)
    ├── test-e2e-citas.sh             (Módulo 3)
    ├── test-e2e-historia-clinica.sh  (Módulo 4)
    ├── test-e2e-facturacion.sh       (Módulo 5)
    └── test-e2e-inventario.sh        (Módulo 6)

frontend/
└── src/app/
    ├── core/
    │   └── material.ts (MaterialService)
    └── features/
        └── inventario/
            ├── lista-materiales/
            │   ├── lista-materiales.ts
            │   ├── lista-materiales.html
            │   └── lista-materiales.scss
            ├── form-material/
            │   ├── form-material.ts
            │   ├── form-material.html
            │   └── form-material.scss
            └── detalle-material/
                ├── detalle-material.ts
                ├── detalle-material.html
                └── detalle-material.scss
```

---

**Estado final del módulo:** ✅ Completado, probado end-to-end (backend y frontend) y documentado. Listo para revisión y merge a `main`.
