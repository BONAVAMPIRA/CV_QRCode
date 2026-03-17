"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";

interface Session {
  mode: "simple" | "reseautage";
  cvType: string;
  eventName: string;
  eventDate: string;
}

export default function QRPage() {
  const router         = useRouter();
  const canvasRef      = useRef<HTMLCanvasElement>(null);
  const [session, setSession]   = useState<Session | null>(null);
  const [qrReady, setQrReady]   = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");

  useEffect(() => {
    // Charger la session
    fetch("/api/config")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        setSession(data);
      })
      .catch(() => {});

    // Générer le QR Code pointant vers /scan
    const scanUrl = `${window.location.origin}/scan`;
    QRCode.toDataURL(scanUrl, {
      width: 300,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
      errorCorrectionLevel: "H",
    }).then((url) => {
      setQrDataUrl(url);
      setQrReady(true);
    });

    // Tenter de maximiser la luminosité (API limitée sur mobile, best-effort)
    if ("screen" in window && "brightness" in (window.screen as unknown as Record<string, unknown>)) {
      try { (window.screen as unknown as { brightness: number }).brightness = 1; } catch {}
    }
  }, []);

  const cvLabels: Record<string, string> = {
    babi: "CV BA · BI",
    ba:   "CV Business Analyst",
    bi:   "CV Business Intelligence",
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative">

      {/* Bouton retour discret */}
      <button
        onClick={() => router.back()}
        className="absolute top-5 left-5 text-gray-600 hover:text-gray-400 text-sm transition z-10"
      >
        ← Retour
      </button>

      <div className="flex flex-col items-center gap-6 w-full max-w-sm">

        {/* QR Code */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: qrReady ? 1 : 0, scale: qrReady ? 1 : 0.85 }}
          transition={{ type: "spring", stiffness: 150 }}
          className="bg-white rounded-3xl p-5 shadow-2xl shadow-white/10"
        >
          {qrDataUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qrDataUrl} alt="QR Code" className="w-64 h-64 block" />
          )}
        </motion.div>

        {/* Infos session */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: qrReady ? 1 : 0, y: qrReady ? 0 : 15 }}
          transition={{ delay: 0.2 }}
          className="text-center space-y-1"
        >
          {session?.mode === "reseautage" ? (
            <>
              <p className="text-white font-semibold text-lg">{session.eventName}</p>
              <p className="text-gray-400 text-sm">{session.eventDate}</p>
            </>
          ) : (
            <p className="text-gray-400 text-sm">Rencontre simple</p>
          )}
          {session && (
            <p className="text-gray-600 text-xs">{cvLabels[session.cvType] || session.cvType}</p>
          )}
        </motion.div>

        {/* Instruction */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: qrReady ? 1 : 0 }}
          transition={{ delay: 0.4 }}
          className="text-gray-600 text-xs text-center"
        >
          Montre ce QR Code à scanner
        </motion.p>
      </div>
    </div>
  );
}
