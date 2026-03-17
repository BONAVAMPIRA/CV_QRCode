import { list } from "@vercel/blob";
import { NextResponse } from "next/server";

// GET /api/cvs — Retourne le statut des 3 CVs (uploadés ou non)
export async function GET() {
  try {
    const { blobs } = await list({ prefix: "cv-" });

    const find = (type: string) => {
      const match = blobs
        .filter((b) => b.pathname === `cv-${type}.pdf` || b.pathname.startsWith(`cv-${type}-`))
        .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
      return match[0]?.url ?? null;
    };

    return NextResponse.json({
      babi: find("babi"),
      ba:   find("ba"),
      bi:   find("bi"),
    });
  } catch (err) {
    console.error("Erreur lecture CVs:", err);
    return NextResponse.json({ babi: null, ba: null, bi: null });
  }
}
