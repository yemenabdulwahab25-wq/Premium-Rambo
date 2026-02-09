
import { GoogleGenAI, Type } from "@google/genai";
import { StrainType } from "../types";

// Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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

export const generateThankYouMessage = async (
  customerName: string,
  items: any[],
  style: 'friendly' | 'premium'
) => {
  try {
    const itemNames = items.map(i => i.name).join(", ");
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{
        parts: [{
          text: `Generate a short thank you message for a cannabis customer who just picked up their order.
          Customer: ${customerName}
          Purchased: ${itemNames}
          Style: ${style}
          Rules:
          1. Mention the specific items if possible.
          2. Keep it under 160 characters (for SMS).
          3. Always end with: "Enjoy responsibly. 21+ only."
          4. Be professional but high-end.`
        }]
      }],
    });
    return response.text;
  } catch (error) {
    return null;
  }
};

export const removeImageBackground = async (base64Image: string, mimeType: string) => {
  if (!base64Image || base64Image.length < 100) {
    console.error("Invalid image data provided to background remover.");
    return null;
  }
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: [{
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: 'MANDATORY: Remove all background elements from this image. Replace the background with a solid, pure studio white (#FFFFFF). Centrally align the product. Ensure no artifacts or shadows remain unless they are soft and look professionally shot in a studio. Output the final image bytes.',
          },
        ],
      }],
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("AI Background Removal failed:", error);
    return null;
  }
};

export const scanProductFromImage = async (base64Image: string, mimeType: string) => {
  if (!base64Image || base64Image.length < 100) {
    console.error("Invalid image data provided to scanner.");
    return null;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: `Act as a professional cannabis product scanner. Extract product information from this packaging image. If a detail is unclear, make a best guess based on industry standards.
            Return a JSON object with:
            - name: Product/Strain name (e.g. "Ice Cream Cake")
            - brand: Brand name (e.g. "Jungle Boys")
            - thc: THC percentage as a number (e.g. 28.5)
            - type: One of "Sativa", "Indica", "Hybrid"
            - category: One of "Flowers", "Disposables", "Carts", "Pre-Rolls", "Gummies", "Edibles", "Concentrates", "Tinctures", "Drinks", "Accessories".`,
          },
        ],
      }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            brand: { type: Type.STRING },
            thc: { type: Type.NUMBER },
            type: { type: Type.STRING },
            category: { type: Type.STRING }
          },
          required: ["name", "brand", "thc", "type", "category"]
        }
      }
    });
    
    const text = response.text;
    if (!text) return null;
    return JSON.parse(text.trim());
  } catch (error) {
    console.error("AI Scan failed:", error);
    return null;
  }
};
