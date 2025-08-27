
import { GoogleGenAI, Chat } from '@google/genai';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error('API_KEY environment variable not set');
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export async function startChatSession(): Promise<Chat> {
  const chat: Chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: 'Eres un asistente virtual servicial, creativo y amigable llamado Gemini. Responde en español.',
      temperature: 0.7,
      topP: 0.9,
    },
  });
  return chat;
}
