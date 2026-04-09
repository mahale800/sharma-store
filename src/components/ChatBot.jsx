import React, { useEffect, useState } from 'react';
import { Bot, Clock3, Lightbulb, MessageCircle, Sparkles, X } from 'lucide-react';
import { usePerformance } from '../hooks/usePerformance';
import { useEngagement } from '../hooks/useEngagement';

const featureHighlights = [
    'Instant stationery recommendations',
    'Order help and shopping guidance',
    'Smarter support in the next update'
];

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState('assistant');
    const { shouldAnimate } = usePerformance();
    const { logEvent } = useEngagement();

    useEffect(() => {
        const handleOpenFeedback = () => {
            setMode('feedback');
            setIsOpen(true);
        };

        window.addEventListener('openFeedback', handleOpenFeedback);
        return () => window.removeEventListener('openFeedback', handleOpenFeedback);
    }, []);

    const openPanel = (nextMode = 'assistant') => {
        setMode(nextMode);
        setIsOpen(true);
        logEvent('chatbot_teaser_open', 'engagement', { mode: nextMode });
    };

    const handleSupportClick = () => {
        logEvent('chatbot_teaser_support_click', 'support');
        window.open('https://wa.me/919021780559', '_blank', 'noopener,noreferrer');
    };

    const heading = mode === 'feedback' ? 'Feedback Portal Upgrade' : 'Sharma AI Is Coming Soon';
    const subcopy = mode === 'feedback'
        ? 'The in-app feedback assistant is being refined for the next update. For now, please use direct support.'
        : 'Our chatbot preview is temporarily unavailable on the live website. A better version is planned for the next update.';

    return (
        <div className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40 font-sans">
            {!isOpen && (
                <button
                    onClick={() => openPanel('assistant')}
                    className={`relative w-14 h-14 bg-slate-900 hover:bg-black text-white rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-110 active:scale-95 ${shouldAnimate ? 'animate-breathe' : ''}`}
                    aria-label="Open chatbot update notice"
                >
                    <span className="absolute -top-1.5 -right-1.5 rounded-full bg-amber-400 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-slate-900">
                        Soon
                    </span>
                    <Sparkles size={22} />
                </button>
            )}

            {isOpen && (
                <div className="w-[340px] md:w-[380px] bg-white/95 backdrop-blur-xl border border-white/30 rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
                    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-orange-600 px-5 py-4 text-white">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                                <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0">
                                    {mode === 'feedback' ? <Lightbulb size={22} /> : <Bot size={22} />}
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-[0.24em] text-orange-100">Next Update</p>
                                    <h3 className="text-lg font-black leading-tight">{heading}</h3>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 rounded-full hover:bg-white/10 transition-colors"
                                aria-label="Close chatbot update notice"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="p-5 space-y-5">
                        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 flex gap-3">
                            <Clock3 size={18} className="text-amber-700 mt-0.5 shrink-0" />
                            <p className="text-sm font-medium text-amber-900 leading-relaxed">
                                {subcopy}
                            </p>
                        </div>

                        <div className="space-y-3">
                            {featureHighlights.map((item) => (
                                <div key={item} className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 border border-slate-100">
                                    <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                                        <Sparkles size={14} />
                                    </div>
                                    <p className="text-sm font-bold text-slate-800">{item}</p>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            <button
                                onClick={handleSupportClick}
                                className="w-full rounded-2xl bg-orange-600 hover:bg-orange-700 text-white px-4 py-3.5 font-black text-sm flex items-center justify-center gap-2 transition-colors shadow-lg shadow-orange-500/20"
                            >
                                <MessageCircle size={18} />
                                Contact Support on WhatsApp
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-full rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-3 font-bold text-sm transition-colors"
                            >
                                Continue Browsing
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatBot;
