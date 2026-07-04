import { NextRequest, NextResponse } from "next/server";
import { checkAdminPassword } from "@/lib/admin-auth";

// POST /api/admin-auth — Vérifie le mot de passe admin côté serveur
export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    if (!checkAdminPassword(password ?? null)) {
      return NextResponse.json({ error: "Mot de passe incorrect" }, { status: 401 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }
}
