import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export const PublicHeader = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'About Ayurveda', path: '/about' },
        { name: 'Services', path: '/services' },
        { name: 'Shop', path: '/shop' },
        { name: 'Contact', path: '/contact' },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <header className="bg-ayur-cream sticky top-0 z-50 shadow-sm font-serif">
            <nav className="container mx-auto px-6 py-4">
                <div className="flex justify-between items-center">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <span className="text-3xl">🌿</span>
                        <div>
                            <h1 className="text-2xl font-bold text-ayur-forest tracking-wide">AyurSutra</h1>
                            <p className="text-xs text-ayur-earth font-sans tracking-wider uppercase">Rooted Wisdom</p>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8 font-sans">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`text-sm font-semibold transition-colors duration-300 ${isActive(link.path) ? 'text-ayur-forest border-b-2 border-ayur-forest' : 'text-gray-600 hover:text-ayur-earth'
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                        <Link
                            to="/login"
                            className="bg-ayur-forest hover:bg-ayur-700 text-white px-6 py-2 rounded-full font-semibold transition-all shadow-md hover:shadow-lg text-sm"
                        >
                            Book Appointment
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden text-ayur-forest"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                        </svg>
                    </button>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div className="md:hidden mt-4 pb-4 border-t border-gray-200">
                        <div className="flex flex-col gap-4 mt-4 font-sans">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    className={`block text-lg font-semibold ${isActive(link.path) ? 'text-ayur-forest' : 'text-gray-600'
                                        }`}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <Link
                                to="/login"
                                className="bg-ayur-forest text-white text-center py-3 rounded-lg font-bold"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Book Appointment
                            </Link>
                        </div>
                    </div>
                )}
            </nav>
        </header>
    );
};
