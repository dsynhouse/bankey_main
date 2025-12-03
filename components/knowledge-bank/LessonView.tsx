import React from 'react';
import { getLessonById } from '../../data/financialLiteracyData';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Link, useParams, useNavigate } from 'react-router-dom';

const LessonView: React.FC = () => {
    const { lessonId } = useParams<{ lessonId: string }>();
    const navigate = useNavigate();
    const data = lessonId ? getLessonById(lessonId) : undefined;

    if (!data) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-ink">Lesson not found</h2>
                <button onClick={() => navigate('/knowledge-bank')} className="text-banky-blue underline mt-4">
                    Back to Knowledge Bank
                </button>
            </div>
        );
    }

    const { lesson, module } = data;

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
            <Link
                to={`/knowledge-bank/module/${module.id}`}
                className="flex items-center gap-2 text-gray-500 hover:text-ink transition-colors font-bold"
            >
                <ArrowLeft className="w-4 h-4" /> Back to Module
            </Link>

            <article className="bg-white border-2 border-ink p-8 md:p-12 shadow-neo rounded-xl">
                <header className="mb-8 border-b-2 border-gray-100 pb-8">
                    <div className="flex items-center gap-2 text-sm font-bold text-banky-blue uppercase tracking-widest mb-2">
                        <span>Lesson</span>
                        <span>•</span>
                        <span>{lesson.duration}</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter font-display text-ink mb-4">
                        {lesson.title}
                    </h1>
                </header>

                <div className="font-sans">
                    <ReactMarkdown
                        components={{
                            h1: ({ node, ...props }) => <h1 className="text-3xl font-black font-display uppercase text-ink mt-10 mb-6 border-b-4 border-banky-yellow inline-block pr-4" {...props} />,
                            h2: ({ node, ...props }) => <h2 className="text-2xl font-black font-display uppercase text-ink mt-10 mb-4 flex items-center gap-2" {...props} />,
                            h3: ({ node, ...props }) => <h3 className="text-xl font-black font-display uppercase text-ink mt-8 mb-3 text-banky-blue" {...props} />,
                            p: ({ node, ...props }) => <p className="text-lg leading-relaxed text-gray-700 mb-6" {...props} />,
                            ul: ({ node, ...props }) => <ul className="list-disc list-outside ml-6 space-y-3 mb-8 text-gray-700" {...props} />,
                            ol: ({ node, ...props }) => <ol className="list-decimal list-outside ml-6 space-y-3 mb-8 text-gray-700" {...props} />,
                            li: ({ node, ...props }) => <li className="pl-2 leading-relaxed" {...props} />,
                            strong: ({ node, ...props }) => <strong className="font-black text-ink bg-banky-yellow/20 px-1 rounded" {...props} />,
                            blockquote: ({ node, ...props }) => (
                                <blockquote className="border-l-8 border-banky-purple bg-gray-50 p-6 my-8 rounded-r-xl italic text-gray-600 shadow-sm" {...props} />
                            ),
                            code: ({ node, ...props }) => (
                                <code className="bg-gray-100 text-banky-pink font-mono font-bold px-2 py-1 rounded text-sm border border-gray-200" {...props} />
                            ),
                        }}
                    >
                        {lesson.content}
                    </ReactMarkdown>
                </div>

                {lesson.resources && lesson.resources.length > 0 && (
                    <div className="mt-12 pt-8 border-t-2 border-gray-100">
                        <h3 className="text-xl font-black text-ink mb-4 flex items-center gap-2">
                            <span className="bg-banky-yellow px-2 py-1 border-2 border-ink shadow-neo-sm text-sm">RESOURCES</span>
                            Learn More
                        </h3>
                        <div className="grid gap-3">
                            {lesson.resources.map((resource, index) => (
                                <a
                                    key={index}
                                    href={resource.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-ink hover:shadow-neo transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gray-50 rounded-md group-hover:bg-banky-yellow/20 transition-colors">
                                            {resource.type === 'video' ? (
                                                <svg className="w-5 h-5 text-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            ) : resource.type === 'tool' ? (
                                                <svg className="w-5 h-5 text-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5 text-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                                </svg>
                                            )}
                                        </div>
                                        <span className="font-bold text-ink group-hover:text-banky-pink transition-colors">{resource.title}</span>
                                    </div>
                                    <svg className="w-4 h-4 text-gray-400 group-hover:text-ink group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mt-12 pt-8 border-t-2 border-gray-100 flex justify-center">
                    <Link
                        to={`/knowledge-bank/module/${module.id}`}
                        className="flex items-center gap-2 px-8 py-4 bg-banky-green text-white font-black uppercase tracking-wider border-2 border-ink shadow-neo hover:-translate-y-1 hover:shadow-neo-lg active:translate-y-0 active:shadow-none transition-all rounded-lg"
                    >
                        <CheckCircle className="w-6 h-6" />
                        Complete Lesson
                    </Link>
                </div>
            </article>
        </div>
    );
};

export default LessonView;
