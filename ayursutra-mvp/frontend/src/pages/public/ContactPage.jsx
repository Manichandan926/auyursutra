import React from 'react';

export default function ContactPage() {
    return (
        <div className="py-20 bg-white min-h-screen">
            <div className="container mx-auto px-6 text-center">
                <h1 className="text-5xl font-serif font-bold text-ayur-forest mb-6">Contact Us</h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12">
                    Reach out to us for appointments, inquiries, or feedback.
                </p>
                <div className="max-w-md mx-auto bg-ayur-50 p-8 rounded-xl shadow-lg border border-ayur-100">
                    <form className="space-y-4 text-left">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Name</label>
                            <input type="text" className="w-full border rounded p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                            <input type="email" className="w-full border rounded p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Message</label>
                            <textarea className="w-full border rounded p-2 h-32"></textarea>
                        </div>
                        <button className="w-full bg-ayur-forest text-white font-bold py-3 rounded hover:bg-ayur-700 transition">Send Message</button>
                    </form>
                </div>
            </div>
        </div>
    );
}
