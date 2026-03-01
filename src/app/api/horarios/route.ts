import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('especialista_id');

    if (!id) {
      return NextResponse.json({ error: 'especialista_id requerido' }, { status: 400 });
    }

    const res = await pool.query(
      'SELECT dia_semana, hora_inicio, hora_fin FROM horarios_especialistas WHERE especialista_id = $1 ORDER BY dia_semana, hora_inicio',
      [id]
    );

    return NextResponse.json(res.rows);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
