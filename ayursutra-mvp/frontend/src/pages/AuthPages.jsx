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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 flex items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 text-6xl opacity-20 animate-pulse">🌿</div>
      <div className="absolute bottom-10 right-10 text-5xl opacity-20 animate-pulse">🏥</div>
      
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-10 border border-amber-100 relative z-10">
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🏥 🌿</div>
          <h1 className="text-4xl font-black text-amber-700 mb-2">
            {t('app.title')}
          </h1>
          <p className="text-amber-600 font-semibold text-sm">{t('app.subtitle')}</p>
        </div>

        {error && <ErrorAlert message={error} onClose={() => setError('')} />}

        {/* Role Selection */}
        <div className="mb-8">
          <label className="block text-gray-700 font-bold mb-3 text-center">
            {t('login')}
          </label>
          <div className="flex gap-3">
            {Object.entries(roles).map(([key, role]) => (
              <button
                key={key}
                onClick={() => setActiveRole(key)}
                className={`flex-1 py-3 rounded-lg font-bold transition transform hover:scale-105 ${
                  activeRole === key
                    ? 'bg-gradient-to-r from-amber-600 to-yellow-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {role.label === 'Patient' ? '👤' : '👨‍💼'} {role.label}
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
            placeholder="Enter your username"
            required
            disabled={loading}
          />

          <FormGroup
            label={t('login.password')}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-6 bg-gradient-to-r from-amber-600 to-yellow-500 text-white font-bold rounded-lg hover:shadow-lg transform hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <LoadingSpinner size="sm" />
                {t('common.loading')}
              </div>
            ) : (
              `🔐 ${t('login.loginButton')}`
            )}
          </button>
        </form>

        {/* Signup Link */}
        {activeRole === 'patient' && (
          <div className="mt-6 text-center pt-6 border-t border-amber-200">
            <button
              onClick={handleSignup}
              className="text-amber-600 font-bold hover:text-amber-700 underline hover:no-underline"
            >
              {t('login.signupLink')}
            </button>
          </div>
        )}

        {/* Hidden Portals Info */}
        <div className="mt-8 p-4 bg-amber-50 rounded-lg border border-amber-200 text-sm">
          <p className="font-bold text-amber-700 mb-2">📋 Demo Credentials:</p>
          <div className="space-y-1 text-gray-700">
            <p>👤 Patient: patient1 / patient123</p>
            <p>👨‍⚕️ Doctor: doctor1 / doctor123</p>
            <p>🏥 Admin: admin / admin123</p>
            <p className="text-xs text-gray-500 mt-2">Practitioner: prac1 / prac123</p>
          </div>
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 flex items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 text-6xl opacity-20 animate-pulse">🌿</div>
      <div className="absolute bottom-10 right-10 text-5xl opacity-20 animate-pulse">💚</div>
      
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-10 border border-amber-100 relative z-10">
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">👤 🌿</div>
          <h1 className="text-4xl font-black text-amber-700 mb-2">
            Patient Registration
          </h1>
          <p className="text-amber-600 font-semibold text-sm">Join the AyurSutra Health Community</p>
        </div>

        {error && <ErrorAlert message={error} onClose={() => setError('')} />}
        {success && <SuccessAlert message={success} onClose={() => setSuccess('')} />}

        <form onSubmit={handleSignup} className="space-y-4">
          <FormGroup
            label="👤 Full Name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Your full name"
            required
            disabled={loading}
          />

          <FormGroup
            label="🔐 Username"
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Choose a username"
            required
            disabled={loading}
          />

          <FormGroup
            label="🔑 Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Create a strong password"
            required
            disabled={loading}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormGroup
              label="📅 Age"
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              placeholder="Your age"
              required
              disabled={loading}
            />
            <FormGroup
              label="📱 Phone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="10-digit number"
              required
              disabled={loading}
            />
          </div>

          <FormGroup
            label="📧 Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="your.email@example.com"
            disabled={loading}
          />

          <FormGroup
            label="🌾 Dosha (Body Constitution)"
            type="select"
            name="dosha"
            value={formData.dosha}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="Vata">Vata - Air & Ether</option>
            <option value="Pitta">Pitta - Fire & Water</option>
            <option value="Kapha">Kapha - Water & Earth</option>
            <option value="Tridosha">Tridosha - Balanced</option>
          </FormGroup>

          <FormGroup
            label="🌐 Language"
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
            className="w-full py-3 mt-6 bg-gradient-to-r from-amber-600 to-yellow-500 text-white font-bold rounded-lg hover:shadow-lg transform hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <LoadingSpinner size="sm" />
                Creating Account...
              </div>
            ) : (
              '✨ Create My Account'
            )}
          </button>

          <button
            type="button"
            onClick={() => navigate('/login')}
            className="w-full py-3 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition"
          >
            ← Back to Login
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
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 flex items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 text-6xl opacity-20 animate-pulse">⚙️</div>
      <div className="absolute bottom-10 right-10 text-5xl opacity-20 animate-pulse">🛡️</div>
      
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-10 border-2 border-red-400 relative z-10">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🛡️ ⚙️</div>
          <h1 className="text-4xl font-black text-red-700 mb-2">Admin Portal</h1>
          <p className="text-red-600 font-semibold text-sm">🔐 Restricted Access Only</p>
        </div>

        {error && <ErrorAlert message={error} onClose={() => setError('')} />}

        <form onSubmit={handleLogin} className="space-y-4">
          <FormGroup
            label="🔐 Admin Username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter admin username"
            required
            disabled={loading}
          />

          <FormGroup
            label="🔑 Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            required
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-6 bg-gradient-to-r from-red-600 to-orange-500 text-white font-bold rounded-lg hover:shadow-lg transform hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <LoadingSpinner size="sm" />
                Authenticating...
              </div>
            ) : (
              '🔐 Admin Login'
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-red-200">
          <button
            onClick={() => navigate('/login')}
            className="w-full text-red-600 font-bold hover:text-red-700 underline hover:no-underline"
          >
            ← Back to Main Login
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 text-6xl opacity-20 animate-pulse">👨‍⚕️</div>
      <div className="absolute bottom-10 right-10 text-5xl opacity-20 animate-pulse">💊</div>
      
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-10 border-2 border-emerald-400 relative z-10">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">👨‍⚕️ 💚</div>
          <h1 className="text-4xl font-black text-emerald-700 mb-2">Doctor Portal</h1>
          <p className="text-emerald-600 font-semibold text-sm">🏥 Medical Professional Access</p>
        </div>

        {error && <ErrorAlert message={error} onClose={() => setError('')} />}

        <form onSubmit={handleLogin} className="space-y-4">
          <FormGroup
            label="🔐 Doctor Username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter doctor username"
            required
            disabled={loading}
          />

          <FormGroup
            label="🔑 Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            required
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-6 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold rounded-lg hover:shadow-lg transform hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <LoadingSpinner size="sm" />
                Authenticating...
              </div>
            ) : (
              '👨‍⚕️ Doctor Login'
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-emerald-200">
          <button
            onClick={() => navigate('/login')}
            className="w-full text-emerald-600 font-bold hover:text-emerald-700 underline hover:no-underline"
          >
            ← Back to Main Login
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 flex items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 text-6xl opacity-20 animate-pulse">🧘</div>
      <div className="absolute bottom-10 right-10 text-5xl opacity-20 animate-pulse">✨</div>
      
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-10 border-2 border-purple-400 relative z-10">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🧘 💜</div>
          <h1 className="text-4xl font-black text-purple-700 mb-2">Practitioner Portal</h1>
          <p className="text-purple-600 font-semibold text-sm">🌂 Therapist Professional Access</p>
        </div>

        {error && <ErrorAlert message={error} onClose={() => setError('')} />}

        <form onSubmit={handleLogin} className="space-y-4">
          <FormGroup
            label="🔐 Practitioner Username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter practitioner username"
            required
            disabled={loading}
          />

          <FormGroup
            label="🔑 Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            required
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-6 bg-gradient-to-r from-purple-600 to-indigo-500 text-white font-bold rounded-lg hover:shadow-lg transform hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <LoadingSpinner size="sm" />
                Authenticating...
              </div>
            ) : (
              '🧘 Practitioner Login'
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-purple-200">
          <button
            onClick={() => navigate('/login')}
            className="w-full text-purple-600 font-bold hover:text-purple-700 underline hover:no-underline"
          >
            ← Back to Main Login
          </button>
        </div>
      </div>
    </div>
  );
};
