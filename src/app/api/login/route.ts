import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email y contraseña son obligatorios' }, { status: 400 });
    }

    const userResult = await pool.query(
      'SELECT id, name, role FROM users WHERE email = $1',
      [email]
    );
    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const user = userResult.rows[0];

    const credResult = await pool.query(
      'SELECT password_hash FROM auth_credentials WHERE user_id = $1',
      [user.id]
    );
    if (credResult.rows.length === 0) {
      return NextResponse.json({ error: 'Credenciales no encontradas' }, { status: 404 });
    }

    const isValid = await bcrypt.compare(password, credResult.rows[0].password_hash);
    if (!isValid) {
      return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '2h' }
    );

    await pool.query(
      'UPDATE auth_credentials SET last_login = NOW() WHERE user_id = $1',
      [user.id]
    );

    return NextResponse.json({ mensaje: 'Login exitoso', token, user: { id: user.id, name: user.name, role: user.role } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error desconocido' }, { status: 500 });
  }
}

export function OPTIONS() {
  return new Response(null, { status: 204 });
}
