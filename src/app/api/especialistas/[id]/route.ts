import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

function soloAdmin(request: Request) {
  const token = request.headers.get('Authorization')?.split(' ')[1];
  if (!token) return null;
  const decoded = verifyToken(token) as any;
  return decoded?.role === 'admin' ? decoded : null;
}

// PUT /api/especialistas/[id] — Actualizar especialista
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!soloAdmin(request)) {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const { nombre, especialidad, biografia, foto_url, disponible } = await request.json();
    const result = await pool.query(
      `UPDATE especialistas
       SET nombre=$1, especialidad=$2, biografia=$3, foto_url=$4, disponible=$5
       WHERE id=$6 RETURNING *`,
      [nombre, especialidad, biografia || '', foto_url || '', disponible ?? true, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Especialista no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, especialista: result.rows[0] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/especialistas/[id] — Eliminar especialista
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!soloAdmin(request)) {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const result = await pool.query(
      'DELETE FROM especialistas WHERE id=$1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Especialista no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
