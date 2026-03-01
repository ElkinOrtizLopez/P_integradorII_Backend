import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1];

  if (!token) {
    return NextResponse.json({ mensaje: 'Token no proporcionado' }, { status: 401 });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return NextResponse.json({ mensaje: 'Token inválido' }, { status: 403 });
  }

  try {
    const result = await pool.query(`
      SELECT
        s.id AS servicio_id,
        s.nombre AS servicio_nombre,
        s.descripcion AS servicio_descripcion,
        s.precio,
        e.id AS especialista_id,
        e.nombre AS especialista_nombre,
        e.especialidad,
        e.biografia,
        e.foto_url,
        e.disponible
      FROM servicios s
      JOIN especialistas e ON s.especialista_id = e.id
    `);

    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ mensaje: 'Error del servidor' }, { status: 500 });
  }
}
