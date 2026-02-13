import React from 'react';
import { useTranslation } from 'react-i18next';

export const Header = ({ user, onLogout }) => {
  const { t, i18n } = useTranslation();

  return (
    <header className="bg-sky-600 text-white shadow-lg">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{t('app.title')}</h1>
          <span className="text-sky-100 text-sm">{t('app.subtitle')}</span>
        </div>
        <div className="flex items-center gap-6">
          {user && (
            <>
              <span className="badge bg-sky-700 text-sky-100">
                {user.role}
              </span>
              <span className="text-sm">{user.name}</span>
              <select
                value={i18n.language}
                onChange={(e) => i18n.changeLanguage(e.target.value)}
                className="bg-sky-700 text-white rounded px-2 py-1 text-sm"
              >
                <option value="en">English</option>
                <option value="hi">हिंदी</option>
              </select>
              <button
                onClick={onLogout}
                className="btn-secondary text-sm"
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
    <footer className="bg-gray-900 text-gray-300 text-center py-4 mt-auto">
      <p>&copy; {currentYear} AyurSutra - Smart India Hackathon MVP</p>
      <p className="text-xs">Role-based Ayurvedic Hospital Management System</p>
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
  <div className={`card ${className}`}>
    {title && <h2 className="text-xl font-bold mb-4 text-gray-800">{title}</h2>}
    {children}
  </div>
);

export const Stat = ({ label, value, icon, color = 'sky' }) => (
  <div className={`card text-center`}>
    <div className={`text-3xl font-bold text-${color}-600 mb-2`}>{value}</div>
    <div className="text-gray-600">{label}</div>
    {icon && <div className="mt-2">{icon}</div>}
  </div>
);

export const Modal = ({ isOpen, title, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="text-gray-500 text-xl">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-12">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
  </div>
);

export const ErrorAlert = ({ message, onClose }) => (
  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
    <span className="block sm:inline">{message}</span>
    {onClose && (
      <button onClick={onClose} className="absolute top-0 right-0 px-4 py-3">
        ✕
      </button>
    )}
  </div>
);

export const SuccessAlert = ({ message, onClose }) => (
  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
    <span className="block sm:inline">{message}</span>
    {onClose && (
      <button onClick={onClose} className="absolute top-0 right-0 px-4 py-3">
        ✕
      </button>
    )}
  </div>
);

export const TabBar = ({ tabs, activeTab, onTabChange }) => (
  <div className="flex border-b border-gray-200 mb-4">
    {tabs.map((tab) => (
      <button
        key={tab.id}
        onClick={() => onTabChange(tab.id)}
        className={`px-4 py-2 font-semibold border-b-2 transition ${
          activeTab === tab.id
            ? 'border-sky-600 text-sky-600'
            : 'border-transparent text-gray-600 hover:text-gray-800'
        }`}
      >
        {tab.label}
      </button>
    ))}
  </div>
);

export const Table = ({ columns, data, onRowClick }) => (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead>
        <tr className="bg-gray-100 border-b border-gray-300">
          {columns.map((col) => (
            <th key={col.key} className="px-4 py-2 text-left text-gray-700 font-semibold">
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
            className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
          >
            {columns.map((col) => (
              <td key={col.key} className="px-4 py-3 text-gray-700">
                {col.render ? col.render(row[col.key], row) : row[col.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const FormGroup = ({ label, type = 'text', required = false, ...props }) => (
  <div className="mb-4">
    <label className="block text-gray-700 font-semibold mb-2">
      {label}
      {required && <span className="text-red-500"> *</span>}
    </label>
    {type === 'textarea' ? (
      <textarea className="w-full border border-gray-300 rounded px-3 py-2" {...props} />
    ) : type === 'select' ? (
      <select className="w-full border border-gray-300 rounded px-3 py-2" {...props} />
    ) : (
      <input type={type} className="w-full border border-gray-300 rounded px-3 py-2" {...props} />
    )}
  </div>
);
