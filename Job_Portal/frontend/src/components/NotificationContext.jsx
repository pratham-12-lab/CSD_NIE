import React, { createContext, useContext, useState } from 'react';
import ToastNotification from '../components/ToastNotification';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const showNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type }]);
  };

  const hideNotification = (id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {notifications.map((notif) => (
        <ToastNotification
          key={notif.id}
          message={notif.message}
          type={notif.type}
          onClose={() => hideNotification(notif.id)}
        />
      ))}
    </NotificationContext.Provider>
  );
};
