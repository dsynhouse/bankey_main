
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { getFinancialAdvice, getPersonalizedAnalysis } from '../services/geminiService';
import { ChatMessage } from '../types';
import { Send, Bot, User, Sparkles, ExternalLink, Globe, BarChart3 } from 'lucide-react';
import { PremiumUpgradeCTA } from './PremiumUpgradeCTA';
import { useBanky } from '../context/useBanky';
import { usePremium } from '../context/usePremium';

const Advisor: React.FC = () => {
  const { transactions, currency } = useBanky();
  const { isPremium } = usePremium();
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    { id: '1', role: 'model', text: 'Hello! I\'m Bankey AI. I\'m here to help you optimize your finances. Ask me anything about budgeting, investments, or analyzing your spending habits.', timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    const response = await getFinancialAdvice(history, userMsg.text, currency.code);

    const botMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'model',
      text: response.text || "Sorry, I couldn't generate a response.",
      timestamp: Date.now(),
      sources: response.sources
    };

    setMessages(prev => [...prev, botMsg]);
    setIsTyping(false);
  };

  const handleAnalysis = async () => {
    if (!isPremium) {
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'model',
        text: "🔒 **Deep Analysis is a Premium Feature!**\n\nUpgrade to get personalized insights on your spending habits.",
        timestamp: Date.now()
      }]);
      return;
    }

    setIsTyping(true);
    // User triggered analysis
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      text: "Analyze my spending patterns!",
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMsg]);

    const result = await getPersonalizedAnalysis(transactions, currency.code);

    setMessages(prev => [...prev, {
      id: crypto.randomUUID(),
      role: 'model',
      text: result.text || "Analysis failed.",
      timestamp: Date.now()
    }]);
    setIsTyping(false);
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col pb-4 font-sans">
      <div className="mb-6 border-b-4 border-ink pb-4 flex flex-wrap gap-4 items-center justify-between">
        <div>
          <h1 className="text-4xl sm:text-5xl font-black text-ink uppercase italic tracking-tighter font-display">Hype Man</h1>
          <p className="text-gray-500 font-bold">Real-time stats. Real-time facts.</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={handleAnalysis}
            disabled={isTyping}
            className="bg-banky-purple text-white border-2 border-ink py-2 px-3 sm:px-4 shadow-neo hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all font-black uppercase text-xs sm:text-sm flex items-center gap-1 sm:gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" /> <span className="hidden xs:inline">Quick</span> Analysis
          </button>
          <div className="bg-banky-yellow border-2 border-ink p-2 shadow-neo hidden md:block rotate-6">
            <Sparkles className="w-8 h-8 text-ink" />
          </div>
        </div>
      </div>

      {/* Premium Upgrade Banner */}
      <PremiumUpgradeCTA variant="banner" context="advisor" className="mb-4 border-2 border-ink" />

      <div className="flex-1 bg-white border-2 border-ink shadow-neo overflow-hidden flex flex-col relative">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 relative z-10">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-12 h-12 border-2 border-ink shadow-neo-sm flex items-center justify-center flex-shrink-0 ${msg.role === 'model' ? 'bg-banky-green' : 'bg-banky-pink'
                }`}>
                {msg.role === 'model' ? <Bot className="w-6 h-6 text-ink" /> : <User className="w-6 h-6 text-ink" />}
              </div>

              <div className={`max-w-[80%] p-5 border-2 border-ink shadow-neo-sm relative ${msg.role === 'model'
                ? 'bg-white text-ink mr-12'
                : 'bg-ink text-white ml-12'
                }`}>
                {/* Speech Bubble Tail */}
                <div className={`absolute top-4 w-4 h-4 border-2 border-ink transform rotate-45 ${msg.role === 'model'
                  ? '-left-2 bg-white border-r-0 border-t-0'
                  : '-right-2 bg-ink border-l-0 border-b-0'
                  }`}></div>

                <div className="text-lg leading-snug font-sans markdown-content">
                  <ReactMarkdown
                    components={{
                      strong: ({ node: _node, ...props }) => <span className="font-black text-current" {...props} />,
                      ul: ({ node: _node, ...props }) => <ul className="list-disc pl-4 my-2" {...props} />,
                      li: ({ node: _node, ...props }) => <li className="mb-1" {...props} />,
                      h1: ({ node: _node, ...props }) => <h1 className="text-xl font-black uppercase my-2" {...props} />,
                      h2: ({ node: _node, ...props }) => <h2 className="text-lg font-black uppercase my-2" {...props} />,
                      h3: ({ node: _node, ...props }) => <h3 className="text-base font-black uppercase my-1" {...props} />,
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                </div>

                {/* Sources Display */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-4 pt-3 border-t-2 border-gray-100/50">
                    <p className="text-[10px] font-black uppercase text-gray-400 mb-2 flex items-center gap-1">
                      <Globe className="w-3 h-3" /> Sources
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {msg.sources.map((src, i) => (
                        <a
                          key={i}
                          href={src.uri}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs bg-gray-100 hover:bg-banky-yellow text-ink px-2 py-1 rounded border border-gray-300 hover:border-ink transition-colors flex items-center gap-1 font-bold"
                        >
                          {src.title} <ExternalLink className="w-3 h-3" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <span className={`text-[10px] font-mono block mt-2 opacity-50 uppercase ${msg.role === 'user' ? 'text-right' : ''}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-4">
              <div className="w-12 h-12 border-2 border-ink bg-banky-green flex items-center justify-center">
                <Bot className="w-6 h-6 text-ink" />
              </div>
              <div className="bg-white border-2 border-ink p-4 flex items-center gap-2 shadow-neo-sm">
                <div className="w-2 h-2 bg-ink rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-ink rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-ink rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-banky-yellow border-t-2 border-ink">
          <form onSubmit={handleSend} className="flex gap-2 relative">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Spill the tea on finance..."
              className="w-full bg-white border-2 border-ink text-ink font-bold placeholder-gray-400 px-6 py-4 focus:outline-none focus:shadow-neo-sm transition-shadow text-lg font-sans"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="px-6 bg-ink text-white border-2 border-ink hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-neo hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
            >
              <Send className="w-6 h-6" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Advisor;