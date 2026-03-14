import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await req.json();
    const { fecha, hora } = body;
    const { id } = await params;

    // Verificar disponibilidad
    const exists = await pool.query(
      `SELECT id FROM citas 
       WHERE especialista_id = (
          SELECT especialista_id FROM citas WHERE id = $1
       )
       AND fecha=$2 AND hora=$3`,
      [id, fecha, hora]
    );

    // slot ocupado
    if (exists.rows.length > 0) {
      return NextResponse.json({ error: "Horario no disponible" }, { status: 409 });
    }

    await pool.query(
      `UPDATE citas 
       SET fecha=$1, hora=$2 
       WHERE id=$3`,
      [fecha, hora, id]
    );

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
