import React from 'react';
import { MessageCircle } from 'lucide-react';

const WhatsAppBtn = () => {
    return (
        <a
            href="https://wa.me/919021780559?text=Hi%20Sharma%20Store,%20I%20have%20a%20question."
            target="_blank"
            rel="noopener noreferrer"
            // Mobile: bottom-36 (144px) -> Clears ChatBot (80px + 56px size + gap)
            // Desktop: bottom-24 (96px) -> Clears ChatBot (24px + 56px + gap)
            className="fixed bottom-36 right-4 md:bottom-24 md:right-6 z-40 flex flex-col items-end gap-2 group animate-in slide-in-from-bottom duration-700"
        >
            {/* Tooltip */}
            <div className="bg-white/90 backdrop-blur text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 text-gray-800">
                Chat with us!
            </div>

            {/* Button */}
            <div className="w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center text-white shadow-xl hover:scale-110 active:scale-95 transition-all cursor-pointer">
                <MessageCircle size={28} fill="white" />
            </div>
        </a>
    );
};

export default WhatsAppBtn;
