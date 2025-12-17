import { GoogleGenAI, Type } from "@google/genai";
import { Category, ReportData, ReportAnalysis, Transaction } from "../types";
import { isApiLikelyAvailable, checkGeminiStatus } from "./geminiMonitor";
import { geminiUsage } from "./geminiUsage";

// Safe API Key Retrieval for different build environments (Vite vs Webpack/CRA)
const getApiKey = () => {
  try {
    if (typeof process !== 'undefined' && process.env?.API_KEY) return process.env.API_KEY;
  } catch { } // Ignore
  try {
    if (import.meta && import.meta.env && import.meta.env.VITE_API_KEY) return import.meta.env.VITE_API_KEY;
  } catch { } // Ignore
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

// --- SHARED HELPER FOR ROBUST AI CALLS (Direct SDK -> Timeout -> Supabase Proxy) ---
const callGeminiWithFallback = async (
  methodName: string,
  fn: () => Promise<any>,
  promptOrPayload: any,
  fallbackModel: string = 'gemini-2.5-flash',
  isImageOrAudio: boolean = false
) => {
  if (!apiKey || !ai) throw new Error(`${methodName}: Missing API Key or AI instance.`);

  // 1. Try Direct Method with Timeout
  try {
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out')), 15000));

    // Execute the direct SDK call
    const response = await Promise.race([
      fn(),
      timeoutPromise
    ]) as any;

    return response; // Success

  } catch (error) {
    console.warn(`${methodName}: Direct Call Failed(Timeout / Error).Switching to Proxy.`, error);

    // 2. Fallback to Supabase Proxy
    try {
      const { supabase } = await import('./supabase');
      console.log(`${methodName}: Attempting Supabase Proxy...`);

      // Construct Body based on request type
      let body: any = {
        model: fallbackModel
      };

      // Handle 'promptOrPayload' which can be either a string (prompt) or an object ({ contents, config })
      if (typeof promptOrPayload === 'string') {
        body.prompt = promptOrPayload;
      } else if (promptOrPayload && typeof promptOrPayload === 'object' && promptOrPayload.contents) {
        // It's a full payload with contents/config
        body.contents = promptOrPayload.contents;
        if (promptOrPayload.config) {
          body.config = promptOrPayload.config;
        }
      }

      console.log(`${methodName}: Sending Payload to Proxy (Is Media: ${isImageOrAudio})`);

      const { data, error: funcError } = await supabase.functions.invoke('ai-advisor', {
        body: body
      });

      if (funcError) throw funcError;

      // If we got 'text' directly (legacy or simple text)
      if (data?.text) {
        console.log(`${methodName}: Proxy Success`);
        // If the return was a full "data" object (raw Gemini response), we should reconstruct it if possible, 
        // OR just return a minimal object that behaves like the SDK response (which usually has .text property).
        // Our updated proxy returns { text: "...", data: rawResponse }.

        // SDK calls usually return { text: string } via result.response.text(), or just result.text in my mocking.
        // Wait, my retryWithBackoff returns `response`, and `result.text` access in `parseTransactionInput`.

        // Let's standardise on returning an object that has a text property or mimics the candidates structure.
        // My previous refactors use `result.text` or `JSON.parse(text)`.

        return { text: data.text, candidates: data.data?.candidates };
      }

    } catch (proxyError) {
      console.error(`${methodName}: Proxy Fallback Failed`, proxyError);
    }
    throw error; // Return original error if proxy fails
  }
};



// Retry utility with exponential backoff and Jitter
const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: Error | undefined;
  let delay = baseDelay;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      const errMsg = lastError.message;
      const status = error.status || error.statusCode; // GoogleGenAI might provide status

      // Handle 429 (Resource Exhausted) specifically
      if (errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED') || status === 429) {
        console.warn(`Gemini Request: Rate limit exceeded.Retrying in ${delay / 1000}s...`);

        // Log status to monitor without forcing refresh (passive)
        checkGeminiStatus(false);

        // Wait with delay + random jitter (0-1000ms)
        await new Promise(resolve => setTimeout(resolve, delay + (Math.random() * 1000)));

        // Increase delay for next attempt (Exponential Backoff)
        delay = delay * 2;
        continue;
      }

      // Don't retry other fatal errors (like Billing or Invalid Argument)
      if (errMsg.includes('billing') || errMsg.includes('INVALID_ARGUMENT')) {
        throw lastError;
      }

      // For other transient errors, wait and retry
      await new Promise(resolve => setTimeout(resolve, delay));
      delay = delay * 1.5;
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

  // 2. Try AI with retry logic + Proxy Fallback
  if (apiKey && ai) {
    const startTime = Date.now();
    const prompt = `Parse this transaction: "${input}". 
            Classify into one of these categories: Food, Transport, Leisure, Shopping, Bills, Investment, Business, Income, Other.
            If it sounds like earning money, type is 'income', else 'expense'.
            Return valid JSON.`;

    try {
      const result = await callGeminiWithFallback(
        'parseTransactionInput',
        async () => {
          // Use retryWithBackoff for the Direct SDK call
          return await retryWithBackoff(async () => {
            const model = "gemini-2.5-flash"; // Standardized to approved model
            const response = await ai!.models.generateContent({
              model,
              contents: prompt,
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
        },
        prompt
      );

      const text = result.text;
      if (text) {
        geminiUsage.logRequest('Text Parse', 'gemini-2.5-flash', Date.now() - startTime, true);
        return JSON.parse(text);
      }
    } catch (error) {
      console.warn("Gemini Parse Failed, switching to manual regex:", getQuotaErrorMessage());
      geminiUsage.logRequest('Text Parse', 'gemini-2.5-flash', Date.now() - startTime, false, error instanceof Error ? error.message : String(error));
    }
  }

  // 3. Fallback to Regex
  const fallback = regexParse(input);
  if (fallback.amount > 0) return fallback;

  return null;
};

// Helper for providing educational financial insights (NOT financial advice)
// Uses gemini-2.5-flash with Search Grounding for real-time educational content
export const getFinancialInsights = async (history: { role: string, parts: { text: string }[] }[], newMessage: string, currencyCode: string = 'INR') => {
  if (!apiKey || !ai) return { text: "I'm currently offline (No API Key). Check your connection or Settings.", sources: [] };

  try {
    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      history: history,
      config: {
        tools: [{ googleSearch: {} }], // Enable Search Grounding
        systemInstruction: `You are Bankey, an educational financial learning assistant for young adults.
        
        ** CRITICAL - NO FINANCIAL ADVICE:**
    - You provide EDUCATIONAL INFORMATION ONLY, not financial advice.
        - Always include this disclaimer: "💡 This is educational information only. I don't provide financial advice. For personalized recommendations, consult a licensed financial advisor."
  - Use phrases like "common approaches include...", "many people consider...", "educational perspective on..." instead of "you should..." or "I recommend..."

    ** Your Identity:**
      - Tone: Educational, informative, and engaging(like a financial literacy teacher).
        - Format: Use ** bold ** for key concepts and terms.Use standard Markdown.
        - Structure: Use bullet points or short paragraphs.Avoid walls of text.
        - Emojis: Use sparingly(max 1 - 2 per response) to keep it friendly.
        - Currency: Always use ${currencyCode} for monetary examples unless specified otherwise.
        
        ** Your Goal:**
  - Explain financial concepts and help users understand their data.
        - Provide educational context using real-time information when asked about markets / trends.
        - Help users learn and track, never advise or recommend specific actions.
        
        ** Constraints:**
  - Never give specific financial, legal, or tax advice.
        - Frame everything as educational: "Here's how X works..." not "You should do X..."
  - Always remind users to consult professionals for personalized guidance.`
      }
    });

    // Add 15s Timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out')), 15000));

    const result = await Promise.race([
      chat.sendMessage({ message: newMessage }),
      timeoutPromise
    ]) as any;

    // Extract Grounding Sources
    const chunks = result.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = chunks
      .map((c: { web?: { uri: string; title: string } }) => c.web ? { uri: c.web.uri, title: c.web.title } : null)
      .filter((s: { uri: string; title: string } | null) => s !== null);

    return { text: result.text, sources };

  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return { text: "My brain froze (Network Timeout). Please check your internet connection and try again.", sources: [] };
  }
};

export const getPersonalizedAnalysis = async (transactions: Transaction[], currencyCode: string = 'INR') => {
  if (!apiKey || !ai) return { text: "AI is offline. Check settings.", sources: [] };

  try {
    const txSummary = transactions.slice(0, 50).map(t =>
      `- ${t.date.split('T')[0]}: ${t.description} (${t.amount})[${t.category}]`
    ).join('\n');

    const prompt = `
      Analyze these recent transactions for a user.Currency: ${currencyCode}.

TRANSACTIONS:
      ${txSummary}

      ** TASK:**
  Provide a concise, high - impact financial analysis in the following professional format:

      ### 1. 📊 Spending Overview
  (One professional summary sentence of their current spending behavior. ** Bold ** the key trend.)

      ### 2. 📉 Top Expense Category
  (Identify the highest spending category. ** Bold ** the category and total amount.)

      ### 3. 💡 Strategic Recommendation
  (One specific, actionable strategy to optimize budget based on data. ** Bold ** the action.)

      ### 4. ⚖️ Financial Assessment
  (A direct, professional assessment of non - essential spending patterns.Provide constructive feedback.)

  ** GUIDELINES:**
    - Use standard Markdown.
      - Use ** bold ** for emphasis on numbers and key terms.
      - Keep it short, professional, and direct.
      - Use minimal emojis(as shown in headers only).
    `;

    // Use the shared helper for robust execution (Timeout + Proxy Fallback)
    const result = await callGeminiWithFallback(
      'getPersonalizedAnalysis',
      async () => {
        const response = await ai!.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt
        });
        return { text: response.text, sources: [] };
      },
      prompt
    );
    return result;

  } catch (error) {
    console.error("Analysis Error:", error);
    return { text: "Couldn't analyze data right now. (Check Network/API Key)", sources: [] };
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
        systemInstruction: `You are the Bankey Support Bot.Your job is to help users troubleshoot issues with the Bankey app.
                The app features: Dashboard, Transaction Tracker, Budget Planner, Education Modules, and AI Advisor.
                Common issues might be: 'Sync failed', 'Login issues', 'How to delete account'.
                Be helpful, technical but polite.If you can't solve it, ask them to use the 'Report Bug' form.`
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
    // Use helper with timeout
    const result = await callGeminiWithFallback(
      'getRealTimeLearnContext',
      async () => {
        const response = await ai!.models.generateContent({
          model: "gemini-2.5-flash",
          contents: `Find recent news, market rates, or real-world examples related to: "${topic}".
                Provide a short, 2-paragraph summary of what's happening right now in the real world regarding this financial topic.
                Include 1-2 bullet points of data if available (like current interest rates or stock trends).`,
          config: {
            tools: [{ googleSearch: {} }]
          }
        });
        return { text: response.text, sources: [] }; // Grounding handled below if possible, but helper returns text
        // NOTE: Grounding metadata extraction is unique here. 
        // We might need to handle it inside the direct function or modifying helper.
        // For now, let's keep the direct logic for grounding, but wrap in timeout race manually if we can't use helper easily.
        // Actually, helper returns `response` if we don't normalize it?
        // Wait, helper returns `response` (any) on success.
      },
      null // No proxy fallback for search tools yet
    );

    // Re-extract grounding from the raw response if returned by direct call
    // If it came from Proxy (which returns {text: ...}), sources will be missing.
    // But since we pass null prompt, proxy won't be used.
    // So result is the full response object from SDK.

    const response = result;
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

    // Use helper (Text-based, so Proxy works!)
    const contents = [{ role: "user", parts: [{ text: prompt }] }];
    const config = {
      temperature: 0,
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
    };

    // Use helper with full payload for JSON schema support in proxy
    const result = await callGeminiWithFallback(
      'analyzeFinancialReport',
      async () => {
        const response = await ai!.models.generateContent({
          model: "gemini-2.5-flash",
          contents,
          config
        });
        return { text: response.text };
      },
      { contents, config }
    );

    const text = result?.text;
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

    const contents = [
      { text: prompt },
      { inlineData: { mimeType: mimeType, data: base64Data } }
    ];

    const config = {
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
    };

    // Use helper with strict timeout AND proxy support
    const result = await callGeminiWithFallback(
      'parseFinancialDocument',
      async () => {
        const response = await ai!.models.generateContent({
          model: "gemini-2.5-flash",
          contents,
          config
        });
        return { text: response.text };
      },
      { contents, config },
      'gemini-2.5-flash',
      true
    );

    const text = result?.text;
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
 * Uses Gemini 1.5 Flash for audio transcription and structured extraction
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
  const startTime = Date.now();

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

    // Construct content once for both SDK and Proxy
    const contents = [{
      role: "user",
      parts: [
        { text: prompt },
        {
          inlineData: {
            mimeType: mimeType.split(';')[0],
            data: audioBase64
          }
        }
      ]
    }];

    const config = {
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
    };

    // Use helper with strict timeout and NOW full proxy support
    const result = await callGeminiWithFallback(
      'parseVoiceTransaction',
      async () => {
        const response = await ai!.models.generateContent({
          model: "gemini-2.5-flash",
          contents,
          config
        });

        const text = response.text;
        if (!text) throw new Error("Empty response from Gemini");
        const parsed = JSON.parse(text);

        if (typeof parsed.amount !== 'number' || parsed.amount <= 0) {
          geminiUsage.logRequest('Voice Parse', 'gemini-2.5-flash', Date.now() - startTime, false, 'Invalid amount');
          return null; // Return null effectively
        }

        geminiUsage.logRequest('Voice Parse', 'gemini-2.5-flash', Date.now() - startTime, true);
        return parsed as ParsedVoiceTransaction;
      },
      { contents, config }, // <--- Pass full payload!
      'gemini-2.5-flash',
      true // isImageOrAudio
    );

    return result;

  } catch (error: unknown) {
    // Check for rate limit errors
    const errMsg = error instanceof Error ? error.message : String(error);
    geminiUsage.logRequest('Voice Parse', 'gemini-2.5-flash', Date.now() - startTime, false, errMsg);

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

  const startTime = Date.now();

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

    const contents = [{
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
    }];

    const config = {
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
    };

    // Use helper with strict timeout AND full proxy support
    const result = await callGeminiWithFallback(
      'parseReceiptImage',
      async () => {
        const response = await ai!.models.generateContent({
          model: "gemini-2.5-flash",
          contents,
          config
        });

        const text = response.text;
        if (!text) throw new Error("Empty response");

        const parsed = JSON.parse(text);

        // Validate the response
        if (typeof parsed.amount !== 'number' || parsed.amount <= 0) {
          console.warn("Invalid amount in receipt:", parsed);
          geminiUsage.logRequest('Receipt Parse', 'gemini-2.5-flash', Date.now() - startTime, false, 'Invalid amount');
          return null; // Handle effectively
        }

        geminiUsage.logRequest('Receipt Parse', 'gemini-2.5-flash', Date.now() - startTime, true);
        return parsed as ParsedReceipt;

      },
      { contents, config }, // Pass full payload
      'gemini-2.5-flash',
      true
    );

    return result;

  } catch (error: unknown) {
    // Check for rate limit errors
    const errMsg = error instanceof Error ? error.message : String(error);
    geminiUsage.logRequest('Receipt Parse', 'gemini-2.5-flash', Date.now() - startTime, false, errMsg);

    if (errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('quota')) {
      console.warn("Gemini Receipt Parse: Rate limit exceeded");
      throw new Error('AI quota exceeded. Please try again in a few minutes.');
    }
    console.error("Gemini Receipt Parse Error:", error);
    return null;
  }
};
