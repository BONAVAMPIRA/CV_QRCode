import { put, list } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

const CONFIG_FILENAME = "session-jaona.json";
type CVType = "babi" | "ba" | "bi";

// GET /api/config — Lire la session active
export async function GET() {
  try {
    const { blobs } = await list({ prefix: "session-jaona" });

    if (blobs.length === 0) {
      return NextResponse.json({ error: "Aucune session configurée" }, { status: 404 });
    }

    const latest = blobs.sort(
      (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    )[0];

    const res    = await fetch(latest.url, { cache: "no-store" });
    const config = await res.json();
    return NextResponse.json(config);
  } catch (err) {
    console.error("Erreur lecture config:", err);
    return NextResponse.json({ error: "Erreur lecture" }, { status: 500 });
  }
}

// POST /api/config — Sauvegarder la session
// Body: { mode, cvType, eventDescription?, eventDate? }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mode, cvType, eventDescription, eventDate } = body as {
      mode: "simple" | "reseautage";
      cvType: CVType;
      eventDescription?: string;
      eventDate?: string;
    };

    if (!mode || !cvType) {
      return NextResponse.json({ error: "mode et cvType sont requis" }, { status: 400 });
    }

    // Récupérer l'URL du CV correspondant au type choisi
    const { blobs: cvBlobs } = await list({ prefix: `cv-${cvType}` });
    const cvBlob = cvBlobs
      .filter((b) => b.pathname === `cv-${cvType}.pdf` || b.pathname.startsWith(`cv-${cvType}-`))
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())[0];

    if (!cvBlob) {
      return NextResponse.json(
        { error: `Le CV "${cvType}" n'est pas encore uploadé. Va dans /admin d'abord.` },
        { status: 400 }
      );
    }

    const session = {
      mode,
      cvType,
      cvUrl: cvBlob.url,
      eventDescription: eventDescription || "Rencontre professionnelle",
      eventDate:  eventDate  || new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
      updatedAt: new Date().toISOString(),
    };

    await put(CONFIG_FILENAME, JSON.stringify(session), {
      access: "public",
      contentType: "application/json",
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Erreur sauvegarde config:", err);
    return NextResponse.json({ error: "Erreur : " + String(err) }, { status: 500 });
  }
}
