import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminNavbar from '../components/admin/AdminNavbar';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminMobileNav from '../components/admin/AdminMobileNav';
import AdminBreadcrumbs from '../components/admin/AdminBreadcrumbs';

const AdminLayout = () => {
    return (
        <div className="min-h-screen bg-transparent font-sans">

            {/* Desktop Sidebar */}
            <AdminSidebar />

            {/* Mobile Navigation */}
            <AdminMobileNav />

            {/* --- MAIN CONTENT WRAPPER --- */}
            <main className="md:pl-[20rem] px-4 sm:px-6 md:pr-8 md:pl-[20rem] py-4 md:py-8 min-h-screen w-full pb-24 md:pb-8">

                {/* Top Desktop Navbar (Search, Profile, etc) */}
                <AdminNavbar />

                {/* Breadcrumbs */}
                <AdminBreadcrumbs />

                {/* Page Content */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Outlet />
                </div>
            </main>

        </div>
    );
};

export default AdminLayout;
