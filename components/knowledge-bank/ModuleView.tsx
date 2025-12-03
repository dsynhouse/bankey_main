import React from 'react';
import { getModuleById } from '../../data/financialLiteracyData';
import { ArrowLeft, Clock, PlayCircle } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';

const ModuleView: React.FC = () => {
    const { moduleId } = useParams<{ moduleId: string }>();
    const navigate = useNavigate();
    const module = moduleId ? getModuleById(moduleId) : undefined;

    if (!module) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-ink">Module not found</h2>
                <button onClick={() => navigate('/knowledge-bank')} className="text-banky-blue underline mt-4">
                    Back to Knowledge Bank
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
            <Link
                to="/knowledge-bank"
                className="flex items-center gap-2 text-gray-500 hover:text-ink transition-colors font-bold"
            >
                <ArrowLeft className="w-4 h-4" /> Back to Knowledge Bank
            </Link>

            <header className="space-y-4 border-b-2 border-ink pb-8">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-banky-yellow border-2 border-ink rounded-xl shadow-neo">
                        <span className="text-2xl font-black">#</span>
                    </div>
                    <div>
                        <h1 className="text-3xl font-black italic tracking-tighter font-display text-ink">
                            {module.title}
                        </h1>
                        <p className="text-gray-500 text-lg">
                            {module.description}
                        </p>
                    </div>
                </div>

                <div className="flex gap-4">
                    <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border-2 border-ink ${module.level === 'Beginner' ? 'bg-green-100' :
                        module.level === 'Intermediate' ? 'bg-blue-100' :
                            module.level === 'Advanced' ? 'bg-purple-100' :
                                'bg-red-100'
                        }`}>
                        {module.level}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border-2 border-ink bg-gray-100">
                        {module.lessons.length} Lessons
                    </span>
                </div>
            </header>

            <div className="space-y-4">
                <h2 className="text-xl font-bold font-display uppercase tracking-wider text-ink mb-6">
                    Module Content
                </h2>

                <div className="grid gap-4">
                    {module.lessons.map((lesson, index) => (
                        <Link
                            key={lesson.id}
                            to={`/knowledge-bank/lesson/${lesson.id}`}
                            className="group flex items-center gap-4 p-4 bg-white border-2 border-ink rounded-xl shadow-sm hover:shadow-neo hover:-translate-y-1 transition-all w-full text-left"
                        >
                            <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-gray-100 border-2 border-ink rounded-full font-black text-gray-400 group-hover:bg-banky-blue group-hover:text-white transition-colors">
                                {index + 1}
                            </div>

                            <div className="flex-1">
                                <h3 className="text-lg font-bold group-hover:text-banky-blue transition-colors">
                                    {lesson.title}
                                </h3>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Clock className="w-3 h-3" />
                                    <span>{lesson.duration}</span>
                                </div>
                            </div>

                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <PlayCircle className="w-6 h-6 text-banky-blue" />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ModuleView;
