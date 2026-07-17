const cron = require('node-cron');
const { ejecutarEnvioRecordatorios } = require('../services/recordatorioService');

function iniciarJobRecordatorios() {
  // Corre cada hora, en el minuto 0 (ej. 1:00, 2:00, 3:00...)
  cron.schedule('0 * * * *', async () => {
    console.log('[CRON] Ejecutando envío automático de recordatorios...');
    try {
      const resultados = await ejecutarEnvioRecordatorios();
      const enviados = resultados.filter((r) => r.estado === 'ENVIADO').length;
      const fallidos = resultados.filter((r) => r.estado === 'FALLIDO').length;
      const omitidos = resultados.filter((r) => r.omitido).length;
      console.log(
        `[CRON] Proceso completado: ${enviados} enviados, ${fallidos} fallidos, ${omitidos} omitidos (ya enviados)`
      );
    } catch (error) {
      console.error('[CRON] Error al ejecutar envío automático:', error);
    }
  });

  console.log('✅ Job de recordatorios programado (cada hora, minuto 0)');
}

module.exports = { iniciarJobRecordatorios };