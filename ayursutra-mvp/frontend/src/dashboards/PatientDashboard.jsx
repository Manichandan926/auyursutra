import React, { useState, useEffect } from 'react';
import { Stat, Card, Table, ErrorAlert, LoadingSpinner, TabBar } from '../components/Common';
import { patientAPI } from '../services/api';

export const PatientDashboard = () => {
  const [patient, setPatient] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [dashResp, progResp, notifResp] = await Promise.all([
        patientAPI.getDashboard(),
        patientAPI.getProgress(),
        patientAPI.getNotifications()
      ]);

      setPatient(dashResp.data.patient);
      setProgress(progResp.data.progress);
      setNotifications(notifResp.data.notifications);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {error && <ErrorAlert message={error} onClose={() => setError('')} />}

      {patient && (
        <Card className="bg-gradient-to-r from-sky-50 to-blue-50 border-l-4 border-sky-600">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-sky-900">{patient.name}</h2>
              <p className="text-gray-600 mt-1">Age: {patient.age} • Dosha: {patient.dosha}</p>
              <p className="text-sm text-gray-500 mt-2">ABHA: {patient.abha || 'Not assigned'}</p>
            </div>
            <span className="badge bg-sky-200 text-sky-800">Preferred: {patient.preferredLanguage === 'en' ? 'English' : 'हिंदी'}</span>
          </div>
        </Card>
      )}

      <TabBar
        tabs={[
          { id: 'overview', label: 'Overview' },
          { id: 'therapies', label: 'My Therapies' },
          { id: 'progress', label: 'Progress' },
          { id: 'calendar', label: 'Calendar' },
          { id: 'notifications', label: 'Notifications' }
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {activeTab === 'overview' && progress && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Stat label="Overall Progress" value={`${progress.overallProgress}%`} color="emerald" />
            <Stat label="Active Therapies" value={progress.therapies.length} color="sky" />
            <Stat label="Total Sessions" value={progress.therapies.reduce((sum, t) => sum + t.sessionCount, 0)} color="purple" />
          </div>

          {progress.dosha && (
            <Card title={`Dosha Wellness Tips - ${progress.dosha}`}>
              <DoshaRecommendations dosha={progress.dosha} />
            </Card>
          )}
        </>
      )}

      {activeTab === 'therapies' && progress && (
        <div className="space-y-4">
          {progress.therapies.map((t) => (
            <Card key={t.therapy.id} title={`${t.therapy.type} - ${t.therapy.phase}`}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-gray-600">Room</p>
                  <p className="text-lg font-bold text-sky-600">{t.therapy.room}</p>
                </div>
                <div>
                  <p className="text-gray-600">Progress</p>
                  <p className="text-lg font-bold text-emerald-600">{t.avgProgress}%</p>
                </div>
              </div>
              <p className="text-gray-700"><strong>Duration:</strong> {t.therapy.durationDays} days</p>
              <p className="text-gray-700"><strong>Start Date:</strong> {new Date(t.therapy.startDate).toLocaleDateString()}</p>
              <p className="text-gray-700"><strong>Herbs:</strong> {t.therapy.herbs.join(', ')}</p>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'progress' && progress && (
        <Card title="Treatment Progress Trends">
          <div className="space-y-4">
            {progress.therapies.map((t) => (
              <div key={t.therapy.id} className="border-b pb-4">
                <h3 className="font-bold mb-2">{t.therapy.type}</h3>
                <div className="h-8 bg-gray-200 rounded overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all"
                    style={{ width: `${t.avgProgress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">{t.sessionCount} sessions • {t.avgProgress}% complete</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'calendar' && (
        <Card title="Therapy Calendar">
          <p className="text-gray-600 mb-4">Upcoming therapy sessions:</p>
          {progress?.therapies && progress.therapies.length > 0 ? (
            <ul className="space-y-2">
              {progress.therapies.map((t) => (
                <li key={t.therapy.id} className="p-3 bg-sky-50 rounded border-l-4 border-sky-600">
                  <p className="font-bold">{t.therapy.type}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(t.therapy.startDate).toLocaleDateString()} to {new Date(new Date(t.therapy.startDate).getTime() + t.therapy.durationDays * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600">Room: {t.therapy.room}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No scheduled therapies</p>
          )}
        </Card>
      )}

      {activeTab === 'notifications' && (
        <Card title="Notifications">
          {notifications.length > 0 ? (
            <div className="space-y-3">
              {notifications.map((n) => (
                <div key={n.id} className={`p-3 rounded border-l-4 ${n.read ? 'bg-gray-50 border-gray-400' : 'bg-blue-50 border-blue-600'}`}>
                  <p className="font-bold text-gray-800">{n.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{n.message}</p>
                  <p className="text-xs text-gray-500 mt-2">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No notifications</p>
          )}
        </Card>
      )}
    </div>
  );
};

const DoshaRecommendations = ({ dosha }) => {
  const recommendations = {
    Vata: {
      tips: ['Stay warm and grounded', 'Maintain regular routine', 'Use calming herbs like Ashwagandha'],
      herbs: ['Ashwagandha', 'Sesame oil', 'Ghee'],
      diet: 'Warm, nourishing foods'
    },
    Pitta: {
      tips: ['Cool and calm environment', 'Avoid excess heat', 'Use cooling herbs like Brahmi'],
      herbs: ['Brahmi', 'Coconut oil', 'Licorice'],
      diet: 'Cooling, hydrating foods'
    },
    Kapha: {
      tips: ['Stay active', 'Warm and stimulating environment', 'Use invigorating herbs like Ginger'],
      herbs: ['Ginger', 'Turmeric', 'Black pepper'],
      diet: 'Light, stimulating foods'
    },
    Tridosha: {
      tips: ['Balance all three doshas', 'Gentle movement', 'Harmonizing herbs'],
      herbs: ['Triphala', 'Brahmi', 'Ashwagandha'],
      diet: 'Balanced, seasonal diet'
    }
  };

  const data = recommendations[dosha] || recommendations.Tridosha;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-bold text-gray-800 mb-2">Daily Tips</h3>
        <ul className="space-y-1">
          {data.tips.map((tip, idx) => (
            <li key={idx} className="text-gray-700 flex items-start">
              <span className="mr-2">→</span>
              {tip}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="font-bold text-gray-800 mb-2">Recommended Herbs</h3>
        <div className="flex flex-wrap gap-2">
          {data.herbs.map((herb, idx) => (
            <span key={idx} className="badge badge-primary">{herb}</span>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-bold text-gray-800 mb-2">Dietary Guidance</h3>
        <p className="text-gray-700">{data.diet}</p>
      </div>
    </div>
  );
};
