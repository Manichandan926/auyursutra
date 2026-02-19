import React from 'react';

export default function ShopPage() {
    return (
        <div className="py-20 bg-emerald-50 min-h-screen">
            <div className="container mx-auto px-6 text-center">
                <h1 className="text-5xl font-serif font-bold text-ayur-forest mb-6">Herbal Shop</h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Shop authentic Ayurvedic medicines, oils, and supplements tailored to your dosha.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
                            <div className="h-40 bg-gray-200 mb-4 rounded"></div>
                            <h3 className="font-bold text-ayur-900">Ayurvedic Oil {i}</h3>
                            <p className="text-ayur-forest font-bold">$25.00</p>
                            <button className="mt-4 w-full bg-ayur-earth text-white py-2 rounded hover:bg-ayur-saffron transition">Add to Cart</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
