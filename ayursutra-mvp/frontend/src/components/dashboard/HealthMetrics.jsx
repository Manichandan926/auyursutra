import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Modal, LoadingSpinner, SuccessAlert } from '../Common';

export const HealthMetrics = ({ metrics, onUpdate }) => {
    const { t } = useTranslation();
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [newMetrics, setNewMetrics] = useState({ ...metrics });

    const handleUpdate = async () => {
        setLoading(true);
        await new Promise(r => setTimeout(r, 800));
        onUpdate(newMetrics);
        setSuccessMsg('✅ Saved!');
        setShowModal(false);
        setLoading(false);
        setTimeout(() => setSuccessMsg(''), 3000);
    };

    const getMetricConfig = (metric) => {
        switch (metric) {
            case 'energy': return { icon: '⚡', label: 'Energy', goodColor: 'text-green-600', badColor: 'text-red-600' };
            case 'pain': return { icon: '🤕', label: 'Pain', goodColor: 'text-green-600', badColor: 'text-red-600', reverse: true };
            case 'digestion': return { icon: '🔥', label: 'Hunger/Digestion', goodColor: 'text-green-600', badColor: 'text-red-600' };
            case 'sleep': return { icon: '😴', label: 'Sleep Quality', goodColor: 'text-green-600', badColor: 'text-red-600' };
            default: return { icon: '❓', label: metric };
        }
    };

    const getFace = (metric, value) => {
        // Simple logic: High is usually good, except for pain
        const isReverse = metric === 'pain';
        const good = isReverse ? value <= 3 : value >= 7;
        const bad = isReverse ? value >= 7 : value <= 3;

        if (good) return '😃'; // Happy
        if (bad) return '😟'; // Sad
        return '😐'; // Neutral
    };

    return (
        <>
            {successMsg && <SuccessAlert message={successMsg} onClose={() => setSuccessMsg('')} />}

            <Card title="🩺 How do you feel today?" className="border-l-4 border-ayur-forest">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {Object.entries(metrics).map(([metric, value]) => {
                        const config = getMetricConfig(metric);
                        return (
                            <div key={metric} className="bg-white border-2 border-ayur-100 rounded-xl p-4 text-center shadow-sm">
                                <div className="text-4xl mb-2">{config.icon}</div>
                                <h3 className="font-bold text-gray-700 text-lg mb-1">{config.label}</h3>
                                <div className="flex justify-center items-center gap-2">
                                    <span className="text-2xl">{getFace(metric, value)}</span>
                                    <span className={`text-2xl font-black ${getFace(metric, value) === '😃' ? 'text-green-600' :
                                            getFace(metric, value) === '😟' ? 'text-red-600' : 'text-yellow-600'
                                        }`}>
                                        {value}/10
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <button
                    onClick={() => {
                        setNewMetrics({ ...metrics });
                        setShowModal(true);
                    }}
                    className="w-full md:w-auto bg-ayur-forest hover:bg-ayur-700 text-white font-bold py-3 px-8 rounded-full transition shadow-lg text-lg flex items-center justify-center gap-2"
                >
                    ✏️ Update My Health Status
                </button>
            </Card>

            <Modal isOpen={showModal} title="❤️ Update Health Status" onClose={() => setShowModal(false)}>
                {loading ? (
                    <LoadingSpinner />
                ) : (
                    <>
                        <p className="text-lg text-gray-600 mb-6 text-center">Move the slider to show how you feel.</p>
                        <div className="space-y-6">
                            {Object.keys(newMetrics).map((metric) => {
                                const config = getMetricConfig(metric);
                                return (
                                    <div key={metric} className="bg-ayur-50 p-4 rounded-lg">
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-2xl">{config.icon}</span>
                                                <label className="font-bold text-gray-800 text-lg">{config.label}</label>
                                            </div>
                                            <span className="text-2xl font-bold text-ayur-forest">{newMetrics[metric]}/10</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="1"
                                            max="10"
                                            value={newMetrics[metric]}
                                            onChange={(e) => setNewMetrics({ ...newMetrics, [metric]: parseInt(e.target.value) })}
                                            className="w-full h-4 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-ayur-forest"
                                        />
                                        <div className="flex justify-between text-xs text-gray-500 mt-1 font-bold uppercase">
                                            <span>{metric === 'pain' ? 'No Pain' : 'Bad'}</span>
                                            <span>{metric === 'pain' ? 'Worst Pain' : 'Excellent'}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={handleUpdate}
                                className="flex-1 bg-ayur-forest hover:bg-ayur-700 text-white font-bold py-3 rounded-xl transition text-lg"
                            >
                                ✅ Save Changes
                            </button>
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 rounded-xl transition text-lg"
                            >
                                Cancel
                            </button>
                        </div>
                    </>
                )}
            </Modal>
        </>
    );
};
