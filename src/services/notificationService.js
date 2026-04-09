import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

const formatStatusMessage = (status, readableOrderId) => {
    switch (status) {
        case 'Processing':
            return `Your order #${readableOrderId} is now being prepared by the shop.`;
        case 'Shipped':
            return `Your order #${readableOrderId} has been shipped and is on the way.`;
        case 'Delivered':
            return `Your order #${readableOrderId} was marked as delivered.`;
        case 'Cancelled':
            return `Your order #${readableOrderId} has been cancelled.`;
        default:
            return `Your order #${readableOrderId} is now ${String(status).toLowerCase()}.`;
    }
};

export const createOrderStatusNotification = async ({ db, userId, orderId, docId, status }) => {
    if (!db || !userId || !status) {
        return null;
    }

    const readableOrderId = orderId || `${docId}`.slice(0, 8).toUpperCase();

    return addDoc(collection(db, 'notifications'), {
        userId,
        type: 'order',
        title: 'Sharma Store',
        body: formatStatusMessage(status, readableOrderId),
        read: false,
        tone: 'Friendly',
        timestamp: serverTimestamp(),
        createdAt: new Date().toISOString(),
        actionUrl: `/track-order/${orderId || docId}`,
        orderId: orderId || docId,
        status
    });
};
