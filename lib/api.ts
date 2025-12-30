
import { GoogleGenAI, GenerateContentResponse, Chat, Type } from '@google/genai';
import { ChatMessage, Timetable, Restaurant } from '../types';
import { env } from '../env';

let ai: GoogleGenAI;

const getAI = () => {
  if (!ai) {
    if (!env.API_KEY || env.API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
      throw new Error("API_KEY is not configured. Please check your env.ts file or Netlify environment variables.");
    }
    ai = new GoogleGenAI({ apiKey: env.API_KEY, vertexai: true });
  }
  return ai;
};

const timetableSchema = {
  type: Type.OBJECT,
  properties: {
    monday: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { subject: { type: Type.STRING }, time: { type: Type.STRING }, room: { type: Type.STRING } } } },
    tuesday: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { subject: { type: Type.STRING }, time: { type: Type.STRING }, room: { type: Type.STRING } } } },
    wednesday: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { subject: { type: Type.STRING }, time: { type: Type.STRING }, room: { type: Type.STRING } } } },
    thursday: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { subject: { type: Type.STRING }, time: { type: Type.STRING }, room: { type: Type.STRING } } } },
    friday: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { subject: { type: Type.STRING }, time: { type: Type.STRING }, room: { type: Type.STRING } } } },
    saturday: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { subject: { type: Type.STRING }, time: { type: Type.STRING }, room: { type: Type.STRING } } } },
  },
};

export const parseTimetableFromImage = async (imageBase64: string): Promise<Timetable> => {
  const genAI = getAI();
  const imagePart = { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } };
  const textPart = { text: `Analyze the provided image of a class schedule. Extract all class details for each day of the week (Monday to Saturday). For each class, identify the subject name, time slot (e.g., '9:00 AM - 10:00 AM'), and room number or location. Structure the output as a JSON object following the provided schema. If a day has no classes, provide an empty array for that day. Ensure all days from Monday to Saturday are present as keys.` };

  const response: GenerateContentResponse = await genAI.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { role: 'user', parts: [imagePart, textPart] },
    config: { responseMimeType: 'application/json', responseSchema: timetableSchema },
  });

  const jsonText = response.text.trim();
  try {
    return JSON.parse(jsonText) as Timetable;
  } catch (e) {
    console.error("Failed to parse timetable JSON:", e);
    throw new Error("The AI returned an invalid format. Please try again with a clearer image.");
  }
};

let chat: Chat | null = null;

export const getAIStudyResponseStream = async (history: ChatMessage[], newMessage: string) => {
  const genAI = getAI();
  if (!chat) {
    chat = genAI.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: 'You are a friendly and knowledgeable study helper for university students. Explain concepts clearly, concisely, and accurately. Be encouraging and supportive.',
        thinkingConfig: { thinkingBudget: 0 } // Disable thinking for faster chat-like responses
      },
    });
  }

  const prompt = [...history, { role: 'user', content: newMessage }].map(m => `${m.role}: ${m.content}`).join('\n');
  return chat.sendMessageStream({ message: prompt });
};

export const getNearbyRestaurants = async (latitude: number, longitude: number): Promise<Restaurant[]> => {
    const genAI = getAI();
    const prompt = `Find popular restaurants near latitude ${latitude} and longitude ${longitude}. Respond with ONLY a valid JSON array of objects. Each object must represent a restaurant and have the following keys: "id" (a unique string), "name" (string), "address" (string), "isVeg" (boolean, true if the restaurant is exclusively vegetarian or has a very strong vegetarian menu), "distance" (number, estimated distance in kilometers from the given coordinates), and "reviewSummary" (string, a 2-sentence summary of public reviews). Do not include any text, markdown, or explanations outside of the JSON array.`;

    const response = await genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { role: 'user', parts: [{ text: prompt }] },
        config: {
            tools: [{ googleSearch: {} }],
        },
    });

    try {
        let jsonString = response.text;
        const startIndex = jsonString.indexOf('[');
        const endIndex = jsonString.lastIndexOf(']');
        if (startIndex === -1 || endIndex === -1) {
            throw new Error("No JSON array found in response.");
        }
        jsonString = jsonString.substring(startIndex, endIndex + 1);
        
        const restaurants = JSON.parse(jsonString);
        if (!Array.isArray(restaurants)) {
            throw new Error("Parsed response is not an array.");
        }
        return restaurants as Restaurant[];
    } catch (e) {
        console.error("Failed to parse restaurant data from Gemini:", e);
        console.error("Raw response text:", response.text);
        throw new Error("Could not understand the restaurant data from the AI. It might be a temporary issue.");
    }
};
