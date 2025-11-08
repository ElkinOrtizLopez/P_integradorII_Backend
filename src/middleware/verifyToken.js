// src/middleware/verifyToken.js
// import jwt from "jsonwebtoken";

// export function verifyToken(req) {
//   const authHeader = req.headers.get("authorization");
//   if (!authHeader) throw new Error("Token ausente");

//   const token = authHeader.split(" ")[1];
//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     return decoded;
//   } catch (err) {
//     throw new Error("Token inválido o expirado");
//   }
// }


//este estaba
// import { verifyToken } from "@/middleware/verifyToken";
// import { NextResponse } from "next/server";

// import jwt from "jsonwebtoken";

// export function verifyToken(req) {
//   const authHeader = req.headers.get("authorization");
//   if (!authHeader) throw new Error("Token ausente");

//   const token = authHeader.split(" ")[1];
//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     return decoded;
//   } catch {
//     throw new Error("Token inválido o expirado");
//   }
// }



// export async function GET(req) {
//   try {
//     const user = verifyToken(req);
//     return NextResponse.json({ message: `Hola ${user.email}` });
//   } catch (err) {
//     return NextResponse.json({ error: err.message }, { status: 401 });
//   }
// }


