import React from 'react';
import { Card } from '../Common';

export const PatientOverview = ({ patient }) => {
    // Supports both old mock shape (patient.doctor string)
    // and new API shape (patient.doctor may be an object or separate assignedDoctor prop)
    const doctorName = patient.doctor || 'Not assigned yet';
    const practitionerName = patient.practitioner || 'Not assigned yet';
    const genderEmoji = patient.gender === 'Female' ? '👩' : '👨';

    return (
        <Card className="border-l-4 border-ayur-earth bg-white shadow-md rounded-xl overflow-hidden">
            <div className="flex flex-col md:flex-row gap-6 items-center">
                {/* Profile Avatar */}
                <div className="w-24 h-24 bg-ayur-100 rounded-full flex items-center justify-center text-5xl border-4 border-ayur-forest">
                    {genderEmoji}
                </div>

                <div className="flex-1 text-center md:text-left space-y-2">
                    <h2 className="text-2xl font-serif font-bold text-ayur-900">{patient.name}</h2>
                    <div className="flex flex-wrap justify-center md:justify-start gap-3">
                        {patient.age && (
                            <span className="bg-ayur-50 text-ayur-forest px-3 py-1 rounded-full font-bold text-sm border border-ayur-200">
                                🎂 {patient.age} Years
                            </span>
                        )}
                        {patient.dosha && (
                            <span className="bg-ayur-50 text-ayur-forest px-3 py-1 rounded-full font-bold text-sm border border-ayur-200">
                                🧬 {patient.dosha} Type
                            </span>
                        )}
                        {patient.isEmergency && (
                            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full font-bold text-sm border border-red-300">
                                🚨 Emergency
                            </span>
                        )}
                    </div>
                    {patient.phone && (
                        <p className="text-sm text-gray-500">📞 {patient.phone}
                            {patient.email && <span className="ml-3">✉️ {patient.email}</span>}
                        </p>
                    )}
                </div>

                <div className="w-full md:w-auto flex flex-col gap-2">
                    <div className="bg-green-50 p-3 rounded-lg border border-green-200 flex items-center gap-3">
                        <div className="text-2xl">👨‍⚕️</div>
                        <div>
                            <p className="text-xs text-gray-500 font-bold uppercase">Your Doctor</p>
                            <p className="font-bold text-green-800">{doctorName}</p>
                        </div>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg border border-purple-200 flex items-center gap-3">
                        <div className="text-2xl">💆</div>
                        <div>
                            <p className="text-xs text-gray-500 font-bold uppercase">Your Therapist</p>
                            <p className="font-bold text-purple-800">{practitionerName}</p>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
};
