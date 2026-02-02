import React from 'react';
import { RefreshCcw, AlertTriangle, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

class GlobalErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught Error:", error, errorInfo);
    }

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
                    <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6 animate-bounce">
                        <AlertTriangle className="text-red-500" size={48} />
                    </div>

                    <h1 className="text-3xl font-black text-gray-900 mb-2">Something went wrong</h1>
                    <p className="text-gray-500 font-medium mb-8 max-w-md">
                        We apologize for the inconvenience. The application encountered an unexpected error.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                        <button
                            onClick={this.handleReload}
                            className="px-8 py-3 bg-gray-900 text-white font-bold rounded-xl shadow-lg hover:bg-black transition-all flex items-center justify-center gap-2"
                        >
                            <RefreshCcw size={18} /> Reload Page
                        </button>

                        <Link
                            to="/"
                            className="px-8 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl shadow-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                            onClick={() => this.setState({ hasError: false })}
                        >
                            <Home size={18} /> Go Home
                        </Link>
                    </div>

                    {/* Developer Details (Hidden in Prod usually, but helpful here) */}
                    <div className="mt-12 p-4 bg-gray-100/50 rounded-xl max-w-lg w-full text-left overflow-hidden">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Error Details</p>
                        <code className="text-xs text-red-500 font-mono block whitespace-pre-wrap break-words">
                            {this.state.error && this.state.error.toString()}
                        </code>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default GlobalErrorBoundary;
