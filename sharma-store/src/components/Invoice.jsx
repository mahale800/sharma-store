import React from 'react';
import Logo from './common/Logo';

const Invoice = ({ order, user }) => {
    if (!order) return null;

    return (
        <div className="bg-white text-black p-10 max-w-[210mm] mx-auto min-h-[297mm] relative leading-relaxed font-sans print:w-full print:max-w-none print:min-h-0 print:p-8">
            {/* Watermark/Background decoration for premium feel (Screen only) */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-gray-50 via-transparent to-transparent -z-10 rounded-bl-[100px] print:hidden"></div>

            {/* Header */}
            <div className="flex justify-between items-start border-b border-gray-900 pb-8 mb-8">
                <div>
                    <div className="scale-90 origin-top-left -mb-1">
                        <Logo variant="full" />
                    </div>
                    <div className="text-xs font-medium text-gray-500 mt-4 space-y-1">
                        <p className="font-bold text-gray-900">Sharma Store</p>
                        <p>123, Stationery Lane, Art District</p>
                        <p>New Delhi, India - 110001</p>
                        <p>support@sharmastore.com • +91 98765 43210</p>
                    </div>
                </div>
                <div className="text-right">
                    <h1 className="text-5xl font-black text-gray-900 tracking-tighter uppercase opacity-10">INVOICE</h1>
                    <div className="mt-[-2rem] relative z-10">
                        <p className="text-lg font-bold text-gray-900 mb-1">Recipe # {order.orderId || order.id}</p>
                        <p className="text-sm text-gray-500">Date: {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                    </div>
                </div>
            </div>

            {/* Bill To / Ship To Grid */}
            <div className="grid grid-cols-2 gap-12 mb-10">
                <div className="space-y-1">
                    <h3 className="text-[10px] font-bold uppercase text-gray-400 tracking-widest mb-3">Billed To</h3>
                    <p className="font-bold text-gray-900 text-lg">{order.address?.fullName || user?.displayName || 'Guest Customer'}</p>
                    <div className="text-sm text-gray-600 leading-snug">
                        <p>{order.address?.addressLine1 || order.address?.streetAddress}</p>
                        <p>{order.address?.city}, {order.address?.state}</p>
                        <p>{order.address?.pincode}</p>
                    </div>
                    <div className="pt-2">
                        <p className="text-sm font-medium text-gray-900">Ph: {order.address?.phoneNumber}</p>
                        <p className="text-sm text-gray-500">{order.userEmail || user?.email}</p>
                    </div>
                </div>

                <div className="space-y-6 text-right">
                    <div>
                        <h3 className="text-[10px] font-bold uppercase text-gray-400 tracking-widest mb-3">Payment Info</h3>
                        <p className="text-sm font-medium text-gray-900"><span className="text-gray-500">Method:</span> <span className="capitalize">{order.paymentMethod || 'Online'}</span></p>
                        <p className="text-sm font-medium text-gray-900"><span className="text-gray-500">Trans ID:</span> {order.transactionId || '—'}</p>
                    </div>
                    <div>
                        <h3 className="text-[10px] font-bold uppercase text-gray-400 tracking-widest mb-3">Order Status</h3>
                        <span className={`inline-block px-3 py-1 rounded border ${order.status === 'Delivered' ? 'border-green-200 bg-green-50 text-green-700' : 'border-gray-200 bg-gray-50 text-gray-700'} text-xs font-bold uppercase tracking-wide`}>
                            {order.status || 'Confirmed'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Items Table */}
            <div className="mb-10">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b-2 border-gray-900">
                            <th className="py-3 text-[10px] font-bold uppercase text-gray-500 tracking-wider w-1/2">Item Description</th>
                            <th className="py-3 text-[10px] font-bold uppercase text-gray-500 tracking-wider text-center">Qty</th>
                            <th className="py-3 text-[10px] font-bold uppercase text-gray-500 tracking-wider text-right">Unit Price</th>
                            <th className="py-3 text-[10px] font-bold uppercase text-gray-500 tracking-wider text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {order.items?.map((item, idx) => (
                            <tr key={idx} className="border-b border-gray-100 last:border-0">
                                <td className="py-4 pr-4 align-top">
                                    <p className="font-bold text-gray-900">{item.name}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{item.variant || 'Standard Edition'}</p>
                                </td>
                                <td className="py-4 text-center font-medium text-gray-700 align-top">{item.quantity}</td>
                                <td className="py-4 text-right font-medium text-gray-700 align-top">₹{item.price}</td>
                                <td className="py-4 text-right font-bold text-gray-900 align-top">₹{item.price * item.quantity}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Totals Section */}
            <div className="flex justify-end mb-20">
                <div className="w-full max-w-xs bg-gray-50 p-6 rounded-lg print:bg-transparent print:p-0">
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="font-medium text-gray-500">Subtotal</span>
                            <span className="font-bold text-gray-900">₹{order.total}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="font-medium text-gray-500">Shipping</span>
                            <span className="font-bold text-green-600">Free</span>
                        </div>
                        <div className="h-px bg-gray-200 my-2"></div>
                        <div className="flex justify-between items-end">
                            <span className="font-black text-gray-900 text-lg">Total</span>
                            <span className="font-black text-gray-900 text-2xl">₹{order.total}</span>
                        </div>
                        <p className="text-[10px] text-right text-gray-400 mt-2">Inclusive of all taxes</p>
                    </div>
                </div>
            </div>

            {/* Footer - Fixed at bottom not required, let it flow naturally for better variable height handling, 
               but we can use absolute bottom for that "single page" feel if we know it fits.
               Let's use margin-top auto to push it down if there's space, or just standard flow.
            */}
            <div className="border-t-2 border-gray-900 pt-6 text-center">
                <p className="text-sm font-bold text-gray-900 mb-1">Thank you for your business!</p>
                <div className="text-[10px] text-gray-500 uppercase tracking-wide space-x-4">
                    <span>www.sharmastore.com</span>
                    <span>•</span>
                    <span>support@sharmastore.com</span>
                </div>
            </div>
        </div>
    );
};

export default Invoice;
