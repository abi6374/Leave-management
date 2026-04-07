import React from 'react';
import { useNotificationContext } from '../context/NotificationContext';
import { NotificationItem } from '../components/notifications/NotificationItem';

export const Notifications = () => {
  const { notifications, markRead, markAllRead } = useNotificationContext();

  return (
    <div className="space-y-4">
      <div className="page-hero">
        <p className="page-kicker">Alerts</p>
        <h2 className="page-title">Notification Center</h2>
        <p className="page-subtitle">Stay updated with approvals, rejections, and reminders.</p>
      </div>

      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800">Recent Notifications</h3>
          <button className="btn-secondary" onClick={markAllRead}>Mark all as read</button>
        </div>
        <div className="space-y-3">
          {notifications.map((item) => (
            <NotificationItem key={item._id} item={item} onRead={markRead} />
          ))}
          {!notifications.length ? <p className="text-sm text-slate-500">No notifications found.</p> : null}
        </div>
      </div>
    </div>
  );
};
