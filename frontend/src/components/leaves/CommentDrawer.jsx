import React from 'react';

export const CommentDrawer = ({ open, comments = [], onClose }) => {
  return (
    <div className={`fixed inset-y-0 right-0 z-50 w-full max-w-md transform bg-white shadow-2xl transition-transform ${open ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="flex items-center justify-between border-b border-slate-200 p-4">
        <h3 className="text-lg font-bold text-slate-800">Comments</h3>
        <button className="btn-secondary" onClick={onClose}>Close</button>
      </div>
      <div className="space-y-3 p-4">
        {comments.length ? (
          comments.map((item, index) => (
            <div key={`${item.timestamp}-${index}`} className="rounded-xl border border-slate-200 p-3">
              <p className="text-xs uppercase tracking-wider text-slate-500">{item.role}</p>
              <p className="mt-1 text-sm text-slate-700">{item.message}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500">No comments yet.</p>
        )}
      </div>
    </div>
  );
};
