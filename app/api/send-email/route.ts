import nodemailer from "nodemailer";
import { list } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { getCV, DEFAULT_CV_PROFILE } from "@/lib/cv-config";

const GMAIL_USER = process.env.GMAIL_USER || "jrabaona@gmail.com";
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD || "";

const LINKEDIN_URL = "https://www.linkedin.com/in/jaona-andriantsimba-rabaonarison-48b773219/";

interface Session {
  mode: "simple" | "reseautage";
  cvType: string;
  cvUrl: string;
  eventDescription: string;
  eventDate: string;
}

// ── Validation & anti-abus ────────────────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Nettoie une entrée utilisateur : string, sans caractères de contrôle, longueur bornée
function cleanInput(value: unknown, maxLen: number): string {
  if (typeof value !== "string") return "";
  return value.replace(/[\r\n\t\0]/g, " ").trim().slice(0, maxLen);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Rate limiting en mémoire d'instance — best-effort en serverless (Phase 3 :
// refuser les abus évidents, pas une protection absolue)
const hits = new Map<string, number[]>();
function rateLimited(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= max) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);
  return false;
}

// ── Créer le transporteur Gmail ──────────────────────────────────────────────
function createTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_APP_PASSWORD,
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name    = cleanInput(body.name, 100);
    const company = cleanInput(body.company, 100);
    const email   = cleanInput(body.email, 254).toLowerCase();

    // Quota IP large : en événement, plusieurs personnes partagent l'IP du Wi-Fi du lieu
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "inconnue";
    if (rateLimited(`ip:${ip}`, 10, 10 * 60_000) || (email && rateLimited(`to:${email}`, 3, 60 * 60_000))) {
      return NextResponse.json(
        { error: "Trop de demandes, réessayez dans quelques minutes" },
        { status: 429 }
      );
    }

    if (!name || !company || !email) {
      return NextResponse.json({ error: "name, company, email requis" }, { status: 400 });
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Adresse email invalide" }, { status: 400 });
    }

    // ── 1. Lire la session active ────────────────────────────────────────────
    const { blobs } = await list({ prefix: "session-jaona" });
    if (blobs.length === 0) {
      return NextResponse.json({ error: "Aucune session configurée" }, { status: 404 });
    }

    const latest = blobs.sort(
      (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    )[0];

    const sessionRes = await fetch(latest.url, { cache: "no-store" });
    const session: Session = await sessionRes.json();
    const firstName = name.split(" ")[0];
    const profile = getCV(session.cvType) ?? DEFAULT_CV_PROFILE;

    const transporter = createTransporter();

    // ── 2. Télécharger le CV pour l'envoyer en pièce jointe ─────────────────
    const cvRes = await fetch(session.cvUrl);
    if (!cvRes.ok) {
      console.error("CV introuvable:", session.cvUrl, cvRes.status);
      return NextResponse.json({ error: "CV indisponible, réessayez plus tard" }, { status: 500 });
    }
    const cvBuffer = Buffer.from(await cvRes.arrayBuffer());

    // ── 3. Email au contact (CV en pièce jointe) ─────────────────────────────
    const contactText = buildContactEmailText({ firstName, company, session, profile });
    await transporter.sendMail({
      from:    `Jaona Rabaonarison <${GMAIL_USER}>`,
      to:      email,
      subject: session.mode === "reseautage"
        ? `Mon CV — Suite à notre rencontre (${session.eventDescription})`
        : `Mon CV — Suite à notre rencontre`,
      text: contactText,
      attachments: [
        {
          filename: "CV-Jaona-Rabaonarison.pdf",
          content:  cvBuffer,
          contentType: "application/pdf",
        },
      ],
    });

    // ── 3. Notification à Jaona ──────────────────────────────────────────────
    await transporter.sendMail({
      from:    `CV QR Code <${GMAIL_USER}>`,
      to:      GMAIL_USER,
      subject: `🤝 Nouveau contact : ${name} (${company})`,
      html:    buildNotificationEmail({ name, company, email, session }),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Erreur envoi email:", err);
    return NextResponse.json({ error: "Erreur : " + String(err) }, { status: 500 });
  }
}

// ─── Version texte brut → contact ────────────────────────────────────────────

function buildContactEmailText({
  firstName, company, session, profile,
}: { firstName: string; company: string; session: Session; profile: { title: string; mailHook: string } }) {
  const intro = session.mode === "reseautage"
    ? `Suite à notre échange lors de l'évènement ${session.eventDescription} (${session.eventDate}), je me permets de vous faire parvenir mon CV.`
    : `Suite à notre récente rencontre, je me permets de vous faire parvenir mon CV, comme nous en avions discuté.`;

  return `Bonjour ${firstName},

C'est Jaona. ${intro}

Ma spécialité : ${profile.mailHook}. Je serais ravi d'explorer comment cela peut apporter de la valeur chez ${company}.

Vous trouverez mon CV en pièce jointe.

N'hésitez pas à me recontacter :
Email : ${GMAIL_USER}
LinkedIn : ${LINKEDIN_URL}

Au plaisir d'échanger !

Jaona Andriantsimba RABAONARISON
${profile.title}`;
}

// ─── Template email → notification Jaona ─────────────────────────────────────

function buildNotificationEmail({
  name: rawName, company: rawCompany, email: rawEmail, session,
}: { name: string; company: string; email: string; session: Session }) {
  const name    = escapeHtml(rawName);
  const company = escapeHtml(rawCompany);
  const email   = escapeHtml(rawEmail);
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px;">
<tr><td align="center">
<table width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.08);">
  <tr>
    <td style="background:#0f172a;padding:24px 28px;">
      <h1 style="color:#fff;margin:0;font-size:18px;">🤝 Nouveau contact !</h1>
      <p style="color:#64748b;margin:4px 0 0;font-size:12px;">
        ${session.mode === "reseautage" ? `${escapeHtml(session.eventDescription)} · ${escapeHtml(session.eventDate)}` : "Rencontre simple"}
        &nbsp;·&nbsp; CV ${session.cvType.toUpperCase()}
      </p>
    </td>
  </tr>
  <tr><td style="padding:24px 28px;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr style="border-bottom:1px solid #f1f5f9;">
        <td style="padding:9px 0;color:#64748b;font-size:12px;font-weight:600;width:90px;">Nom</td>
        <td style="padding:9px 0;color:#0f172a;font-size:14px;font-weight:700;">${name}</td>
      </tr>
      <tr style="border-bottom:1px solid #f1f5f9;">
        <td style="padding:9px 0;color:#64748b;font-size:12px;font-weight:600;">Entreprise</td>
        <td style="padding:9px 0;color:#0f172a;font-size:14px;">${company}</td>
      </tr>
      <tr>
        <td style="padding:9px 0;color:#64748b;font-size:12px;font-weight:600;">Email</td>
        <td style="padding:9px 0;font-size:14px;"><a href="mailto:${email}" style="color:#2563eb;text-decoration:none;">${email}</a></td>
      </tr>
    </table>
    <div style="margin-top:20px;text-align:center;">
      <a href="mailto:${email}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:10px 28px;border-radius:10px;font-weight:600;font-size:13px;">
        Répondre à ${name.split(" ")[0]} →
      </a>
    </div>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}
