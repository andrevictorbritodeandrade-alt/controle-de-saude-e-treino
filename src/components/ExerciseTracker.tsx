import React, { useState, useRef, useEffect } from 'react';
import { Dumbbell, RefreshCw, Activity, Footprints, Upload } from 'lucide-react';
import { Workout, User } from '../types';
import { analyzeWorkoutScreenshot } from '../services/visionService';
import { connectGoogleFit, fetchTodayWorkouts } from '../services/googleFitService';
import { saveProgressData, subscribeToProgressData } from '../services/firestoreService';

export const initialWorkouts: Workout[] = [
  {
    id: 'workout_2026_04_15_2106',
    date: '15/04/2026',
    activity: 'Corrida',
    duration: '38:18',
    calories: 174,
    details: {
      distanceKm: 3.12,
      averagePace: '12\'14"/km',
      averageHeartRateBpm: 110,
      averageCadencePpm: 104,
      elevationGainMeters: 4,
      advancedMetrics: {
        asymmetry: 'Tendência para o lado Direito (Azul)',
        groundContactTime: 'Alto (Laranja)',
        flightTime: 'Ótimo (Verde)',
        regularity: 'Tendência para o lado Direito (Azul)',
        vertical: 'Médio (Laranja)',
        stiffness: 'Médio (Laranja)'
      },
      performanceAndRecovery: {
        vo2Max: 36.1,
        vo2MaxClassification: 'Ruim (Laranja/Vermelho)',
        estimatedSweatLossMl: 252,
        hydrationRecommendationMl: 378,
        device: 'Galaxy Watch7'
      }
    }
  },
  {
    id: 'workout_2026_04_16_2222',
    date: '16/04/2026',
    activity: 'Caminhada',
    duration: '33:15',
    calories: 195,
    details: {
      distanceKm: 3.52,
      averagePace: '6.3 km/h',
      averageHeartRateBpm: 115,
      averageCadencePpm: 119, // 3967 steps / 33.25 min
      elevationGainMeters: 2,
      performanceAndRecovery: {
        vo2Max: 36.1,
        vo2MaxClassification: 'Bom (Verde)',
        estimatedSweatLossMl: 188,
        hydrationRecommendationMl: 282,
        device: 'Galaxy Watch7'
      }
    }
  },
  {
    id: 'workout_2026_04_19_1210',
    date: '19/04/2026',
    activity: 'Corrida',
    duration: '48:54',
    calories: 223,
    details: {
      distanceKm: 3.74,
      averagePace: '13\'04"/km',
      averageHeartRateBpm: 105,
      averageCadencePpm: 101,
      elevationGainMeters: 32,
      performanceAndRecovery: {
        vo2Max: 36.1,
        vo2MaxClassification: 'Bom (Verde)',
        estimatedSweatLossMl: 317,
        hydrationRecommendationMl: 475,
        device: 'Galaxy Watch7'
      }
    }
  },
  {
    id: 'workout_2026_04_20_1732',
    date: '20/04/2026',
    activity: 'Corrida',
    duration: '46:20',
    calories: 362,
    details: {
      distanceKm: 4.50,
      averagePace: '10\'17"/km',
      averageHeartRateBpm: 131,
      averageCadencePpm: 112,
      elevationGainMeters: 34,
      splits: [
        { distance: '1.00 km', time: '11:42', pace: '11\'42"' },
        { distance: '1.00 km', time: '09:04', pace: '09\'04"' },
        { distance: '1.00 km', time: '09:52', pace: '09\'52"' },
        { distance: '1.00 km', time: '10:12', pace: '10\'12"' },
        { distance: '0.50 km', time: '05:28', pace: '10\'53"' }
      ],
      heartRateZones: [
        { zone: 5, name: 'Máxima', range: '161-178 bpm', usage: 'Mínimo' },
        { zone: 4, name: 'Anaeróbica', range: '143-160 bpm', usage: 'Moderado' },
        { zone: 3, name: 'Aeróbica', range: '125-142 bpm', usage: 'Predominante/Longo' },
        { zone: 2, name: 'Controle de Peso', range: '107-124 bpm', usage: 'Baixo' },
        { zone: 1, name: 'Baixa Intensidade', range: '89-106 bpm', usage: 'Baixo' }
      ],
      advancedMetrics: {
        asymmetry: 'Tendência para o lado Direito (Azul)',
        groundContactTime: 'Alto/Lento (Laranja)',
        flightTime: 'Ótimo (Verde)',
        regularity: 'Tendência para o lado Direito (Azul)',
        vertical: 'Médio (Laranja)',
        stiffness: 'Médio (Laranja)'
      },
      performanceAndRecovery: {
        vo2Max: 36.1,
        vo2MaxClassification: 'Ruim',
        estimatedSweatLossMl: 606,
        hydrationRecommendationMl: 909,
        device: 'Galaxy Watch7'
      }
    }
  }
];

interface ExerciseTrackerProps {
  currentUser?: User;
}

export const ExerciseTracker: React.FC<ExerciseTrackerProps> = ({ currentUser }) => {
  const [workouts, setWorkouts] = useState<Workout[]>(() => {
    if (currentUser) {
      const saved = localStorage.getItem(`workouts_${currentUser.id}`);
      if (saved) return JSON.parse(saved);
    }
    return initialWorkouts;
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSyncingFit, setIsSyncingFit] = useState(false);
  const [isConnectedToFit, setIsConnectedToFit] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [expandedWorkoutId, setExpandedWorkoutId] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      const unsubscribe = subscribeToProgressData(currentUser.id, (cloudData) => {
        if (cloudData && cloudData.workouts) {
          const existingIds = new Set(cloudData.workouts.map((w: any) => w.id));
          const newInitials = initialWorkouts.filter(w => !existingIds.has(w.id));
          const merged = [...cloudData.workouts, ...newInitials];
          setWorkouts(merged);
          localStorage.setItem(`workouts_${currentUser.id}`, JSON.stringify(merged));
        } else {
          setWorkouts(initialWorkouts);
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
      saveProgressData(currentUser.id, { workouts }).catch(console.error);
      localStorage.setItem(`workouts_${currentUser.id}`, JSON.stringify(workouts));
    }
  }, [workouts, currentUser, isDataLoaded]);

  useEffect(() => {
    const token = localStorage.getItem('googleFitToken');
    if (token) {
      setIsConnectedToFit(true);
    }
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const result = await analyzeWorkoutScreenshot(file);
      if (result) {
        const newWorkout: Workout = {
          id: Date.now().toString(),
          date: new Date().toLocaleDateString('pt-BR'),
          activity: result.activity || 'Treino',
          duration: result.duration || '00:00',
          calories: result.calories || 0,
          details: result.details || undefined
        };
        setWorkouts(prev => [...prev, newWorkout]);
      }
    } catch (error) {
      console.error("Erro ao processar imagem:", error);
      alert("Não foi possível ler o print. Tente novamente.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSyncGoogleFit = async () => {
    setIsSyncingFit(true);
    try {
      if (!isConnectedToFit) {
        await connectGoogleFit();
        setIsConnectedToFit(true);
      }
      
      const fitWorkouts = await fetchTodayWorkouts();
      if (fitWorkouts.length > 0) {
        setWorkouts(prev => {
          const existingIds = new Set(prev.map(w => w.id));
          const newWorkouts = fitWorkouts.filter(w => !existingIds.has(w.id));
          return [...prev, ...newWorkouts];
        });
        alert(`${fitWorkouts.length} treino(s) sincronizado(s) com sucesso!`);
      } else {
        alert("Nenhum treino encontrado hoje no Google Fit.");
      }
    } catch (error: any) {
      console.error("Erro ao sincronizar Google Fit:", error);
      if (error.message === "Token expirado") {
        setIsConnectedToFit(false);
        alert("Sua sessão do Google Fit expirou. Por favor, conecte novamente.");
      } else {
        alert("Erro ao sincronizar com Google Fit. Verifique se você concedeu as permissões.");
      }
    } finally {
      setIsSyncingFit(false);
    }
  };

  const exerciseGoal = 300;
  const totalCaloriesBurned = workouts.reduce((sum, w) => sum + (w.calories || 0), 0);
  const exerciseProgress = Math.min(100, (totalCaloriesBurned / exerciseGoal) * 100);

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-black text-white font-montserrat uppercase tracking-tight">Exercícios</h2>
      
      <div className="grid lg:grid-cols-2 lg:gap-8 items-start space-y-6 lg:space-y-0">
        <div className="space-y-6">
          {/* META DE EXERCÍCIOS DIÁRIA */}
          <div className="bg-[#121212] rounded-[2.5rem] shadow-xl border border-[#1f1f1f] p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-900/20 rounded-xl flex items-center justify-center text-red-500">
                  <Dumbbell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider font-montserrat text-white">Meta de Exercício</h3>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Diário</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-white font-montserrat">{totalCaloriesBurned} / {exerciseGoal} kcal</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="w-full bg-[#1c1c1c] rounded-full h-3 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ease-out rounded-full ${
                    exerciseProgress >= 100 ? 'bg-red-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.3)]'
                  }`}
                  style={{ width: `${exerciseProgress}%` }}
                />
              </div>
              <div className="flex justify-between items-center">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  {exerciseProgress >= 100 ? 'Meta Atingida! 🔥' : `Faltam ${Math.max(0, exerciseGoal - totalCaloriesBurned)} kcal`}
                </p>
                <p className="text-[10px] font-black text-red-500 bg-red-900/20 px-2 py-0.5 rounded-md">
                  {Math.round(exerciseProgress)}%
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          {/* REGISTRO DE TREINOS */}
          <div className="bg-[#121212] p-4 rounded-[2rem] shadow-xl border border-[#1f1f1f]">
            <h3 className="text-lg font-bold text-white font-serif mb-4 uppercase tracking-tighter">Treinos (Samsung Health / Google Fit)</h3>
            
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                onClick={handleSyncGoogleFit}
                disabled={isSyncingFit}
                className={`flex items-center justify-center gap-2 p-3 rounded-2xl font-black text-xs transition-colors ${
                  isConnectedToFit 
                    ? 'bg-emerald-900/20 text-red-500 border border-emerald-900/30' 
                    : 'bg-red-900/20 text-red-500 border border-red-900/30'
                }`}
              >
                {isSyncingFit ? (
                  <RefreshCw size={18} className="animate-spin" />
                ) : (
                  <Activity size={18} />
                )}
                {isConnectedToFit ? 'Sincronizar Fit' : 'Conectar Fit'}
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="flex items-center justify-center gap-2 bg-[#1c1c1c] text-gray-400 border border-[#1f1f1f] p-3 rounded-2xl font-black text-xs hover:bg-[#252525] transition-colors"
              >
                <Upload size={18} />
                {isProcessing ? 'Lendo...' : 'Print'}
              </button>
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
            
            <div className="space-y-2">
              {workouts.length === 0 && (
                <p className="text-center text-sm text-gray-500 py-4">Nenhum treino registrado hoje.</p>
              )}
              {workouts.map(w => (
                <div key={w.id} className="bg-[#1c1c1c] rounded-2xl border border-[#1f1f1f] overflow-hidden">
                  <div 
                    className={`flex justify-between items-center p-3 ${w.details ? 'cursor-pointer hover:bg-[#222222]' : ''}`}
                    onClick={() => {
                      if (w.details) {
                        setExpandedWorkoutId(expandedWorkoutId === w.id ? null : w.id);
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      {w.activity.toLowerCase().includes('corrid') || w.activity.toLowerCase().includes('caminhad') ? (
                        <Footprints className="text-red-500" size={20} />
                      ) : (
                        <Dumbbell className="text-red-500" size={20} />
                      )}
                      <div>
                        <p className="text-sm font-bold text-white">{w.activity}</p>
                        <p className="text-[10px] text-gray-500">{w.date} • {w.duration}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-black text-red-500">{w.calories} kcal</span>
                      {w.details && (
                        <span className="text-[9px] uppercase tracking-widest text-gray-600 mt-1">
                          {expandedWorkoutId === w.id ? 'Ocultar detalhes' : 'Ver detalhes'}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {w.details && expandedWorkoutId === w.id && (
                    <div className="p-4 bg-[#121212] border-t border-[#1f1f1f] text-xs text-gray-300 space-y-5">
                      <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                        <div className="bg-[#1c1c1c] p-2 rounded-lg border border-[#1f1f1f]">
                          <p className="text-[10px] uppercase text-gray-500 font-bold tracking-widest mb-1">Ritmo</p>
                          <p className="text-sm font-black text-white">{w.details.averagePace}</p>
                        </div>
                        <div className="bg-[#1c1c1c] p-2 rounded-lg border border-[#1f1f1f]">
                          <p className="text-[10px] uppercase text-gray-500 font-bold tracking-widest mb-1">FC Média</p>
                          <p className="text-sm font-black text-white">{w.details.averageHeartRateBpm} <span className="text-[10px] font-medium text-gray-500">bpm</span></p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
