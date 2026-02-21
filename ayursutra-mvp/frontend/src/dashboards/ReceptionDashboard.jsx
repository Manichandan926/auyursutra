import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Modal, FormGroup, LoadingSpinner, ErrorAlert, SuccessAlert, TabBar, Table
} from '../components/Common';
import { receptionAPI } from '../services/api';

const EMPTY_FORM = {
  name: '', email: '', phone: '', age: '', gender: 'Male',
  address: '', emergencyContact: '', medicalHistory: '', isEmergency: false, dosha: '',
  dob: '', abha: '', language: 'en'
};

export default function ReceptionDashboard() {
  const [activeTab, setActiveTab] = useState('waiting');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Real data from API
  const [waitingList, setWaitingList] = useState([]);
  const [allPatients, setAllPatients] = useState([]);
  const [doctorsList, setDoctorsList] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // New patient form
  const [showNewPatientModal, setShowNewPatientModal] = useState(false);
  const [newPatientForm, setNewPatientForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [createdCredentials, setCreatedCredentials] = useState(null);

  const notify = (msg, isError = false) => {
    if (isError) { setErrorMsg(msg); setTimeout(() => setErrorMsg(''), 5000); }
    else { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 4000); }
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [waitRes, dashRes, docRes] = await Promise.allSettled([
        receptionAPI.getWaitingList(),
        receptionAPI.getDashboard(),
        receptionAPI.getDoctorsLoad(),
      ]);

      if (waitRes.status === 'fulfilled') {
        // backend returns { waitingPatients: [...] }
        setWaitingList(waitRes.value.data.waitingPatients || waitRes.value.data.patients || []);
      }
      if (dashRes.status === 'fulfilled') {
        const d = dashRes.value.data;
        setDashboardStats(d.stats || d);
        // dashboard returns waitingPatients at top level
        setAllPatients(d.waitingPatients || d.recentPatients || d.patients || []);
      }
      if (docRes.status === 'fulfilled') {
        setDoctorsList(docRes.value.data.doctors || []);
      }
    } catch (err) {
      notify('Failed to load dashboard data', true);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Search patients ──
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    try {
      const res = await receptionAPI.searchPatients(searchQuery);
      setSearchResults(res.data.patients || []);
    } catch {
      notify('Search failed', true);
    }
    setSearchLoading(false);
  };

  // ── Check in a patient ──
  const handleCheckIn = async (patientId) => {
    setActionLoading(true);
    try {
      await receptionAPI.checkIn(patientId);
      notify('✅ Patient checked in successfully');
      fetchAll(); // refresh waiting list
    } catch (err) {
      notify(err.response?.data?.error || 'Check-in failed', true);
    }
    setActionLoading(false);
  };

  // ── Validate new patient form ──
  const validate = () => {
    const errs = {};
    if (!newPatientForm.name.trim()) errs.name = 'Name is required';
    if (!newPatientForm.age) errs.age = 'Age is required';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Create new patient via API ──
  const handleCreatePatient = async () => {
    if (!validate()) return;
    setActionLoading(true);
    try {
      const res = await receptionAPI.createPatient({
        ...newPatientForm,
        age: parseInt(newPatientForm.age)
      });
      const data = res.data;
      setCreatedCredentials(data); // show credentials in modal
      notify(`✅ Patient "${newPatientForm.name}" created & assigned to doctor`);
      setNewPatientForm(EMPTY_FORM);
      setFormErrors({});
      fetchAll();
    } catch (err) {
      notify(err.response?.data?.error || 'Failed to create patient', true);
    }
    setActionLoading(false);
  };

  // ── Tabs ──
  const tabs = [
    { id: 'waiting', label: 'Waiting List', icon: '⏳' },
    { id: 'search', label: 'Search Patient', icon: '🔍' },
    { id: 'newpatient', label: 'New Patient', icon: '➕' },
    { id: 'staff', label: 'Staff Status', icon: '👥' },
  ];

  // compute stats from real data
  const emergencyCount = waitingList.filter(p => p.isEmergency || p.emergency).length;
  const waitingCount = waitingList.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50 flex items-center justify-center">
        <div className="text-center"><div className="text-5xl mb-3 animate-bounce">🏥</div>
          <p className="text-amber-700 font-semibold">Loading reception data…</p></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50">
      <div className="container mx-auto px-4 py-8">
        {errorMsg && <ErrorAlert message={errorMsg} onClose={() => setErrorMsg('')} />}
        {successMsg && <SuccessAlert message={successMsg} onClose={() => setSuccessMsg('')} />}

        <div className="mb-6">
          <h1 className="text-4xl font-black text-amber-700 mb-1 flex items-center gap-3">🏥 Reception Dashboard</h1>
          <p className="text-gray-600 font-semibold">Patient Check-in & Staff Management</p>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Patients', value: dashboardStats?.totalPatients ?? allPatients.length, icon: '👤' },
            { label: 'Waiting Now', value: waitingCount, icon: '🪑' },
            { label: 'Emergencies', value: emergencyCount, icon: '🚨', red: true },
            { label: 'Doctors On Duty', value: doctorsList.length || (dashboardStats?.activeDoctors ?? '—'), icon: '👨‍⚕️' },
          ].map(s => (
            <Card key={s.label} className="border-l-4 border-amber-600">
              <div className="text-center">
                <div className={`text-4xl font-black mb-1 ${s.red ? 'text-red-600' : 'text-amber-600'}`}>{s.value}</div>
                <div className="text-gray-700 font-semibold text-sm">{s.label} {s.icon}</div>
              </div>
            </Card>
          ))}
        </div>

        <TabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        {/* ── Waiting List ── */}
        {activeTab === 'waiting' && (
          <Card title="⏳ Waiting List" className="border-l-4 border-amber-600 mt-4">
            {waitingList.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                <p className="text-4xl mb-2">😌</p>
                <p className="font-semibold">No patients waiting right now.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {waitingList.map(patient => {
                  const isEmergency = patient.isEmergency || patient.emergency || false;
                  const patientId = patient.id || patient.patientId;
                  const doctorName = patient.doctorName || patient.doctor || patient.assignedDoctor || 'Not assigned';
                  const checkTime = patient.checkedInAt
                    ? new Date(patient.checkedInAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                    : patient.checkInTime || '—';

                  return (
                    <div key={patientId} className={`border-2 rounded-lg p-4 transition hover:shadow-md ${isEmergency ? 'border-red-400 bg-red-50' : 'border-amber-200 bg-amber-50'
                      }`}>
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                        <div>
                          <p className="text-xs text-gray-500 font-semibold">PATIENT</p>
                          <p className="font-bold text-gray-800">{patient.name || patient.patientName}</p>
                          {patient.phone && <p className="text-xs text-gray-400">📞 {patient.phone}</p>}
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-semibold">CHECK-IN TIME</p>
                          <p className="font-bold text-gray-800">{checkTime}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-semibold">ASSIGNED DOCTOR</p>
                          <p className="font-bold text-gray-800">{doctorName}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-semibold">PRIORITY</p>
                          <p className={`font-bold ${isEmergency ? 'text-red-600' : 'text-green-600'}`}>
                            {isEmergency ? '🚨 URGENT' : '✅ Normal'}
                          </p>
                        </div>
                        <div>
                          <button
                            onClick={() => handleCheckIn(patientId)}
                            disabled={actionLoading}
                            className={`w-full font-bold py-2 rounded text-white transition ${isEmergency ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-600 hover:bg-amber-700'
                              } disabled:opacity-60`}
                          >
                            ✅ Check In
                          </button>
                        </div>
                      </div>
                      {isEmergency && (
                        <p className="text-sm text-red-600 font-semibold mt-2">⚠️ EMERGENCY — Priority routing to senior doctor</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        )}

        {/* ── Search Patient ── */}
        {activeTab === 'search' && (
          <Card title="🔍 Search Existing Patient" className="border-l-4 border-amber-600 mt-4">
            <div className="flex gap-3 mb-6">
              <input
                type="text"
                placeholder="Search by name, phone or email…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                className="flex-1 border-2 border-amber-300 rounded-lg px-4 py-3 focus:outline-none focus:border-amber-600 transition"
              />
              <button onClick={handleSearch} disabled={searchLoading}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-6 rounded-lg transition disabled:opacity-60">
                {searchLoading ? '⏳' : '🔍'} Search
              </button>
            </div>

            {searchResults.length > 0 ? (
              <div className="space-y-3">
                {searchResults.map(p => (
                  <div key={p.id} className="border border-green-300 rounded-lg p-4 bg-green-50 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-gray-800">{p.name}</p>
                      <p className="text-sm text-gray-500">{p.phone && `📞 ${p.phone}`} {p.email && `✉️ ${p.email}`}</p>
                      <p className="text-xs text-gray-400">{p.dosha && `🧬 ${p.dosha}`} · {p.gender || ''} · {p.age ? `${p.age}y` : ''}</p>
                    </div>
                    <button
                      onClick={() => handleCheckIn(p.id)}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-lg text-sm transition"
                    >
                      ✅ Check In
                    </button>
                  </div>
                ))}
              </div>
            ) : searchQuery && !searchLoading ? (
              <div className="border border-red-300 rounded-lg p-4 bg-red-50 text-center">
                <p className="text-red-700 font-semibold">❌ No patients found</p>
                <p className="text-sm text-red-500 mt-1">Use the "New Patient" tab to register them.</p>
              </div>
            ) : null}

            {/* All patients list */}
            <div className="mt-8">
              <h3 className="font-bold text-gray-700 mb-3">📋 All Registered Patients ({allPatients.length})</h3>
              {allPatients.length === 0 ? (
                <p className="text-gray-400 text-sm">No patients in database yet.</p>
              ) : (
                <div className="max-h-72 overflow-y-auto">
                  <Table
                    columns={[
                      { key: 'name', label: '👤 Name' },
                      { key: 'phone', label: '📱 Phone' },
                      { key: 'gender', label: 'Gender' },
                      { key: 'dosha', label: '🧬 Dosha' },
                      {
                        key: 'assignedDoctorId', label: 'Doctor Assigned',
                        render: (v) => v ? <span className="text-green-600 font-bold">✅ Yes</span> : <span className="text-gray-400">Not yet</span>
                      },
                    ]}
                    data={allPatients}
                  />
                </div>
              )}
            </div>
          </Card>
        )}

        {/* ── New Patient ── */}
        {activeTab === 'newpatient' && (
          <Card title="➕ Register New Patient" className="border-l-4 border-amber-600 mt-4">
            <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-gray-700">
              <p className="font-semibold text-amber-800 mb-2">📋 Process:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Fill patient details below</li>
                <li>System auto-creates login credentials</li>
                <li>Auto-assigns to doctor with least load</li>
                <li>Emergency patients go directly to senior doctor</li>
              </ol>
            </div>
            <button
              onClick={() => { setFormErrors({}); setCreatedCredentials(null); setShowNewPatientModal(true); }}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-6 rounded-lg transition flex items-center gap-2"
            >
              ➕ Create New Patient
            </button>
          </Card>
        )}

        {/* ── Staff Status ── */}
        {activeTab === 'staff' && (
          <Card title="👥 Doctors Load" className="border-l-4 border-amber-600 mt-4">
            {doctorsList.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No doctor data available</p>
            ) : (
              <Table
                columns={[
                  { key: 'name', label: '👤 Doctor' },
                  {
                    key: 'patientCount', label: '# Patients',
                    render: (v) => <span className="text-lg font-black text-amber-600">{v ?? 0}</span>
                  },
                  {
                    key: 'enabled', label: 'Status',
                    render: (v) => <span className={`px-3 py-1 rounded-full text-xs font-bold ${v !== false ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {v !== false ? '🟢 Active' : '⏸️ Inactive'}
                    </span>
                  },
                ]}
                data={doctorsList}
              />
            )}
          </Card>
        )}

        {/* ── New Patient Modal ── */}
        <Modal isOpen={showNewPatientModal} title="➕ Create New Patient Profile"
          onClose={() => { setShowNewPatientModal(false); setCreatedCredentials(null); }}>
          {actionLoading ? <LoadingSpinner /> : createdCredentials ? (
            // Show generated credentials
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-300 rounded-xl p-5 text-center">
                <p className="text-2xl mb-2">✅</p>
                <p className="font-bold text-green-800 text-lg">Patient Created!</p>
              </div>
              <div className="bg-gray-50 border rounded-lg p-4 space-y-2 text-sm">
                <p><strong>Name:</strong> {createdCredentials.patient?.name}</p>
                <p><strong>Login Username:</strong> <code className="bg-gray-200 px-2 py-0.5 rounded">{createdCredentials.credentials?.username || createdCredentials.patient?.id}</code></p>
                <p><strong>Password:</strong> <code className="bg-gray-200 px-2 py-0.5 rounded">{createdCredentials.credentials?.password || 'ayursutra123'}</code></p>
                <p><strong>Assigned Doctor:</strong> {createdCredentials.assignedDoctor?.name || 'Will be assigned'}</p>
              </div>
              <p className="text-xs text-gray-500 text-center">📋 Please give these credentials to the patient</p>
              <button
                onClick={() => { setShowNewPatientModal(false); setCreatedCredentials(null); }}
                className="w-full bg-amber-600 text-white font-bold py-2 rounded-lg"
              >Done</button>
            </div>
          ) : (
            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
              {/* --- Section: Personal Info --- */}
              <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100">
                <h3 className="text-amber-800 font-bold mb-4 flex items-center gap-2 border-b border-amber-200 pb-2">
                  👤 Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <FormGroup label="Full Name" value={newPatientForm.name} required error={formErrors.name}
                      placeholder="Enter legal name"
                      onChange={e => setNewPatientForm(p => ({ ...p, name: e.target.value }))} />
                  </div>
                  <FormGroup label="Age" type="number" value={newPatientForm.age} required error={formErrors.age}
                    placeholder="Years"
                    onChange={e => setNewPatientForm(p => ({ ...p, age: e.target.value }))} />
                  <FormGroup label="Gender" type="select" value={newPatientForm.gender}
                    onChange={e => setNewPatientForm(p => ({ ...p, gender: e.target.value }))}>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </FormGroup>
                  <FormGroup label="Date of Birth" type="date" value={newPatientForm.dob}
                    onChange={e => setNewPatientForm(p => ({ ...p, dob: e.target.value }))} />
                  <FormGroup label="Preferred Language" type="select" value={newPatientForm.language}
                    onChange={e => setNewPatientForm(p => ({ ...p, language: e.target.value }))}>
                    <option value="en">English (default)</option>
                    <option value="hi">Hindi</option>
                    <option value="bn">Bengali</option>
                    <option value="ta">Tamil</option>
                    <option value="te">Telugu</option>
                    <option value="mr">Marathi</option>
                  </FormGroup>
                </div>
              </div>

              {/* --- Section: Contact & Identity --- */}
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                <h3 className="text-blue-800 font-bold mb-4 flex items-center gap-2 border-b border-blue-200 pb-2">
                  📱 Contact & Identity
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormGroup label="Phone" type="tel" value={newPatientForm.phone} error={formErrors.phone}
                    placeholder="10-digit mobile"
                    onChange={e => setNewPatientForm(p => ({ ...p, phone: e.target.value }))} />
                  <FormGroup label="Email" type="email" value={newPatientForm.email}
                    placeholder="optional@example.com"
                    onChange={e => setNewPatientForm(p => ({ ...p, email: e.target.value }))} />
                  <div className="md:col-span-2">
                    <FormGroup label="Address" type="textarea" value={newPatientForm.address} error={formErrors.address}
                      placeholder="Full residential address"
                      onChange={e => setNewPatientForm(p => ({ ...p, address: e.target.value }))} />
                  </div>
                  <FormGroup label="Emergency Contact" type="tel" value={newPatientForm.emergencyContact}
                    placeholder="Alt phone number"
                    onChange={e => setNewPatientForm(p => ({ ...p, emergencyContact: e.target.value }))} />
                  <FormGroup label="ABHA / Health ID" value={newPatientForm.abha}
                    placeholder="14-digit number (if any)"
                    onChange={e => setNewPatientForm(p => ({ ...p, abha: e.target.value }))} />
                </div>
              </div>

              {/* --- Section: Medical Info --- */}
              <div className="bg-teal-50/50 p-4 rounded-xl border border-teal-100">
                <h3 className="text-teal-800 font-bold mb-4 flex items-center gap-2 border-b border-teal-200 pb-2">
                  🌿 Health Profile
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <FormGroup label="Dosha (if known)" type="select" value={newPatientForm.dosha}
                      onChange={e => setNewPatientForm(p => ({ ...p, dosha: e.target.value }))}>
                      <option value="">Unknown / To be evaluated</option>
                      <option>Vata</option><option>Pitta</option><option>Kapha</option><option>Tridosha</option>
                    </FormGroup>
                  </div>
                  <div className="md:col-span-2">
                    <FormGroup label="Medical History" type="textarea" value={newPatientForm.medicalHistory}
                      placeholder="Allergies, chronic conditions, or ongoing treatments…"
                      onChange={e => setNewPatientForm(p => ({ ...p, medicalHistory: e.target.value }))} />
                  </div>
                </div>
              </div>

              <div className="bg-red-50 p-4 rounded-xl border-2 border-red-100 mt-2">
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="isEmergency" checked={newPatientForm.isEmergency}
                    onChange={e => setNewPatientForm(p => ({ ...p, isEmergency: e.target.checked }))}
                    className="w-5 h-5 cursor-pointer accent-red-600" />
                  <label htmlFor="isEmergency" className="text-red-800 font-bold cursor-pointer text-lg">
                    🚨 Mark as Emergency Visit
                  </label>
                </div>
                <p className="text-xs text-red-600 ml-8 mt-1 font-medium">
                  This patient will be prioritized and assigned to a senior doctor immediately.
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <button onClick={handleCreatePatient} disabled={actionLoading}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-black py-4 rounded-xl shadow-lg transition transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50">
                  {actionLoading ? 'Creating Profile...' : '✅ Complete Registration'}
                </button>
                <button onClick={() => setShowNewPatientModal(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-4 px-8 rounded-xl transition">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
