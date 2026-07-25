import React, { useState, useEffect } from "react";
import { PhotoSubmission } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { Heart, User, Clock, Trash2, X, Search, Sparkles } from "lucide-react";

interface PhotoWallProps {
  submissions: PhotoSubmission[];
  onRefresh: () => void;
  isAdmin: boolean;
  onDelete: (id: string, fileUrl?: string, skipConfirm?: boolean) => void;
}

export default function PhotoWall({ submissions, onRefresh, isAdmin, onDelete }: PhotoWallProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoSubmission | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterChallenge, setFilterChallenge] = useState("");

  const filteredSubmissions = submissions.filter((sub) => {
    const matchesSearch =
      sub.photographer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.challenge.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesChallenge = filterChallenge === "" || sub.challenge === filterChallenge;
    return matchesSearch && matchesChallenge;
  });

  // Get unique challenges for filtering
  const uniqueChallenges = Array.from(new Set(submissions.map((s) => s.challenge)));

  return (
    <div id="photowall-container" className="w-full flex flex-col gap-6">
      {/* Header and Controls */}
      <div className="flex flex-col gap-4">
        <div className="text-center">
          <h2 className="text-3xl font-serif text-brand-brown">Mural de Fotos da Zoe</h2>
          <p className="text-xs text-gray-500 mt-1 font-semibold">Acompanhe todos os cliques especiais da festa! 📸</p>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Buscar por fotógrafo ou missão..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-brand-pink/60 bg-white/50 focus:outline-none focus:ring-2 focus:ring-brand-darkpink font-semibold text-brand-brown placeholder-gray-400"
            />
          </div>

          {uniqueChallenges.length > 0 && (
            <select
              value={filterChallenge}
              onChange={(e) => setFilterChallenge(e.target.value)}
              className="px-3 py-2 text-sm rounded-xl border border-brand-pink/60 bg-white/50 focus:outline-none focus:ring-2 focus:ring-brand-darkpink font-semibold text-brand-brown"
            >
              <option value="">Todas as Missões</option>
              {uniqueChallenges.map((challenge, idx) => (
                <option key={idx} value={challenge}>
                  {challenge.length > 30 ? `${challenge.substring(0, 30)}...` : challenge}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Photo Grid */}
      {filteredSubmissions.length === 0 ? (
        <div className="text-center py-12 bg-white/30 rounded-2xl border border-dashed border-brand-pink/60">
          <p className="text-sm text-gray-500 font-semibold">Nenhuma foto encontrada ainda.</p>
          <p className="text-xs text-gray-400 mt-1">Que tal ser o primeiro a enviar uma foto incrível? ✨</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredSubmissions.map((sub) => {
              const dateStr = new Date(sub.timestamp).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <motion.div
                  key={sub.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  onClick={() => setSelectedPhoto(sub)}
                  className="group relative cursor-pointer overflow-hidden rounded-2xl border border-brand-pink/40 bg-white shadow-sm hover:shadow-md transition-all aspect-square"
                >
                  <img
                    src={sub.fileUrl}
                    alt={sub.challenge}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  
                  {/* Photo Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 text-white">
                    <p className="text-xs font-bold flex items-center gap-1">
                      <User className="w-3 h-3 text-brand-pink" />
                      {sub.photographer}
                    </p>
                    <p className="text-[10px] opacity-90 truncate mt-0.5">{sub.challenge}</p>
                  </div>

                  {/* Corner tag with time */}
                  <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-md px-1.5 py-0.5 rounded-lg text-[9px] text-white font-bold flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    {dateStr}
                  </div>

                  {/* Cute feedback check */}
                  {sub.aiFeedback && (
                    <div className="absolute top-2 left-2 bg-brand-darkpink text-white p-1 rounded-full shadow-md">
                      <Sparkles className="w-3 h-3" />
                    </div>
                  )}

                  {/* Admin trash option */}
                  {isAdmin && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Deseja mesmo apagar a foto de ${sub.photographer}?`)) {
                          onDelete(sub.id, sub.fileUrl, true);
                        }
                      }}
                      title="Excluir foto"
                      className="absolute bottom-2 right-2 z-20 p-2 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md transition-transform active:scale-90 flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Lightbox / Details Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-brand-bg max-w-lg w-full rounded-3xl overflow-hidden shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full z-10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Main Photo */}
              <div className="aspect-video w-full bg-black relative flex items-center justify-center">
                <img
                  src={selectedPhoto.fileUrl}
                  alt={selectedPhoto.challenge}
                  referrerPolicy="no-referrer"
                  className="max-h-[350px] object-contain w-full"
                />
              </div>

              {/* Details Pane */}
              <div className="p-6 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-brand-darkpink">Fotógrafo(a)</h4>
                    <p className="text-xl font-serif text-brand-brown font-bold mt-0.5 flex items-center gap-1.5">
                      <User className="w-5 h-5 text-brand-darkpink" />
                      {selectedPhoto.photographer}
                    </p>
                  </div>
                  <div className="text-right">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">Hora</h4>
                    <p className="text-sm font-semibold text-gray-600 mt-0.5">
                      {new Date(selectedPhoto.timestamp).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>

                <div className="border-t border-brand-pink/30 pt-3">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">Missão Cumprida</h4>
                  <p className="text-md font-semibold text-brand-brown mt-1 italic">
                    "{selectedPhoto.challenge}"
                  </p>
                </div>

                {/* Cute Zoe AI feedback card */}
                {selectedPhoto.aiFeedback && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-brand-pink/20 rounded-2xl p-4 border border-brand-pink/40 flex items-start gap-3 mt-1"
                  >
                    <div className="w-10 h-10 rounded-full bg-brand-pink flex-shrink-0 flex items-center justify-center text-xl shadow-inner border border-white">
                      🐑
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-brand-darkpink uppercase tracking-widest flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> Comentário da Zoe
                      </h5>
                      <p className="text-sm text-brand-brown font-semibold mt-1 leading-relaxed">
                        {selectedPhoto.aiFeedback}
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Admin Delete Action inside Modal */}
                {isAdmin && (
                  <button
                    onClick={() => {
                      if (window.confirm(`Deseja mesmo apagar a foto enviada por ${selectedPhoto.photographer}?`)) {
                        onDelete(selectedPhoto.id, selectedPhoto.fileUrl, true);
                        setSelectedPhoto(null);
                      }
                    }}
                    className="w-full mt-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>EXCLUIR ESTA FOTO (ADMIN)</span>
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
