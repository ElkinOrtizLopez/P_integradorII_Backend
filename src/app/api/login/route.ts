import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL
});

const corsHeaders = {
  'Access-Control-Allow-Origin': 'http://localhost:4200',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return new NextResponse(JSON.stringify({ error: 'Email y contraseña son obligatorios' }), {
        status: 400,
        headers: corsHeaders
      });
    }

    // Buscar usuario
    const userResult = await pool.query('SELECT id, name, role FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return new NextResponse(JSON.stringify({ error: 'Usuario no encontrado' }), {
        status: 404,
        headers: corsHeaders
      });
    }

    const user = userResult.rows[0];

    // Buscar credenciales
    const credResult = await pool.query(
      'SELECT password_hash FROM auth_credentials WHERE user_id = $1',
      [user.id]
    );

    if (credResult.rows.length === 0) {
      return new NextResponse(JSON.stringify({ error: 'Credenciales no encontradas' }), {
        status: 404,
        headers: corsHeaders
      });
    }

    const { password_hash } = credResult.rows[0];

    // Verificar contraseña
    const isValid = await bcrypt.compare(password, password_hash);
    if (!isValid) {
      return new NextResponse(JSON.stringify({ error: 'Contraseña incorrecta' }), {
        status: 401,
        headers: corsHeaders
      });
    }

    // Opcional: actualizar last_login
    await pool.query(
      'UPDATE auth_credentials SET last_login = NOW() WHERE user_id = $1',
      [user.id]
    );

    return new NextResponse(JSON.stringify({
      mensaje: 'Login exitoso',
      user: {
        id: user.id,
        name: user.name,
        role: user.role
      }
    }), {
      status: 200,
      headers: corsHeaders
    });
  } catch (error: any) {
    console.error('❌ Error en login:', error);
    return new NextResponse(JSON.stringify({ error: error.message || 'Error desconocido' }), {
      status: 500,
      headers: corsHeaders
    });
  }
}

export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders
  });
}
