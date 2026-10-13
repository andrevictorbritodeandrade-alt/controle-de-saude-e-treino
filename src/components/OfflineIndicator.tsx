import React, { useState, useEffect } from 'react';
import { CloudOff } from 'lucide-react';
import { isQuotaExhausted } from '../services/firestoreService';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [quotaExhausted, setQuotaExhausted] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const checkQuota = () => {
      setQuotaExhausted(isQuotaExhausted());
    };
    checkQuota();
    const interval = setInterval(checkQuota, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  if (isOnline && !quotaExhausted) return null;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-[#1c1c1c]/95 backdrop-blur-md border border-amber-500/40 text-amber-300 px-4 py-2 rounded-full shadow-2xl text-xs font-black uppercase tracking-wider animate-in fade-in slide-in-from-bottom-2 duration-300 pointer-events-none">
      <CloudOff className="w-4 h-4 text-amber-400 animate-pulse" />
      <span>{isOnline ? 'Armazenamento Local Ativo (100% Salvo)' : 'Modo Offline • Dados salvos localmente'}</span>
    </div>
  );
};
