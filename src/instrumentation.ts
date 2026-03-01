/**
 * instrumentation.ts — Se ejecuta UNA VEZ cuando el servidor Next.js inicia.
 * Aquí registramos el cron job de recordatorios de citas.
 * Compatible con despliegue en Render (servidor persistente, no serverless).
 */

// Flag global para evitar registrar el cron dos veces en desarrollo (hot reload)
let cronRegistrado = false;

export async function register() {
  // Solo se ejecuta en el runtime de Node.js (no en el edge runtime)
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;
  if (cronRegistrado) return;
  cronRegistrado = true;

  const cron = (await import('node-cron')).default;
  const { pool } = await import('@/lib/db');
  const { enviarRecordatorio } = await import('@/lib/email');

  console.log('[Cron] Servicio de recordatorios iniciado.');

  // Se ejecuta cada hora en punto: 0 * * * *
  // En desarrollo puedes cambiarlo a '* * * * *' (cada minuto) para probar
  cron.schedule('0 * * * *', async () => {
    console.log('[Cron] Verificando recordatorios pendientes...');

    try {
      // Calcular la fecha de mañana
      const manana = new Date();
      manana.setDate(manana.getDate() + 1);
      const fechaManana = manana.toISOString().split('T')[0];

      // Buscar citas activas de mañana que aún no tuvieron recordatorio
      const result = await pool.query(
        `SELECT
           c.id,
           c.fecha,
           c.hora,
           u.name  AS nombre_paciente,
           u.email AS email_paciente,
           e.nombre AS nombre_especialista
         FROM citas c
         JOIN users       u ON u.id = c.usuario_id
         JOIN especialistas e ON e.id = c.especialista_id
         WHERE c.fecha = $1
           AND c.estado = 'activa'
           AND c.recordatorio_enviado = false`,
        [fechaManana]
      );

      console.log(`[Cron] ${result.rows.length} recordatorio(s) a enviar para ${fechaManana}`);

      for (const cita of result.rows) {
        await enviarRecordatorio({
          emailDestino:       cita.email_paciente,
          nombrePaciente:     cita.nombre_paciente,
          nombreEspecialista: cita.nombre_especialista,
          fecha: cita.fecha,
          hora:  cita.hora,
        });

        // Marcar como enviado para no repetirlo
        await pool.query(
          'UPDATE citas SET recordatorio_enviado = true WHERE id = $1',
          [cita.id]
        );
      }
    } catch (err: any) {
      console.error('[Cron] Error en job de recordatorios:', err.message);
    }
  });
}
