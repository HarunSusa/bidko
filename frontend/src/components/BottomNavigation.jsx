import React from 'react';
import { NavLink } from 'react-router-dom';

function BottomNavigation() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-gray-100 dark:border-slate-800 z-50 md:hidden shadow-[0_-8px_30px_rgb(0,0,0,0.02)] theme-transition">
      <div className="flex justify-around items-center h-16">
        <NavLink to="/" className={({ isActive }) => `flex flex-col items-center gap-0.5 text-[10px] font-bold tracking-tight uppercase ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
          <span className="text-lg">🔨</span> Aukcije
        </NavLink>
        <NavLink to="/kreiraj-aukciju" className={({ isActive }) => `flex flex-col items-center gap-0.5 text-[10px] font-bold tracking-tight uppercase ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
          <span className="text-lg">➕</span> Objavi
        </NavLink>
        <NavLink to="/dashboard" className={({ isActive }) => `flex flex-col items-center gap-0.5 text-[10px] font-bold tracking-tight uppercase ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
          <span className="text-lg">📊</span> Panel
        </NavLink>
        <NavLink to="/obavijesti" className={({ isActive }) => `flex flex-col items-center gap-0.5 text-[10px] font-bold tracking-tight uppercase ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
          <span className="text-lg">🔔</span> Info
        </NavLink>
        <NavLink to="/profil" className={({ isActive }) => `flex flex-col items-center gap-0.5 text-[10px] font-bold tracking-tight uppercase ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
          <span className="text-lg">👤</span> Profil
        </NavLink>
      </div>
    </div>
  );
}

export default BottomNavigation;