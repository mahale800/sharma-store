import React, { useState, useEffect } from 'react';
import { useRoadmap } from '../../hooks/useRoadmap';
import { useFeedback } from '../../hooks/useFeedback';
import { generateRoadmap } from '../../services/aiService';
import { Loader2, Sparkles, Map, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

const AdminRoadmap = () => {
    const { fetchRoadmap, saveRoadmapItems, updateItemStatus } = useRoadmap();
    const { getFeedback } = useFeedback();
    const [roadmap, setRoadmap] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    const loadData = React.useCallback(async () => {
        setLoading(true);
        const data = await fetchRoadmap();
        setRoadmap(data);
        setLoading(false);
    }, [fetchRoadmap]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            // 1. Get Feedback
            const feedback = await getFeedback();
            // 2. Generate Roadmap via AI
            const newItems = await generateRoadmap(feedback);
            // 3. Save to DB
            if (newItems.length > 0) {
                await saveRoadmapItems(newItems);
                await loadData(); // Reload to see new items
            } else {
                alert("AI couldn't generate any new items (or no feedback found).");
            }
        } catch (error) {
            console.error(error);
            alert("Failed to generate roadmap.");
        } finally {
            setGenerating(false);
        }
    };

    const handleStatusChange = async (id, status) => {
        await updateItemStatus(id, status);
        // Optimistic update locally
        setRoadmap(prev => prev.map(item => item.id === id ? { ...item, status } : item));
    };

    // eslint-disable-next-line no-unused-vars
    const PriorityColumn = ({ title, priority, icon: Icon, color }) => {
        const items = roadmap.filter(i => i.priority === priority);
        return (
            <div className="flex-1 min-w-[300px] bg-slate-50/50 rounded-3xl p-4 border border-slate-100 flex flex-col">
                <div className={`flex items-center gap-2 mb-4 p-2 rounded-xl ${color} bg-opacity-10 text-${color.split('-')[1]}-600`}>
                    <Icon size={18} className={`text-${color.split('-')[1]}-500`} />
                    <h3 className="font-bold text-sm uppercase tracking-wider">{title}</h3>
                    <span className="ml-auto bg-white px-2 py-0.5 rounded-md text-xs font-black shadow-sm">{items.length}</span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto pr-2 scrollbar-thin">
                    {items.length === 0 && (
                        <div className="text-center py-10 text-gray-400 text-sm border-2 border-dashed border-gray-100 rounded-xl">
                            No {title.toLowerCase()} items.
                        </div>
                    )}
                    {items.map(item => (
                        <div key={item.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group relative">
                            {/* Status Badge */}
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide
                                    ${item.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                        item.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                                            'bg-gray-100 text-gray-600'}`}>
                                    {item.status}
                                </span>
                                <select
                                    className="opacity-0 group-hover:opacity-100 absolute top-2 right-2 text-xs border border-gray-200 rounded p-1"
                                    value={item.status}
                                    onChange={(e) => handleStatusChange(item.id, e.target.value)}
                                >
                                    <option value="Planned">Planned</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                </select>
                            </div>

                            <h4 className="font-bold text-gray-800 text-sm mb-1">{item.title}</h4>
                            <p className="text-xs text-slate-500 mb-3 line-clamp-2">{item.reason}</p>

                            <div className="flex items-center gap-2 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded w-fit">
                                <Sparkles size={10} />
                                {item.impact}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col space-y-6 pb-4 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 flex items-center gap-2">
                        Product Roadmap <Map className="text-orange-500" />
                    </h1>
                    <p className="text-gray-500">AI-prioritized features based on user feedback.</p>
                </div>
                <button
                    onClick={handleGenerate}
                    disabled={generating}
                    className="px-5 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl shadow-lg shadow-orange-200 hover:shadow-orange-300 hover:scale-105 active:scale-95 transition-all font-bold flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {generating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                    {generating ? 'Designing Strategy...' : 'Generate New Roadmap'}
                </button>
            </div>

            {/* Kanban Board */}
            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 size={40} className="animate-spin text-orange-500" />
                </div>
            ) : (
                <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-x-auto pb-4">
                    <PriorityColumn title="High Priority" priority="High" icon={AlertCircle} color="bg-red-50" />
                    <PriorityColumn title="Medium Priority" priority="Medium" icon={Clock} color="bg-orange-50" />
                    <PriorityColumn title="Low Priority" priority="Low" icon={CheckCircle2} color="bg-blue-50" />
                </div>
            )}
        </div>
    );
};

export default AdminRoadmap;
