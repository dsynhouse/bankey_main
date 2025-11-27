
import { ReportData } from "../types";

// Mock Data Generator for P&L
const generatePandL = (): ReportData['data'] => {
    const revenue = Math.floor(Math.random() * 50000) + 20000;
    const cogs = Math.floor(revenue * 0.3); // 30% COGS
    const grossProfit = revenue - cogs;

    const expenses = [
        { category: "Rent & Utilities", amount: Math.floor(Math.random() * 2000) + 1000 },
        { category: "Marketing", amount: Math.floor(Math.random() * 1500) + 500 },
        { category: "Software & Tools", amount: Math.floor(Math.random() * 500) + 200 },
        { category: "Salaries", amount: Math.floor(Math.random() * 5000) + 3000 },
        { category: "Travel", amount: Math.floor(Math.random() * 800) + 100 },
    ];

    const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const netIncome = grossProfit - totalExpenses;

    return {
        revenue,
        cogs,
        grossProfit,
        expenses,
        netIncome
    };
};



export const processStatement = async (file: File): Promise<ReportData> => {
    // Simulate processing delay
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                id: crypto.randomUUID(),
                fileName: file.name,
                uploadDate: new Date().toISOString(),
                period: "2024",
                type: 'PandL', // Defaulting to P&L for demo, realistically would detect
                data: generatePandL()
            });
        }, 3000); // 3 seconds to simulate "encryption" and "parsing"
    });
};
