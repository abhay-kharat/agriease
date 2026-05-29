import React, { createContext, useContext } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const NotificationContext = createContext();

const CustomToast = ({ message, type }) => {
  const icon = type === 'success' ? 'check_circle' : 'error';
  const colorClass = type === 'success' ? 'text-success' : 'text-error';
  
  return (
    <div className="flex items-center gap-3 py-1">
      <span className={`material-symbols-outlined ${colorClass}`}>
        {icon}
      </span>
      <div>
        <p className="text-sm font-bold text-text-main">{type === 'success' ? 'Success' : 'Error'}</p>
        <p className="text-xs text-text-muted">{message}</p>
      </div>
    </div>
  );
};

export const NotificationProvider = ({ children }) => {
  const notifySuccess = (message) => {
    toast.success(<CustomToast message={message} type="success" />, {
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      className: 'premium-toast',
    });
  };

  const notifyError = (message) => {
    toast.error(<CustomToast message={message} type="error" />, {
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      className: 'premium-toast error',
    });
  };

  return (
    <NotificationContext.Provider value={{ notifySuccess, notifyError }}>
      {children}
      <ToastContainer 
        toastClassName={() => 
          "relative flex p-4 min-h-10 rounded-md justify-between overflow-hidden cursor-pointer bg-surface shadow-premium border border-gray-100 mb-4"
        }
        bodyClassName={() => "flex text-sm font-body font-medium block p-0"}
      />
    </NotificationContext.Provider>
  );
};

export const useNotifier = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifier must be used within a NotificationProvider');
  }
  return context;
};
