import { put, list } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { checkAdminPassword } from "@/lib/admin-auth";
import { CV_IDS, emptyCVStatus, isCvBlobOfType } from "@/lib/cv-config";

// GET /api/upload — Statut de chaque CV (URL du plus récent ou null)
export async function GET() {
  try {
    const { blobs } = await list({ prefix: "cv-" });
    const find = (type: string) => {
      const match = blobs
        .filter((b) => isCvBlobOfType(b.pathname, type))
        .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
      return match[0]?.url ?? null;
    };
    return NextResponse.json(Object.fromEntries(CV_IDS.map((id) => [id, find(id)])));
  } catch (err) {
    console.error("Erreur lecture CVs:", err);
    return NextResponse.json(emptyCVStatus());
  }
}

// POST /api/upload — Upload un CV par type (voir lib/cv-config.ts)
// Body: FormData avec 'file' (PDF), 'type' et 'password'
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file     = formData.get("file") as File | null;
    const type     = formData.get("type") as string | null;
    const password = formData.get("password") as string | null;

    if (!checkAdminPassword(password)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    if (!file) {
      return NextResponse.json({ error: "Aucun fichier reçu" }, { status: 400 });
    }
    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Le fichier doit être un PDF" }, { status: 400 });
    }
    if (!type || !CV_IDS.includes(type)) {
      return NextResponse.json(
        { error: `Type invalide (${CV_IDS.join(" | ")})` },
        { status: 400 }
      );
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
