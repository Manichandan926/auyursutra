import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      'app.title': 'AyurSutra',
      'app.subtitle': 'Ayurvedic Hospital Management System',
      'login.title': 'Login to AyurSutra',
      'login.username': 'Username',
      'login.password': 'Password',
      'login.loginButton': 'Login',
      'login.signupLink': 'New patient? Sign up',
      'dashboard.welcome': 'Welcome',
      'dashboard.logout': 'Logout',
      'patient.therapies': 'My Therapies',
      'patient.progress': 'My Progress',
      'patient.calendar': 'Therapy Calendar',
      'patient.room': 'Room',
      'doctor.patients': 'My Patients',
      'doctor.assignTherapy': 'Assign Therapy',
      'reception.newPatient': 'New Patient',
      'reception.checkIn': 'Check In',
      'admin.users': 'Manage Users',
      'admin.logs': 'Audit Logs',
      'admin.leaves': 'Leave Requests',
      'common.loading': 'Loading...',
      'common.error': 'Error',
      'common.success': 'Success',
      'common.cancel': 'Cancel',
      'common.save': 'Save',
      'common.delete': 'Delete',
      'common.edit': 'Edit'
    }
  },
  hi: {
    translation: {
      'app.title': 'आयुर्सूत्र',
      'app.subtitle': 'आयुर्वेदिक अस्पताल प्रबंधन प्रणाली',
      'login.title': 'आयुर्सूत्र में लॉगिन करें',
      'login.username': 'उपयोगकर्ता नाम',
      'login.password': 'पासवर्ड',
      'login.loginButton': 'लॉगिन करें',
      'login.signupLink': 'नए रोगी? साइन अप करें',
      'dashboard.welcome': 'स्वागत है',
      'dashboard.logout': 'लॉगआउट',
      'patient.therapies': 'मेरी चिकित्साएं',
      'patient.progress': 'मेरी प्रगति',
      'patient.calendar': 'थेरेपी कैलेंडर',
      'patient.room': 'कमरा',
      'doctor.patients': 'मेरे रोगी',
      'doctor.assignTherapy': 'चिकित्सा असाइन करें',
      'reception.newPatient': 'नया रोगी',
      'reception.checkIn': 'चेक इन',
      'admin.users': 'उपयोगकर्ता प्रबंधित करें',
      'admin.logs': 'ऑडिट लॉग',
      'admin.leaves': 'छुट्टी के अनुरोध',
      'common.loading': 'लोड हो रहा है...',
      'common.error': 'त्रुटि',
      'common.success': 'सफलता',
      'common.cancel': 'रद्द करें',
      'common.save': 'सहेजें',
      'common.delete': 'हटाएं',
      'common.edit': 'संपादित करें'
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
