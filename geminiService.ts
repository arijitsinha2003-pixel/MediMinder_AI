
import { GoogleGenAI } from "@google/genai";
import { Medicine, AdherenceLog, User } from "./types";

const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const getHealthGuidance = async (
  prompt: string, 
  history: { role: string; text: string }[],
  medicines?: Medicine[],
  logs?: AdherenceLog[],
  user?: User
) => {
  const ai = getAIClient();
  
  // Format context for the AI
  let medicalContext = "";
  if (medicines && medicines.length > 0) {
    medicalContext += "\nUSER'S CURRENT MEDICATIONS:\n" + 
      medicines.map(m => `- ${m.name}: ${m.dosage}, taken ${m.frequency} at ${m.times.join(', ')}. Category: ${m.category}. Current stock: ${m.inventory}`).join('\n');
  } else {
    medicalContext += "\nThe user currently has no medications registered in the app.";
  }

  if (logs && logs.length > 0) {
    const recentLogs = logs.slice(0, 5);
    medicalContext += "\nRECENT ADHERENCE LOGS:\n" + 
      recentLogs.map(l => {
        const med = medicines?.find(m => m.id === l.medicineId);
        return `- ${new Date(l.timestamp).toLocaleString()}: ${med?.name || 'Unknown med'} was marked as ${l.status}`;
      }).join('\n');
  }

  if (user?.cycleData) {
    medicalContext += `\nMENSTRUAL CYCLE INFO: Last period started on ${user.cycleData.lastPeriodStart}, typical cycle is ${user.cycleData.cycleLength} days.`;
  }

  // Using gemini-3-pro-preview for "well-trained" advanced reasoning and Q&A
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: [
      ...history.map(msg => ({
        role: msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.text }]
      })),
      { role: 'user', parts: [{ text: prompt }] }
    ],
    config: {
      systemInstruction: `You are an elite AI Health Expert and medical Q&A assistant for MediMinder AI. 
      Your goal is to provide high-level, medically-accurate, and supportive guidance.
      You have access to Google Search to provide the most up-to-date health information.
      
      ${medicalContext}

      RULES:
      1. Always include a disclaimer that you are an AI and not a doctor.
      2. For complex medical questions, use Google Search to verify recent studies or guidelines.
      3. If symptoms sound urgent, advise immediate emergency care.
      4. Use the user's personal health profile (meds, cycle) to provide context-aware answers.
      5. Ensure answers are clear, professional, and well-reasoned.`,
      tools: [{ googleSearch: {} }],
      thinkingConfig: { thinkingBudget: 2000 }
    },
  });

  const candidate = response.candidates?.[0];
  return {
    text: response.text || "I'm sorry, I couldn't generate a response.",
    groundingChunks: candidate?.groundingMetadata?.groundingChunks
  };
};

export const getMeditationGuidance = async (mood: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `The user is feeling ${mood}. Generate a short, 3-step guided meditation script (approx 150 words). Focus on breathing and gentle visualization. Use a soothing and calm tone.`,
    config: {
      systemInstruction: "You are a professional mindfulness and meditation coach. You provide short, effective, and calming guided sessions for people with busy lives."
    }
  });
  return response.text;
};

export const getCycleAdvice = async (phase: string, user: User) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `The user is currently in the ${phase} phase of their menstrual cycle. Their typical cycle is ${user.cycleData?.cycleLength} days. Provide 3 specific wellness tips (nutrition, activity, mood) for this phase. Keep it short and supportive.`,
    config: {
      systemInstruction: "You are a specialized women's health AI assistant. Provide concise, science-backed wellness advice for different menstrual cycle phases."
    }
  });
  return response.text;
};

export const editImageWithGemini = async (base64Image: string, mimeType: string, prompt: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Image.split(',')[1],
            mimeType: mimeType,
          },
        },
        {
          text: prompt,
        },
      ],
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  return null;
};

export const analyzeAdherence = async (data: any) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze this medicine adherence data and provide a short summary of trends and one health tip: ${JSON.stringify(data)}`,
  });
  return response.text;
};
