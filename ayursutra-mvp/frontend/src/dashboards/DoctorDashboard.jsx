import React, { useState } from 'react';
import { 
  Card, Stat, Modal, FormGroup, LoadingSpinner, ErrorAlert, SuccessAlert, TabBar, Table 
} from '../components/Common';

export default function DoctorDashboard() {
  const [activeTab, setActiveTab] = useState('patients');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showTherapyModal, setShowTherapyModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const [therapyForm, setTherapyForm] = useState({
    therapyType: 'Abhyanga',
    practitioner: 'Priya Singh',
    duration: '30',
    frequency: 'Daily'
  });

  const [leaveForm, setLeaveForm] = useState({
    dateFrom: '',
    dateTo: '',
    reason: ''
  });

  // Mock data - Patients assigned to this doctor
  const [patients, setPatients] = useState([
    { id: 1, name: 'Raj Sharma', dosha: 'Vata', therapyType: 'Abhyanga', practitioner: 'Priya Singh', status: 'Active', progress: 65 },
    { id: 2, name: 'Priya Dutta', dosha: 'Pitta', therapyType: 'Shirodhara', practitioner: 'Ravi Kumar', status: 'Active', progress: 45 },
    { id: 3, name: 'Arjun Singh', dosha: 'Kapha', therapyType: 'Nasya', practitioner: 'Sofia Martinez', status: 'Active', progress: 80 },
    { id: 4, name: 'Maya Rao', dosha: 'Vata-Pitta', therapyType: 'Abhyanga', practitioner: 'Priya Singh', status: 'Completed', progress: 100 },
    { id: 5, name: 'Vikram Das', dosha: 'Kapha-Pitta', therapyType: 'Panchakarma', practitioner: 'Rohan Das', status: 'Active', progress: 55 }
  ]);

  const [progressChart, setProgressChart] = useState([
    { date: '2026-02-01', progress: 20 },
    { date: '2026-02-05', progress: 35 },
    { date: '2026-02-10', progress: 50 },
    { date: '2026-02-13', progress: 65 }
  ]);

  const [sessionHistory, setSessionHistory] = useState([
    { id: 1, date: '2026-02-13', practitioner: 'Priya Singh', therapy: 'Abhyanga', notes: 'Good progress, energy improved' },
    { id: 2, date: '2026-02-12', practitioner: 'Priya Singh', therapy: 'Abhyanga', notes: 'Patient relaxed well' },
    { id: 3, date: '2026-02-11', practitioner: 'Priya Singh', therapy: 'Abhyanga', notes: 'First session, assessment done' }
  ]);

  const stats = {
    assignedPatients: patients.length,
    activeTherapies: patients.filter(p => p.status === 'Active').length,
    completedTherapies: patients.filter(p => p.status === 'Completed').length,
    avgProgress: Math.round(patients.reduce((sum, p) => sum + p.progress, 0) / patients.length)
  };

  const validateTherapyForm = () => {
    const errors = {};
    if (!therapyForm.therapyType) errors.therapyType = 'Therapy type is required';
    if (!therapyForm.practitioner) errors.practitioner = 'Practitioner is required';
    if (!therapyForm.duration) errors.duration = 'Duration is required';
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

  const handleAssignTherapy = async () => {
    if (!validateTherapyForm()) return;
    
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    
    setSuccessMsg(`✅ Therapy assigned to ${selectedPatient.name} - ${therapyForm.therapyType}`);
    setShowTherapyModal(false);
    setTherapyForm({ therapyType: 'Abhyanga', practitioner: 'Priya Singh', duration: '30', frequency: 'Daily' });
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
    { id: 'therapy', label: '🩺 Assign Therapy', icon: '💊' },
    { id: 'progress', label: '📈 Progress Tracking', icon: '📊' },
    { id: 'leave', label: '🏖️ Request Leave', icon: '✈️' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50">
      <div className="container mx-auto px-4 py-8">
        {errorMsg && <ErrorAlert message={errorMsg} onClose={() => setErrorMsg('')} />}
        {successMsg && <SuccessAlert message={successMsg} onClose={() => setSuccessMsg('')} />}

        <div className="mb-8">
          <h1 className="text-4xl font-black text-emerald-700 mb-2 flex items-center gap-3">
            🏥 Doctor Dashboard
          </h1>
          <p className="text-gray-600 font-semibold">Manage Patients & Therapy Sessions</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-l-4 border-emerald-600">
            <div className="text-center">
              <div className="text-4xl font-black text-emerald-600 mb-2">{stats.assignedPatients}</div>
              <div className="text-gray-700 font-semibold text-sm">Assigned Patients 👥</div>
            </div>
          </Card>
          <Card className="border-l-4 border-emerald-600">
            <div className="text-center">
              <div className="text-4xl font-black text-emerald-600 mb-2">{stats.activeTherapies}</div>
              <div className="text-gray-700 font-semibold text-sm">Active Therapies 🔄</div>
            </div>
          </Card>
          <Card className="border-l-4 border-emerald-600">
            <div className="text-center">
              <div className="text-4xl font-black text-emerald-600 mb-2">{stats.completedTherapies}</div>
              <div className="text-gray-700 font-semibold text-sm">Completed 🎯</div>
            </div>
          </Card>
          <Card className="border-l-4 border-emerald-600">
            <div className="text-center">
              <div className="text-4xl font-black text-emerald-600 mb-2">{stats.avgProgress}%</div>
              <div className="text-gray-700 font-semibold text-sm">Avg Progress 📈</div>
            </div>
          </Card>
        </div>

        <TabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === 'patients' && (
          <Card title="👥 My Assigned Patients" className="border-l-4 border-emerald-600">
            <Table
              columns={[
                { key: 'name', label: '👤 Patient Name' },
                { key: 'dosha', label: '🌿 Dosha Type' },
                { key: 'therapyType', label: '💊 Current Therapy' },
                { key: 'practitioner', label: '👨‍⚕️ Practitioner' },
                { 
                  key: 'status', 
                  label: 'Status',
                  render: (status) => (
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      status === 'Active' ? 'bg-emerald-200 text-emerald-800' : 'bg-blue-200 text-blue-800'
                    }`}>
                      {status === 'Active' ? '🟢' : '✅'} {status}
                    </span>
                  )
                },
                { 
                  key: 'progress', 
                  label: 'Progress',
                  render: (progress) => (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-emerald-600 h-2 rounded-full" 
                        style={{width: `${progress}%`}}
                      ></div>
                    </div>
                  )
                }
              ]}
              data={patients}
              onRowClick={(patient) => {
                setSelectedPatient(patient);
                setActiveTab('progress');
              }}
            />
          </Card>
        )}

        {activeTab === 'therapy' && (
          <div>
            <Card title="💊 Assign New Therapy" className="border-l-4 border-emerald-600">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Select a Patient:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {patients.filter(p => p.status === 'Active').map(patient => (
                    <button
                      key={patient.id}
                      onClick={() => {
                        setSelectedPatient(patient);
                        setShowTherapyModal(true);
                      }}
                      className={`p-4 rounded-lg border-2 transition ${
                        selectedPatient?.id === patient.id
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
                  onClick={() => setShowTherapyModal(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-6 rounded-lg transition"
                >
                  💊 Assign Therapy
                </button>
              )}
            </Card>
          </div>
        )}

        {activeTab === 'progress' && (
          <div className="space-y-6">
            {selectedPatient ? (
              <>
                <Card title={`📊 Progress for ${selectedPatient.name}`} className="border-l-4 border-emerald-600">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                      <p className="text-xs text-gray-500 font-semibold">DOSHA</p>
                      <p className="text-xl font-black text-emerald-600">{selectedPatient.dosha}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-semibold">CURRENT THERAPY</p>
                      <p className="text-xl font-black text-emerald-600">{selectedPatient.therapyType}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-semibold">OVERALL PROGRESS</p>
                      <p className="text-xl font-black text-emerald-600">{selectedPatient.progress}%</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-bold text-gray-800 mb-3">📈 Progress Trend</h4>
                    <div className="flex items-end gap-2 h-32 bg-emerald-50 p-4 rounded-lg">
                      {progressChart.map((item, idx) => (
                        <div key={idx} className="flex-1 text-center">
                          <div 
                            className="bg-emerald-600 rounded-t w-full"
                            style={{height: `${item.progress}px`}}
                          ></div>
                          <p className="text-xs text-gray-600 mt-2">{item.date.split('-')[2]}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>

                <Card title="📋 Session History" className="border-l-4 border-emerald-600">
                  <div className="space-y-3">
                    {sessionHistory.map(session => (
                      <div key={session.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-bold text-gray-800">{session.therapy}</p>
                            <p className="text-sm text-gray-600">Practitioner: {session.practitioner}</p>
                          </div>
                          <span className="text-xs bg-emerald-200 text-emerald-800 px-3 py-1 rounded-full font-bold">
                            📅 {session.date}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 italic">💬 {session.notes}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </>
            ) : (
              <Card title="📊 Patient Progress Tracking" className="border-l-4 border-emerald-600">
                <p className="text-gray-600">Select a patient from the 'My Patients' tab to view progress tracking</p>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'leave' && (
          <Card title="🏖️ Request Leave" className="border-l-4 border-emerald-600">
            <div className="max-w-md">
              <button
                onClick={() => setShowLeaveModal(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-lg transition w-full mb-6"
              >
                ✈️ Request Leave
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
        )}

        <Modal isOpen={showTherapyModal} title="💊 Assign Therapy" onClose={() => setShowTherapyModal(false)}>
          {loading ? (
            <LoadingSpinner />
          ) : (
            <>
              <p className="mb-4 font-semibold text-gray-800">
                Patient: <span className="text-emerald-600">{selectedPatient?.name}</span>
              </p>

              <FormGroup
                label="Therapy Type"
                type="select"
                value={therapyForm.therapyType}
                onChange={(e) => setTherapyForm({...therapyForm, therapyType: e.target.value})}
                error={formErrors.therapyType}
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
                value={therapyForm.practitioner}
                onChange={(e) => setTherapyForm({...therapyForm, practitioner: e.target.value})}
                error={formErrors.practitioner}
                required
              >
                <option value="Priya Singh">Priya Singh</option>
                <option value="Ravi Kumar">Ravi Kumar</option>
                <option value="Sofia Martinez">Sofia Martinez</option>
                <option value="Rohan Das">Rohan Das</option>
              </FormGroup>

              <FormGroup
                label="Duration (minutes)"
                type="number"
                value={therapyForm.duration}
                onChange={(e) => setTherapyForm({...therapyForm, duration: e.target.value})}
                error={formErrors.duration}
                required
              />

              <FormGroup
                label="Frequency"
                type="select"
                value={therapyForm.frequency}
                onChange={(e) => setTherapyForm({...therapyForm, frequency: e.target.value})}
              >
                <option value="Daily">Daily</option>
                <option value="Alternate Days">Alternate Days</option>
                <option value="3 Times Weekly">3 Times Weekly</option>
                <option value="Weekly">Weekly</option>
              </FormGroup>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleAssignTherapy}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg transition"
                >
                  ✅ Assign
                </button>
                <button
                  onClick={() => setShowTherapyModal(false)}
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
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg transition"
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
