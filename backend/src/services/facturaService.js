const HistoriaClinica = require('../models/HistoriaClinica');
const Factura = require('../models/Factura');

async function obtenerTratamientosFacturables(pacienteId) {
  const historia = await HistoriaClinica.findOne({ paciente: pacienteId });

  if (!historia) {
    return [];
  }

  // Solo se exponen los campos mínimos necesarios para facturar,
  // nunca la descripción clínica completa ni el resto de la historia
  const tratamientos = [];

  historia.evoluciones
    .filter((evolucion) => evolucion.activo)
    .forEach((evolucion) => {
      evolucion.tratamientosRealizados.forEach((tratamiento) => {
        tratamientos.push({
          evolucionId: evolucion._id,
          fecha: evolucion.fecha,
          diente: tratamiento.diente,
          procedimiento: tratamiento.procedimiento,
        });
      });
    });

  return tratamientos;
}

module.exports = { obtenerTratamientosFacturables };