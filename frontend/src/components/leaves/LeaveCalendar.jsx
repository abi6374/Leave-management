import React from 'react';
import { formatDate } from '../../utils/dateUtils';

export const LeaveCalendar = ({ events = [] }) => {
  return (
    <div className="card">
      <h3 className="text-lg font-bold text-slate-800">Upcoming Leaves</h3>
      <div className="mt-3 space-y-2">
        {events.slice(0, 6).map((event) => (
          <div key={event.id} className="rounded-xl border border-slate-200 p-3">
            <p className="font-semibold text-slate-800">{event.title}</p>
            <p className="text-sm text-slate-500">{formatDate(event.start)} - {formatDate(event.end)}</p>
          </div>
        ))}
        {!events.length ? <p className="text-sm text-slate-500">No leave events to display.</p> : null}
      </div>
    </div>
  );
};
