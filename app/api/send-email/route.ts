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

    // ── 2. Email au contact (personnalisé selon mode + cvType) ───────────────
    await transporter.sendMail({
      from:    `Jaona Rabaonarison <${GMAIL_USER}>`,
      to:      email,
      subject: session.mode === "reseautage"
        ? `Mon CV — Suite à notre rencontre (${session.eventDescription})`
        : `Mon CV — Suite à notre rencontre`,
      html: buildContactEmail({ firstName, company, session, profile }),
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

// ─── Template email → contact ────────────────────────────────────────────────

function buildContactEmail({
  firstName, company, session, profile,
}: { firstName: string; company: string; session: Session; profile: { title: string; hook: string } }) {
  const intro = session.mode === "reseautage"
    ? `Suite à notre échange lors de <strong>${session.eventDescription}</strong> (${session.eventDate}), je me permets de vous faire parvenir mon CV.`
    : `Suite à notre récente rencontre, je me permets de vous faire parvenir mon CV, comme nous en avions discuté.`;

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

  <!-- Header -->
  <tr>
    <td style="background:linear-gradient(135deg,#1e3a5f,#2563eb);padding:44px 40px;text-align:center;">
      <div style="width:64px;height:64px;background:rgba(255,255,255,0.15);border-radius:14px;margin:0 auto 16px;font-size:26px;font-weight:900;color:#fff;line-height:64px;text-align:center;">JR</div>
      <h1 style="color:#fff;margin:0 0 6px;font-size:24px;font-weight:800;">Ravi d'avoir discuté avec vous !</h1>
      <p style="color:rgba(255,255,255,0.7);margin:0;font-size:13px;">${profile.title}</p>
      ${session.mode === "reseautage" ? `<p style="color:rgba(255,255,255,0.5);margin:6px 0 0;font-size:12px;">📍 ${session.eventDescription} · ${session.eventDate}</p>` : ""}
    </td>
  </tr>

  <!-- Body -->
  <tr><td style="padding:36px 40px;">
    <p style="color:#374151;font-size:16px;line-height:1.7;margin:0 0 14px;">Bonjour <strong>${firstName}</strong>,</p>
    <p style="color:#374151;font-size:16px;line-height:1.7;margin:0 0 14px;">C'est Jaona. ${intro}</p>
    <p style="color:#374151;font-size:16px;line-height:1.7;margin:0 0 28px;">
      Ma spécialité : <strong>${profile.hook}</strong>.
      Je serais ravi d'explorer comment cela peut apporter de la valeur chez <strong>${company}</strong>.
    </p>

    <!-- Bouton CV -->
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td align="center" style="padding-bottom:28px;">
        <a href="${session.cvUrl}" style="display:inline-block;background:linear-gradient(135deg,#1e3a5f,#2563eb);color:#fff;text-decoration:none;padding:14px 44px;border-radius:12px;font-weight:700;font-size:15px;box-shadow:0 4px 14px rgba(37,99,235,0.35);">
          ⬇️ Télécharger mon CV
        </a>
      </td></tr>
    </table>

    <!-- Coordonnées -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:12px;margin-bottom:24px;">
      <tr><td style="padding:18px 22px;">
        <p style="color:#64748b;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin:0 0 10px;">Mes coordonnées</p>
        <p style="color:#374151;font-size:13px;margin:5px 0;">📧 <a href="mailto:${GMAIL_USER}" style="color:#2563eb;text-decoration:none;">${GMAIL_USER}</a></p>
        <p style="color:#374151;font-size:13px;margin:5px 0;">💼 <a href="${LINKEDIN_URL}" style="color:#2563eb;text-decoration:none;">Mon profil LinkedIn</a></p>
        <p style="color:#374151;font-size:13px;margin:5px 0;">🐙 <a href="https://github.com/BONAVAMPIRA/CV_QRCode" style="color:#2563eb;text-decoration:none;">GitHub</a></p>
      </td></tr>
    </table>

    <p style="color:#374151;font-size:16px;line-height:1.7;margin:0 0 6px;">N'hésitez pas à me contacter. Au plaisir d'échanger !</p>
    <p style="color:#374151;font-size:16px;font-weight:700;margin:0;">Jaona Andriantsimba RABAONARISON</p>
  </td></tr>

  <!-- Footer -->
  <tr>
    <td style="border-top:1px solid #e2e8f0;padding:16px 40px;text-align:center;">
      <p style="color:#94a3b8;font-size:11px;margin:0;">
        ${session.mode === "reseautage"
          ? `Vous avez reçu cet email suite au scan du QR Code de Jaona (${session.eventDescription}).`
          : `Vous avez reçu cet email suite à votre demande de CV auprès de Jaona.`}
      </p>
    </td>
  </tr>
</table>
</td></tr>
</table>
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
