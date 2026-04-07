import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export const SelectField = ({ label, value, options, onChange, helperText }) => {
  const [open, setOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const [menuStyle, setMenuStyle] = useState(null);
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

  useEffect(() => {
    if (!open || !rootRef.current) return;

    const rect = rootRef.current.getBoundingClientRect();
    const estimatedMenuHeight = Math.min(options.length * 44 + 12, 240);
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    setOpenUpward(spaceBelow < estimatedMenuHeight && spaceAbove > spaceBelow);
    setMenuStyle({
      position: 'fixed',
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      zIndex: 10000,
    });
  }, [open, options.length]);

  useEffect(() => {
    if (!open) return;

    const syncPosition = () => {
      if (!rootRef.current) return;
      const rect = rootRef.current.getBoundingClientRect();
      setMenuStyle({
        position: 'fixed',
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        zIndex: 10000,
      });
    };

    window.addEventListener('resize', syncPosition);
    window.addEventListener('scroll', syncPosition, true);
    return () => {
      window.removeEventListener('resize', syncPosition);
      window.removeEventListener('scroll', syncPosition, true);
    };
  }, [open]);

  const selected = options.find((item) => item.value === value) || options[0];
  const isDark = typeof document !== 'undefined' && document.documentElement.dataset.theme === 'dark';

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

      {open && typeof document !== 'undefined'
        ? createPortal(
            <div
              role="listbox"
              className={`max-h-60 overflow-auto rounded-xl border p-1 shadow-2xl ${isDark ? 'border-slate-700 bg-slate-950 text-slate-100' : 'border-slate-200 bg-white text-slate-900'}`}
              style={{
                ...(menuStyle || {}),
                top: openUpward && rootRef.current ? `${rootRef.current.getBoundingClientRect().top - Math.min(options.length * 44 + 12, 240) - 8}px` : `${rootRef.current.getBoundingClientRect().bottom + 8}px`,
              }}
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
                        : isDark
                          ? 'text-slate-200 hover:bg-slate-800'
                          : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>,
            document.body
          )
        : null}

      {helperText && <p className="mt-1 text-xs text-slate-500">{helperText}</p>}
    </div>
  );
};
