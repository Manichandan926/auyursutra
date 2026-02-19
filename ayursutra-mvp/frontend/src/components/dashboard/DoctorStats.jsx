import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '../Common';

export const DoctorStats = ({ stats }) => {
    const { t } = useTranslation();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="border-l-4 border-emerald-600">
                <div className="text-center">
                    <div className="text-4xl font-black text-emerald-600 mb-2">{stats.assignedPatients}</div>
                    <div className="text-gray-700 font-semibold text-sm">{t('doctor.stats.assigned')} 👥</div>
                </div>
            </Card>
            <Card className="border-l-4 border-emerald-600">
                <div className="text-center">
                    <div className="text-4xl font-black text-emerald-600 mb-2">{stats.activeTherapies}</div>
                    <div className="text-gray-700 font-semibold text-sm">{t('doctor.stats.active')} 🔄</div>
                </div>
            </Card>
            <Card className="border-l-4 border-emerald-600">
                <div className="text-center">
                    <div className="text-4xl font-black text-emerald-600 mb-2">{stats.completedTherapies}</div>
                    <div className="text-gray-700 font-semibold text-sm">{t('doctor.stats.completed')} 🎯</div>
                </div>
            </Card>
            <Card className="border-l-4 border-emerald-600">
                <div className="text-center">
                    <div className="text-4xl font-black text-emerald-600 mb-2">{stats.avgProgress}%</div>
                    <div className="text-gray-700 font-semibold text-sm">{t('doctor.stats.avgProgress')} 📈</div>
                </div>
            </Card>
        </div>
    );
};
