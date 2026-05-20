import { GoogleGenAI } from "@google/genai";

export async function analyzeWorkoutScreenshot(imageFile: File) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'undefined') {
    throw new Error("API Key do Gemini não encontrada no visionService. Configure a variável GEMINI_API_KEY.");
  }
  
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    Analise este print de tela de um app de fitness (como Samsung Health).
    Extraia os dados de treino: atividade, duração e calorias.
    Se for uma imagem contendo métricas detalhadas (como ritmo médio, distância, zonas cardíacas), inclua o campo 'details'.

    Retorne APENAS um objeto JSON no formato abaixo. NÃO inclua crases, comentários ou texto fora do JSON.
    Exemplo de formato:
    {
      "activity": "Corrida",
      "duration": "46:20",
      "calories": 362,
      "details": {
        "distanceKm": 4.50,
        "averagePace": "10'17\\"/km",
        "averageHeartRateBpm": 131,
        "averageCadencePpm": 112,
        "elevationGainMeters": 34,
        "splits": [
          { "distance": "1.00 km", "time": "11:42", "pace": "11'42\\"" }
        ],
        "heartRateZones": [
          { "zone": 5, "name": "Máxima", "range": "161-178 bpm", "usage": "Mínimo" }
        ],
        "advancedMetrics": {
          "asymmetry": "Tendência para o lado Direito (Azul)",
          "groundContactTime": "Alto/Lento (Laranja)",
          "flightTime": "Ótimo (Verde)",
          "regularity": "Tendência para o lado Direito (Azul)",
          "vertical": "Médio (Laranja)",
          "stiffness": "Médio (Laranja)"
        },
        "performanceAndRecovery": {
          "vo2Max": 36.1,
          "vo2MaxClassification": "Ruim",
          "estimatedSweatLossMl": 606,
          "hydrationRecommendationMl": 909,
          "device": "Galaxy Watch7"
        }
      }
    }
  `;

  // Converter o arquivo para base64
  const reader = new FileReader();
  const base64Image = await new Promise<string>((resolve) => {
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(imageFile);
  });

  const result = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: [
      prompt,
      {
        inlineData: {
          data: base64Image.split(',')[1],
          mimeType: imageFile.type,
        },
      },
    ]
  });

  const text = result.text;
  
  try {
    // Tenta limpar a resposta para extrair apenas o JSON
    const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonString);
  } catch (e) {
    console.error("Erro ao processar resposta do Gemini:", e);
    return null;
  }
}

export async function analyzeBioimpedanceScreenshot(imageFile: File) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'undefined') {
    throw new Error("API Key do Gemini não encontrada no visionService. Configure a variável GEMINI_API_KEY.");
  }
  
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    Analise este print de tela de bioimpedância, possivelmente do Samsung Galaxy Watch 7 ou de outro relatório de bioimpedância.
    Extraia o máximo de dados possível relacionados à composição corporal.
    Mapeie os valores identificados para as seguintes chaves do JSON de retorno (use números ou strings numéricas estruturadas, ou null se não encontrar o campo correspondente):
    
    - "weight": peso corporal total em kg (se presente, ex: "100.8")
    - "bmi": IMC ou índice de massa corporal (ex: "31.1")
    - "bodyFat": porcentagem de gordura corporal (ex: "28.2")
    - "fatWeight": peso da gordura em kg (ex: "28.4")
    - "skeletalMuscle": porcentagem ou índice de músculo esquelético (ex: "37.4")
    - "skeletalMuscleWeight": peso do músculo esquelético em kg (ex: "37.7")
    - "muscleRate": taxa ou percentual de músculo (ex: "66.2")
    - "muscleWeight": peso do músculo total em kg (ex: "66.7")
    - "water": porcentagem de água (ex: "51.0")
    - "waterWeight": peso da água em kg (ex: "51.4")
    - "visceralFat": nível de gordura visceral (ex: "16.4")
    - "boneMass": massa óssea em kg (ex: "3.1")
    - "metabolism": metabolismo basal / taxa metabólica em kcal (ex: "2015.0")
    - "protein": proteína em % ou em kg (ex: "16.8")
    - "obesityLevel": nível ou grau de obesidade % (ex: "32.8")
    - "metabolicAge": idade metabólica (ex: "43.0")
    - "lbm": massa magra livre de gordura - lean body mass em kg (ex: "72.4")

    Seja preciso ao extrair os valores numéricos.
    Retorne APENAS o objeto JSON de forma pura. Não inclua crases ou texto markdown.
    Exemplo de formato esperado:
    {
      "weight": "100.8",
      "bmi": "31.1",
      "bodyFat": "28.2",
      "fatWeight": "28.4",
      "skeletalMuscle": "37.4",
      "skeletalMuscleWeight": "37.7",
      "muscleRate": "66.2",
      "muscleWeight": "66.7",
      "water": "51.0",
      "waterWeight": "51.4",
      "visceralFat": "16.4",
      "boneMass": "3.1",
      "metabolism": "2015.0",
      "protein": "16.8",
      "obesityLevel": "32.8",
      "metabolicAge": "43.0",
      "lbm": "72.4"
    }
  `;

  // Converter o arquivo para base64
  const reader = new FileReader();
  const base64Image = await new Promise<string>((resolve) => {
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(imageFile);
  });

  const result = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: [
      prompt,
      {
        inlineData: {
          data: base64Image.split(',')[1],
          mimeType: imageFile.type,
        },
      },
    ]
  });

  const text = result.text;
  
  try {
    const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonString);
  } catch (e) {
    console.error("Erro ao extrair bioimpedância com Gemini:", e);
    return null;
  }
}
