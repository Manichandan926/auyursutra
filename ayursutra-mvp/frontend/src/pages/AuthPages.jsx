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

  const theme = activeRole === 'patient'
    ? {
      bg: 'bg-ayur-forest',
      gradient: 'from-ayur-forest/80 to-ayur-900/90',
      text: 'text-ayur-forest',
      button: 'bg-ayur-forest hover:bg-ayur-700',
      ring: 'focus:ring-ayur-forest',
      icon: '🌿',
      title: <>Rooted Wisdom,<br />Modern Wellness.</>,
      description: 'Experience the ancient healing art of Ayurveda tailored to your modern lifestyle.'
    }
    : {
      bg: 'bg-amber-800',
      gradient: 'from-amber-800/80 to-amber-950/90',
      text: 'text-amber-800',
      button: 'bg-amber-800 hover:bg-amber-900',
      ring: 'focus:ring-amber-800',
      icon: '🏥',
      title: <>Efficient Care,<br />Seamless Service.</>,
      description: 'Streamlining clinic operations to ensure the best care for every patient.'
    };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login(username, password, roles[activeRole].value);
      const { token, user } = response.data;

      setUser(user, token);

      switch (user.role) {
        case 'ADMIN': navigate('/admin/dashboard'); break;
        case 'DOCTOR': navigate('/doctor/dashboard'); break;
        case 'PRACTITIONER': navigate('/practitioner/dashboard'); break;
        case 'PATIENT': navigate('/patient/dashboard'); break;
        case 'RECEPTION': navigate('/reception/dashboard'); break;
        default: navigate('/');
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
    <div className="w-full max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row font-sans transition-all duration-500 ease-in-out">
      {/* Left Side: Dynamic Branding */}
      <div className={`md:w-1/2 ${theme.bg} relative p-8 md:p-12 flex flex-col justify-between text-white transition-colors duration-500 ease-in-out`}>
        {/* Background Image / Pattern overlay */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540555700478-4be289fbecef?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
        <div className={`absolute inset-0 bg-gradient-to-b ${theme.gradient} transition-all duration-500`}></div>

        <div className="relative z-10 hidden md:block animate-fade-in">
          <div className="text-6xl mb-4 transition-transform duration-500 transform hover:scale-110">{theme.icon}</div>
          <h2 className="text-4xl font-serif font-bold mb-4 leading-tight">{theme.title}</h2>
          <p className="text-ayur-cream/90 text-lg leading-relaxed font-medium">
            {theme.description}
          </p>
        </div>

        <div className="relative z-10 md:hidden text-center">
          <h1 className="text-3xl font-serif font-bold">Welcome</h1>
        </div>

        <div className="relative z-10 hidden md:block">
          <p className="text-sm text-ayur-cream/60">
            &copy; {new Date().getFullYear()} AyurSutra. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="md:w-1/2 p-8 md:p-12 bg-white flex flex-col justify-center">
        <div className="text-center md:text-left mb-8">
          <h1 className={`text-3xl font-serif font-bold ${theme.text} mb-2 transition-colors duration-300`}>
            {t('login.title') || 'Login to AyurSutra'}
          </h1>
          <p className="text-gray-500">
            Please key in your credentials to proceed.
          </p>
        </div>

        {error && <ErrorAlert message={error} onClose={() => setError('')} />}

        {/* Role Toggles */}
        <div className="mb-6 bg-gray-100 p-1 rounded-xl flex">
          {Object.entries(roles).map(([key, role]) => (
            <button
              key={key}
              onClick={() => setActiveRole(key)}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${activeRole === key
                ? `bg-white ${theme.text} shadow-md scale-100`
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              {role.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <FormGroup
            label={t('login.username')}
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            required
            disabled={loading}
            className={`focus:ring-2 ${theme.ring} transition-all`}
          />

          <FormGroup
            label={t('login.password')}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            disabled={loading}
            className={`focus:ring-2 ${theme.ring} transition-all`}
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 ${theme.button} text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <LoadingSpinner size="sm" />
                <span>{t('common.loading')}...</span>
              </div>
            ) : (
              t('login.loginButton')
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm">
          <span className="text-gray-500">Don't have an account? </span>
          <button
            onClick={handleSignup}
            className={`${theme.text} font-bold hover:underline transition-colors duration-300`}
          >
            Register as Patient
          </button>
        </div>

        {/* Demo Credentials Hint */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <details className="text-xs text-gray-400 cursor-pointer hover:text-gray-600 transition">
            <summary>Demo Credentials</summary>
            <div className="mt-2 space-y-1 p-2 bg-gray-50 rounded">
              <p>Patient: patient1 / patient123</p>
              <p>Reception: reception1 / reception123</p>
            </div>
          </details>
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-50 text-red-600 mb-4">
            <span className="text-xl">🛡️</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Portal</h1>
          <p className="text-gray-500 text-sm mt-1">Restricted Access Only</p>
        </div>

        {error && <ErrorAlert message={error} onClose={() => setError('')} />}

        <form onSubmit={handleLogin} className="space-y-5">
          <FormGroup
            label="Username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="admin"
            required
            disabled={loading}
          />

          <FormGroup
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-gray-900 hover:bg-black text-white font-semibold rounded-lg transition-colors disabled:opacity-70"
          >
            {loading ? <LoadingSpinner size="sm" /> : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 text-center pt-6 border-t border-gray-50">
          <button
            onClick={() => navigate('/login')}
            className="text-sm text-gray-400 hover:text-gray-600 font-medium transition-colors"
          >
            ← Return to Main Login
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
    <div className="min-h-screen bg-ayur-cream/30 flex items-center justify-center py-12 px-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-ayur-100 p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-ayur-50 text-ayur-forest mb-4">
            <span className="text-xl">👨‍⚕️</span>
          </div>
          <h1 className="text-2xl font-bold text-ayur-forest">Doctor Login</h1>
          <p className="text-gray-500 text-sm mt-1">Medical Professional Access</p>
        </div>

        {error && <ErrorAlert message={error} onClose={() => setError('')} />}

        <form onSubmit={handleLogin} className="space-y-5">
          <FormGroup
            label="Doctor ID"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="doctor1"
            required
            disabled={loading}
          />

          <FormGroup
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-ayur-forest hover:bg-ayur-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-70"
          >
            {loading ? <LoadingSpinner size="sm" /> : 'Log In'}
          </button>
        </form>

        <div className="mt-8 text-center pt-6 border-t border-gray-50">
          <button
            onClick={() => navigate('/login')}
            className="text-sm text-gray-400 hover:text-gray-600 font-medium transition-colors"
          >
            ← Return to Main Login
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-50 text-purple-600 mb-4">
            <span className="text-xl">🧘</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Practitioner Login</h1>
          <p className="text-gray-500 text-sm mt-1">Therapist Access</p>
        </div>

        {error && <ErrorAlert message={error} onClose={() => setError('')} />}

        <form onSubmit={handleLogin} className="space-y-5">
          <FormGroup
            label="Practitioner ID"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="prac1"
            required
            disabled={loading}
          />

          <FormGroup
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-70"
          >
            {loading ? <LoadingSpinner size="sm" /> : 'Log In'}
          </button>
        </form>

        <div className="mt-8 text-center pt-6 border-t border-gray-50">
          <button
            onClick={() => navigate('/login')}
            className="text-sm text-gray-400 hover:text-gray-600 font-medium transition-colors"
          >
            ← Return to Main Login
          </button>
        </div>
      </div>
    </div>
  );
};
