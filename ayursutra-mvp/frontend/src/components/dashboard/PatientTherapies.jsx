import React from 'react';
import { Card } from '../Common';

const statusColor = {
    SCHEDULED: 'bg-blue-100 text-blue-700 border-blue-200',
    ONGOING: 'bg-green-100 text-green-700 border-green-200',
    COMPLETED: 'bg-gray-100 text-gray-600 border-gray-200',
    CANCELLED: 'bg-red-100 text-red-600 border-red-200',
};

export const PatientTherapies = ({ therapies }) => {
    return (
        <div className="space-y-6">
            {therapies.map((therapy) => {
                // Support both API shape (type, progressPercent) and old mock shape (name, progress)
                const name = therapy.type || therapy.name || 'Therapy';
                const progress = therapy.progressPercent ?? therapy.progress ?? 0;
                const status = therapy.status || 'SCHEDULED';
                const room = therapy.room ? `Room ${therapy.room}` : '';
                const phase = therapy.phase || '';
                const startDate = therapy.startDate
                    ? new Date(therapy.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                    : '';
                const endDate = therapy.endDate
                    ? new Date(therapy.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                    : '';

                return (
                    <Card key={therapy.id} className="border-l-4 border-ayur-saffron bg-white shadow-sm hover:shadow-md transition">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-ayur-50 rounded-full flex items-center justify-center text-3xl">
                                    🌿
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">{name}</h3>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${statusColor[status] || statusColor.SCHEDULED}`}>
                                            {status}
                                        </span>
                                        {phase && <span className="text-xs text-gray-500">{phase}</span>}
                                        {room && <span className="text-xs text-gray-500">📍 {room}</span>}
                                    </div>
                                    {startDate && (
                                        <p className="text-xs text-gray-400 mt-1">
                                            {startDate}{endDate ? ` → ${endDate}` : ''}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="w-full md:w-1/2">
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm font-bold text-gray-600">Progress</span>
                                    <span className="text-sm font-bold text-ayur-forest">{progress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-4">
                                    <div
                                        className="bg-ayur-forest h-4 rounded-full transition-all duration-1000"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>

                            <div className="text-center shrink-0">
                                <p className="text-xs text-gray-500 font-bold uppercase">Duration</p>
                                <p className="font-bold text-gray-800">
                                    {therapy.durationDays ? `${therapy.durationDays} days` : '—'}
                                </p>
                            </div>
                        </div>

                        {therapy.notes && (
                            <p className="mt-3 text-sm text-gray-500 bg-gray-50 rounded-lg p-2">
                                📋 {therapy.notes}
                            </p>
                        )}
                    </Card>
                );
            })}

            {therapies.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    <p className="text-4xl mb-3">🌱</p>
                    <p className="font-semibold">No treatments assigned yet.</p>
                    <p className="text-sm mt-1">Your doctor will prescribe a therapy plan after your consultation.</p>
                </div>
            )}
        </div>
    );
};
