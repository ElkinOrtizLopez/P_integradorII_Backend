// import { NextResponse } from 'next/server';
// import { verifyToken } from '@/lib/auth';

// const corsHeaders = {
//   'Access-Control-Allow-Origin': 'http://localhost:4200',
//   'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
//   'Access-Control-Allow-Headers': 'Content-Type, Authorization'
// };

// export async function GET(request: Request) {
//   const authHeader = request.headers.get('Authorization');
//   const token = authHeader?.split(' ')[1];

//   if (!token) {
//     return new NextResponse(JSON.stringify({ error: 'Token no proporcionado' }), {
//       status: 401,
//       headers: corsHeaders
//     });
//   }

//   const decoded = verifyToken(token);
//   if (!decoded) {
//     return new NextResponse(JSON.stringify({ error: 'Token inválido o expirado' }), {
//       status: 403,
//       headers: corsHeaders
//     });
//   }

//   return new NextResponse(JSON.stringify({
//     mensaje: 'Token válido',
//     usuario: decoded
//   }), {
//     status: 200,
//     headers: corsHeaders
//   });
// }

// export function OPTIONS() {
//   return new Response(null, {
//     status: 204,
//     headers: corsHeaders
//   });
// }

import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth'; // helper para verificar JWT

const corsHeaders = {
  'Access-Control-Allow-Origin': 'http://localhost:4200',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

export async function GET(request: Request) {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return new NextResponse(JSON.stringify({ error: 'Token no proporcionado' }), {
      status: 401,
      headers: corsHeaders
    });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return new NextResponse(JSON.stringify({ error: 'Token inválido o expirado' }), {
      status: 403,
      headers: corsHeaders
    });
  }

  // Aquí puedes personalizar la respuesta con los datos que guardaste en el token
  return new NextResponse(JSON.stringify({
    mensaje: 'Token válido',
    usuario: decoded
  }), {
    status: 200,
    headers: corsHeaders
  });
}

export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders
  });
}
