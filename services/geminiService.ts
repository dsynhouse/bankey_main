
import { GoogleGenAI, Type } from "@google/genai";
import { Category, ReportData, ReportAnalysis } from "../types";

// Safe API Key Retrieval for different build environments (Vite vs Webpack/CRA)
const getApiKey = () => {
  try {
    // Check Node/Webpack process.env
    if (typeof process !== 'undefined' && process.env?.API_KEY) {
      return process.env.API_KEY;
    }
  } catch {
    // Ignore error
  }

  try {
    // Check Vite import.meta.env
    // @ts-expect-error - Vite types might not be loaded in all environments
    if (import.meta && import.meta.env && import.meta.env.VITE_API_KEY) {
      // @ts-expect-error - Vite types might not be loaded in all environments
      return import.meta.env.VITE_API_KEY;
    }
  } catch {
    // Ignore error
  }

  return '';
};

const apiKey = getApiKey();
let ai: GoogleGenAI | null = null;

try {
  if (apiKey) {
    ai = new GoogleGenAI({ apiKey });
  } else {
    console.warn("Gemini API Key missing. AI features will be disabled.");
  }
} catch (e) {
  console.warn("GenAI init failed:", e);
}

// Fallback Regex Parser for when AI is unavailable or fails
const regexParse = (input: string) => {
  const lower = input.toLowerCase();
  let amount = 0;
  let description = '';
  let category: Category = Category.OTHER;
  let type: 'expense' | 'income' = 'expense';

  // Extract Amount (look for numbers)
  const amountMatch = input.match(/(\d+(\.\d{1,2})?)/);
  if (amountMatch) {
    amount = parseFloat(amountMatch[0]);
  }

  // Determine Type
  if (lower.includes('earn') || lower.includes('got') || lower.includes('salary') || lower.includes('sold') || lower.includes('deposit')) {
    type = 'income';
    category = Category.INCOME;
  }

  // Determine Category keyword matching
  if (lower.includes('food') || lower.includes('eat') || lower.includes('pizza') || lower.includes('coffee') || lower.includes('burger')) category = Category.FOOD;
  else if (lower.includes('uber') || lower.includes('gas') || lower.includes('bus') || lower.includes('train') || lower.includes('flight')) category = Category.TRANSPORT;
  else if (lower.includes('movie') || lower.includes('game') || lower.includes('party') || lower.includes('concert')) category = Category.LEISURE;
  else if (lower.includes('shirt') || lower.includes('shoes') || lower.includes('clothes') || lower.includes('buy')) category = Category.SHOPPING;
  else if (lower.includes('bill') || lower.includes('rent') || lower.includes('electric') || lower.includes('wifi')) category = Category.BILLS;
  else if (lower.includes('invest') || lower.includes('stock') || lower.includes('bitcoin')) category = Category.INVESTMENT;

  // Clean description: Remove the amount and common prepositions
  description = input.replace(/(\d+(\.\d{1,2})?)/, '').replace(/\b(spent|on|for|got|dropped|paid)\b/gi, '').trim();
  if (!description) description = type === 'income' ? 'Income' : 'Expense';

  // Capitalize description
  description = description.charAt(0).toUpperCase() + description.slice(1);

  return { amount, category, description, type };
};

// Helper to parse natural language transaction input
// Uses gemini-2.5-flash-lite for low latency as requested
export const parseTransactionInput = async (input: string): Promise<{
  amount: number;
  category: string;
  description: string;
  type: 'expense' | 'income';
} | null> => {
  // 1. Try AI first if key exists
  if (apiKey && ai) {
    try {
      const model = "gemini-2.5-flash-lite"; // High speed, low latency
      const response = await ai.models.generateContent({
        model,
        contents: `Parse this transaction: "${input}". 
          Classify into one of these categories: Food, Transport, Leisure, Shopping, Bills, Investment, Business, Income, Other.
          If it sounds like earning money, type is 'income', else 'expense'.
          Return valid JSON.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              amount: { type: Type.NUMBER },
              category: { type: Type.STRING },
              description: { type: Type.STRING },
              type: { type: Type.STRING, enum: ['expense', 'income'] }
            },
            required: ["amount", "category", "description", "type"]
          }
        }
      });

      const text = response.text;
      if (text) return JSON.parse(text);
    } catch (error) {
      console.warn("Gemini Parse Failed, switching to manual regex:", error);
    }
  }

  // 2. Fallback to Regex
  const fallback = regexParse(input);
  if (fallback.amount > 0) return fallback;

  return null;
};

// Helper for the financial advisor chat
// Uses gemini-2.5-flash with Search Grounding for real-time accuracy
export const getFinancialAdvice = async (history: { role: string, parts: { text: string }[] }[], newMessage: string) => {
  if (!apiKey || !ai) return { text: "I'm currently offline (No API Key). Check your connection or Settings.", sources: [] };

  try {
    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      history: history,
      config: {
        tools: [{ googleSearch: {} }], // Enable Search Grounding
        systemInstruction: `You are Bankey, a cool, knowledgeable, and fun financial assistant for Gen Z and Millennials. 
        Keep answers concise, use emojis occasionally, and avoid overly complex jargon without explaining it simply.
        Your goal is to educate about financial literacy, investments, and saving habits.
        When asked about current events or market data, use the search tool to get the latest info.
        Do not give specific legal or tax advice, but general guidelines are okay.`
      }
    });

    const result = await chat.sendMessage({ message: newMessage });

    // Extract Grounding Sources
    const chunks = result.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = chunks
      .map((c: { web?: { uri: string; title: string } }) => c.web ? { uri: c.web.uri, title: c.web.title } : null)
      .filter((s: { uri: string; title: string } | null) => s !== null);

    return { text: result.text, sources };

  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return { text: "My brain froze. Try asking that again later.", sources: [] };
  }
};

// New: Support Chatbot using gemini-3-pro-preview for complex reasoning
export const getSupportAdvice = async (history: { role: string, parts: { text: string }[] }[], newMessage: string) => {
  if (!apiKey || !ai) return "Support bot is offline.";

  try {
    const chat = ai.chats.create({
      model: "gemini-3-pro-preview",
      history: history,
      config: {
        systemInstruction: `You are the Bankey Support Bot. Your job is to help users troubleshoot issues with the Bankey app.
                The app features: Dashboard, Transaction Tracker, Budget Planner, Education Modules, and AI Advisor.
                Common issues might be: 'Sync failed', 'Login issues', 'How to delete account'.
                Be helpful, technical but polite. If you can't solve it, ask them to use the 'Report Bug' form.`
      }
    });
    const result = await chat.sendMessage({ message: newMessage });
    return result.text;
  } catch {
    return "I'm having trouble connecting to the support database.";
  }
};

// New: Real-time Context for Learn Modules
export const getRealTimeLearnContext = async (topic: string) => {
  if (!apiKey || !ai) return null;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Find recent news, market rates, or real-world examples related to: "${topic}".
            Provide a short, 2-paragraph summary of what's happening right now in the real world regarding this financial topic.
            Include 1-2 bullet points of data if available (like current interest rates or stock trends).`,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    // Extract Grounding Sources
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = chunks
      .map((c: { web?: { uri: string; title: string } }) => c.web ? { uri: c.web.uri, title: c.web.title } : null)
      .filter((s: { uri: string; title: string } | null) => s !== null);

    return { text: response.text, sources };
  } catch (error) {
    console.error("Context Fetch Error", error);
    return null;
  }
}

export const analyzeFinancialReport = async (report: ReportData): Promise<ReportAnalysis | null> => {
  if (!apiKey || !ai) {
    console.warn("analyzeFinancialReport: Missing API Key or AI instance.");
    return null;
  }

  try {
    const prompt = `
      ACT AS A STRICT FINANCIAL ANALYST.
      Analyze this financial report for a small business.
      
      DATA: ${JSON.stringify(report.data)}
      
      RULES:
      1. USE ONLY THE DATA PROVIDED. DO NOT HALLUCINATE NUMBERS.
      2. Summary must be under 20 words.
      3. Provide 3 Strengths based on the numbers.
      4. Provide 3 Weaknesses based on the numbers.
      5. Provide 3 Actionable Tips to improve Net Income.
      
      Tone: Professional, objective, concise.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0, // Maximum determinism
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
            tips: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["summary", "strengths", "weaknesses", "tips"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return null;
  }
};

// New: Parse Financial Document (PDF/Image)
export const parseFinancialDocument = async (base64Data: string, mimeType: string): Promise<ReportData['data'] | null> => {
  if (!apiKey || !ai) {
    console.warn("parseFinancialDocument: Missing API Key or AI instance.");
    return null;
  }

  try {
    const prompt = `
      ACT AS A STRICT FINANCIAL ANALYST.
      Extract data from this financial document (Bank Statement, P&L, or Balance Sheet).
      
      EXTRACT:
      1. Total Revenue/Income
      2. Cost of Goods Sold (COGS) - if available, else 0
      3. Expenses - categorized list
      4. Net Income
      5. Currency Code (e.g. USD, INR, EUR, GBP) - Infer from symbols (₹=INR, $=USD/CAD, £=GBP).
      
      RULES:
      - Use the EXACT numbers found in the document.
      - If currency is Rupees (₹), keep the numbers as is.
      - Return JSON matching the schema.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        { text: prompt },
        { inlineData: { mimeType: mimeType, data: base64Data } }
      ],
      config: {
        temperature: 0,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            revenue: { type: Type.NUMBER },
            cogs: { type: Type.NUMBER },
            grossProfit: { type: Type.NUMBER },
            expenses: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  amount: { type: Type.NUMBER }
                }
              }
            },
            netIncome: { type: Type.NUMBER },
            currency: { type: Type.STRING }
          },
          required: ["revenue", "cogs", "grossProfit", "expenses", "netIncome", "currency"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text);

  } catch (error) {
    console.error("Gemini PDF Parse Error:", error);
    return null;
  }
};
