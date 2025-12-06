
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { LEGAL_ENTITY, LAST_UPDATED } from './LegalData';

interface LegalLayoutProps {
    title: string;
    children: React.ReactNode;
}

const LegalLayout: React.FC<LegalLayoutProps> = ({ title, children }) => {

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-paper font-sans">
            {/* Simple Header */}
            <nav className="border-b border-gray-200 bg-white sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 text-ink hover:text-banky-blue transition-colors group">
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-bold uppercase font-display tracking-wider text-sm">Back to Home</span>
                    </Link>
                    <div className="flex items-center gap-2 text-gray-500">
                        <ShieldCheck className="w-5 h-5" />
                        <span className="font-bold text-xs uppercase tracking-widest hidden sm:inline">Legal Center</span>
                    </div>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-6 py-12 md:py-20">
                <div className="mb-12 border-b-2 border-ink pb-8">
                    <h1 className="text-4xl md:text-5xl font-black uppercase font-display mb-4 text-ink">{title}</h1>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-gray-600 font-medium">
                        <p>Operated by <span className="font-bold text-ink">{LEGAL_ENTITY}</span></p>
                        <span className="hidden sm:inline text-gray-300">•</span>
                        <p>Last Updated: {LAST_UPDATED}</p>
                    </div>
                </div>

                <div className="prose prose-lg max-w-none prose-headings:font-display prose-headings:uppercase prose-headings:font-black prose-p:text-gray-600 prose-p:leading-relaxed prose-strong:text-ink prose-li:text-gray-600">
                    {children}
                </div>
            </main>

            <footer className="bg-ink text-paper py-12 border-t-4 border-banky-yellow">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <p className="font-bold uppercase tracking-widest text-sm mb-4">© {new Date().getFullYear()} {LEGAL_ENTITY}</p>
                    <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-gray-400">
                        <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                        <Link to="/data-protection" className="hover:text-white transition-colors">Data Protection</Link>
                        <Link to="/cancellation" className="hover:text-white transition-colors">Cancellation Policy</Link>
                        <Link to="/shipping" className="hover:text-white transition-colors">Shipping Policy</Link>
                        <Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link>
                        <Link to="/disclaimers" className="hover:text-white transition-colors">Disclaimers</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LegalLayout;
