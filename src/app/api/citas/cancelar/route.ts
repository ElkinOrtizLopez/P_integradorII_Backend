import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function POST(request: Request) {
  // Verificar token
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
    const { cita_id } = await request.json();

    if (!cita_id) {
      return NextResponse.json({ error: 'cita_id es obligatorio' }, { status: 400 });
    }

    // Verificar que la cita existe y pertenece al usuario del token
    const cita = await pool.query('SELECT usuario_id FROM citas WHERE id = $1', [cita_id]);

    if (cita.rows.length === 0) {
      return NextResponse.json({ error: 'La cita no existe' }, { status: 404 });
    }

    if (cita.rows[0].usuario_id !== decoded.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    await pool.query("UPDATE citas SET estado = 'cancelada' WHERE id = $1", [cita_id]);

    return NextResponse.json({ ok: true, mensaje: 'Cita cancelada' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
