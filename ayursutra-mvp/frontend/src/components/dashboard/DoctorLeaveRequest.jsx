import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Modal, FormGroup, LoadingSpinner, SuccessAlert } from '../Common';

export const DoctorLeaveRequest = () => {
    const { t } = useTranslation();
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    const [leaveForm, setLeaveForm] = useState({
        dateFrom: '',
        dateTo: '',
        reason: ''
    });
    const [errors, setErrors] = useState({});

    const validate = () => {
        const newErrors = {};
        if (!leaveForm.dateFrom) newErrors.dateFrom = 'Start date required';
        if (!leaveForm.dateTo) newErrors.dateTo = 'End date required';
        if (!leaveForm.reason) newErrors.reason = 'Reason required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRequestLeave = async () => {
        if (!validate()) return;
        setLoading(true);
        await new Promise(r => setTimeout(r, 1000)); // Simulate API

        setSuccessMsg(`✅ Leave requested: ${leaveForm.dateFrom} to ${leaveForm.dateTo}`);
        setShowModal(false);
        setLeaveForm({ dateFrom: '', dateTo: '', reason: '' });
        setLoading(false);
        setTimeout(() => setSuccessMsg(''), 3000);
    };

    return (
        <>
            {successMsg && <SuccessAlert message={successMsg} onClose={() => setSuccessMsg('')} />}

            <Card title={`🏖️ ${t('doctor.requestLeave')}`} className="border-l-4 border-emerald-600">
                <div className="max-w-md">
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-lg transition w-full mb-6"
                    >
                        ✈️ {t('doctor.requestLeave')}
                    </button>

                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                        <p className="font-bold text-gray-800 mb-2">Leave Policy:</p>
                        <ul className="text-sm text-gray-700 space-y-1">
                            <li>✅ Minimum notice period: 5 days</li>
                            <li>✅ Maximum consecutive leave: 30 days</li>
                            <li>✅ Admin approval required</li>
                            <li>✅ Patient reassignment will be handled</li>
                        </ul>
                    </div>
                </div>
            </Card>

            <Modal isOpen={showModal} title={`🏖️ ${t('doctor.requestLeave')}`} onClose={() => setShowModal(false)}>
                {loading ? (
                    <LoadingSpinner />
                ) : (
                    <>
                        <FormGroup
                            label="Leave From"
                            type="date"
                            value={leaveForm.dateFrom}
                            onChange={(e) => setLeaveForm({ ...leaveForm, dateFrom: e.target.value })}
                            error={errors.dateFrom}
                            required
                        />

                        <FormGroup
                            label="Leave Until"
                            type="date"
                            value={leaveForm.dateTo}
                            onChange={(e) => setLeaveForm({ ...leaveForm, dateTo: e.target.value })}
                            error={errors.dateTo}
                            required
                        />

                        <FormGroup
                            label="Reason for Leave"
                            type="textarea"
                            value={leaveForm.reason}
                            onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                            error={errors.reason}
                            required
                            placeholder="Please provide a detailed reason..."
                        />

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={handleRequestLeave}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg transition"
                            >
                                ✅ {t('common.submit')}
                            </button>
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 rounded-lg transition"
                            >
                                {t('common.cancel')}
                            </button>
                        </div>
                    </>
                )}
            </Modal>
        </>
    );
};
