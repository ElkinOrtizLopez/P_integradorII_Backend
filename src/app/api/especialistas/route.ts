import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// GET /api/especialistas — Lista todos los especialistas con sus servicios (público)
export async function GET() {
  try {
    const res = await pool.query(`
      SELECT e.*, json_agg(json_build_object('id', s.id, 'nombre', s.nombre, 'precio', s.precio)) AS servicios
      FROM especialistas e
      LEFT JOIN servicios s ON s.especialista_id = e.id
      GROUP BY e.id
      ORDER BY e.nombre
    `);
    return NextResponse.json(res.rows);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/especialistas — Crear especialista (solo admin)
export async function POST(request: Request) {
  const token = request.headers.get('Authorization')?.split(' ')[1];
  if (!token) return NextResponse.json({ error: 'Token requerido' }, { status: 401 });
  const decoded = verifyToken(token) as any;
  if (!decoded || decoded.role !== 'admin') {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
  }

  try {
    const { nombre, especialidad, biografia, foto_url, disponible } = await request.json();
    if (!nombre || !especialidad) {
      return NextResponse.json({ error: 'nombre y especialidad son obligatorios' }, { status: 400 });
    }

    const result = await pool.query(
      `INSERT INTO especialistas (nombre, especialidad, biografia, foto_url, disponible)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [nombre, especialidad, biografia || '', foto_url || '', disponible ?? true]
    );

    return NextResponse.json({ ok: true, especialista: result.rows[0] }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
