import { put, list } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

// GET /api/upload — Statut des 3 CVs
export async function GET() {
  try {
    const { blobs } = await list({ prefix: "cv-" });
    const find = (type: string) => {
      const match = blobs
        .filter((b) => b.pathname === `cv-${type}.pdf` || b.pathname.startsWith(`cv-${type}-`))
        .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
      return match[0]?.url ?? null;
    };
    return NextResponse.json({ babi: find("babi"), ba: find("ba"), bi: find("bi") });
  } catch (err) {
    console.error("Erreur lecture CVs:", err);
    return NextResponse.json({ babi: null, ba: null, bi: null });
  }
}

type CVType = "babi" | "ba" | "bi";
const VALID_TYPES: CVType[] = ["babi", "ba", "bi"];

// POST /api/upload — Upload un CV par type (babi, ba, bi)
// Body: FormData avec 'file' (PDF) et 'type' (CVType)
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file     = formData.get("file") as File | null;
    const type     = formData.get("type") as CVType | null;

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier reçu" }, { status: 400 });
    }
    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Le fichier doit être un PDF" }, { status: 400 });
    }
    if (!type || !VALID_TYPES.includes(type)) {
      return NextResponse.json({ error: "Type invalide (babi | ba | bi)" }, { status: 400 });
    }

    // Nom fixe par type — le code lit toujours le plus récent (trié par uploadedAt)
    const blob = await put(`cv-${type}.pdf`, file, {
      access: "public",
      contentType: "application/pdf",
    });

    return NextResponse.json({ cvUrl: blob.url, type });
  } catch (err) {
    console.error("Erreur upload:", err);
    return NextResponse.json(
      { error: "Erreur lors de l'upload : " + String(err) },
      { status: 500 }
    );
  }
}
