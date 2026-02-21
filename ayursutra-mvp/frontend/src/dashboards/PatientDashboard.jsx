import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TabBar, Card, ErrorAlert, SuccessAlert } from '../components/Common';
import { PatientOverview } from '../components/dashboard/PatientOverview';
import { HealthMetrics } from '../components/dashboard/HealthMetrics';
import { PatientTherapies } from '../components/dashboard/PatientTherapies';
import { TherapyCalendar } from '../components/dashboard/TherapyCalendar';
import { PatientNotifications } from '../components/dashboard/PatientNotifications';
import { ProgressChart } from '../components/dashboard/ProgressChart';
import { patientAPI } from '../services/api';
import PatientOnboarding from '../components/dashboard/PatientOnboarding';

export default function PatientDashboard() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(true);

  // Real data from API
  const [dashboardData, setDashboardData] = useState(null);
  const [therapies, setTherapies] = useState([]);
  const [calendarSessions, setCalendarSessions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [healthMetrics, setHealthMetrics] = useState({
    energy: 7, pain: 3, digestion: 6, sleep: 8
  });

  // Onboarding state: true when patient signed up but has no profile record yet
  const [showOnboarding, setShowOnboarding] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await patientAPI.getDashboard();
      const data = res.data;
      setDashboardData(data);
      setShowOnboarding(false);

      // Fetch therapies & calendar separately
      try {
        const calRes = await patientAPI.getTherapyCalendar();
        setCalendarSessions(calRes.data.sessions || []);
        setTherapies(calRes.data.therapies || []);
      } catch (_) { /* not fatal */ }

      // Fetch notifications
      try {
        const notifRes = await patientAPI.getNotifications(false);
        setNotifications(notifRes.data.notifications || []);
      } catch (_) { /* not fatal */ }

    } catch (err) {
      if (err.response?.status === 404) {
        // No patient profile linked yet — show onboarding
        setShowOnboarding(true);
      } else {
        setErrorMsg(err.response?.data?.error || 'Failed to load dashboard. Is the backend running?');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleUpdateMetrics = (newMetrics) => {
    setHealthMetrics(newMetrics);
  };

  const handleMarkRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    patientAPI.markNotificationAsRead(id).catch(() => { });
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    fetchDashboard();
  };

  const tabs = [
    { id: 'overview', label: 'My Health', icon: '❤️' },
    { id: 'therapies', label: 'Treatments', icon: '🌿' },
    { id: 'calendar', label: 'Schedule', icon: '📅' },
    { id: 'progress', label: 'Recovery', icon: '📈' },
    { id: 'notifications', label: 'Messages', icon: '🔔' },
  ];

  // ── Loading state ──
  if (loading) {
    return (
      <div className="min-h-screen bg-ayur-cream flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🌿</div>
          <p className="text-ayur-forest font-semibold text-lg">Loading your health journey…</p>
        </div>
      </div>
    );
  }

  // ── Onboarding: patient account exists but no profile linked ──
  if (showOnboarding) {
    return <PatientOnboarding user={user} onComplete={handleOnboardingComplete} />;
  }

  // ── Build displayable patient object from API response ──
  const patient = dashboardData?.patient;
  const patientInfo = patient ? {
    ...patient,
    doctor: dashboardData.assignedDoctor?.name || 'Not assigned yet',
    practitioner: dashboardData.assignedPractitioner?.name || 'Not assigned yet',
  } : null;

  if (!patientInfo) {
    return (
      <div className="min-h-screen bg-ayur-cream flex items-center justify-center p-8">
        <Card className="max-w-md text-center p-8">
          <div className="text-5xl mb-4">🌿</div>
          <h2 className="text-xl font-bold text-ayur-forest mb-2">Profile Not Set Up</h2>
          <p className="text-gray-600">Your patient profile hasn't been created yet. Please visit the reception desk or contact us.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ayur-cream font-sans">
      <div className="container mx-auto px-4 py-8">
        {errorMsg && <ErrorAlert message={errorMsg} onClose={() => setErrorMsg('')} />}
        {successMsg && <SuccessAlert message={successMsg} onClose={() => setSuccessMsg('')} />}

        <div className="mb-8 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-ayur-forest mb-2 flex items-center justify-center md:justify-start gap-3">
            🌿 My Healing Journey
          </h1>
          <p className="text-ayur-earth font-semibold">
            Welcome back, <span className="text-ayur-forest">{patientInfo.name}</span>
            {dashboardData.unreadNotifications > 0 && (
              <span className="ml-3 bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">
                🔔 {dashboardData.unreadNotifications} new
              </span>
            )}
          </p>
        </div>

        <TabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="mt-6 animation-fade-in">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <PatientOverview patient={patientInfo} />
              <HealthMetrics metrics={healthMetrics} onUpdate={handleUpdateMetrics} />

              {/* Dosha tips from API */}
              {dashboardData.doshaRecommendations && (
                <Card title={`🌿 ${patientInfo.dosha || 'Your'} Dosha Recommendations`}
                  className="border-l-4 border-ayur-earth">
                  <div className="grid md:grid-cols-2 gap-4">
                    {Object.entries(dashboardData.doshaRecommendations).map(([key, val]) => (
                      <div key={key} className="bg-ayur-50 p-3 rounded-lg">
                        <p className="font-bold text-ayur-forest capitalize mb-1">{key.replace(/_/g, ' ')}</p>
                        <p className="text-gray-600 text-sm">
                          {Array.isArray(val) ? val.join(', ') : val}
                        </p>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'therapies' && (
            <PatientTherapies therapies={therapies} />
          )}

          {activeTab === 'calendar' && (
            <TherapyCalendar sessions={calendarSessions} />
          )}

          {activeTab === 'progress' && (
            <div className="space-y-6">
              <Card title="📈 My Recovery Progress" className="border-l-4 border-ayur-forest">
                <div className="h-80 w-full">
                  <ProgressChart
                    data={dashboardData.progress?.timeline || []}
                    title="Recovery Trend"
                    color="#2C5E38"
                  />
                </div>
                <div className="mt-4 p-4 bg-ayur-50 rounded-lg text-center">
                  <p className="text-ayur-forest font-bold text-lg">
                    {dashboardData.progress?.completedTherapies > 0
                      ? `🎉 ${dashboardData.progress.completedTherapies} therapy completed!`
                      : '🌱 Your healing journey begins here'}
                  </p>
                  <p className="text-gray-600">
                    Overall progress: {dashboardData.progress?.overallProgress ?? 0}%
                  </p>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'notifications' && (
            <PatientNotifications
              notifications={notifications}
              onMarkRead={handleMarkRead}
            />
          )}
        </div>
      </div>
    </div>
  );
}
