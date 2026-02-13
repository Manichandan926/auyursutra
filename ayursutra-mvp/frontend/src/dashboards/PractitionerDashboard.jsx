import React, { useState, useEffect } from 'react';
import { Stat, Card, Table, ErrorAlert, LoadingSpinner, TabBar, FormGroup } from '../components/Common';
import { practitionerAPI } from '../services/api';

export const PractitionerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await practitionerAPI.getDashboard();
      setStats(response.data.stats);
      setPatients(response.data.patients);
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
          { id: 'patients', label: 'My Patients' },
          { id: 'sessions', label: 'Sessions' },
          { id: 'leave', label: 'Leave' }
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {activeTab === 'overview' && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat label="Assigned Patients" value={stats.totalPatients} color="purple" />
          <Stat label="Sessions Today" value={stats.sessionsToday} color="sky" />
          <Stat label="Total Sessions" value={stats.totalSessions} color="emerald" />
          <Stat label="Avg Progress" value={`${stats.avgProgress}%`} color="green" />
        </div>
      )}

      {activeTab === 'patients' && (
        <Card title="My Assigned Patients">
          <Table
            columns={[
              { key: 'name', label: 'Name' },
              { key: 'age', label: 'Age' },
              { key: 'phone', label: 'Phone' },
              { key: 'dosha', label: 'Dosha' }
            ]}
            data={patients}
          />
        </Card>
      )}

      {activeTab === 'sessions' && (
        <Card title="Record Session Progress">
          <RecordSessionForm onSuccess={loadDashboardData} />
        </Card>
      )}

      {activeTab === 'leave' && (
        <Card title="Leave Request">
          <LeaveRequestForm onSuccess={loadDashboardData} />
        </Card>
      )}
    </div>
  );
};

const RecordSessionForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    therapyId: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    progressPercent: 0,
    attended: true,
    symptoms: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await practitionerAPI.recordSession({
        ...formData,
        progressPercent: parseInt(formData.progressPercent),
        symptoms: formData.symptoms.split(',').map(s => s.trim()).filter(s => s)
      });
      setFormData({ therapyId: '', date: new Date().toISOString().split('T')[0], notes: '', progressPercent: 0, attended: true, symptoms: '' });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to record session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      {error && <ErrorAlert message={error} />}

      <FormGroup
        label="Therapy ID"
        type="text"
        value={formData.therapyId}
        onChange={(e) => setFormData({ ...formData, therapyId: e.target.value })}
        required
        disabled={loading}
      />

      <FormGroup
        label="Session Date"
        type="date"
        value={formData.date}
        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
        required
        disabled={loading}
      />

      <FormGroup
        label="Progress (%)"
        type="number"
        min="0"
        max="100"
        value={formData.progressPercent}
        onChange={(e) => setFormData({ ...formData, progressPercent: e.target.value })}
        disabled={loading}
      />

      <FormGroup
        label="Session Notes"
        type="textarea"
        value={formData.notes}
        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        disabled={loading}
      />

      <FormGroup
        label="Symptoms Observed (comma-separated)"
        type="text"
        value={formData.symptoms}
        onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
        disabled={loading}
        placeholder="e.g., pain, fatigue, stiffness"
      />

      <div className="flex items-center">
        <input
          type="checkbox"
          checked={formData.attended}
          onChange={(e) => setFormData({ ...formData, attended: e.target.checked })}
          disabled={loading}
          className="mr-2"
        />
        <label>Patient Attended</label>
      </div>

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? 'Recording...' : 'Record Session'}
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
      await practitionerAPI.submitLeaveRequest(formData);
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
