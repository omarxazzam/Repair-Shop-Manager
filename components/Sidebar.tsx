
import React from 'react';
import { User, UserRole, View, VisualStyle } from '../types';
import { LayoutDashboard, Ticket, Package, DollarSign, Users, Settings, LogOut, UserCog, Moon, Sun } from 'lucide-react';

interface SidebarProps {
  currentView: View;
  onChangeView: (view: View) => void;
  currentUser: User;
  onLogout: () => void;
  darkMode: boolean;
  // Added visualStyle to satisfy component props passed in App.tsx
  visualStyle: VisualStyle;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, currentUser, onLogout, darkMode, visualStyle }) => {
  const getMenuItems = () => {
    const items = [
      { id: 'DASHBOARD', label: 'لوحة التحكم', icon: LayoutDashboard, roles: [UserRole.ADMIN, UserRole.MANAGER] },
      { id: 'TICKETS', label: 'قسم الصيانة', icon: Ticket, roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.TECHNICIAN] },
      { id: 'INVENTORY', label: 'المخزن', icon: Package, roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.TECHNICIAN] },
      { id: 'FINANCE', label: 'الحسابات', icon: DollarSign, roles: [UserRole.ADMIN, UserRole.MANAGER] },
      { id: 'CRM', label: 'العملاء', icon: Users, roles: [UserRole.ADMIN, UserRole.MANAGER] },
      { id: 'USERS', label: 'الفنيين والمستخدمين', icon: UserCog, roles: [UserRole.ADMIN] },
    ];
    return items.filter(item => item.roles.includes(currentUser.role));
  };

  const menuItems = getMenuItems();

  return (
    <div className={`w-64 h-screen fixed right-0 top-0 flex flex-col shadow-xl z-10 hidden md:flex transition-colors duration-300 ${darkMode ? 'bg-slate-800 border-l border-slate-700' : 'bg-slate-900'}`}>
      <div className="p-6 border-b border-slate-700/50">
        <h1 className="text-2xl font-bold text-primary">نظام إصلاح</h1>
        <p className="text-xs text-slate-400 mt-1">نسخة احترافية مخصصة</p>
      </div>
      
      <div className="p-4 bg-slate-700/20 mb-2 border-b border-slate-700/30">
         <p className="text-xs text-slate-500">مرحباً،</p>
         <p className="font-bold text-white truncate">{currentUser.name}</p>
         <span className="text-[10px] px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/30 inline-block mt-1 uppercase font-bold">
           {currentUser.role}
         </span>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onChangeView(item.id as View)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              currentView === item.id 
                ? 'bg-primary text-white shadow-lg' 
                : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
            }`}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-700 space-y-2">
        {currentUser.role === UserRole.ADMIN && (
          <button 
            onClick={() => onChangeView('SETTINGS')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              currentView === 'SETTINGS' ? 'bg-primary/10 text-primary border border-primary/20' : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
            }`}
          >
            <Settings size={20} />
            <span>الإعدادات</span>
          </button>
        )}
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-all font-bold"
        >
          <LogOut size={20} />
          <span>خروج</span>
        </button>
      </div>
    </div>
  );
};
