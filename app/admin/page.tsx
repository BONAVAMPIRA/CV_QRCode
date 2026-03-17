"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

const ADMIN_PASSWORD = "Jaona2026!";

type CVType = "babi" | "ba" | "bi";

interface CVStatus {
  babi: string | null;
  ba:   string | null;
  bi:   string | null;
}

const CV_INFO: Record<CVType, { label: string; desc: string; emoji: string }> = {
  babi: { label: "CV BA · BI",            desc: "Profil hybride polyvalent",  emoji: "⚡" },
  ba:   { label: "CV Business Analyst",   desc: "Centré analyse d'affaires",  emoji: "📊" },
  bi:   { label: "CV Business Intelligence", desc: "Centré données & Power BI", emoji: "📈" },
};

export default function AdminPage() {
  const [password, setPassword]         = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [cvStatus, setCvStatus]         = useState<CVStatus>({ babi: null, ba: null, bi: null });
  const [uploading, setUploading]       = useState<CVType | null>(null);
  const [messages, setMessages]         = useState<Record<CVType, string>>({ babi: "", ba: "", bi: "" });

  const loadStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/upload");
      if (res.ok) setCvStatus(await res.json());
    } catch {}
  }, []);

  useEffect(() => {
    if (authenticated) loadStatus();
  }, [authenticated, loadStatus]);

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
    } else {
      alert("Mot de passe incorrect !");
    }
  };

  const handleUpload = async (type: CVType, file: File) => {
    if (!file) return;
    if (file.type !== "application/pdf") {
      setMessages((m) => ({ ...m, [type]: "❌ Fichier PDF uniquement" }));
      return;
    }

    setUploading(type);
    setMessages((m) => ({ ...m, [type]: "⏳ Upload en cours..." }));

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error((await res.json()).error);

      setMessages((m) => ({ ...m, [type]: "✅ Uploadé avec succès !" }));
      await loadStatus();
    } catch (err) {
      setMessages((m) => ({ ...m, [type]: "❌ Erreur : " + String(err) }));
    } finally {
      setUploading(null);
    }
  };

  // ─── Login ────────────────────────────────────────────────────────────────
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 border border-slate-700 p-8 rounded-2xl w-full max-w-sm space-y-5 shadow-2xl">
          <div className="text-center">
            <div className="text-4xl mb-2">🔐</div>
            <h1 className="text-white text-xl font-bold">Gestion des CVs</h1>
            <p className="text-slate-400 text-sm mt-1">Accès réservé à Jaona</p>
          </div>
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="w-full px-4 py-3 rounded-xl bg-slate-700 text-white border border-slate-600 focus:outline-none focus:border-blue-500 transition"
          />
          <button
            onClick={handleLogin}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition"
          >
            Entrer →
          </button>
        </div>
      </div>
    );
  }

  // ─── Dashboard CVs ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-900 p-5">
      <div className="max-w-lg mx-auto space-y-6">

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center pt-4"
        >
          <h1 className="text-2xl font-bold text-white">⚙️ Mes CVs</h1>
          <p className="text-slate-400 text-sm mt-1">
            Uploade tes 3 versions de CV une seule fois
          </p>
        </motion.div>

        {/* Info */}
        <div className="bg-blue-900/30 border border-blue-700/40 rounded-xl p-4 text-sm text-blue-300">
          💡 Ces CVs sont stockés sur le cloud. Une fois uploadés, tu n&apos;as plus besoin
          de revenir ici sauf pour les mettre à jour.
        </div>

        {/* 3 cartes CV */}
        {(["babi", "ba", "bi"] as CVType[]).map((type, i) => {
          const info      = CV_INFO[type];
          const url       = cvStatus[type];
          const isUploading = uploading === type;
          const msg       = messages[type];

          return (
            <motion.div
              key={type}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-slate-800 border border-slate-700 rounded-2xl p-5"
            >
              {/* Header carte */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{info.emoji}</span>
                <div className="flex-1">
                  <p className="text-white font-bold">{info.label}</p>
                  <p className="text-slate-400 text-sm">{info.desc}</p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  url
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : "bg-slate-700 text-slate-500 border border-slate-600"
                }`}>
                  {url ? "✓ Uploadé" : "Non uploadé"}
                </span>
              </div>

              {/* URL si uploadé */}
              {url && (
                <div className="mb-3">
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-xs underline break-all transition"
                  >
                    Voir le CV en ligne →
                  </a>
                </div>
              )}

              {/* Zone upload */}
              <label
                htmlFor={`upload-${type}`}
                className={`block border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition ${
                  isUploading
                    ? "border-blue-500/50 bg-blue-500/5"
                    : "border-slate-600 hover:border-blue-500/60 hover:bg-slate-700/50"
                }`}
              >
                {isUploading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                    <span className="text-blue-400 text-sm">Upload...</span>
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm">
                    {url ? "📎 Remplacer ce CV" : "📎 Uploader ce CV (PDF)"}
                  </p>
                )}
                <input
                  id={`upload-${type}`}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  disabled={isUploading}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleUpload(type, f);
                    e.target.value = ""; // reset pour re-upload possible
                  }}
                />
              </label>

              {/* Message statut */}
              {msg && (
                <p className="text-sm text-slate-300 mt-2 text-center">{msg}</p>
              )}
            </motion.div>
          );
        })}

        {/* Lien retour */}
        <div className="text-center pb-4">
          <a href="/" className="text-slate-500 hover:text-slate-300 text-sm transition">
            ← Retour à l&apos;accueil
          </a>
        </div>
      </div>
    </div>
  );
}
