import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';

/**
 * Sharma Store WhatsApp Notification Service
 * 
 * Handles formatting and sending WhatsApp messages to the store admin
 * whenever a new order is received.
 */

export const sendOrderNotification = async (orderData) => {
    try {
        // 1. Fetch Admin Settings
        const settingsRef = doc(db, 'settings', 'store_config');
        const settingsSnap = await getDoc(settingsRef);

        if (!settingsSnap.exists()) {
            return;
        }

        const settings = settingsSnap.data();

        // 2. Check if Notifications are Enabled
        if (!settings.enableNotifications) {
            return;
        }

        if (!settings.whatsappNumber) {
            return;
        }

        // 3. Format the Message
        const itemsList = orderData.items.map(item =>
            `- ${item.name} x ${item.quantity}`
        ).join('\n');

        // eslint-disable-next-line no-unused-vars
        const message = `
🛒 *New Order Received – ${settings.storeName || 'Sharma Store'}*

*Order ID:* #${orderData.id ? orderData.id.slice(-6).toUpperCase() : 'PENDING'}
*Customer:* ${orderData.address.fullName}
*Phone:* ${orderData.address.phoneNumber}

*Items:*
${itemsList}

*Total:* ₹${orderData.total}
*Payment:* ${orderData.paymentMethod}

*Address:*
${orderData.address.addressLine1}
${orderData.address.city}, ${orderData.address.state} - ${orderData.address.pincode}

⏰ *Time:* ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })}
        `.trim();

        // 4. Send Message (Simulation / API Stub)
        await simulateWhatsAppAPI();

    } catch (error) {
        // Fail silently so we don't block the user flow
        console.error("❌ Failed to send WhatsApp notification:", error);
    }
};

/**
 * Simulates the HTTP call to your backend/WhatsApp Cloud API
 */
const simulateWhatsAppAPI = async () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ success: true });
        }, 1500);
    });
};
