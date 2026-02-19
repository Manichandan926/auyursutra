import React from 'react';
import { Link } from 'react-router-dom';

export const PublicFooter = () => {
    return (
        <footer className="bg-ayur-800 text-white pt-16 pb-8 font-sans">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-3xl">🌿</span>
                            <h2 className="text-2xl font-serif font-bold tracking-wide">AyurSutra</h2>
                        </div>
                        <p className="text-gray-300 mb-6 leading-relaxed">
                            Restoring natural balance through timeless Ayurvedic wisdom. Experience holistic healing tailored to your unique dosha.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="hover:text-ayur-saffron transition">Instagram</a>
                            <a href="#" className="hover:text-ayur-saffron transition">Facebook</a>
                            <a href="#" className="hover:text-ayur-saffron transition">Twitter</a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-serif font-bold mb-6 text-ayur-saffron">Discover</h3>
                        <ul className="space-y-3">
                            <li><Link to="/about" className="text-gray-300 hover:text-white transition">About Ayurveda</Link></li>
                            <li><Link to="/services" className="text-gray-300 hover:text-white transition">Our Therapies</Link></li>
                            <li><Link to="/shop" className="text-gray-300 hover:text-white transition">Herbal Shop</Link></li>
                            <li><Link to="/contact" className="text-gray-300 hover:text-white transition">Contact Us</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-lg font-serif font-bold mb-6 text-ayur-saffron">Visit Us</h3>
                        <ul className="space-y-3 text-gray-300">
                            <li>123 Wellness Avenue,</li>
                            <li>Green Valley, Kerala 682001</li>
                            <li className="pt-2">Mon - Sat: 9:00 AM - 7:00 PM</li>
                            <li className="pt-2">+91 98765 43210</li>
                            <li>namaste@ayursutra.com</li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h3 className="text-lg font-serif font-bold mb-6 text-ayur-saffron">Stay Balanced</h3>
                        <p className="text-gray-300 mb-4">Subscribe to our newsletter for wellness tips and exclusive offers.</p>
                        <form className="flex flex-col gap-3">
                            <input
                                type="email"
                                placeholder="Your email address"
                                className="bg-ayur-900 border border-ayur-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-ayur-saffron"
                            />
                            <button
                                type="button"
                                className="bg-ayur-earth hover:bg-ayur-200 text-white font-bold py-3 rounded-lg transition"
                            >
                                Subscribe
                            </button>
                        </form>
                    </div>
                </div>

                <div className="border-t border-ayur-700 pt-8 text-center text-gray-400 text-sm">
                    <p>&copy; {new Date().getFullYear()} AyurSutra. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};
