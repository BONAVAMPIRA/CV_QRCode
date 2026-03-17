"use client";

import { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";

type CVType = "babi" | "ba" | "bi";

interface CVStatus {
  babi: string | null;
  ba: string | null;
  bi: string | null;
}

const CV_LABELS: Record<CVType, { label: string; desc: string; emoji: string }> = {
  babi: { label: "BA · BI",    desc: "Profil hybride polyvalent", emoji: "⚡" },
  ba:   { label: "BA",         desc: "Business Analyst",          emoji: "📊" },
  bi:   { label: "BI",         desc: "Business Intelligence",     emoji: "📈" },
};

function ConfigureForm() {
  const router      = useRouter();
  const params      = useSearchParams();
  const mode        = (params.get("mode") || "simple") as "simple" | "reseautage";

  const [cvType, setCvType]                     = useState<CVType>("babi");
  const [eventDescription, setEventDescription] = useState("");
  const [eventDate, setEventDate]               = useState(
    new Date().toLocaleDateString("fr-CA", { year: "numeric", month: "long", day: "numeric" })
  );
  const [cvStatus, setCvStatus]   = useState<CVStatus | null>(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");

  // Charger le statut des CVs
  useEffect(() => {
    fetch("/api/upload")
      .then((r) => r.ok ? r.json() : null)
      .then(setCvStatus)
      .catch(() => {});
  }, []);

  const selectedCvAvailable = cvStatus?.[cvType] != null;

  const handleSubmit = async () => {
    if (!selectedCvAvailable) {
      setError("Ce CV n'est pas encore uploadé. Va dans ⚙️ Gérer mes CVs d'abord.");
      return;
    }
    if (mode === "reseautage" && !eventDescription.trim()) {
      setError("Entre la description de l'événement.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          cvType,
          eventDescription: mode === "reseautage" ? eventDescription.trim() : "une rencontre professionnelle",
          eventDate: mode === "reseautage" ? eventDate.trim() : new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
        }),
      });

      if (!res.ok) throw new Error("Erreur de sauvegarde");
      router.push("/qr");
    } catch (err) {
      setError("Erreur : " + String(err));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-5 relative overflow-hidden">

      <div className="absolute top-[-100px] right-[-100px] w-[300px] h-[300px] bg-blue-600 rounded-full filter blur-3xl opacity-10 pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-7"
        >
          <button
            onClick={() => router.back()}
            className="text-slate-500 hover:text-slate-300 text-sm transition mb-4 flex items-center gap-1"
          >
            ← Retour
          </button>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{mode === "reseautage" ? "🏢" : "🤝"}</span>
            <div>
              <h1 className="text-white font-bold text-xl">
                {mode === "reseautage" ? "Réseautage" : "Rencontre simple"}
              </h1>
              <p className="text-slate-400 text-sm">Configure ta session</p>
            </div>
          </div>
        </motion.div>

        <div className="space-y-5">

          {/* Choix du CV */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <p className="text-slate-300 text-sm font-medium mb-3">Quel CV envoyer ?</p>
            <div className="grid grid-cols-3 gap-2">
              {(["babi", "ba", "bi"] as CVType[]).map((type) => {
                const info      = CV_LABELS[type];
                const available = cvStatus?.[type] != null;
                const selected  = cvType === type;
                return (
                  <button
                    key={type}
                    onClick={() => { setCvType(type); setError(""); }}
                    className={`rounded-xl p-3 text-center transition-all border ${
                      selected
                        ? "bg-blue-600 border-blue-400 shadow-lg shadow-blue-500/25"
                        : "bg-slate-800 border-slate-700 hover:border-slate-500"
                    }`}
                  >
                    <div className="text-xl mb-1">{info.emoji}</div>
                    <div className={`font-bold text-sm ${selected ? "text-white" : "text-slate-300"}`}>
                      {info.label}
                    </div>
                    <div className={`text-xs mt-0.5 ${selected ? "text-blue-200" : "text-slate-500"}`}>
                      {info.desc}
                    </div>
                    {!available && (
                      <div className="text-xs text-red-400 mt-1">non uploadé</div>
                    )}
                    {available && (
                      <div className="text-xs text-green-400 mt-1">✓ prêt</div>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Champs réseautage uniquement */}
          {mode === "reseautage" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-4"
            >
              <div>
                <label className="text-slate-300 text-sm font-medium block mb-2">
                  Description de l&apos;événement
                </label>
                <input
                  type="text"
                  placeholder="Ex : la Journée Carrière de l'UQAM"
                  value={eventDescription}
                  onChange={(e) => { setEventDescription(e.target.value); setError(""); }}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 text-white border border-slate-700 focus:outline-none focus:border-blue-500 transition placeholder-slate-600"
                />
                <p className="text-slate-600 text-xs mt-1.5 ml-1">
                  💡 Tel qu&apos;il apparaîtra dans le mail : « lors de [votre texte] »
                </p>
              </div>
              <div>
                <label className="text-slate-300 text-sm font-medium block mb-2">
                  Date
                </label>
                <input
                  type="text"
                  placeholder="Ex : 17 Mars 2026"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 text-white border border-slate-700 focus:outline-none focus:border-blue-500 transition placeholder-slate-600"
                />
              </div>
            </motion.div>
          )}

          {/* Erreur */}
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 text-sm bg-red-500/10 rounded-xl p-3 text-center"
            >
              {error}
            </motion.p>
          )}

          {/* Bouton */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 active:scale-95 text-white rounded-2xl font-bold text-lg transition-all disabled:opacity-50 shadow-lg shadow-blue-500/25"
          >
            {loading ? "⏳ En cours..." : "Afficher le QR Code →"}
          </motion.button>
        </div>
      </div>
    </div>
  );
}

export default function ConfigurePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="text-white">Chargement...</div></div>}>
      <ConfigureForm />
    </Suspense>
  );
}
