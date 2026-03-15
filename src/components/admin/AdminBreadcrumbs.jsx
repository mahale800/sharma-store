import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const AdminBreadcrumbs = () => {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);
    // pathnames usually: ['admin', 'products', 'add']

    // If we are at root admin (dashboard), maybe show nothing or just Dashboard
    if (pathnames.length <= 1) return null;

    return (
        <nav className="flex items-center text-sm font-medium mb-6 animate-in fade-in slide-in-from-left-2 duration-300">
            <Link to="/admin/dashboard" className="text-gray-400 hover:text-gray-600 transition-colors flex items-center">
                <Home size={14} />
            </Link>
            {pathnames.map((value, index) => {
                const isLast = index === pathnames.length - 1;
                const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                const title = value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ');

                // Skip 'admin' in the visual trail if desired, or keep it.
                // Commonly users want: Admin > Products > Add
                if (value === 'admin') return null;

                return (
                    <div key={to} className="flex items-center">
                        <ChevronRight size={14} className="text-gray-300 mx-2" />
                        {isLast ? (
                            <span className="text-gray-800 font-bold">{title}</span>
                        ) : (
                            <Link to={to} className="text-gray-400 hover:text-orange-500 transition-colors">
                                {title}
                            </Link>
                        )}
                    </div>
                );
            })}
        </nav>
    );
};

export default AdminBreadcrumbs;
