import React from "react";
import { Trophy, Medal, Crown, Sparkles, User, Camera, Star, Award, Flame } from "lucide-react";
import { PhotoSubmission, getChallengePoints } from "../types";

interface RankingBoardProps {
  submissions: PhotoSubmission[];
  currentPhotographer?: string;
  showTitle?: boolean;
}

export interface PhotographerStat {
  name: string;
  points: number;
  photosCount: number;
  rareCount: number;
  latestPhotoUrl?: string;
}

export default function RankingBoard({
  submissions,
  currentPhotographer,
  showTitle = true,
}: RankingBoardProps) {
  // Aggregate points by photographer
  const statsMap: { [key: string]: PhotographerStat } = {};

  submissions.forEach((sub) => {
    const rawName = sub.photographer.trim();
    if (!rawName) return;
    const key = rawName.toLowerCase();

    const pts = getChallengePoints(sub.challenge);
    const isRare = sub.challenge.includes("DESAFIO RARO");

    if (!statsMap[key]) {
      statsMap[key] = {
        name: rawName,
        points: 0,
        photosCount: 0,
        rareCount: 0,
        latestPhotoUrl: sub.fileUrl,
      };
    }

    statsMap[key].points += pts;
    statsMap[key].photosCount += 1;
    if (isRare) {
      statsMap[key].rareCount += 1;
    }
    // keep latest photo
    if (sub.fileUrl) {
      statsMap[key].latestPhotoUrl = sub.fileUrl;
    }
  });

  const ranking: PhotographerStat[] = Object.values(statsMap).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return b.photosCount - a.photosCount;
  });

  // Current user stat
  const userKey = currentPhotographer?.trim().toLowerCase();
  const userStat = userKey ? statsMap[userKey] : null;
  const userRankIndex = userKey ? ranking.findIndex((r) => r.name.toLowerCase() === userKey) : -1;
  const userRank = userRankIndex >= 0 ? userRankIndex + 1 : null;

  const top1 = ranking[0];
  const top2 = ranking[1];
  const top3 = ranking[2];
  const rest = ranking.slice(3);

  return (
    <div className="w-full flex flex-col gap-5 text-brand-brown">
      {showTitle && (
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-amber-100 via-amber-200 to-amber-100 text-amber-900 border border-amber-300 rounded-full text-xs font-extrabold uppercase tracking-wider shadow-sm mb-2 animate-pulse">
            <Trophy className="w-4 h-4 text-amber-600" />
            <span>Top Fotógrafos & Premiação</span>
          </div>
          <h3 className="text-2xl font-serif font-bold text-brand-brown">
            🏆 Ranking da Festa da Zoe
          </h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm leading-relaxed">
            Prêmios especiais para os <strong className="text-brand-darkpink font-bold">1º, 2º e 3º lugares</strong>! Complete missões e suba no placar!
          </p>
        </div>
      )}

      {/* Point Rules Badge */}
      <div className="bg-white/60 border border-brand-pink/40 rounded-2xl p-3 flex items-center justify-around text-center text-xs shadow-sm">
        <div className="flex items-center gap-1.5 font-bold text-brand-brown">
          <Camera className="w-4 h-4 text-brand-darkpink" />
          <span>Missão Normal: <strong className="text-brand-darkpink">+10 pts</strong></span>
        </div>
        <div className="h-4 w-px bg-brand-pink/40"></div>
        <div className="flex items-center gap-1.5 font-bold text-amber-800">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Desafio Raro: <strong className="text-amber-600">+25 pts</strong></span>
        </div>
      </div>

      {/* User's position card if identified */}
      {currentPhotographer && (
        <div className="bg-gradient-to-r from-brand-pink/30 to-brand-brown/10 border border-brand-pink/50 p-3.5 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-darkpink text-white flex items-center justify-center font-bold text-base shadow-sm">
              <User className="w-5 h-5" />
            </div>
            <div className="text-left">
              <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500 block">Sua Pontuação</span>
              <p className="text-sm font-bold text-brand-brown">
                {currentPhotographer}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-extrabold text-brand-darkpink block">
              {userStat ? `${userStat.points} PONTOS` : "0 PONTOS"}
            </span>
            <span className="text-[11px] font-semibold text-gray-500">
              {userRank ? `#${userRank}º Lugar (${userStat?.photosCount || 0} fotos)` : "Nenhuma foto ainda"}
            </span>
          </div>
        </div>
      )}

      {ranking.length === 0 ? (
        <div className="bg-white/40 border border-dashed border-brand-pink/50 rounded-2xl p-8 text-center">
          <Trophy className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-gray-500">Nenhuma foto enviada ainda!</p>
          <p className="text-xs text-gray-400 mt-1">Seja o primeiro a enviar uma foto e assumir a liderança no Ranking! 📸✨</p>
        </div>
      ) : (
        <>
          {/* PODIUM DISPLAY (TOP 3) */}
          <div className="grid grid-cols-3 gap-2.5 items-end pt-4 pb-2">
            {/* 2ND PLACE */}
            <div className="flex flex-col items-center">
              {top2 ? (
                <div className="w-full bg-slate-50/90 border-2 border-slate-300 rounded-2xl p-3 flex flex-col items-center shadow-md relative group transition-all hover:scale-[1.02]">
                  <div className="absolute -top-3 px-2 py-0.5 bg-slate-300 text-slate-800 rounded-full text-[10px] font-extrabold flex items-center gap-1 shadow-sm">
                    <Medal className="w-3 h-3 text-slate-600" /> 2º
                  </div>
                  <div className="w-11 h-11 rounded-full bg-slate-200 border border-slate-400 flex items-center justify-center font-bold text-slate-700 mt-2 shadow-inner overflow-hidden">
                    {top2.latestPhotoUrl ? (
                      <img src={top2.latestPhotoUrl} alt={top2.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm font-bold">{top2.name.substring(0, 2).toUpperCase()}</span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-brand-brown mt-2 truncate max-w-full text-center">
                    {top2.name}
                  </p>
                  <span className="text-xs font-extrabold text-slate-700 mt-0.5">
                    {top2.points} pts
                  </span>
                  <span className="text-[10px] font-medium text-gray-500">
                    {top2.photosCount} {top2.photosCount === 1 ? "foto" : "fotos"}
                  </span>
                </div>
              ) : (
                <div className="w-full h-28 bg-white/20 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-300">
                  <Medal className="w-6 h-6 mb-1 opacity-40" />
                  <span className="text-[10px] font-bold">2º Lugar</span>
                </div>
              )}
            </div>

            {/* 1ST PLACE (CENTER, BIGGER) */}
            <div className="flex flex-col items-center -mt-4">
              {top1 ? (
                <div className="w-full bg-amber-50/95 border-2 border-amber-400 rounded-2xl p-3.5 flex flex-col items-center shadow-lg relative group transition-all hover:scale-[1.03]">
                  <div className="absolute -top-4 px-2.5 py-0.5 bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 rounded-full text-[11px] font-extrabold flex items-center gap-1 shadow-md animate-bounce">
                    <Crown className="w-3.5 h-3.5 text-amber-950 fill-amber-950" /> 1º LUGAR
                  </div>
                  <div className="w-14 h-14 rounded-full bg-amber-100 border-2 border-amber-400 flex items-center justify-center font-bold text-amber-900 mt-2 shadow-md overflow-hidden relative">
                    {top1.latestPhotoUrl ? (
                      <img src={top1.latestPhotoUrl} alt={top1.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-base font-bold">{top1.name.substring(0, 2).toUpperCase()}</span>
                    )}
                  </div>
                  <p className="text-sm font-extrabold text-amber-950 mt-2 truncate max-w-full text-center">
                    {top1.name}
                  </p>
                  <span className="text-sm font-black text-amber-700 mt-0.5">
                    {top1.points} PONTOS
                  </span>
                  <span className="text-[11px] font-semibold text-amber-800/80">
                    {top1.photosCount} {top1.photosCount === 1 ? "foto" : "fotos"}
                  </span>
                </div>
              ) : (
                <div className="w-full h-32 bg-white/20 border border-dashed border-amber-200 rounded-2xl flex flex-col items-center justify-center text-amber-300">
                  <Crown className="w-8 h-8 mb-1 opacity-40" />
                  <span className="text-[11px] font-bold">1º Lugar</span>
                </div>
              )}
            </div>

            {/* 3RD PLACE */}
            <div className="flex flex-col items-center">
              {top3 ? (
                <div className="w-full bg-amber-900/5 border-2 border-amber-700/40 rounded-2xl p-3 flex flex-col items-center shadow-md relative group transition-all hover:scale-[1.02]">
                  <div className="absolute -top-3 px-2 py-0.5 bg-amber-800 text-amber-100 rounded-full text-[10px] font-extrabold flex items-center gap-1 shadow-sm">
                    <Medal className="w-3 h-3 text-amber-200" /> 3º
                  </div>
                  <div className="w-11 h-11 rounded-full bg-amber-800/10 border border-amber-700/50 flex items-center justify-center font-bold text-amber-900 mt-2 shadow-inner overflow-hidden">
                    {top3.latestPhotoUrl ? (
                      <img src={top3.latestPhotoUrl} alt={top3.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm font-bold">{top3.name.substring(0, 2).toUpperCase()}</span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-brand-brown mt-2 truncate max-w-full text-center">
                    {top3.name}
                  </p>
                  <span className="text-xs font-extrabold text-amber-900 mt-0.5">
                    {top3.points} pts
                  </span>
                  <span className="text-[10px] font-medium text-gray-500">
                    {top3.photosCount} {top3.photosCount === 1 ? "foto" : "fotos"}
                  </span>
                </div>
              ) : (
                <div className="w-full h-28 bg-white/20 border border-dashed border-amber-700/20 rounded-2xl flex flex-col items-center justify-center text-amber-700/40">
                  <Medal className="w-6 h-6 mb-1 opacity-40" />
                  <span className="text-[10px] font-bold">3º Lugar</span>
                </div>
              )}
            </div>
          </div>

          {/* LIST FOR 4TH POSITION AND BEYOND */}
          {rest.length > 0 && (
            <div className="bg-white/50 border border-brand-pink/30 rounded-2xl p-3 flex flex-col gap-2 shadow-sm">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider text-left px-1">
                Demais Posições
              </span>
              {rest.map((item, index) => {
                const rankNum = index + 4;
                const isUser = userKey === item.name.toLowerCase();
                return (
                  <div
                    key={item.name}
                    className={`flex items-center justify-between p-2.5 rounded-xl transition-all ${
                      isUser
                        ? "bg-brand-pink/40 border border-brand-darkpink/40 font-bold"
                        : "bg-white/60 hover:bg-white/80"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-gray-400 w-5 text-center">
                        #{rankNum}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-brand-pink/30 border border-white flex items-center justify-center text-xs font-bold text-brand-brown overflow-hidden">
                        {item.latestPhotoUrl ? (
                          <img src={item.latestPhotoUrl} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          item.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-bold text-brand-brown">
                          {item.name} {isUser && <span className="text-[10px] text-brand-darkpink">(Você)</span>}
                        </p>
                        <p className="text-[10px] text-gray-500">
                          {item.photosCount} {item.photosCount === 1 ? "foto enviada" : "fotos enviadas"}
                        </p>
                      </div>
                    </div>
                    <div className="bg-amber-100 text-amber-900 px-2.5 py-1 rounded-full text-xs font-extrabold border border-amber-300">
                      {item.points} pts
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
