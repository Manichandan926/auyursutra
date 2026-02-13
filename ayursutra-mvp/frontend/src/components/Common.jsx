import React from 'react';
import { useTranslation } from 'react-i18next';

export const Header = ({ user, onLogout }) => {
  const { t, i18n } = useTranslation();

  return (
    <header className="bg-gradient-to-r from-amber-700 via-amber-600 to-yellow-600 text-white shadow-2xl sticky top-0 z-50">
      <nav className="container mx-auto px-6 py-5 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="text-3xl">🏥</div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">{t('app.title')}</h1>
            <span className="text-yellow-100 text-xs font-semibold tracking-widest">{t('app.subtitle')}</span>
          </div>
        </div>
        <div className="flex items-center gap-8">
          {user && (
            <>
              <div className="text-right">
                <p className="text-sm font-bold text-yellow-50">{user.name}</p>
                <span className="inline-block bg-yellow-700 text-yellow-50 px-3 py-1 rounded-full text-xs font-bold tracking-wide">
                  {user.role}
                </span>
              </div>
              <select
                value={i18n.language}
                onChange={(e) => i18n.changeLanguage(e.target.value)}
                className="bg-amber-800 hover:bg-amber-900 text-white rounded-lg px-3 py-2 text-sm font-semibold transition"
              >
                <option value="en">🇬🇧 English</option>
                <option value="hi">🇮🇳 हिंदी</option>
              </select>
              <button
                onClick={onLogout}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition shadow-lg"
              >
                {t('dashboard.logout')}
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-gray-300 border-t-2 border-amber-600 py-8 mt-auto">
      <div className="container mx-auto px-6 text-center">
        <p className="font-bold text-lg">🌿 AyurSutra MVP</p>
        <p className="text-amber-400 font-semibold text-sm mb-2">Ayurvedic Hospital Digital Transformation</p>
        <p className="text-xs text-gray-400">&copy; {currentYear} Smart India Hackathon | Made with ❤️ for Healthcare</p>
      </div>
    </footer>
  );
};

export const Container = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-gray-50">
    <div className="flex-1 container mx-auto px-4 py-8">
      {children}
    </div>
  </div>
);

export const Card = ({ title, children, className = '' }) => (
  <div className={`bg-white rounded-xl shadow-lg hover:shadow-2xl transition border-l-4 border-amber-600 p-6 ${className}`}>
    {title && <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2"><span className="text-amber-600">📋</span>{title}</h2>}
    {children}
  </div>
);

export const Stat = ({ label, value, icon, color = 'amber' }) => (
  <div className={`bg-gradient-to-br from-${color}-50 to-${color}-100 rounded-xl shadow-md border border-${color}-200 p-6 text-center hover:shadow-lg transition`}>
    <div className="text-4xl font-black text-${color}-600 mb-2">{value}</div>
    <div className="text-gray-700 font-semibold text-sm">{label}</div>
    {icon && <div className="mt-3 text-2xl">{icon}</div>}
  </div>
);

export const Modal = ({ isOpen, title, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-amber-600 to-yellow-500 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button onClick={onClose} className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition">
            ✕
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export const LoadingSpinner = () => (
  <div className="flex flex-col justify-center items-center py-16">
    <div className="animate-spin rounded-full h-16 w-16 border-4 border-amber-200 border-t-amber-600 mb-4"></div>
    <p className="text-gray-600 font-semibold">Loading...</p>
  </div>
);

export const ErrorAlert = ({ message, onClose }) => (
  <div className="bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-400 text-red-700 px-6 py-4 rounded-lg relative mb-4 shadow-md flex items-start gap-3">
    <span className="text-2xl">⚠️</span>
    <div className="flex-1">
      <span className="block font-semibold">{message}</span>
    </div>
    {onClose && (
      <button onClick={onClose} className="text-red-500 hover:text-red-700 font-bold">
        ✕
      </button>
    )}
  </div>
);

export const SuccessAlert = ({ message, onClose }) => (
  <div className="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-400 text-green-700 px-6 py-4 rounded-lg relative mb-4 shadow-md flex items-start gap-3">
    <span className="text-2xl">✅</span>
    <div className="flex-1">
      <span className="block font-semibold">{message}</span>
    </div>
    {onClose && (
      <button onClick={onClose} className="text-green-500 hover:text-green-700 font-bold">
        ✕
      </button>
    )}
  </div>
);

export const TabBar = ({ tabs, activeTab, onTabChange }) => (
  <div className="flex gap-2 border-b-2 border-gray-200 mb-6 overflow-x-auto">
    {tabs.map((tab) => (
      <button
        key={tab.id}
        onClick={() => onTabChange(tab.id)}
        className={`px-6 py-3 font-bold whitespace-nowrap transition-all ${
          activeTab === tab.id
            ? 'text-amber-600 border-b-4 border-amber-600 bg-amber-50'
            : 'text-gray-600 hover:text-amber-600'
        }`}
      >
        {tab.icon && <span className="mr-2">{tab.icon}</span>}
        {tab.label}
      </button>
    ))}
  </div>
);

export const Table = ({ columns, data, onRowClick }) => (
  <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-md">
    <table className="w-full">
      <thead>
        <tr className="bg-gradient-to-r from-amber-600 to-yellow-500 border-b-2 border-amber-700">
          {columns.map((col) => (
            <th key={col.key} className="px-6 py-4 text-left text-white font-bold">
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, idx) => (
          <tr
            key={idx}
            onClick={() => onRowClick?.(row)}
            className="border-b border-gray-200 hover:bg-amber-50 transition cursor-pointer"
          >
            {columns.map((col) => (
              <td key={col.key} className="px-6 py-4 text-gray-700 font-medium">
                {col.render ? col.render(row[col.key], row) : row[col.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const FormGroup = ({ label, type = 'text', required = false, error, ...props }) => (
  <div className="mb-5">
    <label className="block text-gray-700 font-bold mb-2">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {type === 'textarea' ? (
      <textarea className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-amber-600 transition" {...props} />
    ) : type === 'select' ? (
      <select className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-amber-600 transition" {...props} />
    ) : (
      <input type={type} className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-amber-600 transition" {...props} />
    )}
    {error && <p className="text-red-500 text-sm mt-1 font-semibold">{error}</p>}
  </div>
);
