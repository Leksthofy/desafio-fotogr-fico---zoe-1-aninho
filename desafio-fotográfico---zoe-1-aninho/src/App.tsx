import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import {
  Camera,
  Sparkles,
  RotateCw,
  Clock,
  Heart,
  User,
  Image as ImageIcon,
  Settings,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Calendar,
  MapPin,
  Upload,
  Trophy,
} from "lucide-react";
import { PhotoSubmission, DESAFIOS_BASE, getChallengePoints } from "./types";
import PhotoWall from "./components/PhotoWall";
import AdminPanel from "./components/AdminPanel";
import RankingBoard from "./components/RankingBoard";

export default function App() {
  // Local storage cache keys
  const STORAGE_NAME_KEY = "zoe_party_photographer_name";
  const STORAGE_URL_KEY = "zoe_party_apps_script_url";

  // App tabs/screens
  const [activeTab, setActiveTab] = useState<"challenge" | "gallery" | "settings">("challenge");

  // Photographer identity
  const [photographerName, setPhotographerName] = useState<string>(() => {
    return localStorage.getItem(STORAGE_NAME_KEY) || "";
  });
  const [nameInput, setNameInput] = useState("");

  // Game/Roulette state
  const [activeChallenge, setActiveChallenge] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(90);
  const [timerActive, setTimerActive] = useState(false);

  // Upload/Capture states
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | undefined>(undefined);

  // Gallery submissions
  const [submissions, setSubmissions] = useState<PhotoSubmission[]>([]);

  // Apps script integration & Admin keys
  const [appsScriptUrl, setAppsScriptUrl] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_URL_KEY);
    if (saved && saved !== "COLE_O_LINK_DO_SEU_APPS_SCRIPT_AQUI") {
      return saved;
    }
    return "https://script.google.com/macros/s/AKfycbyEsRicmW1ZVOOlcSHo8B0l_99on7xcoVDjCLOEWCptWJi8DrFx-clotxmDSQH3ye2x/exec";
  });
  const [isAdmin, setIsAdmin] = useState(true);

  // Drag and drop file status
  const [isDragging, setIsDragging] = useState(false);

  // References
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load submissions from full-stack server
  const fetchSubmissions = async () => {
    try {
      const res = await fetch("/api/photos");
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data);
      }
    } catch (e) {
      console.error("Failed to fetch photo history:", e);
    }
  };

  useEffect(() => {
    fetchSubmissions();
    // Poll for new photos every 20 seconds during the party to keep the Photo Wall real-time!
    const pollInterval = setInterval(fetchSubmissions, 20000);
    return () => clearInterval(pollInterval);
  }, []);

  // Timer logic
  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerActive) {
      setTimerActive(false);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timeLeft, timerActive]);

  // Handle Login/Start Challenge
  const handleStartChallenge = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nameInput.trim();
    if (trimmed) {
      setPhotographerName(trimmed);
      localStorage.setItem(STORAGE_NAME_KEY, trimmed);
    }
  };

  // Spinning the wheel animation (roulette cycle)
  const handleSpinRoulette = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setCapturedPhoto(null);
    setActiveChallenge(null);
    setTimerActive(false);
    setUploadSuccess(false);
    setAiFeedback(undefined);

    let count = 0;
    const maxSpins = 18;
    const intervalTime = 70;

    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * DESAFIOS_BASE.length);
      setActiveChallenge(DESAFIOS_BASE[randomIndex]);
      count++;

      if (count >= maxSpins) {
        clearInterval(interval);
        // Land on final challenge
        const finalIndex = Math.floor(Math.random() * DESAFIOS_BASE.length);
        const finalChallenge = DESAFIOS_BASE[finalIndex];
        setActiveChallenge(finalChallenge);
        setIsSpinning(false);
        setTimeLeft(90);
        setTimerActive(true);
      }
    }, intervalTime);
  };

  // Handle Image Conversion & Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setCapturedPhoto(reader.result as string);
      // Pause timer when photo is taken/uploaded
      setTimerActive(false);
    };
    reader.readAsDataURL(file);
  };

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        processFile(file);
      }
    }
  };

  // Submit photo to full-stack server backend
  const handleSubmitPhoto = async () => {
    if (!capturedPhoto || !activeChallenge || !photographerName) return;

    setIsSubmitting(true);
    try {
      const payload = {
        photographer: photographerName,
        challenge: activeChallenge,
        foto: capturedPhoto,
        appsScriptUrl: appsScriptUrl,
      };

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.status === "sucesso") {
          // Play standard birthday theme confetti!
          confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 },
            colors: ["#F6D2D4", "#E8A2A8", "#756255", "#FFFFFF"],
          });

          setUploadSuccess(true);
          if (data.submission.aiFeedback) {
            setAiFeedback(data.submission.aiFeedback);
          }
          fetchSubmissions(); // reload list
        } else {
          throw new Error(data.message || "Failed to upload photo");
        }
      } else {
        throw new Error("HTTP error " + res.status);
      }
    } catch (e: any) {
      console.error(e);
      alert("Ops! Ocorreu um problema ao enviar a foto. Tente enviar de novo!");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete a submission (Admin feature)
  const handleDeleteSubmission = async (
    id: string,
    fileUrlOrSkip?: string | boolean,
    skipConfirmParam?: boolean
  ) => {
    let fileUrl: string | undefined = undefined;
    let skipConfirm = false;

    if (typeof fileUrlOrSkip === "boolean") {
      skipConfirm = fileUrlOrSkip;
    } else if (typeof fileUrlOrSkip === "string") {
      fileUrl = fileUrlOrSkip;
      if (typeof skipConfirmParam === "boolean") {
        skipConfirm = skipConfirmParam;
      }
    }

    const targetSub = submissions.find(
      (s) => String(s.id) === String(id) || (fileUrl && s.fileUrl === fileUrl)
    );
    const targetUrl = fileUrl || targetSub?.fileUrl;

    if (!skipConfirm) {
      const nameText = targetSub?.photographer ? ` de ${targetSub.photographer}` : "";
      const confirmed = window.confirm(`Tem certeza que deseja apagar a foto${nameText}? Esta ação não pode ser desfeita.`);
      if (!confirmed) return;
    }

    // Optimistic UI removal
    setSubmissions((prev) =>
      prev.filter((s) => String(s.id) !== String(id) && (!targetUrl || s.fileUrl !== targetUrl))
    );

    try {
      const res = await fetch("/api/photos/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, fileUrl: targetUrl }),
      });
      if (res.ok) {
        fetchSubmissions();
      } else {
        const errData = await res.json().catch(() => ({}));
        console.error("Failed to delete submission:", errData);
        fetchSubmissions(); // revert state if needed
      }
    } catch (e) {
      console.error(e);
      fetchSubmissions();
    }
  };

  // Reset/Clear all submissions (Admin feature)
  const handleClearAllSubmissions = async () => {
    setSubmissions([]);
    try {
      const res = await fetch("/api/photos/clear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        fetchSubmissions();
      } else {
        fetchSubmissions();
      }
    } catch (e) {
      console.error(e);
      fetchSubmissions();
    }
  };

  // Save Apps Script URL locally
  const handleSaveAppsScriptUrl = (url: string) => {
    setAppsScriptUrl(url);
    localStorage.setItem(STORAGE_URL_KEY, url);
  };

  // Format timer text (e.g. 01:30)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-[100dvh] p-4 text-brand-brown relative pb-16 w-full overflow-x-hidden">
      {/* Decorative Background Circles to enhance the Frosted Glass depth */}
      <div className="absolute top-20 right-[15%] w-32 h-32 bg-brand-pink/50 rounded-full opacity-40 blur-2xl pointer-events-none z-0"></div>
      <div className="absolute bottom-20 left-[15%] w-40 h-40 bg-brand-darkpink/40 rounded-full opacity-25 blur-3xl pointer-events-none z-0"></div>
      <div className="absolute top-[40%] left-[5%] w-24 h-24 bg-brand-pink/30 rounded-full opacity-35 blur-xl pointer-events-none z-0"></div>

      {/* Decorative Photo Polaroid Frames from the theme */}
      <div className="absolute top-12 left-10 w-48 h-56 bg-white p-3 shadow-xl rotate-[-3deg] transition-all hover:rotate-[-1deg] z-0 pointer-events-none hidden lg:block border border-gray-100 rounded-lg">
        <div className="w-full h-44 bg-[#E8A2A8]/90 flex flex-col items-center justify-center text-white text-xs text-center font-sans font-bold p-3 gap-2">
          <span className="text-2xl">👶</span>
          <span>[ FOTO DA ZOE ]</span>
        </div>
        <p className="text-[10px] text-center font-serif mt-2 font-bold italic text-brand-brown">Zoe 1 Aninho</p>
      </div>
      <div className="absolute bottom-16 right-10 w-52 h-60 bg-white p-3 shadow-xl rotate-[4deg] transition-all hover:rotate-[2deg] z-0 pointer-events-none hidden lg:block border border-gray-100 rounded-lg">
        <div className="w-full h-48 bg-[#756255]/90 flex flex-col items-center justify-center text-white text-xs text-center font-sans font-bold p-3 gap-2">
          <span className="text-2xl">🐑</span>
          <span>[ DETALHE DA FESTA ]</span>
        </div>
        <p className="text-[10px] text-center font-serif mt-2 font-bold italic text-brand-brown">Ovelhinhas Festivas</p>
      </div>

      {/* Decorative Stickers (Sticker 1 & 2) */}
      <div
        className="zoe-sticker sticker-1 animate-float hidden md:block"
        style={{
          position: "absolute",
          width: "120px",
          height: "120px",
          borderRadius: "50%",
          border: "4px solid white",
          boxShadow: "0 4px 15px rgba(117, 98, 85, 0.15)",
          backgroundSize: "cover",
          backgroundPosition: "center 20%",
          zIndex: 1,
          opacity: 0.95,
          top: "8%",
          left: "5%",
          backgroundImage: "url('https://i.ibb.co/3mQcssdc.jpg')",
        }}
      ></div>
      <div
        className="zoe-sticker sticker-2 animate-float-delayed hidden md:block"
        style={{
          position: "absolute",
          width: "120px",
          height: "120px",
          borderRadius: "50%",
          border: "4px solid white",
          boxShadow: "0 4px 15px rgba(117, 98, 85, 0.15)",
          backgroundSize: "cover",
          backgroundPosition: "center 20%",
          zIndex: 1,
          opacity: 0.95,
          bottom: "12%",
          right: "5%",
          backgroundImage: "url('https://i.ibb.co/MxsNQZkj.jpg')",
        }}
      ></div>

      {/* Main Container Wrapper */}
      <div className="w-full max-w-lg flex flex-col gap-6 z-10">
        {/* Birthday Card Header */}
        <header className="text-center mt-6 z-10">
          <h1 className="text-8xl font-serif text-[#756255] mb-2 font-bold tracking-tight">
            Zoe
          </h1>
          <h2 className="text-4xl font-serif italic text-[#E8A2A8] -mt-4">
            1 aninho
          </h2>
          <div className="mt-6 inline-block px-4 py-1.5 bg-[#756255] text-white text-[10px] tracking-[0.3em] font-bold uppercase rounded-full shadow-sm">
            DESAFIO FOTOGRÁFICO
          </div>
        </header>

        {/* Dynamic Screens */}
        <main className="glass-card w-full rounded-3xl shadow-xl p-6 sm:p-8 text-center relative transition-all duration-300">
          <AnimatePresence mode="wait">
            {/* TAB 1: CHALLENGE */}
            {activeTab === "challenge" && (
              <motion.div
                key="challenge-screen"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="flex flex-col items-center w-full"
              >
                {/* LOGIN/IDENTIFICATION SHIELD */}
                {!photographerName ? (
                  <div className="w-full flex flex-col items-center">
                    <form onSubmit={handleStartChallenge} className="w-full flex flex-col gap-5 py-4">
                      <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-full bg-brand-pink/40 flex items-center justify-center text-3xl shadow-inner border border-white mb-3">
                          🐑
                        </div>
                        <h4 className="text-xl font-serif font-bold text-brand-brown">
                          Bem-vindo ao Jogo!
                        </h4>
                        <p className="text-xs text-gray-500 max-w-xs mt-1.5 leading-relaxed">
                          A Zoe preparou várias missões fotográficas super divertidas para o seu aniversário. Digite seu nome para entrar na brincadeira!
                        </p>
                      </div>

                      <div className="flex flex-col gap-3">
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                            <User className="w-4 h-4" />
                          </span>
                          <input
                            type="text"
                            required
                            placeholder="Seu nome (Ex: Tio Thiago)"
                            value={nameInput}
                            onChange={(e) => setNameInput(e.target.value)}
                            className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-brand-pink focus:outline-none focus:ring-2 focus:ring-brand-darkpink text-center font-bold text-brand-brown bg-white/60 text-md placeholder-gray-400 shadow-inner"
                          />
                        </div>
                        <button
                          type="submit"
                          className="w-full bg-brand-brown hover:bg-brand-brown/95 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all active:scale-97 text-md uppercase tracking-wider"
                        >
                          ENTRAR NO DESAFIO 📸
                        </button>
                      </div>
                    </form>

                    <div className="w-full mt-6 pt-6 border-t border-brand-pink/30">
                      <RankingBoard submissions={submissions} showTitle={true} />
                    </div>
                  </div>
                ) : (
                  /* THE CORE GAME CONTAINER */
                  <div className="w-full flex flex-col items-center">
                    {/* Logged user badge */}
                    <div className="flex items-center gap-2 bg-brand-brown/5 text-brand-brown rounded-full px-4 py-1.5 border border-brand-brown/10 mb-4">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                      <p className="text-xs font-bold flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-brand-darkpink" />
                        Fotógrafo(a): <span className="text-brand-darkpink">{photographerName}</span>
                      </p>
                      <button
                        onClick={() => {
                          if (confirm("Quer sair e usar outro nome?")) {
                            setPhotographerName("");
                            localStorage.removeItem(STORAGE_NAME_KEY);
                          }
                        }}
                        className="text-[9px] underline text-gray-400 hover:text-brand-darkpink font-bold ml-2"
                      >
                        Trocar
                      </button>
                    </div>

                    {/* COUNTDOWN TIMER (Visible only when challenge active and no photo preview yet) */}
                    {timerActive && !capturedPhoto && !uploadSuccess && (
                      <div className="mb-6 animate-bounce">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-0.5">
                          Tempo Restante
                        </span>
                        <div
                          className={`text-4xl font-black font-serif transition-colors ${
                            timeLeft <= 15 ? "text-brand-red animate-pulse" : "text-brand-brown"
                          }`}
                        >
                          {formatTime(timeLeft)}
                        </div>
                      </div>
                    )}

                    {/* GAME SUCCESS VIEW */}
                    {uploadSuccess ? (
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-full py-4 flex flex-col items-center"
                      >
                        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-4 shadow-inner border border-white">
                          <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-serif font-bold text-brand-brown">
                          ✨ Maravilha! ✨
                        </h2>
                        <h3 className="text-xl font-bold text-brand-darkpink mt-1">
                          FOTO ENVIADA COM SUCESSO!
                        </h3>
                        <p className="text-sm text-gray-500 mt-2 max-w-xs leading-relaxed font-semibold">
                          Mandou muito bem, <span className="text-brand-brown">{photographerName}</span>! A foto já está brilhando no nosso mural.
                        </p>

                        {/* CUTE ZOE AI REVIEW CARD */}
                        {aiFeedback && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-brand-pink/20 border border-brand-pink/40 rounded-2xl p-4 flex gap-3 mt-6 text-left max-w-sm"
                          >
                            <span className="text-3xl bg-brand-pink p-2 rounded-xl flex items-center justify-center shadow-inner border border-white">
                              🐑
                            </span>
                            <div>
                              <p className="text-[10px] font-bold text-brand-darkpink uppercase tracking-widest">
                                Comentário da Zoe:
                              </p>
                              <p className="text-xs text-brand-brown font-semibold mt-1 italic leading-relaxed">
                                "{aiFeedback}"
                              </p>
                            </div>
                          </motion.div>
                        )}

                        <button
                          onClick={handleSpinRoulette}
                          className="mt-8 bg-brand-darkpink hover:bg-brand-darkpink/95 text-white font-bold text-md py-3.5 px-8 rounded-xl shadow-lg transition-all active:scale-95"
                        >
                          SORTEAR OUTRO DESAFIO 🎲
                        </button>
                      </motion.div>
                    ) : timeLeft === 0 && !capturedPhoto ? (
                      /* TIMER EXPIRED SCREEN */
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="w-full py-6 text-center"
                      >
                        <span className="text-brand-red font-black text-4xl block mb-2 animate-pulse">
                          ⏰ TEMPO ESGOTADO!
                        </span>
                        <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto leading-relaxed font-medium">
                          Ah, que pena! O tempo acabou antes de você registrar o clique. Tente ser mais rápido no próximo!
                        </p>
                        <button
                          onClick={handleSpinRoulette}
                          className="mt-6 bg-brand-brown hover:bg-brand-brown/95 text-white font-bold py-3 px-6 rounded-xl shadow-md transition-all active:scale-95"
                        >
                          TENTAR OUTRA MISSÃO
                        </button>
                      </motion.div>
                    ) : (
                      /* THE CHALLENGE SELECT / CAM / SUBMIT WORKFLOW */
                      <div className="w-full flex flex-col items-center">
                        {/* THE ROLET WHEEL CONTAINER CARD */}
                        <div className="min-h-[120px] flex flex-col items-center justify-center mb-6 border-y border-brand-pink/40 py-5 w-full bg-white/30 rounded-2xl px-5 shadow-inner relative overflow-hidden">
                          {activeChallenge ? (
                            <div className="mb-2 flex items-center gap-1.5">
                              {activeChallenge.includes("DESAFIO RARO") ? (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-[11px] font-black tracking-wide animate-pulse">
                                  ✨ DESAFIO RARO (+25 PONTOS) ✨
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-brand-pink/40 text-brand-darkpink border border-brand-pink/60 rounded-full text-[11px] font-black tracking-wide">
                                  🪙 VALE +10 PONTOS
                                </span>
                              )}
                            </div>
                          ) : null}
                          <h2
                            className={`text-lg font-bold leading-relaxed text-brand-brown transition-all duration-100 ${
                              isSpinning ? "scale-95 text-gray-400 blur-[0.5px]" : ""
                            }`}
                          >
                            {activeChallenge ? (
                              <span className="text-brand-brown font-serif italic text-xl">
                                "{activeChallenge}"
                              </span>
                            ) : (
                              <span className="text-gray-500 font-semibold text-sm">
                                Toque na roleta abaixo para receber uma das 48 missões fotográficas! ✨
                              </span>
                            )}
                          </h2>
                        </div>

                        {/* PHOTO CAPTURE PREVIEW BOX */}
                        {capturedPhoto && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-full mb-6 border border-brand-pink/50 rounded-2xl p-4 bg-white/50 flex flex-col items-center"
                          >
                            <p className="text-xs font-bold text-brand-darkpink uppercase tracking-widest mb-2 flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5" /> Clique Registrado!
                            </p>
                            <div className="aspect-square w-full max-h-[220px] rounded-xl overflow-hidden border border-brand-pink/30 shadow-sm relative">
                              <img
                                src={capturedPhoto}
                                alt="Seu clique"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <p className="text-xs text-gray-500 font-semibold mt-2">
                              Sua foto está pronta para ir para o álbum da Zoe!
                            </p>
                          </motion.div>
                        )}

                        {/* ACTION BUTTON SYSTEM */}
                        <div className="flex flex-col gap-4 w-full">
                          {/* 1. ROULETTE TRIGGER (GIRAR ROLETA) */}
                          {!activeChallenge && (
                            <button
                              onClick={handleSpinRoulette}
                              disabled={isSpinning}
                              className="w-full bg-brand-darkpink hover:bg-brand-darkpink/95 text-white font-bold text-lg py-4 rounded-xl shadow-[0_4px_0_#C9888E] active:shadow-[0_0px_0_#C9888E] active:translate-y-[4px] transition-all relative overflow-hidden group"
                            >
                              <span className="relative z-10 flex items-center justify-center gap-2">
                                <RotateCw className={`w-5 h-5 ${isSpinning ? "animate-spin" : ""}`} />
                                {isSpinning ? "SORTEANDO MISSÃO..." : "GIRAR ROLETA 🎲"}
                              </span>
                            </button>
                          )}

                          {/* 2. CAMERA AND FILE SELECT BUTTONS (Triggered when challenge selected and not uploaded) */}
                          {activeChallenge && !capturedPhoto && (
                            <div
                              onDragOver={handleDragOver}
                              onDragLeave={handleDragLeave}
                              onDrop={handleDrop}
                              className={`w-full flex flex-col gap-3 rounded-2xl transition-all ${
                                isDragging ? "bg-brand-pink/20 border-2 border-dashed border-brand-darkpink p-4" : ""
                              }`}
                            >
                              <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                accept="image/*"
                                capture="environment"
                              />

                              {/* Big intuitive camera action */}
                              <button
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full flex items-center justify-center gap-2 bg-brand-brown hover:bg-brand-brown/95 text-white font-bold text-md py-4 rounded-xl cursor-pointer shadow-[0_4px_0_#54453A] active:shadow-[0_0px_0_#54453A] active:translate-y-[4px] transition-all animate-pulse"
                              >
                                <Camera className="w-5 h-5" />
                                ABRIR CÂMERA 📸
                              </button>

                              {/* File drag-drop descriptor or file upload fallback */}
                              <p className="text-[10px] text-gray-400 font-bold tracking-wide uppercase mt-1">
                                ou arraste uma foto aqui / selecione do rolo
                              </p>
                            </div>
                          )}

                          {/* 3. SEND FOR APPROVAL (Envia para o Servidor) */}
                          {capturedPhoto && (
                            <div className="flex flex-col sm:flex-row gap-3 w-full">
                              <button
                                onClick={() => {
                                  setCapturedPhoto(null);
                                  setTimerActive(true);
                                }}
                                className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold text-sm py-3.5 rounded-xl shadow-md transition-all active:scale-95"
                              >
                                TIRAR OUTRA 📸
                              </button>
                              <button
                                onClick={handleSubmitPhoto}
                                disabled={isSubmitting}
                                className="flex-2 bg-[#8EAEA1] hover:bg-[#7FA093] text-white font-bold text-sm py-3.5 rounded-xl shadow-[0_4px_0_#759387] active:shadow-[0_0px_0_#759387] active:translate-y-[4px] transition-all flex items-center justify-center gap-2"
                              >
                                {isSubmitting ? (
                                  <>
                                    <span className="loader"></span>
                                    <span>ENVIANDO...</span>
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="w-4 h-4" />
                                    <span>ENVIAR PARA A ZOE ✨</span>
                                  </>
                                )}
                              </button>
                            </div>
                          )}

                          {/* Quick reset option */}
                          {activeChallenge && !uploadSuccess && (
                            <button
                              onClick={() => {
                                setTimerActive(false);
                                setActiveChallenge(null);
                                setCapturedPhoto(null);
                              }}
                              className="text-xs text-gray-400 hover:text-brand-darkpink font-bold underline transition-colors mt-2"
                            >
                              Girar roleta novamente
                            </button>
                          )}
                        </div>

                        {/* RANKING BOARD ON MAIN TAB */}
                        <div className="w-full mt-8 pt-6 border-t border-brand-pink/30">
                          <RankingBoard
                            submissions={submissions}
                            currentPhotographer={photographerName}
                            showTitle={true}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB 2: SETTINGS (ADMIN PANEL & PRIVATE GALLERY) */}
            {activeTab === "settings" && (
              <motion.div
                key="settings-screen"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="w-full"
              >
                <AdminPanel
                  appsScriptUrl={appsScriptUrl}
                  onSaveUrl={handleSaveAppsScriptUrl}
                  isAdmin={isAdmin}
                  onToggleAdmin={(status) => {
                    setIsAdmin(status);
                    if (!status) {
                      setActiveTab("challenge");
                    }
                  }}
                  onClearAll={handleClearAllSubmissions}
                  submissionsCount={submissions.length}
                  submissions={submissions}
                  onRefresh={fetchSubmissions}
                  onDelete={handleDeleteSubmission}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Floating elements inside bottom margins */}
      <div className="absolute bottom-16 left-6 animate-float-delayed text-2xl opacity-40 select-none">
        🎈
      </div>
      <div className="absolute bottom-28 right-8 animate-float text-3xl opacity-40 select-none">
        🐑
      </div>

      {/* Footer Branding with secure Configuration entry */}
      <footer className="absolute bottom-4 left-0 right-0 text-center z-20 opacity-75 flex flex-col items-center justify-center gap-1.5">
        <p className="text-xs font-semibold text-[#756255]/70">
          Feito com amor para o 1º aninho da Zoe 💖
        </p>
        <div className="flex items-center justify-center gap-2">
          <p className="text-[9px] text-gray-400 uppercase font-bold tracking-widest font-sans">
            Zoe Party Console • 2026
          </p>
          <span className="text-gray-300">•</span>
          <button
            onClick={() => {
              if (activeTab === "settings") {
                setActiveTab("challenge");
              } else {
                setActiveTab("settings");
              }
            }}
            className="text-[10px] text-brand-darkpink hover:text-brand-brown font-bold flex items-center gap-1 transition-colors cursor-pointer"
            title="Configurações do Organizador"
          >
            <Settings className="w-3 h-3 animate-pulse" />
            Configuração
          </button>
        </div>
      </footer>
    </div>
  );
}
