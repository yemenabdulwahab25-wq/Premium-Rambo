
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { StrainType, CategoryEnum } from "../types";

// Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// PCM Decoding Helpers
function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const checkSystemHealth = async (): Promise<{ status: 'ok' | 'error', latency: number, message: string }> => {
  const start = Date.now();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: 'System check: respond with OK' }] }],
    });
    const end = Date.now();
    if (response.text?.includes('OK')) {
      return { status: 'ok', latency: end - start, message: 'Gemini AI connection stable.' };
    }
    throw new Error('Unexpected response format.');
  } catch (error: any) {
    return { status: 'error', latency: 0, message: error.message || 'Connection failed.' };
  }
};

export const speakOrderAlert = async () => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: 'Say clearly and energetically: Hey, Rambo, you got an order!' }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, // Energetic voice
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const audioBuffer = await decodeAudioData(
        decodeBase64(base64Audio),
        audioContext,
        24000,
        1
      );
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start();
    }
  } catch (error) {
    console.error("Voice notification failed:", error);
  }
};

export const generateProductDescription = async (
  name: string,
  brand: string,
  category: string,
  type: StrainType,
  thc: number
) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{
        parts: [{
          text: `Generate a high-end dispensary description for a cannabis product. 
            Product: ${name} by ${brand}
            Category: ${category}
            Type: ${type}
            THC: ${thc}%
            Provide a short 1-line summary, a detailed 3-line description (aroma, effects, taste), and 5 tags.`
        }]
      }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            shortDescription: { type: Type.STRING },
            fullDescription: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["shortDescription", "fullDescription", "tags"]
        }
      }
    });
    
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("AI Generation failed:", error);
    return null;
  }
};

export const bobbyProAssistant = async (query: string, inventory: any[]) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{
        parts: [{
          text: `You are "Bobby Pro", an expert cannabis budtender assistant. 
          Answer the user's question based on the provided inventory. 
          User Query: "${query}"
          Inventory: ${JSON.stringify(inventory.map(i => ({ name: i.name, brand: i.brand, type: i.type, thc: i.thc, tags: i.tags })))}
          Be friendly, helpful, and concise. Highlight specific products.`
        }]
      }],
    });
    return response.text;
  } catch (error) {
    return "I'm having trouble thinking right now. Ask me again in a moment!";
  }
};

export const removeImageBackground = async (base64Image: string, mimeType: string) => {
  if (!base64Image || base64Image.length < 100) return null;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: [{
        parts: [
          { inlineData: { data: base64Image, mimeType: mimeType } },
          { text: 'MANDATORY: Remove background. Solid white background (#FFFFFF). Output image bytes.' },
        ],
      }],
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    return null;
  } catch (error) {
    console.error("AI Background Removal failed:", error);
    return null;
  }
};

export const aiInventoryWizard = async (input: { text?: string, image?: { data: string, mimeType: string } }) => {
  try {
    const parts: any[] = [];
    if (input.image) {
      parts.push({ inlineData: { data: input.image.data, mimeType: input.image.mimeType } });
    }
    if (input.text) {
      parts.push({ text: input.text });
    }
    
    parts.push({
      text: `Act as a master AI inventory specialist for a premium cannabis vault. 
      Analyze the input (text description or image of packaging). 
      Extract ALL details to create a new product SKU.
      
      REQUIRED DATA:
      - name: Exact strain or product name.
      - brand: Recognized brand or owner.
      - thc: Estimated or extracted THC level as a number.
      - type: "Sativa", "Indica", or "Hybrid".
      - category: One of ${Object.values(CategoryEnum).join(', ')}.
      - description: A high-end 3-sentence narrative.
      - weights: Array of { weight: string, price: number, stock: number }. 
        If price is unknown, estimate based on current exotic market value for that strain (e.g., $45-60 for 3.5g).
      
      Return a complete JSON product object.`
    });

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            brand: { type: Type.STRING },
            thc: { type: Type.NUMBER },
            type: { type: Type.STRING },
            category: { type: Type.STRING },
            description: { type: Type.STRING },
            weights: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  weight: { type: Type.STRING },
                  price: { type: Type.NUMBER },
                  stock: { type: Type.NUMBER }
                },
                required: ["weight", "price", "stock"]
              }
            }
          },
          required: ["name", "brand", "thc", "type", "category", "description", "weights"]
        }
      }
    });

    const text = response.text;
    return text ? JSON.parse(text.trim()) : null;
  } catch (error) {
    console.error("AI Inventory Wizard failed:", error);
    return null;
  }
};

export const scanProductFromImage = async (base64Image: string, mimeType: string) => {
  return aiInventoryWizard({ image: { data: base64Image, mimeType } });
};
