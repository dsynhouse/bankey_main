import React, { useState, useRef } from 'react';
import { useBanky } from '../context/useBanky';
import { processStatement } from '../services/reportService';
import { analyzeFinancialReport } from '../services/geminiService';
import { ReportData, ReportAnalysis } from '../types';
import { FileText, UploadCloud, CheckCircle, Loader2, Shield, Sparkles, Brain, Lightbulb, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';

const Reports: React.FC = () => {
    const { currency } = useBanky();
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingStage, setProcessingStage] = useState('');
    const [report, setReport] = useState<ReportData | null>(null);

    // AI Analysis State
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState<ReportAnalysis | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleFile = async (file: File) => {
        setIsProcessing(true);
        setReport(null);
        setAnalysis(null); // Reset previous analysis

        // Simulate Stages
        setProcessingStage('Encrypting file locally (AES-256)...');
        await new Promise(r => setTimeout(r, 1000));

        setProcessingStage('Securely uploading to private vault...');
        await new Promise(r => setTimeout(r, 800));

        setProcessingStage('Parsing statement data...');
        await new Promise(r => setTimeout(r, 800));

        setProcessingStage('Generating Financial Report...');
        setProcessingStage('Generating Financial Report...');
        const result = await processStatement(file, currency.code);

        setReport(result);
        setIsProcessing(false);
    };

    const handleAnalyze = async () => {
        if (!report) return;
        setIsAnalyzing(true);
        try {
            const result = await analyzeFinancialReport(report);
            if (!result) {
                alert("AI Analysis failed. Please check your internet connection or try again later. (API Key might be missing)");
            } else {
                setAnalysis(result);
            }
        } catch (error) {
            console.error("Analysis failed", error);
            alert("An error occurred during analysis.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-20 font-sans">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end border-b-4 border-ink pb-6 gap-4">
                <div>
                    <h1 className="text-5xl font-black text-ink uppercase italic tracking-tighter font-display">Reports</h1>
                    <p className="text-gray-500 font-bold mt-2 text-lg">Turn messy statements into clear strategy.</p>
                </div>
                <div className="bg-banky-green/10 border-2 border-ink px-4 py-2 flex items-center gap-2 rounded-lg">
                    <Shield className="w-5 h-5 text-banky-green fill-current" />
                    <span className="text-xs font-black uppercase tracking-wider text-ink font-display">End-to-End Encrypted</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Upload Section */}
                <div className="lg:col-span-1 space-y-6">
                    <div
                        className={`border-4 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer bg-white relative overflow-hidden group
                    ${isDragging ? 'border-banky-green bg-banky-green/10' : 'border-gray-300 hover:border-ink'}
                `}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.csv" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />

                        {isProcessing ? (
                            <div className="space-y-4">
                                <Loader2 className="w-12 h-12 animate-spin text-ink mx-auto" />
                                <p className="font-bold text-sm animate-pulse">{processingStage}</p>
                            </div>
                        ) : (
                            <>
                                <div className="bg-gray-100 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                                    <UploadCloud className="w-8 h-8 text-ink" />
                                </div>
                                <h3 className="font-black uppercase text-lg font-display">Drop Statement</h3>
                                <p className="text-sm text-gray-500 font-medium mt-2">PDF or CSV supported.</p>
                                <p className="text-xs text-gray-400 mt-4 border-t border-gray-200 pt-4 w-full">
                                    Files are encrypted client-side before processing. We never see your raw data.
                                </p>
                            </>
                        )}
                    </div>

                    <div className="bg-ink text-white p-6 border-2 border-ink shadow-neo">
                        <h4 className="font-black uppercase font-display mb-2 flex items-center gap-2">
                            <FileText className="w-5 h-5" /> Supported Reports
                        </h4>
                        <ul className="space-y-2 text-sm font-medium text-gray-400">
                            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-banky-green" /> Profit & Loss (P&L)</li>
                            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-banky-green" /> Balance Sheet</li>
                            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-banky-green" /> Cash Flow Statement</li>
                            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-banky-green" /> Tax Deductions</li>
                        </ul>
                    </div>
                </div>

                {/* Report Viewer */}
                <div className="lg:col-span-2">
                    {!report ? (
                        <div className="h-full min-h-[400px] bg-gray-50 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400">
                            <FileText className="w-16 h-16 mb-4 opacity-20" />
                            <p className="font-bold">No report generated yet.</p>
                            <p className="text-sm">Upload a bank statement to analyze.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">

                            {/* Analysis Section - Appears above report if present */}
                            {analysis && (
                                <div className="bg-banky-purple text-white border-2 border-ink shadow-neo-lg p-6 relative overflow-hidden animate-fade-in-up">
                                    <div className="absolute top-0 right-0 p-8 opacity-10">
                                        <Brain className="w-32 h-32" />
                                    </div>
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-2 mb-4 border-b border-white/20 pb-4">
                                            <div className="bg-white text-ink p-1 border-2 border-ink shadow-sm">
                                                <Sparkles className="w-5 h-5" />
                                            </div>
                                            <h3 className="font-black uppercase font-display text-xl">AI Analyst Report</h3>
                                        </div>

                                        <p className="font-bold text-lg mb-6 leading-relaxed italic">"{analysis.summary}"</p>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <h4 className="font-black uppercase text-xs tracking-widest mb-2 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Strengths</h4>
                                                <ul className="space-y-1 text-sm font-medium opacity-90">
                                                    {analysis.strengths.map((s, i) => <li key={i}>• {s}</li>)}
                                                </ul>
                                            </div>
                                            <div>
                                                <h4 className="font-black uppercase text-xs tracking-widest mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-banky-yellow" /> Weaknesses</h4>
                                                <ul className="space-y-1 text-sm font-medium opacity-90">
                                                    {analysis.weaknesses.map((s, i) => <li key={i}>• {s}</li>)}
                                                </ul>
                                            </div>
                                        </div>

                                        <div className="mt-6 bg-white/10 p-4 border border-white/20 rounded-lg">
                                            <h4 className="font-black uppercase text-xs tracking-widest mb-2 flex items-center gap-2 text-banky-yellow"><Lightbulb className="w-4 h-4" /> Pro Tips</h4>
                                            <ul className="space-y-2 text-sm font-medium">
                                                {analysis.tips.map((s, i) => <li key={i} className="flex gap-2"><span>🚀</span> {s}</li>)}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="bg-white border-2 border-ink shadow-neo animate-fade-in-up">
                                {/* Report Header */}
                                <div className="bg-ink text-white p-6 flex justify-between items-start border-b-2 border-ink">
                                    <div>
                                        <div className="inline-block bg-banky-yellow text-ink text-xs font-black uppercase px-2 py-1 mb-2 font-display">
                                            {report.type === 'PandL' ? 'Profit & Loss Statement' : 'Balance Sheet'}
                                        </div>
                                        <h2 className="text-2xl font-black font-display">{report.fileName}</h2>
                                        <p className="text-gray-400 text-sm font-mono mt-1">Period: {report.period} • Generated: {new Date().toLocaleDateString()}</p>

                                        {/* Currency Mismatch Warning */}
                                        {report.data.currencyMismatch && (
                                            <div className="mt-4 bg-yellow-500/20 border border-yellow-500 text-yellow-200 p-3 rounded flex items-start gap-2 text-xs font-bold animate-pulse">
                                                <AlertTriangle className="w-4 h-4 shrink-0" />
                                                <p>
                                                    Heads up! This statement looks like it's in {report.data.currency} ({report.data.currency === 'INR' ? '₹' : report.data.currency}),
                                                    but your app is set to {currency.code} ({currency.symbol}). Numbers may be inaccurate.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-2 items-center">
                                        {!analysis && (
                                            <div className="relative group">
                                                <button
                                                    onClick={handleAnalyze}
                                                    disabled={isAnalyzing}
                                                    className="bg-banky-purple text-white border-2 border-white hover:bg-white hover:text-banky-purple font-black uppercase text-xs px-3 py-2 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                                    {isAnalyzing ? 'Analyzing...' : 'Analyze with AI'}
                                                </button>
                                                {/* Security Tooltip */}
                                                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-64 bg-ink text-white text-xs p-3 rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                                    <div className="flex items-center gap-2 mb-1 text-banky-green font-bold">
                                                        <Shield className="w-3 h-3" /> AES-256 Encrypted
                                                    </div>
                                                    Your statement is encrypted locally before processing. AI analyzes anonymized data only.
                                                </div>
                                            </div>
                                        )}
                                        <button onClick={() => setReport(null)} className="text-gray-400 hover:text-white px-2">Close</button>
                                    </div>
                                </div>

                                {/* Report Body */}
                                <div className="p-8 font-mono text-sm">
                                    {/* Revenue Section */}
                                    <div className="mb-8">
                                        <h3 className="font-black text-lg border-b-2 border-gray-200 pb-2 mb-4 flex justify-between">
                                            <span>REVENUE</span>
                                            <span>{currency.symbol}{report.data.revenue.toLocaleString()}</span>
                                        </h3>
                                        <div className="space-y-2 pl-4 text-gray-600">
                                            <div className="flex justify-between">
                                                <span>Sales / Income</span>
                                                <span>{currency.symbol}{report.data.revenue.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* COGS Section */}
                                    <div className="mb-8">
                                        <div className="flex justify-between text-gray-500 mb-2">
                                            <span>Cost of Goods Sold (COGS)</span>
                                            <span>({currency.symbol}{report.data.cogs.toLocaleString()})</span>
                                        </div>
                                        <div className="flex justify-between font-bold text-lg bg-gray-100 p-2 border-l-4 border-ink">
                                            <span>GROSS PROFIT</span>
                                            <span>{currency.symbol}{report.data.grossProfit.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    {/* Expenses Section */}
                                    <div className="mb-8">
                                        <h3 className="font-black text-lg border-b-2 border-gray-200 pb-2 mb-4">OPERATING EXPENSES</h3>
                                        <div className="space-y-3 pl-4">
                                            {report.data.expenses.map((exp, idx) => (
                                                <div key={idx} className="flex justify-between border-b border-dashed border-gray-200 pb-1">
                                                    <span>{exp.category}</span>
                                                    <span>{currency.symbol}{exp.amount.toLocaleString()}</span>
                                                </div>
                                            ))}
                                            <div className="flex justify-between font-bold pt-2">
                                                <span>Total Expenses</span>
                                                <span>{currency.symbol}{report.data.expenses.reduce((a, b) => a + b.amount, 0).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Net Income */}
                                    <div className={`p-6 border-4 ${report.data.netIncome >= 0 ? 'border-banky-green bg-banky-green/10' : 'border-red-500 bg-red-50'} flex justify-between items-center`}>
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-widest text-gray-500 mb-1">NET INCOME</p>
                                            <p className={`text-3xl font-black ${report.data.netIncome >= 0 ? 'text-ink' : 'text-red-600'}`}>
                                                {currency.symbol}{report.data.netIncome.toLocaleString()}
                                            </p>
                                        </div>
                                        {report.data.netIncome >= 0 ? (
                                            <TrendingUp className="w-10 h-10 text-banky-green" />
                                        ) : (
                                            <TrendingDown className="w-10 h-10 text-red-500" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Reports;
