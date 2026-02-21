import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (username, password, role) =>
    api.post('/auth/login', { username, password, role }),
  logout: () => api.post('/auth/logout'),
  patientSignup: (data) => api.post('/auth/patient-signup', data),
  refreshToken: () => api.post('/auth/refresh')
};

export const adminAPI = {
  createUser: (data) => api.post('/admin/users', data),
  listUsers: (role) => api.get('/admin/users', { params: { role } }),
  toggleUser: (userId, enabled) => api.patch(`/admin/users/${userId}`, { enabled }),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  getLogs: (filters) => api.get('/admin/logs', { params: filters }),
  getDashboard: () => api.get('/admin/dashboard/overview'),
  getLeaves: () => api.get('/admin/leaves'),
  approveLeave: (leaveId) => api.post('/admin/leave/approve', { leaveId }),
  rejectLeave: (leaveId, reason) => api.post('/admin/leave/reject', { leaveId, reason }),
  reassignPractitioner: (patientId, newPractitionerId) =>
    api.post('/admin/practitioner/reassign', { patientId, newPractitionerId }),
  getOnCallRoster: (date) => api.get('/admin/roster/on-call', { params: { date } })
};

export const doctorAPI = {
  getPatients: (search) => api.get('/doctor/patients', { params: { search } }),
  assignTherapy: (data) => api.post('/doctor/assign-therapy', data),
  getPatientProgress: (patientId) => api.get(`/doctor/patient/${patientId}/progress`),
  getTherapySessions: (therapyId) => api.get(`/doctor/therapy/${therapyId}/sessions`),
  submitLeaveRequest: (data) => api.post('/doctor/leave-request', data),
  getLeaves: () => api.get('/doctor/leaves'),
  getDashboard: () => api.get('/doctor/dashboard')
};

export const practitionerAPI = {
  getPatients: () => api.get('/practitioner/patients'),
  recordSession: (data) => api.post('/practitioner/session', data),
  getPatientTherapy: (patientId) => api.get(`/practitioner/patient/${patientId}/therapy`),
  getTherapySessions: (therapyId) => api.get(`/practitioner/therapy/${therapyId}/sessions`),
  submitLeaveRequest: (data) => api.post('/practitioner/leave-request', data),
  getLeaves: () => api.get('/practitioner/leaves'),
  getDashboard: () => api.get('/practitioner/dashboard')
};

export const patientAPI = {
  getDashboard: () => api.get('/patient/dashboard'),
  getTherapyCalendar: () => api.get('/patient/therapy-calendar'),
  getProgress: () => api.get('/patient/progress'),
  getNotifications: (unreadOnly) =>
    api.get('/patient/notifications', { params: { unreadOnly } }),
  markNotificationAsRead: (notificationId) =>
    api.patch(`/patient/notifications/${notificationId}/read`),
  getProfile: () => api.get('/patient/profile'),
  completeProfile: (data) => api.post('/patient/complete-profile', data),
};

export const receptionAPI = {
  searchPatients: (search) => api.get('/reception/patients-search', { params: { search } }),
  getWaitingList: () => api.get('/reception/waiting-list'),
  createPatient: (data) => api.post('/reception/create-patient', data),
  assignDoctor: (patientId, doctorId) =>
    api.post('/reception/assign-doctor', { patientId, doctorId }),
  getDoctorsLoad: () => api.get('/reception/doctors-load'),
  checkIn: (patientId) => api.post('/reception/check-in', { patientId }),
  getEmergencyDoctors: () => api.get('/reception/emergency-doctors'),
  getDashboard: () => api.get('/reception/dashboard')
};

export const generalAPI = {
  getHealth: () => api.get('/health'),
  getNotifications: (unreadOnly) =>
    api.get('/notifications', { params: { unreadOnly } }),
  exportData: () => api.post('/export-data'),
  importData: (data) => api.post('/import-data', { data }),
  exportPatientPDF: (patientId) => api.get(`/patient/${patientId}/export-pdf`),
  getClinicMetrics: () => api.get('/reports/clinic-metrics')
};

export default api;
