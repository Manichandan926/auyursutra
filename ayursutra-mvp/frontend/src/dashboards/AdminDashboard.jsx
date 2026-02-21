import React, { useState, useEffect, useCallback } from 'react';
import { Card, Stat, Modal, FormGroup, LoadingSpinner, ErrorAlert, SuccessAlert, TabBar, Table } from '../components/Common';
import { adminAPI } from '../services/api';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Real data from API
  const [overviewData, setOverviewData] = useState(null);
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);

  // Create user modal
  const [showCredentialModal, setShowCredentialModal] = useState(false);
  const [credentialForm, setCredentialForm] = useState({ role: 'DOCTOR', name: '', email: '', password: '', username: '' });
  const [formErrors, setFormErrors] = useState({});

  const notify = (msg, isError = false) => {
    if (isError) { setErrorMsg(msg); setTimeout(() => setErrorMsg(''), 5000); }
    else { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 4000); }
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [overviewRes, usersRes, logsRes, leavesRes] = await Promise.allSettled([
        adminAPI.getDashboard(),
        adminAPI.listUsers(),
        adminAPI.getLogs({ limit: 50 }),
        adminAPI.getLeaves(),
      ]);

      if (overviewRes.status === 'fulfilled') setOverviewData(overviewRes.value.data);
      if (usersRes.status === 'fulfilled') setUsers(usersRes.value.data.users || []);
      if (logsRes.status === 'fulfilled') setAuditLogs(logsRes.value.data.logs || []);
      if (leavesRes.status === 'fulfilled') setLeaveRequests(leavesRes.value.data.leaves || []);
    } catch (err) {
      notify('Failed to load admin data', true);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Create user ──
  const validateForm = () => {
    const errs = {};
    if (!credentialForm.name.trim()) errs.name = 'Name is required';
    if (!credentialForm.username?.trim()) errs.username = 'Username is required';
    if (credentialForm.password.length < 6) errs.password = 'Password must be at least 6 characters';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateUser = async () => {
    if (!validateForm()) return;
    setActionLoading(true);
    try {
      await adminAPI.createUser({
        name: credentialForm.name,
        username: credentialForm.username,
        email: credentialForm.email,
        password: credentialForm.password,
        role: credentialForm.role,
      });
      notify(`✅ User "${credentialForm.name}" created`);
      setCredentialForm({ role: 'DOCTOR', name: '', email: '', password: '', username: '' });
      setFormErrors({});
      setShowCredentialModal(false);
      fetchAll();
    } catch (err) {
      notify(err.response?.data?.error || 'Failed to create user', true);
    }
    setActionLoading(false);
  };

  // ── Toggle user enabled/disabled ──
  const handleToggleUser = async (userId, currentEnabled) => {
    setActionLoading(true);
    try {
      await adminAPI.toggleUser(userId, !currentEnabled);
      notify(`✅ User ${currentEnabled ? 'disabled' : 'enabled'}`);
      fetchAll();
    } catch (err) {
      notify(err.response?.data?.error || 'Failed to update user', true);
    }
    setActionLoading(false);
  };

  // ── Leave actions ──
  const handleLeaveAction = async (leaveId, action) => {
    setActionLoading(true);
    try {
      if (action === 'approve') {
        await adminAPI.approveLeave(leaveId);
      } else {
        await adminAPI.rejectLeave(leaveId, 'Rejected by admin');
      }
      notify(`✅ Leave request ${action === 'approve' ? 'approved' : 'rejected'}`);
      fetchAll();
    } catch (err) {
      notify(err.response?.data?.error || 'Action failed', true);
    }
    setActionLoading(false);
  };

  // ── Delete user ──
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    setActionLoading(true);
    try {
      await adminAPI.deleteUser(userId);
      setSuccessMsg(`✅ User deleted successfully`);
      fetchAll();
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to delete user');
    }
    setActionLoading(false);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'leaves', label: 'Leave Requests', icon: '📋' },
    { id: 'audit', label: 'Audit Logs', icon: '📜' },
  ];

  const pendingLeaves = leaveRequests.filter(l => l.status === 'PENDING' || l.status === 'pending').length;
  const activeUsers = users.filter(u => u.enabled !== false && !u.deleted).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center"><div className="text-5xl mb-3 animate-pulse">🔐</div>
          <p className="text-red-700 font-semibold">Loading admin data…</p></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-red-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-4xl font-black text-red-800 mb-1">🔐 Admin Dashboard</h1>
          <p className="text-red-700 font-semibold">Complete system management and oversight</p>
        </div>

        {successMsg && <SuccessAlert message={successMsg} onClose={() => setSuccessMsg('')} />}
        {errorMsg && <ErrorAlert message={errorMsg} onClose={() => setErrorMsg('')} />}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Stat label="Total Users" value={users.length} icon="👥" color="red" />
          <Stat label="Active Users" value={activeUsers} icon="✅" color="red" />
          <Stat label="Pending Leaves" value={pendingLeaves} icon="⏳" color="red" />
          <Stat label="Audit Events" value={auditLogs.length} icon="📋" color="red" />
        </div>

        <TabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        {/* ── Overview ── */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <Card title="Quick Actions" className="border-l-4 border-red-600">
              <div className="space-y-3">
                <button onClick={() => setShowCredentialModal(true)}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white font-bold py-3 px-6 rounded-lg hover:shadow-lg transition">
                  ➕ Create New User
                </button>
                <button onClick={fetchAll}
                  className="w-full bg-gradient-to-r from-orange-600 to-orange-700 text-white font-bold py-3 px-6 rounded-lg hover:shadow-lg transition">
                  🔄 Refresh Data
                </button>
              </div>
            </Card>

            <Card title="System Stats" className="border-l-4 border-red-600">
              <div className="space-y-3">
                {[
                  { label: 'Total Patients', value: overviewData?.totalPatients ?? '—' },
                  { label: 'Total Therapies', value: overviewData?.totalTherapies ?? '—' },
                  { label: 'Active Sessions', value: overviewData?.activeSessions ?? '—' },
                  { label: 'Database', value: 'SQLite ✅' },
                ].map(s => (
                  <div key={s.label} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <span className="font-semibold text-red-800">{s.label}</span>
                    <span className="px-3 py-1 bg-white border border-red-100 rounded-full text-sm font-bold text-red-700">{s.value}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Recent Audit Activity" className="md:col-span-2 border-l-4 border-red-600">
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {auditLogs.slice(0, 10).map((log, i) => (
                  <div key={log.id || i} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg hover:bg-red-50 transition">
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{log.action || log.details}</p>
                      <p className="text-xs text-gray-500">{log.userName || log.userId} · {log.userRole}</p>
                    </div>
                    <span className="text-xs text-gray-400 shrink-0 ml-2">
                      {log.timestamp ? new Date(log.timestamp).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) : ''}
                    </span>
                  </div>
                ))}
                {auditLogs.length === 0 && (
                  <p className="text-center text-gray-400 py-6">No audit events yet.</p>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* ── Users ── */}
        {activeTab === 'users' && (
          <Card title="User Management" className="border-l-4 border-red-600 mt-4">
            {actionLoading ? <LoadingSpinner /> : (
              <div className="space-y-2">
                {users.map(u => (
                  <div key={u.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-red-50 transition">
                    <div>
                      <p className="font-bold text-gray-800">{u.name}</p>
                      <p className="text-sm text-gray-500">{u.role} · {u.email || u.username}</p>
                      <p className="text-xs text-gray-400">Created: {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN') : '—'}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${u.enabled !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                        {u.enabled !== false ? '🟢 Active' : '⏸️ Inactive'}
                      </span>
                      <button
                        onClick={() => handleToggleUser(u.id, u.enabled !== false)}
                        className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold px-3 py-1 rounded-lg transition"
                      >
                        {u.enabled !== false ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="text-xs bg-red-100 hover:bg-red-200 text-red-600 font-bold px-3 py-1 rounded-lg transition ml-2"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
                {users.length === 0 && <p className="text-center text-gray-400 py-6">No users found.</p>}
              </div>
            )}
            <button onClick={() => { setFormErrors({}); setShowCredentialModal(true); }}
              className="mt-6 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition">
              ➕ Add New User
            </button>
          </Card>
        )}

        {/* ── Leave Requests ── */}
        {activeTab === 'leaves' && (
          <Card title="Leave Request Management" className="border-l-4 border-red-600 mt-4">
            {actionLoading ? <LoadingSpinner /> : (
              <div className="space-y-4">
                {leaveRequests.map(req => {
                  const isPending = req.status === 'PENDING' || req.status === 'pending';
                  return (
                    <div key={req.id} className="p-4 border-2 border-red-100 rounded-lg hover:bg-red-50 transition">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-red-800">{req.userName || req.userId}</p>
                          <p className="text-sm text-gray-600">{req.reason}</p>
                          <p className="text-xs text-gray-500">
                            {req.fromDate || req.from_date} → {req.toDate || req.to_date}
                            {req.userRole && <span className="ml-2 text-gray-400">({req.userRole})</span>}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {isPending ? (
                            <>
                              <button onClick={() => handleLeaveAction(req.id, 'approve')}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition">
                                ✅ Approve
                              </button>
                              <button onClick={() => handleLeaveAction(req.id, 'reject')}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition">
                                ❌ Reject
                              </button>
                            </>
                          ) : (
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${req.status === 'APPROVED' || req.status === 'approved'
                              ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                              }`}>{req.status}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {leaveRequests.length === 0 && (
                  <p className="text-center text-gray-400 py-8">No leave requests yet.</p>
                )}
              </div>
            )}
          </Card>
        )}

        {/* ── Audit Logs ── */}
        {activeTab === 'audit' && (
          <Card title="📜 Audit Logs" className="border-l-4 border-red-600 mt-4">
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {auditLogs.map((log, i) => (
                <div key={log.id || i} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg hover:bg-red-50 transition text-sm">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{log.action || log.details}</p>
                    <p className="text-xs text-gray-500">
                      👤 {log.userName || log.userId}
                      {log.userRole && <span className="ml-2 bg-gray-100 px-2 py-0.5 rounded">{log.userRole}</span>}
                      {log.targetId && <span className="ml-2 text-gray-400">→ {log.targetId}</span>}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 shrink-0 ml-4">
                    {log.timestamp ? new Date(log.timestamp).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) : ''}
                  </span>
                </div>
              ))}
              {auditLogs.length === 0 && (
                <div className="text-center py-10 text-gray-400">
                  <p className="text-3xl mb-2">📋</p>
                  <p>No audit events recorded yet. Actions taken in the system will appear here.</p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* ── Create User Modal ── */}
        <Modal isOpen={showCredentialModal} title="Create New User" onClose={() => setShowCredentialModal(false)}>
          {actionLoading ? <LoadingSpinner /> : (
            <>
              <FormGroup label="Role" type="select" value={credentialForm.role}
                onChange={e => setCredentialForm(p => ({ ...p, role: e.target.value }))}>
                <option value="DOCTOR">Doctor</option>
                <option value="PRACTITIONER">Practitioner</option>
                <option value="RECEPTION">Reception</option>
                <option value="ADMIN">Admin</option>
              </FormGroup>
              <FormGroup label="Full Name" value={credentialForm.name} required error={formErrors.name}
                onChange={e => setCredentialForm(p => ({ ...p, name: e.target.value }))} />
              <FormGroup label="Username" value={credentialForm.username} required error={formErrors.username}
                placeholder="e.g. dr.kumar"
                onChange={e => setCredentialForm(p => ({ ...p, username: e.target.value }))} />
              <FormGroup label="Email Address" type="email" value={credentialForm.email}
                onChange={e => setCredentialForm(p => ({ ...p, email: e.target.value }))} />
              <FormGroup label="Password" type="password" value={credentialForm.password} required error={formErrors.password}
                onChange={e => setCredentialForm(p => ({ ...p, password: e.target.value }))} />
              <div className="flex gap-3 mt-6">
                <button onClick={handleCreateUser}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg transition">
                  ✅ Create
                </button>
                <button onClick={() => setShowCredentialModal(false)}
                  className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 rounded-lg transition">
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