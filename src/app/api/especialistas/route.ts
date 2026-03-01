// app/api/especialistas/route.ts
import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

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
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
