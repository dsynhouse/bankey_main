import React from 'react';
import { financialLiteracyData } from '../../data/financialLiteracyData';
import { BookOpen, ChevronRight, Wallet, CreditCard, FileText, TrendingUp, Rocket, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';

const KnowledgeBank: React.FC = () => {
    const getIcon = (iconName: string) => {
        switch (iconName) {
            case 'Wallet': return <Wallet className="w-6 h-6" />;
            case 'CreditCard': return <CreditCard className="w-6 h-6" />;
            case 'FileText': return <FileText className="w-6 h-6" />;
            case 'TrendingUp': return <TrendingUp className="w-6 h-6" />;
            case 'Rocket': return <Rocket className="w-6 h-6" />;
            case 'Briefcase': return <Briefcase className="w-6 h-6" />;
            default: return <BookOpen className="w-6 h-6" />;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="space-y-2">
                <h1 className="text-4xl font-black italic tracking-tighter font-display text-ink uppercase">
                    Knowledge Bank
                </h1>
                <p className="text-gray-500 text-lg max-w-2xl">
                    Master your money. From broke student to venture capitalist, we've got the blueprint.
                </p>
            </header>

            <div className="grid gap-8">
                {financialLiteracyData.map((category) => (
                    <div key={category.id} className="space-y-4">
                        <div className="flex items-center gap-3 border-b-2 border-ink pb-2">
                            <h2 className="text-2xl font-bold font-display uppercase tracking-wider text-ink">
                                {category.title}
                            </h2>
                        </div>
                        <p className="text-gray-600 italic">{category.description}</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {category.modules.map((module) => (
                                <Link
                                    key={module.id}
                                    to={`/knowledge-bank/module/${module.id}`}
                                    className="group relative bg-white border-2 border-ink p-6 shadow-neo hover:-translate-y-1 hover:shadow-neo-lg transition-all text-left flex flex-col h-full"
                                >
                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ChevronRight className="w-6 h-6 text-ink" />
                                    </div>

                                    <div className="mb-4 p-3 bg-banky-yellow w-fit border-2 border-ink rounded-lg group-hover:bg-banky-pink transition-colors">
                                        {getIcon(module.icon)}
                                    </div>

                                    <h3 className="text-xl font-bold mb-2 group-hover:text-banky-blue transition-colors">
                                        {module.title}
                                    </h3>

                                    <p className="text-sm text-gray-500 mb-4 flex-1">
                                        {module.description}
                                    </p>

                                    <div className="flex items-center justify-between mt-auto pt-4 border-t-2 border-gray-100">
                                        <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded border-2 border-ink ${module.level === 'Beginner' ? 'bg-green-100' :
                                            module.level === 'Intermediate' ? 'bg-blue-100' :
                                                module.level === 'Advanced' ? 'bg-purple-100' :
                                                    'bg-red-100'
                                            }`}>
                                            {module.level}
                                        </span>
                                        <span className="text-xs font-mono text-gray-400">
                                            {module.lessons.length} Lessons
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default KnowledgeBank;
