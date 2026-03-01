import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return NextResponse.json({ error: 'Token requerido' }, { status: 401 });
  }

  const decoded = verifyToken(token) as any;
  if (!decoded) {
    return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
  }

  try {
    const especialistaRes = await pool.query(
      'SELECT id FROM especialistas WHERE user_id = $1',
      [decoded.id]
    );

    if (especialistaRes.rowCount === 0) {
      return NextResponse.json({ error: 'No existe especialista para este usuario' }, { status: 404 });
    }

    const especialistaId = especialistaRes.rows[0].id;
    const hoy = new Date().toISOString().slice(0, 10);

    const citasRes = await pool.query(
      `SELECT c.id, c.usuario_id, u.name AS paciente, u.email,
              to_char(c.fecha, 'YYYY-MM-DD') AS fecha,
              to_char(c.hora, 'HH24:MI') AS hora,
              c.estado
       FROM citas c
       JOIN users u ON u.id = c.usuario_id
       WHERE c.especialista_id = $1 AND c.fecha = $2 AND c.estado = 'activa'
       ORDER BY c.hora`,
      [especialistaId, hoy]
    );

    return NextResponse.json(citasRes.rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
