export const SHOP_CATEGORIES = [
    'Stationery',
    'Notebooks & Pens',
    'Cutlery & Kitchenware',
    'Gift Items',
    'Toys',
    'Birthday Supplies',
    'Imitation Jewellery',
    'Ladies Essentials',
    'Cosmetics'
];

export const SHOP_PROFILE = {
    name: 'Sharma Stores',
    shortName: 'Sharma Stores',
    tagline: 'Your one-stop shop for stationery, gifts, toys, beauty picks, and daily essentials.',
    phones: ['9322067911', '8275520881'],
    primaryPhone: '9322067911',
    secondaryPhone: '8275520881',
    whatsappNumber: '9322067911',
    email: 'contact@sharmastores.in',
    addressLine1: 'Shop No. 2, Shankar Plaza',
    addressLine2: 'College Hills Road, Jalgaon',
    city: 'Jalgaon',
    state: 'Maharashtra',
    country: 'India',
    fullAddress: 'Shop No. 2, Shankar Plaza, College Hills Road, Jalgaon, Maharashtra, India',
    categories: SHOP_CATEGORIES,
    supportMessage: 'Hi Sharma Stores, I want to know more about your products and availability.',
    adminNotes: [
        'Stationery, notebooks, and pens are a core traffic driver.',
        'Gift items, toys, and birthday supplies need seasonal visibility.',
        'Ladies essentials, cosmetics, and imitation jewellery should be easy to browse by category.'
    ]
};

export const normalizeStoreCategories = (rawCategories) => {
    if (Array.isArray(rawCategories)) {
        return rawCategories.map((category) => `${category}`.trim()).filter(Boolean);
    }

    if (typeof rawCategories === 'string') {
        return rawCategories.split(',').map((category) => category.trim()).filter(Boolean);
    }

    return [...SHOP_CATEGORIES];
};

export const buildStoreProfile = (overrides = {}) => {
    const primaryPhone = `${overrides.primaryPhone || overrides.whatsappNumber || SHOP_PROFILE.primaryPhone}`.replace(/\D/g, '') || SHOP_PROFILE.primaryPhone;
    const secondaryPhone = `${overrides.secondaryPhone || SHOP_PROFILE.secondaryPhone || ''}`.replace(/\D/g, '');
    const fullAddress = overrides.fullAddress || overrides.storeAddress || SHOP_PROFILE.fullAddress;
    const addressParts = `${fullAddress}`.split(',').map((part) => part.trim()).filter(Boolean);
    const categories = normalizeStoreCategories(overrides.categories);

    return {
        ...SHOP_PROFILE,
        ...overrides,
        primaryPhone,
        secondaryPhone,
        whatsappNumber: `${overrides.whatsappNumber || primaryPhone || SHOP_PROFILE.whatsappNumber}`.replace(/\D/g, '') || SHOP_PROFILE.whatsappNumber,
        phones: secondaryPhone ? [primaryPhone, secondaryPhone] : [primaryPhone],
        fullAddress,
        addressLine1: overrides.addressLine1 || addressParts[0] || SHOP_PROFILE.addressLine1,
        addressLine2: overrides.addressLine2 || addressParts.slice(1, 3).join(', ') || SHOP_PROFILE.addressLine2,
        categories: categories.length > 0 ? categories : [...SHOP_CATEGORIES]
    };
};

export const createWhatsAppUrl = (profileOrMessage = SHOP_PROFILE, maybeMessage) => {
    const profile = typeof profileOrMessage === 'object' && profileOrMessage !== null ? profileOrMessage : SHOP_PROFILE;
    const message = typeof profileOrMessage === 'string'
        ? profileOrMessage
        : (maybeMessage || profile.supportMessage || SHOP_PROFILE.supportMessage);

    return `https://wa.me/91${profile.whatsappNumber}?text=${encodeURIComponent(message)}`;
};

export const createMapsUrl = (profile = SHOP_PROFILE) =>
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(profile.fullAddress)}`;
