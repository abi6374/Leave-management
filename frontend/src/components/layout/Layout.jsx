import React, { useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const Layout = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = darkMode ? 'dark' : 'light';
    document.body.classList.toggle('theme-dark', darkMode);
    return () => {
      root.dataset.theme = 'light';
      document.body.classList.remove('theme-dark');
    };
  }, [darkMode]);

  return (
    <div className="mx-auto flex max-w-[1440px] gap-4 px-4 py-4 lg:px-6">
      <Sidebar darkMode={darkMode} />
      <main className="min-h-screen flex-1 rounded-2xl border border-slate-200/70 bg-white/70 p-4 backdrop-blur md:p-6">
        <Header darkMode={darkMode} onToggleDarkMode={() => setDarkMode((v) => !v)} />
        {children}
      </main>
    </div>
  );
};
