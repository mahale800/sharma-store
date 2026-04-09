import { useState, useEffect } from 'react';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useShop } from '../context/ShopContext';

export const useAnalytics = () => {
    const { allProducts } = useShop();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        pendingOrders: 0,
        deliveredOrders: 0,
        totalCustomers: 0,
        monthlySales: [],
        topProducts: []
    });

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const ordersRef = collection(db, 'orders');
                const q = query(ordersRef, orderBy('createdAt', 'desc'));
                const snapshot = await getDocs(q);

                let revenue = 0;
                let pending = 0;
                let delivered = 0;
                const statusCounts = { Pending: 0, Confirmed: 0, Processing: 0, Shipped: 0, Delivered: 0, Cancelled: 0 };
                const uniqueCustomers = new Set();
                const productSales = {};
                const salesByDate = {};

                snapshot.docs.forEach(doc => {
                    const order = doc.data();
                    const amount = Number(order.total) || 0;

                    // KPI Counts
                    if (order.status !== 'Cancelled') {
                        revenue += amount;
                    }
                    if (order.status === 'Pending') pending++;
                    if (order.status === 'Delivered') delivered++;
                    if (statusCounts[order.status] !== undefined) statusCounts[order.status]++;
                    if (order.userId) uniqueCustomers.add(order.userId);

                    // Chart Data (Group by Date)
                    let date;
                    try {
                        date = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
                    } catch {
                        date = new Date(); // Fallback to now if totally broken
                    }

                    if (!isNaN(date.getTime()) && order.status !== 'Cancelled') {
                        const dateKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        salesByDate[dateKey] = (salesByDate[dateKey] || 0) + amount;
                    }

                    // Top Products
                    if (order.items && Array.isArray(order.items)) {
                        order.items.forEach(item => {
                            if (!productSales[item.id]) {
                                productSales[item.id] = {
                                    name: item.name,
                                    unitsSold: 0,
                                    revenue: 0,
                                    image: item.image || item.imageUrl
                                };
                            }
                            productSales[item.id].unitsSold += item.quantity || 1;
                            productSales[item.id].revenue += (item.price * (item.quantity || 1));
                        });
                    }
                });

                // Format Chart Data
                // Get last 7 days keys to ensure continuity or just use available data
                const chartData = Object.keys(salesByDate).map(date => ({
                    name: date,
                    sales: salesByDate[date]
                })).slice(0, 14).reverse(); // Just showing last available days roughly

                // Format Top Products
                const topProducts = Object.values(productSales)
                    .sort((a, b) => b.unitsSold - a.unitsSold)
                    .slice(0, 5);

                // Status Distribution for chart
                const statusDistribution = Object.entries(statusCounts)
                    .filter(([, count]) => count > 0)
                    .map(([status, count]) => ({ name: status, value: count }));

                // Recent Orders (first 5 from desc query)
                const recentOrders = snapshot.docs.slice(0, 5).map(d => {
                    const o = d.data();
                    return {
                        id: d.id,
                        orderId: o.orderId || d.id.slice(0, 8),
                        customer: o.address?.fullName || o.userEmail || 'Guest',
                        total: Number(o.total) || 0,
                        status: o.status || 'Pending',
                        createdAt: o.createdAt
                    };
                });

                setStats({
                    totalRevenue: revenue,
                    totalOrders: snapshot.size,
                    pendingOrders: pending,
                    deliveredOrders: delivered,
                    totalCustomers: uniqueCustomers.size,
                    monthlySales: chartData,
                    topProducts,
                    statusDistribution,
                    recentOrders
                });

            } catch (error) {
                console.error("Error fetching analytics:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [allProducts]);

    return { stats, loading };
};
