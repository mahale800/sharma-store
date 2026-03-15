import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class AdminErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        console.error("Admin Panel Crash:", error, errorInfo);
        this.setState({ errorInfo });
    }

    handleRefresh = () => {
        window.location.reload();
    };

    handleHome = () => {
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center text-red-500 mb-6 shadow-sm">
                        <AlertTriangle size={32} />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-2">Something went wrong</h2>
                    <p className="text-gray-500 max-w-md mb-8">
                        The Admin Panel encountered an unexpected error.
                        <br />
                        <span className="text-xs font-mono bg-gray-200 px-1 rounded mt-2 inline-block">
                            {this.state.error?.toString() || 'Unknown Error'}
                        </span>
                    </p>

                    <div className="flex gap-4">
                        <button
                            onClick={this.handleRefresh}
                            className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                        >
                            <RefreshCw size={18} /> Reload Page
                        </button>
                        <button
                            onClick={this.handleHome}
                            className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/20"
                        >
                            <Home size={18} /> Return Home
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default AdminErrorBoundary;
