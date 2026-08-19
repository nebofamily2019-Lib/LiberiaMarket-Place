import { useState, useEffect } from 'react';
import { notificationService } from '../services/notificationService';
import { designSystem } from '../styles/designSystem';
import { Skeleton } from '../components/LoadingSkeleton';
import { formatDistanceToNow } from 'date-fns';
import { Bell } from 'lucide-react';

const Notifications = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await notificationService.getNotifications();
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: designSystem.spacing.lg }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <Skeleton height="40px" width="200px" className="mb-4" />
          {[1, 2, 3].map(i => (
            <div key={i} style={{ marginBottom: '1rem' }}>
              <Skeleton height="100px" borderRadius="12px" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: designSystem.spacing.lg, maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: designSystem.spacing.xl }}>
        <h1 style={{ 
          fontSize: designSystem.typography.fontSize['3xl'], 
          fontWeight: designSystem.typography.fontWeight.bold,
          color: designSystem.colors.neutral[900],
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          Notifications <Bell size={32} />
        </h1>
        <button 
          onClick={handleMarkAllAsRead}
          style={{
            background: 'none',
            border: 'none',
            color: designSystem.colors.primary[500],
            cursor: 'pointer',
            fontWeight: designSystem.typography.fontWeight.semibold
          }}
        >
          Mark all as read
        </button>
      </div>

      {notifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: designSystem.spacing['2xl'] }}>
          <p style={{ fontSize: designSystem.typography.fontSize.xl, color: designSystem.colors.neutral[500] }}>
            No notifications yet.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: designSystem.spacing.md }}>
          {notifications.map((notification) => (
            <div 
              key={notification.id}
              onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
              style={{
                background: notification.is_read ? 'white' : '#f0f9ff',
                padding: designSystem.spacing.lg,
                borderRadius: designSystem.borderRadius.lg,
                boxShadow: designSystem.shadows.sm,
                borderLeft: notification.is_read ? 'none' : `4px solid ${designSystem.colors.primary[500]}`,
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: designSystem.spacing.xs }}>
                <span style={{ 
                  fontWeight: designSystem.typography.fontWeight.bold,
                  color: designSystem.colors.neutral[900]
                }}>
                  {notification.title}
                </span>
                <span style={{ 
                  fontSize: designSystem.typography.fontSize.xs,
                  color: designSystem.colors.neutral[500]
                }}>
                  {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                </span>
              </div>
              <p style={{ color: designSystem.colors.neutral[500] }}>
                {notification.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
