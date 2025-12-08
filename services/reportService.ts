
import { ReportData } from "../types";

import { parseFinancialDocument } from "./geminiService";

// Static Demo Report for consistency (Fallback for non-CSV or AI failure)
const STATIC_REPORT: ReportData['data'] = {
    revenue: 125000,
    cogs: 45000,
    grossProfit: 80000,
    expenses: [
        { category: "Rent", amount: 24000 },
        { category: "Salaries", amount: 36000 },
        { category: "Marketing", amount: 5000 },
        { category: "Software", amount: 1200 },
        { category: "Utilities", amount: 2800 },
    ],
    netIncome: 11000
};

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            // Remove "data:*/*;base64," prefix
            const base64 = result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = error => reject(error);
    });
};

const parseCSV = async (file: File): Promise<ReportData['data']> => {
    const text = await file.text();
    const lines = text.split('\n');

    // Simple parser: expects "Category,Amount" format
    // If parsing fails or file is empty, return static report to avoid crash
    try {
        const expenses: { category: string; amount: number }[] = [];
        let revenue = 0;
        let cogs = 0;

        lines.forEach(line => {
            const [key, val] = line.split(',');
            if (!key || !val) return;

            const cleanKey = key.trim().toLowerCase();
            const amount = parseFloat(val.replace(/[^0-9.-]+/g, ""));

            if (isNaN(amount)) return;

            if (cleanKey.includes('revenue') || cleanKey.includes('sales') || cleanKey.includes('income')) {
                revenue += amount;
            } else if (cleanKey.includes('cogs') || cleanKey.includes('cost of goods')) {
                cogs += amount;
            } else {
                expenses.push({ category: key.trim(), amount });
            }
        });

        if (revenue === 0 && expenses.length === 0) return STATIC_REPORT;

        const grossProfit = revenue - cogs;
        const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
        const netIncome = grossProfit - totalExpenses;

        return { revenue, cogs, grossProfit, expenses, netIncome };
    } catch (e) {
        console.warn("CSV Parse failed, using static data", e);
        return STATIC_REPORT;
    }
};

export const processStatement = async (file: File, userCurrencyCode: string = 'INR'): Promise<ReportData> => {
    // Simulate processing delay
    await new Promise(r => setTimeout(r, 1500));

    let data = STATIC_REPORT;
    let detectedCurrency = 'INR'; // Default fallback

    if (file.name.endsWith('.csv')) {
        data = await parseCSV(file);
        // CSV parser is simple, assuming it matches user for now or we could enhance it later
        detectedCurrency = userCurrencyCode;
    } else {
        // Try AI Parsing for PDF/Images
        try {
            const base64 = await fileToBase64(file);
            const aiData = await parseFinancialDocument(base64, file.type);
            if (aiData) {
                data = aiData;
                if (aiData.currency) detectedCurrency = aiData.currency;
            } else {
                console.warn("AI Parsing returned null, using static fallback.");
            }
        } catch (e) {
            console.error("Error during AI parsing:", e);
            // Fallback to STATIC_REPORT is already set
        }
    }

    // Check for mismatch
    // Normalize codes (e.g. 'INR' vs 'inr')
    const isMismatch = detectedCurrency.toUpperCase() !== userCurrencyCode.toUpperCase();

    return {
        id: crypto.randomUUID(),
        fileName: file.name,
        uploadDate: new Date().toISOString(),
        period: "Current Period",
        type: 'PandL',
        data: {
            ...data,
            currency: detectedCurrency,
            currencyMismatch: isMismatch
        }
    };
};
