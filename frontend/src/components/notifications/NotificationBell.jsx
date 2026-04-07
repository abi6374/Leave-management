import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNotificationContext } from '../../context/NotificationContext';
import { NotificationItem } from './NotificationItem';
import { Link } from 'react-router-dom';

export const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState(null);
  const { notifications, unreadCount, markRead } = useNotificationContext();
  const buttonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (buttonRef.current && !buttonRef.current.contains(event.target) && !event.target.closest('[data-notification-menu="true"]')) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!open || !buttonRef.current) return;

    const syncPosition = () => {
      const rect = buttonRef.current.getBoundingClientRect();
      const width = 384;
      const right = Math.max(12, window.innerWidth - rect.right);
      const left = Math.min(Math.max(12, rect.right - width), window.innerWidth - width - 12);
      setMenuStyle({
        position: 'fixed',
        top: `${rect.bottom + 10}px`,
        left: `${left}px`,
        width: `${Math.min(width, window.innerWidth - 24)}px`,
        zIndex: 10000,
      });
    };

    syncPosition();
    window.addEventListener('resize', syncPosition);
    window.addEventListener('scroll', syncPosition, true);
    return () => {
      window.removeEventListener('resize', syncPosition);
      window.removeEventListener('scroll', syncPosition, true);
    };
  }, [open]);

  return (
    <div>
      <button ref={buttonRef} onClick={() => setOpen((v) => !v)} className="relative rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700">
        Notifications
        {unreadCount > 0 ? <span className="absolute -right-2 -top-2 rounded-full bg-rose-500 px-1.5 py-0.5 text-xs text-white">{unreadCount}</span> : null}
      </button>

      {open && typeof document !== 'undefined'
        ? createPortal(
            <div
              data-notification-menu="true"
              className="rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl"
              style={menuStyle || { position: 'fixed', zIndex: 10000, top: '72px', right: '16px', width: '384px' }}
            >
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
            </div>,
            document.body
          )
        : null}
    </div>
  );
};
