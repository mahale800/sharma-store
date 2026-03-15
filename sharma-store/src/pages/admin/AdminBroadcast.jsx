import React, { useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebase/firebase';
import { Send, Zap, Bell, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/Button';

const AdminBroadcast = () => {
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [tone, setTone] = useState('Professional');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);

    const tones = ['Professional', 'Friendly', 'Funny', 'Flirty', 'Urgent'];

    const handleSend = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);

        try {
            const sendBroadcast = httpsCallable(functions, 'sendAdminBroadcast');
            await sendBroadcast({
                title,
                body,
                tone,
                type: 'admin'
            });
            setStatus({ type: 'success', msg: 'Broadcast sent successfully!' });
            setTitle('');
            setBody('');
        } catch (error) {
            console.error(error);
            setStatus({ type: 'error', msg: 'Failed. Ensure Cloud Functions are deployed.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Broadcast</h1>
                <p className="text-sm font-medium text-gray-500">Send push notifications to all users.</p>
            </div>

            <Card className="p-8 border border-white/60 shadow-sm relative overflow-hidden">
                {/* Decoration */}
                <div className="absolute top-0 right-0 p-32 bg-orange-500/5 rounded-full blur-3xl -translate-y-16 translate-x-16"></div>

                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 shadow-inner">
                        <Bell size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-gray-900">New Notification</h2>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Target: All Users</p>
                    </div>
                </div>

                <form onSubmit={handleSend} className="space-y-6 relative z-10">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 pl-1">Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-4 py-3.5 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-orange-500/20 font-bold text-gray-900 outline-none transition-all"
                                placeholder="e.g. Big Sale Tomorrow!"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 pl-1">Message</label>
                            <textarea
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                rows={4}
                                className="w-full px-4 py-3.5 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-orange-500/20 font-medium text-gray-900 resize-none outline-none transition-all"
                                placeholder="Type your message here..."
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 pl-1">Tone</label>
                            <div className="flex flex-wrap gap-2">
                                {tones.map(t => (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => setTone(t)}
                                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wide transition-all border-2 ${tone === t
                                            ? 'bg-gray-900 text-white border-gray-900 shadow-lg scale-105'
                                            : 'bg-white text-gray-500 border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                                            }`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {status && (
                        <div className={`p-4 rounded-xl flex items-center gap-3 ${status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                            }`}>
                            {status.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                            <span className="font-bold text-sm">{status.msg}</span>
                        </div>
                    )}

                    <Button
                        type="submit"
                        isLoading={loading}
                        disabled={loading}
                        className="w-full py-4 text-base shadow-xl shadow-orange-500/20"
                    >
                        {!loading && <Send size={20} className="mr-2" />}
                        Send Broadcast
                    </Button>
                </form>
            </Card>
        </div>
    );
};

export default AdminBroadcast;
