// ─────────────────────────────────────────────────────────────────────────────
// Source de vérité UNIQUE des types de CV.
// Ajouter un CV = ajouter une entrée ici (puis l'uploader via /admin). Rien d'autre.
//
// Règle de nommage des ids : minuscules et SANS tiret — le tiret est le
// séparateur des noms de blobs "cv-<id>.pdf" / "cv-<id>-xxx.pdf", c'est lui
// qui permet de distinguer "cv-ba-..." de "cv-babi-..." dans isCvBlobOfType.
// ─────────────────────────────────────────────────────────────────────────────

export interface CVDefinition {
  id: string;
  label: string;      // nom complet (page admin)
  shortLabel: string; // nom court (page configure)
  desc: string;
  emoji: string;
  title: string;      // titre pro affiché (page scan + signature mail)
  hook: string;       // accroche à la 1re personne (page scan)
  mailHook: string;   // accroche à l'infinitif ("Ma spécialité : <mailHook>")
}

export const CV_TYPES: CVDefinition[] = [
  {
    id: "babi",
    label: "CV BA · BI",
    shortLabel: "BA · BI",
    desc: "Profil hybride polyvalent",
    emoji: "⚡",
    title: "Analyste BI & Analyste d'Affaires — Profil hybride",
    hook: "Je fais le pont entre vos données et votre stratégie, en passant par des solutions technologiques.",
    mailHook: "faire le pont entre la donnée et la stratégie",
  },
  {
    id: "ba",
    label: "CV Business Analyst",
    shortLabel: "BA",
    desc: "Centré analyse d'affaires",
    emoji: "📊",
    title: "Business Analyst",
    hook: "Je traduis vos besoins d'affaires en solutions concrètes.",
    mailHook: "traduire les besoins d'affaires en solutions concrètes",
  },
  {
    id: "bi",
    label: "CV Business Intelligence",
    shortLabel: "BI",
    desc: "Centré données & Power BI",
    emoji: "📈",
    title: "Business Intelligence Analyst",
    hook: "Je transforme vos données en décisions claires.",
    mailHook: "transformer les données en décisions claires",
  },
  {
    id: "data",
    label: "CV Analyste de données",
    shortLabel: "Data",
    desc: "Centré analyse de données",
    emoji: "🔍",
    title: "Analyste de données",
    hook: "Je fais parler vos données pour éclairer vos décisions.",
    mailHook: "faire parler les données pour éclairer les décisions",
  },
  {
    id: "bsa",
    label: "CV Business Solution Analyst",
    shortLabel: "BSA",
    desc: "Centré solutions d'affaires",
    emoji: "🧩",
    title: "Business Solution Analyst",
    hook: "Je conçois des solutions technologiques alignées sur vos besoins d'affaires.",
    mailHook: "concevoir des solutions technologiques alignées sur les besoins d'affaires",
  },
];

export const CV_IDS = CV_TYPES.map((c) => c.id);

// Profil affiché/envoyé si le cvType d'une session n'existe plus dans la liste
export const DEFAULT_CV_PROFILE: Pick<CVDefinition, "title" | "hook" | "mailHook"> = {
  title: "Analyste BI & Analyste d'Affaires",
  hook: "6+ ans de consulting international au service de vos projets.",
  mailHook: "accompagner vos projets avec rigueur et agilité",
};

export function getCV(id: string | null | undefined): CVDefinition | undefined {
  return CV_TYPES.find((c) => c.id === id);
}

// Statut vide { babi: null, ba: null, ... } pour les états React et les réponses API
export function emptyCVStatus(): Record<string, string | null> {
  return Object.fromEntries(CV_IDS.map((id) => [id, null]));
}

// Le blob d'un type est "cv-<id>.pdf" (nom fixe) ou "cv-<id>-xxx.pdf" (suffixe Vercel)
export function isCvBlobOfType(pathname: string, id: string): boolean {
  return pathname === `cv-${id}.pdf` || pathname.startsWith(`cv-${id}-`);
}
