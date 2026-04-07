import React from 'react';
import { relativeTime } from '../../utils/dateUtils';

export const NotificationItem = ({ item, onRead }) => {
  return (
    <div className={`rounded-xl border p-3 ${item.isRead ? 'border-slate-200 bg-white' : 'border-blue-200 bg-blue-50'}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-slate-800">{item.message}</p>
          <p className="mt-1 text-xs text-slate-500">{relativeTime(item.createdAt)}</p>
        </div>
        {!item.isRead ? (
          <button onClick={() => onRead(item._id)} className="text-xs font-semibold text-blue-700">
            Mark read
          </button>
        ) : null}
      </div>
    </div>
  );
};
