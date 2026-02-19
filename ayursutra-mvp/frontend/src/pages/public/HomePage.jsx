import React from 'react';
import { Link } from 'react-router-dom';

export default function HomePage() {
    return (
        <div className="font-sans text-gray-800">
            {/* Hero Section */}
            <section className="relative h-[600px] flex items-center justify-center bg-ayur-cream overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1540555700478-4be289fbecef?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')] bg-cover bg-center"></div>
                <div className="container mx-auto px-6 relative z-10 text-center">
                    <span className="block text-ayur-forest tracking-[0.2em] uppercase font-bold text-sm mb-4">Welcome to AyurSutra</span>
                    <h1 className="text-5xl md:text-6xl font-serif font-bold text-ayur-900 mb-6 leading-tight">
                        Restore Your Natural Balance <br />
                        <span className="italic text-ayur-earth">through Timeless Wisdom</span>
                    </h1>
                    <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Experience holistic healing tailored to your unique constitution using ancient Ayurvedic principles and modern wellness practices.
                    </p>
                    <div className="flex flex-col md:flex-row gap-4 justify-center">
                        <Link
                            to="/login"
                            className="bg-ayur-forest hover:bg-ayur-700 text-white px-8 py-4 rounded-full font-bold text-lg transition shadow-lg"
                        >
                            Book Consultation
                        </Link>
                        <Link
                            to="/about"
                            className="bg-white hover:bg-gray-50 text-ayur-forest border-2 border-ayur-forest px-8 py-4 rounded-full font-bold text-lg transition shadow-md"
                        >
                            Learn More
                        </Link>
                    </div>
                </div>
            </section>

            {/* Intro Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6 text-center max-w-4xl">
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-ayur-forest mb-6">Harmonizing Body, Mind & Spirit</h2>
                    <p className="text-lg text-gray-600 leading-relaxed mb-8">
                        At AyurSutra, we believe that true health is not just the absence of disease, but a vibrant state of balance. Our approach integrates authentic Ayurvedic therapies, herbal medicine, and lifestyle counseling to awaken your body's innate healing intelligence.
                    </p>
                    <div className="flex justify-center gap-12">
                        <div className="text-center">
                            <span className="block text-4xl text-ayur-earth mb-2">🌿</span>
                            <p className="font-bold text-ayur-900">Natural Therapies</p>
                        </div>
                        <div className="text-center">
                            <span className="block text-4xl text-ayur-earth mb-2">🧘‍♀️</span>
                            <p className="font-bold text-ayur-900">Expert Practitioners</p>
                        </div>
                        <div className="text-center">
                            <span className="block text-4xl text-ayur-earth mb-2">🍶</span>
                            <p className="font-bold text-ayur-900">Herbal Pharmacy</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Dosha Quiz Teaser */}
            <section className="py-20 bg-ayur-forest text-white relative overflow-hidden">
                <div className="container mx-auto px-6 relative z-10">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                        <div className="md:w-1/2">
                            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Discover Your Unique Dosha</h2>
                            <p className="text-ayur-100 text-lg mb-8 leading-relaxed">
                                Are you Vata, Pitta, or Kapha? Understanding your ayurvedic constitution is the key to personalized wellness. Take our free 2-minute quiz to unlock your health blueprint.
                            </p>
                            <button className="bg-ayur-saffron hover:bg-yellow-600 text-ayur-900 px-8 py-3 rounded-full font-bold transition shadow-lg">
                                Take the Free Quiz
                            </button>
                        </div>
                        <div className="md:w-1/2 flex justify-center">
                            {/* Illustration Placeholder */}
                            <div className="w-64 h-64 bg-ayur-700 rounded-full flex items-center justify-center border-4 border-ayur-400 opacity-90">
                                <span className="text-6xl">🔥💧🌬️</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Services */}
            <section className="py-20 bg-ayur-cream">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <span className="text-ayur-earth font-bold tracking-widest uppercase text-sm">Our Offerings</span>
                        <h2 className="text-4xl font-serif font-bold text-ayur-900 mt-2">Holistic Therapies</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition duration-300">
                                <div className="h-48 bg-gray-200 bg-[url('https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80')] bg-cover bg-center"></div>
                                <div className="p-8">
                                    <h3 className="text-xl font-serif font-bold text-ayur-forest mb-3">
                                        {i === 1 ? 'Holistic Consultation' : i === 2 ? 'Panchakarma Detox' : 'Abhyanga Massage'}
                                    </h3>
                                    <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                                        {i === 1 ? 'In-depth analysis of your constitution and health history by expert doctors.' :
                                            i === 2 ? 'Deep cleansing therapies to remove toxins and restore cellular intelligence.' :
                                                'Full body warm oil massage to deeply relax the nervous system and nourish skin.'}
                                    </p>
                                    <Link to="/services" className="text-ayur-earth font-bold hover:text-ayur-forest uppercase text-xs tracking-wider">
                                        Learn More →
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-3xl font-serif font-bold text-ayur-forest mb-12">Healing Stories</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        <div className="p-8 bg-ayur-50 rounded-2xl border border-ayur-100">
                            <p className="text-gray-700 italic mb-6">"AyurSutra changed my life. The Panchakarma treatment cleared my chronic migraines and gave me a new lease on energy. The doctors are incredibly knowledgeable."</p>
                            <div className="flex items-center justify-center gap-4">
                                <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                                <div className="text-left">
                                    <p className="font-bold text-ayur-900">Sarah Jenkins</p>
                                    <p className="text-xs text-ayur-earth">Vata-Pitta Profile</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-8 bg-ayur-50 rounded-2xl border border-ayur-100">
                            <p className="text-gray-700 italic mb-6">"A truly authentic experience. From the warm oils to the herbal teas, everything feels grounded in tradition yet professional. Highly recommend their consultation."</p>
                            <div className="flex items-center justify-center gap-4">
                                <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                                <div className="text-left">
                                    <p className="font-bold text-ayur-900">Rajiv Mehta</p>
                                    <p className="text-xs text-ayur-earth">Kapha Profile</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
