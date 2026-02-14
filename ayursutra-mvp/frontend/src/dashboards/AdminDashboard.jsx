import React, { useState } from 'react';
import { Card, Stat, Modal, FormGroup, LoadingSpinner, ErrorAlert, SuccessAlert, TabBar, Table } from '../components/Common';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showCredentialModal, setShowCredentialModal] = useState(false);
  const [credentialForm, setCredentialForm] = useState({
    role: 'doctor',
    name: '',
    email: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState({});

  // Mock data
  const [credentials, setCredentials] = useState([
    { id: 1, role: 'Doctor', name: 'Dr. Raj Kumar', email: 'raj@hospital.com', created: '2026-02-10', status: 'Active' },
    { id: 2, role: 'Practitioner', name: 'Priya Singh', email: 'priya@hospital.com', created: '2026-02-09', status: 'Active' },
    { id: 3, role: 'Reception', name: 'Amit Patel', email: 'amit@hospital.com', created: '2026-02-08', status: 'Inactive' }
  ]);

  const [activityLogs, setActivityLogs] = useState([
    { id: 1, timestamp: '2026-02-13 10:45', user: 'Dr. Raj Kumar', action: 'Assigned therapy to Patient#1', type: 'Therapy Assignment' },
    { id: 2, timestamp: '2026-02-13 09:30', user: 'Priya Singh', action: 'Completed session for Patient#5', type: 'Session Completion' },
    { id: 3, timestamp: '2026-02-13 08:15', user: 'Amit Patel', action: 'Check-in Patient#8', type: 'Check-in' },
    { id: 4, timestamp: '2026-02-12 16:20', user: 'Dr. Sharma', action: 'Requested leave for 5 days', type: 'Leave Request' },
    { id: 5, timestamp: '2026-02-12 14:00', user: 'System', action: 'Backup completed successfully', type: 'System' }
  ]);

  const [leaveRequests, setLeaveRequests] = useState([
    { id: 1, name: 'Dr. Sharma', role: 'Doctor', reason: 'Personal emergency', dateFrom: '2026-02-20', dateTo: '2026-02-25', status: 'Pending' },
    { id: 2, name: 'Priya Singh', role: 'Practitioner', reason: 'Scheduled vacation', dateFrom: '2026-03-01', dateTo: '2026-03-10', status: 'Pending' },
    { id: 3, name: 'Rohan Das', role: 'Doctor', reason: 'Medical appointment', dateFrom: '2026-02-15', dateTo: '2026-02-15', status: 'Approved' }
  ]);

  const [reassignmentData, setReassignmentData] = useState([
    { id: 1, patient: 'Patient#10', currentPractitioner: 'Priya Singh (On Leave)', newPractitioner: 'Ravi Kumar', status: 'Pending' },
    { id: 2, patient: 'Patient#12', currentPractitioner: 'Rohan Das (On Leave)', newPractitioner: 'Sofia Martinez', status: 'Completed' }
  ]);

  const validateForm = () => {
    const errors = {};
    if (!credentialForm.name.trim()) errors.name = 'Name is required';
    if (!credentialForm.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errors.email = 'Valid email is required';
    if (credentialForm.password.length < 8) errors.password = 'Password must be at least 8 characters';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateCredential = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    
    const newCred = {
      id: credentials.length + 1,
      role: credentialForm.role.charAt(0).toUpperCase() + credentialForm.role.slice(1),
      name: credentialForm.name,
      email: credentialForm.email,
      created: new Date().toISOString().split('T')[0],
      status: 'Active'
    };
    
    setCredentials([...credentials, newCred]);
    setSuccessMsg(`✅ Credentials created for ${credentialForm.name}`);
    setCredentialForm({ role: 'doctor', name: '', email: '', password: '' });
    setFormErrors({});
    setShowCredentialModal(false);
    setLoading(false);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleLeaveAction = (id, action) => {
    setLeaveRequests(prev => prev.map(req => 
      req.id === id ? { ...req, status: action === 'approve' ? 'Approved' : 'Rejected' } : req
    ));
    setSuccessMsg(`✅ Leave request ${action === 'approve' ? 'approved' : 'rejected'}`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleReassignment = (id) => {
    setReassignmentData(prev => prev.map(item => 
      item.id === id ? { ...item, status: 'Completed' } : item
    ));
    setSuccessMsg('✅ Practitioner reassignment completed');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'leaves', label: 'Leave Requests', icon: '📋' },
    { id: 'reassignments', label: 'Reassignments', icon: '♻️' },
    { id: 'audit', label: 'Audit Logs', icon: '📜' },
  ];

  const auditColumns = [
    { key: 'user', label: 'User' },
    { key: 'action', label: 'Action' },
    { key: 'type', label: 'Type' }, // Fixed: Changed 'target' to 'type' to match your state data
    { key: 'timestamp', label: 'Timestamp' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-red-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-red-800 mb-2">🔐 Admin Dashboard</h1>
          <p className="text-red-700 font-semibold">Complete system management and oversight</p>
        </div>

        {successMsg && <SuccessAlert message={successMsg} onClose={() => setSuccessMsg('')} />}
        {errorMsg && <ErrorAlert message={errorMsg} onClose={() => setErrorMsg('')} />}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Stat label="Total Users" value={credentials.length} icon="👥" color="red" />
          <Stat label="Active Staff" value={credentials.filter(u => u.status === 'Active').length} icon="✅" color="red" />
          <Stat label="Pending Leaves" value={leaveRequests.filter(l => l.status === 'Pending').length} icon="⏳" color="red" />
          <Stat label="Activity Count" value={activityLogs.length} icon="📋" color="red" />
        </div>

        <TabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card title="Quick Actions" className="border-l-4 border-red-600">
              <div className="space-y-3">
                <button
                  onClick={() => setShowCredentialModal(true)}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white font-bold py-3 px-6 rounded-lg hover:shadow-lg transition"
                >
                  ➕ Create New User
                </button>
                <button className="w-full bg-gradient-to-r from-orange-600 to-orange-700 text-white font-bold py-3 px-6 rounded-lg hover:shadow-lg transition">
                  📊 Generate Report
                </button>
                <button className="w-full bg-gradient-to-r from-pink-600 to-pink-700 text-white font-bold py-3 px-6 rounded-lg hover:shadow-lg transition">
                  ⚙️ System Settings
                </button>
              </div>
            </Card>

            <Card title="System Status" className="border-l-4 border-red-600">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <span className="font-semibold text-red-800">API Status</span>
                  <span className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-xs font-bold">🟢 Online</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <span className="font-semibold text-red-800">Database</span>
                  <span className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-xs font-bold">🟢 Connected</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <span className="font-semibold text-red-800">Active Users Online</span>
                  <span className="px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-xs font-bold">42 users</span>
                </div>
              </div>
            </Card>

            <Card title="Recent Activity" className="md:col-span-2 border-l-4 border-red-600">
              <div className="space-y-3 max-h-72 overflow-y-auto">
                {activityLogs.slice(0, 5).map(log => (
                  <div key={log.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-red-50 transition">
                    <div>
                      <p className="font-semibold text-gray-800">{log.action}</p>
                      <p className="text-sm text-gray-600">{log.user}</p>
                    </div>
                    <span className="text-xs text-gray-500">{log.timestamp}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'users' && (
          <Card title="User Management" className="border-l-4 border-red-600">
            {loading ? <LoadingSpinner /> : <Table columns={[
              { key: 'role', label: 'Role' },
              { key: 'name', label: 'Name' },
              { key: 'email', label: 'Email' },
              { key: 'created', label: 'Created' },
              { key: 'status', label: 'Status', render: (status) => <span className={`px-3 py-1 rounded-full text-xs font-bold ${status === 'Active' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>{status}</span> },
            ]} data={credentials} />}
            <button
              onClick={() => setShowCredentialModal(true)}
              className="mt-6 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition"
            >
              ➕ Add New User
            </button>
          </Card>
        )}

        {activeTab === 'leaves' && (
          <Card title="Leave Request Management" className="border-l-4 border-red-600">
            {loading ? (
              <LoadingSpinner />
            ) : (
              <div className="space-y-4">
                {leaveRequests.map(req => (
                  <div key={req.id} className="p-4 border-2 border-red-100 rounded-lg hover:bg-red-50 transition">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-red-800">{req.name}</p>
                        <p className="text-sm text-gray-600">{req.reason}</p>
                        <p className="text-xs text-gray-500">{req.dateFrom} to {req.dateTo}</p>
                      </div>
                      <div className="flex gap-2">
                        {req.status === 'Pending' ? (
                          <>
                            <button
                              onClick={() => handleLeaveAction(req.id, 'approve')}
                              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition"
                            >
                              ✅ Approve
                            </button>
                            <button
                              onClick={() => handleLeaveAction(req.id, 'reject')}
                              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition"
                            >
                              ❌ Reject
                            </button>
                          </>
                        ) : (
                           <span className={`px-3 py-1 rounded-full text-xs font-bold ${req.status === 'Approved' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                              {req.status}
                           </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {activeTab === 'reassignments' && (
          <Card title="System Reassignments" className="border-l-4 border-red-600">
            {loading ? <LoadingSpinner /> : (
              <Table columns={[
                { key: 'patient', label: 'Patient' },
                { key: 'currentPractitioner', label: 'Current' },
                { key: 'newPractitioner', label: 'New' },
                { key: 'status', label: 'Status', render: (status) => <span className={`px-3 py-1 rounded-full text-xs font-bold ${status === 'Completed' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>{status}</span> },
                 {
                  key: 'id',
                  label: 'Action',
                  render: (id, row) => row.status === 'Pending' ? (
                    <button
                      onClick={() => handleReassignment(id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm transition"
                    >
                      Confirm
                    </button>
                  ) : <span className="text-green-600 font-bold">Done</span>
                }
              ]} data={reassignmentData} />
            )}
          </Card>
        )}

        {activeTab === 'audit' && (
          <Card title="Audit Logs" className="border-l-4 border-red-600">
            {loading ? <LoadingSpinner /> : <Table columns={auditColumns} data={activityLogs} />}
          </Card>
        )}

        <Modal isOpen={showCredentialModal} title="Create New User" onClose={() => setShowCredentialModal(false)}>
          {loading ? (
            <LoadingSpinner />
          ) : (
            <>
              <FormGroup
                label="Role"
                type="select"
                value={credentialForm.role}
                onChange={(e) => setCredentialForm({...credentialForm, role: e.target.value})}
              >
                <option value="doctor">Doctor</option>
                <option value="practitioner">Practitioner</option>
                <option value="reception">Reception</option>
              </FormGroup>

              <FormGroup
                label="Full Name"
                value={credentialForm.name}
                onChange={(e) => setCredentialForm({...credentialForm, name: e.target.value})}
                error={formErrors.name}
                required
              />

              <FormGroup
                label="Email Address"
                type="email"
                value={credentialForm.email}
                onChange={(e) => setCredentialForm({...credentialForm, email: e.target.value})}
                error={formErrors.email}
                required
              />

              <FormGroup
                label="Password"
                type="password"
                value={credentialForm.password}
                onChange={(e) => setCredentialForm({...credentialForm, password: e.target.value})}
                error={formErrors.password}
                required
              />

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleCreateCredential}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg transition"
                >
                  ✅ Create
                </button>
                <button
                  onClick={() => setShowCredentialModal(false)}
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
};