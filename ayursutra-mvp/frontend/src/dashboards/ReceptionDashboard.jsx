import React, { useState } from 'react';
import { 
  Card, Stat, Modal, FormGroup, LoadingSpinner, ErrorAlert, SuccessAlert, TabBar, Table 
} from '../components/Common';

export default function ReceptionDashboard() {
  const [activeTab, setActiveTab] = useState('schedule');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showNewPatientModal, setShowNewPatientModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const [newPatientForm, setNewPatientForm] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    gender: 'Male',
    address: '',
    emergencyContact: '',
    medicalHistory: '',
    isEmergency: false
  });

  // Mock data - Today's appointments
  const [todayAppointments, setTodayAppointments] = useState([
    { id: 1, time: '10:00 AM', patientName: 'Raj Sharma', doctor: 'Dr. Raj Kumar', room: '101', type: 'Consultation', status: 'Completed' },
    { id: 2, time: '11:00 AM', patientName: 'Priya Dutta', doctor: 'Dr. Sharma', room: '102', type: 'Follow-up', status: 'In Progress' },
    { id: 3, time: '2:00 PM', patientName: 'Arjun Singh', doctor: 'Dr. Raj Kumar', room: '101', type: 'Therapy Session', status: 'Scheduled' },
    { id: 4, time: '3:30 PM', patientName: 'Maya Rao', doctor: 'Dr. Sharma', room: '103', type: 'Consultation', status: 'Scheduled' }
  ]);

  // Waiting list with emergency flags
  const [waitingList, setWaitingList] = useState([
    { id: 1, patientName: 'Vikram Das', checkInTime: '9:45 AM', doctor: 'Dr. Raj Kumar', emergency: false, status: 'Waiting' },
    { id: 2, patientName: 'Sofia Martinez', checkInTime: '10:15 AM', doctor: 'Dr. Sharma', emergency: false, status: 'Waiting' },
    { id: 3, patientName: 'Rohan Singh', checkInTime: '10:30 AM', doctor: 'Dr. Raj Kumar', emergency: true, status: 'Urgent' },
    { id: 4, patientName: 'Anjali Verma', checkInTime: '11:00 AM', doctor: 'Dr. Sharma', emergency: false, status: 'Waiting' }
  ]);

  // Staff status
  const [staffStatus, setStaffStatus] = useState([
    { id: 1, name: 'Dr. Raj Kumar', role: 'Doctor', status: 'Available', patients: 5 },
    { id: 2, name: 'Dr. Sharma', role: 'Doctor', status: 'Available', patients: 3 },
    { id: 3, name: 'Priya Singh', role: 'Practitioner', status: 'In Session', patients: 2 },
    { id: 4, name: 'Ravi Kumar', role: 'Practitioner', status: 'Available', patients: 1 },
    { id: 5, name: 'Sofia Martinez', role: 'Practitioner', status: 'On Leave', patients: 0 }
  ]);

  // Existing patients database
  const [existingPatients] = useState([
    { id: 1, name: 'Raj Sharma', email: 'raj.sharma@email.com', phone: '9876543210', status: 'Active' },
    { id: 2, name: 'Priya Dutta', email: 'priya.dutta@email.com', phone: '9876543211', status: 'Active' },
    { id: 3, name: 'Arjun Singh', email: 'arjun.singh@email.com', phone: '9876543212', status: 'Active' },
    { id: 4, name: 'Maya Rao', email: 'maya.rao@email.com', phone: '9876543213', status: 'Active' },
    { id: 5, name: 'Vikram Das', email: 'vikram.das@email.com', phone: '9876543214', status: 'Inactive' }
  ]);

  const stats = {
    totalPatientsToday: todayAppointments.length,
    checkInsCompleted: todayAppointments.filter(a => a.status === 'Completed').length,
    waitingPatients: waitingList.filter(w => w.status === 'Waiting').length,
    emergencyCases: waitingList.filter(w => w.emergency).length
  };

  const validateNewPatientForm = () => {
    const errors = {};
    if (!newPatientForm.name.trim()) errors.name = 'Name is required';
    if (!newPatientForm.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errors.email = 'Valid email is required';
    if (!newPatientForm.phone.match(/^\d{10}$/)) errors.phone = 'Valid 10-digit phone is required';
    if (!newPatientForm.age) errors.age = 'Age is required';
    if (!newPatientForm.address.trim()) errors.address = 'Address is required';
    if (!newPatientForm.emergencyContact.match(/^\d{10}$/)) errors.emergencyContact = 'Valid emergency contact is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSearchPatient = async () => {
    if (!searchEmail.trim()) {
      setErrorMsg('Please enter an email to search');
      return;
    }

    setLoading(true);
    await new Promise(r => setTimeout(r, 800));

    const patient = existingPatients.find(p => p.email.toLowerCase() === searchEmail.toLowerCase());
    
    if (patient) {
      setSearchResult(patient);
      setSuccessMsg(`✅ Patient found: ${patient.name}`);
    } else {
      setSearchResult(null);
      setErrorMsg('❌ Patient not found in system');
    }
    
    setLoading(false);
    setTimeout(() => setErrorMsg(''), 3000);
  };

  const handleCreateNewPatient = async () => {
    if (!validateNewPatientForm()) return;

    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));

    const autoAssignedDoctor = 'Dr. Raj Kumar';
    const autoGeneratedUsername = newPatientForm.email.split('@')[0];
    const autoGeneratedPassword = Math.random().toString(36).slice(-8);

    setSuccessMsg(`✅ Patient created! Username: ${autoGeneratedUsername}, Password: ${autoGeneratedPassword}, Auto-assigned to: ${autoAssignedDoctor}`);
    setShowNewPatientModal(false);
    setNewPatientForm({
      name: '',
      email: '',
      phone: '',
      age: '',
      gender: 'Male',
      address: '',
      emergencyContact: '',
      medicalHistory: '',
      isEmergency: false
    });
    setFormErrors({});
    setLoading(false);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleCheckInPatient = (id) => {
    setWaitingList(prev => prev.filter(p => p.id !== id));
    setTodayAppointments(prev => prev.map(a =>
      a.id === id ? {...a, status: 'In Progress'} : a
    ));
    setSuccessMsg('✅ Patient checked in successfully');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const tabs = [
    { id: 'schedule', label: '📅 Today\'s Schedule', icon: '🗓️' },
    { id: 'waiting', label: '⏳ Waiting List', icon: '🪑' },
    { id: 'search', label: '🔍 Search Patient', icon: '👤' },
    { id: 'newpatient', label: '➕ New Patient', icon: '🆕' },
    { id: 'staff', label: '👥 Staff Status', icon: '💼' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50">
      <div className="container mx-auto px-4 py-8">
        {errorMsg && <ErrorAlert message={errorMsg} onClose={() => setErrorMsg('')} />}
        {successMsg && <SuccessAlert message={successMsg} onClose={() => setSuccessMsg('')} />}

        <div className="mb-8">
          <h1 className="text-4xl font-black text-amber-700 mb-2 flex items-center gap-3">
            🏥 Reception Dashboard
          </h1>
          <p className="text-gray-600 font-semibold">Patient Check-in & Staff Management</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-l-4 border-amber-600">
            <div className="text-center">
              <div className="text-4xl font-black text-amber-600 mb-2">{stats.totalPatientsToday}</div>
              <div className="text-gray-700 font-semibold text-sm">Total Appointments 📅</div>
            </div>
          </Card>
          <Card className="border-l-4 border-amber-600">
            <div className="text-center">
              <div className="text-4xl font-black text-amber-600 mb-2">{stats.checkInsCompleted}</div>
              <div className="text-gray-700 font-semibold text-sm">Checked In ✅</div>
            </div>
          </Card>
          <Card className="border-l-4 border-amber-600">
            <div className="text-center">
              <div className="text-4xl font-black text-amber-600 mb-2">{stats.waitingPatients}</div>
              <div className="text-gray-700 font-semibold text-sm">Waiting 🪑</div>
            </div>
          </Card>
          <Card className="border-l-4 border-amber-600">
            <div className="text-center">
              <div className="text-4xl font-black text-red-600 mb-2">{stats.emergencyCases}</div>
              <div className="text-gray-700 font-semibold text-sm">Emergency Cases 🚨</div>
            </div>
          </Card>
        </div>

        <TabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === 'schedule' && (
          <Card title="📅 Today's Appointment Schedule" className="border-l-4 border-amber-600">
            <Table
              columns={[
                { key: 'time', label: '🕐 Time' },
                { key: 'patientName', label: '👤 Patient Name' },
                { key: 'doctor', label: '👨‍⚕️ Doctor' },
                { key: 'room', label: '🏨 Room' },
                { key: 'type', label: '📋 Type' },
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
              data={todayAppointments}
            />
          </Card>
        )}

        {activeTab === 'waiting' && (
          <Card title="⏳ Waiting List" className="border-l-4 border-amber-600">
            <div className="space-y-3">
              {waitingList.map(patient => (
                <div key={patient.id} className={`border-2 rounded-lg p-4 hover:shadow-md transition ${
                  patient.emergency ? 'border-red-400 bg-red-50' : 'border-amber-200 bg-amber-50'
                }`}>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-500 font-semibold">PATIENT</p>
                      <p className="font-bold text-gray-800">{patient.patientName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-semibold">CHECK-IN TIME</p>
                      <p className="font-bold text-gray-800">{patient.checkInTime}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-semibold">ASSIGNED DOCTOR</p>
                      <p className="font-bold text-gray-800">{patient.doctor}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-semibold">PRIORITY</p>
                      <p className={`font-bold ${patient.emergency ? 'text-red-600' : 'text-green-600'}`}>
                        {patient.emergency ? '🚨 URGENT' : '✅ Normal'}
                      </p>
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={() => handleCheckInPatient(patient.id)}
                        className={`w-full font-bold py-2 rounded text-white transition ${
                          patient.emergency 
                            ? 'bg-red-600 hover:bg-red-700' 
                            : 'bg-amber-600 hover:bg-amber-700'
                        }`}
                      >
                        ✅ Check In
                      </button>
                    </div>
                  </div>
                  {patient.emergency && (
                    <p className="text-sm text-red-600 font-semibold">⚠️ EMERGENCY CASE - Assign to Senior Doctor</p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {activeTab === 'search' && (
          <Card title="🔍 Search Existing Patient" className="border-l-4 border-amber-600">
            <div className="mb-6">
              <div className="flex gap-3">
                <input
                  type="email"
                  placeholder="Enter patient email..."
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  className="flex-1 border-2 border-amber-300 rounded-lg px-4 py-3 focus:outline-none focus:border-amber-600 transition"
                />
                <button
                  onClick={handleSearchPatient}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-6 rounded-lg transition"
                >
                  🔍 Search
                </button>
              </div>
            </div>

            {searchResult && (
              <div className="border border-green-400 rounded-lg p-6 bg-green-50">
                <p className="text-xs text-gray-500 font-semibold mb-2">PATIENT FOUND ✅</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="text-lg font-bold text-gray-800">{searchResult.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="text-lg font-bold text-gray-800">{searchResult.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="text-lg font-bold text-gray-800">{searchResult.phone}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className={`px-4 py-2 rounded-full font-bold text-sm ${
                    searchResult.status === 'Active' 
                      ? 'bg-green-200 text-green-800' 
                      : 'bg-gray-200 text-gray-800'
                  }`}>
                    {searchResult.status === 'Active' ? '🟢' : '⏸️'} {searchResult.status}
                  </span>
                </div>
              </div>
            )}

            {searchResult === null && searchEmail && (
              <div className="border border-red-400 rounded-lg p-6 bg-red-50">
                <p className="text-red-700 font-semibold">❌ Patient not found in the system</p>
                <p className="text-sm text-red-600 mt-2">Would you like to create a new patient profile?</p>
              </div>
            )}

            <div className="mt-8">
              <h3 className="font-bold text-gray-800 mb-4">📋 Active Patients in System</h3>
              <div className="max-h-60 overflow-y-auto">
                <Table
                  columns={[
                    { key: 'name', label: '👤 Name' },
                    { key: 'email', label: '📧 Email' },
                    { key: 'phone', label: '📱 Phone' },
                    { 
                      key: 'status', 
                      label: 'Status',
                      render: (status) => (
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          status === 'Active' ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-800'
                        }`}>
                          {status === 'Active' ? '🟢' : '⏸️'} {status}
                        </span>
                      )
                    }
                  ]}
                  data={existingPatients}
                />
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'newpatient' && (
          <Card title="➕ Create New Patient Profile" className="border-l-4 border-amber-600">
            <div className="mb-6">
              <button
                onClick={() => {
                  setFormErrors({});
                  setShowNewPatientModal(true);
                }}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-6 rounded-lg transition flex items-center gap-2"
              >
                ➕ Create New Patient
              </button>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
              <h3 className="font-bold text-gray-800 mb-3">📋 New Patient Process:</h3>
              <ol className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <span className="font-bold text-amber-600">1.</span> Collect patient information
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-bold text-amber-600">2.</span> System auto-generates login credentials
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-bold text-amber-600">3.</span> Assign to doctor with least load
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-bold text-amber-600">4.</span> For emergency: Assign to senior doctor
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-bold text-amber-600">5.</span> Patient profile ready for checkup
                </li>
              </ol>
            </div>
          </Card>
        )}

        {activeTab === 'staff' && (
          <Card title="👥 Staff Status & Load" className="border-l-4 border-amber-600">
            <Table
              columns={[
                { key: 'name', label: '👤 Staff Name' },
                { key: 'role', label: '💼 Role' },
                { 
                  key: 'status', 
                  label: 'Status',
                  render: (status) => (
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      status === 'Available' ? 'bg-green-200 text-green-800' :
                      status === 'In Session' ? 'bg-blue-200 text-blue-800' :
                      'bg-gray-200 text-gray-800'
                    }`}>
                      {status === 'Available' ? '🟢' : status === 'In Session' ? '⏳' : '⏸️'} {status}
                    </span>
                  )
                },
                { 
                  key: 'patients', 
                  label: 'Current Patients',
                  render: (patients) => (
                    <div className="text-center">
                      <div className="text-lg font-black text-amber-600">{patients}</div>
                    </div>
                  )
                }
              ]}
              data={staffStatus}
            />
          </Card>
        )}

        <Modal isOpen={showNewPatientModal} title="➕ Create New Patient Profile" onClose={() => setShowNewPatientModal(false)}>
          {loading ? (
            <LoadingSpinner />
          ) : (
            <>
              <FormGroup
                label="Full Name"
                value={newPatientForm.name}
                onChange={(e) => setNewPatientForm({...newPatientForm, name: e.target.value})}
                error={formErrors.name}
                required
              />

              <FormGroup
                label="Email Address"
                type="email"
                value={newPatientForm.email}
                onChange={(e) => setNewPatientForm({...newPatientForm, email: e.target.value})}
                error={formErrors.email}
                required
              />

              <FormGroup
                label="Phone Number"
                type="tel"
                value={newPatientForm.phone}
                onChange={(e) => setNewPatientForm({...newPatientForm, phone: e.target.value})}
                error={formErrors.phone}
                placeholder="10-digit number"
                required
              />

              <FormGroup
                label="Age"
                type="number"
                value={newPatientForm.age}
                onChange={(e) => setNewPatientForm({...newPatientForm, age: e.target.value})}
                error={formErrors.age}
                required
              />

              <FormGroup
                label="Gender"
                type="select"
                value={newPatientForm.gender}
                onChange={(e) => setNewPatientForm({...newPatientForm, gender: e.target.value})}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </FormGroup>

              <FormGroup
                label="Address"
                type="textarea"
                value={newPatientForm.address}
                onChange={(e) => setNewPatientForm({...newPatientForm, address: e.target.value})}
                error={formErrors.address}
                required
              />

              <FormGroup
                label="Emergency Contact (Phone)"
                type="tel"
                value={newPatientForm.emergencyContact}
                onChange={(e) => setNewPatientForm({...newPatientForm, emergencyContact: e.target.value})}
                error={formErrors.emergencyContact}
                placeholder="10-digit number"
                required
              />

              <FormGroup
                label="Medical History"
                type="textarea"
                value={newPatientForm.medicalHistory}
                onChange={(e) => setNewPatientForm({...newPatientForm, medicalHistory: e.target.value})}
                placeholder="Any allergies, previous treatments, etc."
              />

              <div className="mb-4 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="emergency"
                  checked={newPatientForm.isEmergency}
                  onChange={(e) => setNewPatientForm({...newPatientForm, isEmergency: e.target.checked})}
                  className="w-4 h-4 cursor-pointer"
                />
                <label htmlFor="emergency" className="text-gray-700 font-semibold cursor-pointer">
                  🚨 Mark as Emergency Case (Assign to Senior Doctor)
                </label>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleCreateNewPatient}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 rounded-lg transition"
                >
                  ✅ Create Patient
                </button>
                <button
                  onClick={() => setShowNewPatientModal(false)}
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
