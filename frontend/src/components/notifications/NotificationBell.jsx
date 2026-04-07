import React, { useState } from 'react';
import { useNotificationContext } from '../../context/NotificationContext';
import { NotificationItem } from './NotificationItem';
import { Link } from 'react-router-dom';

export const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, markRead } = useNotificationContext();

  return (
    <div className="relative">
      <button onClick={() => setOpen((v) => !v)} className="relative rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700">
        Notifications
        {unreadCount > 0 ? <span className="absolute -right-2 -top-2 rounded-full bg-rose-500 px-1.5 py-0.5 text-xs text-white">{unreadCount}</span> : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-40 mt-2 w-96 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-800">Recent Notifications</h4>
            <Link to="/notifications" onClick={() => setOpen(false)} className="text-xs font-semibold text-blue-700">View all</Link>
          </div>
          <div className="space-y-2">
            {notifications.slice(0, 5).map((item) => (
              <NotificationItem key={item._id} item={item} onRead={markRead} />
            ))}
            {!notifications.length ? <p className="text-sm text-slate-500">No notifications yet.</p> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
};
