import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { randomUUID } from 'crypto';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Todos los campos son obligatorios' }, { status: 400 });
    }

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: 'El correo ya está registrado' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const firebase_uid = randomUUID();

    const userResult = await pool.query(
      `INSERT INTO users (firebase_uid, email, name, role) VALUES ($1, $2, $3, $4) RETURNING id`,
      [firebase_uid, email, name, 'user']
    );
    const userId = userResult.rows[0].id;

    await pool.query(
      `INSERT INTO auth_credentials (user_id, password_hash) VALUES ($1, $2)`,
      [userId, hashedPassword]
    );

    return NextResponse.json({ mensaje: 'Usuario registrado correctamente', id: userId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error desconocido' }, { status: 500 });
  }
}

export function OPTIONS() {
  return new Response(null, { status: 204 });
}
