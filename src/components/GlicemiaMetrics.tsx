import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import { Droplet, AlertTriangle, TrendingUp, TrendingDown, Clock, Activity, Settings, Calendar } from 'lucide-react';
import { User } from '../types';
import { saveProgressData, subscribeToProgressData } from '../services/firestoreService';

const DEFAULT_GLUCOSE_VALUES = [
  53, 54, 56, 69, 65, 62, 30, 69, 25, 48, 63, 89, 27, 144, 41, 83, 87, 68, 41, 109, 25, 79, 98, 174, 43, 73, 71, 133, 82, 92, 47, 80, 57, 76, 79, 221, 59, 65, 128, 117, 27, 55, 88, 101, 76, 87, 253, 330, 140, 161, 91, 96, 100, 72, 70, 82, 105, 87, 79, 90, 97, 58, 103, 63, 79, 92, 50, 63, 87, 81, 96, 226, 88, 57, 66, 52
];

export interface GlucoseEntry {
  id: number;
  date: string; // "DD/MM" format for chart
  fullDate: string; // "YYYY-MM-DD"
  value: number;
  time: string; // "HH:MM"
  period: 'Manhã' | 'Tarde' | 'Noite';
  timestamp: number;
}

export const buildDefaultGlucoseHistory = (): GlucoseEntry[] => {
  return DEFAULT_GLUCOSE_VALUES.map((val, index) => {
    // Current date is June 01, 2026. Going backward:
    const d = new Date(2026, 5, 1);
    d.setDate(d.getDate() - index);
    
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const dateStr = `${day}/${month}`;
    const fullDate = `${d.getFullYear()}-${month}-${day}`;
    
    // Varying periods backwards
    let period: 'Manhã' | 'Tarde' | 'Noite' = 'Manhã';
    let time = "08:00";
    if (index % 3 === 1) {
      period = 'Tarde';
      time = "14:00";
    } else if (index % 3 === 2) {
      period = 'Noite';
      time = "20:00";
    }

    return {
      id: 2000000 + index,
      date: dateStr,
      fullDate,
      value: val,
      time,
      period,
      timestamp: d.getTime()
    };
  }).reverse(); // chronologically ordered from oldest to newest: today (53) is at the very end
};

export const GlicemiaMetrics: React.FC<{ currentUser?: User }> = ({ currentUser }) => {
  const [data, setData] = useState<GlucoseEntry[]>([]);
  const [newValue, setNewValue] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<'Manhã' | 'Tarde' | 'Noite'>('Manhã');
  const [filterType, setFilterType] = useState<'all' | '30' | '15' | '7'>('30');
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Load from Cloud / LocalStorage
  useEffect(() => {
    if (currentUser) {
      const unsubscribe = subscribeToProgressData(currentUser.id, (cloudData) => {
        if (cloudData && cloudData.glucoseData && cloudData.glucoseData.length > 0) {
          setData(cloudData.glucoseData);
          localStorage.setItem(`glucose_data_${currentUser.id}`, JSON.stringify(cloudData.glucoseData));
        } else {
          const saved = localStorage.getItem(`glucose_data_${currentUser.id}`);
          if (saved) {
            setData(JSON.parse(saved));
          } else {
            // Seed default 76 historical readings
            const seeded = buildDefaultGlucoseHistory();
            setData(seeded);
            localStorage.setItem(`glucose_data_${currentUser.id}`, JSON.stringify(seeded));
          }
        }
        setIsDataLoaded(true);
      });
      return () => unsubscribe();
    } else {
      const saved = localStorage.getItem('glucose_data_guest');
      if (saved) {
        setData(JSON.parse(saved));
      } else {
        setData(buildDefaultGlucoseHistory());
      }
      setIsDataLoaded(true);
    }
  }, [currentUser]);

  // Save to Cloud & LocalStorage
  useEffect(() => {
    if (isDataLoaded) {
      if (currentUser) {
        saveProgressData(currentUser.id, { glucoseData: data }).catch(console.error);
        localStorage.setItem(`glucose_data_${currentUser.id}`, JSON.stringify(data));
      } else {
        localStorage.setItem('glucose_data_guest', JSON.stringify(data));
      }
    }
  }, [data, currentUser, isDataLoaded]);

  const handleAddGlucose = () => {
    if (!newValue) return;
    const val = parseInt(newValue);
    if (isNaN(val)) return;

    const now = new Date();
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const dateStr = `${day}/${month}`;
    const fullDate = `${now.getFullYear()}-${month}-${day}`;
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const newEntry: GlucoseEntry = {
      id: Date.now(),
      date: dateStr,
      fullDate,
      value: val,
      time: timeStr,
      period: selectedPeriod,
      timestamp: now.getTime()
    };

    setData(prev => [...prev, newEntry]);
    setNewValue('');
  };

  // Get filtered data for the chart
  const getFilteredData = () => {
    if (filterType === 'all') return data;
    const limit = parseInt(filterType);
    return data.slice(-limit);
  };

  const filteredData = getFilteredData();

  // Statistics
  const latestEntry = data.length > 0 ? data[data.length - 1] : null;
  const latestValue = latestEntry ? latestEntry.value : 0;
  
  const values = data.map(item => item.value);
  const minGlucose = values.length > 0 ? Math.min(...values) : 0;
  const maxGlucose = values.length > 0 ? Math.max(...values) : 0;
  const avgGlucose = values.length > 0 ? Math.round(values.reduce((sum, v) => sum + v, 0) / values.length) : 0;

  // Alerts counts
  const hypoCount = data.filter(item => item.value < 70).length;
  const hyperCount = data.filter(item => item.value > 140).length;
  const normalCount = data.filter(item => item.value >= 70 && item.value <= 140).length;

  // Evaluation of latest reading
  let latestStatus = 'Normal';
  let latestStatusColor = 'text-green-500';
  let latestBgColor = 'bg-green-500/10';
  let latestBorderColor = 'border-green-500/20';

  if (latestValue < 70) {
    latestStatus = 'Hipoglicemia';
    latestStatusColor = 'text-blue-500';
    latestBgColor = 'bg-blue-500/10';
    latestBorderColor = 'border-pink-500/20';
    if (latestValue <= 55) {
      latestStatus = 'Hipoglicemia Severa';
      latestStatusColor = 'text-rose-600 animate-pulse';
      latestBgColor = 'bg-red-950/40';
      latestBorderColor = 'border-red-600/30';
    }
  } else if (latestValue > 140) {
    latestStatus = 'Glicose Elevada';
    latestStatusColor = 'text-red-500';
    latestBgColor = 'bg-red-500/10';
    latestBorderColor = 'border-red-500/20';
  }

  return (
    <div className="space-y-6">
      
      {/* PAINEL DINÂMICO E ALERTAS */}
      <div className={`p-8 rounded-[2.5rem] shadow-xl text-white border ${latestBorderColor} ${latestBgColor} relative overflow-hidden transition-all duration-300`}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
        
        <div className="flex justify-between items-start mb-8 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center backdrop-blur-md">
              <Droplet className={`w-7 h-7 ${latestValue < 70 ? 'text-blue-500' : latestValue > 140 ? 'text-red-500' : 'text-emerald-500'}`} />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-tighter font-montserrat italic">Glicemia Hoje</h3>
              <p className={`text-[10px] font-black uppercase tracking-widest ${latestStatusColor} bg-black/40 px-2 py-0.5 rounded-md mt-1 inline-block`}>
                {latestStatus}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">Aferição</p>
            <p className="text-4xl font-black font-montserrat tracking-tighter">
              {latestValue} <span className="text-sm">mg/dL</span>
            </p>
          </div>
        </div>

        {/* ALERTA DE SEGURANÇA SE FOR HIPOGLICEMIA SEVERA */}
        {latestValue < 70 && (
          <div className="flex items-center gap-3 bg-red-950/50 border border-red-500/30 p-4 rounded-2xl mb-6 relative z-10">
            <AlertTriangle className="text-rose-500 w-5 h-5 shrink-0 animate-bounce" />
            <div className="text-[11px] leading-relaxed text-red-200">
              <p className="font-bold uppercase text-red-400">Hipoglicemia Detectada ({latestValue} mg/dL)</p>
              Consuma carboidratos de absorção rápida urgente (ex: 1 copo de refrigerante comum, suco de laranja ou 1 colher de açúcar) e meça novamente em 15 minutos!
            </div>
          </div>
        )}

        {/* DISTRIBUIÇÃO DAS LEITURAS */}
        <div className="grid grid-cols-3 gap-3 mb-6 relative z-10">
          <div className="bg-blue-500/5 border border-blue-500/10 p-4 rounded-3xl text-center">
            <p className="text-[8px] font-black uppercase tracking-widest text-blue-500/80 mb-1">Hipos (&lt;70)</p>
            <p className="text-xl font-black font-montserrat text-blue-400">{hypoCount} <span className="text-[10px] font-medium opacity-60">vezes</span></p>
          </div>
          <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-3xl text-center">
            <p className="text-[8px] font-black uppercase tracking-widest text-emerald-500/80 mb-1">Normais (70-140)</p>
            <p className="text-xl font-black font-montserrat text-emerald-400">{normalCount} <span className="text-[10px] font-medium opacity-60">vezes</span></p>
          </div>
          <div className="bg-red-500/5 border border-red-500/10 p-4 rounded-3xl text-center">
            <p className="text-[8px] font-black uppercase tracking-widest text-red-500/80 mb-1">Altas (&gt;140)</p>
            <p className="text-xl font-black font-montserrat text-red-400">{hyperCount} <span className="text-[10px] font-medium opacity-60">vezes</span></p>
          </div>
        </div>

        {/* MÉTRICAS HISTÓRICAS */}
        <div className="grid grid-cols-3 gap-3 mb-6 relative z-10">
          <div className="bg-white/5 backdrop-blur-md p-4 rounded-3xl border border-white/5">
            <p className="text-[8px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">Aferição Mín</p>
            <p className="text-lg font-black font-montserrat">{minGlucose} <span className="text-xs">mg/dL</span></p>
          </div>
          <div className="bg-white/5 backdrop-blur-md p-4 rounded-3xl border border-white/5">
            <p className="text-[8px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">Média Geral</p>
            <p className="text-lg font-black font-montserrat">{avgGlucose} <span className="text-xs">mg/dL</span></p>
          </div>
          <div className="bg-white/5 backdrop-blur-md p-4 rounded-3xl border border-white/5">
            <p className="text-[8px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">Aferição Máx</p>
            <p className="text-lg font-black font-montserrat text-red-300">{maxGlucose} <span className="text-xs">mg/dL</span></p>
          </div>
        </div>

        <div className="pt-6 border-t border-white/5 relative z-10 flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
          <span>Aparelho Accu-Chek / Libre</span>
          <span className="text-white">Seu Histórico Completo ({data.length} leituras)</span>
        </div>
      </div>

      {/* REGISTRO DE GLICEMIA */}
      <div className="bg-[#121212] p-6 rounded-[2rem] border border-[#1a1a1a]">
        <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
          <Activity size={16} className="text-red-500" /> Registrar Glicemia Manual
        </h3>
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="number"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="Ex primeiramente: 75 mg/dL"
                className="w-full p-3 pl-4 border border-[#1a1a1a] rounded-xl bg-black text-white focus:outline-none focus:border-red-500 font-bold transition-colors"
              />
              <span className="absolute right-4 top-3 text-xs text-gray-500 font-bold">mg/dL</span>
            </div>
            
            <button
              onClick={handleAddGlucose}
              className="bg-red-600 hover:bg-red-700 active:scale-95 text-white px-6 py-2 rounded-xl font-bold uppercase text-xs tracking-wider transition-all"
            >
              Adicionar
            </button>
          </div>

          <div className="flex gap-2 justify-between">
            {(['Manhã', 'Tarde', 'Noite'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setSelectedPeriod(p)}
                className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all ${
                  selectedPeriod === p 
                    ? 'bg-red-950/30 text-rose-500 border-red-500/40' 
                    : 'bg-black/30 text-gray-400 border-transparent hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* GRÁFICO HISTÓRICO "IGUALZINHO" AO CURVA DE PESO */}
      <div className="bg-[#121212] p-6 rounded-[2.5rem] shadow-sm border border-[#1a1a1a]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
              <Activity size={16} className="text-rose-500" /> Curva de Glicemia
            </h3>
            <p className="text-[10px] font-bold text-gray-500 uppercase mt-0.5">Visão Sequencial do Aparelho</p>
          </div>
          
          {/* BOTÕES DE FILTRO */}
          <div className="flex bg-black/40 p-1 rounded-xl border border-white/5 shrink-0 self-start sm:self-center">
            {[
              { id: 'all', label: 'Tudo' },
              { id: '30', label: '30 d' },
              { id: '15', label: '15 d' },
              { id: '7', label: '7 d' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id as any)}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${
                  filterType === f.id
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filteredData}>
              <defs>
                <linearGradient id="glucoseLineGradient" x1="0" y1="0" x2="1" y2="0">
                  {filteredData.map((_, i) => {
                    if (i === 0) return null;
                    const prev = filteredData[i - 1].value;
                    const curr = filteredData[i].value;
                    
                    // Same logic: Green for lower/decrease, red/orange for increase
                    const color = curr < prev ? '#10b981' : curr > prev ? '#ef4444' : '#6366f1';
                    const prevPerc = ((i - 1) / (filteredData.length - 1)) * 100;
                    const currPerc = (i / (filteredData.length - 1)) * 100;
                    return (
                      <React.Fragment key={i}>
                        <stop offset={`${prevPerc}%`} stopColor={color} />
                        <stop offset={`${currPerc}%`} stopColor={color} />
                      </React.Fragment>
                    );
                  })}
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f1f1f" />
              <XAxis 
                dataKey="date" 
                stroke="#666" 
                fontSize={9}
                fontWeight="bold"
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis 
                domain={[0, 'auto']} 
                stroke="#666" 
                fontSize={9}
                fontWeight="bold"
                tickLine={false}
                axisLine={false}
                dx={-10}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0a0a0a', borderRadius: '1rem', border: '1px solid #1f1f1f', color: '#fff', fontSize: '11px', fontWeight: 'bold' }} 
                itemStyle={{ color: '#fff' }}
                labelFormatter={(label) => `Data: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="url(#glucoseLineGradient)" 
                strokeWidth={3}
                dot={(props: any) => {
                  const { cx, cy, payload, index } = props;
                  if (index === 0) return <circle key={index} cx={cx} cy={cy} r={4.5} fill="#ffffff" stroke="#000" strokeWidth={1.5} />;
                  const prev = filteredData[index - 1].value;
                  const curr = payload.value;
                  
                  // Color dot matching line gradient and ranges (hypo is blue/indigo, normal is green, high is red)
                  let color = curr < prev ? '#10b981' : curr > prev ? '#ef4444' : '#6366f1';
                  if (curr < 70) color = '#3b82f6'; // hypo
                  else if (curr > 140) color = '#ec4899'; // hyper
                  
                  return <circle key={index} cx={cx} cy={cy} r={4.5} fill={color} stroke="#000" strokeWidth={1.5} />;
                }}
                isAnimationActive={false}
              >
                {/* Labels only if we are seeing a shorter period to prevent cluttering */}
                {filteredData.length <= 15 && (
                  <LabelList 
                    dataKey="value" 
                    position="top" 
                    offset={10} 
                    style={{ fontSize: '9px', fontWeight: 'bold', fill: '#ffffff' }} 
                  />
                )}
              </Line>
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="text-[10px] text-gray-500 font-medium italic mt-4 text-center leading-relaxed">
          💡 Clique nos botões acima (7d, 15d, 30d, Tudo) para expandir ou focar no gráfico e ver as flutuações em detalhes!
        </p>
      </div>

    </div>
  );
};
