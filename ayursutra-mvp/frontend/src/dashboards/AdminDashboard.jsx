import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Stat, Card, Table, FormGroup, ErrorAlert, LoadingSpinner, TabBar, Modal } from '../components/Common';
import { adminAPI, generalAPI } from '../services/api';

export const AdminDashboard = () => {
  const { t } = useTranslation();
  const [metrics, setMetrics] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [metricsResp, leavesResp, usersResp] = await Promise.all([
        adminAPI.getDashboard(),
        adminAPI.getLeaves(),
        adminAPI.listUsers()
      ]);

      setMetrics(metricsResp.data.metrics);
      setLeaves(leavesResp.data.leaves);
      setUsers(usersResp.data.users);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveLeave = async (leaveId) => {
    try {
      await adminAPI.approveLeave(leaveId);
      await loadDashboardData();
    } catch (err) {
      setError('Failed to approve leave');
    }
  };

  const handleRejectLeave = async (leaveId) => {
    try {
      await adminAPI.rejectLeave(leaveId, 'Rejected by admin');
      await loadDashboardData();
    } catch (err) {
      setError('Failed to reject leave');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {error && <ErrorAlert message={error} onClose={() => setError('')} />}

      <TabBar
        tabs={[
          { id: 'overview', label: 'Overview' },
          { id: 'users', label: 'Users' },
          { id: 'leaves', label: 'Leave Requests' },
          { id: 'logs', label: 'Audit Logs' }
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {activeTab === 'overview' && metrics && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Stat label="Total Patients" value={metrics.totalPatients} color="sky" />
            <Stat label="Active Therapies" value={metrics.ongoingTherapies} color="emerald" />
            <Stat label="Success Rate" value={`${metrics.successRate}%`} color="green" />
            <Stat label="Doctors" value={metrics.totalDoctors} color="blue" />
            <Stat label="Practitioners" value={metrics.totalPractitioners} color="purple" />
            <Stat label="Pending Leaves" value={metrics.pendingLeaveRequests} color="amber" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Staff Load Balancing">
              <div className="space-y-3">
                <div>
                  <p className="text-gray-600">Average Patients per Doctor</p>
                  <p className="text-2xl font-bold">{metrics.avgDocLoad}</p>
                </div>
                <div>
                  <p className="text-gray-600">Average Patients per Practitioner</p>
                  <p className="text-2xl font-bold">{metrics.avgPracLoad}</p>
                </div>
              </div>
            </Card>

            <Card title="Today's Activity">
              <p className="text-gray-600 mb-2">Sessions Conducted Today</p>
              <p className="text-3xl font-bold text-sky-600">{metrics.sessionToday}</p>
            </Card>
          </div>
        </>
      )}

      {activeTab === 'users' && (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">{t('admin.users')}</h2>
            <button
              onClick={() => setShowCreateUserModal(true)}
              className="btn-primary"
            >
              Create User
            </button>
          </div>

          <Card>
            <Table
              columns={[
                { key: 'name', label: 'Name' },
                { key: 'username', label: 'Username' },
                { key: 'role', label: 'Role', render: (val) => <span className="badge badge-primary">{val}</span> },
                { key: 'enabled', label: 'Status', render: (val) => <span className={val ? 'badge badge-success' : 'badge'}>{val ? 'Enabled' : 'Disabled'}</span> }
              ]}
              data={users}
            />
          </Card>
        </>
      )}

      {activeTab === 'leaves' && (
        <Card title={t('admin.leaves')}>
          <Table
            columns={[
              { key: 'userId', label: 'User ID' },
              { key: 'fromDate', label: 'From' },
              { key: 'toDate', label: 'To' },
              { key: 'status', label: 'Status', render: (val) => <span className="badge badge-warning">{val}</span> },
              {
                key: 'id',
                label: 'Action',
                render: (val, row) =>
                  row.status === 'PENDING' && (
                    <div className="flex gap-2">
                      <button onClick={() => handleApproveLeave(val)} className="text-green-600 hover:text-green-700 font-semibold">
                        Approve
                      </button>
                      <button onClick={() => handleRejectLeave(val)} className="text-red-600 hover:text-red-700 font-semibold">
                        Reject
                      </button>
                    </div>
                  )
              }
            ]}
            data={leaves}
          />
        </Card>
      )}

      {activeTab === 'logs' && (
        <AuditLogs />
      )}

      <CreateUserModal isOpen={showCreateUserModal} onClose={() => setShowCreateUserModal(false)} onSuccess={loadDashboardData} />
    </div>
  );
};

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ action: '', startDate: '', endDate: '' });

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getLogs(filters);
      setLogs(response.data.logs);
    } catch (err) {
      console.error('Failed to load logs');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Card title="Audit Logs (Immutable)">
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
        <p className="text-sm text-blue-800">
          ✓ All logs are immutable and hash-chained for tamper detection
        </p>
      </div>

      <Table
        columns={[
          { key: 'timestamp', label: 'Time', render: (val) => new Date(val).toLocaleString() },
          { key: 'action', label: 'Action' },
          { key: 'userRole', label: 'Role' },
          { key: 'details', label: 'Details' }
        ]}
        data={logs.slice(0, 50)}
      />
    </Card>
  );
};

const CreateUserModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    role: 'DOCTOR',
    specialty: '',
    contact: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await adminAPI.createUser(formData);
      setFormData({ name: '', username: '', password: '', role: 'DOCTOR', specialty: '', contact: '' });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} title="Create New User" onClose={onClose}>
      {error && <ErrorAlert message={error} />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormGroup
          label="Name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          disabled={loading}
        />

        <FormGroup
          label="Username"
          type="text"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          required
          disabled={loading}
        />

        <FormGroup
          label="Password"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
          disabled={loading}
        />

        <FormGroup
          label="Role"
          type="select"
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          disabled={loading}
        >
          <option value="DOCTOR">Doctor</option>
          <option value="PRACTITIONER">Practitioner</option>
          <option value="RECEPTION">Reception</option>
        </FormGroup>

        {(formData.role === 'DOCTOR' || formData.role === 'PRACTITIONER') && (
          <FormGroup
            label="Specialty"
            type="text"
            value={formData.specialty}
            onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
            disabled={loading}
          />
        )}

        <FormGroup
          label="Contact"
          type="tel"
          value={formData.contact}
          onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
          disabled={loading}
        />

        <div className="flex gap-2">
          <button type="submit" className="flex-1 btn-primary" disabled={loading}>
            Create
          </button>
          <button type="button" onClick={onClose} className="flex-1 btn-secondary" disabled={loading}>
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
};
