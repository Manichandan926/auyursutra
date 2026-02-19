import React, { useState } from 'react';
import {
  Card, Modal, FormGroup, ErrorAlert, SuccessAlert, TabBar
} from '../components/Common';

export default function PractitionerDashboard() {
  const [activeTab, setActiveTab] = useState('schedule');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const [sessionForm, setSessionForm] = useState({
    sessionDate: new Date().toISOString().split('T')[0],
    duration: '45',
    progressPercentage: '50',
    notes: '',
    observations: ''
  });

  const [leaveForm, setLeaveForm] = useState({
    dateFrom: '',
    dateTo: '',
    reason: ''
  });

  // Mock data 
  const [assignedPatients, setAssignedPatients] = useState([
    { id: 1, name: 'Raj Sharma', dosha: 'Vata', therapyType: 'Abhyanga', doctor: 'Dr. Raj Kumar', progressPercentage: 65, lastSession: '2026-02-13' },
    { id: 2, name: 'Maya Rao', dosha: 'Pitta', therapyType: 'Shirodhara', doctor: 'Dr. Sharma', progressPercentage: 45, lastSession: '2026-02-12' },
    { id: 3, name: 'Vikram Das', dosha: 'Kapha', therapyType: 'Nasya', doctor: 'Dr. Raj Kumar', progressPercentage: 80, lastSession: '2026-02-13' }
  ]);

  const [todaySchedule, setTodaySchedule] = useState([
    { id: 1, time: '09:00 AM', patient: 'Raj Sharma', therapy: 'Abhyanga', room: '101', status: 'Completed' },
    { id: 2, time: '10:00 AM', patient: 'Maya Rao', therapy: 'Shirodhara', room: '102', status: 'In Progress' },
    { id: 3, time: '11:30 AM', patient: 'Vikram Das', therapy: 'Nasya', room: '103', status: 'Scheduled' }
  ]);

  const stats = {
    assignedPatients: assignedPatients.length,
    completedSessionsToday: todaySchedule.filter(s => s.status === 'Completed').length,
    satisfactionRating: 4.8,
    successRate: 92
  };

  const validateSessionForm = () => {
    const errors = {};
    if (!sessionForm.notes.trim()) errors.notes = 'Session notes are required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRecordSession = async () => {
    if (!validateSessionForm()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setSuccessMsg(`✅ Session recorded successfully!`);
    setShowSessionModal(false);
    setLoading(false);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const tabs = [
    { id: 'schedule', label: "Today's Schedule", icon: '📅' },
    { id: 'patients', label: 'My Patients', icon: '👥' },
    { id: 'performance', label: 'Performance', icon: '⭐' }
  ];

  return (
    <div className="min-h-screen bg-ayur-cream font-sans">
      <div className="container mx-auto px-4 py-8">
        {errorMsg && <ErrorAlert message={errorMsg} onClose={() => setErrorMsg('')} />}
        {successMsg && <SuccessAlert message={successMsg} onClose={() => setSuccessMsg('')} />}

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-ayur-forest mb-2">
              💆 Practitioner Portal
            </h1>
            <p className="text-ayur-earth font-semibold">Ready to heal? You have {todaySchedule.length} sessions today.</p>
          </div>
          <button
            onClick={() => setShowLeaveModal(true)}
            className="bg-white text-ayur-forest border-2 border-ayur-forest font-bold py-2 px-6 rounded-full hover:bg-ayur-forest hover:text-white transition shadow-sm"
          >
            ✈️ Request Leave
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-ayur-100 text-center transform hover:scale-105 transition duration-300">
            <div className="text-3xl font-bold text-ayur-forest">{stats.completedSessionsToday}</div>
            <div className="text-xs font-bold text-gray-500 uppercase mt-1">Sessions Done</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-ayur-100 text-center transform hover:scale-105 transition duration-300">
            <div className="text-3xl font-bold text-ayur-forest">{stats.assignedPatients}</div>
            <div className="text-xs font-bold text-gray-500 uppercase mt-1">Total Patients</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-ayur-100 text-center transform hover:scale-105 transition duration-300">
            <div className="text-3xl font-bold text-ayur-saffron">{stats.satisfactionRating} ⭐</div>
            <div className="text-xs font-bold text-gray-500 uppercase mt-1">Rating</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-ayur-100 text-center transform hover:scale-105 transition duration-300">
            <div className="text-3xl font-bold text-ayur-forest">{stats.successRate}%</div>
            <div className="text-xs font-bold text-gray-500 uppercase mt-1">Success Rate</div>
          </div>
        </div>

        <TabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="mt-6 animation-fade-in">
          {activeTab === 'schedule' && (
            <Card title="📅 Today's Appointments" className="border-l-4 border-ayur-forest shadow-md">
              <div className="space-y-4">
                {todaySchedule.map(session => (
                  <div key={session.id} className="flex flex-col md:flex-row items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 hover:shadow-md transition">
                    <div className="flex items-center gap-4 w-full md:w-auto mb-4 md:mb-0">
                      <div className="text-xl font-bold text-ayur-forest bg-white p-3 rounded-lg shadow-sm w-24 text-center border border-gray-100">
                        {session.time}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-800">{session.patient}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>💆 {session.therapy}</span>
                          <span>•</span>
                          <span>📍 Room {session.room}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${session.status === 'Completed' ? 'bg-green-100 text-green-700' :
                          session.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                            'bg-yellow-100 text-yellow-700'
                        }`}>
                        {session.status}
                      </span>
                      {session.status !== 'Completed' && (
                        <button
                          onClick={() => {
                            const patient = assignedPatients.find(p => p.name === session.patient);
                            setSelectedPatient(patient || { name: session.patient, id: 0 });
                            setShowSessionModal(true);
                          }}
                          className="bg-ayur-forest text-white px-5 py-2 rounded-lg font-bold hover:bg-ayur-700 transition shadow-sm"
                        >
                          ✅ Complete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {todaySchedule.length === 0 && (
                  <div className="text-center py-10 text-gray-500">
                    <p className="text-4xl mb-2">☕</p>
                    <p>No sessions scheduled for today. Enjoy your break!</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {activeTab === 'patients' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assignedPatients.map(patient => (
                <div key={patient.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition card-hover group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-ayur-50 rounded-full flex items-center justify-center text-2xl group-hover:scale-110 transition">
                      👤
                    </div>
                    <span className="bg-ayur-50 text-ayur-forest px-2 py-1 rounded text-xs font-bold border border-ayur-100">
                      {patient.dosha}
                    </span>
                  </div>
                  <h3 className="font-bold text-xl text-gray-800 mb-1">{patient.name}</h3>
                  <p className="text-sm text-gray-500 mb-4">{patient.therapyType}</p>

                  <div className="mb-4">
                    <div className="flex justify-between text-xs font-bold text-gray-400 mb-1">
                      <span>Wellness Journey</span>
                      <span>{patient.progressPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-ayur-forest h-2 rounded-full transition-all duration-1000" style={{ width: `${patient.progressPercentage}%` }}></div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedPatient(patient);
                      setShowSessionModal(true);
                    }}
                    className="w-full border-2 border-ayur-forest text-ayur-forest font-bold py-2 rounded-lg hover:bg-ayur-forest hover:text-white transition"
                  >
                    📝 View Notes
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'performance' && (
            <Card title="⭐ My Performance Report" className="bg-white shadow-md border-l-4 border-ayur-saffron">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="text-6xl mb-4">🏆</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">You are doing excellent work!</h2>
                <p className="text-gray-500 max-w-md">Your patients have rated their satisfaction at <span className="font-bold text-ayur-forest">4.8/5.0</span> this month. Keep up the healing spirit!</p>
              </div>
            </Card>
          )}
        </div>

        {/* Session Modal */}
        <Modal isOpen={showSessionModal} title="📝 Session Details" onClose={() => setShowSessionModal(false)}>
          <div className="space-y-4">
            <div className="bg-ayur-50 p-4 rounded-lg flex items-center gap-3">
              <div className="text-3xl">👤</div>
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase">Patient</p>
                <p className="font-bold text-lg text-ayur-forest">{selectedPatient?.name}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormGroup
                label="Date"
                type="date"
                value={sessionForm.sessionDate}
                onChange={(e) => setSessionForm({ ...sessionForm, sessionDate: e.target.value })}
              />
              <FormGroup
                label="Duration (mins)"
                type="number"
                value={sessionForm.duration}
                onChange={(e) => setSessionForm({ ...sessionForm, duration: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Progress Update</label>
              <input
                type="range"
                min="0"
                max="100"
                value={sessionForm.progressPercentage}
                onChange={(e) => setSessionForm({ ...sessionForm, progressPercentage: e.target.value })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-ayur-forest"
              />
              <div className="text-right text-sm font-bold text-ayur-forest mt-1">{sessionForm.progressPercentage}%</div>
            </div>

            <FormGroup
              label="Therapist Notes"
              type="textarea"
              className="h-32"
              placeholder="Enter observations and treatment details..."
              value={sessionForm.notes}
              onChange={(e) => setSessionForm({ ...sessionForm, notes: e.target.value })}
              error={formErrors.notes}
            />

            <div className="flex gap-3 pt-2">
              <button onClick={handleRecordSession} className="flex-1 bg-ayur-forest text-white font-bold py-3.5 rounded-xl hover:bg-ayur-700 transition shadow-lg">
                💾 Save Report
              </button>
              <button onClick={() => setShowSessionModal(false)} className="flex-1 bg-gray-200 text-gray-700 font-bold py-3.5 rounded-xl hover:bg-gray-300 transition">
                Cancel
              </button>
            </div>
          </div>
        </Modal>

        {/* Leave Modal */}
        <Modal isOpen={showLeaveModal} title="🏖️ Request Time Off" onClose={() => setShowLeaveModal(false)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormGroup label="From" type="date" value={leaveForm.dateFrom} onChange={(e) => setLeaveForm({ ...leaveForm, dateFrom: e.target.value })} />
              <FormGroup label="Until" type="date" value={leaveForm.dateTo} onChange={(e) => setLeaveForm({ ...leaveForm, dateTo: e.target.value })} />
            </div>
            <FormGroup label="Reason" type="textarea" value={leaveForm.reason} onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })} />
            <button className="w-full bg-ayur-forest text-white font-bold py-3 rounded-xl">Submit Request</button>
          </div>
        </Modal>
      </div>
    </div>
  );
}
