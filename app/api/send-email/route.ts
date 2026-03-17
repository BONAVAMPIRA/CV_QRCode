import nodemailer from "nodemailer";
import { list } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

const GMAIL_USER = process.env.GMAIL_USER || "jrabaona@gmail.com";
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD || "";

const LINKEDIN_URL = "https://www.linkedin.com/in/jaona-andriantsimba-rabaonarison-48b773219/";

// ── Profils dynamiques (même mapping que la page scan) ───────────────────────
const CV_PROFILES: Record<string, { title: string; hook: string }> = {
  bi:   { title: "Business Intelligence Analyst",           hook: "transformer les données en décisions claires" },
  ba:   { title: "Business Analyst",                        hook: "traduire les besoins d'affaires en solutions concrètes" },
  babi: { title: "Analyste BI & Affaires — Profil hybride", hook: "faire le pont entre la donnée et la stratégie" },
};
const DEFAULT_PROFILE = { title: "Analyste BI & Affaires", hook: "accompagner vos projets avec rigueur et agilité" };

interface Session {
  mode: "simple" | "reseautage";
  cvType: string;
  cvUrl: string;
  eventDescription: string;
  eventDate: string;
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
    const { name, company, email } = await req.json();

    if (!name || !company || !email) {
      return NextResponse.json({ error: "name, company, email requis" }, { status: 400 });
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
    const profile = CV_PROFILES[session.cvType] ?? DEFAULT_PROFILE;

    const transporter = createTransporter();

    // ── 2. Télécharger le CV pour l'envoyer en pièce jointe ─────────────────
    const cvRes = await fetch(session.cvUrl);
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
}: { firstName: string; company: string; session: Session; profile: { title: string; hook: string } }) {
  const intro = session.mode === "reseautage"
    ? `Suite à notre échange lors de l'évènement ${session.eventDescription} (${session.eventDate}), je me permets de vous faire parvenir mon CV.`
    : `Suite à notre récente rencontre, je me permets de vous faire parvenir mon CV, comme nous en avions discuté.`;

  return `Bonjour ${firstName},

C'est Jaona. ${intro}

Ma spécialité : ${profile.hook}. Je serais ravi d'explorer comment cela peut apporter de la valeur chez ${company}.

Vous trouverez mon CV en pièce jointe.

N'hésitez pas à me recontacter :
Email : ${GMAIL_USER}
LinkedIn : ${LINKEDIN_URL}

Au plaisir d'échanger !

Jaona Andriantsimba RABAONARISON
${profile.title}`;
}

// ─── Template email → contact ────────────────────────────────────────────────

function buildContactEmail({
  firstName, company, session, profile,
}: { firstName: string; company: string; session: Session; profile: { title: string; hook: string } }) {
  const intro = session.mode === "reseautage"
    ? `Suite à notre échange lors de l'évènement <strong>${session.eventDescription}</strong> (${session.eventDate}), je me permets de vous faire parvenir mon CV.`
    : `Suite à notre récente rencontre, je me permets de vous faire parvenir mon CV, comme nous en avions discuté.`;

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#ffffff;">
<div style="max-width:560px;margin:0 auto;padding:32px 24px;color:#1a1a1a;font-size:15px;line-height:1.7;">

  <p>Bonjour ${firstName},</p>

  <p>C'est Jaona. ${intro}</p>

  <p>
    Ma spécialité : <strong>${profile.hook}</strong>.
    Je serais ravi d'explorer comment cela peut apporter de la valeur chez <strong>${company}</strong>.
  </p>

  <p>Vous trouverez mon CV en <strong>pièce jointe</strong>.</p>

  <p>
    N'hésitez pas à me recontacter directement :<br>
    Email : <a href="mailto:${GMAIL_USER}" style="color:#2563eb;">${GMAIL_USER}</a><br>
    LinkedIn : <a href="${LINKEDIN_URL}" style="color:#2563eb;">linkedin.com/in/jaona-andriantsimba</a>
  </p>

  <p>Au plaisir d'échanger !</p>

  <p>
    Jaona Andriantsimba RABAONARISON<br>
    <em>${profile.title}</em>
  </p>

  <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
  <p style="font-size:11px;color:#9ca3af;">
    ${session.mode === "reseautage"
      ? `Vous avez reçu cet email suite au scan du QR Code de Jaona (${session.eventDescription}).`
      : `Vous avez reçu cet email suite à votre demande de CV auprès de Jaona.`}
  </p>

</div>
</body>
</html>`;
}

// ─── Template email → notification Jaona ─────────────────────────────────────

function buildNotificationEmail({
  name, company, email, session,
}: { name: string; company: string; email: string; session: Session }) {
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
        ${session.mode === "reseautage" ? `${session.eventDescription} · ${session.eventDate}` : "Rencontre simple"}
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
