import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FormGroup, LoadingSpinner } from '../Common';
import { staff } from '../../data/mockData';

export const TherapyAssignmentForm = ({ patient, onAssign, onCancel }) => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        therapyType: 'Abhyanga',
        practitioner: staff.practitioners[0].name,
        duration: '30',
        frequency: 'Daily'
    });
    const [errors, setErrors] = useState({});

    const validate = () => {
        const newErrors = {};
        if (!form.therapyType) newErrors.therapyType = 'Required';
        if (!form.practitioner) newErrors.practitioner = 'Required';
        if (!form.duration) newErrors.duration = 'Required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setLoading(true);
        await new Promise(r => setTimeout(r, 1000)); // Simulate API
        onAssign({ ...form, patientId: patient.id });
        setLoading(false);
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="space-y-4">
            <div className="bg-emerald-50 p-4 rounded-lg mb-4">
                <p className="font-semibold text-gray-800">
                    Assigning for: <span className="text-emerald-700 font-bold text-lg">{patient.name}</span>
                </p>
                <p className="text-sm text-gray-600">Dosha: {patient.dosha}</p>
            </div>

            <FormGroup
                label="Therapy Type"
                type="select"
                value={form.therapyType}
                onChange={(e) => setForm({ ...form, therapyType: e.target.value })}
                error={errors.therapyType}
                required
            >
                <option value="Abhyanga">Abhyanga (Oil Massage)</option>
                <option value="Shirodhara">Shirodhara (Forehead Stream)</option>
                <option value="Nasya">Nasya (Nasal Administration)</option>
                <option value="Panchakarma">Panchakarma (Detox)</option>
                <option value="Basti">Basti (Enema)</option>
            </FormGroup>

            <FormGroup
                label="Assign Practitioner"
                type="select"
                value={form.practitioner}
                onChange={(e) => setForm({ ...form, practitioner: e.target.value })}
                error={errors.practitioner}
                required
            >
                {staff.practitioners.map(p => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                ))}
            </FormGroup>

            <div className="grid grid-cols-2 gap-4">
                <FormGroup
                    label="Duration (mins)"
                    type="number"
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    error={errors.duration}
                    required
                />

                <FormGroup
                    label="Frequency"
                    type="select"
                    value={form.frequency}
                    onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                >
                    <option value="Daily">Daily</option>
                    <option value="Alternate Days">Alternate Days</option>
                    <option value="3 Times Weekly">3 Times Weekly</option>
                    <option value="Weekly">Weekly</option>
                </FormGroup>
            </div>

            <div className="flex gap-3 mt-6">
                <button
                    onClick={handleSubmit}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg transition"
                >
                    ✅ {t('doctor.assignTherapy')}
                </button>
                <button
                    onClick={onCancel}
                    className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 rounded-lg transition"
                >
                    {t('common.cancel')}
                </button>
            </div>
        </div>
    );
};
