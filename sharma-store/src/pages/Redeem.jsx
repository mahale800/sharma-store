import React, { useState } from 'react';
import { useLoyalty } from '../context/LoyaltyContext';
import { Sparkles, Gift, Tag, Lock, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/common/Card';

const Redeem = ({ isComponent }) => {
    const { coins, redeemCoins } = useLoyalty();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [successItem, setSuccessItem] = useState(null);

    const rewards = [
        { id: 1, title: 'Limited Edition Notebook', cost: 2500, image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600', type: 'exclusive' },
        { id: 2, title: 'Premium Gel Pen Set', cost: 1200, image: 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?auto=format&fit=crop&q=80&w=600', type: 'exclusive' },
        { id: 3, title: 'Sharma Store Cap', cost: 800, image: 'https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?auto=format&fit=crop&q=80&w=600', type: 'exclusive' },
        { id: 4, title: '₹500 Off Voucher', cost: 500, type: 'voucher', code: 'SHARMA500' },
        { id: 5, title: '₹100 Off Voucher', cost: 100, type: 'voucher', code: 'SHARMA100' },
        { id: 6, title: 'Free Delivery', cost: 250, type: 'voucher', code: 'FREEDEL' },
    ];

    const handleRedeem = (item) => {
        if (coins < item.cost) return;
        setLoading(true);
        setTimeout(() => {
            const success = redeemCoins(item.cost, `Redeemed: ${item.title}`);
            setLoading(false);
            if (success) setSuccessItem(item);
        }, 1500);
    };

    return (
        <div className={isComponent ? "w-full" : "w-full bg-slate-50 pb-8 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]"}>
            <div className={isComponent ? "max-w-6xl mx-auto" : "max-w-6xl mx-auto px-4 md:px-8 pt-6"}>
                {/* Header */}
                {!isComponent && (
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <Link to="/account" className="p-3 bg-white rounded-xl hover:bg-gray-50 transition-colors shadow-sm text-gray-600">
                                <ArrowLeft size={20} />
                            </Link>
                            <div>
                                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Redeem Coins</h1>
                                <p className="text-sm font-bold text-gray-500">Spend your hard-earned Sharma Coins</p>
                            </div>
                        </div>
                        <div className="bg-white px-4 py-2 rounded-xl flex items-center gap-2 border border-blue-100 shadow-sm">
                            <Sparkles className="text-primary size-5" fill="currentColor" />
                            <span className="font-black text-lg text-primary">{coins.toLocaleString()}</span>
                        </div>
                    </div>
                )}

                {/* Exclusive Rewards Section */}
                <div className="mb-12">
                    <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                        <Gift className="text-purple-600" /> Exclusive Gear
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {rewards.filter(r => r.type === 'exclusive').map(item => (
                            <div key={item.id} className="frosted-paper rounded-3xl overflow-hidden border border-white/60 shadow-lg group hover:scale-[1.02] transition-transform">
                                <div className="h-48 bg-gray-100 relative">
                                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                    {coins < item.cost && (
                                        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center">
                                            <div className="bg-black/80 text-white px-4 py-2 rounded-full flex items-center gap-2 text-xs font-bold">
                                                <Lock size={12} /> Locked
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="p-6">
                                    <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                                    <div className="flex items-center justify-between mt-4">
                                        <span className="text-primary font-black text-lg flex items-center gap-1">
                                            {item.cost} <span className="text-xs font-bold text-gray-400">Coins</span>
                                        </span>
                                        <Button
                                            onClick={() => handleRedeem(item)}
                                            disabled={coins < item.cost || loading}
                                            variant={coins >= item.cost ? 'primary' : 'gray'}
                                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg ${coins < item.cost ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none' : 'bg-gray-900 hover:bg-black text-white'}`}
                                        >
                                            {coins >= item.cost ? 'Claim' : 'Need More'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Vouchers Section */}
                <div>
                    <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                        <Tag className="text-blue-600" /> Vouchers & Coupons
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {rewards.filter(r => r.type === 'voucher').map(item => (
                            <Card key={item.id} className="bg-white rounded-3xl p-6 border-2 border-dashed border-gray-200 relative overflow-hidden group hover:border-blue-200 transition-colors shadow-none hover:shadow-sm">
                                <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-50 rounded-full border border-gray-200"></div>
                                <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-50 rounded-full border border-gray-200"></div>

                                <div className="flex justify-between items-start mb-4">
                                    <div className="bg-blue-50 text-blue-600 p-3 rounded-xl">
                                        <Tag size={24} />
                                    </div>
                                    <span className="font-black text-lg text-gray-900">{item.cost} Coins</span>
                                </div>

                                <h3 className="font-bold text-gray-900 text-lg mb-2">{item.title}</h3>
                                <p className="text-xs text-gray-500 font-medium mb-6">Valid on all orders above ₹999. One time use only.</p>

                                <Button
                                    onClick={() => handleRedeem(item)}
                                    disabled={coins < item.cost || loading}
                                    className={`w-full py-3 rounded-xl font-bold transition-all ${coins >= item.cost
                                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200'
                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                                        }`}
                                >
                                    Redeem Voucher
                                </Button>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>

            {/* Success Modal */}
            <AnimatePresence>
                {successItem && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.5, rotate: -10 }} animate={{ scale: 1, rotate: 0 }}
                            className="bg-white w-full max-w-sm rounded-3xl p-8 text-center relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-200 via-white to-white opacity-50"></div>
                            <div className="relative z-10">
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 shadow-inner">
                                    <CheckCircle size={40} strokeWidth={3} />
                                </div>
                                <h2 className="text-2xl font-black text-gray-900 mb-2">You Got It!</h2>
                                <p className="text-gray-500 font-bold mb-6">You successfully redeemed <br /> <span className="text-primary">{successItem.title}</span></p>

                                {successItem.type === 'voucher' && (
                                    <div className="bg-gray-100 p-4 rounded-xl border-dashed border-2 border-gray-300 mb-6">
                                        <p className="text-xs font-bold text-gray-400 uppercase">Your Code</p>
                                        <p className="text-2xl font-black text-gray-900 tracking-widest">{successItem.code}</p>
                                    </div>
                                )}

                                <button onClick={() => setSuccessItem(null)} className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl shadow-lg">Awesome!</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {loading && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-transparent">
                    <div className="bg-white/90 backdrop-blur px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3">
                        <Loader2 className="animate-spin text-primary" />
                        <span className="font-bold text-gray-900">Processing...</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Redeem;
