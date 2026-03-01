import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

function emailConfigurado(): boolean {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('[Email] Sin credenciales configuradas — email omitido.');
    return false;
  }
  return true;
}

function plantillaBase(contenido: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 24px; border-radius: 8px;">
      <div style="background: #2d6cdf; padding: 20px 24px; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 22px;">AppCitas</h1>
        <p style="color: #c9d8f5; margin: 4px 0 0; font-size: 13px;">Sistema de Gestión de Citas Médicas</p>
      </div>
      <div style="background: white; padding: 28px 24px; border-radius: 0 0 8px 8px;">
        ${contenido}
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="color: #999; font-size: 12px; margin: 0;">
          Este es un mensaje automático. Si tienes alguna duda, ingresa a la aplicación.
        </p>
      </div>
    </div>
  `;
}

// ─── Email de confirmación cuando se agenda una cita ───────────────────────

export async function enviarConfirmacion(datos: {
  emailDestino: string;
  nombrePaciente: string;
  nombreEspecialista: string;
  fecha: string;
  hora: string;
}) {
  if (!emailConfigurado()) return;

  const contenido = `
    <h2 style="color: #2d6cdf; margin-top: 0;">¡Cita confirmada! ✅</h2>
    <p>Hola <strong>${datos.nombrePaciente}</strong>,</p>
    <p>Tu cita ha sido agendada exitosamente. Aquí están los detalles:</p>
    <div style="background: #f0f5ff; padding: 16px; border-radius: 6px; margin: 16px 0;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 6px 0; color: #555; font-size: 14px;">👨‍⚕️ Especialista</td>
          <td style="padding: 6px 0; font-weight: bold;">${datos.nombreEspecialista}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #555; font-size: 14px;">📅 Fecha</td>
          <td style="padding: 6px 0; font-weight: bold;">${datos.fecha}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #555; font-size: 14px;">🕐 Hora</td>
          <td style="padding: 6px 0; font-weight: bold;">${datos.hora}</td>
        </tr>
      </table>
    </div>
    <p>Si necesitas cancelar o reprogramar tu cita, ingresa a la aplicación con anticipación.</p>
  `;

  try {
    await transporter.sendMail({
      from: `"AppCitas" <${process.env.EMAIL_USER}>`,
      to: datos.emailDestino,
      subject: `Cita confirmada con ${datos.nombreEspecialista} — ${datos.fecha}`,
      html: plantillaBase(contenido),
    });
    console.log('[Email] Confirmación enviada a:', datos.emailDestino);
  } catch (error) {
    console.error('[Email] Error al enviar confirmación:', error);
  }
}

// ─── Email de recordatorio 24h antes de la cita ────────────────────────────

export async function enviarRecordatorio(datos: {
  emailDestino: string;
  nombrePaciente: string;
  nombreEspecialista: string;
  fecha: string;
  hora: string;
}) {
  if (!emailConfigurado()) return;

  const contenido = `
    <h2 style="color: #e67e22; margin-top: 0;">Recordatorio de cita ⏰</h2>
    <p>Hola <strong>${datos.nombrePaciente}</strong>,</p>
    <p>Te recordamos que <strong>mañana tienes una cita médica</strong>. No la olvides:</p>
    <div style="background: #fff8f0; padding: 16px; border-radius: 6px; margin: 16px 0; border-left: 4px solid #e67e22;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 6px 0; color: #555; font-size: 14px;">👨‍⚕️ Especialista</td>
          <td style="padding: 6px 0; font-weight: bold;">${datos.nombreEspecialista}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #555; font-size: 14px;">📅 Fecha</td>
          <td style="padding: 6px 0; font-weight: bold;">${datos.fecha}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #555; font-size: 14px;">🕐 Hora</td>
          <td style="padding: 6px 0; font-weight: bold;">${datos.hora}</td>
        </tr>
      </table>
    </div>
    <p>Si no puedes asistir, cancela tu cita desde la aplicación para liberar el horario.</p>
  `;

  try {
    await transporter.sendMail({
      from: `"AppCitas" <${process.env.EMAIL_USER}>`,
      to: datos.emailDestino,
      subject: `Recordatorio: tu cita con ${datos.nombreEspecialista} es mañana`,
      html: plantillaBase(contenido),
    });
    console.log('[Email] Recordatorio enviado a:', datos.emailDestino);
  } catch (error) {
    console.error('[Email] Error al enviar recordatorio:', error);
  }
}
