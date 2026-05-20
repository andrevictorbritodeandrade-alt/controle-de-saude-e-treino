const fs = require('fs');

function processFile(file) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Convert slate/stone 900 to white
    content = content.replace(/text-(slate|stone|blue)-900/g, 'text-white');
    content = content.replace(/text-(slate|stone)-800/g, 'text-gray-100');
    content = content.replace(/text-(slate|stone)-700/g, 'text-white');
    
    // Convert slate/stone mid-grays
    content = content.replace(/text-(slate|stone)-600/g, 'text-gray-300');
    content = content.replace(/text-(slate|stone)-500/g, 'text-gray-400');
    content = content.replace(/text-(slate|stone)-400/g, 'text-gray-400');
    content = content.replace(/text-(slate|stone)-300/g, 'text-gray-500');
    
    // Convert backgrounds
    content = content.replace(/bg-(slate|stone)-50\b|bg-(slate|stone)-50\/[0-9]+/g, 'bg-[#1c1c1c]');
    content = content.replace(/bg-(slate|stone)-100/g, 'bg-[#222]');
    content = content.replace(/bg-(slate|stone)-200/g, 'bg-[#333]');
    
    // Convert borders
    content = content.replace(/border-(slate|stone)-100/g, 'border-[#222]');
    content = content.replace(/border-(slate|stone)-200/g, 'border-[#333]');
    content = content.replace(/border-(slate|stone)-300/g, 'border-[#444]');

    // Special blues
    content = content.replace(/bg-blue-600|bg-emerald-600|bg-amber-600/g, 'bg-red-600');
    content = content.replace(/bg-blue-500|bg-emerald-500|bg-amber-500/g, 'bg-red-500');
    content = content.replace(/text-blue-600|text-emerald-600|text-amber-600/g, 'text-red-500');
    content = content.replace(/text-blue-500|text-emerald-500|text-amber-500/g, 'text-red-500');
    content = content.replace(/text-blue-400|text-emerald-400|text-amber-400/g, 'text-red-400');
    content = content.replace(/text-blue-950/g, 'text-white');

    content = content.replace(/bg-emerald-50|bg-blue-50|bg-amber-50/g, 'bg-red-900/10');
    content = content.replace(/border-emerald-200|border-blue-200|border-amber-200/g, 'border-red-900/30');
    content = content.replace(/shadow-emerald-200|shadow-blue-200|shadow-amber-200/g, 'shadow-red-900/30');

    fs.writeFileSync(file, content);
}

const files = [
  'src/App.tsx', 
  'src/components/PhysicalAssessment.tsx', 
  'src/components/WeightMetrics.tsx', 
  'src/components/PoviztraControl.tsx', 
  'src/components/ExerciseTracker.tsx',
  'src/components/Login.tsx'
];

files.forEach(f => {
  if (fs.existsSync(f)) {
    processFile(f);
  }
});
