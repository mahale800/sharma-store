import React, { useState, useEffect, useMemo } from 'react';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useFeedback } from '../../hooks/useFeedback';
import { generateBusinessInsights } from '../../services/aiService';
import StatsCards from '../../components/admin/StatsCards';
import SalesChart from '../../components/admin/SalesChart';
import TopProductsTable from '../../components/admin/TopProductsTable';
import SentimentCharts from '../../components/admin/SentimentCharts';
import { ShoppingBag, Users, DollarSign, Package, TrendingUp, Loader2, MessageSquare, AlertTriangle, Lightbulb, Sparkles, RefreshCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePerformance } from '../../hooks/usePerformance';
import EngagementAnalytics from '../../components/admin/EngagementAnalytics';
import GrowthDashboard from '../../components/admin/GrowthDashboard';

const Dashboard = () => {
    const { stats, loading: analyticsLoading } = useAnalytics();
    const { getFeedback, loading: feedbackLoading } = useFeedback();

    const [feedback, setFeedback] = useState([]);
    const [insights, setInsights] = useState(null);
    const [insightLoading, setInsightLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        const loadData = async () => {
            const feedbackData = await getFeedback();
            setFeedback(feedbackData);
        };
        loadData();
    }, []);

    // Generate Insights when both data sources are ready
    const { allowBackgroundTasks } = usePerformance();

    useEffect(() => {
        if (!analyticsLoading && !feedbackLoading && feedback.length > 0 && stats && !insights && allowBackgroundTasks) {
            generateInsights();
        }
    }, [analyticsLoading, feedbackLoading, feedback, stats, allowBackgroundTasks]);

    const generateInsights = async () => {
        setInsightLoading(true);
        const result = await generateBusinessInsights(feedback, stats);
        setInsights(result);
        setInsightLoading(false);
    };

    // Calculate Feedback KPIs
    const feedbackKPIs = useMemo(() => {
        if (!feedback.length) return { total: 0, negativePct: 0, topPage: 'N/A' };

        const total = feedback.length;
        const negative = feedback.filter(f => f.sentiment === 'Negative').length;

        // Find top page
        const pageCounts = {};
        feedback.forEach(f => { if (f.page) pageCounts[f.page] = (pageCounts[f.page] || 0) + 1; });
        const topPage = Object.keys(pageCounts).sort((a, b) => pageCounts[b] - pageCounts[a])[0] || 'N/A';

        return {
            total,
            negativePct: Math.round((negative / total) * 100),
            topPage
        };
    }, [feedback]);


    if (analyticsLoading || feedbackLoading) {
        return (
            <div className="flex bg-white items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-orange-500" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-gray-900">Dashboard</h1>
                <p className="text-gray-500">Overview of your store's performance & user sentiment.</p>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200">
                <button
                    className={`py-2 px-4 text-sm font-medium ${activeTab === 'overview' ? 'border-b-2 border-orange-500 text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('overview')}
                >
                    Overview
                </button>
                <button
                    className={`py-2 px-4 text-sm font-medium ${activeTab === 'orders' ? 'border-b-2 border-orange-500 text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('orders')}
                >
                    Orders
                </button>
                <button
                    className={`py-2 px-4 text-sm font-medium ${activeTab === 'products' ? 'border-b-2 border-orange-500 text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('products')}
                >
                    Products
                </button>
                <button
                    className={`py-2 px-4 text-sm font-medium ${activeTab === 'engagement' ? 'border-b-2 border-orange-500 text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('engagement')}
                >
                    Engagement
                </button>
                <button
                    className={`py-2 px-4 text-sm font-medium ${activeTab === 'growth' ? 'border-b-2 border-orange-500 text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('growth')}
                >
                    Growth 🚀
                </button>
            </div>

            {/* Tab Content */}
            <div className="animate-in fade-in slide-in-from-bottom-5 duration-300">
                {activeTab === 'overview' && (
                    <div className="space-y-8">
                        {/* Unified KPI Cards */}
                        <StatsCards stats={stats} feedbackKPIs={feedbackKPIs} />

                        {/* AI Business Intelligence Section */}
                        <div className="frosted-paper p-6 rounded-3xl border border-white/60 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-32 bg-white/10 rounded-full blur-3xl -translate-y-16 translate-x-16"></div>
                            <div className="flex items-center justify-between mb-6 relative z-10">
                                <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                                    <Sparkles className="text-orange-500" /> AI Business Intelligence
                                </h2>
                                <button
                                    onClick={generateInsights}
                                    disabled={insightLoading}
                                    className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-bold hover:scale-105 transition-transform disabled:opacity-50 flex items-center gap-2"
                                >
                                    {insightLoading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCcw size={16} />} Refresh
                                </button>
                            </div>
                            <div className="grid gap-4 relative z-10">
                                {insights && insights.length > 0 ? (
                                    insights.map((insight, idx) => (
                                        <div key={idx} className="bg-white/50 p-4 rounded-2xl border border-white/50">
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="font-bold text-gray-800">{insight.title}</h3>
                                                <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider ${insight.severity === 'Critical' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                                                    }`}>
                                                    {insight.severity}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-3">{insight.recommendation}</p>
                                            <Link to="/admin/roadmap" className="text-[10px] font-bold text-cyan-700 hover:text-cyan-900 uppercase tracking-wider flex items-center gap-1">
                                                Possible Action <TrendingUp size={10} />
                                            </Link>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-gray-400 font-medium">
                                        {insightLoading ? "Generating insights..." : "No insights generated yet. Click refresh to analyze."}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Charts Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Sales Chart */}
                            <div className="lg:col-span-2">
                                <SalesChart data={stats.monthlySales} />
                            </div>

                            {/* Sentiment Pie Chart (Compact) */}
                            <div className="lg:col-span-1 h-[400px] overflow-hidden">
                                <SentimentCharts feedbackList={feedback} />
                                {/* Note: SentimentCharts renders 2 charts side-by-side by default.
                                    For Dashboard, we might want to hide the Bar Chart or adjust styling via CSS/Props if needed.
                                    For now, the grid handling in Dashboard will stack them or we assume SentimentCharts is responsive.
                                    (In a real app, I'd split SentimentCharts or pass a prop to show only Pie).
                                */}
                            </div>
                        </div>

                        {/* 4. Top Products */}
                        <div className="bg-white rounded-3xl border border-gray-100 p-6">
                            <h3 className="font-bold text-gray-800 mb-4">Top Performing Products</h3>
                            <TopProductsTable products={stats.topProducts} />
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
};

export default Dashboard;
