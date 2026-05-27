import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCircle, Clock } from 'lucide-react';
import api from '../api/axios';

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/api/notifications');
      setNotifications(response.data);
      const unreadResponse = await api.get('/api/notifications/unread-count');
      setUnreadCount(unreadResponse.data.count);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.put(`/api/notifications/${id}/read`);
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/api/notifications/read-all');
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="dashboard-notification-wrapper" ref={dropdownRef}>
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="dashboard-headerbar__icon-btn"
        aria-label="Notifications"
        style={{ position: 'relative' }}
      >
        <Bell width={20} height={20} />
        {unreadCount > 0 && (
          <span className="dashboard-notification-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="dashboard-notification-menu">
          <div className="dashboard-notification-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="dashboard-notification-readall"
              >
                <CheckCircle width={16} height={16} />
                Mark all read
              </button>
            )}
          </div>
          
          <div className="dashboard-notification-body">
            {notifications.length === 0 ? (
              <div className="dashboard-notification-empty">
                <Bell width={48} height={48} opacity={0.3} />
                <p>No notifications yet</p>
              </div>
            ) : (
              <ul className="dashboard-notification-list">
                {notifications.map((notification) => (
                  <li 
                    key={notification.id} 
                    className={`dashboard-notification-item ${!notification.read ? 'unread' : ''}`}
                    onClick={() => !notification.read && markAsRead(notification.id)}
                  >
                    <div className={`dashboard-notification-dot ${!notification.read ? 'unread' : ''}`}></div>
                    <div className="dashboard-notification-content">
                      <div className="dashboard-notification-title-row">
                        <h4 className="dashboard-notification-title">
                          {notification.title}
                        </h4>
                        <span className="dashboard-notification-time">
                          <Clock width={12} height={12} />
                          {formatDate(notification.createdAt)}
                        </span>
                      </div>
                      <p className="dashboard-notification-message">
                        {notification.message}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
