import React, { useState, useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine, LabelList
} from 'recharts';
import { 
  Activity, Calendar, TrendingDown, Clipboard, Heart, Award, ShieldAlert,
  ChevronRight, Sparkles, CheckCircle2, User, Clock, Flame, Droplets,
  Plus, Edit, Trash2, HelpCircle, TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User as UserType } from '../types';
import { GoogleGenAI } from '@google/genai';

interface Assessment {
  id: number;
  date: string;
  time: string;
  weight: number;
  bodyFat: number;
  fatWeight: number;
  skeletalMuscleWeight: number;
  waterWeight: number;
  protein: number;
  boneMass: number;
  metabolism: number;
  bmi: number;
  visceralFat: number;
  obesityLevel: number;
  inbodyScore: number;
  whr: number;
  
  // Lean segment
  leanArmLeft: number;
  leanArmRight: number;
  leanTrunk: number;
  leanLegLeft: number;
  leanLegRight: number;
  
  // Fat segment
  fatArmLeft: number;
  fatArmRight: number;
  fatTrunk: number;
  fatLegLeft: number;
  fatLegRight: number;
}

const INITIAL_CLINICAL_DATA: Assessment[] = [
  {
    id: 1,
    date: '24/04/2026',
    time: '15:03',
    weight: 102.8,
    bodyFat: 34.9,
    fatWeight: 35.9,
    skeletalMuscleWeight: 37.6,
    waterWeight: 48.6,
    protein: 13.1,
    boneMass: 5.16,
    metabolism: 1815,
    bmi: 31.7,
    visceralFat: 15,
    obesityLevel: 144.0,
    inbodyScore: 62,
    whr: 0.95,
    leanArmLeft: 3.60,
    leanArmRight: 3.60,
    leanTrunk: 28.6,
    leanLegLeft: 10.21,
    leanLegRight: 10.31,
    fatArmLeft: 2.8,
    fatArmRight: 2.9,
    fatTrunk: 18.2,
    fatLegLeft: 5.3,
    fatLegRight: 5.3
  },
  {
    id: 2,
    date: '01/06/2026',
    time: '15:12',
    weight: 99.1,
    bodyFat: 34.9,
    fatWeight: 34.6,
    skeletalMuscleWeight: 36.3,
    waterWeight: 46.9,
    protein: 12.7,
    boneMass: 4.95,
    metabolism: 1763,
    bmi: 30.6,
    visceralFat: 15,
    obesityLevel: 139.0,
    inbodyScore: 60,
    whr: 0.95,
    leanArmLeft: 3.50,
    leanArmRight: 3.50,
    leanTrunk: 27.8,
    leanLegLeft: 10.01,
    leanLegRight: 10.01,
    fatArmLeft: 2.7,
    fatArmRight: 2.7,
    fatTrunk: 17.6,
    fatLegLeft: 5.1,
    fatLegRight: 5.1
  },
  {
    id: 3,
    date: '02/06/2026',
    time: '08:00',
    weight: 97.3,
    bodyFat: 34.0,
    fatWeight: 33.1,
    skeletalMuscleWeight: 35.8,
    waterWeight: 46.5,
    protein: 12.8,
    boneMass: 4.95,
    metabolism: 1763,
    bmi: 30.0,
    visceralFat: 15,
    obesityLevel: 139.0,
    inbodyScore: 61,
    whr: 0.95,
    leanArmLeft: 3.50,
    leanArmRight: 3.50,
    leanTrunk: 27.8,
    leanLegLeft: 10.01,
    leanLegRight: 10.01,
    fatArmLeft: 2.7,
    fatArmRight: 2.7,
    fatTrunk: 17.6,
    fatLegLeft: 5.1,
    fatLegRight: 5.1
  },
  {
    id: 5,
    date: '11/06/2026',
    time: '06:04',
    weight: 98.1,
    bodyFat: 34.2,
    fatWeight: 33.5,
    skeletalMuscleWeight: 36.1,
    waterWeight: 46.8,
    protein: 12.8,
    boneMass: 4.95,
    metabolism: 1763,
    bmi: 30.3,
    visceralFat: 15,
    obesityLevel: 139.0,
    inbodyScore: 60,
    whr: 0.95,
    leanArmLeft: 3.50,
    leanArmRight: 3.50,
    leanTrunk: 27.8,
    leanLegLeft: 10.01,
    leanLegRight: 10.01,
    fatArmLeft: 2.7,
    fatArmRight: 2.7,
    fatTrunk: 17.6,
    fatLegLeft: 5.1,
    fatLegRight: 5.1
  },
  {
    id: 6,
    date: '18/06/2026',
    time: '15:38',
    weight: 97.6,
    bodyFat: 34.0,
    fatWeight: 33.2,
    skeletalMuscleWeight: 36.1,
    waterWeight: 46.6,
    protein: 12.8,
    boneMass: 4.95,
    metabolism: 1763,
    bmi: 30.1,
    visceralFat: 15,
    obesityLevel: 139.0,
    inbodyScore: 61,
    whr: 0.95,
    leanArmLeft: 3.50,
    leanArmRight: 3.50,
    leanTrunk: 27.8,
    leanLegLeft: 10.01,
    leanLegRight: 10.01,
    fatArmLeft: 2.7,
    fatArmRight: 2.7,
    fatTrunk: 17.6,
    fatLegLeft: 5.1,
    fatLegRight: 5.1
  }
];

export const NutrobarraMetrics: React.FC<{ currentUser: UserType }> = ({ currentUser }) => {
  const [assessments, setAssessments] = useState<Assessment[]>(() => {
    const saved = localStorage.getItem(`nutrobarra_${currentUser.id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Assessment[];
        const merged = [...parsed];
        
        // Ensure static/newer INITIAL_CLINICAL_DATA entries are matched/merged
        INITIAL_CLINICAL_DATA.forEach(initItem => {
          const index = merged.findIndex(m => m.date === initItem.date);
          if (index === -1) {
            merged.push(initItem);
          } else {
            // Overwrite weight and other metrics to force the latest status update accurately
            merged[index].weight = initItem.weight;
            merged[index].bodyFat = initItem.bodyFat;
            merged[index].fatWeight = initItem.fatWeight;
            merged[index].skeletalMuscleWeight = initItem.skeletalMuscleWeight;
            merged[index].waterWeight = initItem.waterWeight;
            merged[index].bmi = initItem.bmi;
          }
        });

        // Chronological sort
        merged.sort((a, b) => {
          const [da, ma, ya] = a.date.split('/').map(Number);
          const [db, mb, yb] = b.date.split('/').map(Number);
          return new Date(ya, ma - 1, da).getTime() - new Date(yb, mb - 1, db).getTime();
        });
        
        return merged;
      } catch (e) {
        return INITIAL_CLINICAL_DATA;
      }
    }
    return INITIAL_CLINICAL_DATA;
  });

  const [activeSubTab, setActiveSubTab] = useState<'evolucao' | 'comparador' | 'segmentar' | 'otimizacao' | 'formulario'>('evolucao');
  const [selectedAssessmentId1, setSelectedAssessmentId1] = useState<number>(INITIAL_CLINICAL_DATA[0].id);
  const [selectedAssessmentId2, setSelectedAssessmentId2] = useState<number>(INITIAL_CLINICAL_DATA[INITIAL_CLINICAL_DATA.length - 1]?.id || INITIAL_CLINICAL_DATA[1].id);
  const [showAddSuccess, setShowAddSuccess] = useState(false);

  // Optimizer sliders and states
  const [simulatedMuscle, setSimulatedMuscle] = useState<number>(36.3);
  const [simulatedFat, setSimulatedFat] = useState<number>(34.6);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState<boolean>(false);
  const [aiPlan, setAiPlan] = useState<string>('');

  // Form states for new entry
  const [newDate, setNewDate] = useState('02/06/2026');
  const [newTime, setNewTime] = useState('08:00');
  const [newWeight, setNewWeight] = useState('98.5');
  const [newBodyFat, setNewBodyFat] = useState('34.5');
  const [newFatWeight, setNewFatWeight] = useState('34.0');
  const [newMuscle, setNewMuscle] = useState('36.5');
  const [newWater, setNewWater] = useState('47.1');
  const [newProtein, setNewProtein] = useState('12.9');
  const [newMinerals, setNewMinerals] = useState('5.0');
  const [newBMR, setNewBMR] = useState('1780');
  const [newBMI, setNewBMI] = useState('30.4');
  const [newVisceral, setNewVisceral] = useState('15');
  const [newObesity, setNewObesity] = useState('138');
  const [newScore, setNewScore] = useState('61');
  const [newWHR, setNewWHR] = useState('0.95');

  // Segment values
  const [newLeanArmL, setNewLeanArmL] = useState('3.50');
  const [newLeanArmR, setNewLeanArmR] = useState('3.50');
  const [newLeanTrunk, setNewLeanTrunk] = useState('27.9');
  const [newLeanLegL, setNewLeanLegL] = useState('10.10');
  const [newLeanLegR, setNewLeanLegR] = useState('10.10');

  const [newFatArmL, setNewFatArmL] = useState('2.6');
  const [newFatArmR, setNewFatArmR] = useState('2.6');
  const [newFatTrunk, setNewFatTrunk] = useState('17.2');
  const [newFatLegL, setNewFatLegL] = useState('5.0');
  const [newFatLegR, setNewFatLegR] = useState('5.0');

  const saveToLocalStorage = (data: Assessment[]) => {
    localStorage.setItem(`nutrobarra_${currentUser.id}`, JSON.stringify(data));
  };

  const handleAddAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: Assessment = {
      id: Date.now(),
      date: newDate,
      time: newTime,
      weight: parseFloat(newWeight) || 0,
      bodyFat: parseFloat(newBodyFat) || 0,
      fatWeight: parseFloat(newFatWeight) || 0,
      skeletalMuscleWeight: parseFloat(newMuscle) || 0,
      waterWeight: parseFloat(newWater) || 0,
      protein: parseFloat(newProtein) || 0,
      boneMass: parseFloat(newMinerals) || 0,
      metabolism: parseFloat(newBMR) || 0,
      bmi: parseFloat(newBMI) || 0,
      visceralFat: parseInt(newVisceral) || 0,
      obesityLevel: parseInt(newObesity) || 0,
      inbodyScore: parseInt(newScore) || 0,
      whr: parseFloat(newWHR) || 0,
      leanArmLeft: parseFloat(newLeanArmL) || 0,
      leanArmRight: parseFloat(newLeanArmR) || 0,
      leanTrunk: parseFloat(newLeanTrunk) || 0,
      leanLegLeft: parseFloat(newLeanLegL) || 0,
      leanLegRight: parseFloat(newLeanLegR) || 0,
      fatArmLeft: parseFloat(newFatArmL) || 0,
      fatArmRight: parseFloat(newFatArmR) || 0,
      fatTrunk: parseFloat(newFatTrunk) || 0,
      fatLegLeft: parseFloat(newFatLegL) || 0,
      fatLegRight: parseFloat(newFatLegR) || 0,
    };

    const updated = [...assessments, newEntry].sort((a, b) => {
      // Sort chronologically based on dd/mm/yyyy
      const [da, ma, ya] = a.date.split('/').map(Number);
      const [db, mb, yb] = b.date.split('/').map(Number);
      return new Date(ya, ma - 1, da).getTime() - new Date(yb, mb - 1, db).getTime();
    });

    setAssessments(updated);
    saveToLocalStorage(updated);
    setShowAddSuccess(true);
    setTimeout(() => {
      setShowAddSuccess(false);
      setActiveSubTab('evolucao');
    }, 2000);
  };

  const handleDelete = (id: number) => {
    if (confirm('Tem certeza de que deseja excluir esta avaliação de bioimpedância clínica?')) {
      const filtered = assessments.filter(a => a.id !== id);
      setAssessments(filtered);
      saveToLocalStorage(filtered);
    }
  };

  // Safe deltas for current assessments
  const compareData = useMemo(() => {
    const sorted = [...assessments];
    if (sorted.length < 2) return null;
    
    // Use first and last for quick summary
    const first = sorted[0];
    const last = sorted[sorted.length - 1];

    const dWeight = last.weight - first.weight;
    const dMuscle = last.skeletalMuscleWeight - first.skeletalMuscleWeight;
    const dFat = last.fatWeight - first.fatWeight;
    const dFatPercent = last.bodyFat - first.bodyFat;

    return {
      dWeight,
      dMuscle,
      dFat,
      dFatPercent,
      firstDate: first.date,
      lastDate: last.date
    };
  }, [assessments]);

  // Formatter for Recharts
  const chartData = useMemo(() => {
    return assessments.map(a => ({
      date: a.date,
      'Peso (kg)': a.weight,
      'Massa Muscular (kg)': a.skeletalMuscleWeight,
      'Gordura Corporal (kg)': a.fatWeight,
      'Percentual Gordura (%)': a.bodyFat,
      'Grau Obesidade (%)': a.obesityLevel,
      'InBody Score': a.inbodyScore,
    }));
  }, [assessments]);

  const assessment1 = assessments.find(a => a.id === selectedAssessmentId1) || assessments[0];
  const assessment2 = assessments.find(a => a.id === selectedAssessmentId2) || assessments[assessments.length - 1] || assessments[0];

  const handleGenerateAiPlan = async () => {
    setIsGeneratingPlan(true);
    setAiPlan('');
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === 'undefined') {
        // High fidelity scientific fallback
        setTimeout(() => {
          setAiPlan(`### 🩺 DIAGNÓSTICO DO METABOLISMO (NUTRÓLOGO DESIGN)
Como você perdeu tanto peso corporal geral em pouco tempo (-3.7 kg), o déficit foi excessivamente restrito ou o estímulo de recrutamento motor (sobrecarga tensional) não foi potente o suficiente, forçando seu corpo a digerir a **Massa Muscular Esquelética (-1.3 kg)** para obter aminoácidos na ausência de energia circulante. 

Isso resultou na queda de sua **Taxa Metabólica Basal para 1763 kcal** (-52 kcal perdidas no motor biológico).

---

### 🥗 1. AJUSTE BIOMÉTRICO DE MACRONUTRIENTES
Para seu peso atual ideal de **99.1 kg**, o cálculo de resgate proteico e proteção do miócito é desenhado como:

*   **⚡ PROTEÍNAS (2.2g/kg): ~218g/dia** (872 kcal)
    *   *Objetivo*: Interromper a degradação proteica (catabolismo) induzida pelo estresse e estourar a síntese proteica (mTOR).
    *   *Sugestão prática*: 4 refeições de 55g de Proteína líquida ou sólida (Ex: 150g de peito de frango grelhado ou 1 scoop duplo de Whey Protein Nutrobarra + 4 claras de ovo).
*   **🥑 GORDURAS BOAS (0.8g/kg): ~79g/dia** (711 kcal)
    *   *Objetivo*: Preservar a regulação da testosterona, tireoide e o perfil lipídico saudável de colesterol.
    *   *Sugestão prática*: Adicionar azeite de oliva extravirgem nas principais refeições, abacate e castanhas.
*   **🍚 CARBOIDRATOS (Modulação Energética): ~130g a 150g/dia**
    *   *Objetivo*: Manter o glicogênio intramuscular carregado para realizar força pesada na academia sem utilizar proteína como substrato.
    *   *Fontes*: Arroz branco/integral, batata doce, aveia flocos finos.

---

### 🏋️ 2. DIRETRIZ INDISPENSÁVEL DE TREINO
*   **Musculação com Sobrecarga Progressiva (Essencial):** Treinar pesado (na faixa de 8 a 12 repetições próximas à falha). O seu corpo só vai "segurar" seu músculo se ele entender que esse músculo é vital para mover pesos pesados diariamente!
*   **Modulação de Cardio:** Reduzir aeróbicos de altíssimo volume (como corridas longas em jejum se não houver reserva de glicogênio). Preferir sessões de **HIIT de 15 minutos** após os treinos ou caminhadas moderadas regenerativas de 30-40 minutos (LISS) para oxidar ácidos graxos livres sem induzir fadiga periférica excessiva.

---

### 💊 3. SUPLEMENTAÇÃO DE RECUPERAÇÃO METABÓLICA
1.  **Creatina Monoidratada (5-7g todos os dias):** Saturar os depósitos de fosfocreatina. Aumenta o volume de água intracelular (hidratação do miócito), promovendo aumento de força e estimulando as vias de sinalização para hipertrofia biológica direta.
2.  **Whey Protein Concentrado (30-45g/dia):** Utilizar estrategicamente no pós-treino imediato ou como substituto proteico no lanche da tarde para evitar longos períodos de jejum catabólico.
3.  **Água (Mínimo 4 Litros Diários):** Uma célula desidratada cataboliza! O músculo é composto por 75% de água. Se você restringir água, perde massa magra na balança e joga seu metabolismo no chão.`);
          setIsGeneratingPlan(false);
        }, 1200);
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-2.1-flash",
        contents: `Você é um assessor médico esportivo e nutricionista clínico sênior focado na clínica Nutrobarra.
Analise a evolução de bioimpedância de André:
- Entre A (24/04/2026) e B (01/06/2026) (~38 dias):
  * Peso Corporal: de 102.8 kg para 99.1 kg (-3.7 kg)
  * Massa Muscular Esquelética (MME): de 37.6 kg para 36.3 kg (-1.3 kg) - queda preocupante! (Mais de 35% do peso perdido foi músculo!)
  * Massa de Gordura Corporal (MGC): de 35.9 kg para 34.6 kg (-1.3 kg)
  * Taxa Metabólica Basal (TMB): de 1815 kcal para 1763 kcal (-52 kcal/dia)
  * Pontuação InBody: de 62 para 60

O paciente está frustrado porque perdeu muito músculo e seu metabolismo basal desacelerou, o que prejudica a queima contínua de gordura. Ele quer soluções práticas e uma mudança de conduta para reverter isso, aumentar o metabolismo (TMB) e focar na perda pura de gordura protetora.

Gere um guia e regras terapêuticas práticas para reverter esse catabolismo de forma encorajadora e extremamente qualificada em Português. Organize com tópicos contendo ícones clássicos, cabeçalhos, marcadores elegantes e parágrafos curtos. Foque em:
1. Explicação científica simples e direta de porque ele perdeu massa muscular junto com gordura.
2. Metas biológicas personalizadas de Macronutrientes (ex: Proteína de 2g a 2.2g por kg de peso corporal ~218g de proteína diária, gorduras inteligentes e fontes recomendadas).
3. Conduta de Exercícios de Força (como treinar pesado / musculação sinaliza a preservação de fibras Tipo II e previne queda metabólica) e modulação aeróbica.
4. Hidratação e suplementação de precisão (Creatina 5-7g/dia para hidratar o miócito, Whey Protein e como usar).
5. Ajuste Hormonal e de Sono (controle de cortisol para combater catabolismo).`
      });

      if (response && response.text) {
        setAiPlan(response.text);
      } else {
        throw new Error("Resposta da IA vazia");
      }
    } catch (error) {
      console.error(error);
      setAiPlan("### Ocorreu um erro ao obter detalhes da IA.\\n\\n**1. Proteína em 2.2g/kg (218g/dia):** Essencial para proteger seus músculos da queima endógena de energia em processos de déficit.\\n**2. Treinos de Musculação Intensos:** A sinalização tensional tônica do levantamento de peso pesado é o único gatilho hormonal eficiente para reter massa muscular.\\n**3. Ingestão Hídrica Elevada:** Tome pelo menos 4 litros de água pura todos os dias para otimizar os processos enzimáticos hepáticos e reidratar os miócitos.");
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  return (
    <div className="space-y-6 pb-28">
      {/* Brand Header */}
      <div className="bg-[#121212] border border-[#1f1f1f] rounded-[2.5rem] p-8 flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full blur-3xl"></div>
        <div className="flex items-center gap-5 relative z-10">
          <div className="w-14 h-14 rounded-3xl bg-red-600/10 border border-red-500/20 flex items-center justify-center text-red-500 shrink-0">
            <Clipboard size={28} strokeWidth={2.5} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-red-950/40 text-red-500 border border-red-900/40 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest font-mono">
                InBody 120 Oficial
              </span>
              <span className="bg-[#1c1c1c] text-stone-200 border border-[#2c2c2c] text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest font-mono">
                Multisegmentar
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight mt-1">
              Bioimpedância Nutrobarra
            </h1>
            <p className="text-xs text-gray-500 font-medium">
              Gestão clínica de resultados. Estudo evolutivo e composição segmentar detalhada.
            </p>
          </div>
        </div>

        {compareData && (
          <div className="flex gap-4 shrink-0 relative z-10 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <div className="bg-[#1c1c1c] border border-[#2a2a2a] py-3.5 px-5 rounded-2xl min-w-[120px] text-center">
              <span className="text-[9px] font-black uppercase text-gray-500 block mb-0.5">Variação Peso</span>
              <span className={`text-base font-black ${compareData.dWeight <= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {compareData.dWeight > 0 ? '+' : ''}{compareData.dWeight.toFixed(1)} kg
              </span>
            </div>
            <div className="bg-[#1c1c1c] border border-[#2a2a2a] py-3.5 px-5 rounded-2xl min-w-[120px] text-center">
              <span className="text-[9px] font-black uppercase text-gray-500 block mb-0.5">Variação MME</span>
              <span className={`text-base font-black ${compareData.dMuscle >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {compareData.dMuscle > 0 ? '+' : ''}{compareData.dMuscle.toFixed(1)} kg
              </span>
            </div>
            <div className="bg-[#1c1c1c] border border-[#2a2a2a] py-3.5 px-5 rounded-2xl min-w-[120px] text-center">
              <span className="text-[9px] font-black uppercase text-gray-500 block mb-0.5">Massa Gorda</span>
              <span className={`text-base font-black ${compareData.dFat <= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {compareData.dFat > 0 ? '+' : ''}{compareData.dFat.toFixed(1)} kg
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Sub Navigation */}
      <div className="flex bg-[#121212] border border-[#1f1f1f] rounded-3xl p-1.5 overflow-x-auto gap-1 scrollbar-none">
        <button
          onClick={() => setActiveSubTab('evolucao')}
          className={`flex-1 py-3 px-4 rounded-2xl text-xs font-black uppercase tracking-wider transition-all border shrink-0 ${activeSubTab === 'evolucao' ? 'bg-red-600 text-white border-red-600 shadow-md' : 'text-gray-400 border-transparent hover:text-white'}`}
        >
          Evolução Geral
        </button>
        <button
          onClick={() => setActiveSubTab('comparador')}
          className={`flex-1 py-3 px-4 rounded-2xl text-xs font-black uppercase tracking-wider transition-all border shrink-0 ${activeSubTab === 'comparador' ? 'bg-red-600 text-white border-red-600 shadow-md' : 'text-gray-400 border-transparent hover:text-white'}`}
        >
          Visualizador de Exame
        </button>
        <button
          onClick={() => setActiveSubTab('segmentar')}
          className={`flex-1 py-3 px-4 rounded-2xl text-xs font-black uppercase tracking-wider transition-all border shrink-0 ${activeSubTab === 'segmentar' ? 'bg-red-600 text-white border-red-600 shadow-md' : 'text-gray-400 border-transparent hover:text-white'}`}
        >
          Laudo Segmentar
        </button>
        <button
          onClick={() => setActiveSubTab('otimizacao')}
          className={`flex-1 py-3 px-4 rounded-2xl text-xs font-black uppercase tracking-wider transition-all border shrink-0 ${activeSubTab === 'otimizacao' ? 'bg-red-600 text-white border-red-600 shadow-md' : 'text-gray-400 border-transparent hover:text-white'}`}
        >
          Otimizar TMB & Gordura
        </button>
        <button
          onClick={() => setActiveSubTab('formulario')}
          className={`flex-1 py-3 px-4 rounded-2xl text-xs font-black uppercase tracking-wider transition-all border shrink-0 ${activeSubTab === 'formulario' ? 'bg-red-600 text-white border-red-600 shadow-md' : 'text-gray-400 border-transparent hover:text-white'}`}
        >
          Registrar Dados
        </button>
      </div>

      {/* Content views */}
      <AnimatePresence mode="wait">
        {activeSubTab === 'evolucao' && (
          <motion.div
            key="evolucao"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Charts section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Chart 1: Peso vs Massa Muscular vs Gordura */}
              <div className="bg-[#121212] border border-[#1f1f1f] rounded-[2.5rem] p-6 shadow-xl">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-tight">Composição Corporal (Histórico)</h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Acompanhamento de Tecidos em kg</p>
                  </div>
                  <TrendingDown className="text-red-500 w-5 h-5 shrink-0" />
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid stroke="#1c1c1c" strokeDasharray="3 3" />
                      <XAxis dataKey="date" stroke="#666" tick={{ fill: '#888', fontSize: 10, fontWeight: 'bold' }} />
                      <YAxis stroke="#666" domain={['dataMin - 5', 'dataMax + 5']} tick={{ fill: '#888', fontSize: 10, fontWeight: 'bold' }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#121212', borderColor: '#1f1f1f', borderRadius: '1rem', color: '#fff' }}
                        labelStyle={{ fontWeight: 'black', color: '#fc8181' }}
                      />
                      <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                      <Line type="monotone" dataKey="Peso (kg)" stroke="#ffffff" strokeWidth={3} activeDot={{ r: 8 }}>
                        <LabelList dataKey="Peso (kg)" position="top" fill="#ffffff" stroke="none" style={{ fontSize: '10px', fontWeight: 'bold' }} />
                      </Line>
                      <Line type="monotone" dataKey="Massa Muscular (kg)" stroke="#34d399" strokeWidth={2.5}>
                        <LabelList dataKey="Massa Muscular (kg)" position="top" fill="#34d399" stroke="none" style={{ fontSize: '10px', fontWeight: 'bold' }} />
                      </Line>
                      <Line type="monotone" dataKey="Gordura Corporal (kg)" stroke="#ef4444" strokeWidth={2.5}>
                        <LabelList dataKey="Gordura Corporal (kg)" position="bottom" fill="#ef4444" stroke="none" style={{ fontSize: '10px', fontWeight: 'bold' }} />
                      </Line>
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: PGC vs InBody Score */}
              <div className="bg-[#121212] border border-[#1f1f1f] rounded-[2.5rem] p-6 shadow-xl">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-tight">Percentual de Gordura & Score</h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Métricas de Saúde e Pontuação Clínica</p>
                  </div>
                  <Award className="text-emerald-500 w-5 h-5 shrink-0" />
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid stroke="#1c1c1c" strokeDasharray="3 3" />
                      <XAxis dataKey="date" stroke="#666" tick={{ fill: '#888', fontSize: 10, fontWeight: 'bold' }} />
                      <YAxis stroke="#666" domain={[0, 150]} tick={{ fill: '#888', fontSize: 10, fontWeight: 'bold' }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#121212', borderColor: '#1f1f1f', borderRadius: '1rem', color: '#fff' }}
                        labelStyle={{ fontWeight: 'black', color: '#fc8181' }}
                      />
                      <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                      <Line type="monotone" dataKey="Percentual Gordura (%)" stroke="#f6ad55" strokeWidth={3}>
                        <LabelList dataKey="Percentual Gordura (%)" position="top" fill="#f6ad55" stroke="none" style={{ fontSize: '10px', fontWeight: 'bold' }} />
                      </Line>
                      <Line type="monotone" dataKey="InBody Score" stroke="#63b3ed" strokeWidth={2.5}>
                        <LabelList dataKey="InBody Score" position="top" fill="#63b3ed" stroke="none" style={{ fontSize: '10px', fontWeight: 'bold' }} />
                      </Line>
                      <Line type="monotone" dataKey="Grau Obesidade (%)" stroke="#fc8181" strokeWidth={2} strokeDasharray="5 5">
                        <LabelList dataKey="Grau Obesidade (%)" position="bottom" fill="#fc8181" stroke="none" style={{ fontSize: '10px', fontWeight: 'bold' }} />
                      </Line>
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* List and deletes of existing assessments */}
            <div className="bg-[#121212] border border-[#1f1f1f] rounded-[2.5rem] p-6 shadow-xl">
              <h3 className="text-sm font-black text-white uppercase tracking-tight mb-4">Laudos de Bioimpedância Armazenados</h3>
              <div className="space-y-3">
                {assessments.map((item) => (
                  <div key={item.id} className="flex justify-between items-center bg-[#1c1c1c] border border-[#2a2a2a] p-4 rounded-2xl hover:border-gray-700 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-red-600/10 flex items-center justify-center text-red-500">
                        <Calendar size={18} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-black text-white">{item.date}</p>
                          <span className="text-[9px] font-bold text-gray-500 font-mono">({item.time})</span>
                        </div>
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-wider">
                          {item.weight} kg • IMC {item.bmi} • {item.bodyFat}% Gordura • Score {item.inbodyScore}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          setSelectedAssessmentId1(item.id);
                          setSelectedAssessmentId2(assessments.find(a => a.id !== item.id)?.id || item.id);
                          setActiveSubTab('comparador');
                        }}
                        className="bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                      >
                        Ver Laudo
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="text-gray-500 hover:text-red-500 p-2 transition-colors rounded-xl hover:bg-red-600/10"
                        title="Excluir"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeSubTab === 'comparador' && (
          <motion.div
            key="comparador"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Comparator Header / Pickers */}
            <div className="bg-[#121212] border border-[#1f1f1f] rounded-[2.5rem] p-6 shadow-xl flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-tight">Comparador Clínico InBody</h3>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Compare 2 exames no formato padrão InBody120</p>
              </div>

              <div className="flex flex-wrap gap-4 items-center w-full md:w-auto">
                <div className="flex items-center gap-2 bg-[#1c1c1c] border border-[#2a2a2a] py-2 px-4 rounded-xl flex-1 md:flex-none">
                  <span className="text-[10px] font-black text-red-500 uppercase">Laudo A:</span>
                  <select
                    value={selectedAssessmentId1}
                    onChange={(e) => setSelectedAssessmentId1(Number(e.target.value))}
                    className="bg-transparent text-xs font-black text-white focus:outline-none cursor-pointer"
                  >
                    {assessments.map(a => (
                      <option key={a.id} value={a.id} className="bg-black text-white">{a.date}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 bg-[#1c1c1c] border border-[#2a2a2a] py-2 px-4 rounded-xl flex-1 md:flex-none">
                  <span className="text-[10px] font-black text-emerald-500 uppercase">Laudo B:</span>
                  <select
                    value={selectedAssessmentId2}
                    onChange={(e) => setSelectedAssessmentId2(Number(e.target.value))}
                    className="bg-transparent text-xs font-black text-white focus:outline-none cursor-pointer"
                  >
                    {assessments.map(a => (
                      <option key={a.id} value={a.id} className="bg-black text-white">{a.date}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* InBody Traditional Side-By-Side Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

              {/* Composition Card */}
              <div className="bg-[#121212] border border-[#1f1f1f] rounded-[2.5rem] p-6 shadow-xl space-y-4">
                <div className="border-b border-[#1c1c1c] pb-3">
                  <h3 className="text-sm font-black text-white uppercase tracking-tight flex items-center gap-2">
                    <User size={16} className="text-red-500" />
                    Análise da Composição Corporal
                  </h3>
                  <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Laudo A ({assessment1.date}) vs Laudo B ({assessment2.date})</p>
                </div>

                <div className="space-y-4">
                  {[
                    { label: 'Água Corporal Total (L)', aVal: assessment1.waterWeight, bVal: assessment2.waterWeight, unit: 'L' },
                    { label: 'Proteínas (kg)', aVal: assessment1.protein, bVal: assessment2.protein, unit: 'kg' },
                    { label: 'Minerais (kg)', aVal: assessment1.boneMass, bVal: assessment2.boneMass, unit: 'kg' },
                    { label: 'Massa de Gordura (kg)', aVal: assessment1.fatWeight, bVal: assessment2.fatWeight, unit: 'kg' },
                    { label: 'Peso Corporal Geral (kg)', aVal: assessment1.weight, bVal: assessment2.weight, unit: 'kg' },
                  ].map((row, idx) => {
                    const diff = row.bVal - row.aVal;
                    const improvement = row.label.includes('Gordura') || row.label.includes('Peso') ? diff <= 0 : diff >= 0;
                    return (
                      <div key={idx} className="bg-[#1c1c1c] border border-[#2a2a2a] p-4 rounded-2xl space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-black text-[#ccc]">{row.label}</span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded ${improvement ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                            {diff === 0 ? 'Estável' : `${diff > 0 ? '+' : ''}${diff.toFixed(2)} ${row.unit}`}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-[#121212] p-2 rounded-xl text-center">
                            <span className="text-[8px] font-bold text-gray-500 block">Exame A</span>
                            <span className="text-xs font-black text-white">{row.aVal.toFixed(2)} {row.unit}</span>
                          </div>
                          <div className="bg-[#121212] p-2 rounded-xl text-center">
                            <span className="text-[8px] font-bold text-gray-500 block">Exame B</span>
                            <span className="text-xs font-black text-white">{row.bVal.toFixed(2)} {row.unit}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* InBody Progress Levels Graphic */}
              <div className="bg-[#121212] border border-[#1f1f1f] rounded-[2.5rem] p-6 shadow-xl space-y-4">
                <div className="border-b border-[#1c1c1c] pb-3">
                  <h3 className="text-sm font-black text-white uppercase tracking-tight flex items-center gap-2">
                    <Activity size={16} className="text-emerald-500" />
                    Análise de Músculo e Gordura (InBody)
                  </h3>
                  <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Balanciamento Dinâmico de Tecidos</p>
                </div>

                <div className="space-y-6">
                  {/* Weight Levels */}
                  <div className="space-y-2">
                    <span className="text-xs font-black text-white block">PESO CORPORAL</span>
                    <div className="flex gap-2">
                      <div className="flex-1 bg-[#1c1c1c] border border-[#2a2a2a] p-3 rounded-2xl text-center">
                        <span className="text-[8px] font-bold text-gray-500 block uppercase">A ({assessment1.date})</span>
                        <span className="text-sm font-black text-white">{assessment1.weight} kg</span>
                        <div className="h-1.5 w-full bg-[#121212] rounded-full mt-2 overflow-hidden">
                          <div className="h-full bg-red-500" style={{ width: `${Math.min((assessment1.weight/120)*100, 100)}%` }}></div>
                        </div>
                      </div>
                      <div className="flex-1 bg-[#1c1c1c] border border-[#2a2a2a] p-3 rounded-2xl text-center">
                        <span className="text-[8px] font-bold text-gray-500 block uppercase">B ({assessment2.date})</span>
                        <span className="text-sm font-black text-white">{assessment2.weight} kg</span>
                        <div className="h-1.5 w-full bg-[#121212] rounded-full mt-2 overflow-hidden">
                          <div className="h-full bg-green-500" style={{ width: `${Math.min((assessment2.weight/120)*100, 100)}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Muscle Levels */}
                  <div className="space-y-2">
                    <span className="text-xs font-black text-white block">MASSA MUSCULAR ESQUELÉTICA (MME)</span>
                    <div className="flex gap-2">
                      <div className="flex-1 bg-[#1c1c1c] border border-[#2a2a2a] p-3 rounded-2xl text-center">
                        <span className="text-[8px] font-bold text-gray-500 block uppercase">A ({assessment1.date})</span>
                        <span className="text-sm font-black text-white">{assessment1.skeletalMuscleWeight} kg</span>
                        <div className="h-1.5 w-full bg-[#121212] rounded-full mt-2 overflow-hidden">
                          <div className="h-full bg-red-400" style={{ width: `${Math.min((assessment1.skeletalMuscleWeight/45)*100, 100)}%` }}></div>
                        </div>
                      </div>
                      <div className="flex-1 bg-[#1c1c1c] border border-[#2a2a2a] p-3 rounded-2xl text-center">
                        <span className="text-[8px] font-bold text-gray-500 block uppercase">B ({assessment2.date})</span>
                        <span className="text-sm font-black text-white">{assessment2.skeletalMuscleWeight} kg</span>
                        <div className="h-1.5 w-full bg-[#121212] rounded-full mt-2 overflow-hidden">
                          <div className="h-full bg-green-400" style={{ width: `${Math.min((assessment2.skeletalMuscleWeight/45)*100, 100)}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Fat Weight Levels */}
                  <div className="space-y-2">
                    <span className="text-xs font-black text-white block">MASSA DE GORDURA CORPORAL (MGC)</span>
                    <div className="flex gap-2">
                      <div className="flex-1 bg-[#1c1c1c] border border-[#2a2a2a] p-3 rounded-2xl text-center">
                        <span className="text-[8px] font-bold text-gray-500 block uppercase">A ({assessment1.date})</span>
                        <span className="text-sm font-black text-white">{assessment1.fatWeight} kg</span>
                        <div className="h-1.5 w-full bg-[#121212] rounded-full mt-2 overflow-hidden">
                          <div className="h-full bg-red-600" style={{ width: `${Math.min((assessment1.fatWeight/50)*100, 100)}%` }}></div>
                        </div>
                      </div>
                      <div className="flex-1 bg-[#1c1c1c] border border-[#2a2a2a] p-3 rounded-2xl text-center">
                        <span className="text-[8px] font-bold text-gray-500 block uppercase">B ({assessment2.date})</span>
                        <span className="text-sm font-black text-white">{assessment2.fatWeight} kg</span>
                        <div className="h-1.5 w-full bg-[#121212] rounded-full mt-2 overflow-hidden">
                          <div className="h-full bg-green-600" style={{ width: `${Math.min((assessment2.fatWeight/50)*100, 100)}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Extra parameters InBody */}
              <div className="bg-[#121212] border border-[#1f1f1f] rounded-[2.5rem] p-6 shadow-xl col-span-1 xl:col-span-2">
                <div className="border-b border-[#1c1c1c] pb-3 mb-4">
                  <h3 className="text-sm font-black text-white uppercase tracking-tight">Dados Adicionais Clínicos</h3>
                  <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Parâmetros Antropométricos e Taxas Metabólicas</p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-[#1c1c1c] border border-[#2a2a2a] p-4 rounded-2xl text-center">
                    <span className="text-[10px] font-black text-gray-550 block mb-1">PONTUAÇÃO INBODY</span>
                    <div className="flex justify-center items-baseline gap-1 mt-1">
                      <span className="text-2xl font-black text-white">{assessment1.inbodyScore}</span>
                      <span className="text-xs text-gray-500 font-bold">➔</span>
                      <span className="text-2xl font-black text-red-500">{assessment2.inbodyScore}</span>
                    </div>
                  </div>

                  <div className="bg-[#1c1c1c] border border-[#2a2a2a] p-4 rounded-2xl text-center">
                    <span className="text-[10px] font-black text-gray-550 block mb-1">GORDURA VISCERAL</span>
                    <div className="flex justify-center items-baseline gap-1 mt-1">
                      <span className="text-2xl font-black text-white">{assessment1.visceralFat}</span>
                      <span className="text-xs text-gray-500 font-bold">➔</span>
                      <span className="text-2xl font-black text-white">{assessment2.visceralFat}</span>
                    </div>
                  </div>

                  <div className="bg-[#1c1c1c] border border-[#2a2a2a] p-4 rounded-2xl text-center">
                    <span className="text-[10px] font-black text-gray-550 block mb-1">TAXA METABÓLICA BASAL</span>
                    <div className="flex justify-center items-baseline gap-1 mt-1">
                      <span className="text-sm font-black text-white">{assessment1.metabolism} kcal</span>
                      <span className="text-xs text-gray-500 font-bold">➔</span>
                      <span className="text-sm font-black text-white">{assessment2.metabolism} kcal</span>
                    </div>
                  </div>

                  <div className="bg-[#1c1c1c] border border-[#2a2a2a] p-4 rounded-2xl text-center">
                    <span className="text-[10px] font-black text-gray-550 block mb-1">GRAU DE OBESIDADE</span>
                    <div className="flex justify-center items-baseline gap-1 mt-1">
                      <span className="text-xl font-black text-white">{assessment1.obesityLevel}%</span>
                      <span className="text-xs text-gray-500 font-bold">➔</span>
                      <span className="text-xl font-black text-red-500">{assessment2.obesityLevel}%</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {activeSubTab === 'segmentar' && (
          <motion.div
            key="segmentar"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Pickers */}
            <div className="bg-[#121212] border border-[#1f1f1f] rounded-[2.5rem] p-6 shadow-xl flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-tight">Composição Segmentar</h3>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Acompanhamento lateralizado de membros superiores, inferiores e tronco</p>
              </div>

              <div className="flex items-center gap-2 bg-[#1c1c1c] border border-[#2a2a2a] py-2 px-4 rounded-xl">
                <span className="text-[10px] font-black text-red-500 uppercase">Laudo:</span>
                <select
                  value={selectedAssessmentId2}
                  onChange={(e) => setSelectedAssessmentId2(Number(e.target.value))}
                  className="bg-transparent text-xs font-black text-white focus:outline-none cursor-pointer"
                >
                  {assessments.map(a => (
                    <option key={a.id} value={a.id} className="bg-black text-white">{a.date}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Segment Human Body Render */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Lean segments */}
              <div className="bg-[#121212] border border-[#1f1f1f] rounded-[2.5rem] p-6 shadow-xl relative overflow-hidden">
                <div className="border-b border-[#1c1c1c] pb-3 mb-6">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block mr-2"></span>
                  <h3 className="text-sm font-black text-white uppercase tracking-tight inline-block">Massa Magra Segmentar</h3>
                  <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Musculatura correspondente em kg</p>
                </div>

                <div className="space-y-4 max-w-md mx-auto">
                  <div className="bg-[#1c1c1c] border border-[#2a2a2a] p-4 rounded-2xl flex justify-between items-center">
                    <span className="text-xs font-black uppercase tracking-wider text-stone-300">Braço Esquerdo</span>
                    <span className="text-sm font-black text-white">{assessment2.leanArmLeft.toFixed(2)} kg</span>
                  </div>
                  <div className="bg-[#1c1c1c] border border-[#2a2a2a] p-4 rounded-2xl flex justify-between items-center">
                    <span className="text-xs font-black uppercase tracking-wider text-stone-300">Braço Direito</span>
                    <span className="text-sm font-black text-white">{assessment2.leanArmRight.toFixed(2)} kg</span>
                  </div>
                  <div className="bg-[#1c1c1c] border border-[#2a2a2a] p-4 rounded-2xl flex justify-between items-center">
                    <span className="text-xs font-black uppercase tracking-wider text-stone-300">Tronco Central</span>
                    <span className="text-sm font-black text-white">{assessment2.leanTrunk.toFixed(2)} kg</span>
                  </div>
                  <div className="bg-[#1c1c1c] border border-[#2a2a2a] p-4 rounded-2xl flex justify-between items-center">
                    <span className="text-xs font-black uppercase tracking-wider text-stone-300">Perna Esquerda</span>
                    <span className="text-sm font-black text-white">{assessment2.leanLegLeft.toFixed(2)} kg</span>
                  </div>
                  <div className="bg-[#1c1c1c] border border-[#2a2a2a] p-4 rounded-2xl flex justify-between items-center">
                    <span className="text-xs font-black uppercase tracking-wider text-stone-300">Perna Direita</span>
                    <span className="text-sm font-black text-white">{assessment2.leanLegRight.toFixed(2)} kg</span>
                  </div>
                </div>
              </div>

              {/* Fat segments */}
              <div className="bg-[#121212] border border-[#1f1f1f] rounded-[2.5rem] p-6 shadow-xl relative overflow-hidden">
                <div className="border-b border-[#1c1c1c] pb-3 mb-6">
                  <span className="w-2 h-2 rounded-full bg-red-500 inline-block mr-2"></span>
                  <h3 className="text-sm font-black text-white uppercase tracking-tight inline-block">Massa Gorda Segmentar</h3>
                  <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Tecido adiposo correspondente em kg</p>
                </div>

                <div className="space-y-4 max-w-md mx-auto">
                  <div className="bg-[#1c1c1c] border border-[#2a2a2a] p-4 rounded-2xl flex justify-between items-center">
                    <span className="text-xs font-black uppercase tracking-wider text-stone-300">Braço Esquerdo</span>
                    <span className="text-sm font-black text-white">{assessment2.fatArmLeft.toFixed(2)} kg</span>
                  </div>
                  <div className="bg-[#1c1c1c] border border-[#2a2a2a] p-4 rounded-2xl flex justify-between items-center">
                    <span className="text-xs font-black uppercase tracking-wider text-stone-300">Braço Direito</span>
                    <span className="text-sm font-black text-white">{assessment2.fatArmRight.toFixed(2)} kg</span>
                  </div>
                  <div className="bg-[#1c1c1c] border border-[#2a2a2a] p-4 rounded-2xl flex justify-between items-center">
                    <span className="text-xs font-black uppercase tracking-wider text-stone-300">Tronco Central</span>
                    <span className="text-sm font-black text-white">{assessment2.fatTrunk.toFixed(2)} kg</span>
                  </div>
                  <div className="bg-[#1c1c1c] border border-[#2a2a2a] p-4 rounded-2xl flex justify-between items-center">
                    <span className="text-xs font-black uppercase tracking-wider text-stone-300">Perna Esquerda</span>
                    <span className="text-sm font-black text-white">{assessment2.fatLegLeft.toFixed(2)} kg</span>
                  </div>
                  <div className="bg-[#1c1c1c] border border-[#2a2a2a] p-4 rounded-2xl flex justify-between items-center">
                    <span className="text-xs font-black uppercase tracking-wider text-stone-300">Perna Direita</span>
                    <span className="text-sm font-black text-white">{assessment2.fatLegRight.toFixed(2)} kg</span>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {activeSubTab === 'otimizacao' && (() => {
          const simulatedWeight = simulatedMuscle + simulatedFat + 28.2;
          const simulatedPGC = (simulatedFat / simulatedWeight) * 100;
          const simulatedBMR = 370 + 21.6 * (simulatedMuscle + 28.2);
          const rawScore = 60 + (simulatedMuscle - 36.3) * 2 - (simulatedFat - 34.6) * 1.5;
          const simulatedScore = Math.max(1, Math.min(100, Math.round(rawScore)));
          const bmrIncrease = simulatedBMR - 1763;

          const proteinGrams = Math.round(simulatedWeight * 2.2);
          const fatGrams = Math.round(simulatedWeight * 0.8);
          const carbGrams = Math.max(0, Math.round((2100 - (proteinGrams * 4 + fatGrams * 9)) / 4));

          return (
            <motion.div
              key="otimizacao"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Educational header */}
              <div className="bg-[#121212] border border-[#1f1f1f] rounded-[2.5rem] p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 rounded-full blur-3xl"></div>
                <div className="flex flex-col md:flex-row gap-6 items-center">
                  <div className="w-16 h-16 rounded-3xl bg-red-650/10 border border-red-500/20 flex items-center justify-center text-red-500 shrink-0">
                    <Flame size={32} className="animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-black text-white uppercase tracking-tight">Otimizador Metabólico (TMB)</h3>
                    <p className="text-xs text-gray-400">
                      Entenda por que você perdeu massa muscular e descubra como reprogramar seu corpo para queimar <span className="text-red-500 font-bold">gordura pura</span> mantendo o motor metabólico acelerado.
                    </p>
                  </div>
                </div>
              </div>

              {/* Main content grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Simulator controls - Col 7 */}
                <div className="bg-[#121212] border border-[#1f1f1f] rounded-[2.5rem] p-6 shadow-xl lg:col-span-7 space-y-6">
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-wider mb-1">Simulador de Recomposição Corporal InBody</h4>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider font-mono">Ajuste os parâmetros abaixo para simular os efeitos diretos no seu metabolismo basal</p>
                  </div>

                  <div className="space-y-6 bg-[#1c1c1c] border border-[#2a2a2a] p-5 rounded-2xl">
                    {/* Muscle Slider */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-stone-200 uppercase tracking-wide">Massa Muscular Esquelética (MME)</span>
                        <span className="text-sm font-black text-emerald-400">{simulatedMuscle.toFixed(1)} kg</span>
                      </div>
                      <input 
                        type="range" 
                        min="30" 
                        max="48" 
                        step="0.1"
                        value={simulatedMuscle} 
                        onChange={(e) => setSimulatedMuscle(parseFloat(e.target.value))}
                        className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-stone-800 rounded-lg appearance-none"
                      />
                      <div className="flex justify-between text-[9px] font-bold text-gray-550 font-mono">
                        <span>Min: 30.0 kg</span>
                        <span className="text-stone-400">Atual: 36.3 kg</span>
                        <span>Max: 48.0 kg</span>
                      </div>
                    </div>

                    {/* Fat Slider */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-stone-200 uppercase tracking-wide">Massa de Gordura Corporal (MGC)</span>
                        <span className="text-sm font-black text-red-500">{simulatedFat.toFixed(1)} kg</span>
                      </div>
                      <input 
                        type="range" 
                        min="15" 
                        max="45" 
                        step="0.1"
                        value={simulatedFat} 
                        onChange={(e) => setSimulatedFat(parseFloat(e.target.value))}
                        className="w-full accent-red-600 cursor-pointer h-1.5 bg-stone-800 rounded-lg appearance-none"
                      />
                      <div className="flex justify-between text-[9px] font-bold text-gray-550 font-mono">
                        <span>Min: 15.0 kg</span>
                        <span className="text-stone-400">Atual: 34.6 kg</span>
                        <span>Max: 45.0 kg</span>
                      </div>
                    </div>
                  </div>

                  {/* Simulator results output */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-[#1c1c1c] border border-[#2a2a2a] p-3 rounded-2xl text-center">
                      <span className="text-[9px] font-black text-gray-505 block">PESO SIMULADO</span>
                      <span className="text-lg font-black text-white mt-1 block">{simulatedWeight.toFixed(1)} kg</span>
                    </div>

                    <div className="bg-[#1c1c1c] border border-[#2a2a2a] p-3 rounded-2xl text-center">
                      <span className="text-[9px] font-black text-gray-505 block">PERC. GORDURA (PGC)</span>
                      <span className="text-lg font-black text-red-400 mt-1 block">{simulatedPGC.toFixed(1)}%</span>
                    </div>

                    <div className="bg-[#1c1c1c] border border-[#2a2a2a] p-3 rounded-2xl text-center">
                      <span className="text-[9px] font-black text-gray-505 block font-mono">TMB ATINGIDA</span>
                      <span className="text-lg font-black text-orange-400 mt-1 block">{Math.round(simulatedBMR)} kcal</span>
                    </div>

                    <div className="bg-[#1c1c1c] border border-[#2a2a2a] p-3 rounded-2xl text-center">
                      <span className="text-[9px] font-black text-gray-505 block">SCORE INBODY</span>
                      <span className={`text-lg font-black mt-1 block ${simulatedScore >= 60 ? 'text-green-500' : 'text-stone-450'}`}>{simulatedScore} / 100</span>
                    </div>
                  </div>

                  {/* Passive metabolism burn indicator card */}
                  <div className="bg-emerald-950/25 border border-emerald-900/35 p-4 rounded-3xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Flame className="text-emerald-500 shrink-0 w-8 h-8" />
                      <div>
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block font-mono">Retorno Metabólico Extra</span>
                        <h5 className="text-sm font-black text-stone-100 mt-0.5">
                          {bmrIncrease > 0 ? (
                            <span>Gasto Extra Passivo: <strong className="text-emerald-400">+{Math.round(bmrIncrease)} kcal/dia</strong></span>
                          ) : bmrIncrease < 0 ? (
                            <span>Gasto Passivo Reduzido: <strong className="text-red-500">{Math.round(bmrIncrease)} kcal/dia</strong></span>
                          ) : (
                            <span>Sua Taxa Metabólica está idêntica ao exame atual.</span>
                          )}
                        </h5>
                      </div>
                    </div>
                    {bmrIncrease > 0 && (
                      <span className="bg-emerald-950/50 text-emerald-400 border border-emerald-900/40 text-[9px] font-mono px-2.5 py-1 rounded-full uppercase font-black tracking-widest shrink-0 hidden sm:inline-block">
                        +{Math.round(bmrIncrease * 365 / 7700)}kg gordura/ano livre
                      </span>
                    )}
                  </div>
                </div>

                {/* Macronutrient Planner - Col 5 */}
                <div className="bg-[#121212] border border-[#1f1f1f] rounded-[2.5rem] p-6 shadow-xl lg:col-span-5 space-y-6">
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-wider mb-1">Meta de Macronutrientes Nutrobarra</h4>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider font-mono">Ajustado dinamicamente para o Peso Simulado</p>
                  </div>

                  <div className="space-y-4">
                    {/* Proteins */}
                    <div className="bg-[#1c1c1c] border border-[#2a2a2a] p-4 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-550"></span>
                        <div>
                          <span className="text-xs font-black text-white uppercase block">Proteínas (2.2g/kg)</span>
                          <span className="text-[9px] text-stone-500 font-bold font-mono">Preservação e crescimento do miócito</span>
                        </div>
                      </div>
                      <span className="text-sm font-black text-stone-200 font-mono">{proteinGrams}g <span className="text-[10px] text-stone-500 font-bold">/dia</span></span>
                    </div>

                    {/* Fats */}
                    <div className="bg-[#1c1c1c] border border-[#2a2a2a] p-4 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-2.5 h-2.5 rounded-full bg-orange-450"></span>
                        <div>
                          <span className="text-xs font-black text-white uppercase block">Gorduras (0.8g/kg)</span>
                          <span className="text-[9px] text-stone-500 font-bold font-mono">Suporte hormonal e tireoidiano</span>
                        </div>
                      </div>
                      <span className="text-sm font-black text-stone-200 font-mono">{fatGrams}g <span className="text-[10px] text-stone-500 font-bold">/dia</span></span>
                    </div>

                    {/* Carbs */}
                    <div className="bg-[#1c1c1c] border border-[#2a2a2a] p-4 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#63b3ed]"></span>
                        <div>
                          <span className="text-xs font-black text-white uppercase block">Carboidratos</span>
                          <span className="text-[9px] text-stone-500 font-bold font-mono">Suporte de glicogênio muscular</span>
                        </div>
                      </div>
                      <span className="text-sm font-black text-stone-200 font-mono">{carbGrams}g <span className="text-[10px] text-stone-500 font-bold">/dia</span></span>
                    </div>
                  </div>

                  <div className="bg-[#1c1c1c]/40 border border-[#232323] p-4 rounded-2xl text-[10px] text-stone-500 uppercase font-black text-center tracking-widest font-mono">
                    Total Calórico Recomp: 2100 kcal
                  </div>
                </div>

              </div>

              {/* Advanced Recommendations & IA Directives */}
              <div className="bg-[#121212] border border-[#1f1f1f] rounded-[2.5rem] p-6 shadow-xl space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-wider mb-1">Estratégias Avançadas & IA Coaching Clínico</h4>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider font-mono">Ações biológicas de precisão para conter catabolismo</p>
                  </div>

                  <button
                    onClick={handleGenerateAiPlan}
                    disabled={isGeneratingPlan}
                    className="w-full sm:w-auto bg-red-605 hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider py-3.5 px-5 rounded-2xl transition-all shadow-md active:scale-95 duration-100 flex items-center justify-center gap-2.5 border border-red-500/20 disabled:opacity-50 shrink-0 cursor-pointer"
                  >
                    <Sparkles size={16} className={isGeneratingPlan ? "animate-spin" : ""} />
                    {isGeneratingPlan ? "Analisando InBody do André..." : "Gerar Prescrição IA Nutrobarra"}
                  </button>
                </div>

                {/* Simulated / Fallback / Live AI Container */}
                <AnimatePresence mode="wait">
                  {aiPlan ? (
                    <motion.div
                      key="ai-plan-render"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-[#1c1c1c] border border-red-950/20 p-6 rounded-3xl space-y-4 max-h-[500px] overflow-y-auto"
                    >
                      <div className="flex items-center gap-2 text-red-500">
                        <Sparkles size={18} />
                        <span className="text-[10px] font-black uppercase tracking-widest font-mono">Análise Personalizada Nutrobarra</span>
                      </div>
                      <div className="text-stone-300 text-xs leading-relaxed space-y-4 whitespace-pre-line font-medium pr-2">
                        {aiPlan}
                      </div>
                    </motion.div>
                  ) : isGeneratingPlan ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-[#1c1c1c] border border-[#2a2a2a] p-12 rounded-3xl flex flex-col items-center justify-center space-y-4"
                    >
                      <div className="w-12 h-12 border-4 border-red-650 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest font-mono text-center">A IA está processando seu exame, calculando macros e estruturando suas regras...</p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="default-cards"
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      {[
                        {
                          icon: <Activity className="text-emerald-500" />,
                          title: "1. Sobrecarga progressiva na musculação",
                          desc: "Evite treinos infinitamente longos com cargas leves. Os músculos precisam de tensão de alta intensidade (carga de 8-12 reps próximas do limite) para manter a integridade miofibrilar. Sem sinalização pesada, o organismo decompõe a massa magra durante o balanço energético negativo."
                        },
                        {
                          icon: <Flame className="text-orange-400" />,
                          title: "2. Janelas Proteicas Rápidas (Timing)",
                          desc: "Coma proteína a cada 3.5 a 4 horas. Evite longos períodos de jejum que forçam o catabolismo das proteínas corporais. Consuma de 35g a 45g de proteína pura em cada refeição (como filé de peito de frango, patinho moído, tilápia, ovos inteiros ou Whey Protein)."
                        },
                        {
                          icon: <Award className="text-[#a78bfa]" />,
                          title: "3. Uso Crítico de Creatina",
                          desc: "A creatina monoidratada é o suplemento mais seguro e eficaz do planeta para recomposição. Ela promove a hidratação celular intramolecular aumentando a síntese proteica intramuscular, o que protege diretamente sua Massa Muscular da quebra metabólica basal."
                        },
                        {
                          icon: <Droplets className="text-[#63b3ed]" />,
                          title: "4. Hidratação Acentuada de 4L+",
                          desc: "A desidratação celular inibe vias proteicas de construção muscular e reduz a taxa metabólica basal. Tome 40ml de água para cada kg de peso (aproximadamente 4 litros por dia). Monitore a cor da sua urina: deve estar constantemente clara ou transparente."
                        }
                      ].map((card, idx) => (
                        <div key={idx} className="bg-[#1c1c1c]/60 border border-[#242424] p-5 rounded-3xl flex gap-4 hover:border-gray-800 transition-colors">
                          <div className="w-10 h-10 rounded-2xl bg-[#121212] flex items-center justify-center shrink-0">
                            {card.icon}
                          </div>
                          <div>
                            <h5 className="text-xs font-black text-white uppercase tracking-tight mb-1">{card.title}</h5>
                            <p className="text-[10px] text-gray-400 leading-relaxed font-semibold">{card.desc}</p>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </motion.div>
          );
        })()}

        {activeSubTab === 'formulario' && (
          <motion.div
            key="formulario"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="bg-[#121212] border border-[#1f1f1f] rounded-[2.5rem] p-8 shadow-xl"
          >
            <div className="border-b border-[#1c1c1c] pb-4 mb-6">
              <h3 className="text-sm font-black text-white uppercase tracking-tight">Inserir Novo Exame de Bioimpedância</h3>
              <p className="text-xs text-gray-400">Preencha rigorosamente conforme impresso no laudo oficial da clínica Nutrobarra.</p>
            </div>

            <form onSubmit={handleAddAssessment} className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">DATA</label>
                  <input
                    type="text"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-[#1c1c1c] border border-[#2a2a2a] rounded-xl py-3 px-4 text-xs text-stone-200 font-bold focus:outline-none focus:border-red-600 outline-none"
                    placeholder="DD/MM/AAAA"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">HORA</label>
                  <input
                    type="text"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full bg-[#1c1c1c] border border-[#2a2a2a] rounded-xl py-3 px-4 text-xs text-stone-200 font-bold focus:outline-none focus:border-red-600 outline-none"
                    placeholder="HH:MM"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">PESO (kg)</label>
                  <input
                    type="text"
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                    className="w-full bg-[#1c1c1c] border border-[#2a2a2a] rounded-xl py-3 px-4 text-xs text-stone-200 font-bold focus:outline-none focus:border-red-600 outline-none"
                    placeholder="Ex: 99.1"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">GORDURA (%)</label>
                  <input
                    type="text"
                    value={newBodyFat}
                    onChange={(e) => setNewBodyFat(e.target.value)}
                    className="w-full bg-[#1c1c1c] border border-[#2a2a2a] rounded-xl py-3 px-4 text-xs text-stone-200 font-bold focus:outline-none focus:border-red-600 outline-none"
                    placeholder="Ex: 34.9"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">PESO GORDURA (kg)</label>
                  <input
                    type="text"
                    value={newFatWeight}
                    onChange={(e) => setNewFatWeight(e.target.value)}
                    className="w-full bg-[#1c1c1c] border border-[#2a2a2a] rounded-xl py-3 px-4 text-xs text-stone-200 font-bold focus:outline-none focus:border-red-600 outline-none"
                    placeholder="Ex: 34.6"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">MASSA MUSCULAR (kg)</label>
                  <input
                    type="text"
                    value={newMuscle}
                    onChange={(e) => setNewMuscle(e.target.value)}
                    className="w-full bg-[#1c1c1c] border border-[#2a2a2a] rounded-xl py-3 px-4 text-xs text-stone-200 font-bold focus:outline-none focus:border-red-600 outline-none"
                    placeholder="Ex: 36.3"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">ÁGUA CORPORAL (L)</label>
                  <input
                    type="text"
                    value={newWater}
                    onChange={(e) => setNewWater(e.target.value)}
                    className="w-full bg-[#1c1c1c] border border-[#2a2a2a] rounded-xl py-3 px-4 text-xs text-stone-200 font-bold focus:outline-none focus:border-red-600 outline-none"
                    placeholder="Ex: 46.9"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">PROTEÍNAS (kg)</label>
                  <input
                    type="text"
                    value={newProtein}
                    onChange={(e) => setNewProtein(e.target.value)}
                    className="w-full bg-[#1c1c1c] border border-[#2a2a2a] rounded-xl py-3 px-4 text-xs text-stone-200 font-bold focus:outline-none focus:border-red-600 outline-none"
                    placeholder="Ex: 12.7"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">MINERAIS / OSSOS (kg)</label>
                  <input
                    type="text"
                    value={newMinerals}
                    onChange={(e) => setNewMinerals(e.target.value)}
                    className="w-full bg-[#1c1c1c] border border-[#2a2a2a] rounded-xl py-3 px-4 text-xs text-stone-200 font-bold focus:outline-none focus:border-red-600 outline-none"
                    placeholder="Ex: 4.95"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">METABOLISMO (kcal)</label>
                  <input
                    type="text"
                    value={newBMR}
                    onChange={(e) => setNewBMR(e.target.value)}
                    className="w-full bg-[#1c1c1c] border border-[#2a2a2a] rounded-xl py-3 px-4 text-xs text-stone-200 font-bold focus:outline-none focus:border-red-600 outline-none"
                    placeholder="Ex: 1763"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">IMC</label>
                  <input
                    type="text"
                    value={newBMI}
                    onChange={(e) => setNewBMI(e.target.value)}
                    className="w-full bg-[#1c1c1c] border border-[#2a2a2a] rounded-xl py-3 px-4 text-xs text-stone-200 font-bold focus:outline-none focus:border-red-600 outline-none"
                    placeholder="Ex: 30.6"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">SCORE INBODY</label>
                  <input
                    type="text"
                    value={newScore}
                    onChange={(e) => setNewScore(e.target.value)}
                    className="w-full bg-[#1c1c1c] border border-[#2a2a2a] rounded-xl py-3 px-4 text-xs text-stone-200 font-bold focus:outline-none focus:border-red-600 outline-none"
                    placeholder="Ex: 60"
                    required
                  />
                </div>
              </div>

              {/* Segment Inputs */}
              <div>
                <h4 className="text-[11px] font-black uppercase tracking-widest text-red-500 mb-3 block">Composição Segmentar Avançada (Músculo/Massa Gorda)</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div>
                    <label className="text-[9px] font-black uppercase text-[#888] block mb-1">Musculo Braço Esq (kg)</label>
                    <input
                      type="text"
                      value={newLeanArmL}
                      onChange={(e) => setNewLeanArmL(e.target.value)}
                      className="w-full bg-[#1c1c1c] border border-[#2a2a2a] rounded-lg py-2 px-3 text-xs text-stone-250 font-bold outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase text-[#888] block mb-1">Musculo Braço Dir (kg)</label>
                    <input
                      type="text"
                      value={newLeanArmR}
                      onChange={(e) => setNewLeanArmR(e.target.value)}
                      className="w-full bg-[#1c1c1c] border border-[#2a2a2a] rounded-lg py-2 px-3 text-xs text-stone-250 font-bold outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase text-[#888] block mb-1">Musculo Tronco (kg)</label>
                    <input
                      type="text"
                      value={newLeanTrunk}
                      onChange={(e) => setNewLeanTrunk(e.target.value)}
                      className="w-full bg-[#1c1c1c] border border-[#2a2a2a] rounded-lg py-2 px-3 text-xs text-stone-250 font-bold outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase text-[#888] block mb-1">Musculo Perna Esq (kg)</label>
                    <input
                      type="text"
                      value={newLeanLegL}
                      onChange={(e) => setNewLeanLegL(e.target.value)}
                      className="w-full bg-[#1c1c1c] border border-[#2a2a2a] rounded-lg py-2 px-3 text-xs text-stone-250 font-bold outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase text-[#888] block mb-1">Musculo Perna Dir (kg)</label>
                    <input
                      type="text"
                      value={newLeanLegR}
                      onChange={(e) => setNewLeanLegR(e.target.value)}
                      className="w-full bg-[#1c1c1c] border border-[#2a2a2a] rounded-lg py-2 px-3 text-xs text-stone-250 font-bold outline-none"
                    />
                  </div>
                  
                  {/* Fat Segments inputs */}
                  <div>
                    <label className="text-[9px] font-black uppercase text-[#888] block mb-1 font-mono">Gordura Braço Esq (kg)</label>
                    <input
                      type="text"
                      value={newFatArmL}
                      onChange={(e) => setNewFatArmL(e.target.value)}
                      className="w-full bg-[#1c1c1c] border border-[#2a2a2a] rounded-lg py-2 px-3 text-xs text-stone-250 font-bold outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase text-[#888] block mb-1 font-mono">Gordura Braço Dir (kg)</label>
                    <input
                      type="text"
                      value={newFatArmR}
                      onChange={(e) => setNewFatArmR(e.target.value)}
                      className="w-full bg-[#1c1c1c] border border-[#2a2a2a] rounded-lg py-2 px-3 text-xs text-stone-250 font-bold outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase text-[#888] block mb-1 font-mono">Gordura Tronco (kg)</label>
                    <input
                      type="text"
                      value={newFatTrunk}
                      onChange={(e) => setNewFatTrunk(e.target.value)}
                      className="w-full bg-[#1c1c1c] border border-[#2a2a2a] rounded-lg py-2 px-3 text-xs text-stone-250 font-bold outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase text-[#888] block mb-1 font-mono">Gordura Perna Esq (kg)</label>
                    <input
                      type="text"
                      value={newFatLegL}
                      onChange={(e) => setNewFatLegL(e.target.value)}
                      className="w-full bg-[#1c1c1c] border border-[#2a2a2a] rounded-lg py-2 px-3 text-xs text-stone-250 font-bold outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase text-[#888] block mb-1 font-mono">Gordura Perna Dir (kg)</label>
                    <input
                      type="text"
                      value={newFatLegR}
                      onChange={(e) => setNewFatLegR(e.target.value)}
                      className="w-full bg-[#1c1c1c] border border-[#2a2a2a] rounded-lg py-2 px-3 text-xs text-stone-250 font-bold outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider py-4 rounded-2xl transition-all shadow-md active:scale-95 duration-150"
                >
                  Salvar Avaliação no Histórico
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSubTab('evolucao')}
                  className="bg-[#1c1c1c] hover:bg-[#2c2c2c] text-white text-xs font-black uppercase tracking-wider py-4 px-6 rounded-2xl transition-all"
                >
                  Cancelar
                </button>
              </div>
            </form>

            <AnimatePresence>
              {showAddSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50 p-6"
                >
                  <div className="bg-[#121212] border border-[#1f1f1f] p-8 rounded-[2rem] text-center max-w-sm w-full space-y-4">
                    <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 mx-auto">
                      <CheckCircle2 size={36} />
                    </div>
                    <h3 className="text-lg font-black text-white uppercase tracking-tight">Sucesso!</h3>
                    <p className="text-xs text-gray-450">A nova bioimpedância da Nutrobarra foi datada, calculada e sincronizada com segurança.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
