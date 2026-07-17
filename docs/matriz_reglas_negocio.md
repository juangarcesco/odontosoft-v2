# Matriz de Reglas de Negocio (RN) — OdontoSoft

Registro transversal de las reglas de negocio del SRS (sección de Reglas de Negocio). A diferencia de los RF, las RN no siempre pertenecen a un solo módulo, así que se controlan aquí de forma centralizada.

**Estado:** ✅ Implementada y verificada · 🔵 Implementada, pendiente de verificación adicional · ⏳ Pendiente (módulo aún no desarrollado)

---

## Tabla maestra

| RN | Descripción | Módulo(s) que la aplican | Dónde vive en el código | Cómo se verifica | Estado |
|---|---|---|---|---|---|
| RN-01 | No se puede crear una cita si el horario se cruza con otra ya Programada o Confirmada para el mismo odontólogo | Módulo 3 (Citas) | `citaService.js` → `existeConflictoHorario()` | `test-e2e-citas.sh` bloque 5 (409 en conflicto); bloque 12 (horario liberado tras cancelar) | ✅ |
| RN-02 | Un paciente no puede registrarse dos veces con el mismo número y tipo de documento | Módulo 2 (Pacientes) | Índice único compuesto `{tipoDocumento, numeroDocumento}` en `Paciente.js` | `test-e2e-pacientes.sh` bloque 4 (409 en duplicado) | ✅ |
| RN-03 | Solo el rol ODONTÓLOGO puede crear o editar el contenido clínico (evoluciones y odontograma); el ADMIN no tiene acceso de edición | Módulo 4 (Historia Clínica) | `permitirRoles('ODONTOLOGO')` en `historiaClinicaRoutes.js` (rutas de odontograma y evoluciones) | `test-e2e-historia-clinica.sh` bloques 3, 6, 8, 10, 13, 16 (403 en cada intento no autorizado) | ✅ |
| RN-04 | Una factura no puede eliminarse una vez generada; solo puede anularse dejando registro de la anulación | Módulo 5 (Facturación) | `facturaService.js` → `anularFactura()`; campos `estado: 'ANULADA'`, `motivoAnulacion`, `anuladaPor`, `fechaAnulacion` en `Factura.js` | Prueba manual: anulación exitosa (200), motivo obligatorio (400 si falta), rechazo de doble anulación (409), rechazo de pagos sobre factura anulada (409) | ✅ |
| RN-05 | El saldo pendiente de una factura se recalcula automáticamente cada vez que se registra un abono | Módulo 5 (Facturación) | `facturaService.js` → `registrarPago()`: `saldoPendiente` se recalcula restando el monto del valor almacenado, nunca se recibe del cliente | Prueba manual: abono parcial recalcula saldo correctamente; segundo abono lleva a `estado: PAGADA` al llegar a $0; rechazo de montos que excedan el saldo real | ✅ |
| RN-06 | Un material no puede tener stock negativo; toda salida de inventario valida existencias antes de confirmarse | Módulo 6 (Inventario) | `materialService.js` → `registrarSalida()`: valida `cantidad > material.stock` antes de mutar el documento | Prueba manual: salida válida (200), intento de exceso de salida rechazado (409, stock: 20 disponible vs 9999 solicitado) | ✅ |
| RN-07 | Un paciente inactivo no puede ser agendado para nuevas citas hasta que sea reactivado | Módulo 2 (Pacientes) + Módulo 3 (Citas) | `citaService.js` → `crearCita()` valida `paciente.estado === 'ACTIVO'` antes de crear | Prueba manual: crear cita con paciente desactivado devuelve 409 | ✅ |
| RN-08 | El recordatorio automático solo se envía si la cita está en estado Programada o Confirmada | Módulo 7 (Recordatorios) | *(pendiente de desarrollo)* | — | ⏳ |
| RN-09 | Toda acción sobre la historia clínica (creación, edición) queda registrada con el usuario y la fecha/hora que la realizó | Módulo 4 (Historia Clínica) | `historiaClinicaService.js` → `agregarEvolucion()` toma `odontologoId` del JWT (`req.usuario.id`), nunca del body; `timestamps: true` en `evolucionSchema` | Revisión de respuesta: campo `odontologo` coincide con el usuario autenticado, no con datos enviados por el cliente | ✅ |
| RN-10 | El ADMIN puede desactivar (no editar ni eliminar) una evolución clínica errónea, dejando constancia de quién y cuándo; el registro permanece visible para trazabilidad pero no como información vigente | Módulo 4 (Historia Clínica) | Campos `activo`, `desactivadoPor`, `fechaDesactivacion` en `evolucionSchema`; `desactivarEvolucion()` en el servicio | `test-e2e-historia-clinica.sh` bloques 12 (200 al desactivar), 13 (403 ODONTOLOGO), 14 (409 ya desactivada) | ✅ |

---

## Notas importantes sobre RN que cruzan varios módulos

- **RN-02** vive estructuralmente en el Módulo 2 (índice único en `Paciente`), pero es una regla que **protege la integridad de datos** usada por todos los módulos que referencian pacientes (citas, historia clínica, facturación).
- **RN-07** es la única regla que involucra dos módulos de forma directa: el campo `estado` vive en `Paciente` (Módulo 2), pero la validación se ejecuta en `citaService.js` (Módulo 3) al momento de crear la cita.
- **RN-09** no es una validación que rechace algo — es una garantía estructural (el dato "quién lo hizo" siempre se toma de una fuente confiable, el token verificado, nunca de lo que el cliente envía). Vale la pena revisar este patrón cuando se implementen RN-04/RN-05 (facturación), que probablemente necesiten una garantía similar para "quién generó/anuló la factura".

---

## Cómo mantener esta matriz actualizada

1. Cada vez que implementes algo que toque una RN, ven aquí y actualiza la fila correspondiente (dónde vive en el código + cómo se verifica + estado).
2. Cuando cierres un módulo completo, revisa esta tabla junto con `docs/roadmap.md` — ambas deben quedar consistentes.
3. Si el SRS revela una RN nueva que no está aquí (o si descubres una regla implícita no documentada explícitamente en el SRS pero necesaria), agrégala con una nota aclarando que es una regla derivada, no textual del documento original.

---

## Resumen de estado actual

| Estado | Cantidad |
|---|---|
| ✅ Implementada y verificada | 9 (RN-01, RN-02, RN-03, RN-04, RN-05, RN-06, RN-07, RN-09, RN-10) |
| ⏳ Pendiente (módulo no desarrollado) | 1 (RN-08) |
