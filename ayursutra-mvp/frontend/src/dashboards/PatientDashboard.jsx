import React, { useState } from 'react';
import { 
  Card, Stat, Modal, FormGroup, LoadingSpinner, ErrorAlert, SuccessAlert, TabBar, Table 
} from '../components/Common';

export default function PatientDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showHealthMetricsModal, setShowHealthMetricsModal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const [healthMetrics, setHealthMetrics] = useState({
    energy: 7,
    pain: 3,
    digestion: 6,
    sleep: 8
  });

  const [newMetrics, setNewMetrics] = useState({
    energy: '7',
    pain: '3',
    digestion: '6',
    sleep: '8'
  });

  // Mock data
  const patientInfo = {
    name: 'Rahul Sharma',
    age: 45,
    gender: 'Male',
    doctor: 'Dr. Raj Kumar',
    practitioner: 'Priya Singh',
    joinDate: '2026-01-15'
  };

  const [currentTherapies, setCurrentTherapies] = useState([
    { id: 1, name: '🏨 Abhyanga', room: '101', frequency: 'Daily', progress: 65, startDate: '2026-02-01' },
    { id: 2, name: '🏨 Shirodhara', room: '102', frequency: 'Alternate Days', progress: 45, startDate: '2026-02-05' }
  ]);

  const [therapyCalendar, setTherapyCalendar] = useState([
    { date: '2026-02-13', session: 'Abhyanga', time: '10:00 AM', room: '101', status: 'Completed', practitioner: 'Priya Singh' },
    { date: '2026-02-14', session: 'Shirodhara', time: '2:00 PM', room: '102', status: 'Scheduled', practitioner: 'Priya Singh' },
    { date: '2026-02-15', session: 'Abhyanga', time: '10:00 AM', room: '101', status: 'Scheduled', practitioner: 'Priya Singh' },
    { date: '2026-02-16', session: 'Nasya', time: '11:00 AM', room: '103', status: 'Scheduled', practitioner: 'Ravi Kumar' },
    { date: '2026-02-17', session: 'Abhyanga', time: '3:00 PM', room: '101', status: 'Scheduled', practitioner: 'Priya Singh' }
  ]);

  const [notifications, setNotifications] = useState([
    { id: 1, type: 'session', message: 'Upcoming: Shirodhara session tomorrow at 2:00 PM in Room 102', time: '2 hours ago', read: false },
    { id: 2, type: 'progress', message: 'Your therapy progress has reached 65%! Great progress!', time: '1 day ago', read: true },
    { id: 3, type: 'reminder', message: 'Remember to follow Ayurvedic diet guidelines', time: '2 days ago', read: true },
    { id: 4, type: 'appointment', message: 'Your next doctor consultation is on 2026-02-20', time: '3 days ago', read: true }
  ]);

  const [progressChart, setProgressChart] = useState([
    { date: '2026-02-01', progress: 15, energy: 5, pain: 8, digestion: 4, sleep: 6 },
    { date: '2026-02-05', progress: 30, energy: 6, pain: 6, digestion: 5, sleep: 7 },
    { date: '2026-02-10', progress: 50, energy: 7, pain: 4, digestion: 6, sleep: 8 },
    { date: '2026-02-13', progress: 65, energy: 7, pain: 3, digestion: 6, sleep: 8 }
  ]);

  const handleUpdateMetrics = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    
    setHealthMetrics({
      energy: parseInt(newMetrics.energy),
      pain: parseInt(newMetrics.pain),
      digestion: parseInt(newMetrics.digestion),
      sleep: parseInt(newMetrics.sleep)
    });
    
    setSuccessMsg('✅ Health metrics updated successfully!');
    setShowHealthMetricsModal(false);
    setLoading(false);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleMarkNotificationRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? {...n, read: true} : n));
  };

  const tabs = [
    { id: 'overview', label: '📊 Overview', icon: '👁️' },
    { id: 'therapies', label: '🏨 My Therapies', icon: '💆' },
    { id: 'calendar', label: '📅 Calendar', icon: '🗓️' },
    { id: 'progress', label: '📈 Progress', icon: '📊' },
    { id: 'notifications', label: '🔔 Notifications', icon: '📩' }
  ];

  const getMetricIcon = (metric) => {
    if (metric === 'energy') return '⚡';
    if (metric === 'pain') return '😢';
    if (metric === 'digestion') return '🍽️';
    if (metric === 'sleep') return '😴';
    return '❓';
  };

  const getMetricColor = (metric, value) => {
    const numValue = parseInt(value);
    if (metric === 'pain') {
      if (numValue <= 3) return 'text-green-600';
      if (numValue <= 6) return 'text-yellow-600';
      return 'text-red-600';
    }
    if (numValue >= 7) return 'text-green-600';
    if (numValue >= 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-cyan-50">
      <div className="container mx-auto px-4 py-8">
        {errorMsg && <ErrorAlert message={errorMsg} onClose={() => setErrorMsg('')} />}
        {successMsg && <SuccessAlert message={successMsg} onClose={() => setSuccessMsg('')} />}

        <div className="mb-8">
          <h1 className="text-4xl font-black text-cyan-700 mb-2 flex items-center gap-3">
            💚 Patient Dashboard
          </h1>
          <p className="text-gray-600 font-semibold">Track Your Healing Journey</p>
        </div>

        <TabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === 'overview' && (
          <div className="space-y-6">
            <Card title="👤 Patient Information" className="border-l-4 border-cyan-600">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-xs text-gray-500 font-semibold">PATIENT NAME</p>
                  <p className="text-2xl font-black text-cyan-600 mt-1">{patientInfo.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold">AGE & GENDER</p>
                  <p className="text-xl font-bold text-gray-800 mt-1">{patientInfo.age} years, {patientInfo.gender}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold">MEMBER SINCE</p>
                  <p className="text-xl font-bold text-gray-800 mt-1">{patientInfo.joinDate}</p>
                </div>
              </div>

              <hr className="my-6" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-cyan-200 rounded-lg p-4 bg-cyan-50">
                  <p className="text-xs text-gray-500 font-semibold">ASSIGNED DOCTOR</p>
                  <p className="text-xl font-bold text-cyan-600 mt-1">👨‍⚕️ {patientInfo.doctor}</p>
                  <p className="text-sm text-gray-600 mt-2">Consultation: 2026-02-20 at 2:00 PM</p>
                </div>
                <div className="border border-cyan-200 rounded-lg p-4 bg-cyan-50">
                  <p className="text-xs text-gray-500 font-semibold">ASSIGNED PRACTITIONER</p>
                  <p className="text-xl font-bold text-cyan-600 mt-1">💆 {patientInfo.practitioner}</p>
                  <p className="text-sm text-gray-600 mt-2">Next session: 2026-02-14 at 2:00 PM</p>
                </div>
              </div>
            </Card>

            <Card title="❤️ Quick Health Metrics" className="border-l-4 border-cyan-600">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {Object.entries(healthMetrics).map(([metric, value]) => (
                  <div key={metric} className="border border-gray-200 rounded-lg p-4 text-center hover:shadow-md transition">
                    <div className={`text-3xl font-black mb-2 ${getMetricColor(metric, value)}`}>
                      {getMetricIcon(metric)} {value}/10
                    </div>
                    <p className="text-sm font-semibold text-gray-700 capitalize">{metric}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => {
                  setNewMetrics({
                    energy: healthMetrics.energy.toString(),
                    pain: healthMetrics.pain.toString(),
                    digestion: healthMetrics.digestion.toString(),
                    sleep: healthMetrics.sleep.toString()
                  });
                  setShowHealthMetricsModal(true);
                }}
                className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-6 rounded-lg transition"
              >
                ✏️ Update Metrics
              </button>
            </Card>

            <Card title="🌐 Language Preference" className="border-l-4 border-cyan-600">
              <div className="flex items-center gap-4">
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="border-2 border-cyan-300 rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-600 font-semibold"
                >
                  <option value="en">🇬🇧 English</option>
                  <option value="hi">🇮🇳 हिंदी (Hindi)</option>
                  <option value="ta">🇮🇳 தமிழ் (Tamil)</option>
                  <option value="te">🇮🇳 తెలుగు (Telugu)</option>
                </select>
                <span className="text-sm text-gray-600">Current: {selectedLanguage === 'en' ? 'English' : 'हिंदी'}</span>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'therapies' && (
          <Card title="🏨 Current Therapies" className="border-l-4 border-cyan-600">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {currentTherapies.map(therapy => (
                <div key={therapy.id} className="border border-cyan-200 rounded-lg p-6 bg-gradient-to-br from-cyan-50 to-white hover:shadow-lg transition">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-xl font-black text-cyan-600 mb-1">{therapy.name}</p>
                      <p className="text-sm text-gray-600">Started: {therapy.startDate}</p>
                    </div>
                    <span className="text-2xl">🏥</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-700 font-semibold">Room Number:</span>
                      <span className="text-cyan-600 font-bold">{therapy.room}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700 font-semibold">Frequency:</span>
                      <span className="text-cyan-600 font-bold">{therapy.frequency}</span>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-700 font-semibold">Progress:</span>
                        <span className="text-cyan-600 font-bold">{therapy.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className="bg-cyan-600 h-3 rounded-full" style={{width: `${therapy.progress}%`}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {activeTab === 'calendar' && (
          <Card title="📅 Therapy Sessions Calendar" className="border-l-4 border-cyan-600">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-cyan-600 to-cyan-400 border-b-2 border-cyan-700">
                    <th className="px-6 py-3 text-left text-white font-bold">📅 Date</th>
                    <th className="px-6 py-3 text-left text-white font-bold">💆 Session</th>
                    <th className="px-6 py-3 text-left text-white font-bold">⏰ Time</th>
                    <th className="px-6 py-3 text-left text-white font-bold">🏨 Room</th>
                    <th className="px-6 py-3 text-left text-white font-bold">👨‍⚕️ Practitioner</th>
                    <th className="px-6 py-3 text-left text-white font-bold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {therapyCalendar.map((session, idx) => (
                    <tr key={idx} className="border-b border-gray-200 hover:bg-cyan-50 transition">
                      <td className="px-6 py-4 text-gray-700 font-semibold">{session.date}</td>
                      <td className="px-6 py-4 text-gray-700">{session.session}</td>
                      <td className="px-6 py-4 text-gray-700 font-semibold">{session.time}</td>
                      <td className="px-6 py-4 text-cyan-600 font-bold">{session.room}</td>
                      <td className="px-6 py-4 text-gray-700">{session.practitioner}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          session.status === 'Completed' ? 'bg-green-200 text-green-800' : 'bg-blue-200 text-blue-800'
                        }`}>
                          {session.status === 'Completed' ? '✅' : '📅'} {session.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {activeTab === 'progress' && (
          <Card title="📈 Overall Progress & Health Trends" className="border-l-4 border-cyan-600">
            <div className="mb-8">
              <h3 className="font-bold text-gray-800 mb-4">Treatment Progress Trend</h3>
              <div className="flex items-end gap-2 h-40 bg-cyan-50 p-4 rounded-lg overflow-x-auto">
                {progressChart.map((item, idx) => (
                  <div key={idx} className="flex-shrink-0 flex flex-col items-center gap-1">
                    <div 
                      className="bg-cyan-600 rounded-t" 
                      style={{width: '30px', height: `${item.progress * 1.2}px`}}
                      title={`${item.progress}% progress on ${item.date}`}
                    ></div>
                    <p className="text-xs text-gray-600 font-semibold w-8 text-center">{item.date.split('-')[2]}/2</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold text-gray-800 mb-4">Health Metrics Improvement</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700">⚡ Energy Level</span>
                      <span className="text-sm font-bold text-cyan-600">5 → 7</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-cyan-600 h-2 rounded-full" style={{width: '70%'}}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700">😢 Pain Level (Lower is Better)</span>
                      <span className="text-sm font-bold text-cyan-600">8 → 3</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{width: '62.5%'}}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700">🍽️ Digestion</span>
                      <span className="text-sm font-bold text-cyan-600">4 → 6</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-cyan-600 h-2 rounded-full" style={{width: '60%'}}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700">😴 Sleep Quality</span>
                      <span className="text-sm font-bold text-cyan-600">6 → 8</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-cyan-600 h-2 rounded-full" style={{width: '80%'}}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border border-cyan-200 rounded-lg p-6 bg-cyan-50">
                <h3 className="font-bold text-gray-800 mb-4">🎯 Progress Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Overall Recovery</span>
                    <span className="text-3xl font-black text-cyan-600">65%</span>
                  </div>
                  <hr />
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Sessions Completed</span>
                    <span className="text-2xl font-black text-cyan-600">12/18</span>
                  </div>
                  <hr />
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Estimated Completion</span>
                    <span className="text-xl font-bold text-cyan-600">2026-03-15</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'notifications' && (
          <Card title="🔔 Notifications" className="border-l-4 border-cyan-600">
            <div className="space-y-3">
              {notifications.map(notif => (
                <div 
                  key={notif.id}
                  className={`border rounded-lg p-4 cursor-pointer hover:shadow-md transition ${
                    notif.read ? 'border-gray-200 bg-gray-50' : 'border-cyan-300 bg-cyan-50'
                  }`}
                  onClick={() => handleMarkNotificationRead(notif.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">
                          {notif.type === 'session' ? '🗓️' : 
                           notif.type === 'progress' ? '📈' : 
                           notif.type === 'reminder' ? '⏰' : '📋'}
                        </span>
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
            </div>
          </Card>
        )}

        <Modal isOpen={showHealthMetricsModal} title="❤️ Update Health Metrics" onClose={() => setShowHealthMetricsModal(false)}>
          {loading ? (
            <LoadingSpinner />
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-4">Rate each metric from 1 (Poor) to 10 (Excellent)</p>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="font-bold text-gray-700">⚡ Energy Level</label>
                    <span className="text-lg font-bold text-cyan-600">{newMetrics.energy}/10</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    value={newMetrics.energy}
                    onChange={(e) => setNewMetrics({...newMetrics, energy: e.target.value})}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="font-bold text-gray-700">😢 Pain Level (Lower is Better)</label>
                    <span className="text-lg font-bold text-cyan-600">{newMetrics.pain}/10</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    value={newMetrics.pain}
                    onChange={(e) => setNewMetrics({...newMetrics, pain: e.target.value})}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="font-bold text-gray-700">🍽️ Digestion Quality</label>
                    <span className="text-lg font-bold text-cyan-600">{newMetrics.digestion}/10</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    value={newMetrics.digestion}
                    onChange={(e) => setNewMetrics({...newMetrics, digestion: e.target.value})}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="font-bold text-gray-700">😴 Sleep Quality</label>
                    <span className="text-lg font-bold text-cyan-600">{newMetrics.sleep}/10</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    value={newMetrics.sleep}
                    onChange={(e) => setNewMetrics({...newMetrics, sleep: e.target.value})}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleUpdateMetrics}
                  className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 rounded-lg transition"
                >
                  ✅ Save Metrics
                </button>
                <button
                  onClick={() => setShowHealthMetricsModal(false)}
                  className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </Modal>
      </div>
    </div>
  );
}
