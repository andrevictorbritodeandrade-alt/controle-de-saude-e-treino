import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Activity, Droplet, HeartPulse, ChevronDown, ChevronUp } from 'lucide-react';

interface BloodTest {
  id: string;
  date: string;
  metrics: Record<string, string | number>;
}

const BLOOD_TESTS: BloodTest[] = [
  {
    id: '4',
    date: '11/06/2026',
    metrics: {
      'Hemácias': 5.10,
      'Hemoglobina': 16.0,
      'Hematócrito': 44.6,
      'VCM': 87.5,
      'HCM': 31.4,
      'CHCM': 35.9,
      'RDW': 12.7,
      'Leucócitos': 10740,
      'Basófilos': 0,
      'Eosinófilos': 215,
      'Bastões': 107,
      'Segmentados': 6874,
      'Linfócitos': 2470,
      'Monócitos': 1074,
      'Plaquetas': 378000,
      'VHS': 15,
      'HBA1C': 4.7,
      'Glicemia Média': 87.8,
      'Glicose': 80,
      'Vitamina D': 22.6,
      'Bilirrubina Total': 0.20,
      'Bilirrubina Direta': 0.10,
      'Bilirrubina Indireta': 0.10,
      'TGO': 18,
      'TGP': 13,
      'Colesterol Total': 184,
      'Triglicérides': 45,
      'HDL': 64,
      'VLDL': 9,
      'LDL': 111,
      'Ferro Sérico': 106,
      'Ferritina': 131,
      'SHBG': 48.9,
      'TSH': 3.49,
      'PSA Total': 0.19,
      'PSA Livre': 0.06,
      'Testosterona Livre': 5.869,
      'Testosterona Total': 376,
      'Estradiol': 10,
      'FSH': 5.3,
      'LH': 9.8,
      'Prolactina': 12.9,
      'Insulina': 29.1,
      'Cortisol Basal': 0.32,
      'Homocisteína': 8.77,
      'Vitamina B12': 1621
    }
  },
  {
    id: '3',
    date: '06/01/2026',
    metrics: {
      'Hemácias': 4.60,
      'Hemoglobina': 14.3,
      'Hematócrito': 42.4,
      'VCM': 92.2,
      'HCM': 31.1,
      'CHCM': 33.7,
      'RDW': 12.6,
      'Leucócitos': 6220,
      'Basófilos': 0,
      'Eosinófilos': 1,
      'Bastões': 1,
      'Segmentados': 63,
      'Linfócitos': 28,
      'Monócitos': 7,
      'Plaquetas': 353000,
      'HBA1C': 4.6,
      'Glicemia Média': 85,
      'Glicose': 100,
      'Vitamina D': 29.1,
      'Ferritina': 79.9,
      'Testosterona Total': 772,
      'LH': 6.7,
      'Prolactina': 7.31,
      'Insulina': 5.1,
      'Vitamina B12': 525
    }
  },
  {
    id: '2',
    date: '25/06/2025',
    metrics: {
      'Hemácias': 4.80,
      'Hemoglobina': 15.2,
      'Hematócrito': 43.7,
      'VCM': 91.0,
      'HCM': 31.7,
      'CHCM': 34.8,
      'RDW': 12.8,
      'Leucócitos': 7170,
      'Basófilos': 0,
      'Eosinófilos': 1,
      'Bastões': 1,
      'Segmentados': 53,
      'Linfócitos': 34,
      'Monócitos': 11,
      'Plaquetas': 290000,
      'HBA1C': 4.7,
      'Glicemia Média': 87.8,
      'Glicose': 76,
      'Vitamina D': 28.4,
      'Colesterol Total': 160,
      'Triglicérides': 49,
      'HDL': 63,
      'VLDL': 10,
      'LDL': 87,
      'Ferro Sérico': 129,
      'Ferritina': 121,
      'TSH': 2.75,
      'Insulina': 7.8
    }
  },
  {
    id: '1',
    date: '20/09/2024',
    metrics: {
      'Hemácias': 4.63,
      'Hemoglobina': 14.6,
      'Hematócrito': 43.2,
      'VCM': 93.3,
      'HCM': 31.5,
      'CHCM': 33.8,
      'RDW': 12.8,
      'Leucócitos': 7300,
      'Basófilos': 0,
      'Eosinófilos': 1,
      'Bastões': 1,
      'Segmentados': 61,
      'Linfócitos': 31,
      'Monócitos': 6,
      'Plaquetas': 297000,
      'HBA1C': 4.9,
      'Glicemia Média': 94,
      'Glicose': 80,
      'Vitamina D': 23.7,
      'TGO': 20,
      'TGP': 21,
      'Colesterol Total': 186,
      'Triglicérides': 69,
      'HDL': 54,
      'VLDL': 14,
      'LDL': 118,
      'Ferritina': 160,
      'TSH': 2.56,
      'Testosterona Total': 576.0,
      'LH': 12.6,
      'Prolactina': 11.70,
      'Insulina': 3.6,
      'Vitamina B12': 614
    }
  }
];

export const BloodExams: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>('Glicemia');

  const categories = [
    {
      name: 'Hemograma (Série Vermelha)',
      keys: ['Hemácias', 'Hemoglobina', 'Hematócrito', 'VCM', 'HCM', 'CHCM', 'RDW']
    },
    {
      name: 'Hemograma (Série Branca & Plaquetas)',
      keys: ['Leucócitos', 'Basófilos', 'Eosinófilos', 'Bastões', 'Segmentados', 'Linfócitos', 'Monócitos', 'Plaquetas']
    },
    {
      name: 'Glicemia',
      keys: ['Glicose', 'HBA1C', 'Glicemia Média', 'Insulina']
    },
    {
      name: 'Perfil Lipídico',
      keys: ['Colesterol Total', 'HDL', 'LDL', 'VLDL', 'Triglicérides']
    },
    {
      name: 'Hormônios',
      keys: ['Testosterona Total', 'Testosterona Livre', 'SHBG', 'Estradiol', 'TSH', 'FSH', 'LH', 'Prolactina', 'Cortisol Basal']
    },
    {
      name: 'Vitaminas e Minerais',
      keys: ['Vitamina D', 'Vitamina B12', 'Ferro Sérico', 'Ferritina']
    },
    {
      name: 'Outros (Fígado, Próstata, etc)',
      keys: ['TGO', 'TGP', 'Bilirrubina Total', 'Bilirrubina Direta', 'Bilirrubina Indireta', 'PSA Total', 'PSA Livre', 'Homocisteína', 'VHS']
    }
  ];

  const currentExam = BLOOD_TESTS[0];
  const previousExam = BLOOD_TESTS[1];

  if (!onClose) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6 pb-24 animate-in fade-in duration-300">
        <div className="bg-[#121212] rounded-[2rem] border border-[#1f1f1f] p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-500/20 rounded-lg text-red-500">
              <Droplet className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight font-montserrat">Exames de Sangue</h2>
          </div>
          <p className="text-gray-400 text-sm">
            Comparação detalhada do último exame ({currentExam.date}) com o anterior ({previousExam.date}).
          </p>
        </div>

        <div className="space-y-6">
          {categories.map(category => (
            <div key={category.name} className="bg-[#121212] rounded-[2rem] overflow-hidden border border-[#1f1f1f]">
              <button 
                onClick={() => setExpandedCategory(expandedCategory === category.name ? null : category.name)}
                className="w-full flex items-center justify-between p-6 bg-[#181818] hover:bg-[#1f1f1f] transition-colors text-left"
              >
                <h3 className="font-bold text-white uppercase tracking-wide text-sm">{category.name}</h3>
                {expandedCategory === category.name ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
              </button>
              
              {expandedCategory === category.name && (
                <div className="p-6">
                  <div className="grid grid-cols-3 text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 pb-2 border-b border-[#1f1f1f]">
                    <div>Métrica</div>
                    <div className="text-center">{currentExam.date}</div>
                    <div className="text-center">{previousExam.date}</div>
                  </div>
                  
                  <div className="space-y-4">
                    {category.keys.map(key => {
                      const curVal = currentExam.metrics[key] !== undefined ? currentExam.metrics[key] : '---';
                      const prevVal = previousExam.metrics[key] !== undefined ? previousExam.metrics[key] : '---';
                      
                      let curColor = "text-white";
                      if (curVal !== '---' && prevVal !== '---' && typeof curVal === 'number' && typeof prevVal === 'number') {
                        if (curVal > prevVal) curColor = "text-red-400";
                        if (curVal < prevVal) curColor = "text-green-400";
                        if (curVal === prevVal) curColor = "text-gray-300";
                      }
                      
                      return (
                        <div key={key} className="grid grid-cols-3 items-center py-1">
                          <div className="text-sm font-medium text-gray-300">{key}</div>
                          <div className={`text-center font-mono font-bold ${curColor}`}>
                            {curVal}
                          </div>
                          <div className="text-center font-mono text-gray-500">
                            {prevVal}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className="bg-[#121212] w-full max-w-4xl max-h-[90vh] rounded-[2rem] border border-[#1f1f1f] shadow-2xl flex flex-col overflow-hidden relative"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 border-b border-[#1f1f1f]">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-500/20 rounded-lg text-red-500">
              <Droplet className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight font-montserrat">Exames de Sangue</h2>
          </div>
          <p className="text-gray-400 text-sm">
            Comparação detalhada do último exame ({currentExam.date}) com o anterior ({previousExam.date}).
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {categories.map(category => (
            <div key={category.name} className="bg-[#1a1a1a] rounded-2xl overflow-hidden border border-[#2a2a2a]">
              <button 
                onClick={() => setExpandedCategory(expandedCategory === category.name ? null : category.name)}
                className="w-full flex items-center justify-between p-5 bg-[#1f1f1f] hover:bg-[#252525] transition-colors text-left"
              >
                <h3 className="font-bold text-white uppercase tracking-wide text-sm">{category.name}</h3>
                {expandedCategory === category.name ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
              </button>
              
              {expandedCategory === category.name && (
                <div className="p-5">
                  <div className="grid grid-cols-3 text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 pb-2 border-b border-[#2a2a2a]">
                    <div>Métrica</div>
                    <div className="text-center">{currentExam.date}</div>
                    <div className="text-center">{previousExam.date}</div>
                  </div>
                  
                  <div className="space-y-4">
                    {category.keys.map(key => {
                      const curVal = currentExam.metrics[key] !== undefined ? currentExam.metrics[key] : '---';
                      const prevVal = previousExam.metrics[key] !== undefined ? previousExam.metrics[key] : '---';
                      
                      let curColor = "text-white";
                      if (curVal !== '---' && prevVal !== '---' && typeof curVal === 'number' && typeof prevVal === 'number') {
                        if (curVal > prevVal) curColor = "text-red-400";
                        if (curVal < prevVal) curColor = "text-green-400";
                        if (curVal === prevVal) curColor = "text-gray-300";
                      }
                      
                      return (
                        <div key={key} className="grid grid-cols-3 items-center">
                          <div className="text-sm font-medium text-gray-300">{key}</div>
                          <div className={`text-center font-mono font-bold ${curColor}`}>
                            {curVal}
                          </div>
                          <div className="text-center font-mono text-gray-500">
                            {prevVal}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default BloodExams;
