import { GoogleGenAI, Type, Schema } from "@google/genai";
import { FoodAnalysis, HealthStatus, User } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Food Analysis Service ---

const foodAnalysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING, description: "Nome do alimento identificado." },
    status: { 
      type: Type.STRING, 
      enum: [HealthStatus.HEALTHY, HealthStatus.MODERATE, HealthStatus.AVOID],
      description: "Classificação geral de saúde." 
    },
    healthScore: { 
      type: Type.NUMBER, 
      description: "Nota de 0 a 100 para o alimento (100 = extremamente saudável, 0 = muito prejudicial)." 
    },
    calories: { type: Type.NUMBER, description: "Estimativa de calorias por porção padrão (kcal)." },
    protein: { type: Type.STRING, description: "Quantidade de proteína (ex: '10g')." },
    carbs: { type: Type.STRING, description: "Quantidade de carboidratos (ex: '20g')." },
    fat: { type: Type.STRING, description: "Quantidade de gordura (ex: '5g')." },
    sugar: { type: Type.STRING, description: "Quantidade de açúcar (ex: '2g')." },
    description: { type: Type.STRING, description: "Breve explicação sobre a nota e o status." },
    alternatives: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "Lista de 2 a 3 alternativas mais saudáveis." 
    },
    harmfulIngredients: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Lista de ingredientes negativos (ex: excesso de sódio, gordura trans, açúcar adicionado)."
    },
    beneficialIngredients: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Lista de ingredientes positivos (ex: fibras, vitaminas, proteína magra)."
    },
    allergyWarning: {
      type: Type.STRING,
      description: "AVISO CRÍTICO se o alimento contém algo que o usuário tem alergia. Retorne string vazia se seguro."
    }
  },
  required: ["name", "status", "healthScore", "calories", "protein", "carbs", "fat", "sugar", "description", "alternatives", "harmfulIngredients", "beneficialIngredients"]
};

export const analyzeFoodImage = async (base64Image: string, user?: User | null): Promise<FoodAnalysis> => {
  try {
    let contextPrompt = "Analise este alimento.";
    
    if (user) {
      const allergies = user.allergies?.join(", ") || "Nenhuma";
      const preferences = user.preferences?.join(", ") || "Nenhuma";
      contextPrompt += `\nCONTEXTO DO USUÁRIO:\nAlergias: ${allergies}.\nPreferências/Dieta: ${preferences}.\n
      Se o alimento contiver algum ingrediente listado nas alergias, o campo 'allergyWarning' DEVE ser preenchido com um aviso claro em MAIÚSCULAS.
      Se o alimento violar a dieta (ex: carne para vegano), a nota healthScore deve cair drasticamente.`;
    }

    contextPrompt += "\nRetorne um JSON com a estrutura solicitada. Responda em Português.";

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image
            }
          },
          {
            text: contextPrompt
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: foodAnalysisSchema,
        temperature: 0.4
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as FoodAnalysis;
    }
    throw new Error("Falha ao analisar imagem.");
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};

// --- Recipe Generation Service ---

const recipeSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    calories: { type: Type.NUMBER },
    time: { type: Type.STRING },
    ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
    instructions: { type: Type.ARRAY, items: { type: Type.STRING } }
  },
  required: ["title", "calories", "time", "ingredients", "instructions"]
};

export const generateRecipe = async (ingredients: string, goal: string): Promise<any> => {
  try {
    const prompt = `Crie uma receita saudável usando estes ingredientes: ${ingredients}. Objetivo: ${goal}. Responda em Português.`;
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: recipeSchema
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    throw new Error("Falha ao gerar receita.");
  } catch (error) {
    console.error("Gemini Recipe Error:", error);
    throw error;
  }
};

// --- Chat Service ---

export const createChatSession = () => {
  return ai.chats.create({
    model: "gemini-2.5-flash",
    config: {
      systemInstruction: "Você é o FitScan Coach, um assistente pessoal de emagrecimento motivador, inteligente e empático. Seus conselhos são baseados em ciência nutricional, mas explicados de forma simples. Você fala Português do Brasil. Seja breve e encorajador.",
      temperature: 0.7
    }
  });
};