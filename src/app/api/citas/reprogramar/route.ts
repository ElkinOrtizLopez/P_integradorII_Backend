import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function POST(request: Request) {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return NextResponse.json({ error: 'Token requerido' }, { status: 401 });
  }

  const decoded = verifyToken(token) as any;
  if (!decoded) {
    return NextResponse.json({ error: 'Token inválido o expirado' }, { status: 401 });
  }

  try {
    const { cita_id, nueva_fecha, nueva_hora } = await request.json();

    if (!cita_id || !nueva_fecha || !nueva_hora) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    const cita = await pool.query(
      'SELECT usuario_id, especialista_id FROM citas WHERE id = $1',
      [cita_id]
    );

    if (cita.rows.length === 0) {
      return NextResponse.json({ error: 'La cita no existe' }, { status: 404 });
    }

    if (cita.rows[0].usuario_id !== decoded.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const conflict = await pool.query(
      `SELECT id FROM citas
       WHERE especialista_id=$1 AND fecha=$2 AND hora=$3 AND estado='activa' AND id <> $4`,
      [cita.rows[0].especialista_id, nueva_fecha, nueva_hora, cita_id]
    );

    if (conflict.rows.length > 0) {
      return NextResponse.json({ error: 'Horario no disponible' }, { status: 409 });
    }

    const updated = await pool.query(
      'UPDATE citas SET fecha=$1, hora=$2 WHERE id=$3 RETURNING *',
      [nueva_fecha, nueva_hora, cita_id]
    );

    return NextResponse.json({ ok: true, cita: updated.rows[0] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
