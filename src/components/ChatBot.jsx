import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Loader2, Sparkles, Bug, Star, Lightbulb } from 'lucide-react';
import { getChatResponse } from '../services/aiService';
import { useFeedback } from '../hooks/useFeedback';
import { useLocation } from 'react-router-dom';
import { usePerformance } from '../hooks/usePerformance';
import { useEngagement } from '../hooks/useEngagement';

// Extracted Component
const QuickActions = ({ onAction }) => (
    <div className="flex gap-2 p-4 pt-0 overflow-x-auto no-scrollbar mask-gradient-right">
        {["Best Sellers?", "Track Order", "Return Policy", "Contact Support"].map((action, idx) => (
            <button
                key={idx}
                onClick={() => onAction(action)}
                className="flex-shrink-0 px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-bold rounded-full border border-orange-100 transition-colors whitespace-nowrap"
            >
                {action}
            </button>
        ))}
    </div>
);

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { shouldAnimate } = usePerformance();
    const { logEvent } = useEngagement();

    // Feedback Mode State
    const [isFeedbackMode, setIsFeedbackMode] = useState(false);
    const [feedbackType, setFeedbackType] = useState(null); // 'bug', 'suggestion', 'review'
    const { submitFeedback } = useFeedback();
    const location = useLocation();

    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hi! I\'m your Sharma Store assistant. Looking for specific stationery or need a recommendation?' }
    ]);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    // Listener for Footer Link
    useEffect(() => {
        const handleOpenFeedback = () => {
            setIsOpen(true);
            setIsFeedbackMode(true);
            setFeedbackType(null);
            setMessages([
                { role: 'assistant', content: "👋 We'd love to improve Sharma Store! What would you like to share today?" }
            ]);
        };

        window.addEventListener('openFeedback', handleOpenFeedback);
        return () => window.removeEventListener('openFeedback', handleOpenFeedback);
    }, []);

    const handleSend = async (e) => {
        e && e.preventDefault(); // Handle explicit event or direct call
        if (!input.trim() || isLoading) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        // --- FEEDBACK LOGIC ---
        if (isFeedbackMode) {
            try {
                if (!feedbackType) {
                    // Fallback check if they typed instead of clicking button (naive)
                    setMessages(prev => [...prev, { role: 'assistant', content: "Please select a category above so I can categorize your feedback correctly!" }]);
                    setIsLoading(false);
                    return;
                }

                // Submit Feedback
                await submitFeedback({
                    type: feedbackType,
                    message: input,
                    page: location.pathname,
                    device: window.innerWidth < 768 ? 'mobile' : 'desktop'
                });

                setMessages(prev => [...prev, { role: 'assistant', content: "Thank you! 🧡 I've shared this with the product team. Anything else?" }]);
                setIsFeedbackMode(false); // Reset to normal chat
                setFeedbackType(null);
            } catch (err) {
                setMessages(prev => [...prev, { role: 'assistant', content: "Oops, something went wrong saving your feedback." }]);
            } finally {
                setIsLoading(false);
            }
            return;
        }

        // --- NORMAL CHAT LOGIC ---
        try {
            const history = [...messages, userMsg].slice(-10);
            const responseText = await getChatResponse(history);
            setMessages(prev => [...prev, { role: 'assistant', content: responseText }]);
        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "⚠️ I'm currently offline or missing my API key. Please check back later!"
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFeedbackSelect = (type) => {
        setFeedbackType(type);
        const typeLabels = {
            bug: "Bug Report 🐞",
            suggestion: "Improvement Idea 💡",
            review: "General Review ⭐"
        };
        const prompts = {
            bug: "Oh no! Please describe the issue you faced.",
            suggestion: "Great! What functionality would you like to see?",
            review: "Awesome! How was your experience?"
        };

        setMessages(prev => [
            ...prev,
            { role: 'user', content: typeLabels[type] },
            { role: 'assistant', content: prompts[type] }
        ]);
    };

    const handleQuickAction = (text) => {
        setInput(text);
        // We use a timeout to ensuring state update before trigger, or just call logic directly
        // For simplicity, we just set input and define a helper that takes text
        // But since handleSend uses 'input' state, we need to be careful.
        // Better: refactor handleSend to accept text argument. 
        // For now, let's just push message directly to avoid state race condition or use the logic below:

        const userMsg = { role: 'user', content: text };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        const history = [...messages, userMsg].slice(-10);
        getChatResponse(history)
            .then(res => setMessages(prev => [...prev, { role: 'assistant', content: res }]))
            .catch(() => setMessages(prev => [...prev, { role: 'assistant', content: "Offline mode." }]))
            .finally(() => setIsLoading(false));
    };

    return (
        // Mobile: bottom-20 (80px) to clear Bottom Nav (64px)
        // Desktop: bottom-6 (24px)
        <div className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40 font-sans">
            {/* Toggle Button */}
            {!isOpen && (
                <button
                    onClick={() => {
                        setIsOpen(true);
                        logEvent('ai_session_start', 'ai');
                    }}
                    className={`w-14 h-14 bg-orange-600 hover:bg-orange-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-110 active:scale-95 gpu-accelerated ${shouldAnimate ? 'animate-breathe' : ''}`}
                >
                    <div className={`absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white ${shouldAnimate ? 'animate-pulse' : ''}`}></div>
                    <Sparkles size={24} />
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="w-[350px] md:w-[380px] h-[500px] max-h-[80vh] bg-white/95 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300 relative">

                    {/* Header */}
                    <div className={`p-4 flex items-center justify-between text-white transition-colors duration-500 ${isFeedbackMode ? 'bg-slate-900' : 'bg-gradient-to-r from-orange-500 to-orange-600'}`}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                {isFeedbackMode ? <Lightbulb size={24} /> : <Bot size={24} />}
                            </div>
                            <div>
                                <h3 className="font-bold">{isFeedbackMode ? 'Feedback Loop' : 'Sharma AI'}</h3>
                                <p className="text-xs opacity-90 flex items-center gap-1">
                                    {isFeedbackMode ? 'We listen.' : <><span className="w-2 h-2 bg-green-400 rounded-full"></span> Online</>}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {/* Mode Toggle Checkbox (Hidden or Explicit UI) - For now just Close */}
                            {isFeedbackMode && (
                                <button onClick={() => { setIsFeedbackMode(false); setFeedbackType(null); setMessages([{ role: 'assistant', content: "How can I help you with shopping today?" }]); }} className="text-xs bg-white/20 px-2 py-1 rounded-lg hover:bg-white/30 truncate">
                                    Exit Feedback
                                </button>
                            )}
                            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-orange-200">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-gray-200 text-gray-600' : isFeedbackMode ? 'bg-slate-100 text-slate-900' : 'bg-orange-100 text-orange-600'}`}>
                                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                                </div>
                                <div className={`p-3 rounded-2xl max-w-[80%] text-sm leading-relaxed ${msg.role === 'user'
                                    ? 'bg-gray-900 text-white rounded-tr-none'
                                    : 'bg-white border border-gray-100 shadow-sm text-gray-800 rounded-tl-none'
                                    }`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}

                        {/* Feedback Options */}
                        {isFeedbackMode && !feedbackType && (
                            <div className="flex flex-col gap-2 ml-10 animate-in slide-in-from-left duration-500">
                                <button onClick={() => handleFeedbackSelect('bug')} className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors text-sm font-bold text-left border border-red-100">
                                    <Bug size={16} /> Report an Issue
                                </button>
                                <button onClick={() => handleFeedbackSelect('suggestion')} className="flex items-center gap-2 p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors text-sm font-bold text-left border border-blue-100">
                                    <Lightbulb size={16} /> Suggest Improvement
                                </button>
                                <button onClick={() => handleFeedbackSelect('review')} className="flex items-center gap-2 p-3 bg-yellow-50 text-yellow-600 rounded-xl hover:bg-yellow-100 transition-colors text-sm font-bold text-left border border-yellow-100">
                                    <Star size={16} /> Review Experience
                                </button>
                            </div>
                        )}

                        {isLoading && (
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                                    <Bot size={16} />
                                </div>
                                <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                                    <Loader2 size={16} className="animate-spin text-orange-500" />
                                    <span className="text-xs text-gray-400">Processing...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="border-t border-gray-100 bg-white/50 backdrop-blur-sm">
                        {!isFeedbackMode && <QuickActions onAction={handleQuickAction} />}
                        <form onSubmit={handleSend} className="p-4 pt-2">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder={isFeedbackMode ? "Type your feedback here..." : "Ask for a pen recommendation..."}
                                    className={`w-full pl-4 pr-12 py-3 bg-white border-2 border-transparent relative rounded-xl shadow-sm outline-none transition-all text-sm ${isFeedbackMode ? 'focus:border-slate-500' : 'focus:border-orange-500'}`}
                                />
                                <button
                                    type="submit"
                                    disabled={isLoading || !input.trim()}
                                    className={`absolute right-2 top-2 p-1.5 ${isFeedbackMode ? 'bg-slate-900 hover:bg-slate-700' : 'bg-orange-500 hover:bg-orange-600'} text-white rounded-lg disabled:opacity-50 transition-colors`}
                                >
                                    <Send size={16} />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatBot;
