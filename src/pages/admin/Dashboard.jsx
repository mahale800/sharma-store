import React, { useState, useEffect, useMemo } from 'react';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useFeedback } from '../../hooks/useFeedback';
import { useEngagement } from '../../hooks/useEngagement';
import { generateBusinessInsights } from '../../services/aiService';
import StatsCards from '../../components/admin/StatsCards';
import SalesChart from '../../components/admin/SalesChart';
import TopProductsTable from '../../components/admin/TopProductsTable';
import SentimentCharts from '../../components/admin/SentimentCharts';
import OrderStatusChart from '../../components/admin/OrderStatusChart';
import RecentOrders from '../../components/admin/RecentOrders';
import { Sparkles, RefreshCcw, TrendingUp, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePerformance } from '../../hooks/usePerformance';
import TopProductsChart from '../../components/admin/TopProductsChart';
import LowStockAlerts from '../../components/admin/LowStockAlerts';
import ConversionFunnel from '../../components/admin/ConversionFunnel';
import Button from '../../components/Button';
import Card from '../../components/common/Card';
import { useShop } from '../../context/ShopContext';
import { SHOP_PROFILE } from '../../data/shopProfile';

const Dashboard = () => {
    const { stats, loading: analyticsLoading } = useAnalytics();
    const { allProducts, usingFallbackProducts } = useShop();
    const { getFeedback, loading: feedbackLoading } = useFeedback();

    const [feedback, setFeedback] = useState([]);
    const [insights, setInsights] = useState(null);
    const [insightLoading, setInsightLoading] = useState(false);
    
    const { getEngagementStats } = useEngagement();
    const [engagementMetrics, setEngagementMetrics] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            const feedbackData = await getFeedback();
            setFeedback(feedbackData);
            
            const engagementData = await getEngagementStats(7);
            if (engagementData && engagementData.metrics) {
                setEngagementMetrics(engagementData.metrics);
            }
        };
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Generate Insights when both data sources are ready
    const { allowBackgroundTasks } = usePerformance();

    const generateInsights = React.useCallback(async () => {
        setInsightLoading(true);
        const result = await generateBusinessInsights(feedback, stats);
        setInsights(result);
        setInsightLoading(false);
    }, [feedback, stats]);

    useEffect(() => {
        if (!analyticsLoading && !feedbackLoading && feedback.length > 0 && stats && !insights && allowBackgroundTasks) {
            generateInsights();
        }
    }, [analyticsLoading, feedbackLoading, feedback, stats, allowBackgroundTasks, insights, generateInsights]);

    // Calculate Feedback KPIs
    const feedbackKPIs = useMemo(() => {
        if (!feedback.length) return { total: 0, negativePct: 0, topPage: 'N/A' };

        const total = (feedback || []).length;
        const negative = (feedback || []).filter(f => f.sentiment === 'Negative').length;

        // Find top page
        const pageCounts = {};
        (feedback || []).forEach(f => { if (f && f.page) pageCounts[f.page] = (pageCounts[f.page] || 0) + 1; });
        const topPage = Object.keys(pageCounts).sort((a, b) => pageCounts[b] - pageCounts[a])[0] || 'N/A';

        return {
            total,
            negativePct: Math.round((negative / total) * 100),
            topPage
        };
    }, [feedback]);

    const inventoryInsights = useMemo(() => {
        const summary = allProducts.reduce((acc, product) => {
            const category = product.category || 'Uncategorized';
            acc.total += 1;
            if (Number(product.stock) === 0) acc.outOfStock += 1;
            if (Number(product.stock) > 0 && Number(product.stock) < 10) acc.lowStock += 1;
            acc.byCategory[category] = (acc.byCategory[category] || 0) + 1;
            return acc;
        }, { total: 0, outOfStock: 0, lowStock: 0, byCategory: {} });

        const topCategories = Object.entries(summary.byCategory)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 4);

        return { ...summary, topCategories };
    }, [allProducts]);


    // Let the components handle the loading state themselves to avoid a blank layout
    // We only wait for initial analytics load completely if we really must, 
    // but throwing a skeleton is better.

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Dashboard</h1>
                <p className="text-sm font-medium text-gray-500">Overview of your store's performance & user sentiment.</p>
            </div>

            {/* Unified KPI Cards */}
            <StatsCards stats={stats || {}} feedbackKPIs={feedbackKPIs} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 p-6 border-white/60">
                    <div className="flex items-start justify-between gap-4 mb-5">
                        <div>
                            <h2 className="text-xl font-black text-gray-900">Store Profile</h2>
                            <p className="text-sm font-medium text-gray-500">Live business details based on your shop signage and current setup.</p>
                        </div>
                        <Link to="/admin/settings" className="text-xs font-black uppercase tracking-wider text-orange-600 hover:text-orange-700">
                            Update Details
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="rounded-2xl bg-slate-900 text-white p-5">
                            <p className="text-xs font-bold uppercase tracking-[0.22em] text-orange-200 mb-2">Shop Address</p>
                            <h3 className="text-xl font-black mb-2">{SHOP_PROFILE.name}</h3>
                            <p className="text-sm text-slate-200 leading-relaxed">{SHOP_PROFILE.fullAddress}</p>
                        </div>
                        <div className="rounded-2xl bg-white border border-gray-100 p-5">
                            <p className="text-xs font-bold uppercase tracking-[0.22em] text-gray-400 mb-3">Support Numbers</p>
                            <div className="space-y-2">
                                {SHOP_PROFILE.phones.map((phone) => (
                                    <p key={phone} className="text-lg font-black text-gray-900">+91 {phone}</p>
                                ))}
                            </div>
                            <p className="text-xs text-gray-500 font-medium mt-4">WhatsApp and direct customer contact can both use these numbers.</p>
                        </div>
                    </div>
                    <div className="mt-5 flex flex-wrap gap-2">
                        {SHOP_PROFILE.categories.map((category) => (
                            <span key={category} className="px-3 py-1.5 rounded-full bg-orange-50 text-orange-700 text-xs font-bold border border-orange-100">
                                {category}
                            </span>
                        ))}
                    </div>
                </Card>

                <Card className="p-6 border-white/60">
                    <div className="mb-5">
                        <h2 className="text-xl font-black text-gray-900">Inventory Health</h2>
                        <p className="text-sm font-medium text-gray-500">Quick stock and category visibility.</p>
                    </div>
                    <div className="space-y-4">
                        <div className="rounded-2xl bg-gray-50 p-4 border border-gray-100">
                            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Products Listed</p>
                            <p className="text-3xl font-black text-gray-900">{inventoryInsights.total}</p>
                        </div>
                        <div className="rounded-2xl bg-orange-50 p-4 border border-orange-100">
                            <p className="text-xs font-bold uppercase tracking-widest text-orange-500">Low Stock</p>
                            <p className="text-3xl font-black text-orange-700">{inventoryInsights.lowStock}</p>
                        </div>
                        <div className="rounded-2xl bg-red-50 p-4 border border-red-100">
                            <p className="text-xs font-bold uppercase tracking-widest text-red-500">Out of Stock</p>
                            <p className="text-3xl font-black text-red-700">{inventoryInsights.outOfStock}</p>
                        </div>
                        {usingFallbackProducts && (
                            <p className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                                Preview catalog is active because live products are unavailable.
                            </p>
                        )}
                    </div>
                </Card>
            </div>

            {/* AI Business Intelligence Section */}
            <Card className="relative overflow-hidden border-white/60 shadow-lg">
                <div className="absolute top-0 right-0 p-32 bg-orange-500/10 rounded-full blur-3xl -translate-y-16 translate-x-16"></div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 relative z-10">
                    <div>
                        <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                            <Sparkles className="text-orange-500" fill="currentColor" size={20} /> AI Business Intelligence
                        </h2>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Real-time Analysis</p>
                    </div>
                    <Button
                        onClick={generateInsights}
                        disabled={insightLoading}
                        size="sm"
                        variant="ghost"
                        className="bg-gray-100 hover:bg-gray-200 text-gray-600 border-transparent transition-all"
                    >
                        {insightLoading ? <Loader2 size={16} className="animate-spin mr-2" /> : <RefreshCcw size={16} className="mr-2" />}
                        Refresh Insights
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
                    {insights && insights.length > 0 ? (
                        insights.map((insight, idx) => (
                            <div key={idx} className="bg-white/60 backdrop-blur-sm p-5 rounded-2xl border border-white/50 hover:shadow-md transition-all group">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-bold text-gray-900 text-sm group-hover:text-orange-600 transition-colors">{insight.title}</h3>
                                    <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider ${insight.severity === 'Critical' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                                        }`}>
                                        {insight.severity}
                                    </span>
                                </div>
                                <p className="text-sm font-medium text-gray-500 mb-4 leading-relaxed">{insight.recommendation}</p>
                                <Link to="/admin/roadmap" className="text-[10px] font-black text-gray-400 hover:text-orange-600 uppercase tracking-wider flex items-center gap-1 transition-colors">
                                    Take Action <TrendingUp size={12} />
                                </Link>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                            <Sparkles className="mx-auto text-gray-300 mb-2" size={32} />
                            <p className="text-sm font-bold text-gray-400">
                                {insightLoading ? "Analyzing data points..." : "Click 'Refresh Insights' to generate new strategy."}
                            </p>
                        </div>
                    )}
                </div>
            </Card>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {/* Sales Chart */}
                <div className="lg:col-span-2 xl:col-span-2">
                    <SalesChart data={stats?.monthlySales || []} isLoading={analyticsLoading} />
                </div>

                {/* Top Products Chart */}
                <div className="lg:col-span-1 xl:col-span-1 h-full">
                    <TopProductsChart products={stats?.topProducts || []} isLoading={analyticsLoading} />
                </div>
            </div>

            {/* Secondary Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Sentiment Pie Chart */}
                <div className="h-full min-h-[350px]">
                    <SentimentCharts feedbackList={feedback} />
                </div>

                {/* Conversion Funnel */}
                <div className="h-full">
                    <ConversionFunnel stats={stats} engagementMetrics={engagementMetrics} />
                </div>

                {/* Low Stock Alerts */}
                <div className="h-full">
                    <LowStockAlerts />
                </div>
            </div>

            {/* Top Products */}
            <Card className="p-6 border-white/60">
                <div className="mb-6">
                    <h3 className="text-lg font-black text-gray-900">Top Performing Products</h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Inventory Highlights</p>
                </div>
                <TopProductsTable products={stats?.topProducts || []} />
            </Card>

            {/* Recent Orders + Order Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RecentOrders orders={stats?.recentOrders || []} isLoading={analyticsLoading} />
                <OrderStatusChart data={stats?.statusDistribution || []} isLoading={analyticsLoading} />
            </div>

            <Card className="p-6 border-white/60">
                <div className="mb-5">
                    <h3 className="text-lg font-black text-gray-900">Category Coverage</h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Based on your current shop sections</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    {inventoryInsights.topCategories.map(([category, count]) => (
                        <div key={category} className="rounded-2xl border border-gray-100 bg-white p-4">
                            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{category}</p>
                            <p className="text-2xl font-black text-gray-900 mt-2">{count}</p>
                            <p className="text-sm text-gray-500 font-medium mt-1">catalog items</p>
                        </div>
                    ))}
                </div>
            </Card>
        </div >
    );
};

export default Dashboard;
