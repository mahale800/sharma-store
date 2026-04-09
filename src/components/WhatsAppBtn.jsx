import React from 'react';
import { MessageCircle } from 'lucide-react';
import { createWhatsAppUrl } from '../data/shopProfile';
import { useStoreSettings } from '../context/StoreSettingsContext';

const WhatsAppBtn = () => {
    const { storeProfile } = useStoreSettings();

    return (
        <a
            href={createWhatsAppUrl(storeProfile)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Chat on WhatsApp with ${storeProfile.shortName}`}
            // Mobile: bottom-36 (144px) -> Clears ChatBot (80px + 56px size + gap)
            // Desktop: bottom-24 (96px) -> Clears ChatBot (24px + 56px + gap)
            className="fixed bottom-36 right-4 md:bottom-24 md:right-6 z-40 flex flex-col items-end gap-2 group animate-in slide-in-from-bottom duration-700"
        >
            {/* Tooltip */}
            <div className="bg-white/90 backdrop-blur text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 text-gray-800">
                WhatsApp {storeProfile.shortName}
            </div>

            {/* Button */}
            <div className="w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center text-white shadow-xl hover:scale-110 active:scale-95 transition-all cursor-pointer">
                <MessageCircle size={28} fill="white" />
            </div>
        </a>
    );
};

export default WhatsAppBtn;
