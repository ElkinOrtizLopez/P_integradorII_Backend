import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { pool } from "@/lib/db";

export async function GET(req) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Token ausente" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const result = await pool.query(
      "SELECT firebase_uid, email, name, role, created_at FROM users WHERE firebase_uid = $1",
      [decoded.uid]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ user: result.rows[0] });
  } catch (err) {
    console.error("Error en /me:", err);
    return NextResponse.json({ error: "Token inválido o expirado" }, { status: 401 });
  }
}
