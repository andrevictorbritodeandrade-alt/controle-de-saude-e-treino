import React, { useState, useEffect } from 'react';
import { 
  Pill, 
  Calendar, 
  Plus, 
  Trash2, 
  TrendingUp, 
  DollarSign, 
  Check, 
  AlertTriangle, 
  CheckCircle, 
  ShoppingBag, 
  ArrowRight,
  Info
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  AreaChart, 
  Area 
} from 'recharts';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  dailyDosage: number;
  currentStock: number;
  frequency: string;
}

interface Purchase {
  id: string;
  date: string; // YYYY-MM-DD
  medName: string;
  quantity: number;
  pricePaid: number;
}

export const MedicationTracker: React.FC<{ currentUser?: any }> = () => {
  // 1. Core Medications State (Pre-seeded with user's specific values)
  const [medications, setMedications] = useState<Medication[]>(() => {
    const saved = localStorage.getItem('user_medications_v3');
    if (saved) return JSON.parse(saved);
    return [
      { id: '1', name: 'Bup (Bupropiona) 150mg XL', dosage: '150mg', dailyDosage: 2, currentStock: 30, frequency: '2x ao dia (Manhã e Noite)' },
      { id: '2', name: 'Topiramato', dosage: '100mg', dailyDosage: 2, currentStock: 8, frequency: '2x ao dia (Manhã e Noite)' },
      { id: '3', name: 'Sertralina', dosage: '50mg', dailyDosage: 2, currentStock: 38, frequency: '2x ao dia (Manhã e Noite)' }
    ];
  });

  // 2. Purchases History State (Pre-seeded with realistic values for linear evolution chart)
  const [purchases, setPurchases] = useState<Purchase[]>(() => {
    const saved = localStorage.getItem('user_medication_purchases_v3');
    if (saved) return JSON.parse(saved);
    return [
      // Jan/2026
      { id: 'p1', date: '2026-01-10', medName: 'Bup (Bupropiona) 150mg XL', quantity: 60, pricePaid: 130.00 },
      { id: 'p2', date: '2026-01-10', medName: 'Topiramato', quantity: 60, pricePaid: 85.00 },
      { id: 'p3', date: '2026-01-10', medName: 'Sertralina', quantity: 60, pricePaid: 65.00 },
      
      // Feb/2026
      { id: 'p5', date: '2026-02-12', medName: 'Bup (Bupropiona) 150mg XL', quantity: 60, pricePaid: 135.00 },
      { id: 'p6', date: '2026-02-12', medName: 'Topiramato', quantity: 60, pricePaid: 88.00 },
      { id: 'p7', date: '2026-02-12', medName: 'Sertralina', quantity: 60, pricePaid: 68.00 },

      // Mar/2026
      { id: 'p9', date: '2026-03-15', medName: 'Bup (Bupropiona) 150mg XL', quantity: 60, pricePaid: 132.00 },
      { id: 'p10', date: '2026-03-15', medName: 'Topiramato', quantity: 60, pricePaid: 84.00 },
      { id: 'p11', date: '2026-03-15', medName: 'Sertralina', quantity: 60, pricePaid: 62.00 },

      // Apr/2026
      { id: 'p13', date: '2026-04-18', medName: 'Bup (Bupropiona) 150mg XL', quantity: 60, pricePaid: 140.00 },
      { id: 'p14', date: '2026-04-18', medName: 'Topiramato', quantity: 60, pricePaid: 90.00 },
      { id: 'p15', date: '2026-04-18', medName: 'Sertralina', quantity: 60, pricePaid: 70.00 },

      // May/2026
      { id: 'p17', date: '2026-05-20', medName: 'Bup (Bupropiona) 150mg XL', quantity: 60, pricePaid: 145.00 },
      { id: 'p18', date: '2026-05-20', medName: 'Topiramato', quantity: 60, pricePaid: 92.00 },
      { id: 'p19', date: '2026-05-20', medName: 'Sertralina', quantity: 60, pricePaid: 72.00 },

      // Jun/2026
      { id: 'p21', date: '2026-06-22', medName: 'Bup (Bupropiona) 150mg XL', quantity: 60, pricePaid: 142.00 },
      { id: 'p22', date: '2026-06-22', medName: 'Topiramato', quantity: 60, pricePaid: 89.00 },
      { id: 'p23', date: '2026-06-22', medName: 'Sertralina', quantity: 60, pricePaid: 69.00 },
    ];
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('user_medications_v3', JSON.stringify(medications));
  }, [medications]);

  useEffect(() => {
    localStorage.setItem('user_medication_purchases_v3', JSON.stringify(purchases));
  }, [purchases]);

  // Form states for register purchase
  const [selectedMedId, setSelectedMedId] = useState<string>(medications[0]?.id || '');
  const [purchaseQty, setPurchaseQty] = useState<number>(30);
  const [purchasePrice, setPurchasePrice] = useState<number>(100);
  const [purchaseDate, setPurchaseDate] = useState<string>('2026-07-07');
  const [showPurchaseForm, setShowPurchaseForm] = useState<boolean>(false);

  // States for adding a new medicine to tracker
  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('');
  const [newMedDailyDosage, setNewMedDailyDosage] = useState(1);
  const [newMedStock, setNewMedStock] = useState(30);
  const [newMedFrequency, setNewMedFrequency] = useState('');
  const [showNewMedForm, setShowNewMedForm] = useState(false);

  // Take today's doses (decrements all active stocks by daily dosage)
  const [takenToday, setTakenToday] = useState<boolean>(false);
  const handleTakeDoses = () => {
    if (takenToday) return;
    setMedications(prev => 
      prev.map(med => ({
        ...med,
        currentStock: Math.max(0, med.currentStock - med.dailyDosage)
      }))
    );
    setTakenToday(true);
    setTimeout(() => setTakenToday(false), 5000); // Reset visual feedback after 5s
  };

  // Register purchase handler
  const handleRegisterPurchase = (e: React.FormEvent) => {
    e.preventDefault();
    const med = medications.find(m => m.id === selectedMedId);
    if (!med) return;

    const newPurchase: Purchase = {
      id: 'p_' + Date.now(),
      date: purchaseDate,
      medName: med.name,
      quantity: Number(purchaseQty),
      pricePaid: Number(purchasePrice)
    };

    // Update purchases history
    setPurchases(prev => [newPurchase, ...prev]);

    // Update medication stock
    setMedications(prev => 
      prev.map(m => m.id === selectedMedId ? { ...m, currentStock: m.currentStock + Number(purchaseQty) } : m)
    );

    // Reset fields & show success
    setShowPurchaseForm(false);
  };

  // Add custom medication handler
  const handleAddMedication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName) return;

    const newMed: Medication = {
      id: 'm_' + Date.now(),
      name: newMedName,
      dosage: newMedDosage || '-',
      dailyDosage: Number(newMedDailyDosage),
      currentStock: Number(newMedStock),
      frequency: newMedFrequency || `${newMedDailyDosage}x ao dia`
    };

    setMedications(prev => [...prev, newMed]);
    setNewMedName('');
    setNewMedDosage('');
    setNewMedDailyDosage(1);
    setNewMedStock(30);
    setNewMedFrequency('');
    setShowNewMedForm(false);
  };

  const handleDeleteMedication = (id: string) => {
    if (confirm('Deseja realmente remover esta medicação do acompanhamento?')) {
      setMedications(prev => prev.filter(m => m.id !== id));
    }
  };

  const handleDeletePurchase = (id: string) => {
    if (confirm('Deseja remover este registro de compra?')) {
      setPurchases(prev => prev.filter(p => p.id !== id));
    }
  };

  // Helper to format date
  const formatDateBR = (dateStr: string) => {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  // Calculations for remaining days and purchase dates
  const calculateDepletionInfo = (med: Medication) => {
    if (med.dailyDosage <= 0) return { daysLeft: Infinity, dateStr: 'N/A', status: 'Estável' as const };
    
    const daysLeft = Math.floor(med.currentStock / med.dailyDosage);
    
    // Calculate depletion date starting from 2026-07-07 (or today)
    const baseDate = new Date('2026-07-07');
    baseDate.setDate(baseDate.getDate() + daysLeft);
    
    const day = String(baseDate.getDate()).padStart(2, '0');
    const month = String(baseDate.getMonth() + 1).padStart(2, '0');
    const year = baseDate.getFullYear();
    const dateStr = `${day}/${month}/${year}`;

    let status: 'Crítico' | 'Alerta' | 'Estável' = 'Estável';
    if (daysLeft <= 4) status = 'Crítico';
    else if (daysLeft <= 10) status = 'Alerta';

    return { daysLeft, dateStr, status };
  };

  // Prepare chart data for linear cost evolution by month
  const getChartData = () => {
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const monthlyTotals: { [key: string]: number } = {};

    // Initialize months of the year
    for (let i = 0; i < 7; i++) { // Jan to Jul
      monthlyTotals[`2026-0${i + 1}`] = 0;
    }

    // Accumulate purchase prices
    purchases.forEach(p => {
      const yearMonth = p.date.substring(0, 7); // "YYYY-MM"
      if (monthlyTotals[yearMonth] !== undefined) {
        monthlyTotals[yearMonth] += p.pricePaid;
      } else if (p.date.startsWith('2026')) {
        monthlyTotals[yearMonth] = p.pricePaid;
      }
    });

    return Object.keys(monthlyTotals)
      .sort()
      .map(key => {
        const monthNum = parseInt(key.substring(5, 7), 10);
        return {
          month: monthNames[monthNum - 1],
          'Gasto Total': monthlyTotals[key],
          rawValue: monthlyTotals[key]
        };
      });
  };

  const chartData = getChartData();
  const totalSpent2026 = purchases
    .filter(p => p.date.startsWith('2026'))
    .reduce((sum, p) => sum + p.pricePaid, 0);

  return (
    <div id="medication-tracker-container" className="bg-[#121212] border border-[#1f1f1f] rounded-[2rem] p-6 shadow-xl space-y-6 animate-in fade-in duration-300">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1f1f1f] pb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-red-950/40 border border-red-500/20 rounded-2xl flex items-center justify-center text-red-500 shadow-inner">
            <Pill className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white uppercase tracking-tight font-montserrat">Estoque e Gastos de Medicamentos</h3>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Acompanhamento e Previsão de Recompra</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleTakeDoses}
            disabled={takenToday}
            className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
              takenToday 
              ? 'bg-emerald-900/20 text-emerald-400 border border-emerald-900/40' 
              : 'bg-red-600 hover:bg-red-700 active:scale-95 text-white shadow-lg shadow-red-950/50'
            }`}
          >
            {takenToday ? <CheckCircle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
            {takenToday ? 'Doses do Dia Tomadas' : 'Marcar Doses de Hoje'}
          </button>

          <button
            onClick={() => {
              setShowPurchaseForm(true);
              setShowNewMedForm(false);
            }}
            className="p-2.5 bg-[#1c1c1c] hover:bg-[#252525] text-white border border-[#2a2a2a] rounded-xl active:scale-95 transition-all flex items-center gap-2 text-xs font-black uppercase tracking-widest"
          >
            <Plus className="w-4 h-4 text-red-500" />
            <span>Registrar Compra</span>
          </button>
        </div>
      </div>

      {/* 3. Alerts Section for depletion warnings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {medications.map(med => {
          const info = calculateDepletionInfo(med);
          if (info.status === 'Estável') return null;

          return (
            <div 
              key={med.id} 
              className={`p-4 rounded-2xl border flex items-start gap-3 animate-pulse ${
                info.status === 'Crítico' 
                ? 'bg-red-950/20 border-red-900/30 text-red-400' 
                : 'bg-amber-950/25 border-amber-900/30 text-amber-400'
              }`}
            >
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider mb-0.5">{med.name}</h4>
                <p className="text-[11px] font-semibold leading-relaxed">
                  Estoque crítico! Dura apenas mais <span className="font-black text-white">{info.daysLeft}</span> dias. Comprar até <span className="font-black underline text-white">{info.dateStr}</span>.
                </p>
              </div>
            </div>
          );
        }).filter(Boolean)}
      </div>

      {/* Forms Section */}
      {showPurchaseForm && (
        <form onSubmit={handleRegisterPurchase} className="bg-[#181818] border border-red-500/20 p-5 rounded-2xl space-y-4 animate-in slide-in-from-top-4 duration-200">
          <div className="flex items-center justify-between border-b border-[#222] pb-3 mb-2">
            <h4 className="text-xs font-black uppercase tracking-widest text-red-500 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" /> Registrar Nova Compra
            </h4>
            <button 
              type="button" 
              onClick={() => setShowPurchaseForm(false)}
              className="text-gray-500 hover:text-white text-xs font-black"
            >
              FECHAR
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Medicamento</label>
              <select
                value={selectedMedId}
                onChange={e => setSelectedMedId(e.target.value)}
                className="w-full bg-[#121212] border border-[#2a2a2a] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 font-bold"
              >
                {medications.map(m => (
                  <option key={m.id} value={m.id}>{m.name} {m.dosage !== '-' ? `(${m.dosage})` : ''}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Quantidade Comprada</label>
              <input
                type="number"
                value={purchaseQty}
                onChange={e => setPurchaseQty(Number(e.target.value))}
                min="1"
                className="w-full bg-[#121212] border border-[#2a2a2a] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 font-mono font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Preço Pago (R$)</label>
              <input
                type="number"
                step="0.01"
                value={purchasePrice}
                onChange={e => setPurchasePrice(Number(e.target.value))}
                min="0"
                className="w-full bg-[#121212] border border-[#2a2a2a] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 font-mono font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Data da Compra</label>
              <input
                type="date"
                value={purchaseDate}
                onChange={e => setPurchaseDate(e.target.value)}
                className="w-full bg-[#121212] border border-[#2a2a2a] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 font-bold"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-red-950"
            >
              Salvar Compra e Atualizar Estoque
            </button>
          </div>
        </form>
      )}

      {showNewMedForm && (
        <form onSubmit={handleAddMedication} className="bg-[#181818] border border-[#2a2a2a] p-5 rounded-2xl space-y-4 animate-in slide-in-from-top-4 duration-200">
          <div className="flex items-center justify-between border-b border-[#222] pb-3 mb-2">
            <h4 className="text-xs font-black uppercase tracking-widest text-white">Cadastrar Novo Medicamento</h4>
            <button 
              type="button" 
              onClick={() => setShowNewMedForm(false)}
              className="text-gray-500 hover:text-white text-xs font-black"
            >
              FECHAR
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-1 col-span-1 sm:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Nome do Remédio</label>
              <input
                type="text"
                value={newMedName}
                onChange={e => setNewMedName(e.target.value)}
                placeholder="Ex: Bupropiona"
                className="w-full bg-[#121212] border border-[#2a2a2a] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 font-bold"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Dosagem</label>
              <input
                type="text"
                value={newMedDosage}
                onChange={e => setNewMedDosage(e.target.value)}
                placeholder="Ex: 150mg"
                className="w-full bg-[#121212] border border-[#2a2a2a] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Dose Diária (Comprimidos)</label>
              <input
                type="number"
                value={newMedDailyDosage}
                onChange={e => setNewMedDailyDosage(Number(e.target.value))}
                min="0"
                className="w-full bg-[#121212] border border-[#2a2a2a] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 font-bold font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Estoque Atual</label>
              <input
                type="number"
                value={newMedStock}
                onChange={e => setNewMedStock(Number(e.target.value))}
                min="0"
                className="w-full bg-[#121212] border border-[#2a2a2a] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 font-bold font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Instruções de Uso / Frequência</label>
              <input
                type="text"
                value={newMedFrequency}
                onChange={e => setNewMedFrequency(e.target.value)}
                placeholder="Ex: 2x ao dia"
                className="w-full bg-[#121212] border border-[#2a2a2a] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 font-bold"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black uppercase tracking-widest"
            >
              Adicionar ao Estoque
            </button>
          </div>
        </form>
      )}

      {/* Medications and stocks grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Medications List (8 columns) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex justify-between items-center mb-1">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-red-500" /> Detalhamento do Estoque Atual
            </h4>
            <button
              onClick={() => {
                setShowNewMedForm(true);
                setShowPurchaseForm(false);
              }}
              className="text-[10px] font-black text-red-500 hover:underline uppercase"
            >
              + Adicionar Remédio
            </button>
          </div>

          <div className="space-y-3">
            {medications.map(med => {
              const info = calculateDepletionInfo(med);
              const progressPercentage = Math.min(100, (med.currentStock / 60) * 100); // 60 is full reference

              let progColor = "bg-red-500";
              if (info.status === 'Estável') progColor = "bg-emerald-500";
              else if (info.status === 'Alerta') progColor = "bg-amber-500";

              return (
                <div key={med.id} className="p-4 bg-black/40 border border-[#1f1f1f] rounded-2xl space-y-3 hover:border-red-500/10 transition-colors">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h4 className="text-sm font-black text-white">{med.name}</h4>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{med.dosage !== '-' ? `${med.dosage} • ` : ''}{med.frequency}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleDeleteMedication(med.id)}
                        className="p-1.5 text-gray-600 hover:text-red-500 rounded-lg hover:bg-red-950/20 active:scale-90 transition-all"
                        title="Remover medicamento"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Stock counter & indicators */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#151515] p-3 rounded-xl border border-[#222]">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black uppercase tracking-wider text-gray-500 leading-tight">Estoque Disponível</span>
                      <span className="text-xs font-bold font-mono text-white mt-0.5">{med.currentStock} comprimidos</span>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-[9px] font-black uppercase tracking-wider text-gray-500 leading-tight">Previsão de Duração</span>
                      <span className={`text-xs font-black font-mono mt-0.5 ${
                        info.status === 'Crítico' ? 'text-red-500' : info.status === 'Alerta' ? 'text-amber-500' : 'text-emerald-500'
                      }`}>
                        {info.daysLeft === Infinity ? 'Sem uso diário' : `${info.daysLeft} dias`}
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-[9px] font-black uppercase tracking-wider text-gray-500 leading-tight">Data de Recompra</span>
                      <span className="text-xs font-black text-white flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3.5 h-3.5 text-red-500" />
                        {info.dateStr}
                      </span>
                    </div>
                  </div>

                  {/* Visual progress bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-gray-500">
                      <span>Nível do Estoque</span>
                      <span>{med.currentStock} unidades</span>
                    </div>
                    <div className="w-full bg-[#1f1f1f] h-2 rounded-full overflow-hidden">
                      <div className={`h-full ${progColor} transition-all duration-500`} style={{ width: `${progressPercentage}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Expense Tracker & Monthly Linear Evolution Chart (5 columns) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#181818] border border-[#222] rounded-[2rem] p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-red-500" /> Histórico Financeiro
                </h4>
                <p className="text-xs text-white font-black mt-1">Evolução Linear de Gastos</p>
              </div>
              <div className="sm:text-right">
                <span className="text-[9px] font-black uppercase tracking-wider text-gray-500 block">Total Gasto em 2026</span>
                <span className="text-sm font-black text-red-500 font-mono">R$ {totalSpent2026.toFixed(2)}</span>
              </div>
            </div>

            {/* Linear graph */}
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#222" />
                  <XAxis dataKey="month" stroke="#555" fontSize={10} fontWeight="bold" />
                  <YAxis stroke="#555" fontSize={10} fontWeight="bold" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111', borderRadius: '1rem', border: '1px solid #333', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '11px', color: '#fff', fontWeight: 'bold' }}
                    labelStyle={{ display: 'none' }}
                  />
                  <Area 
                    type="linear" 
                    dataKey="Gasto Total" 
                    stroke="#ef4444" 
                    fillOpacity={1} 
                    fill="url(#colorSpent)" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: '#ef4444', strokeWidth: 2, stroke: '#121212' }} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* List of recent purchases */}
            <div className="space-y-2 border-t border-[#222] pt-4">
              <h5 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Últimas Compras</h5>
              
              <div className="max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {purchases.slice(0, 5).map(p => (
                  <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 bg-black/30 rounded-xl border border-[#1e1e1e] hover:border-[#2a2a2a] transition-colors text-xs">
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-white truncate">{p.medName}</p>
                      <span className="text-[9px] text-gray-500 font-bold block mt-1">{formatDateBR(p.date)} • Qtd: {p.quantity} comp.</span>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-2 font-mono text-right shrink-0">
                      <span className="font-bold text-gray-300">R$ {p.pricePaid.toFixed(2)}</span>
                      <button 
                        onClick={() => handleDeletePurchase(p.id)}
                        className="p-1 text-gray-600 hover:text-red-500 rounded transition-colors"
                        title="Remover registro"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
