import React, { useState } from 'react';
import { Smartphone, Download, Share, PlusSquare, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/40 active:scale-95 transition-all"
        title="Instalar App no Celular"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Instalar App</span>
      </button>
    );
  }

  // iOS Safari flow or generic fallback
  return (
    <>
      <button
        onClick={() => setShowIOSGuide(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#1c1c1c] hover:bg-[#252525] text-red-500 border border-red-900/30 active:scale-95 transition-all"
        title="Instalar na Tela Inicial"
      >
        <Smartphone className="w-3.5 h-3.5" />
        <span>Instalar App</span>
      </button>

      {showIOSGuide && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-[2rem] bg-[#121212] border border-[#262626] p-6 shadow-2xl text-white">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-red-600/20 text-red-500 flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-black uppercase tracking-tight">Instalar no Celular</h3>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-8 h-8 rounded-full bg-[#1c1c1c] flex items-center justify-center text-gray-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs text-gray-300">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#1c1c1c] border border-[#222]">
                <img src="/pwa-192x192.png" alt="Ícone App" className="w-12 h-12 rounded-xl object-cover border border-white/10" />
                <div>
                  <p className="font-black text-white text-sm">Saúde+Treino</p>
                  <p className="text-[10px] text-gray-500 uppercase">Ícone oficial na tela inicial</p>
                </div>
              </div>

              {isIOS ? (
                <div className="space-y-2 pt-2">
                  <p className="text-[11px] font-bold text-gray-400">Para fixar no iPhone / iPad:</p>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-red-600/20 text-red-500 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">1</span>
                    <p className="text-xs">No Safari, toque no botão <strong className="text-white">Compartilhar</strong> <Share className="inline w-3.5 h-3.5 text-blue-400" />.</p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-red-600/20 text-red-500 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">2</span>
                    <p className="text-xs">Role para baixo e toque em <strong className="text-white">Adicionar à Tela de Início</strong> <PlusSquare className="inline w-3.5 h-3.5 text-emerald-400" />.</p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-red-600/20 text-red-500 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">3</span>
                    <p className="text-xs">Confirme em <strong className="text-white">Adicionar</strong>. O app aparecerá com o ícone direto no seu celular!</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 pt-2">
                  <p className="text-[11px] font-bold text-gray-400">No Android (Chrome):</p>
                  <p className="text-xs leading-relaxed">
                    Toque nos <strong>três pontinhos ⋮</strong> no canto superior do navegador e selecione <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-6 w-full rounded-2xl bg-red-600 py-3 text-xs font-black uppercase tracking-wider text-white hover:bg-red-700 transition"
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </>
  );
};
