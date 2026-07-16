# Documentación del Módulo 4 — Historia Clínica y Odontograma

**Proyecto:** OdontoSoft
**Stack:** MEAN (MongoDB · Express · Angular · Node.js)
**Entorno de desarrollo:** GitHub Codespaces

---

## 0. Datos generales del módulo

| Campo | Valor |
|---|---|
| Módulo | 4 — Historia Clínica y Odontograma |
| Rama de trabajo | `feature/modulo4-historia-clinica` |
| Requisitos cubiertos | RF-25 a RF-32 |
| Reglas de negocio | RN-03, RN-09, RN-10 |
| RNF relacionadas | RNF-05 (acceso restringido), RNF-09 (optimización de imágenes) |
| Depende de | Módulo 1 (autenticación, roles), Módulo 2 (pacientes) |
| Responsable | Juan Carlos Garcés Sierra |
| Estado | ✅ Completado y probado end-to-end |

### Permisos de este módulo (matriz del SRS, sección 3.1)

| Acción | ADMIN | ODONTOLOGO | RECEPCIONISTA |
|---|:---:|:---:|:---:|
| Crear/editar contenido clínico (odontograma, evoluciones, antecedentes, adjuntos) | ❌ Sin acceso a edición | ✅ CRUD | ❌ Sin acceso |
| Consultar historia clínica | ✅ | ✅ | ❌ Sin acceso |
| Desactivar evolución errónea (sin editar) | ✅ (única acción permitida, RN-10) | ❌ | ❌ |

> Este es el único módulo donde RECEPCIONISTA queda completamente excluida, incluso de lectura — coherente con RNF-05 ("la historia clínica solo es accesible por personal autorizado") y con el carácter estrictamente clínico de la información.

---

## 1. Matriz de trazabilidad de requisitos

| Requisito | Descripción (SRS) | Implementado en | Método de verificación | Estado |
|---|---|---|---|---|
| RF-25 | Historia clínica única por paciente | Índice único `paciente` en `HistoriaClinica.js`; `historiaClinicaService.js` (`crearHistoriaClinica`, `obtenerHistoriaPorPaciente`) | `test-e2e-historia-clinica.sh` bloques 2, 4, 5; componente `VistaHistoria` | ✅ |
| RF-26 | Odontograma digital interactivo (32 dientes) | `dienteSchema` embebido con `default` factory de 32 dientes; componente `Odontograma` (Angular) | Revisión de modelo; prueba manual de clic e interacción | ✅ |
| RF-27 | Registrar estado de cada diente (sano, caries, extracción, corona, etc.) | Enum de 8 estados en `dienteSchema`; `actualizarDiente()` en el servicio | `test-e2e-historia-clinica.sh` bloque 7 (200 al actualizar) | ✅ |
| RF-28 | Registrar evoluciones clínicas con fecha | `evolucionSchema` embebido; `agregarEvolucion()`; componente `FormEvolucion` con `FormArray` | `test-e2e-historia-clinica.sh` bloque 9 (201 al crear) | ✅ |
| RF-29 | Registrar antecedentes médicos del paciente | Campo `antecedentesMedicos`; `actualizarAntecedentes()` | `test-e2e-historia-clinica.sh` bloque 11 (200 al actualizar) | ✅ |
| RF-30 | Adjuntar imágenes (radiografías, fotos) | `adjuntoSchema` embebido; Multer + Sharp en `agregarAdjunto()` | `test-e2e-historia-clinica.sh` bloque 15 (201 al subir); verificación de archivo físico optimizado | ✅ |
| RF-31 | Registrar tratamientos realizados por diente | `tratamientoRealizadoSchema` dentro de cada evolución | `test-e2e-historia-clinica.sh` bloque 9 (tratamientos incluidos en la evolución) | ✅ |
| RF-32 / RN-03 | Contenido clínico exclusivo de ODONTÓLOGO; ADMIN gestiona disponibilidad y puede desactivar registros erróneos | `permitirRoles('ODONTOLOGO')` en rutas de escritura; `permitirRoles('ADMIN')` solo en desactivación | `test-e2e-historia-clinica.sh` bloques 3, 6, 8, 10, 13 (403 en cada intento no autorizado) | ✅ |

---

## 2. Evidencia de pruebas

### 2.1 Pruebas automatizadas (backend) — `backend/tests/test-e2e-historia-clinica.sh`

Resultado real de la ejecución final (posterior a la finalización del frontend completo):

```
=== 0. Limpieza de datos de pruebas anteriores ===
Limpieza completada.
=== 1. Login RECEPCIONISTA, ODONTOLOGO, ADMIN ===
Tokens obtenidos.
Paciente: 6a52ace7736b50e45c2dbc3c
=== 2. ODONTOLOGO crea historia clínica (debe dar 201) ===
Status: 201
=== 3. RECEPCIONISTA intenta crear historia (debe dar 403) ===
Status: 403
=== 4. Duplicado (debe dar 409) ===
Status: 409
=== 5. ODONTOLOGO consulta historia (debe dar 200) ===
Status: 200
=== 6. RECEPCIONISTA intenta consultar (debe dar 403) ===
Status: 403
=== 7. ODONTOLOGO actualiza diente 14 (debe dar 200) ===
Status: 200
=== 8. ADMIN intenta actualizar odontograma (debe dar 403) ===
Status: 403
=== 9. ODONTOLOGO agrega evolución (debe dar 201) ===
Evolución clínica registrada exitosamente
=== 10. ADMIN intenta agregar evolución (debe dar 403) ===
Status: 403
=== 11. ODONTOLOGO actualiza antecedentes (debe dar 200) ===
Status: 200
=== 12. ADMIN desactiva evolución (debe dar 200) ===
Status: 200
=== 13. ODONTOLOGO intenta desactivar evolución (debe dar 403) ===
Status: 403
=== 14. Desactivar de nuevo, ya desactivada (debe dar 409) ===
Status: 409
=== 15. ODONTOLOGO sube adjunto (debe dar 201) ===
Status: 201
=== 16. RECEPCIONISTA intenta subir adjunto (debe dar 403) ===
Status: 403
```

**Resultado global: 16/16 pruebas con el comportamiento esperado**, verificado en dos ejecuciones independientes (backend recién completado, y tras finalizar todo el frontend), confirmando estabilidad.

### 2.2 Pruebas puntuales adicionales durante el desarrollo

| Prueba | Resultado |
|---|---|
| Crear historia clínica y verificar generación automática de 32 dientes en estado SANO | ✅ Confirmado vía script aislado con `node -e` |
| Índice único de historia clínica rechaza segunda historia para el mismo paciente | ✅ E11000 duplicado detectado |
| Actualizar diente fuera de rango (número 99) | ✅ 400 "Número de diente inválido" |
| `odontologo` de una evolución siempre coincide con el usuario autenticado, nunca con datos del body | ✅ Verificado comparando el JWT decodificado contra la respuesta |
| Subida de imagen JPEG de prueba, comparación de tamaño antes/después de optimización con Sharp | ✅ Conversión a WebP confirmada, archivo físico generado en `uploads/historias-clinicas/` |
| Intento de subir un tipo de archivo no permitido (fuera del alcance de la prueba automatizada, verificado manualmente con el `fileFilter` de Multer) | ✅ Rechazado por el middleware antes de llegar al controlador |

### 2.3 Pruebas manuales (frontend)

| Caso de prueba | Resultado esperado | Verificado |
|---|---|---|
| ODONTOLOGO crea historia clínica desde el detalle de un paciente | Aparece el odontograma con 32 dientes en SANO | ✅ |
| Clic en un diente, cambio de estado, guardar | Color del diente se actualiza inmediatamente | ✅ |
| Agregar evolución con múltiples tratamientos (`FormArray` dinámico) | Aparece en la lista con todos los procedimientos | ✅ |
| Editar antecedentes médicos | Se guarda y persiste al recargar | ✅ |
| Subir imagen como adjunto | Aparece en la grilla, clickeable, abre en nueva pestaña | ✅ |
| ADMIN visita la misma historia clínica | Odontograma en solo lectura; sin botones de edición de contenido clínico | ✅ |
| ADMIN desactiva una evolución | Pide confirmación; evolución se muestra con opacidad reducida y badge "Desactivada por..." | ✅ |
| RECEPCIONISTA accede a la URL directamente | Ruta carga (guard de Angular solo verifica sesión), pero todas las peticiones HTTP son rechazadas por el backend (403) | ✅ |

---

## 3. Arquitectura del módulo

```
Cliente (Angular)                                Servidor (Express)                            Base de datos (MongoDB)
┌─────────────────────────┐                     ┌─────────────────────────────┐               ┌──────────────────────┐
│  VistaHistoria (contenedor) │──GET historia──────▶│  historiaClinicaRoutes         │               │                       │
│   ├─ Odontograma            │                     │   ├─ verificarToken             │               │                       │
│   └─ FormEvolucion          │──POST/PATCH────────▶│   └─ permitirRoles(según ruta)   │               │                       │
│                            │                     │                              │               │                       │
│  HistoriaClinicaService     │──POST adjunto───────▶│  historiaClinicaController      │──────────────▶│  HistoriaClinica       │
│  (HttpClient, FormData)      │   (multipart/form-data)│   ├─ crear                     │               │  (paciente único,     │
└─────────────────────────┘                     │   ├─ obtenerPorPaciente         │               │   odontograma[32],    │
                                                 │   ├─ actualizarOdontograma      │               │   evoluciones[],      │
                                                 │   ├─ crearEvolucion             │               │   adjuntos[])         │
                                                 │   ├─ editarAntecedentes         │               │                       │
                                                 │   ├─ desactivarEvolucionClinica │               │                       │
                                                 │   └─ subirAdjunto               │               │                       │
                                                 │        │                        │               │                       │
                                                 │        ▼                        │               │                       │
                                                 │  uploadMiddleware (Multer)       │               │                       │
                                                 │  historiaClinicaService          │               │                       │
                                                 │   └─ sharp (optimización WebP)    │──────────────▶│  uploads/ (disco)     │
                                                 └─────────────────────────────┘               └──────────────────────┘
```

**Diseño de datos (decisión explícita del SRS):** odontograma, evoluciones y adjuntos se modelan como **subdocumentos embebidos** dentro de `HistoriaClinica` — no como colecciones independientes — porque siempre se consultan junto con la historia clínica del paciente y su tamaño está acotado (32 dientes fijos; evoluciones y adjuntos de un solo paciente). Esto aprovecha directamente la fortaleza de MongoDB para documentos anidados, que fue parte de la motivación original para elegir el stack MEAN en este proyecto.

**Flujo de subida de adjuntos:** el archivo llega como buffer en memoria (Multer con `memoryStorage`), Sharp lo redimensiona (máx. 1600px de ancho, sin agrandar) y lo convierte a WebP con calidad 80, se escribe a disco con un nombre único (UUID), y solo entonces se registra la referencia (`url`, `nombreArchivo`, `tipo`, `subidoPor`) en el subdocumento `adjuntos` de la historia clínica.

---

## 4. Decisiones técnicas y su justificación

| Decisión | Alternativa descartada | Motivo |
|---|---|---|
| Odontograma, evoluciones y adjuntos como subdocumentos embebidos | Colecciones independientes referenciadas por `paciente` | Especificado explícitamente en el SRS; aprovecha la fuerza de MongoDB para documentos anidados de tamaño acotado |
| `odontologo` de cada evolución tomado de `req.usuario.id` (JWT), nunca del body | Aceptar el campo `odontologo` enviado por el cliente | Garantiza el cumplimiento inquebrantable de RN-09 (auditoría confiable); un cliente no puede falsificar quién realizó la acción |
| RN-10 implementada con campos `activo`/`desactivadoPor`/`fechaDesactivacion` en vez de eliminar el subdocumento | Eliminar la evolución del array | El SRS exige explícitamente que el registro desactivado "permanezca visible... para trazabilidad"; eliminar el subdocumento perdería esa evidencia |
| Almacenamiento local de archivos (`backend/uploads/`) en vez de un servicio en la nube | S3, Cloudinary u otro servicio externo | Suficiente para el alcance académico; evita dependencias de pago o configuración adicional; documentado como limitación consciente |
| Conversión de todas las imágenes a WebP con calidad 80 | Mantener el formato original (JPEG/PNG) | Cumple RNF-09 (optimización) con mejor compresión que JPEG/PNG a calidad visual equivalente |
| `FormArray` de Angular para tratamientos dinámicos en el formulario de evolución | Un número fijo de campos de tratamiento | Una evolución real puede involucrar 1 o varios dientes; el usuario agrega/quita filas según necesite |
| `cargarHistoria()` recarga todo el estado tras cada acción (cambiar diente, agregar evolución, etc.) | Actualización optimista del estado local en el frontend | Simplicidad: evita que el estado del cliente se desincronice del servidor; aceptable dado que estas acciones no son de alta frecuencia |
| Ruta de historia clínica accesible por Angular a cualquier usuario autenticado (guard no distingue rol) | Guard adicional que bloquee la ruta según rol específico | La seguridad real la garantiza el backend (403 en cada petición); se documenta como posible mejora si se requiere una experiencia de UI más pulida para roles sin acceso |

---

## 5. Bitácora de commits

```
test: confirmar 16/16 pruebas end-to-end del Módulo 4 tras completar el frontend
feat(RF-25,RF-29): implementar vista general de historia clínica integrando odontograma, evoluciones y adjuntos
feat(RF-28,RF-31): implementar formulario de evolución clínica con tratamientos dinámicos (FormArray)
feat(RF-26,RF-27): implementar componente de odontograma interactivo (32 dientes)
feat: agregar HistoriaClinicaService para consumir odontograma, evoluciones y adjuntos
test: agregar script end-to-end de historia clínica y odontograma (16/16 exitosas)
feat(RF-30,RNF-09): implementar subida de adjuntos con optimización de imágenes (sharp)
feat(RN-10): implementar desactivación de evolución clínica, exclusiva de ADMIN
feat(RF-29): implementar actualización de antecedentes médicos
feat(RF-28,RF-31,RN-03,RN-09): implementar registro de evoluciones clínicas con tratamientos
feat(RF-26,RF-27,RN-03): implementar actualización de odontograma, exclusiva de ODONTOLOGO
feat(RF-25,RNF-05): implementar consulta de historia clínica, restringida a ADMIN y ODONTOLOGO
fix(modelo): corregir sintaxis de evoluciones/adjuntos como arrays de subdocumentos para permitir populate
feat(RF-25,RN-03): implementar creación de historia clínica, exclusiva de ODONTOLOGO
feat(RF-25,RF-26,RF-27,RF-31,RN-10): agregar modelo HistoriaClinica con odontograma, evoluciones y adjuntos embebidos
```

*(Orden: del más reciente al más antiguo.)*

---

## 6. Problemas encontrados y soluciones

| # | Problema | Causa raíz | Solución |
|---|---|---|---|
| 1 | `StrictPopulateError: Cannot populate path 'evoluciones.odontologo' because it is not in your schema` | El array `evoluciones` estaba definido con la sintaxis `{ type: [evolucionSchema], default: [] }`, que Mongoose no siempre reconoce correctamente para resolver `populate` sobre paths anidados dentro del subdocumento | Cambiar a la sintaxis directa `evoluciones: [evolucionSchema]` (sin el wrapper de objeto), igual para `adjuntos` |
| 2 | El modelo `HistoriaClinica.js` apareció con contenido completamente distinto al diseñado (campos `descripcion`/`observaciones` sueltos, sin odontograma ni evoluciones) | Posible sobrescritura accidental del archivo con contenido de otra fuente durante la edición manual | Reemplazo completo del archivo, verificado línea por línea contra el diseño original del Paso 1 |
| 3 | `ReferenceError: verificarToken is not defined` / `ReferenceError: upload is not defined` en `historiaClinicaRoutes.js`, en más de una ocasión | Mismo patrón recurrente de módulos anteriores: al reemplazar el archivo de rutas completo, se perdían los `require` del inicio | Verificación explícita con `head`/`cat` antes de asumir que el archivo quedó completo tras cada edición |
| 4 | Carpeta `backend/uploads/historias-clinicas/` no existía al momento de subir el primer adjunto | El comando `mkdir -p` de preparación no se ejecutó en su momento | Creación explícita de la carpeta con ruta absoluta antes de la primera prueba de subida |
| 5 | Confusión inicial entre "backend está caído" y "variable de shell vacía" al ver `Unexpected end of JSON input` | Ambas causas producen el mismo síntoma superficial (respuesta vacía al parsear como JSON) | Diagnóstico sistemático: verificar `/api/health` primero, luego el valor de las variables con `echo`, antes de asumir un bug en el código |
| 6 | Error `Schema hasn't been registered for model "Usuario"` al probar el servicio de forma aislada con `node -e` | Un script de Node aislado que solo carga `historiaClinicaService.js` no registra automáticamente el modelo `Usuario` en memoria, necesario para el `populate` | Se abandonó el patrón de prueba aislada para funciones con `populate` cruzado entre modelos; se prefirió probar siempre a través de la API real (`npm run dev` + `curl`), que sí carga todos los modelos al arrancar |

---

## 7. Actualización de la matriz de reglas de negocio

Con el cierre de este módulo, las siguientes RN quedan verificadas (ver `docs/matriz_reglas_negocio.md` para la tabla completa y actualizada):

| RN | Estado anterior | Estado actual |
|---|---|---|
| RN-03 | — | ✅ Verificada (bloques 3, 6, 8, 10, 13, 16 del script E2E) |
| RN-09 | — | ✅ Verificada (campo `odontologo` siempre coincide con el usuario autenticado) |
| RN-10 | 🔵 Pendiente de verificación | ✅ Verificada (bloques 12, 13, 14 del script E2E) |

---

## 8. Pendientes / mejoras futuras identificadas

- [ ] Evaluar migrar el almacenamiento de adjuntos de disco local a un servicio en la nube (S3, Cloudinary) si el proyecto escala más allá del entorno académico.
- [ ] Considerar un guard de Angular adicional que redirija según rol específico (no solo sesión activa) para mejorar la experiencia de usuario en rutas donde RECEPCIONISTA no tiene ningún acceso, aunque la seguridad real ya está garantizada por el backend.
- [ ] Evaluar agregar un endpoint de "reactivar evolución" si el negocio lo requiere más adelante (actualmente RN-10 solo contempla desactivar).
- [ ] Extraer la lógica de colores/etiquetas de estado de diente (`COLORES_ESTADO`, `ETIQUETAS_ESTADO`) a un archivo de constantes compartido si se reutiliza en reportes futuros (Módulo 8).

---

## 9. Checklist de cierre de módulo

- [x] Todos los RF del módulo implementados (RF-25 a RF-32)
- [x] Reglas de negocio aplicadas y verificadas (RN-03, RN-09, RN-10)
- [x] RNF relacionadas cumplidas (RNF-05, RNF-09)
- [x] Pruebas automatizadas ejecutadas y evidenciadas (`test-e2e-historia-clinica.sh`, 16/16 exitosas, verificado dos veces)
- [x] Pruebas manuales de frontend verificadas
- [x] Commits con trazabilidad al SRS
- [x] Documentación del módulo completada
- [x] Matriz de reglas de negocio actualizada
- [ ] Pull Request creado hacia `main`
- [ ] Pull Request revisado y aprobado
- [ ] Merge a `main` realizado

---

## 10. Estructura final de archivos del módulo

```
backend/
├── src/
│   ├── models/
│   │   └── HistoriaClinica.js       (odontograma, evoluciones, adjuntos embebidos)
│   ├── services/
│   │   └── historiaClinicaService.js
│   ├── controllers/
│   │   └── historiaClinicaController.js
│   ├── middlewares/
│   │   └── uploadMiddleware.js       (Multer)
│   └── routes/
│       └── historiaClinicaRoutes.js
├── uploads/
│   └── historias-clinicas/           (no versionado, .gitignore)
└── tests/
    ├── test-e2e-auth.sh              (Módulo 1)
    ├── test-e2e-pacientes.sh         (Módulo 2)
    ├── test-e2e-citas.sh             (Módulo 3)
    └── test-e2e-historia-clinica.sh  (Módulo 4)

frontend/
└── src/app/
    ├── core/
    │   └── historia-clinica.ts (HistoriaClinicaService)
    └── features/
        └── historia-clinica/
            ├── odontograma/
            │   ├── odontograma.ts
            │   ├── odontograma.html
            │   └── odontograma.scss
            ├── form-evolucion/
            │   ├── form-evolucion.ts
            │   ├── form-evolucion.html
            │   └── form-evolucion.scss
            └── vista-historia/
                ├── vista-historia.ts
                ├── vista-historia.html
                └── vista-historia.scss
```

---

**Estado final del módulo:** ✅ Completado, probado end-to-end (backend y frontend) y documentado. Listo para revisión y merge a `main`.
