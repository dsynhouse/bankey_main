
import { GoogleGenAI, Type } from "@google/genai";
import { Category, ReportData, ReportAnalysis, Transaction } from "../types";
import { isApiLikelyAvailable, checkGeminiStatus } from "./geminiMonitor";

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
    if (import.meta && import.meta.env && import.meta.env.VITE_API_KEY) {
      return import.meta.env.VITE_API_KEY;
    }
  } catch {
    // Ignore error
  }

  return '';
};

// NOTE: In Vercel, ensure 'VITE_API_KEY' is set in Environment Variables for this to work.

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

// Retry utility with exponential backoff
const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: unknown) {
      lastError = error instanceof Error ? error : new Error(String(error));
      const errMsg = lastError.message;

      // Don't retry quota/billing errors - they won't resolve with retries
      if (errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED') ||
        errMsg.includes('quota') || errMsg.includes('billing')) {
        // Update monitor cache so other calls know API is limited
        checkGeminiStatus(true);
        throw lastError;
      }

      // Wait with exponential backoff before retry
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
};

// User-friendly error message generator
const getQuotaErrorMessage = (): string => {
  return "AI is temporarily unavailable (quota reached). Using smart fallback. Full AI will resume at midnight PT.";
};

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
  // 1. Check if API is likely available before making calls
  if (!isApiLikelyAvailable()) {
    console.info("Gemini API rate limited, using regex fallback");
    const fallback = regexParse(input);
    if (fallback.amount > 0) return fallback;
    return null;
  }

  // 2. Try AI with retry logic
  if (apiKey && ai) {
    try {
      const result = await retryWithBackoff(async () => {
        const model = "gemini-2.5-flash-lite"; // High speed, low latency
        const response = await ai!.models.generateContent({
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
        return response;
      });

      const text = result.text;
      if (text) return JSON.parse(text);
    } catch {
      console.warn("Gemini Parse Failed, switching to manual regex:", getQuotaErrorMessage());
    }
  }

  // 3. Fallback to Regex
  const fallback = regexParse(input);
  if (fallback.amount > 0) return fallback;

  return null;
};

// Helper for the financial advisor chat
// Uses gemini-2.5-flash with Search Grounding for real-time accuracy
export const getFinancialAdvice = async (history: { role: string, parts: { text: string }[] }[], newMessage: string, currencyCode: string = 'INR') => {
  if (!apiKey || !ai) return { text: "I'm currently offline (No API Key). Check your connection or Settings.", sources: [] };

  try {
    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      history: history,
      config: {
        tools: [{ googleSearch: {} }], // Enable Search Grounding
        systemInstruction: `You are Bankey, a smart, concise, and value-focused financial assistant.
        
        **Your Identity:**
        - Tone: Professional but engaging (like a savvy financial mentor).
        - Format: Use **bold** for key numbers, terms, and action items. Use standard Markdown.
        - Structure: Use bullet points or short paragraphs. Avoid walls of text.
        - Emojis: Use sparingly (max 1-2 per response) to maintain professionalism while keeping it friendly.
        - Currency: Always use ${currencyCode} for monetary examples unless specified otherwise.
        
        **Your Goal:**
        - Provide high-value, specific financial insights.
        - Avoid generic fluff. Get straight to the point.
        - If asked about markets, use Search to get real-time data.
        - Explain complex topics simply.
        
        **Constraints:**
        - Do not give specific legal/tax advice.
        - Stay focused on the user's question.`
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

export const getPersonalizedAnalysis = async (transactions: Transaction[], currencyCode: string = 'INR') => {
  if (!apiKey || !ai) return { text: "AI is offline. Check settings.", sources: [] };

  try {
    const txSummary = transactions.slice(0, 50).map(t =>
      `- ${t.date.split('T')[0]}: ${t.description} (${t.amount}) [${t.category}]`
    ).join('\n');

    const prompt = `
      Analyze these recent transactions for a user. Currency: ${currencyCode}.
      
      TRANSACTIONS:
      ${txSummary}

      **TASK:**
      Provide a concise, high-impact financial analysis in the following professional format:

      ### 1. 📊 Spending Overview
      (One professional summary sentence of their current spending behavior. **Bold** the key trend.)

      ### 2. 📉 Top Expense Category
      (Identify the highest spending category. **Bold** the category and total amount.)

      ### 3. 💡 Strategic Recommendation
      (One specific, actionable strategy to optimize budget based on data. **Bold** the action.)

      ### 4. ⚖️ Financial Assessment
      (A direct, professional assessment of non-essential spending patterns. Provide constructive feedback.)

      **GUIDELINES:**
      - Use standard Markdown.
      - Use **bold** for emphasis on numbers and key terms.
      - Keep it short, professional, and direct.
      - Use minimal emojis (as shown in headers only).
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    });

    return { text: response.text, sources: [] };
  } catch (error) {
    console.error("Analysis Error:", error);
    return { text: "Couldn't analyze data right now.", sources: [] };
  }
};


// New: Support Chatbot using gemini-2.5-flash for complex reasoning
export const getSupportAdvice = async (history: { role: string, parts: { text: string }[] }[], newMessage: string) => {
  if (!apiKey || !ai) return "Support bot is offline.";

  try {
    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
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

// Voice Transaction Parsing
export interface ParsedVoiceTransaction {
  amount: number;
  category: string;
  description: string;
  type: 'expense' | 'income';
  confidence: number;
  transcription?: string;
}

/**
 * Parse voice audio to extract transaction details
 * Uses Gemini 2.5 Flash for audio transcription and structured extraction
 * Supports English and Hindi
 * 
 * @param audioBase64 - Base64 encoded audio data
 * @param mimeType - Audio MIME type (e.g., 'audio/webm')
 * @returns Parsed transaction or null
 */
export const parseVoiceTransaction = async (
  audioBase64: string,
  mimeType: string
): Promise<ParsedVoiceTransaction | null> => {
  if (!apiKey || !ai) {
    console.warn("parseVoiceTransaction: Missing API Key or AI instance.");
    return null;
  }

  console.log("Voice Parse: Using gemini-2.5-flash");

  try {
    const prompt = `You are a financial transaction parser. Listen to this audio and extract transaction details.

RULES:
1. Transcribe the audio first (support English and Hindi)
2. Extract the transaction amount (in any currency, assume INR if not specified)
3. Determine if it's an expense or income based on context
4. Categorize into: Food, Transport, Leisure, Shopping, Bills, Investment, Business, Income, Other
5. Create a short description

EXAMPLES:
- "Spent 450 on groceries" → amount: 450, type: expense, category: Food, description: Groceries
- "Got 5000 from freelancing" → amount: 5000, type: income, category: Income, description: Freelancing
- "Maine 200 rupaye chai pe kharch kiye" → amount: 200, type: expense, category: Food, description: Chai

Return JSON with: amount (number), category (string), description (string), type (expense or income), confidence (0-1), transcription (what you heard).`;

    // Use correct content structure for Google GenAI SDK
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{
        role: "user",
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: mimeType.split(';')[0], // Use base MIME type without codecs
              data: audioBase64
            }
          }
        ]
      }],
      config: {
        temperature: 0.2,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            amount: { type: Type.NUMBER },
            category: { type: Type.STRING },
            description: { type: Type.STRING },
            type: { type: Type.STRING, enum: ['expense', 'income'] },
            confidence: { type: Type.NUMBER },
            transcription: { type: Type.STRING }
          },
          required: ["amount", "category", "description", "type", "confidence"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      console.warn("Voice Parse: Empty response from Gemini");
      return null;
    }

    const parsed = JSON.parse(text);

    // Validate the response
    if (typeof parsed.amount !== 'number' || parsed.amount <= 0) {
      console.warn("Invalid amount in voice transaction:", parsed);
      return null;
    }

    return parsed as ParsedVoiceTransaction;

  } catch (error: unknown) {
    // Check for rate limit errors
    const errMsg = error instanceof Error ? error.message : String(error);
    if (errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('quota')) {
      console.warn("Gemini Voice Parse: Rate limit exceeded");
      throw new Error('AI quota exceeded. Please try again in a few minutes.');
    }
    console.error("Gemini Voice Parse Error:", error);
    return null;
  }
};

// Receipt/Bill OCR Parsing
export interface ParsedReceipt {
  amount: number;
  merchant: string;
  category: string;
  description: string;
  date?: string;
  items?: Array<{ name: string; price: number }>;
  confidence: number;
}

/**
 * Parse receipt/bill image to extract transaction details
 * Uses Gemini Vision for OCR and structured extraction
 * 
 * @param imageBase64 - Base64 encoded image data
 * @param mimeType - Image MIME type (e.g., 'image/jpeg')
 * @returns Parsed receipt or null
 */
export const parseReceiptImage = async (
  imageBase64: string,
  mimeType: string
): Promise<ParsedReceipt | null> => {
  if (!apiKey || !ai) {
    console.warn("parseReceiptImage: Missing API Key or AI instance.");
    return null;
  }

  try {
    const prompt = `You are an expert receipt/bill parser. Analyze this image and extract transaction details.

INSTRUCTIONS:
1. Find the TOTAL amount on the receipt (not individual items unless no total)
2. Identify the merchant/store name
3. Categorize into: Food, Transport, Leisure, Shopping, Bills, Investment, Business, Other
4. Extract the date if visible
5. List major items if readable

EXAMPLES:
- Grocery store receipt for ₹450 → {amount: 450, merchant: "Store Name", category: "Food"}
- Restaurant bill for ₹800 → {amount: 800, merchant: "Restaurant Name", category: "Food"}
- Uber ride ₹150 → {amount: 150, merchant: "Uber", category: "Transport"}

Return a confidence score (0-1) based on image clarity and text readability.
If you cannot read the receipt clearly, set confidence below 0.5.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{
        role: "user",
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: mimeType,
              data: imageBase64
            }
          }
        ]
      }],
      config: {
        temperature: 0.1,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            amount: { type: Type.NUMBER },
            merchant: { type: Type.STRING },
            category: { type: Type.STRING },
            description: { type: Type.STRING },
            date: { type: Type.STRING },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  price: { type: Type.NUMBER }
                }
              }
            },
            confidence: { type: Type.NUMBER }
          },
          required: ["amount", "merchant", "category", "description", "confidence"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      console.warn("Receipt Parse: Empty response from Gemini");
      return null;
    }

    const parsed = JSON.parse(text);

    // Validate the response
    if (typeof parsed.amount !== 'number' || parsed.amount <= 0) {
      console.warn("Invalid amount in receipt:", parsed);
      return null;
    }

    return parsed as ParsedReceipt;

  } catch (error: unknown) {
    // Check for rate limit errors
    const errMsg = error instanceof Error ? error.message : String(error);
    if (errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('quota')) {
      console.warn("Gemini Receipt Parse: Rate limit exceeded");
      throw new Error('AI quota exceeded. Please try again in a few minutes.');
    }
    console.error("Gemini Receipt Parse Error:", error);
    return null;
  }
};
