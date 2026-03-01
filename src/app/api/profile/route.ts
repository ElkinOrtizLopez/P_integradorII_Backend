import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function GET(request: Request) {
  const token = request.headers.get('Authorization')?.split(' ')[1];

  if (!token) {
    return NextResponse.json({ error: 'Token no proporcionado' }, { status: 401 });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return NextResponse.json({ error: 'Token inválido o expirado' }, { status: 403 });
  }

  return NextResponse.json({ mensaje: 'Token válido', usuario: decoded });
}

export function OPTIONS() {
  return new Response(null, { status: 204 });
}
