import React, { useState } from 'react';
import { patientAPI } from '../../services/api';

const DOSHAS = ['Vata', 'Pitta', 'Kapha', 'Tridosha', 'Unknown / Not sure'];
const GENDERS = ['Male', 'Female', 'Other'];

export default function PatientOnboarding({ user, onComplete }) {
    const [step, setStep] = useState(1); // 1=intro, 2=form, 3=success
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        name: user?.name || '',
        age: '',
        gender: '',
        dob: '',
        phone: '',
        email: user?.email || '',
        address: '',
        dosha: '',
        emergencyContact: '',
        medicalHistory: '',
    });

    const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim()) { setError('Full name is required'); return; }
        setLoading(true);
        setError('');
        try {
            await patientAPI.completeProfile(form);
            setStep(3);
            setTimeout(() => onComplete(), 1500); // auto-redirect after showing success
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to save profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-green-50 flex items-center justify-center p-4">
            <div className="max-w-xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden">

                {/* Header */}
                <div className="bg-gradient-to-r from-ayur-forest to-green-700 p-6 text-white text-center">
                    <div className="text-5xl mb-2">🌿</div>
                    <h1 className="text-xl font-serif font-bold">Complete Your Health Profile</h1>
                    <p className="text-green-100 text-sm mt-1">Hello, <strong>{user?.name || user?.username}</strong>! Just a few details to get started.</p>
                </div>

                {/* Step indicators */}
                <div className="flex border-b border-gray-100">
                    {['Welcome', 'Health Details', 'Done'].map((label, i) => (
                        <div key={i} className={`flex-1 py-2 text-center text-xs font-bold transition-colors
              ${step === i + 1 ? 'text-ayur-forest border-b-2 border-ayur-forest' : 'text-gray-400'}`}>
                            {i + 1}. {label}
                        </div>
                    ))}
                </div>

                <div className="p-6">

                    {/* ── Step 1: Intro ── */}
                    {step === 1 && (
                        <div className="text-center space-y-5">
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                                <p className="text-amber-800 font-semibold mb-1">⚠️ Profile Setup Required</p>
                                <p className="text-gray-600 text-sm">
                                    Your account <strong>({user?.username})</strong> exists but your health profile hasn't been filled in yet.
                                    This only takes about a minute.
                                </p>
                            </div>
                            <button
                                onClick={() => setStep(2)}
                                className="w-full bg-ayur-forest text-white py-3 rounded-xl font-bold text-base hover:bg-green-800 transition-colors flex items-center justify-center gap-2"
                            >
                                📝 Fill In My Health Details
                            </button>
                            <button
                                onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.href = '/login'; }}
                                className="w-full text-gray-400 text-sm underline hover:text-gray-600"
                            >
                                Log Out
                            </button>
                        </div>
                    )}

                    {/* ── Step 2: Form ── */}
                    {step === 2 && (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">{error}</div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Full Name *</label>
                                    <input value={form.name} onChange={set('name')} required
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ayur-forest"
                                        placeholder="Your full name" />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Age</label>
                                    <input value={form.age} onChange={set('age')} type="number" min="1" max="120"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ayur-forest"
                                        placeholder="e.g. 30" />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Gender</label>
                                    <select value={form.gender} onChange={set('gender')}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ayur-forest">
                                        <option value="">Select…</option>
                                        {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Phone</label>
                                    <input value={form.phone} onChange={set('phone')} type="tel"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ayur-forest"
                                        placeholder="Mobile number" />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                                    <input value={form.email} onChange={set('email')} type="email"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ayur-forest"
                                        placeholder="your@email.com" />
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-1">🧬 Dosha Type (if known)</label>
                                    <div className="flex flex-wrap gap-2">
                                        {DOSHAS.map(d => (
                                            <button type="button" key={d}
                                                onClick={() => setForm(prev => ({ ...prev, dosha: d === 'Unknown / Not sure' ? '' : d }))}
                                                className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition-colors
                          ${form.dosha === (d === 'Unknown / Not sure' ? '' : d)
                                                        ? 'bg-ayur-forest text-white border-ayur-forest'
                                                        : 'bg-white text-gray-600 border-gray-300 hover:border-ayur-forest'}`}>
                                                {d}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Address</label>
                                    <input value={form.address} onChange={set('address')}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ayur-forest"
                                        placeholder="Home address" />
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Emergency Contact</label>
                                    <input value={form.emergencyContact} onChange={set('emergencyContact')}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ayur-forest"
                                        placeholder="Name & phone of emergency contact" />
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Medical History (optional)</label>
                                    <textarea value={form.medicalHistory} onChange={set('medicalHistory')} rows={2}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ayur-forest resize-none"
                                        placeholder="Existing conditions, allergies, medications…" />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setStep(1)}
                                    className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-xl font-bold hover:bg-gray-50 transition-colors">
                                    ← Back
                                </button>
                                <button type="submit" disabled={loading}
                                    className="flex-1 bg-ayur-forest text-white py-2.5 rounded-xl font-bold hover:bg-green-800 transition-colors disabled:opacity-60">
                                    {loading ? '⏳ Saving…' : '✅ Save & Go to Dashboard'}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* ── Step 3: Success ── */}
                    {step === 3 && (
                        <div className="text-center py-8 space-y-4">
                            <div className="text-6xl">🎉</div>
                            <h2 className="text-xl font-bold text-ayur-forest">Profile Created!</h2>
                            <p className="text-gray-600">Your health profile has been saved. Taking you to your dashboard…</p>
                            <div className="animate-spin text-3xl">🌿</div>
                        </div>
                    )}
                </div>

                <div className="bg-ayur-50 px-6 py-3 text-center border-t border-ayur-100">
                    <p className="text-ayur-forest text-xs font-medium">🌱 AyurSutra — Rooted Wisdom, Modern Healing</p>
                </div>
            </div>
        </div>
    );
}
