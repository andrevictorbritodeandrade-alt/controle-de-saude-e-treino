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
import { Target, TrendingDown, Scale } from 'lucide-react';
import { ProgressEntry, User } from '../types';
import { saveProgressData, subscribeToProgressData } from '../services/firestoreService';

export const initialData: ProgressEntry[] = [
  { date: '17/03', weight: 99, muscleMass: 34, bodyFat: 30 },
  { date: '24/03', weight: 100.5, muscleMass: 34.5, bodyFat: 29.8 },
  { date: '31/03', weight: 101.25, muscleMass: 34.8, bodyFat: 29.6 },
  { date: '07/04', weight: 102.2, muscleMass: 35, bodyFat: 29.4 },
  { date: '18/04', weight: 101, muscleMass: 35.5, bodyFat: 28.5 },
  { date: '21/04', weight: 100.8, muscleMass: 35.5, bodyFat: 28.2 },
  { date: '27/04', weight: 100.1, muscleMass: 36.9, bodyFat: 30 },
  { date: '30/04', weight: 100.5, muscleMass: 37, bodyFat: 29.8 },
  { date: '07/05', weight: 100.2, muscleMass: 37.2, bodyFat: 29.5 },
  { date: '09/05', weight: 99.45, muscleMass: 37.5, bodyFat: 29.2 },
  { date: '10/05', weight: 99, muscleMass: 37.8, bodyFat: 29.0 },
  { date: '19/05', weight: 99, muscleMass: 38.0, bodyFat: 28.5 },
  { date: '20/05', weight: 98.7, muscleMass: 37.2, bodyFat: 29.5 },
  { date: '26/05', weight: 98.6, muscleMass: 37.2, bodyFat: 29.5 },
];

export const WeightMetrics: React.FC<{ currentUser?: User }> = ({ currentUser }) => {
  const [data, setData] = useState<ProgressEntry[]>(() => {
    if (currentUser) {
      const saved = localStorage.getItem(`weight_data_${currentUser.id}`);
      if (saved) return JSON.parse(saved);
    }
    return initialData;
  });
  const [newWeight, setNewWeight] = useState('');
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    if (currentUser) {
      const unsubscribe = subscribeToProgressData(currentUser.id, (cloudData) => {
        if (cloudData && cloudData.data && cloudData.data.length > 0) {
          setData(cloudData.data);
          localStorage.setItem(`weight_data_${currentUser.id}`, JSON.stringify(cloudData.data));
        }
        setIsDataLoaded(true);
      });
      return () => unsubscribe();
    } else {
      setIsDataLoaded(true);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser && isDataLoaded) {
      saveProgressData(currentUser.id, { data }).catch(console.error);
      localStorage.setItem(`weight_data_${currentUser.id}`, JSON.stringify(data));
    }
  }, [data, currentUser, isDataLoaded]);

  const handleAddWeight = () => {
    if (!newWeight) return;
    const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    const newEntry: ProgressEntry = {
      date: today,
      weight: parseFloat(newWeight),
      muscleMass: data[data.length - 1].muscleMass,
      bodyFat: data[data.length - 1].bodyFat,
    };
    setData([...data, newEntry]);
    setNewWeight('');
  };

  const currentWeight = data.length > 0 ? data[data.length - 1].weight : 102;
  const initialWeight = data.length > 0 ? data[0].weight : 103;
  const targetWeight = 87;
  const weightToLose = currentWeight - targetWeight;

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-bold text-white">Métricas de Peso</h2>
      
      {/* PROJEÇÃO DE METAS */}
      <div className="bg-[#0a0a0a] p-8 rounded-[2.5rem] shadow-xl text-white border border-[#1a1a1a] relative overflow-hidden">
        <div className="flex justify-between items-start mb-8 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center backdrop-blur-md">
              <Target className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-tighter font-montserrat italic">Meta de Peso</h3>
              <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest bg-red-900/20 px-2 py-0.5 rounded-md mt-1 inline-block">Pouco Integral</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[8px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">Peso Atual</p>
            <p className="text-3xl font-black font-montserrat tracking-tighter">{currentWeight} <span className="text-sm">kg</span></p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
          <div className="bg-white/5 backdrop-blur-md p-5 rounded-3xl border border-white/5">
            <p className="text-[8px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">Meta Pessoal</p>
            <p className="text-2xl font-black font-montserrat">{targetWeight} <span className="text-sm">kg</span></p>
          </div>
          <div className="bg-white/5 backdrop-blur-md p-5 rounded-3xl border border-white/5">
            <p className="text-[8px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">Falta</p>
            <p className="text-2xl font-black font-montserrat">{weightToLose > 0 ? weightToLose.toFixed(1) : 0} <span className="text-sm">kg</span></p>
          </div>
        </div>

        {/* CLINIC GOAL SECTION */}
        <div className="bg-white/5 backdrop-blur-sm p-6 rounded-[2rem] border border-white/5 mb-8 relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
               <div className="w-4 h-4 rounded-full bg-red-900/20 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
               </div>
               <p className="text-[9px] font-black uppercase tracking-widest text-red-500">Meta Bioimpedância Clínica</p>
            </div>
          </div>
          <div className="flex items-end justify-between">
             <div className="space-y-1">
                <p className="text-sm font-bold text-white tracking-tight">Perder 24kg de gordura e chegar nos 77kg</p>
                <p className="text-[10px] text-white/40 italic">Meta final estabelecida pela clínica</p>
             </div>
             <span className="text-[9px] font-black bg-red-900/20 text-red-500 border border-red-900/30 px-2 py-1 rounded">VALIDADA CLÍNICA</span>
          </div>
        </div>

        <div className="pt-6 border-t border-white/5 relative z-10">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 leading-relaxed">
            Meta Pessoal Atual: <span className="text-white">Chegar nos 87kg (menor peso desde a cirurgia)</span>
          </p>
          <div className="flex justify-between items-center mt-4 text-[9px] font-black uppercase tracking-widest text-white/40">
            <span>Tempo Estimado</span>
            <span>12-16 semanas</span>
          </div>
        </div>
      </div>

      {/* REGISTRO DE PESO */}
      <div className="bg-[#121212] p-4 rounded-xl shadow-sm border border-[#1a1a1a]">
        <h3 className="text-lg font-semibold mb-4 text-white">Registrar Peso</h3>
        <div className="flex gap-2">
          <input
            type="number"
            value={newWeight}
            onChange={(e) => setNewWeight(e.target.value)}
            placeholder="Peso (kg)"
            className="flex-1 p-2 border border-[#1a1a1a] rounded-lg bg-black text-white"
          />
          <button
            onClick={handleAddWeight}
            className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold"
          >
            Adicionar
          </button>
        </div>
      </div>

      {/* GRÁFICOS */}
      <div className="bg-[#121212] p-4 rounded-[2rem] shadow-sm border border-[#1a1a1a]">
        <h3 className="text-lg font-semibold mb-4 text-white">Peso (kg)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <defs>
                <linearGradient id="weightLineGradient" x1="0" y1="0" x2="1" y2="0">
                  {data.map((_, i) => {
                    if (i === 0) return null;
                    const prev = data[i - 1].weight;
                    const curr = data[i].weight;
                    const color = curr < prev ? '#22c55e' : curr > prev ? '#ef4444' : '#ffffff';
                    const startPerc = ((i - 0.5) / (data.length - 1)) * 100;
                    const endPerc = (i / (data.length - 1)) * 100;
                    // We need a stop at point i-1 and point i
                    const prevPerc = ((i - 1) / (data.length - 1)) * 100;
                    const currPerc = (i / (data.length - 1)) * 100;
                    return (
                      <React.Fragment key={i}>
                        <stop offset={`${prevPerc}%`} stopColor={color} />
                        <stop offset={`${currPerc}%`} stopColor={color} />
                      </React.Fragment>
                    );
                  })}
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                stroke="#666" 
                fontSize={10}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis 
                domain={['auto', 'auto']} 
                stroke="#666" 
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#222', color: '#fff' }} 
                itemStyle={{ color: '#fff' }}
              />
              <Line 
                type="monotone" 
                dataKey="weight" 
                stroke="url(#weightLineGradient)" 
                strokeWidth={3}
                dot={(props: any) => {
                  const { cx, cy, payload, index } = props;
                  if (index === 0) return <circle key={index} cx={cx} cy={cy} r={5} fill="#ffffff" stroke="#000" strokeWidth={2} />;
                  const prev = data[index - 1].weight;
                  const curr = payload.weight;
                  const color = curr < prev ? '#22c55e' : curr > prev ? '#ef4444' : '#ffffff';
                  return <circle key={index} cx={cx} cy={cy} r={5} fill={color} stroke="#000" strokeWidth={2} />;
                }}
                isAnimationActive={false}
              >
                <LabelList 
                  dataKey="weight" 
                  position="top" 
                  offset={12} 
                  style={{ fontSize: '10px', fontWeight: 'bold', fill: '#ffffff' }} 
                />
              </Line>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-[#121212] p-4 rounded-[2rem] shadow-sm border border-[#1a1a1a]">
        <h3 className="text-lg font-semibold mb-4 text-white">Massa Magra vs Gordura (%)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              {/* CartesianGrid removed as requested */}
              <XAxis dataKey="date" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#222', color: '#fff' }} />
              <Legend />
              <Line type="monotone" dataKey="muscleMass" stroke="#ffffff" name="Massa Magra" strokeWidth={2} dot={{ r: 4 }}>
                <LabelList dataKey="muscleMass" position="top" offset={10} style={{ fontSize: '8px', fontWeight: 'bold', fill: '#ffffff' }} />
              </Line>
              <Line type="monotone" dataKey="bodyFat" stroke="#dc2626" name="Gordura" strokeWidth={2} dot={{ r: 4 }}>
                <LabelList dataKey="bodyFat" position="bottom" offset={10} style={{ fontSize: '8px', fontWeight: 'bold', fill: '#dc2626' }} />
              </Line>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
