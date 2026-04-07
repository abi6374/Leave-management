import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const Layout = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="mx-auto flex max-w-[1440px] gap-4 px-4 py-4 lg:px-6">
        <Sidebar />
        <main className="min-h-screen flex-1 rounded-2xl border border-slate-200/70 bg-white/70 p-4 backdrop-blur md:p-6">
          <Header darkMode={darkMode} onToggleDarkMode={() => setDarkMode((v) => !v)} />
          {children}
        </main>
      </div>
    </div>
  );
};
