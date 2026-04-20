import React from 'react';
import { Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePWAInstall } from '../../hooks/usePWAInstall';

const PWAInstallPrompt = () => {
  const { isInstallable, isInstalled, promptInstall } = usePWAInstall();

  // If it's already installed or not installable, don't show the prompt
  if (!isInstallable || isInstalled) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-20 left-4 right-4 md:bottom-6 md:left-auto md:right-6 md:w-80 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-orange-100 dark:border-slate-700 p-4 z-50 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-orange-600 dark:text-orange-500 font-bold text-xl">S</span>
          </div>
          <div>
            <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Install Sharma Store</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Add to home screen for faster access</p>
          </div>
        </div>
        <button
          onClick={promptInstall}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
        >
          <Download size={16} />
          <span>Install</span>
        </button>
      </motion.div>
    </AnimatePresence>
  );
};

export default PWAInstallPrompt;
