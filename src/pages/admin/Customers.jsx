import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { Search, User, Mail, Shield, Ban, CheckCircle, Loader2 } from 'lucide-react';

const Customers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "users"));
                const usersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setUsers(usersList);
            } catch (error) {
                console.error("Error fetching customers:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const toggleBlockUser = async (user) => {
        const newStatus = !user.isBlocked;
        if (window.confirm(`Are you sure you want to ${newStatus ? 'BLOCK' : 'UNBLOCK'} this user?`)) {
            try {
                await updateDoc(doc(db, "users", user.id), { isBlocked: newStatus });
                setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isBlocked: newStatus } : u));
            } catch (error) {
                console.error("Error updating user status:", error);
                alert("Failed to update user status.");
            }
        }
    };

    const filteredUsers = users.filter(user =>
        (user.fullName || user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Customers</h1>
                <p className="text-sm font-medium text-gray-500">Manage registered users and access.</p>
            </div>

            {/* Controls */}
            <div className="frosted-paper p-2 rounded-2xl border border-white/60 shadow-sm">
                <div className="relative">
                    <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search customers by name or email..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white/50 rounded-xl font-bold text-gray-900 outline-none focus:bg-white transition-colors"
                    />
                </div>
            </div>

            {/* Users List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary" size={32} /></div>
                ) : filteredUsers.length === 0 ? (
                    <div className="text-center py-10 opacity-50">
                        <User size={48} className="mx-auto mb-4" />
                        <p className="font-bold">No customers found</p>
                    </div>
                ) : (
                    filteredUsers.map(user => (
                        <div key={user.id} className="frosted-paper p-4 rounded-3xl border border-white/60 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4">

                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-gray-100 to-gray-200 flex items-center justify-center text-gray-500 font-black text-lg">
                                    {(user.fullName || user.name || user.email || 'U').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{user.fullName || user.name || 'Guest User'}</h3>
                                    <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                                        <Mail size={12} /> {user.email}
                                    </div>
                                    <div className="mt-1">
                                        {user.role === 'admin' ? (
                                            <span className="bg-purple-100 text-purple-700 text-[10px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
                                                <Shield size={10} /> Admin
                                            </span>
                                        ) : (
                                            <span className="bg-gray-100 text-gray-600 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">Customer</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 w-full md:w-auto mt-2 md:mt-0 pl-16 md:pl-0">
                                <div className="text-right mr-4 hidden md:block">
                                    <p className="text-xs font-bold text-gray-400 uppercase">Joined</p>
                                    <p className="text-sm font-bold text-gray-700">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
                                </div>

                                {user.role !== 'admin' && (
                                    <button
                                        onClick={() => toggleBlockUser(user)}
                                        className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-colors ${user.isBlocked
                                            ? 'bg-red-100 text-red-600 hover:bg-red-200'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                    >
                                        {user.isBlocked ? <><Ban size={14} /> Unblock</> : <><CheckCircle size={14} /> Active</>}
                                    </button>
                                )}
                            </div>

                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Customers;
