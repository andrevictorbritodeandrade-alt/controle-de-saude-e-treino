import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Pill, Droplet, RefreshCcw, CheckCircle2, Timer, Beaker, AlertCircle, List, ChevronDown, ChevronUp, ShoppingCart, CalendarDays, TrendingUp, Sparkles, Plus, Syringe } from 'lucide-react';
import { User } from '../types';
import { savePoviztraData, subscribeToPoviztraData } from '../services/firestoreService';

const DEFAULT_HISTORY = [
  { id: 104, name: 'Dose Caneta Poviztra (37 cliques [0,5mg] - Semana 3 - Hoje)', timestamp: '13/10/2026 08:00:00', units: 37 },
  { id: 103, name: 'Dose Caneta Poviztra (37 cliques [0,5mg] - Semana 3 - Ontem)', timestamp: '12/10/2026 08:00:00', units: 37 },
  { id: 102, name: 'Dose Caneta Poviztra (37 cliques [0,5mg] - Semana 2)', timestamp: '05/10/2026 08:00:00', units: 37 },
  { id: 101, name: 'Dose Caneta Poviztra (37 cliques [0,5mg] - Semana 1)', timestamp: '28/09/2026 08:00:00', units: 37 },
  { id: 20, name: 'Dose Caneta (6 clicks - Semana 4)', timestamp: '02/06/2026 08:00:00', units: 6 },
  { id: 19, name: 'Dose Caneta (6 clicks - Semana 3)', timestamp: '26/05/2026 08:00:00', units: 6 },
  { id: 18, name: 'Dose Caneta (6 clicks - Semana 3)', timestamp: '25/05/2026 08:00:00', units: 6 },
  { id: 17, name: 'Dose Caneta (6 clicks - Semana 3)', timestamp: '23/05/2026 08:00:00', units: 6 },
  { id: 13, name: 'CONSULTA: Reavaliação Caneta (Dr. Noé)', timestamp: '29/05/2026 10:00:00', units: 0 }
];

const DEFAULT_OZEMPIC = {
  name: 'Caneta Poviztra',
  totalUnits: 300,
  remainingUnits: 152, // 300 - (4 * 37) = 152 cliques restantes
  startWeight: 103.6,
  purchaseDate: '2026-09-28',
  startDate: '2026-09-28',
  doseClicks: 37, // 37 cliques por aplicação
  weeklyDoseClicks: 74, // Aumentou a dose: 2x 37 = 74 cliques nesta semana 3
  doseEquivalent: '0,5 mg x 2 (1,0 mg na semana 3)',
  frequency: 'Semanal (2 aplicações de 37 cliques)',
};

const DEFAULT_VITAMINS = {
  b12: { name: 'Vitamina B12', lastDose: null, nextDose: null, cyclePhase: 'active' },
  vitD: { name: 'Vitamina D', lastDose: null, nextDose: null, cyclePhase: 'active' },
  iron: { name: 'Ferro', lastDose: null, nextDose: null },
  vonau: { name: 'Vonau Flash (SOS)', lastDose: null, nextDose: null, description: '8mg - Para náuseas/vômitos' }
};

export const PoviztraControl: React.FC<{ currentUser: User }> = ({ currentUser }) => {
  // --- ESTADOS ---
  const [globalHistory, setGlobalHistory] = useState<{ id: number; name: string; timestamp: string; units?: number }[]>(() => {
    const saved = localStorage.getItem(`history_${currentUser.id}`);
    return saved ? JSON.parse(saved) : [...DEFAULT_HISTORY];
  });
  const [expandedSection, setExpandedSection] = useState('summary');
  const [showPrescription, setShowPrescription] = useState(true);

  // Poviztra: 300 clicks totais
  const [ozempic, setOzempic] = useState(() => {
    const saved = localStorage.getItem(`ozempic_${currentUser.id}`);
    return saved ? JSON.parse(saved) : { ...DEFAULT_OZEMPIC };
  });

  // Vitaminas
  const [vitamins, setVitamins] = useState<Record<string, any>>(() => {
    const saved = localStorage.getItem(`vitamins_${currentUser.id}`);
    return saved ? JSON.parse(saved) : { ...DEFAULT_VITAMINS };
  });

  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Load from Cloud
  useEffect(() => {
    if (currentUser) {
      const unsubscribe = subscribeToPoviztraData(currentUser.id, (cloudData) => {
        let currentHistory = cloudData?.globalHistory ? [...cloudData.globalHistory] : [];
        let currentOzempic = cloudData?.ozempic ? { ...cloudData.ozempic } : null;
        let currentVitamins = cloudData?.vitamins ? { ...cloudData.vitamins } : null;

        // If cloud data is empty, fall back to default or localStorage
        if (currentHistory.length === 0) {
          const savedHistory = localStorage.getItem(`history_${currentUser.id}`);
          currentHistory = savedHistory ? JSON.parse(savedHistory) : [...DEFAULT_HISTORY];
        }
        if (!currentOzempic) {
          const savedOz = localStorage.getItem(`ozempic_${currentUser.id}`);
          currentOzempic = savedOz ? JSON.parse(savedOz) : { ...DEFAULT_OZEMPIC };
        }
        if (!currentVitamins) {
          const savedVits = localStorage.getItem(`vitamins_${currentUser.id}`);
          currentVitamins = savedVits ? JSON.parse(savedVits) : { ...DEFAULT_VITAMINS };
        }

        // Garantir que as 4 doses do ciclo atual (Semana 1 a 3) estejam registradas
        const requiredDoses = [
          { check: '28/09/2026', name: 'Dose Caneta Poviztra (37 cliques [0,5mg] - Semana 1)', timestamp: '28/09/2026 08:00:00', units: 37 },
          { check: '05/10/2026', name: 'Dose Caneta Poviztra (37 cliques [0,5mg] - Semana 2)', timestamp: '05/10/2026 08:00:00', units: 37 },
          { check: '12/10/2026', name: 'Dose Caneta Poviztra (37 cliques [0,5mg] - Semana 3 - Ontem)', timestamp: '12/10/2026 08:00:00', units: 37 },
          { check: '13/10/2026', name: 'Dose Caneta Poviztra (37 cliques [0,5mg] - Semana 3 - Hoje)', timestamp: '13/10/2026 08:00:00', units: 37 },
        ];

        let historyUpdated = false;
        requiredDoses.forEach((rd, idx) => {
          const exists = currentHistory.some(item => item.timestamp.includes(rd.check));
          if (!exists) {
            currentHistory.unshift({
              id: Date.now() + idx + 1000,
              name: rd.name,
              timestamp: rd.timestamp,
              units: rd.units
            });
            historyUpdated = true;
          }
        });

        // Garantir que a carga da caneta reflita os 152 cliques restantes de 300
        currentOzempic.totalUnits = 300;
        currentOzempic.remainingUnits = 152;
        currentOzempic.startDate = '2026-09-28';
        currentOzempic.doseClicks = 37;
        currentOzempic.weeklyDoseClicks = 74;

        if (historyUpdated) {
          currentHistory.sort((a, b) => {
            const partsA = a.timestamp.split(' ')[0].split('/');
            const dateA = new Date(parseInt(partsA[2]), parseInt(partsA[1]) - 1, parseInt(partsA[0]));
            const partsB = b.timestamp.split(' ')[0].split('/');
            const dateB = new Date(parseInt(partsB[2]), parseInt(partsB[1]) - 1, parseInt(partsB[0]));
            return dateB.getTime() - dateA.getTime();
          });
        }

        setGlobalHistory(currentHistory);
        setOzempic(currentOzempic);
        setVitamins(currentVitamins);
        lastSavedRef.current = JSON.stringify({
          globalHistory: currentHistory,
          ozempic: currentOzempic,
          vitamins: currentVitamins
        });
        setIsDataLoaded(true);
      });
      return () => unsubscribe();
    }
  }, [currentUser]);

  const lastSavedRef = useRef<string>('');

  // Save to Cloud and LocalStorage with check to prevent quota exhaustion
  useEffect(() => {
    if (currentUser && isDataLoaded) {
      const currentData = { globalHistory, ozempic, vitamins };
      const currentStr = JSON.stringify(currentData);

      localStorage.setItem(`history_${currentUser.id}`, JSON.stringify(globalHistory));
      localStorage.setItem(`ozempic_${currentUser.id}`, JSON.stringify(ozempic));
      localStorage.setItem(`vitamins_${currentUser.id}`, JSON.stringify(vitamins));

      if (lastSavedRef.current !== '' && currentStr !== lastSavedRef.current) {
        lastSavedRef.current = currentStr;
        const handler = setTimeout(() => {
          savePoviztraData(currentUser.id, currentData).catch(console.warn);
        }, 4000);
        return () => clearTimeout(handler);
      }
    }
  }, [globalHistory, ozempic, vitamins, currentUser, isDataLoaded]);

  // EXAMES
  const examData = useMemo(() => ({
    date: '06/01/2026',
    nextExamDate: '2026-04-06',
    groups: [
      {
        title: 'Hemograma Completo',
        items: [
          { label: 'Hemácias', value: '4.60', unit: 'mi/mm3', ref: '4.50-6.50', status: 'normal' },
          { label: 'Hemoglobina', value: '14.3', unit: 'g/dL', ref: '13.5-18.0', status: 'normal' },
          { label: 'Hematócrito', value: '42.4', unit: '%', ref: '40.0-54.0', status: 'normal' },
          { label: 'Plaquetas', value: '353000', unit: '/mm3', ref: '150k-450k', status: 'normal' }
        ]
      },
      {
        title: 'Glicemia e Insulina',
        items: [
          { label: 'Glicose', value: '100', unit: 'mg/dL', ref: '70-99', status: 'warning' },
          { label: 'HbA1c', value: '4.6', unit: '%', ref: '< 5.7', status: 'normal' },
          { label: 'Insulina', value: '5.1', unit: 'µUI/mL', ref: '2.6-24.9', status: 'normal' }
        ]
      },
      {
        title: 'Vitaminas e Minerais',
        items: [
          { label: 'Vitamina D', value: '29.1', unit: 'ng/mL', ref: '30-60', status: 'warning' },
          { label: 'Vitamina B12', value: '525', unit: 'pg/mL', ref: '197-771', status: 'normal' },
          { label: 'Ferritina', value: '79.9', unit: 'ng/mL', ref: '30-400', status: 'normal' },
          { label: 'Zinco', value: '94', unit: 'µg/dL', ref: '70-120', status: 'normal' }
        ]
      },
      {
        title: 'Rins e Fígado',
        items: [
          { label: 'Creatinina', value: '1.27', unit: 'mg/dL', ref: '0.6-1.3', status: 'warning' },
          { label: 'Ureia', value: '39.0', unit: 'mg/dL', ref: '15-50', status: 'normal' },
          { label: 'TGO', value: '29', unit: 'U/L', ref: 'Até 35', status: 'normal' }
        ]
      }
    ]
  }), []);

  // --- ESTATÍSTICAS E CÁLCULOS DO CICLO ATUAL ---
  const stats = useMemo(() => {
    const totalCap = ozempic.totalUnits || 300;
    const remaining = ozempic.remainingUnits ?? 152;
    const used = totalCap - remaining; // 148
    const singleDose = ozempic.doseClicks || 37;
    const currentWeek = 3; // Usuário confirmou explicitamente que está na semana 3
    const weeklyClicks = ozempic.weeklyDoseClicks || 74; // 2x 37 = 74 cliques nesta semana

    const dosesRemaining = Math.max(0, Math.floor(remaining / singleDose)); // 4 doses de 37
    const weeksRemaining = weeklyClicks > 0 ? (remaining / weeklyClicks).toFixed(1) : '4';

    // Próxima aplicação prevista
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 6);

    return {
      totalCap,
      remaining,
      used,
      singleDose,
      currentWeek,
      weeklyClicks,
      dosesRemaining,
      weeksRemaining,
      nextDoseFormatted: nextDate.toLocaleDateString('pt-BR'),
      percentRemaining: Math.round((remaining / totalCap) * 100),
    };
  }, [ozempic]);

  const daysToExam = useMemo(() => {
    const diff = new Date(examData.nextExamDate).getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [examData.nextExamDate]);

  // --- AÇÕES ---
  const addToHistory = (name: string, units = 37) => {
    setGlobalHistory(prev => [
      { id: Date.now(), name, timestamp: new Date().toLocaleString('pt-BR'), units },
      ...prev
    ].slice(0, 60));
  };

  const takeCaneta = (clicks = 37) => {
    if (ozempic.remainingUnits < clicks) return;
    setOzempic(prev => ({
      ...prev,
      remainingUnits: Math.max(0, prev.remainingUnits - clicks)
    }));
    addToHistory(`Dose Caneta Poviztra (${clicks} cliques [0,5mg] - Semana ${stats.currentWeek})`, clicks);
  };

  const takeVitamin = (key: string) => {
    const now = new Date();
    setVitamins(prev => {
      const v = prev[key];
      let next = new Date(now);
      let phase = v.cyclePhase;
      if (key === 'iron') next.setDate(next.getDate() + 90);
      else {
        if (phase === 'active') { next.setDate(next.getDate() + 15); phase = 'resting'; }
        else { next.setDate(next.getDate() + 60); phase = 'active'; }
      }
      return { ...prev, [key]: { ...v, lastDose: now, nextDose: next, cyclePhase: phase } };
    });
    addToHistory(`Tomou ${vitamins[key].name}`, 0);
  };

  return (
    <div className="space-y-6 pb-32 pt-2 animate-in fade-in duration-300">
      
      {/* CABEÇALHO DO MÓDULO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#121212] p-6 rounded-[2rem] border border-[#1f1f1f]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-red-900/20 rounded-2xl flex items-center justify-center text-red-500 border border-red-900/30">
            <Syringe className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight italic font-montserrat">
                Caneta Poviztra
              </h2>
              <span className="bg-red-900/30 text-red-400 border border-red-900/50 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                Semana 3 Ativa
              </span>
            </div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-0.5">
              Dose aumentada • 37 unidades ontem + 37 unidades hoje (74 cliques na semana)
            </p>
          </div>
        </div>

        <button 
          onClick={() => {
            if (window.confirm('Deseja redefinir a caneta com 300 unidades e 152 restantes para a Semana 3?')) {
              setOzempic({
                ...DEFAULT_OZEMPIC,
                remainingUnits: 152,
                totalUnits: 300,
              });
            }
          }}
          className="self-start sm:self-center flex items-center gap-2 px-4 py-2 bg-[#1c1c1c] hover:bg-[#252525] border border-[#2a2a2a] text-gray-300 rounded-xl text-xs font-black uppercase tracking-wider transition-colors"
          title="Sincronizar Caneta Poviztra"
        >
          <RefreshCcw className="w-3.5 h-3.5 text-red-500" />
          <span>Ajustar Refil</span>
        </button>
      </div>

      {/* GRID DE CARDS 2 EM 2 COM O MESMO TAMANHO E NÚMEROS GRANDES */}
      <div className="grid grid-cols-2 gap-3.5 sm:gap-5 lg:gap-6 items-stretch">
        
        {/* CARD 1: SEMANA ATUAL & DOSE DA SEMANA */}
        <div className="bg-[#121212] rounded-[2rem] p-5 sm:p-6 border border-[#1f1f1f] shadow-lg flex flex-col justify-between h-full hover:border-[#2a2a2a] transition-all">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-red-500 bg-red-900/20 px-2.5 py-1 rounded-lg border border-red-900/30">
                Semana 3 • Dose Dupla
              </span>
              <Droplet className="w-5 h-5 text-red-500" />
            </div>
            <h3 className="text-xs sm:text-sm font-black text-gray-400 uppercase tracking-wider">
              Dose Desta Semana
            </h3>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl md:text-5xl font-black text-white font-montserrat tracking-tight">
                74
              </span>
              <span className="text-xs sm:text-sm font-bold text-gray-400 uppercase">
                cliques (unid.)
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#1f1f1f] flex flex-col gap-1">
            <div className="flex justify-between items-center text-[10px] sm:text-xs font-bold text-gray-300">
              <span className="text-gray-400">Ontem:</span>
              <span className="text-red-400 font-black">37 cliques</span>
            </div>
            <div className="flex justify-between items-center text-[10px] sm:text-xs font-bold text-gray-300">
              <span className="text-gray-400">Hoje:</span>
              <span className="text-emerald-400 font-black">37 cliques</span>
            </div>
          </div>
        </div>

        {/* CARD 2: CARGA RESTANTE DA CANETA */}
        <div className="bg-[#121212] rounded-[2rem] p-5 sm:p-6 border border-[#1f1f1f] shadow-lg flex flex-col justify-between h-full hover:border-[#2a2a2a] transition-all">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-emerald-400 bg-emerald-900/20 px-2.5 py-1 rounded-lg border border-emerald-900/30">
                {stats.percentRemaining}% Disponível
              </span>
              <Timer className="w-5 h-5 text-emerald-500" />
            </div>
            <h3 className="text-xs sm:text-sm font-black text-gray-400 uppercase tracking-wider">
              Carga Restante
            </h3>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl md:text-5xl font-black text-white font-montserrat tracking-tight">
                {stats.remaining}
              </span>
              <span className="text-xs sm:text-sm font-bold text-gray-400 uppercase">
                / {stats.totalCap} u
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#1f1f1f]">
            <div className="w-full h-3 bg-[#1c1c1c] rounded-full overflow-hidden border border-[#2a2a2a] p-0.5 mb-2">
              <div 
                className="h-full bg-gradient-to-r from-red-600 to-rose-500 rounded-full transition-all duration-700"
                style={{ width: `${stats.percentRemaining}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] sm:text-xs font-bold text-gray-400">
              <span>Utilizado: <b className="text-white">{stats.used} u</b></span>
              <span>Total: <b className="text-white">{stats.totalCap} u</b></span>
            </div>
          </div>
        </div>

        {/* CARD 3: DOSES RESTANTES & PROJEÇÃO */}
        <div className="bg-[#121212] rounded-[2rem] p-5 sm:p-6 border border-[#1f1f1f] shadow-lg flex flex-col justify-between h-full hover:border-[#2a2a2a] transition-all">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-blue-400 bg-blue-900/20 px-2.5 py-1 rounded-lg border border-blue-900/30">
                Autonomia
              </span>
              <CalendarDays className="w-5 h-5 text-blue-500" />
            </div>
            <h3 className="text-xs sm:text-sm font-black text-gray-400 uppercase tracking-wider">
              Doses Restantes
            </h3>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl md:text-5xl font-black text-white font-montserrat tracking-tight">
                {stats.dosesRemaining}
              </span>
              <span className="text-xs sm:text-sm font-bold text-gray-400 uppercase">
                doses (de 37u)
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#1f1f1f] text-[10px] sm:text-xs font-bold text-gray-300 flex justify-between items-center">
            <span className="text-gray-400">Duração estimada:</span>
            <span className="text-white font-black">~{stats.weeksRemaining} sem. restantes</span>
          </div>
        </div>

        {/* CARD 4: AÇÃO RÁPIDA / REGISTRAR DOSE */}
        <div className="bg-[#121212] rounded-[2rem] p-5 sm:p-6 border border-[#1f1f1f] shadow-lg flex flex-col justify-between h-full hover:border-[#2a2a2a] transition-all">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-red-400 bg-red-900/20 px-2.5 py-1 rounded-lg border border-red-900/30">
                {globalHistory.filter(h => h.units && h.units > 0).length} Feitas
              </span>
              <CheckCircle2 className="w-5 h-5 text-red-500" />
            </div>
            <h3 className="text-xs sm:text-sm font-black text-gray-400 uppercase tracking-wider">
              Aplicação de Dose
            </h3>
            <p className="text-xs text-gray-300 mt-1 font-medium">
              Cada dose equivale a 37 cliques (0,5 mg)
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-[#1f1f1f]">
            <button 
              onClick={() => takeCaneta(37)}
              disabled={ozempic.remainingUnits < 37}
              className="w-full py-3 sm:py-3.5 bg-red-600 hover:bg-red-700 active:scale-95 disabled:opacity-50 text-white rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-red-900/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar +37 cliques</span>
            </button>
          </div>
        </div>

      </div>

      {/* SEÇÃO SEGUINTE: PRESCRIÇÃO E ORIENTAÇÕES (TAMBÉM 2 EM 2 COM O MESMO TAMANHO) */}
      <div className="grid grid-cols-2 gap-3.5 sm:gap-5 lg:gap-6 items-stretch">
        
        {/* CARD 5: PRESCRIÇÃO E HISTÓRICO DAS 4 DOSES */}
        <div className="bg-[#121212] rounded-[2rem] p-5 sm:p-6 border border-[#1f1f1f] shadow-lg flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl bg-red-900/20 flex items-center justify-center text-red-500 border border-red-900/30">
                <Beaker className="w-4 h-4" />
              </div>
              <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider font-montserrat">
                Aplicações Registradas
              </h3>
            </div>

            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {globalHistory.slice(0, 5).map((item) => (
                <div key={item.id} className="p-3 bg-[#181818] rounded-xl border border-[#222] flex justify-between items-center text-xs">
                  <div>
                    <p className="font-black text-white">{item.name}</p>
                    <p className="text-[10px] text-gray-400 font-bold mt-0.5">{item.timestamp}</p>
                  </div>
                  <span className="text-xs font-black text-red-400 bg-red-950/40 px-2 py-1 rounded-lg border border-red-900/30">
                    37 u
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#1f1f1f] flex justify-between items-center text-[10px] font-bold text-gray-400">
            <span>Ciclo iniciado em 28/09/2026</span>
            <span className="text-white font-black">4 aplicações feitas (148 u)</span>
          </div>
        </div>

        {/* CARD 6: SUPORTE MÉDICO E ORIENTAÇÕES */}
        <div className="bg-[#121212] rounded-[2rem] p-5 sm:p-6 border border-[#1f1f1f] shadow-lg flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl bg-emerald-900/20 flex items-center justify-center text-emerald-500 border border-emerald-900/30">
                <AlertCircle className="w-4 h-4" />
              </div>
              <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider font-montserrat">
                Orientações & Suporte
              </h3>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-[#181818] rounded-xl border border-[#222]">
                <p className="font-black text-red-400 uppercase text-[10px]">Vonau Flash 8mg (SOS)</p>
                <p className="text-gray-300 text-[11px] mt-0.5">Tomar 1 cp até 8/8h se houver náuseas ou refluxo.</p>
              </div>
              <div className="p-2.5 bg-[#181818] rounded-xl border border-[#222]">
                <p className="font-black text-emerald-400 uppercase text-[10px]">Hidratação Obrigatória</p>
                <p className="text-gray-300 text-[11px] mt-0.5">Mínimo de 3 litros de água ao longo do dia.</p>
              </div>
              <div className="p-2.5 bg-[#181818] rounded-xl border border-[#222]">
                <p className="font-black text-blue-400 uppercase text-[10px]">Protocolo Alimentar</p>
                <p className="text-gray-300 text-[11px] mt-0.5">Priorizar proteínas magras e musculação contínua.</p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#1f1f1f] flex justify-between items-center text-[10px] font-bold text-gray-400">
            <span>Peso inicial: <b className="text-white">103,6 kg</b></span>
            <span className="text-red-400 font-black">Dr. Noé Reavaliação</span>
          </div>
        </div>

      </div>

      {/* VITAMINAS & SUPLEMENTAÇÃO: 2 EM 2 COM MESMO TAMANHO */}
      <div className="space-y-3">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">
          Suplementação & Vitaminas (Controle de Doses)
        </h3>
        
        <div className="grid grid-cols-2 gap-3.5 sm:gap-5 lg:gap-6 items-stretch">
          {Object.keys(vitamins).map(key => {
            const v = vitamins[key];
            return (
              <div 
                key={key} 
                className="bg-[#121212] rounded-[2rem] p-5 sm:p-6 border border-[#1f1f1f] shadow-lg flex flex-col justify-between h-full hover:border-[#2a2a2a] transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-red-900/20 text-red-500 flex items-center justify-center border border-red-900/30">
                      {key === 'iron' ? <Droplet size={18} /> : <Pill size={18} />}
                    </div>
                    <span className="text-[10px] font-black uppercase text-gray-400 bg-[#1c1c1c] px-2 py-0.5 rounded-md">
                      {key === 'iron' ? 'Trimestral' : v.cyclePhase === 'active' ? 'Ciclo 15d' : 'Pausa 60d'}
                    </span>
                  </div>
                  
                  <h4 className="text-sm sm:text-base font-black text-white uppercase tracking-tight font-montserrat">
                    {v.name}
                  </h4>
                  <p className="text-[10px] text-gray-400 mt-1 font-medium">
                    {v.description || 'Suplementação prescrita'}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#1f1f1f] flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-black text-gray-500 uppercase block">Próxima</span>
                    <span className="text-xs sm:text-sm font-black text-white">
                      {v.nextDose ? new Date(v.nextDose).toLocaleDateString('pt-BR') : 'Disponível'}
                    </span>
                  </div>
                  <button 
                    onClick={() => takeVitamin(key)}
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black uppercase tracking-wider active:scale-95 transition-all flex items-center gap-1.5 shadow-md shadow-red-900/30"
                  >
                    <CheckCircle2 size={14} />
                    <span>Tomar</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
