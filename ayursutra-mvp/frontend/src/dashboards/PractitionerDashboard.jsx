import React, { useState } from 'react';
import { 
  Card, Stat, Modal, FormGroup, LoadingSpinner, ErrorAlert, SuccessAlert, TabBar, Table 
} from '../components/Common';

export default function PractitionerDashboard() {
  const [activeTab, setActiveTab] = useState('patients');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const [sessionForm, setSessionForm] = useState({
    sessionDate: '',
    duration: '30',
    progressPercentage: '',
    notes: '',
    observations: ''
  });

  const [leaveForm, setLeaveForm] = useState({
    dateFrom: '',
    dateTo: '',
    reason: ''
  });

  // Mock data - Patients assigned to this practitioner
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

  const [weekSchedule, setWeekSchedule] = useState([
    { day: 'Mon', sessionCount: 4, totalMinutes: 120 },
    { day: 'Tue', sessionCount: 5, totalMinutes: 150 },
    { day: 'Wed', sessionCount: 4, totalMinutes: 120 },
    { day: 'Thu', sessionCount: 3, totalMinutes: 90 },
    { day: 'Fri', sessionCount: 5, totalMinutes: 150 }
  ]);

  const [sessionHistory, setSessionHistory] = useState([
    { id: 1, date: '2026-02-13', patient: 'Raj Sharma', therapy: 'Abhyanga', duration: 30, notes: 'Good relaxation' },
    { id: 2, date: '2026-02-12', patient: 'Maya Rao', therapy: 'Shirodhara', duration: 45, notes: 'Excellent response' },
    { id: 3, date: '2026-02-11', patient: 'Vikram Das', therapy: 'Nasya', duration: 20, notes: 'Clear nasal passages' }
  ]);

  const stats = {
    assignedPatients: assignedPatients.length,
    completedSessionsToday: todaySchedule.filter(s => s.status === 'Completed').length,
    satisfactionRating: 4.8,
    successRate: 92
  };

  const validateSessionForm = () => {
    const errors = {};
    if (!sessionForm.sessionDate) errors.sessionDate = 'Session date is required';
    if (!sessionForm.duration) errors.duration = 'Duration is required';
    if (!sessionForm.progressPercentage) errors.progressPercentage = 'Progress percentage is required';
    if (!sessionForm.notes.trim()) errors.notes = 'Session notes are required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateLeaveForm = () => {
    const errors = {};
    if (!leaveForm.dateFrom) errors.dateFrom = 'Start date is required';
    if (!leaveForm.dateTo) errors.dateTo = 'End date is required';
    if (!leaveForm.reason.trim()) errors.reason = 'Reason is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRecordSession = async () => {
    if (!validateSessionForm()) return;
    
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    
    const updatedPatients = assignedPatients.map(p => 
      p.id === selectedPatient.id 
        ? {...p, progressPercentage: Math.max(p.progressPercentage, parseInt(sessionForm.progressPercentage)), lastSession: sessionForm.sessionDate}
        : p
    );
    setAssignedPatients(updatedPatients);
    
    setSuccessMsg(`✅ Session recorded - Progress updated to ${sessionForm.progressPercentage}%`);
    setShowSessionModal(false);
    setSessionForm({ sessionDate: '', duration: '30', progressPercentage: '', notes: '', observations: '' });
    setFormErrors({});
    setLoading(false);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleRequestLeave = async () => {
    if (!validateLeaveForm()) return;
    
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    
    setSuccessMsg(`✅ Leave request submitted for ${leaveForm.dateFrom} to ${leaveForm.dateTo}`);
    setShowLeaveModal(false);
    setLeaveForm({ dateFrom: '', dateTo: '', reason: '' });
    setFormErrors({});
    setLoading(false);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const tabs = [
    { id: 'patients', label: '👥 My Patients', icon: '👨‍⚕️' },
    { id: 'sessions', label: '📅 Sessions', icon: '🕐' },
    { id: 'schedule', label: '📊 Weekly Schedule', icon: '📈' },
    { id: 'performance', label: '⭐ Performance', icon: '🏆' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {errorMsg && <ErrorAlert message={errorMsg} onClose={() => setErrorMsg('')} />}
        {successMsg && <SuccessAlert message={successMsg} onClose={() => setSuccessMsg('')} />}

        <div className="mb-8">
          <h1 className="text-4xl font-black text-purple-700 mb-2 flex items-center gap-3">
            💆 Practitioner Dashboard
          </h1>
          <p className="text-gray-600 font-semibold">Manage Therapy Sessions & Patient Progress</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-l-4 border-purple-600">
            <div className="text-center">
              <div className="text-4xl font-black text-purple-600 mb-2">{stats.assignedPatients}</div>
              <div className="text-gray-700 font-semibold text-sm">Assigned Patients 👥</div>
            </div>
          </Card>
          <Card className="border-l-4 border-purple-600">
            <div className="text-center">
              <div className="text-4xl font-black text-purple-600 mb-2">{stats.completedSessionsToday}</div>
              <div className="text-gray-700 font-semibold text-sm">Sessions Today ✅</div>
            </div>
          </Card>
          <Card className="border-l-4 border-purple-600">
            <div className="text-center">
              <div className="text-4xl font-black text-purple-600 mb-2">⭐{stats.satisfactionRating}</div>
              <div className="text-gray-700 font-semibold text-sm">Patient Rating 🎯</div>
            </div>
          </Card>
          <Card className="border-l-4 border-purple-600">
            <div className="text-center">
              <div className="text-4xl font-black text-purple-600 mb-2">{stats.successRate}%</div>
              <div className="text-gray-700 font-semibold text-sm">Success Rate 📈</div>
            </div>
          </Card>
        </div>

        <TabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === 'patients' && (
          <Card title="👥 My Assigned Patients" className="border-l-4 border-purple-600">
            <Table
              columns={[
                { key: 'name', label: '👤 Patient Name' },
                { key: 'dosha', label: '🌿 Dosha Type' },
                { key: 'therapyType', label: '💆 Therapy' },
                { key: 'doctor', label: '👨‍⚕️ Doctor' },
                { 
                  key: 'progressPercentage', 
                  label: 'Progress',
                  render: (progress) => (
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{width: `${progress}%`}}></div>
                      </div>
                      <span className="text-sm font-bold text-purple-600">{progress}%</span>
                    </div>
                  )
                },
                { 
                  key: 'id', 
                  label: 'Action',
                  render: (id, row) => (
                    <button
                      onClick={() => {
                        setSelectedPatient(row);
                        setShowSessionModal(true);
                      }}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-1 px-3 rounded text-sm transition"
                    >
                      Record Session
                    </button>
                  )
                }
              ]}
              data={assignedPatients}
            />
          </Card>
        )}

        {activeTab === 'sessions' && (
          <div className="space-y-6">
            <Card title="📅 Today's Schedule" className="border-l-4 border-purple-600">
              <Table
                columns={[
                  { key: 'time', label: '🕐 Time' },
                  { key: 'patient', label: '👤 Patient' },
                  { key: 'therapy', label: '💆 Therapy' },
                  { key: 'room', label: '🏨 Room' },
                  { 
                    key: 'status', 
                    label: 'Status',
                    render: (status) => (
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        status === 'Completed' ? 'bg-green-200 text-green-800' :
                        status === 'In Progress' ? 'bg-blue-200 text-blue-800' :
                        'bg-yellow-200 text-yellow-800'
                      }`}>
                        {status === 'Completed' ? '✅' : status === 'In Progress' ? '⏳' : '📅'} {status}
                      </span>
                    )
                  }
                ]}
                data={todaySchedule}
              />
            </Card>

            <Card title="📋 Recent Session History" className="border-l-4 border-purple-600">
              <div className="space-y-3">
                {sessionHistory.map(session => (
                  <div key={session.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-bold text-gray-800">{session.patient}</p>
                        <p className="text-sm text-gray-600">{session.therapy} - {session.duration} mins</p>
                      </div>
                      <span className="text-xs bg-purple-200 text-purple-800 px-3 py-1 rounded-full font-bold">
                        📅 {session.date}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 italic">💬 {session.notes}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'schedule' && (
          <Card title="📊 Weekly Schedule Overview" className="border-l-4 border-purple-600">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold text-gray-800 mb-4">Sessions Per Day</h3>
                <div className="flex items-end gap-2 h-48 bg-purple-50 p-4 rounded-lg">
                  {weekSchedule.map((item, idx) => (
                    <div key={idx} className="flex-1 text-center">
                      <div 
                        className="bg-purple-600 rounded-t w-full hover:bg-purple-700 transition cursor-pointer"
                        style={{height: `${item.sessionCount * 30}px`}}
                        title={`${item.sessionCount} sessions, ${item.totalMinutes} mins`}
                      ></div>
                      <p className="text-xs text-gray-600 mt-2 font-bold">{item.day}</p>
                      <p className="text-xs text-purple-600 font-semibold">{item.sessionCount}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-gray-800 mb-4">Weekly Statistics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-semibold">Total Sessions</span>
                    <span className="text-2xl font-black text-purple-600">21</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-semibold">Total Duration</span>
                    <span className="text-2xl font-black text-purple-600">630 mins</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-semibold">Avg Sessions/Day</span>
                    <span className="text-2xl font-black text-purple-600">4.2</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-semibold">Busiest Day</span>
                    <span className="text-2xl font-black text-purple-600">Friday</span>
                  </div>
                  <button
                    onClick={() => setShowLeaveModal(true)}
                    className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 rounded-lg transition"
                  >
                    ✈️ Request Leave
                  </button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'performance' && (
          <Card title="⭐ Performance Metrics" className="border-l-4 border-purple-600">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="border border-purple-200 rounded-lg p-6 bg-purple-50">
                <p className="text-xs text-gray-500 font-semibold mb-2">PATIENT SATISFACTION</p>
                <div className="flex items-center gap-3">
                  <div className="text-5xl font-black text-purple-600">4.8</div>
                  <div className="text-yellow-500 text-2xl">⭐⭐⭐⭐⭐</div>
                </div>
                <p className="text-sm text-gray-600 mt-3">Based on 127 patient ratings</p>
              </div>

              <div className="border border-purple-200 rounded-lg p-6 bg-purple-50">
                <p className="text-xs text-gray-500 font-semibold mb-2">THERAPY SUCCESS RATE</p>
                <div className="flex items-center gap-3">
                  <div className="text-5xl font-black text-purple-600">92%</div>
                  <div className="text-green-600 text-2xl">✅</div>
                </div>
                <p className="text-sm text-gray-600 mt-3">Patient improvement documented</p>
              </div>
            </div>

            <div className="border border-purple-200 rounded-lg p-6">
              <h3 className="font-bold text-gray-800 mb-4">Performance Breakdown</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">Abhyanga Sessions</span>
                    <span className="text-sm font-bold text-purple-600">94%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{width: '94%'}}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">Shirodhara Sessions</span>
                    <span className="text-sm font-bold text-purple-600">88%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{width: '88%'}}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">Nasya Sessions</span>
                    <span className="text-sm font-bold text-purple-600">90%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{width: '90%'}}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">Patient Attendance</span>
                    <span className="text-sm font-bold text-purple-600">98%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{width: '98%'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        <Modal isOpen={showSessionModal} title="📝 Record Session" onClose={() => setShowSessionModal(false)}>
          {loading ? (
            <LoadingSpinner />
          ) : (
            <>
              <p className="mb-4 font-semibold text-gray-800">
                Patient: <span className="text-purple-600">{selectedPatient?.name}</span>
              </p>

              <FormGroup
                label="Session Date"
                type="date"
                value={sessionForm.sessionDate}
                onChange={(e) => setSessionForm({...sessionForm, sessionDate: e.target.value})}
                error={formErrors.sessionDate}
                required
              />

              <FormGroup
                label="Duration (minutes)"
                type="number"
                value={sessionForm.duration}
                onChange={(e) => setSessionForm({...sessionForm, duration: e.target.value})}
                error={formErrors.duration}
                required
              />

              <FormGroup
                label="Progress Percentage"
                type="number"
                min="0"
                max="100"
                value={sessionForm.progressPercentage}
                onChange={(e) => setSessionForm({...sessionForm, progressPercentage: e.target.value})}
                error={formErrors.progressPercentage}
                required
              />

              <FormGroup
                label="Session Notes"
                type="textarea"
                value={sessionForm.notes}
                onChange={(e) => setSessionForm({...sessionForm, notes: e.target.value})}
                error={formErrors.notes}
                required
                placeholder="Record treatment details, patient response, etc."
              />

              <FormGroup
                label="Additional Observations"
                type="textarea"
                value={sessionForm.observations}
                onChange={(e) => setSessionForm({...sessionForm, observations: e.target.value})}
                placeholder="Any special observations or recommendations..."
              />

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleRecordSession}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 rounded-lg transition"
                >
                  ✅ Save Session
                </button>
                <button
                  onClick={() => setShowSessionModal(false)}
                  className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </Modal>

        <Modal isOpen={showLeaveModal} title="🏖️ Request Leave" onClose={() => setShowLeaveModal(false)}>
          {loading ? (
            <LoadingSpinner />
          ) : (
            <>
              <FormGroup
                label="Leave From"
                type="date"
                value={leaveForm.dateFrom}
                onChange={(e) => setLeaveForm({...leaveForm, dateFrom: e.target.value})}
                error={formErrors.dateFrom}
                required
              />

              <FormGroup
                label="Leave Until"
                type="date"
                value={leaveForm.dateTo}
                onChange={(e) => setLeaveForm({...leaveForm, dateTo: e.target.value})}
                error={formErrors.dateTo}
                required
              />

              <FormGroup
                label="Reason for Leave"
                type="textarea"
                value={leaveForm.reason}
                onChange={(e) => setLeaveForm({...leaveForm, reason: e.target.value})}
                error={formErrors.reason}
                required
                placeholder="Please provide a detailed reason..."
              />

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleRequestLeave}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 rounded-lg transition"
                >
                  ✅ Submit Request
                </button>
                <button
                  onClick={() => setShowLeaveModal(false)}
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
