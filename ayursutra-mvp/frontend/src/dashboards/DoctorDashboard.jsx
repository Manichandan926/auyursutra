import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Stat, Card, Table, FormGroup, ErrorAlert, LoadingSpinner, TabBar } from '../components/Common';
import { doctorAPI } from '../services/api';

export const DoctorDashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [patients, setPatients] = useState([]);
  const [therapies, setTherapies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await doctorAPI.getDashboard();
      setStats(response.data.stats);
      setPatients(response.data.patients);
      setTherapies(response.data.therapies);
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

      <TabBar
        tabs={[
          { id: 'overview', label: 'Overview' },
          { id: 'patients', label: 'Patients' },
          { id: 'therapies', label: 'Therapies' },
          { id: 'leave', label: 'Leave' }
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {activeTab === 'overview' && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat label="My Patients" value={stats.totalPatients} color="emerald" />
          <Stat label="Active Therapies" value={stats.activeTherapies} color="sky" />
          <Stat label="Completed" value={stats.completedTherapies} color="green" />
          <Stat label="Pending Leaves" value={stats.pendingLeaves} color="amber" />
        </div>
      )}

      {activeTab === 'patients' && (
        <Card title={t('doctor.patients')}>
          <Table
            columns={[
              { key: 'name', label: 'Name' },
              { key: 'age', label: 'Age' },
              { key: 'phone', label: 'Phone' },
              { key: 'dosha', label: 'Dosha', render: (val) => <span className="badge badge-primary">{val}</span> }
            ]}
            data={patients}
          />
        </Card>
      )}

      {activeTab === 'therapies' && (
        <Card title={t('doctor.assignTherapy')}>
          <AssignTherapyForm onSuccess={loadDashboardData} />
        </Card>
      )}

      {activeTab === 'leave' && (
        <Card title="Leave Management">
          <LeaveRequestForm onSuccess={loadDashboardData} />
        </Card>
      )}
    </div>
  );
};

const AssignTherapyForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    patientId: '',
    primaryPractitionerId: '',
    type: 'Virechana',
    phase: 'PURVAKARMA',
    startDate: '',
    durationDays: 7,
    room: '',
    herbs: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await doctorAPI.assignTherapy({
        ...formData,
        durationDays: parseInt(formData.durationDays),
        herbs: formData.herbs.split(',').map(h => h.trim())
      });
      setFormData({ patientId: '', primaryPractitionerId: '', type: 'Virechana', phase: 'PURVAKARMA', startDate: '', durationDays: 7, room: '', herbs: '' });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to assign therapy');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <ErrorAlert message={error} />}

      <FormGroup
        label="Patient ID"
        type="text"
        value={formData.patientId}
        onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
        required
        disabled={loading}
      />

      <FormGroup
        label="Therapy Type"
        type="select"
        value={formData.type}
        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
        disabled={loading}
      >
        <option value="Virechana">Virechana</option>
        <option value="Basti">Basti</option>
        <option value="Nasya">Nasya</option>
        <option value="Abhyanga">Abhyanga</option>
      </FormGroup>

      <FormGroup
        label="Phase"
        type="select"
        value={formData.phase}
        onChange={(e) => setFormData({ ...formData, phase: e.target.value })}
        disabled={loading}
      >
        <option value="PURVAKARMA">Purvakarma</option>
        <option value="PRADHANAKARMA">Pradhanakarma</option>
        <option value="PASCHATKARMA">Paschatkarma</option>
      </FormGroup>

      <FormGroup
        label="Start Date"
        type="date"
        value={formData.startDate}
        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
        required
        disabled={loading}
      />

      <FormGroup
        label="Duration (days)"
        type="number"
        value={formData.durationDays}
        onChange={(e) => setFormData({ ...formData, durationDays: e.target.value })}
        disabled={loading}
      />

      <FormGroup
        label="Room Number"
        type="text"
        value={formData.room}
        onChange={(e) => setFormData({ ...formData, room: e.target.value })}
        required
        disabled={loading}
      />

      <FormGroup
        label="Herbs (comma-separated)"
        type="text"
        value={formData.herbs}
        onChange={(e) => setFormData({ ...formData, herbs: e.target.value })}
        disabled={loading}
      />

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? 'Assigning...' : 'Assign Therapy'}
      </button>
    </form>
  );
};

const LeaveRequestForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    fromDate: '',
    toDate: '',
    reason: '',
    emergencyCoverRequired: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await doctorAPI.submitLeaveRequest(formData);
      setFormData({ fromDate: '', toDate: '', reason: '', emergencyCoverRequired: false });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit leave request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      {error && <ErrorAlert message={error} />}

      <FormGroup
        label="From Date"
        type="date"
        value={formData.fromDate}
        onChange={(e) => setFormData({ ...formData, fromDate: e.target.value })}
        required
        disabled={loading}
      />

      <FormGroup
        label="To Date"
        type="date"
        value={formData.toDate}
        onChange={(e) => setFormData({ ...formData, toDate: e.target.value })}
        required
        disabled={loading}
      />

      <FormGroup
        label="Reason"
        type="textarea"
        value={formData.reason}
        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
        disabled={loading}
      />

      <div className="flex items-center">
        <input
          type="checkbox"
          checked={formData.emergencyCoverRequired}
          onChange={(e) => setFormData({ ...formData, emergencyCoverRequired: e.target.checked })}
          disabled={loading}
          className="mr-2"
        />
        <label>Require emergency cover for patient reassignment</label>
      </div>

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Leave Request'}
      </button>
    </form>
  );
};
