import React from 'react';
import { Sparkles, History, ShoppingBag, ArrowRight } from 'lucide-react';
import { useLoyalty } from '../../context/LoyaltyContext';
import { Link } from 'react-router-dom';

const LoyaltyDashboard = () => {
    const { coins, tier, history, getTierBenefits } = useLoyalty();
    const benefits = getTierBenefits();

    return (
        <div className="space-y-6">
            {/* Main Card */}
            <div className={`rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden transition-all hover:scale-[1.01] ${tier === 'Platinum' ? 'bg-gradient-to-br from-slate-900 to-slate-800' :
                tier === 'Gold' ? 'bg-gradient-to-br from-orange-500 to-yellow-500' :
                    'bg-gradient-to-br from-indigo-600 to-purple-600'
                }`}>
                {/* Decorative Blobs */}
                <div className="absolute top-0 right-0 p-40 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                <div className="absolute bottom-0 left-0 p-32 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/3"></div>

                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-8">
                        <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/20">
                            <Sparkles size={14} className="text-yellow-200" fill="currentColor" />
                            <span className="font-bold text-xs uppercase tracking-widest">{tier} Member</span>
                        </div>
                        <Link to="/redeem" className="bg-white/20 hover:bg-white/30 p-2 rounded-xl transition-colors backdrop-blur-md">
                            <ArrowRight size={20} />
                        </Link>
                    </div>

                    <div className="mb-8">
                        <p className="text-sm font-medium opacity-80 mb-1">Your Balance</p>
                        <h2 className="text-6xl font-black tracking-tighter">{coins.toLocaleString()} <span className="text-xl font-bold opacity-60">Coins</span></h2>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <Link to="/redeem" className="bg-white text-gray-900 py-3.5 px-6 rounded-2xl font-bold text-sm text-center shadow-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                            Redeem <ShoppingBag size={16} />
                        </Link>
                        <button className="bg-black/20 hover:bg-black/30 backdrop-blur py-3.5 px-6 rounded-2xl font-bold text-sm text-center transition-colors border border-white/10">
                            History
                        </button>
                    </div>
                </div>
            </div>

            {/* Benefits Row */}
            <div className="grid grid-cols-3 gap-3 text-center">
                <div className="frosted-paper p-4 rounded-3xl border border-white/60">
                    <p className="text-2xl font-black text-gray-900">{benefits.discount}%</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Discount</p>
                </div>
                <div className="frosted-paper p-4 rounded-3xl border border-white/60">
                    <p className="text-2xl font-black text-gray-900">{benefits.freeDelivery ? 'Free' : 'Paid'}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Delivery</p>
                </div>
                <div className="frosted-paper p-4 rounded-3xl border border-white/60">
                    <p className="text-2xl font-black text-gray-900">2x</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Points</p>
                </div>
            </div>

            {/* Recent History Preview */}
            <div className="frosted-paper p-6 rounded-3xl border border-white/60">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><History size={16} /> Recent Activity</h3>
                <div className="space-y-4">
                    {history.slice(0, 3).map(item => (
                        <div key={item.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                    {item.type === 'credit' ? '+' : '-'}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">{item.title}</p>
                                    <p className="text-xs text-gray-400 font-medium">
                                        {(() => {
                                            try {
                                                if (!item.date) return 'Unknown Date';
                                                const d = item.date.toDate ? item.date.toDate() : new Date(item.date);
                                                return isNaN(d.getTime()) ? 'Unknown Date' : d.toLocaleDateString();
                                            } catch (e) {
                                                return 'Date Error';
                                            }
                                        })()}
                                    </p>
                                </div>
                            </div>
                            <span className={`font-black ${item.type === 'credit' ? 'text-green-600' : 'text-gray-900'}`}>
                                {item.type === 'credit' ? '+' : '-'}{item.amount}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LoyaltyDashboard;
