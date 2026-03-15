/**
 * Order Lifecycle State Machine
 * Central source of truth for order states, transitions, and UI styling.
 *
 * States:  Pending → Confirmed → Processing → Shipped → Delivered
 * Special: Cancelled (allowed before Shipped)
 */

// ─── Valid States ──────────────────────────────────────────
export const ORDER_STATUSES = [
    'Pending',
    'Confirmed',
    'Processing',
    'Shipped',
    'Delivered',
    'Cancelled',
];

// ─── Transition Map ────────────────────────────────────────
// Each key maps to the list of states it can transition TO.
const TRANSITIONS = {
    Pending:    ['Confirmed', 'Cancelled'],
    Confirmed:  ['Processing', 'Cancelled'],
    Processing: ['Shipped', 'Cancelled'],
    Shipped:    ['Delivered'],
    Delivered:  [],          // Terminal state
    Cancelled:  [],          // Terminal state
};

/**
 * Returns the list of valid next states for a given current status.
 * If the status is unknown, returns an empty array (safe default).
 */
export const getNextStates = (currentStatus) => {
    return TRANSITIONS[currentStatus] || [];
};

/**
 * Checks whether a transition from `from` to `to` is valid.
 */
export const isValidTransition = (from, to) => {
    return getNextStates(from).includes(to);
};

// ─── Tracking Timeline ────────────────────────────────────
// The ordered steps shown on the tracking page.
export const ORDER_STEPS = [
    { key: 'Pending',    label: 'Placed' },
    { key: 'Confirmed',  label: 'Confirmed' },
    { key: 'Processing', label: 'Processing' },
    { key: 'Shipped',    label: 'Shipped' },
    { key: 'Delivered',  label: 'Delivered' },
];

/**
 * Returns the numerical step index (0-based) for a given status.
 * Cancelled returns -1 so UIs can handle it specially.
 */
export const getStepIndex = (status) => {
    if (status === 'Cancelled') return -1;
    const idx = ORDER_STEPS.findIndex(s => s.key === status);
    // 'Placed' is an alias for 'Pending'
    if (idx === -1 && (status || '').toLowerCase() === 'placed') return 0;
    return idx >= 0 ? idx : 0;
};

// ─── Status Badge Styling ──────────────────────────────────
export const getStatusStyle = (status) => {
    switch (status) {
        case 'Pending':
            return { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' };
        case 'Confirmed':
            return { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200' };
        case 'Processing':
            return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' };
        case 'Shipped':
            return { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' };
        case 'Delivered':
            return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' };
        case 'Cancelled':
            return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' };
        default:
            return { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' };
    }
};
