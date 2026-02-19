import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Table } from '../Common';

export const TherapyCalendar = ({ sessions }) => {
    const { t } = useTranslation();

    const columns = [
        { key: 'date', label: `📅 ${t('calendar.date')}` },
        { key: 'session', label: `💆 ${t('calendar.session')}` },
        { key: 'time', label: `⏰ ${t('calendar.time')}` },
        { key: 'room', label: `🏨 ${t('therapy.room')}` },
        { key: 'practitioner', label: `👨‍⚕️ ${t('patient.assignedPractitioner')}` },
        {
            key: 'status',
            label: t('calendar.status'),
            render: (status) => (
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${status === 'Completed' ? 'bg-green-200 text-green-800' : 'bg-blue-200 text-blue-800'
                    }`}>
                    {status === 'Completed' ? '✅' : '📅'} {status}
                </span>
            )
        }
    ];

    return (
        <Card title={`📅 ${t('patient.calendar')}`} className="border-l-4 border-cyan-600">
            <Table columns={columns} data={sessions} />
        </Card>
    );
};
