import React, { useEffect, useRef, useState } from 'react';

export const SelectField = ({ label, value, options, onChange, helperText }) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selected = options.find((item) => item.value === value) || options[0];

  return (
    <div ref={rootRef} className="relative">
      {label && <label className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</label>}
      <button
        type="button"
        className="input-field flex items-center justify-between text-left"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="font-medium text-slate-800">{selected?.label}</span>
        <span className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}>
          v
        </span>
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute z-50 mt-2 max-h-60 w-full overflow-auto rounded-xl border border-slate-200 bg-white p-1 shadow-lg"
        >
          {options.map((option) => {
            const isActive = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`w-full rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition ${
                  isActive
                    ? 'bg-sky-600 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}

      {helperText && <p className="mt-1 text-xs text-slate-500">{helperText}</p>}
    </div>
  );
};
