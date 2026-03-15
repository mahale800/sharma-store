import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail, Heart } from 'lucide-react';
import Logo from './common/Logo';

const Footer = () => {
    return (
        <footer className="bg-slate-900 text-slate-300 py-12 font-sans relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5 pointer-events-none notebook-grid"></div>

            <div className="max-w-[1300px] mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 relative z-10">

                {/* Brand Column */}
                <div className="space-y-4">
                    <Link to="/" className="inline-block hover:opacity-90 transition-opacity">
                        <Logo variant="full" size="lg" color="white" />
                    </Link>
                    <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                        Fueling your creativity with premium stationery. Curated collections for students, artists, and professionals.
                    </p>
                    <div className="flex gap-4 pt-2">
                        <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-orange-600 hover:text-white transition-all transform hover:scale-110">
                            <Instagram size={16} />
                        </a>
                        <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-orange-600 hover:text-white transition-all transform hover:scale-110">
                            <Facebook size={16} />
                        </a>
                        <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-orange-600 hover:text-white transition-all transform hover:scale-110">
                            <Twitter size={16} />
                        </a>
                    </div>
                </div>

                {/* Quick Links */}
                <div>
                    <h3 className="text-white font-bold text-lg mb-6 font-[Outfit]">Quick Links</h3>
                    <ul className="space-y-3 text-sm">
                        <li><Link to="/" className="hover:text-orange-500 transition-colors flex items-center gap-2">Home</Link></li>
                        <li><Link to="/products" className="hover:text-orange-500 transition-colors flex items-center gap-2">Shop Collection</Link></li>
                        <li><Link to="/account" className="hover:text-orange-500 transition-colors flex items-center gap-2">My Account</Link></li>
                        <li><Link to="#" className="hover:text-orange-500 transition-colors flex items-center gap-2">About Us</Link></li>
                    </ul>
                </div>

                {/* Customer Service */}
                <div>
                    <h3 className="text-white font-bold text-lg mb-6 font-[Outfit]">Support</h3>
                    <ul className="space-y-3 text-sm">
                        <li><button onClick={() => window.dispatchEvent(new Event('openFeedback'))} className="hover:text-orange-500 transition-colors text-left">Help us improve</button></li>
                        <li><Link to="#" className="hover:text-orange-500 transition-colors">Contact Us</Link></li>
                        <li><Link to="#" className="hover:text-orange-500 transition-colors">Shipping Policy</Link></li>
                        <li><Link to="#" className="hover:text-orange-500 transition-colors">Returns & Exchanges</Link></li>
                        <li><Link to="#" className="hover:text-orange-500 transition-colors">FAQs</Link></li>
                    </ul>
                </div>

                {/* Contact Info */}
                <div>
                    <h3 className="text-white font-bold text-lg mb-6 font-[Outfit]">Get in Touch</h3>
                    <ul className="space-y-4 text-sm">
                        <li className="flex items-start gap-3">
                            <MapPin className="text-orange-500 shrink-0 mt-0.5" size={18} />
                            <span>Jalgaon, Maharashtra,<br />India.</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <Phone className="text-orange-500 shrink-0" size={18} />
                            <a href="tel:+919021780559" className="hover:text-orange-500 transition-colors">+91 9021780559</a>
                        </li>
                        <li className="flex items-center gap-3">
                            <Mail className="text-orange-500 shrink-0" size={18} />
                            <a href="mailto:contact@sharmastore.com" className="hover:text-orange-500 transition-colors">contact@sharmastore.com</a>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Copyright Bar */}
            <div className="max-w-[1300px] mx-auto px-6 md:px-12 mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500 relative z-10">
                <p>&copy; 2024 Sharma Store. All rights reserved.</p>
                <div className="flex items-center gap-1">
                    <span>Designed & Developed by</span>
                    <a href="https://github.com/yashmahale" target="_blank" rel="noopener noreferrer" className="font-bold text-slate-300 hover:text-orange-500 transition-colors">
                        Yash Mahale
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
