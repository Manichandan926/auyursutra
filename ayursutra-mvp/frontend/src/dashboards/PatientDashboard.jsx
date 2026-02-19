import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TabBar, Card, ErrorAlert, SuccessAlert } from '../components/Common';
import { PatientOverview } from '../components/dashboard/PatientOverview';
import { HealthMetrics } from '../components/dashboard/HealthMetrics';
import { PatientTherapies } from '../components/dashboard/PatientTherapies';
import { TherapyCalendar } from '../components/dashboard/TherapyCalendar';
import { PatientNotifications } from '../components/dashboard/PatientNotifications';
import { ProgressChart } from '../components/dashboard/ProgressChart';

// Mock Data Imports
import {
  patients,
  therapies as mockTherapies,
  therapySessions,
  notifications as mockNotifications,
  progressData
} from '../data/mockData';

export default function PatientDashboard() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // State populated from mock data
  const [patientInfo, setPatientInfo] = useState(patients[0]);
  const [therapies, setTherapies] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [healthMetrics, setHealthMetrics] = useState({
    energy: 7,
    pain: 3,
    digestion: 6,
    sleep: 8
  });

  useEffect(() => {
    // Simulate fetching data for logged-in patient (ID: 1)
    setTherapies(mockTherapies.filter(t => t.patientId === 1));
    setSessions(therapySessions.filter(s => s.patientId === 1));
    setNotifications(mockNotifications.filter(n => n.userId === 1));
  }, []);

  const handleUpdateMetrics = (newMetrics) => {
    setHealthMetrics(newMetrics);
  };

  const handleMarkTextRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }

  // Simplified Tabs with bigger icons and shorter labels
  const tabs = [
    { id: 'overview', label: `My Health`, icon: '❤️' },
    { id: 'therapies', label: `Treatments`, icon: '🌿' },
    { id: 'calendar', label: `Schedule`, icon: '📅' },
    { id: 'progress', label: `Recovery`, icon: '📈' },
    { id: 'notifications', label: `Messages`, icon: '🔔' }
  ];

  return (
    <div className="min-h-screen bg-ayur-cream font-sans">
      <div className="container mx-auto px-4 py-8">
        {errorMsg && <ErrorAlert message={errorMsg} onClose={() => setErrorMsg('')} />}
        {successMsg && <SuccessAlert message={successMsg} onClose={() => setSuccessMsg('')} />}

        <div className="mb-8 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-ayur-forest mb-2 flex items-center justify-center md:justify-start gap-3">
            🌿 My Healing Journey
          </h1>
          <p className="text-ayur-earth font-semibold">Welcome back, {patientInfo.name}</p>
        </div>

        <TabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="mt-6 animation-fade-in">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <PatientOverview patient={patientInfo} />
              <HealthMetrics metrics={healthMetrics} onUpdate={handleUpdateMetrics} />
            </div>
          )}

          {activeTab === 'therapies' && (
            <PatientTherapies therapies={therapies} />
          )}

          {activeTab === 'calendar' && (
            <TherapyCalendar sessions={sessions} />
          )}

          {activeTab === 'progress' && (
            <div className="space-y-6">
              <Card title={`📈 My Recovery Progress`} className="border-l-4 border-ayur-forest">
                <div className="h-80 w-full">
                  <ProgressChart data={progressData} title="Recovery Trend" color="#2C5E38" />
                </div>
                <div className="mt-4 p-4 bg-ayur-50 rounded-lg text-center">
                  <p className="text-ayur-forest font-bold text-lg">You are doing great! 🎉</p>
                  <p className="text-gray-600">Your health score has improved by 15% this month.</p>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'notifications' && (
            <PatientNotifications notifications={notifications} onMarkRead={handleMarkTextRead} />
          )}
        </div>
      </div>
    </div>
  );
}
