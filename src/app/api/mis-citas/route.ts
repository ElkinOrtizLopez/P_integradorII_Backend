import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request: Request) {
  // Verificar token
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return NextResponse.json({ error: 'Token requerido' }, { status: 401 });
  }

  const decoded = verifyToken(token) as any;
  if (!decoded) {
    return NextResponse.json({ error: 'Token inválido o expirado' }, { status: 401 });
  }

  // El usuario_id viene del token, no de la URL (seguridad)
  const usuario_id = decoded.id;

  const res = await pool.query(
    `SELECT c.id, c.fecha, c.hora, c.estado,
            e.nombre AS especialista,
            e.especialidad
     FROM citas c
     INNER JOIN especialistas e ON e.id = c.especialista_id
     WHERE c.usuario_id = $1
       AND c.estado = 'activa'
     ORDER BY c.fecha ASC, c.hora ASC`,
    [usuario_id]
  );

  return NextResponse.json(res.rows);
}
