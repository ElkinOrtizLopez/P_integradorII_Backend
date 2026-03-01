// import { NextResponse } from "next/server";
// import { Pool } from "pg";

// const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// export async function PUT(_req: Request, { params }: { params: { id: string } }) {
//   try {
//     const citaId = params.id;

//     await pool.query(
//       `UPDATE citas 
//        SET estado = 'cancelada' 
//        WHERE id = $1`,
//       [citaId]
//     );

//     return NextResponse.json({ ok: true });
//   } catch (err: any) {
//     console.error(err);
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }

import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cita_id, usuario_id } = body;

    if (!cita_id || !usuario_id) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    const res = await pool.query(
      `UPDATE citas
       SET estado='cancelada'
       WHERE id=$1 AND usuario_id=$2
       RETURNING *`,
      [cita_id, usuario_id]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ error: 'Cita no encontrada' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, cita: res.rows[0] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
