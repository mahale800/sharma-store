export const generateOrderId = () => {
    // Format: ORD-XXXX-XXXX (Easy to read, low collision probability for scale)
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // Removed similar looking chars (0/O, 1/I)
    let result = '';
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `ORD-${result.slice(0, 4)}-${result.slice(4)}`;
};
