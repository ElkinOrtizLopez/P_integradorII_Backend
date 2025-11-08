// src/app/api/register/route.ts
// import { NextResponse } from 'next/server';
// import { admin } from '@/lib/firebase-admin';

// export async function POST(request: Request) {
//   try {
//     const body = await request.json();
//     const { name, email, password } = body;

//     // ✅ Crear usuario en Firebase Auth
//     const userRecord = await admin.auth().createUser({
//       email,
//       password,
//       displayName: name
//     });

//     // ✅ Opcional: guardar en Firestore
//     await admin.firestore().collection('users').doc(userRecord.uid).set({
//       name,
//       email,
//       createdAt: new Date().toISOString()
//     });

//     return NextResponse.json({ mensaje: 'Usuario registrado correctamente', uid: userRecord.uid }, { status: 200 });
//   } catch (error: any) {
//     console.error('Error en registro:', error);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }

// export function GET() {
//   return NextResponse.json({ error: 'Método no permitido' }, { status: 405 });
// }

import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { randomUUID } from 'crypto';
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
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return new NextResponse(JSON.stringify({ error: 'Todos los campos son obligatorios' }), {
        status: 400,
        headers: corsHeaders
      });
    }

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return new NextResponse(JSON.stringify({ error: 'El correo ya está registrado' }), {
        status: 409,
        headers: corsHeaders
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const firebase_uid = randomUUID();

    const userResult = await pool.query(
      `INSERT INTO users (firebase_uid, email, name, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [firebase_uid, email, name, 'user']
    );

    const userId = userResult.rows[0].id;

    await pool.query(
      `INSERT INTO auth_credentials (user_id, password_hash)
       VALUES ($1, $2)`,
      [userId, hashedPassword]
    );

    return new NextResponse(JSON.stringify({
      mensaje: 'Usuario registrado correctamente',
      id: userId,
      firebase_uid
    }), {
      status: 200,
      headers: corsHeaders
    });
  } catch (error: any) {
    console.error('❌ Error en registro:', error);
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
