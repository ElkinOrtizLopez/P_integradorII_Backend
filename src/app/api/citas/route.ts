import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

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

    const exists = await pool.query(
      'SELECT id FROM citas WHERE especialista_id=$1 AND fecha=$2 AND hora=$3 AND estado=$4',
      [especialista_id, fecha, hora, 'activa']
    );
    if (exists.rows.length > 0) {
      return NextResponse.json({ error: 'Horario no disponible' }, { status: 409 });
    }

    const insert = await pool.query(
      'INSERT INTO citas (usuario_id, especialista_id, fecha, hora) VALUES ($1, $2, $3, $4) RETURNING *',
      [usuario_id, especialista_id, fecha, hora]
    );

    return NextResponse.json({ ok: true, cita: insert.rows[0] }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error desconocido' }, { status: 500 });
  }
}
