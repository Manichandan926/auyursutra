import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authAPI } from '../services/api';
import { useAuthStore } from '../utils/store';
import { FormGroup, ErrorAlert, SuccessAlert, LoadingSpinner } from '../components/Common';

export const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeRole, setActiveRole] = useState('patient'); // patient, reception

  const roles = {
    patient: { label: 'Patient', value: 'PATIENT' },
    reception: { label: 'Reception', value: 'RECEPTION' }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login(username, password, roles[activeRole].value);
      const { token, user } = response.data;

      setUser(user, token);

      // Route based on role
      switch (user.role) {
        case 'ADMIN':
          navigate('/admin/dashboard');
          break;
        case 'DOCTOR':
          navigate('/doctor/dashboard');
          break;
        case 'PRACTITIONER':
          navigate('/practitioner/dashboard');
          break;
        case 'PATIENT':
          navigate('/patient/dashboard');
          break;
        case 'RECEPTION':
          navigate('/reception/dashboard');
          break;
        default:
          navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = () => {
    navigate('/patient-signup');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-500 to-sky-700 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8">
        {/* Branding */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-sky-600 mb-2">
            {t('app.title')}
          </h1>
          <p className="text-gray-600">{t('app.subtitle')}</p>
        </div>

        {error && <ErrorAlert message={error} onClose={() => setError('')} />}

        {/* Role Selection */}
        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-3">
            {t('login.role')} (Public Access)
          </label>
          <div className="flex gap-2">
            {Object.entries(roles).map(([key, role]) => (
              <button
                key={key}
                onClick={() => setActiveRole(key)}
                className={`flex-1 py-2 rounded font-semibold transition ${
                  activeRole === key
                    ? 'bg-sky-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {role.label}
              </button>
            ))}
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin}>
          <FormGroup
            label={t('login.username')}
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={loading}
          />

          <FormGroup
            label={t('login.password')}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary disabled:opacity-50"
          >
            {loading ? t('common.loading') : t('login.loginButton')}
          </button>
        </form>

        {/* Signup Link */}
        {activeRole === 'patient' && (
          <div className="mt-4 text-center">
            <button
              onClick={handleSignup}
              className="text-sky-600 hover:text-sky-700 font-semibold"
            >
              {t('login.signupLink')}
            </button>
          </div>
        )}

        {/* Hidden Portals Info */}
        <div className="mt-6 pt-6 border-t border-gray-200 text-xs text-gray-500 text-center">
          <p>Admin, Doctor, Practitioner have separate portals:</p>
          <p className="mt-1">/admin/login • /doctor/login • /practitioner/login</p>
        </div>
      </div>
    </div>
  );
};

export const PatientSignupPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    age: '',
    phone: '',
    email: '',
    language: 'en',
    dosha: 'Tridosha'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.patientSignup(formData);
      const { token, user } = response.data;

      setSuccess('Account created! Logging in...');
      setUser(user, token);

      setTimeout(() => {
        navigate('/patient/dashboard');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-500 to-sky-700 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8">
        <h1 className="text-3xl font-bold text-sky-600 mb-2 text-center">
          New Patient Registration
        </h1>
        <p className="text-gray-600 text-center mb-6">AyurSutra Health Portal</p>

        {error && <ErrorAlert message={error} onClose={() => setError('')} />}
        {success && <SuccessAlert message={success} onClose={() => setSuccess('')} />}

        <form onSubmit={handleSignup}>
          <FormGroup
            label="Full Name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={loading}
          />

          <FormGroup
            label={t('login.username')}
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            disabled={loading}
          />

          <FormGroup
            label={t('login.password')}
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={loading}
          />

          <div className="grid grid-cols-2 gap-4 mb-4">
            <FormGroup
              label="Age"
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              required
              disabled={loading}
            />
            <FormGroup
              label="Phone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <FormGroup
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
          />

          <FormGroup
            label="Dosha"
            type="select"
            name="dosha"
            value={formData.dosha}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="Vata">Vata</option>
            <option value="Pitta">Pitta</option>
            <option value="Kapha">Kapha</option>
            <option value="Tridosha">Tridosha</option>
          </FormGroup>

          <FormGroup
            label="Language"
            type="select"
            name="language"
            value={formData.language}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="en">English</option>
            <option value="hi">हिंदी</option>
          </FormGroup>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary disabled:opacity-50"
          >
            {loading ? t('common.loading') : 'Create Account'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/login')}
            className="w-full btn-secondary mt-2"
          >
            Back to Login
          </button>
        </form>
      </div>
    </div>
  );
};

// Hidden portal logins
export const AdminLoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login(username, password, 'ADMIN');
      const { token, user } = response.data;

      if (user.role !== 'ADMIN') {
        throw new Error('Invalid credentials for admin portal');
      }

      setUser(user, token);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8 border-2 border-red-600">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-red-600 mb-2">Admin Portal</h1>
          <p className="text-gray-600">Restricted Access</p>
        </div>

        {error && <ErrorAlert message={error} onClose={() => setError('')} />}

        <form onSubmit={handleLogin}>
          <FormGroup
            label={t('login.username')}
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={loading}
          />

          <FormGroup
            label={t('login.password')}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition disabled:opacity-50"
          >
            {loading ? t('common.loading') : 'Admin Login'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => navigate('/login')}
            className="text-gray-600 hover:text-gray-800"
          >
            Back to Main Login
          </button>
        </div>
      </div>
    </div>
  );
};

export const DoctorLoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login(username, password, 'DOCTOR');
      const { token, user } = response.data;

      if (user.role !== 'DOCTOR') {
        throw new Error('Invalid credentials for doctor portal');
      }

      setUser(user, token);
      navigate('/doctor/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8 border-2 border-emerald-600">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-emerald-600 mb-2">Doctor Portal</h1>
          <p className="text-gray-600">Medical Professional Access</p>
        </div>

        {error && <ErrorAlert message={error} onClose={() => setError('')} />}

        <form onSubmit={handleLogin}>
          <FormGroup
            label={t('login.username')}
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={loading}
          />

          <FormGroup
            label={t('login.password')}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg transition disabled:opacity-50"
          >
            {loading ? t('common.loading') : 'Doctor Login'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => navigate('/login')}
            className="text-gray-600 hover:text-gray-800"
          >
            Back to Main Login
          </button>
        </div>
      </div>
    </div>
  );
};

export const PractitionerLoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login(username, password, 'PRACTITIONER');
      const { token, user } = response.data;

      if (user.role !== 'PRACTITIONER') {
        throw new Error('Invalid credentials for practitioner portal');
      }

      setUser(user, token);
      navigate('/practitioner/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8 border-2 border-purple-600">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-purple-600 mb-2">Practitioner Portal</h1>
          <p className="text-gray-600">Therapist Access</p>
        </div>

        {error && <ErrorAlert message={error} onClose={() => setError('')} />}

        <form onSubmit={handleLogin}>
          <FormGroup
            label={t('login.username')}
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={loading}
          />

          <FormGroup
            label={t('login.password')}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition disabled:opacity-50"
          >
            {loading ? t('common.loading') : 'Practitioner Login'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => navigate('/login')}
            className="text-gray-600 hover:text-gray-800"
          >
            Back to Main Login
          </button>
        </div>
      </div>
    </div>
  );
};
