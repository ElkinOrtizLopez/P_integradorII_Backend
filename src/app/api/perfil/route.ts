import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

function getDecoded(request: Request) {
  const token = request.headers.get('Authorization')?.split(' ')[1];
  if (!token) return null;
  return verifyToken(token) as any;
}

// ── GET /api/perfil ─ devuelve los datos del usuario autenticado ──────────
export async function GET(request: Request) {
  const decoded = getDecoded(request);
  if (!decoded) {
    return NextResponse.json({ error: 'Token no proporcionado o inválido' }, { status: 401 });
  }

  try {
    const result = await pool.query(
      'SELECT id, email, name, role, created_at FROM users WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ user: result.rows[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error desconocido' }, { status: 500 });
  }
}

// ── PUT /api/perfil ─ actualiza el nombre del usuario (email no cambia) ───
export async function PUT(request: Request) {
  const decoded = getDecoded(request);
  if (!decoded) {
    return NextResponse.json({ error: 'Token no proporcionado o inválido' }, { status: 401 });
  }

  try {
    const { name } = await request.json();

    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'El nombre no puede estar vacío' }, { status: 400 });
    }

    const result = await pool.query(
      'UPDATE users SET name = $1 WHERE id = $2 RETURNING id, email, name, role',
      [name.trim(), decoded.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ mensaje: 'Perfil actualizado', user: result.rows[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error desconocido' }, { status: 500 });
  }
}

export function OPTIONS() {
  return new Response(null, { status: 204 });
}