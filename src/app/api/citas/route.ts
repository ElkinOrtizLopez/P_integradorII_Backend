import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { enviarConfirmacion } from '@/lib/email';

// GET → /api/citas?especialista_id=1&fecha=2025-11-10
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const especialista_id = url.searchParams.get('especialista_id');
    const fecha = url.searchParams.get('fecha');

    if (!especialista_id || !fecha) {
      return NextResponse.json({ error: 'especialista_id y fecha son requeridos' }, { status: 400 });
    }

    const result = await pool.query(
      'SELECT id, hora, usuario_id, estado FROM citas WHERE especialista_id = $1 AND fecha = $2',
      [especialista_id, fecha]
    );

    return NextResponse.json(result.rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error desconocido' }, { status: 500 });
  }
}

// POST → Crear cita
export async function POST(request: Request) {
  try {
    const { usuario_id, especialista_id, fecha, hora } = await request.json();

    if (!usuario_id || !especialista_id || !fecha || !hora) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    // Verificar que el horario esté disponible
    const exists = await pool.query(
      'SELECT id FROM citas WHERE especialista_id=$1 AND fecha=$2 AND hora=$3 AND estado=$4',
      [especialista_id, fecha, hora, 'activa']
    );
    if (exists.rows.length > 0) {
      return NextResponse.json({ error: 'Horario no disponible' }, { status: 409 });
    }

    // Crear la cita
    const insert = await pool.query(
      'INSERT INTO citas (usuario_id, especialista_id, fecha, hora) VALUES ($1, $2, $3, $4) RETURNING *',
      [usuario_id, especialista_id, fecha, hora]
    );
    const cita = insert.rows[0];

    // Enviar email de confirmación en segundo plano (no bloquea la respuesta)
    pool.query(
      `SELECT u.name, u.email, e.nombre AS nombre_especialista
       FROM users u, especialistas e
       WHERE u.id = $1 AND e.id = $2`,
      [usuario_id, especialista_id]
    ).then(info => {
      if (info.rows.length > 0) {
        const { name, email, nombre_especialista } = info.rows[0];
        enviarConfirmacion({
          emailDestino: email,
          nombrePaciente: name,
          nombreEspecialista: nombre_especialista,
          fecha,
          hora,
        });
      }
    }).catch(err => console.error('[Citas] Error al obtener datos para email:', err.message));

    return NextResponse.json({ ok: true, cita }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error desconocido' }, { status: 500 });
  }
}
