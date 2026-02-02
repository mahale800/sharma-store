import React, { useState, useEffect } from 'react';
import { useFeedback } from '../../hooks/useFeedback';
import { analyzeFeedback, analyzeSentimentBatch } from '../../services/aiService';
import { Loader2, Sparkles, Bug, Lightbulb, Star, RefreshCw, MessageSquare, TrendingUp } from 'lucide-react';
import SentimentCharts from '../../components/admin/SentimentCharts';

const AdminFeedback = () => {
    const { getFeedback, updateFeedbackSentiment } = useFeedback();
    const [feedbackList, setFeedbackList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);
    const [insights, setInsights] = useState(null);
    const [sentimentLoading, setSentimentLoading] = useState(false);

    useEffect(() => {
        fetchFeedback();
    }, []);

    const fetchFeedback = async () => {
        setLoading(true);
        const data = await getFeedback();
        setFeedbackList(data);
        setLoading(false);
    };

    const handleBatchSentiment = async () => {
        setSentimentLoading(true);
        // Analzye all (or just unanalyzed)
        const toAnalyze = feedbackList.filter(f => !f.sentiment);
        if (toAnalyze.length === 0) {
            alert("All items already analyzed! (Or no feedback)");
            setSentimentLoading(false);
            return;
        }

        const results = await analyzeSentimentBatch(toAnalyze);
        if (Object.keys(results).length > 0) {
            await updateFeedbackSentiment(results);
            await fetchFeedback(); // Refresh UI
        }
        setSentimentLoading(false);
    };

    const handleAnalyze = async () => {
        setAnalyzing(true);
        const result = await analyzeFeedback(feedbackList);
        setInsights(result);
        setAnalyzing(false);
    };

    const getIcon = (type) => {
        switch (type) {
            case 'bug': return <Bug size={18} className="text-red-500" />;
            case 'suggestion': return <Lightbulb size={18} className="text-blue-500" />;
            case 'review': return <Star size={18} className="text-yellow-500" />;
            default: return <MessageSquare size={18} className="text-gray-500" />;
        }
    };

    const getUrgencyBadge = (urgency) => {
        const colors = { Low: 'bg-green-100 text-green-700', Medium: 'bg-yellow-100 text-yellow-700', High: 'bg-red-100 text-red-700' };
        return urgency ? <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${colors[urgency] || 'bg-gray-100'}`}>{urgency}</span> : null;
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900">User Feedback</h1>
                    <p className="text-gray-500">Listen to your customers and improve.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleBatchSentiment}
                        disabled={sentimentLoading}
                        className="px-4 py-2 bg-white rounded-xl shadow-sm text-gray-600 hover:text-blue-600 font-bold text-sm flex items-center gap-2 transition-all"
                    >
                        {sentimentLoading ? <Loader2 size={16} className="animate-spin" /> : <TrendingUp size={16} />}
                        Analyze Sentiment
                    </button>
                    <button
                        onClick={fetchFeedback}
                        className="p-2 bg-white rounded-xl shadow-sm text-gray-500 hover:text-orange-500 transition-colors"
                    >
                        <RefreshCw size={20} />
                    </button>
                </div>
            </div>

            {/* Sentiment Charts */}
            <SentimentCharts feedbackList={feedbackList} />

            {/* AI Insights Card */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-32 bg-orange-500/20 rounded-full blur-3xl -translate-y-16 translate-x-16"></div>

                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md">
                                <Sparkles size={20} className="text-orange-400" />
                            </div>
                            <h2 className="text-xl font-bold">AI Summary</h2>
                        </div>
                        <button
                            onClick={handleAnalyze}
                            disabled={analyzing || feedbackList.length === 0}
                            className="px-4 py-2 bg-white/10 hover:bg-white/20 hover:text-orange-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-sm font-bold transition-all flex items-center gap-2"
                        >
                            {analyzing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                            {analyzing ? 'Reasoning...' : 'Generate New Summary'}
                        </button>
                    </div>

                    {insights ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                                <h3 className="text-orange-300 font-bold text-sm uppercase tracking-wider mb-3">Top Issues</h3>
                                <ul className="space-y-2 text-sm text-gray-300">
                                    {insights.topIssues?.map((issue, i) => <li key={i} className="flex gap-2"><span className="text-orange-500">•</span> {issue}</li>)}
                                </ul>
                            </div>
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                                <h3 className="text-green-300 font-bold text-sm uppercase tracking-wider mb-3">Suggested Improvements</h3>
                                <ul className="space-y-2 text-sm text-gray-300">
                                    {insights.improvements?.map((imp, i) => <li key={i} className="flex gap-2"><span className="text-green-500">•</span> {imp}</li>)}
                                </ul>
                            </div>
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex flex-col items-center justify-center">
                                <h3 className="text-blue-300 font-bold text-sm uppercase tracking-wider mb-2">Overall Sentiment</h3>
                                <span className="text-3xl font-black">{insights.sentiment}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-400 text-sm">
                            {analyzing ? "Reading feedback..." : "Click 'Generate Summary' to let AI analyze themes."}
                        </div>
                    )}
                </div>
            </div>

            {/* Feedback List */}
            <div className="bg-white/50 backdrop-blur-xl border border-white/60 rounded-3xl p-1 overflow-hidden">
                {loading ? (
                    <div className="p-12 flex justify-center"><Loader2 size={32} className="animate-spin text-orange-500" /></div>
                ) : feedbackList.length === 0 ? (
                    <div className="p-12 text-center text-gray-500 font-medium">No feedback received yet.</div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                            <tr>
                                <th className="p-4">Type</th>
                                <th className="p-4">Message</th>
                                <th className="p-4 hidden md:table-cell">Page</th>
                                <th className="p-4 hidden md:table-cell">Sentiment</th>
                                <th className="p-4 hidden md:table-cell">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {feedbackList.map((feedback) => (
                                <tr key={feedback.id} className="hover:bg-white/80 transition-colors group">
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 group-hover:bg-white transition-colors`}>
                                                {getIcon(feedback.type)}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-sm capitalize text-gray-700">{feedback.type}</span>
                                                {getUrgencyBadge(feedback.urgency)}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <p className="text-gray-900 font-medium text-sm line-clamp-2">{feedback.message}</p>
                                        {feedback.reason && <p className="text-xs text-gray-400 mt-1">AI Note: {feedback.reason}</p>}
                                    </td>
                                    <td className="p-4 hidden md:table-cell">
                                        <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 block w-fit max-w-[150px] truncate">{feedback.page}</code>
                                    </td>
                                    <td className="p-4 hidden md:table-cell">
                                        {feedback.sentiment ? (
                                            <span className={`text-xs font-bold ${feedback.sentiment === 'Positive' ? 'text-green-600' :
                                                    feedback.sentiment === 'Negative' ? 'text-red-500' : 'text-gray-500'
                                                }`}>
                                                {feedback.sentiment}
                                            </span>
                                        ) : <span className="text-xs text-gray-300">-</span>}
                                    </td>
                                    <td className="p-4 hidden md:table-cell text-sm text-gray-500">
                                        {feedback.createdAt?.seconds ? new Date(feedback.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AdminFeedback;
