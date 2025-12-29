import React from 'react';
import { User, UserRole, View } from '../types';
import { LayoutDashboard, Ticket, Package, DollarSign, Users, Settings, LogOut, UserCog } from 'lucide-react';

interface SidebarProps {
  currentView: View;
  onChangeView: (view: View) => void;
  currentUser: User;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, currentUser, onLogout }) => {
  
  // Define menu items based on roles
  const getMenuItems = () => {
    const items = [
      { id: 'DASHBOARD', label: 'لوحة التحكم', icon: LayoutDashboard, roles: [UserRole.ADMIN, UserRole.MANAGER] },
      { id: 'TICKETS', label: 'التذاكر', icon: Ticket, roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.TECHNICIAN] },
      { id: 'INVENTORY', label: 'المخزن', icon: Package, roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.TECHNICIAN] },
      { id: 'FINANCE', label: 'الحسابات', icon: DollarSign, roles: [UserRole.ADMIN, UserRole.MANAGER] },
      { id: 'CRM', label: 'العملاء', icon: Users, roles: [UserRole.ADMIN, UserRole.MANAGER] },
      { id: 'USERS', label: 'الفنيين والمستخدمين', icon: UserCog, roles: [UserRole.ADMIN] },
    ];

    return items.filter(item => item.roles.includes(currentUser.role));
  };

  const menuItems = getMenuItems();

  return (
    <div className="w-64 bg-slate-900 text-white h-screen fixed right-0 top-0 flex flex-col shadow-xl z-10 hidden md:flex">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-blue-400">نظام إصلاح</h1>
        <p className="text-xs text-slate-400 mt-1">v2.0.0 Pro</p>
      </div>
      
      <div className="p-4 bg-slate-800/50 mb-2">
         <p className="text-xs text-slate-400">مرحباً،</p>
         <p className="font-bold text-white truncate">{currentUser.name}</p>
         <span className="text-xs px-2 py-0.5 rounded bg-blue-600 text-white inline-block mt-1">
           {currentUser.role === UserRole.ADMIN && 'مدير النظام'}
           {currentUser.role === UserRole.MANAGER && 'مشرف'}
           {currentUser.role === UserRole.TECHNICIAN && 'فني صيانة'}
         </span>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onChangeView(item.id as View)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              currentView === item.id 
                ? 'bg-primary text-white shadow-lg shadow-blue-900/50' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-2">
        {currentUser.role === UserRole.ADMIN && (
          <button 
            onClick={() => onChangeView('SETTINGS')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              currentView === 'SETTINGS' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Settings size={20} />
            <span>الإعدادات</span>
          </button>
        )}
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-all"
        >
          <LogOut size={20} />
          <span>تسجيل خروج</span>
        </button>
      </div>
    </div>
  );
};
