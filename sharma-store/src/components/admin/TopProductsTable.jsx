import React from 'react';

const TopProductsTable = ({ products }) => {
    return (
        <div className="bg-white/70 backdrop-blur-lg p-6 rounded-3xl border border-white/50 shadow-sm h-full">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Top Products</h3>

            <div className="space-y-4">
                {products.length === 0 ? (
                    <p className="text-gray-400 text-center py-4">No sales data yet.</p>
                ) : (
                    products.map((product, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 hover:bg-white/50 rounded-2xl transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 p-1 flex-shrink-0">
                                    <img
                                        src={product.image || 'https://placehold.co/100'}
                                        alt={product.name}
                                        className="w-full h-full object-contain rounded-lg"
                                    />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 text-sm line-clamp-1">{product.name}</p>
                                    <p className="text-xs text-gray-500">{product.unitsSold} units sold</p>
                                </div>
                            </div>
                            <span className="font-bold text-gray-900 text-sm">₹{product.revenue}</span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default TopProductsTable;
