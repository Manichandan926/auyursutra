import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '../Common';

export const PatientNotifications = ({ notifications, onMarkRead }) => {
    const { t } = useTranslation();

    const getIcon = (type) => {
        switch (type) {
            case 'session': return '🗓️';
            case 'progress': return '📈';
            case 'reminder': return '⏰';
            default: return '📋';
        }
    };

    return (
        <Card title={`🔔 ${t('patient.notifications')}`} className="border-l-4 border-cyan-600">
            <div className="space-y-3">
                {notifications.map(notif => (
                    <div
                        key={notif.id}
                        className={`border rounded-lg p-4 cursor-pointer hover:shadow-md transition ${notif.read ? 'border-gray-200 bg-gray-50' : 'border-cyan-300 bg-cyan-50'
                            }`}
                        onClick={() => onMarkRead && onMarkRead(notif.id)}
                    >
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">{getIcon(notif.type)}</span>
                                    <p className={`font-semibold ${notif.read ? 'text-gray-600' : 'text-cyan-700'}`}>
                                        {notif.message}
                                    </p>
                                </div>
                            </div>
                            {!notif.read && <span className="inline-block w-3 h-3 bg-cyan-600 rounded-full ml-2 mt-1"></span>}
                        </div>
                        <p className="text-xs text-gray-500 mt-2 ml-7">{notif.time}</p>
                    </div>
                ))}
                {notifications.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No notifications</p>
                )}
            </div>
        </Card>
    );
};
