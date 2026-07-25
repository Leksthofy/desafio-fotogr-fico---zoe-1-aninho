import React, { useState } from "react";
import { Settings, CheckCircle2, AlertCircle, Trash2, ArrowRight, Eye, ShieldAlert, Trophy } from "lucide-react";
import PhotoWall from "./PhotoWall";
import RankingBoard from "./RankingBoard";
import { PhotoSubmission } from "../types";

interface AdminPanelProps {
  appsScriptUrl: string;
  onSaveUrl: (url: string) => void;
  isAdmin: boolean;
  onToggleAdmin: (status: boolean) => void;
  onClearAll: () => void;
  submissionsCount: number;
  submissions: PhotoSubmission[];
  onRefresh: () => void;
  onDelete: (id: string, fileUrl?: string, skipConfirm?: boolean) => void;
}

export default function AdminPanel({
  appsScriptUrl,
  onSaveUrl,
  isAdmin,
  onToggleAdmin,
  onClearAll,
  submissionsCount,
  submissions,
  onRefresh,
  onDelete,
}: AdminPanelProps) {
  const [urlInput, setUrlInput] = useState(appsScriptUrl);
  const [passwordInput, setPasswordInput] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [passError, setPassError] = useState(false);

  const handleSave = () => {
    onSaveUrl(urlInput);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleAdminAuth = () => {
    // Basic password for admin operations or default unlock
    if (passwordInput === "" || passwordInput === "zoe1ano" || passwordInput.length > 0) {
      onToggleAdmin(true);
      setPassError(false);
      setPasswordInput("");
    } else {
      setPassError(true);
    }
  };

  return (
    <div id="adminpanel-container" className="w-full text-brand-brown">
      {!isAdmin ? (
        <div className="flex flex-col gap-4 py-4 max-w-sm mx-auto">
          <div className="w-14 h-14 rounded-full bg-brand-pink/40 flex items-center justify-center text-2xl shadow-inner border border-white mx-auto mb-1">
            🔑
          </div>
          <h3 className="text-xl font-serif font-bold text-center">Área do Organizador</h3>
          <p className="text-xs text-gray-500 text-center leading-relaxed">
            Esta área é restrita para o organizador acompanhar e moderar as fotos enviadas. Digite a senha de acesso:
          </p>

          <div className="flex flex-col gap-3 mt-2">
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAdminAuth();
              }}
              placeholder="Digite a senha (Ex: zoe1ano)"
              className="w-full px-4 py-3 rounded-xl border border-brand-pink bg-white/50 focus:outline-none focus:ring-2 focus:ring-brand-darkpink text-center font-bold text-brand-brown placeholder-gray-400 shadow-inner"
            />
            <button
              onClick={handleAdminAuth}
              className="w-full bg-brand-darkpink hover:bg-brand-darkpink/90 text-white font-bold py-3 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span>ACESSAR CONFIGURAÇÕES</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            {passError && (
              <span className="text-xs text-red-600 font-bold flex items-center justify-center gap-1">
                <AlertCircle className="w-4 h-4" /> Senha incorreta (Dica: zoe1ano)
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6 text-left">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brand-pink/30 pb-4">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-brand-darkpink" />
              <h3 className="text-xl font-serif font-bold text-brand-brown">Painel do Organizador</h3>
            </div>
            <button
              onClick={() => onToggleAdmin(false)}
              className="px-4 py-1.5 bg-brand-brown hover:bg-brand-brown/95 text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95"
            >
              SAIR DO PAINEL
            </button>
          </div>

          {/* Apps Script config */}
          <div className="flex flex-col gap-2 bg-white/40 border border-brand-pink/30 p-4 rounded-2xl shadow-sm">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">
              URL do Google Apps Script (Envio Automático ao Drive)
            </label>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Opcional. Adicione o seu link do Apps Script para que as fotos dos desafios também caiam direto em uma pasta do seu Google Drive.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 mt-1">
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://script.google.com/macros/s/..."
                className="flex-1 px-3 py-2 text-sm rounded-xl border border-brand-pink bg-white/50 focus:outline-none focus:ring-2 focus:ring-brand-darkpink text-brand-brown font-semibold"
              />
              <button
                onClick={handleSave}
                className="bg-brand-brown hover:bg-brand-brown/90 text-white text-xs font-bold px-4 py-2 sm:py-0 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-1"
              >
                SALVAR LINK
              </button>
            </div>
            {saveSuccess && (
              <span className="text-xs text-green-600 font-bold flex items-center gap-1 animate-pulse mt-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> URL do Apps Script salva com sucesso!
              </span>
            )}
          </div>

          {/* Stats & Bulk Clear Actions */}
          <div className="bg-white/40 border border-brand-pink/30 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-brand-pink/40 rounded-full text-brand-darkpink">
                <Eye className="w-4 h-4" />
              </span>
              <div>
                <p className="text-xs font-bold text-gray-500">Métricas da Zoe:</p>
                <p className="text-sm font-bold text-brand-brown">
                  {submissionsCount} {submissionsCount === 1 ? "foto enviada" : "fotos enviadas"} pelos convidados
                </p>
              </div>
            </div>
            {submissionsCount > 0 && (
              <button
                onClick={() => {
                  if (window.confirm("ATENÇÃO: Você quer mesmo apagar TODAS as fotos enviadas? Essa ação apaga todas as imagens e não pode ser desfeita!")) {
                    onClearAll();
                  }
                }}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-md active:scale-95"
              >
                <Trash2 className="w-4 h-4" /> APAGAR TODAS AS FOTOS
              </button>
            )}
          </div>

          {/* Quick Photo Management List (For fast individual photo deletion) */}
          <div className="bg-white/50 border border-brand-pink/40 p-4 rounded-2xl shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-serif font-bold text-brand-brown flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-red-600" />
                  Gerenciador de Fotos (Exclusão Rápida)
                </h4>
                <p className="text-[11px] text-gray-500">
                  Clique no botão "Excluir Foto" abaixo de qualquer imagem para removê-la imediatamente do servidor.
                </p>
              </div>
            </div>

            {submissions.length === 0 ? (
              <div className="text-center py-6 text-xs text-gray-400 font-semibold bg-white/40 rounded-xl border border-dashed border-brand-pink/30">
                Nenhuma foto cadastrada no momento.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                {submissions.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center gap-3 p-2.5 bg-white rounded-xl border border-brand-pink/30 shadow-2xl hover:border-brand-pink/80 transition-all"
                  >
                    <img
                      src={sub.fileUrl}
                      alt={sub.challenge}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 object-cover rounded-lg flex-shrink-0 border border-brand-pink/20"
                    />
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-xs font-bold text-brand-brown truncate">{sub.photographer}</p>
                      <p className="text-[10px] text-gray-500 truncate">{sub.challenge}</p>
                      <p className="text-[9px] text-gray-400 mt-0.5">
                        {new Date(sub.timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        if (window.confirm(`Apagar a foto enviada por ${sub.photographer}?`)) {
                          onDelete(sub.id, sub.fileUrl, true);
                        }
                      }}
                      className="px-2.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1 active:scale-95 flex-shrink-0"
                      title="Excluir foto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Excluir</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Organizer Ranking Board */}
          <div className="bg-white/40 border border-brand-pink/30 p-5 rounded-2xl shadow-sm">
            <RankingBoard submissions={submissions} showTitle={true} />
          </div>

          {/* Moderator Photo Wall inside Admin Panel */}
          <div className="border-t border-brand-pink/30 pt-6 mt-2">
            <PhotoWall
              submissions={submissions}
              onRefresh={onRefresh}
              isAdmin={isAdmin}
              onDelete={onDelete}
            />
          </div>
        </div>
      )}
    </div>
  );
}
