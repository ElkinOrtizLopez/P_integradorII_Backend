import { NextResponse } from "next/server";
import { authAdmin } from "@/lib/firebase-admin";
import { pool } from "@/lib/db";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    const { token } = await req.json();
    if (!token) {
      return NextResponse.json({ error: "Token faltante" }, { status: 400 });
    }

    // 1️⃣ Verificar token de Firebase
    const decodedToken = await authAdmin.verifyIdToken(token);
    const { uid, email, name } = decodedToken;

    // 2️⃣ Verificar si existe en PostgreSQL
    const result = await pool.query("SELECT * FROM users WHERE firebase_uid = $1", [uid]);
    let user = result.rows[0];

    // 3️⃣ Si no existe, crear registro
    if (!user) {
      const insert = await pool.query(
        `INSERT INTO users (firebase_uid, email, name, role, created_at)
         VALUES ($1, $2, $3, $4, NOW()) RETURNING *`,
        [uid, email, name || "", "user"]
      );
      user = insert.rows[0];
    }

    // 4️⃣ Crear JWT interno
    const appToken = jwt.sign(
      { uid: user.firebase_uid, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return NextResponse.json({ user, token: appToken });
  } catch (err) {
    console.error("Error en login:", err);
    return NextResponse.json({ error: "Token inválido o expirado" }, { status: 401 });
  }
}