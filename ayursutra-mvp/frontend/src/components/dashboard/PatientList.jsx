import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Table } from '../Common';

export const PatientList = ({ patients, onSelectPatient }) => {
    const { t } = useTranslation();

    const columns = [
        { key: 'name', label: `👤 ${t('patient.name')}` },
        { key: 'dosha', label: '🌿 Dosha' },
        { key: 'therapyType', label: `💊 ${t('therapy.current')}` },
        { key: 'practitioner', label: `👨‍⚕️ ${t('patient.assignedPractitioner')}` },
        {
            key: 'status',
            label: t('calendar.status'),
            render: (status) => (
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${status === 'Active' ? 'bg-emerald-200 text-emerald-800' : 'bg-blue-200 text-blue-800'
                    }`}>
                    {status === 'Active' ? '🟢' : '✅'} {status}
                </span>
            )
        },
        {
            key: 'progress',
            label: t('patient.progress'),
            render: (progress) => (
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className="bg-emerald-600 h-2 rounded-full"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            )
        }
    ];

    return (
        <Card title={`👥 ${t('doctor.patients')}`} className="border-l-4 border-emerald-600">
            <Table
                columns={columns}
                data={patients}
                onRowClick={onSelectPatient}
            />
        </Card>
    );
};
