import React from 'react';
import { AlertTriangle, Settings } from 'lucide-react';

/**
 * Configuration Warning Component
 * Shows when Firebase environment variables are missing
 */
const MissingConfigWarning = () => {
    const isVercel = window.location.hostname.includes('vercel.app');

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 p-4">
            <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-orange-100">
                {/* Icon */}
                <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg">
                    <AlertTriangle className="text-white" size={40} />
                </div>

                {/* Title */}
                <h1 className="text-3xl md:text-4xl font-black text-center text-gray-900 mb-4">
                    Configuration Required
                </h1>

                {/* Message */}
                <p className="text-gray-600 text-center text-lg mb-8 leading-relaxed">
                    {isVercel
                        ? "This app is deployed but missing Firebase configuration."
                        : "Firebase environment variables are not configured."}
                </p>

                {/* Instructions */}
                <div className="bg-gray-50 rounded-2xl p-6 mb-8">
                    <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Settings size={20} />
                        Setup Instructions
                    </h2>

                    <ol className="space-y-3 text-sm text-gray-700">
                        <li className="flex gap-3">
                            <span className="font-bold text-orange-600 bg-orange-100 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">1</span>
                            <span>
                                {isVercel
                                    ? "Go to your Vercel Dashboard → Project Settings → Environment Variables"
                                    : "Create a .env file in the sharma-store folder"}
                            </span>
                        </li>
                        <li className="flex gap-3">
                            <span className="font-bold text-orange-600 bg-orange-100 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">2</span>
                            <span>Add your Firebase credentials (get them from Firebase Console → Project Settings)</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="font-bold text-orange-600 bg-orange-100 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">3</span>
                            <span>
                                {isVercel
                                    ? "Click 'Redeploy' after adding the variables"
                                    : "Restart the development server"}
                            </span>
                        </li>
                    </ol>
                </div>

                {/* Required Variables */}
                <div className="mb-8">
                    <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wider">Required Variables:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {[
                            'VITE_FIREBASE_API_KEY',
                            'VITE_FIREBASE_AUTH_DOMAIN',
                            'VITE_FIREBASE_PROJECT_ID',
                            'VITE_FIREBASE_STORAGE_BUCKET',
                            'VITE_FIREBASE_MESSAGING_SENDER_ID',
                            'VITE_FIREBASE_APP_ID'
                        ].map((varName) => (
                            <div key={varName} className="bg-orange-50 border border-orange-200 rounded-lg px-3 py-2 text-xs font-mono text-orange-800">
                                {varName}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Links */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <a
                        href="https://console.firebase.google.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-xl transition-all text-center flex items-center justify-center gap-2"
                    >
                        Open Firebase Console
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                    </a>

                    {isVercel && (
                        <a
                            href="https://vercel.com/dashboard"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-xl transition-all text-center"
                        >
                            Vercel Dashboard
                        </a>
                    )}
                </div>

                {/* Developer Note */}
                <p className="text-xs text-gray-400 text-center mt-8">
                    Check the browser console for detailed error messages
                </p>
            </div>
        </div>
    );
};

export default MissingConfigWarning;
