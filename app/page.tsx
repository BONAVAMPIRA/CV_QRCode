"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">

      <div className="absolute top-[-150px] left-[-100px] w-[400px] h-[400px] bg-blue-600 rounded-full filter blur-3xl opacity-10 animate-blob pointer-events-none" />
      <div className="absolute bottom-[-150px] right-[-100px] w-[400px] h-[400px] bg-purple-600 rounded-full filter blur-3xl opacity-10 animate-blob animation-delay-2000 pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm">

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <span className="text-white font-black text-2xl">JR</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Bonjour Jaona !</h1>
          <p className="text-slate-400 text-sm mt-1">Quelle est la situation ?</p>
        </motion.div>

        <div className="space-y-4">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            onClick={() => router.push("/configure?mode=simple")}
            className="w-full bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700 hover:border-blue-500/50 rounded-2xl p-5 text-left transition-all"
          >
            <div className="flex items-start gap-4">
              <span className="text-3xl">🤝</span>
              <div>
                <p className="text-white font-bold text-lg">Rencontre simple</p>
                <p className="text-slate-400 text-sm mt-0.5 leading-snug">
                  Quelqu&apos;un te demande ton CV au hasard
                </p>
              </div>
            </div>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            onClick={() => router.push("/configure?mode=reseautage")}
            className="w-full bg-gradient-to-br from-blue-600/20 to-purple-600/20 hover:from-blue-600/30 hover:to-purple-600/30 active:scale-95 border border-blue-500/40 hover:border-blue-400/60 rounded-2xl p-5 text-left transition-all"
          >
            <div className="flex items-start gap-4">
              <span className="text-3xl">🏢</span>
              <div>
                <p className="text-white font-bold text-lg">Réseautage</p>
                <p className="text-slate-400 text-sm mt-0.5 leading-snug">
                  Journée carrière, salon, portes ouvertes...
                </p>
              </div>
            </div>
          </motion.button>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-10"
        >
          <button
            onClick={() => router.push("/admin")}
            className="text-slate-600 hover:text-slate-400 text-xs transition"
          >
            ⚙️ Gérer mes CVs
          </button>
        </motion.div>
      </div>
    </div>
  );
}
