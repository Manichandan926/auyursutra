import React, { useState, useEffect } from 'react';
import { Stat, Card, Table, FormGroup, ErrorAlert, LoadingSpinner, TabBar, Modal } from '../components/Common';
import { receptionAPI } from '../services/api';

export const ReceptionDashboard = () => {
  const [stats, setStats] = useState(null);
  const [waitingPatients, setWaitingPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [showNewPatientModal, setShowNewPatientModal] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await receptionAPI.getDashboard();
      setStats(response.data.stats);
      setWaitingPatients(response.data.waitingPatients);
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
          { id: 'waiting', label: 'Waiting Patients' },
          { id: 'new', label: 'New Registration' }
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {activeTab === 'overview' && stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Stat label="Total Patients" value={stats.totalPatients} color="sky" />
            <Stat label="Waiting Now" value={stats.waitingPatients} color="amber" />
            <Stat label="Checked In Today" value={stats.checkedInToday} color="emerald" />
            <Stat label="Emergency Cases" value={stats.emergencyCases} color="red" />
          </div>

          <Card title="Quick Actions">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setShowNewPatientModal(true)}
                className="btn-primary w-full"
              >
                Register New Patient
              </button>
              <button onClick={loadDashboardData} className="btn-secondary w-full">
                Refresh Waiting List
              </button>
            </div>
          </Card>
        </>
      )}

      {activeTab === 'waiting' && (
        <Card title="Current Waiting Patients">
          <Table
            columns={[
              { key: 'name', label: 'Name' },
              { key: 'age', label: 'Age' },
              { key: 'phone', label: 'Contact' },
              { key: 'waitingMinutes', label: 'Waiting (min)', render: (val) => <span className={val > 30 ? 'text-red-600 font-bold' : ''}>{val}</span> },
              {
                key: 'isEmergency',
                label: 'Type',
                render: (val) => <span className={`badge ${val ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>{val ? 'Emergency' : 'Regular'}</span>
              },
              {
                key: 'id',
                label: 'Action',
                render: (val) => (
                  <button
                    onClick={async () => {
                      try {
                        await receptionAPI.checkIn(val);
                        loadDashboardData();
                      } catch (err) {
                        setError('Failed to check in patient');
                      }
                    }}
                    className="text-sky-600 hover:text-sky-700 font-semibold"
                  >
                    Check In
                  </button>
                )
              }
            ]}
            data={waitingPatients}
          />
        </Card>
      )}

      {activeTab === 'new' && (
        <Card title="Patient Registration">
          <PatientRegistrationForm onSuccess={loadDashboardData} />
        </Card>
      )}

      <NewPatientModal
        isOpen={showNewPatientModal}
        onClose={() => setShowNewPatientModal(false)}
        onSuccess={loadDashboardData}
      />
    </div>
  );
};

const PatientRegistrationForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    phone: '',
    email: '',
    address: '',
    gender: 'Male',
    dosha: 'Tridosha',
    language: 'en',
    medicalHistory: '',
    isEmergency: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await receptionAPI.createPatient(formData);
      setSuccess(`Patient registered successfully! Login: ${response.data.credentials.username}`);
      setFormData({
        name: '', age: '', phone: '', email: '', address: '',
        gender: 'Male', dosha: 'Tridosha', language: 'en', medicalHistory: '', isEmergency: false
      });
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to register patient');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      {error && <ErrorAlert message={error} />}
      {success && <div className="bg-green-100 border border-green-400 text-green-700 p-3 rounded">{success}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormGroup
          label="Full Name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          disabled={loading}
        />

        <FormGroup
          label="Age"
          type="number"
          value={formData.age}
          onChange={(e) => setFormData({ ...formData, age: e.target.value })}
          required
          disabled={loading}
        />

        <FormGroup
          label="Phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          required
          disabled={loading}
        />

        <FormGroup
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          disabled={loading}
        />

        <FormGroup
          label="Gender"
          type="select"
          value={formData.gender}
          onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
          disabled={loading}
        >
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </FormGroup>

        <FormGroup
          label="Dosha"
          type="select"
          value={formData.dosha}
          onChange={(e) => setFormData({ ...formData, dosha: e.target.value })}
          disabled={loading}
        >
          <option value="Vata">Vata</option>
          <option value="Pitta">Pitta</option>
          <option value="Kapha">Kapha</option>
          <option value="Tridosha">Tridosha</option>
        </FormGroup>
      </div>

      <FormGroup
        label="Address"
        type="text"
        value={formData.address}
        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        disabled={loading}
      />

      <FormGroup
        label="Medical History"
        type="textarea"
        value={formData.medicalHistory}
        onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
        disabled={loading}
        placeholder="Previous conditions, medications, etc."
      />

      <div className="flex items-center">
        <input
          type="checkbox"
          checked={formData.isEmergency}
          onChange={(e) => setFormData({ ...formData, isEmergency: e.target.checked })}
          disabled={loading}
          className="mr-2"
        />
        <label className="font-semibold text-red-600">Emergency Case (Assign to Senior Doctor)</label>
      </div>

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? 'Registering...' : 'Register Patient'}
      </button>
    </form>
  );
};

const NewPatientModal = ({ isOpen, onClose, onSuccess }) => {
  return (
    <Modal isOpen={isOpen} title="Register New Patient" onClose={onClose}>
      <PatientRegistrationForm onSuccess={() => {
        onSuccess();
        onClose();
      }} />
    </Modal>
  );
};
