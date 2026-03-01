import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// GET /api/stats — Estadísticas globales del sistema (solo admin)
export async function GET(request: Request) {
  const token = request.headers.get('Authorization')?.split(' ')[1];
  if (!token) return NextResponse.json({ error: 'Token requerido' }, { status: 401 });

  const decoded = verifyToken(token) as any;
  if (!decoded) return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
  if (decoded.role !== 'admin') return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });

  try {
    const result = await pool.query(`
      SELECT
        (SELECT COUNT(*)::int FROM users)                                    AS total_usuarios,
        (SELECT COUNT(*)::int FROM especialistas)                            AS total_especialistas,
        (SELECT COUNT(*)::int FROM citas)                                    AS total_citas,
        (SELECT COUNT(*)::int FROM citas WHERE estado = 'activa')           AS citas_activas,
        (SELECT COUNT(*)::int FROM citas WHERE estado = 'cancelada')        AS citas_canceladas,
        (SELECT COUNT(*)::int FROM citas WHERE fecha = CURRENT_DATE)        AS citas_hoy,
        (SELECT COUNT(*)::int FROM citas WHERE fecha >= CURRENT_DATE
                                          AND estado = 'activa')            AS citas_proximas
    `);

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
