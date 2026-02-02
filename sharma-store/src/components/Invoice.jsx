import React from 'react';
import Logo from './common/Logo';

const Invoice = ({ order, user }) => {
    if (!order) return null;

    return (
        <div className="bg-white text-black p-8 max-w-[210mm] mx-auto min-h-[297mm] relative leading-normal">
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-gray-800 pb-6 mb-6">
                <div>
                    <div className="scale-75 origin-top-left -mb-2">
                        <Logo variant="full" />
                    </div>
                    <div className="text-xs font-medium text-gray-600 mt-2 space-y-0.5">
                        <p>123, Stationery Lane, Art District</p>
                        <p>New Delhi, India - 110001</p>
                        <p>support@sharmastore.com</p>
                        <p>+91 98765 43210</p>
                    </div>
                </div>
                <div className="text-right">
                    <h1 className="text-4xl font-extrabold text-gray-900 uppercase tracking-widest">INVOICE</h1>
                    <div className="mt-2 text-sm text-gray-900 space-y-1">
                        <p className="font-bold"># {order.orderId || order.id}</p>
                        <p>{order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>
            </div>

            {/* Bill To / Ship To */}
            <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                    <h3 className="text-xs font-bold uppercase text-gray-500 tracking-wider mb-2">Billed To</h3>
                    <div className="text-sm font-semibold text-gray-800">
                        <p className="text-base text-black mb-1">{user?.displayName || order.address?.fullName || 'Customer'}</p>
                        <p>{order.address?.streetAddress || order.address?.addressLine1}</p>
                        <p>{order.address?.city}, {order.address?.state}</p>
                        <p>{order.address?.pincode}</p>
                        <p className="mt-1 font-bold">{order.address?.phoneNumber}</p>
                        <p className="text-xs text-gray-600">{order.userEmail || user?.email}</p>
                    </div>
                </div>
                <div className="text-right">
                    <h3 className="text-xs font-bold uppercase text-gray-500 tracking-wider mb-2">Payment Details</h3>
                    <div className="text-sm font-semibold text-gray-800">
                        <p className="mb-1">Method: <span className="uppercase">{order.paymentMethod || 'Online'}</span></p>
                        <p>Trans ID: {order.transactionId || 'N/A'}</p>
                        <div className="mt-4 inline-block px-3 py-1 border border-black rounded text-xs font-bold uppercase">
                            {order.status || 'Confirmed'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Items Table */}
            <div className="mb-8">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b-2 border-gray-800">
                            <th className="py-2 text-xs font-bold uppercase text-gray-600">Item Name</th>
                            <th className="py-2 text-xs font-bold uppercase text-gray-600 text-center">Qty</th>
                            <th className="py-2 text-xs font-bold uppercase text-gray-600 text-right">Unit Price</th>
                            <th className="py-2 text-xs font-bold uppercase text-gray-600 text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {order.items?.map((item, idx) => (
                            <tr key={idx} className="border-b border-gray-200">
                                <td className="py-3 pr-4">
                                    <p className="font-bold text-gray-900">{item.name}</p>
                                    <p className="text-xs text-gray-500">{item.variant || 'Standard'}</p>
                                </td>
                                <td className="py-3 text-center font-medium">{item.quantity}</td>
                                <td className="py-3 text-right font-medium">₹{item.price}</td>
                                <td className="py-3 text-right font-bold">₹{item.price * item.quantity}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end mb-12">
                <div className="w-1/2 max-w-xs space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-600">Subtotal</span>
                        <span className="font-bold">₹{order.total}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-600">Shipping</span>
                        <span className="font-bold text-gray-900">Free</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-600">Tax (Incl.)</span>
                        <span className="font-bold text-gray-900">₹0.00</span>
                    </div>
                    <div className="border-t-2 border-gray-800 pt-2 flex justify-between text-lg font-black mt-2">
                        <span>Total</span>
                        <span>₹{order.total}</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-10 left-8 right-8 text-center border-t border-gray-200 pt-6">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Thank you for shopping with Sharma Store</p>
                <p className="text-[10px] text-gray-400">This is a computer-generated invoice and does not require a physical signature.</p>
                <p className="text-[10px] text-gray-400 mt-1">Visit us at www.sharmastore.com</p>
            </div>
        </div>
    );
};

export default Invoice;
