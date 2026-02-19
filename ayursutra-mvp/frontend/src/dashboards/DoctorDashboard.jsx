import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TabBar, Card, SuccessAlert, Modal } from '../components/Common';
import { DoctorStats } from '../components/dashboard/DoctorStats';
import { PatientList } from '../components/dashboard/PatientList';
import { TherapyAssignmentForm } from '../components/dashboard/TherapyAssignmentForm';
import { DoctorLeaveRequest } from '../components/dashboard/DoctorLeaveRequest';
import { ProgressChart } from '../components/dashboard/ProgressChart';

// Mock Data
import { patients as mockPatients, progressData } from '../data/mockData';

export default function DoctorDashboard() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('patients');
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    // Simulate fetching assigned patients
    setPatients(mockPatients);
  }, []);

  const stats = {
    assignedPatients: patients.length,
    activeTherapies: patients.filter(p => p.status === 'Active').length,
    completedTherapies: patients.filter(p => p.status === 'Completed').length,
    avgProgress: Math.round(patients.reduce((sum, p) => sum + p.progress, 0) / (patients.length || 1))
  };

  const handleAssignTherapy = (assignment) => {
    // In a real app, post to API
    setSuccessMsg(`✅ Therapy assigned to ${selectedPatient.name} - ${assignment.therapyType}`);
    setShowAssignModal(false);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const tabs = [
    { id: 'patients', label: `👥 ${t('doctor.patients')}`, icon: '👨‍⚕️' },
    { id: 'therapy', label: `🩺 ${t('doctor.assignTherapy')}`, icon: '💊' },
    { id: 'progress', label: `📈 ${t('doctor.progressTracking')}`, icon: '📊' },
    { id: 'leave', label: `🏖️ ${t('doctor.requestLeave')}`, icon: '✈️' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50">
      <div className="container mx-auto px-4 py-8">
        {successMsg && <SuccessAlert message={successMsg} onClose={() => setSuccessMsg('')} />}

        <div className="mb-8">
          <h1 className="text-4xl font-black text-emerald-700 mb-2 flex items-center gap-3">
            🏥 {t('doctor.dashboard.title')}
          </h1>
          <p className="text-gray-600 font-semibold">{t('doctor.dashboard.subtitle')}</p>
        </div>

        <DoctorStats stats={stats} />

        <TabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="mt-6">
          {activeTab === 'patients' && (
            <PatientList
              patients={patients}
              onSelectPatient={(p) => {
                setSelectedPatient(p);
                setActiveTab('progress');
              }}
            />
          )}

          {activeTab === 'therapy' && (
            <Card title={`💊 ${t('doctor.assignTherapy')}`} className="border-l-4 border-emerald-600">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Select a Patient:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {patients.filter(p => p.status === 'Active').map(patient => (
                    <button
                      key={patient.id}
                      onClick={() => {
                        setSelectedPatient(patient);
                        setShowAssignModal(true);
                      }}
                      className={`p-4 rounded-lg border-2 transition text-left ${selectedPatient?.id === patient.id
                          ? 'border-emerald-600 bg-emerald-50'
                          : 'border-gray-300 hover:border-emerald-600 bg-white'
                        }`}
                    >
                      <p className="font-bold text-gray-800">{patient.name}</p>
                      <p className="text-sm text-gray-600">Dosha: {patient.dosha}</p>
                      <p className="text-xs text-emerald-600 font-semibold mt-1">Current: {patient.therapyType}</p>
                    </button>
                  ))}
                </div>
              </div>

              {selectedPatient && (
                <button
                  onClick={() => setShowAssignModal(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-6 rounded-lg transition"
                >
                  💊 Assign Therapy for {selectedPatient.name}
                </button>
              )}
            </Card>
          )}

          {activeTab === 'progress' && (
            <div className="space-y-6">
              {selectedPatient ? (
                <>
                  <Card title={`📊 Progress for ${selectedPatient.name}`} className="border-l-4 border-emerald-600">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="text-center md:text-left">
                        <p className="text-xs text-gray-500 font-semibold uppercase">Dosha</p>
                        <p className="text-xl font-black text-emerald-600">{selectedPatient.dosha}</p>
                      </div>
                      <div className="text-center md:text-left">
                        <p className="text-xs text-gray-500 font-semibold uppercase">Therapy</p>
                        <p className="text-xl font-black text-emerald-600">{selectedPatient.therapyType}</p>
                      </div>
                      <div className="text-center md:text-left">
                        <p className="text-xs text-gray-500 font-semibold uppercase">Progress</p>
                        <p className="text-xl font-black text-emerald-600">{selectedPatient.progress}%</p>
                      </div>
                    </div>

                    <div className="h-64">
                      <ProgressChart data={progressData} title="Patient Recovery Trend" color="#059669" />
                    </div>
                  </Card>
                </>
              ) : (
                <Card className="border-l-4 border-emerald-600 p-8 text-center">
                  <p className="text-gray-500 text-lg">Select a patient from the 'My Patients' tab to view detailed progress.</p>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'leave' && (
            <DoctorLeaveRequest />
          )}
        </div>

        <Modal
          isOpen={showAssignModal}
          title={`💊 Assign Therapy: ${selectedPatient?.name}`}
          onClose={() => setShowAssignModal(false)}
        >
          {selectedPatient && (
            <TherapyAssignmentForm
              patient={selectedPatient}
              onAssign={handleAssignTherapy}
              onCancel={() => setShowAssignModal(false)}
            />
          )}
        </Modal>
      </div>
    </div>
  );
}

