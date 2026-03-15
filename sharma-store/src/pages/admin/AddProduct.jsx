import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Save, Loader2, Link as LinkIcon, Upload, Image as ImageIcon, Trash2, Tag, IndianRupee, Layers, FileText } from 'lucide-react';
import Button from '../../components/Button';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { collection, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';

const AddProduct = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;
    const fileInputRef = useRef(null);

    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(isEditMode);
    const [inputType, setInputType] = useState('url');

    const [formData, setFormData] = useState({
        name: '', category: 'Stationery', price: '', stock: '', image: '', description: ''
    });

    useEffect(() => {
        const fetchProduct = async () => {
            if (isEditMode) {
                try {
                    const docSnap = await getDoc(doc(db, "products", id));
                    if (docSnap.exists()) setFormData(docSnap.data());
                    else { alert("Product not found"); navigate('/admin/products'); }
                } catch (error) { console.error("Error", error); } finally { setInitialLoading(false); }
            }
        };
        fetchProduct();
    }, [id, isEditMode, navigate]);

    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file || file.size > 400 * 1024) {
            if (file) alert('Image too large (<400KB needed)');
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => setFormData(prev => ({ ...prev, image: reader.result }));
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = { ...formData, price: Number(formData.price), stock: Number(formData.stock) };
            if (isEditMode) await updateDoc(doc(db, "products", id), data);
            else await addDoc(collection(db, "products"), { ...data, createdAt: new Date() });
            navigate('/admin/products');
        } catch { alert("Failed to save"); } finally { setLoading(false); }
    };

    if (initialLoading) return <div className="flex justify-center h-96 items-center"><Loader2 size={40} className="animate-spin text-primary" /></div>;

    return (
        <div className="max-w-3xl mx-auto space-y-8">

            {/* Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="white"
                    size="icon"
                    onClick={() => navigate('/admin/products')}
                    className="shadow-sm text-gray-500 hover:text-gray-900"
                >
                    <ArrowLeft size={24} />
                </Button>
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">{isEditMode ? 'Edit Product' : 'New Product'}</h1>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="frosted-paper p-8 rounded-[2.5rem] border border-white/60 shadow-lg">
                <div className="space-y-8">

                    {/* Image Section */}
                    <div className="space-y-4">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest pl-2">Product Image</label>

                        {!formData.image ? (
                            <div
                                onClick={() => inputType === 'file' && fileInputRef.current?.click()}
                                className={`relative w-full h-64 rounded-3xl border-2 border-dashed border-gray-300 bg-gray-50/50 flex flex-col items-center justify-center gap-4 group transition-all ${inputType === 'file' ? 'hover:bg-primary/5 hover:border-primary/30 cursor-pointer' : ''}`}
                            >
                                {inputType === 'file' ? (
                                    <>
                                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm text-gray-400 group-hover:text-primary transition-colors">
                                            <Upload size={32} />
                                        </div>
                                        <p className="text-sm font-bold text-gray-400 group-hover:text-primary">Click to upload image</p>
                                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                                    </>
                                ) : (
                                    <div className="w-full max-w-sm px-8">
                                        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-100">
                                            <div className="pl-3 pr-2 flex items-center justify-center text-gray-400"><LinkIcon size={20} /></div>
                                            <input type="url" name="image" value={formData.image || ''} onChange={handleChange} placeholder="Paste Image URL here..." className="flex-1 py-2 outline-none text-sm font-bold text-gray-900 placeholder:font-medium placeholder:text-gray-300" />
                                        </div>
                                    </div>
                                )}

                                <div className="absolute top-4 right-4 flex bg-white/80 backdrop-blur p-1 rounded-xl shadow-sm">
                                    <button type="button" onClick={(e) => { e.stopPropagation(); setInputType('url') }} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${inputType === 'url' ? 'bg-primary text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}>URL</button>
                                    <button type="button" onClick={(e) => { e.stopPropagation(); setInputType('file') }} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${inputType === 'file' ? 'bg-primary text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}>Upload</button>
                                </div>
                            </div>
                        ) : (
                            <div className="relative w-full h-64 rounded-3xl overflow-hidden group bg-white shadow-inner">
                                <img src={formData.image} alt="Preview" className="w-full h-full object-contain p-4" onError={(e) => e.target.style.display = 'none'} />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                                    <button type="button" onClick={() => setFormData(p => ({ ...p, image: '' }))} className="bg-white text-red-500 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-transform shadow-xl">
                                        <Trash2 size={20} /> Remove
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Name */}
                        <div className="space-y-4">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest pl-2">Details</label>
                            <div className="relative group">
                                <Tag className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
                                <input required type="text" name="name" value={formData.name || ''} onChange={handleChange} placeholder="Product Name" className="w-full pl-12 pr-4 py-3.5 bg-white/50 border-2 border-transparent focus:border-primary/20 rounded-2xl font-bold text-gray-900 outline-none focus:bg-white transition-all shadow-sm" />
                            </div>
                            <div className="relative group">
                                <Layers className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
                                <select name="category" value={formData.category || 'stationary'} onChange={handleChange} className="w-full pl-12 pr-4 py-3.5 bg-white/50 border-2 border-transparent focus:border-primary/20 rounded-2xl font-bold text-gray-900 outline-none focus:bg-white transition-all shadow-sm appearance-none cursor-pointer">
                                    <option value="stationary">Stationery</option>
                                    <option value="toys">Toys</option>
                                    <option value="jewelry">Jewelry</option>
                                    <option value="birthday">Birthday</option>
                                </select>
                            </div>
                        </div>

                        {/* Inventory */}
                        <div className="space-y-4">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest pl-2">Inventory</label>
                            <div className="relative group">
                                <IndianRupee className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-green-500 transition-colors" size={20} />
                                <input required type="number" name="price" value={formData.price || ''} onChange={handleChange} placeholder="Price" className="w-full pl-12 pr-4 py-3.5 bg-white/50 border-2 border-transparent focus:border-green-500/20 rounded-2xl font-bold text-gray-900 outline-none focus:bg-white transition-all shadow-sm" />
                            </div>
                            <div className="relative group">
                                <div className="absolute left-4 top-3.5 text-gray-400 font-bold group-focus-within:text-primary transition-colors">Qty</div>
                                <input required type="number" name="stock" value={formData.stock || ''} onChange={handleChange} placeholder="Stock" className="w-full pl-14 pr-4 py-3.5 bg-white/50 border-2 border-transparent focus:border-primary/20 rounded-2xl font-bold text-gray-900 outline-none focus:bg-white transition-all shadow-sm" />
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-4">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest pl-2">Description</label>
                        <div className="relative group">
                            <FileText className="absolute left-4 top-4 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
                            <textarea name="description" value={formData.description || ''} onChange={handleChange} rows="4" placeholder="Product details..." className="w-full pl-12 pr-4 py-4 bg-white/50 border-2 border-transparent focus:border-primary/20 rounded-2xl font-bold text-gray-900 outline-none focus:bg-white transition-all shadow-sm resize-none"></textarea>
                        </div>
                    </div>

                    {/* Action Button */}
                    {/* Action Button */}
                    <Button
                        type="submit"
                        isLoading={loading}
                        disabled={loading}
                        className={`w-full h-14 text-lg shadow-xl ${isEditMode ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200' : 'bg-green-500 hover:bg-green-600 shadow-green-200'} text-white border-none`}
                    >
                        {!loading && <Save className="mr-2" />}
                        {isEditMode ? 'Update Product' : 'Save New Product'}
                    </Button>

                </div>
            </form>
        </div>
    );
};

export default AddProduct;
