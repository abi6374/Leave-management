import React, { useEffect, useState } from 'react';
import { leaveAPI } from '../services/api';
import { formatDate } from '../utils/dateUtils';

export const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await leaveAPI.getCalendar();
        setEvents(response.data.events || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="card">Loading calendar...</div>;

  return (
    <div className="space-y-4">
      <div className="page-hero">
        <p className="page-kicker">Calendar</p>
        <h2 className="page-title">Team Leave Calendar</h2>
        <p className="page-subtitle">Date-indexed overview of approved and pending leaves.</p>
      </div>

      <div className="card">
        <div className="space-y-3">
          {events.map((event) => (
            <div key={event.id} className="rounded-xl border border-slate-200 p-3">
              <p className="font-semibold text-slate-800">{event.title}</p>
              <p className="text-sm text-slate-600">{formatDate(event.start)} - {formatDate(event.end)} | {event.status}</p>
            </div>
          ))}
          {!events.length ? <p className="text-sm text-slate-500">No leave events available.</p> : null}
        </div>
      </div>
    </div>
  );
};
