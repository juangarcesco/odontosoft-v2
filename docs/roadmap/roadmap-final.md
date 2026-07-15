# Roadmap Final — Módulos 1–3

## Alcance
- Módulo 1: Autenticación (login, register, JWT, roles, middlewares)
- Módulo 2: Pacientes (CRUD, validaciones, búsqueda)
- Módulo 3: Citas (agenda, evitar solapamientos, integración con Pacientes)

## Resumen de entregables
- API y controladores backend para cada módulo.
- Middlewares de seguridad y roles.
- Frontend: login, formularios pacientes, agenda/citas.
- Scripts de seed y pruebas E2E por módulo.
- Documentación: issues por tarea y diagrama Gantt (ver `docs/roadmap/issues/` y `docs/roadmap/gantt.md`).

## Calendario resumido
- Semanas 1–2: Módulo 1 — Autenticación (M1-01..M1-05)
- Semanas 3–4: Módulo 2 — Pacientes (M2-01..M2-05)
- Semanas 5–7: Módulo 3 — Citas (M3-01..M3-05)
- +1 semana buffer para correcciones e integración.

Fechas exactas y dependencias están en `docs/roadmap/gantt.md`.

## Estimaciones y dependencias clave
- Módulo 1 (1–2 semanas): requerido antes de exponer rutas protegidas (M3 depende de M1).
- Módulo 2 (2 semanas): `Paciente` es dependencia directa de `Citas`.
- Módulo 3 (2–3 semanas): depende de M1 y M2 para permisos y selección de paciente.

## Criterios de aceptación por módulo (resumen)
- M1: Login/logout con JWT funcional; roles y middlewares aplicados; seeds operativos.
- M2: CRUD pacientes con validaciones; búsquedas y paginación; protección por roles.
- M3: Agendar/editar/cancelar citas sin solapamientos; vista de agenda en frontend; permisos aplicados.

## Riesgos y mitigaciones
- Retraso en M1 bloquea M3: Mitigar entregando API auth mínima primero.
- Reglas de solapamiento incompletas: definir y aprobar reglas en M3-01 antes de implementar.
- Datos de prueba: usar scripts `seed*` para entornos locales.

## Próximos pasos sugeridos
- Revisar y aprobar el roadmap con el equipo y/o PO.
- Crear issues en GitHub a partir de `docs/roadmap/issues/` (opcionalmente automatizar con la API).
- Abrir PR con la carpeta `docs/roadmap/` si aún no está en la rama principal.

---
Documentos relacionados:
- `docs/roadmap/gantt.md`
- `docs/roadmap/issues/` (todo el listado de tareas detalladas)
