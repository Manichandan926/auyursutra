import React from 'react';
import { Card } from '../Common';

export const PatientTherapies = ({ therapies }) => {
    return (
        <div className="space-y-6">
            {therapies.map((therapy) => (
                <Card key={therapy.id} className="border-l-4 border-ayur-saffron bg-white shadow-sm hover:shadow-md transition">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-ayur-50 rounded-full flex items-center justify-center text-3xl">
                                🌿
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">{therapy.name}</h3>
                                <p className="text-ayur-earth font-semibold">{therapy.frequency}</p>
                            </div>
                        </div>

                        <div className="w-full md:w-1/2">
                            <div className="flex justify-between mb-1">
                                <span className="text-sm font-bold text-gray-600">Progress</span>
                                <span className="text-sm font-bold text-ayur-forest">{therapy.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-4">
                                <div
                                    className="bg-ayur-forest h-4 rounded-full transition-all duration-1000"
                                    style={{ width: `${therapy.progress}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="text-center">
                            <p className="text-xs text-gray-500 font-bold uppercase">Next Session</p>
                            <p className="font-bold text-gray-800">Tomorrow, 10 AM</p>
                        </div>
                    </div>
                </Card>
            ))}

            {therapies.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    <p className="text-2xl mb-2">🤷‍♂️</p>
                    <p>No treatments assigned yet.</p>
                </div>
            )}
        </div>
    );
};
