// import { NextResponse } from 'next/server';
// import { Pool } from 'pg';

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL
// });

// export async function GET(request: Request) {
//   try {
//     const url = new URL(request.url);
//     const doctorId = url.searchParams.get('doctor_id');

//     if (!doctorId) {
//       return NextResponse.json({ error: 'doctor_id requerido' }, { status: 400 });
//     }

//     const result = await pool.query(
//       `
//         SELECT 
//           c.id AS cita_id,
//           u.name AS paciente,
//           u.email,
//           c.fecha,
//           c.hora,
//           c.estado,
//           e.nombre AS especialista
//         FROM citas c
//         INNER JOIN users u ON u.id = c.usuario_id
//         INNER JOIN especialistas e ON e.id = c.especialista_id
//         WHERE c.especialista_id = $1
//         AND c.estado = 'activa'
//         ORDER BY c.fecha, c.hora
//       `,
//       [doctorId]
//     );

//     return NextResponse.json(result.rows);

//   } catch (error: any) {
//     console.error(error);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }

import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const doctor_id = Number(searchParams.get("doctor_id"));
    if (!doctor_id) {
      return NextResponse.json({ error: "doctor_id requerido" }, { status: 400 });
    }

    // Fecha actual
    const hoy = new Date().toISOString().slice(0, 10);

    const query = `
      SELECT 
        u.name AS paciente,
        u.email,
        c.fecha,
        c.hora
      FROM citas c
      JOIN users u ON u.id = c.usuario_id
      JOIN especialistas e ON e.id = c.especialista_id
      WHERE e.user_id = $1
        AND c.fecha = $2
        AND c.estado = 'activa'
      ORDER BY c.hora ASC
    `;

    const result = await pool.query(query, [doctor_id, hoy]);

    return NextResponse.json(result.rows);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
