"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Session {
  mode: "simple" | "reseautage";
  cvType: string;
  cvUrl: string;
  eventDescription: string;
  eventDate: string;
}

type MainState = "landing" | "form" | "linkedin" | "thankyou";

// ── Profils dynamiques selon le CV sélectionné par Jaona ──────────────────────
const CV_PROFILES: Record<string, { title: string; hook: string }> = {
  bi:   { title: "Business Intelligence Analyst",           hook: "Je transforme vos données en décisions claires." },
  ba:   { title: "Business Analyst",                        hook: "Je traduis vos besoins d'affaires en solutions concrètes." },
  babi: { title: "Analyste BI & Analyste d'Affaires — Profil hybride", hook: "Je fais le pont entre vos données et votre stratégie, en passant par des solutions technologiques." },
};
const DEFAULT_PROFILE = { title: "Analyste BI & Analyste d'Affaires", hook: "6+ ans de consulting international au service de vos projets." };

const LINKEDIN_URL = "https://www.linkedin.com/in/jaona-andriantsimba-rabaonarison-48b773219/";

export default function ScanPage() {
  const [session, setSession]       = useState<Session | null>(null);
  const [mainState, setMainState]   = useState<MainState>("landing");
  const [pdfOpen, setPdfOpen]       = useState(false);
  const [name, setName]             = useState("");
  const [company, setCompany]       = useState("");
  const [email, setEmail]           = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError]   = useState("");
  const [iframeLoading, setIframeLoading] = useState(true);

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.ok ? r.json() : null)
      .then(setSession)
      .catch(() => {});
  }, []);

  // ── Profil dynamique ────────────────────────────────────────────────────────
  const profile = CV_PROFILES[session?.cvType ?? ""] ?? DEFAULT_PROFILE;

  // ── Envoi du formulaire ──────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError("");
    setPdfOpen(false);

    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), company: company.trim(), email: email.trim() }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Erreur d'envoi");
      }
      setMainState("linkedin");
    } catch (err) {
      setFormError("❌ " + String(err));
    } finally {
      setSubmitting(false);
    }
  };

  // ── URL du viewer PDF ───────────────────────────────────────────────────────
  const pdfViewerUrl = session?.cvUrl ?? "";

  const firstName = name.split(" ")[0] || "vous";

  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">

      {/* Fond animé */}
      <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] bg-blue-600 rounded-full filter blur-3xl opacity-10 animate-blob pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] bg-purple-600 rounded-full filter blur-3xl opacity-10 animate-blob animation-delay-2000 pointer-events-none" />

      {/* ── MODAL PDF ──────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {pdfOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col bg-slate-950"
          >
            {/* Barre d'actions fixe en haut */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800 flex-shrink-0">
              <button
                onClick={() => setPdfOpen(false)}
                className="flex items-center gap-1.5 text-slate-300 hover:text-white text-sm font-medium transition"
              >
                ✕ Fermer
              </button>
              <button
                onClick={() => { setPdfOpen(false); setMainState("form"); }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition"
              >
                📧 Recevoir par mail
              </button>
            </div>

            {/* iframe PDF */}
            <div className="flex-1 relative">
              {iframeLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-950">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-slate-400 text-sm">Chargement du CV...</p>
                  </div>
                </div>
              )}
              <iframe
                src={pdfViewerUrl}
                className="w-full h-full border-none"
                onLoad={() => setIframeLoading(false)}
                title="CV Jaona"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CONTENU PRINCIPAL ──────────────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-md">

        <AnimatePresence mode="wait">

          {/* ─── LANDING ───────────────────────────────────────────────────── */}
          {mainState === "landing" && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {/* Badge événement (réseautage uniquement) */}
              {session?.mode === "reseautage" && (
                <div className="text-center mb-4">
                  <span className="inline-block px-4 py-1.5 bg-blue-500/20 border border-blue-500/40 rounded-full text-blue-300 text-sm font-medium">
                    📍 {session.eventDescription} · {session.eventDate}
                  </span>
                </div>
              )}

              {/* Carte profil */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-7 shadow-2xl">

                {/* Avatar */}
                <motion.div
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.15, type: "spring", bounce: 0.5 }}
                  className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-blue-500/30"
                >
                  <span className="text-white font-black text-2xl">JR</span>
                </motion.div>

                {/* Nom */}
                <div className="text-center mb-1">
                  <h1 className="text-2xl font-bold text-white leading-tight">Jaona A.</h1>
                  <h1 className="text-2xl font-black text-white leading-tight">RABAONARISON</h1>
                </div>

                {/* Sous-titre dynamique selon cvType */}
                <p className="text-blue-300 text-sm font-medium text-center mb-3">
                  {profile.title}
                </p>

                <div className="w-10 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mb-4 rounded-full" />

                {/* Phrase d'accroche dynamique — courte et percutante */}
                <p className="text-slate-300 text-sm leading-relaxed text-center mb-6">
                  {session?.mode === "reseautage" ? (
                    <>
                      Ravi de vous avoir rencontré !<br />
                      <span className="text-white font-medium">{profile.hook}</span>
                    </>
                  ) : (
                    <span className="text-white font-medium">{profile.hook}</span>
                  )}
                </p>

                {/* CTA */}
                <div className="space-y-3">
                  <button
                    onClick={() => { setPdfOpen(true); setIframeLoading(true); }}
                    disabled={!session?.cvUrl}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 active:scale-95 text-white rounded-2xl font-bold text-base transition-all shadow-lg shadow-blue-500/25 disabled:opacity-40 flex items-center justify-center gap-2"
                  >
                    <span>👁️</span> Visionner mon CV
                  </button>
                  <button
                    onClick={() => setMainState("form")}
                    className="w-full py-4 bg-white/8 hover:bg-white/15 active:scale-95 text-white rounded-2xl font-bold text-base transition-all border border-white/20 flex items-center justify-center gap-2"
                  >
                    <span>📧</span> Recevoir par email
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── FORMULAIRE ────────────────────────────────────────────────── */}
          {mainState === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <button
                onClick={() => setMainState("landing")}
                className="text-slate-400 hover:text-white text-sm transition mb-5 flex items-center gap-1"
              >
                ← Retour
              </button>

              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-7 shadow-2xl">
                <div className="text-center mb-6">
                  <div className="text-4xl mb-3">📬</div>
                  <h2 className="text-2xl font-bold text-white">Recevoir mon CV</h2>
                  <p className="text-slate-400 text-sm mt-1">Je vous l&apos;envoie directement</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-slate-300 text-sm font-medium block mb-1.5">
                      Votre prénom et nom *
                    </label>
                    <input
                      type="text" required placeholder="Marie Dupont"
                      value={name} onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/10 text-white border border-white/15 focus:outline-none focus:border-blue-500 transition placeholder-slate-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 text-sm font-medium block mb-1.5">
                      Votre entreprise *
                    </label>
                    <input
                      type="text" required placeholder="Deloitte"
                      value={company} onChange={(e) => setCompany(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/10 text-white border border-white/15 focus:outline-none focus:border-blue-500 transition placeholder-slate-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 text-sm font-medium block mb-1.5">
                      Votre email *
                    </label>
                    <input
                      type="email" required placeholder="m.dupont@deloitte.com"
                      value={email} onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/10 text-white border border-white/15 focus:outline-none focus:border-blue-500 transition placeholder-slate-500"
                    />
                  </div>

                  {formError && (
                    <p className="text-red-400 text-sm bg-red-500/10 rounded-lg p-3 text-center">{formError}</p>
                  )}

                  <button
                    type="submit" disabled={submitting}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 active:scale-95 text-white rounded-2xl font-bold text-base transition-all disabled:opacity-50 shadow-lg shadow-blue-500/25"
                  >
                    {submitting ? "⏳ Envoi..." : "📨 Envoyer"}
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {/* ─── QUESTION LINKEDIN ─────────────────────────────────────────── */}
          {mainState === "linkedin" && (
            <motion.div
              key="linkedin"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6">
                <div>
                  <div className="text-5xl mb-4">✅</div>
                  <p className="text-white font-semibold">
                    C&apos;est envoyé, {firstName} !
                  </p>
                  <p className="text-slate-400 text-sm mt-1">
                    Vérifiez {email}
                  </p>
                </div>

                <div>
                  <p className="text-slate-300 text-base font-medium mb-4">
                    Voulez-vous voir mon profil LinkedIn ?
                  </p>
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        window.open(LINKEDIN_URL, "_blank", "noopener,noreferrer");
                        setMainState("thankyou");
                      }}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white rounded-2xl font-semibold transition flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                      Oui, voir son profil
                    </button>
                    <button
                      onClick={() => setMainState("thankyou")}
                      className="w-full py-3 bg-white/8 hover:bg-white/15 active:scale-95 text-slate-300 rounded-2xl font-semibold transition border border-white/15"
                    >
                      Non, merci
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── REMERCIEMENT ──────────────────────────────────────────────── */}
          {mainState === "thankyou" && (
            <motion.div
              key="thankyou"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 shadow-2xl space-y-4">
                <motion.div
                  animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
                  transition={{ duration: 0.6 }}
                  className="text-6xl"
                >
                  🎉
                </motion.div>
                <h2 className="text-2xl font-bold text-white">Merci {firstName} !</h2>
                <p className="text-slate-400 text-sm">
                  Mon CV est en route vers votre boîte mail.<br />
                  Au plaisir d&apos;échanger avec vous !
                </p>
                <p className="text-slate-600 text-xs mt-2">
                  — Jaona Andriantsimba RABAONARISON
                </p>
                <button
                  onClick={() => window.close()}
                  className="mt-4 px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-medium transition border border-slate-700"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
