import React, { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppBtn from '../components/WhatsAppBtn';
import ChatBot from '../components/ChatBot';
import OfflineBanner from '../components/pwa/OfflineBanner';
import InstallPrompt from '../components/pwa/InstallPrompt';
import { Loader2 } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import PageTransition from '../components/common/PageTransition';

const PublicLayout = () => {
    const location = useLocation();

    return (
        <>
            <OfflineBanner />
            <InstallPrompt />
            <Navbar />
            <div className="print:hidden">
                <WhatsAppBtn />
                <ChatBot />
            </div>

            <div className="min-h-screen flex flex-col pt-28 md:pt-32 pb-20 md:pb-0">
                <AnimatePresence mode="wait">
                    {/* Key on Routes usually works better, but here we wrap Outlet.
                        To make AnimatePresence work with Outlet, the Outlet's content must differ.
                        We key the PageTransition to the pathname. */}
                    <PageTransition key={location.pathname} className="flex-1">
                        <Suspense fallback={
                            <div className="min-h-[60vh] flex items-center justify-center">
                                <Loader2 className="animate-spin text-orange-500" size={40} />
                            </div>
                        }>
                            <Outlet />
                        </Suspense>
                    </PageTransition>
                </AnimatePresence>
            </div>

            <div className="print:hidden">
                <Footer />
            </div>
        </>
    );
};

export default PublicLayout;
