
import React, { useState } from 'react';
import { User, UserRole, View } from '../types';
import { StorageService } from '../services/storage';
import { Plus, Trash2, UserCog, Shield, Percent, UserPlus, CheckCircle2, Circle } from 'lucide-react';

interface UsersProps {
  users: User[];
  onUpdate: (users: User[]) => void;
  currentUser: User;
  styleClasses: string;
}

export const Users: React.FC<UsersProps> = ({ users, onUpdate, currentUser, styleClasses }) => {
  const [newUser, setNewUser] = useState<Partial<User>>({ 
    name: '', 
    username: '', 
    password: '', 
    role: UserRole.TECHNICIAN,
    commissionRate: 15,
    permissions: ['TICKETS', 'INVENTORY'] // صلاحيات افتراضية للفني
  });

  const availablePermissions: { id: View, label: string }[] = [
    { id: 'DASHBOARD', label: 'لوحة التحكم الإحصائية' },
    { id: 'TICKETS', label: 'إدارة تذاكر الصيانة' },
    { id: 'INVENTORY', label: 'إدارة المخزن والقطع' },
    { id: 'FINANCE', label: 'الحسابات والمالية' },
    { id: 'CRM', label: 'إدارة قاعدة بيانات العملاء' },
    { id: 'LOGS', label: 'سجل نشاطات النظام' },
    { id: 'USERS', label: 'إدارة الموظفين والصلاحيات' },
    { id: 'SETTINGS', label: 'إعدادات المتجر والمظهر' },
  ];

  const handleRoleChange = (role: UserRole) => {
    let defaultPerms: View[] = [];
    switch(role) {
      case UserRole.ADMIN:
        defaultPerms = ['DASHBOARD', 'TICKETS', 'INVENTORY', 'FINANCE', 'CRM', 'LOGS', 'USERS', 'SETTINGS'];
        break;
      case UserRole.MANAGER:
        defaultPerms = ['DASHBOARD', 'TICKETS', 'INVENTORY', 'FINANCE', 'CRM'];
        break;
      case UserRole.RECEPTIONIST:
        defaultPerms = ['TICKETS', 'CRM', 'DASHBOARD']; // صلاحيات الاستقبال الافتراضية
        break;
      default:
        defaultPerms = ['TICKETS', 'INVENTORY'];
    }
    setNewUser({ ...newUser, role, permissions: defaultPerms });
  };

  const togglePermission = (viewId: View) => {
    const current = newUser.permissions || [];
    if (current.includes(viewId)) {
      setNewUser({ ...newUser, permissions: current.filter(id => id !== viewId) });
    } else {
      setNewUser({ ...newUser, permissions: [...current, viewId] });
    }
  };

  const handleAddUser = () => {
    if (!newUser.name || !newUser.username || !newUser.password) {
      alert("يرجى إكمال البيانات الأساسية");
      return;
    }
    
    if (newUser.username.toLowerCase() === 'admin') {
      alert("هذا الاسم محجوز للنظام");
      return;
    }

    const user: User = {
      id: StorageService.generateId(),
      name: newUser.name,
      username: newUser.username,
      password: newUser.password,
      role: newUser.role || UserRole.TECHNICIAN,
      commissionRate: newUser.role === UserRole.TECHNICIAN ? (newUser.commissionRate || 0) : 0,
      permissions: newUser.permissions || []
    };

    onUpdate([...users, user]);
    setNewUser({ 
      name: '', 
      username: '', 
      password: '', 
      role: UserRole.TECHNICIAN, 
      commissionRate: 15,
      permissions: ['TICKETS', 'INVENTORY']
    });
  };

  const handleDelete = (id: string) => {
    const userToDelete = users.find(u => u.id === id);
    if (!userToDelete) return;

    if (userToDelete.username === 'admin') {
      alert("لا يمكن حذف مدير النظام الرئيسي");
      return;
    }
    
    if (id === currentUser.id) {
      alert("لا يمكنك حذف حسابك الحالي");
      return;
    }
    onUpdate(users.filter(u => u.id !== id));
  };

  const visibleUsers = users.filter(u => u.username !== 'admin');

  return (
    <div className="space-y-8 animate-fade-in">
      <h2 className="text-3xl font-bold text-slate-800 dark:text-white">إدارة المستخدمين والصلاحيات</h2>

      <div className={`${styleClasses} p-8`}>
        <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-8 flex items-center gap-2">
          <UserPlus size={22} className="text-primary"/> إضافة مستخدم وتحديد صلاحياته
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase px-1">الاسم الكامل</label>
            <input 
              type="text" 
              className="w-full p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary outline-none font-bold"
              value={newUser.name}
              onChange={e => setNewUser({...newUser, name: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase px-1">اسم الدخول</label>
            <input 
              type="text" 
              className="w-full p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary outline-none font-bold"
              value={newUser.username}
              onChange={e => setNewUser({...newUser, username: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase px-1">كلمة المرور</label>
            <input 
              type="text" 
              className="w-full p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary outline-none font-bold"
              value={newUser.password}
              onChange={e => setNewUser({...newUser, password: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase px-1">الدور الوظيفي</label>
            <select 
              className="w-full p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary font-bold"
              value={newUser.role}
              onChange={e => handleRoleChange(e.target.value as UserRole)}
            >
              <option value={UserRole.TECHNICIAN}>فني صيانة</option>
              <option value={UserRole.RECEPTIONIST}>موظف استقبال (استلام وتسليم)</option>
              <option value={UserRole.MANAGER}>مسؤول مشرف</option>
              <option value={UserRole.ADMIN}>مدير نظام</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-primary uppercase px-1">العمولة %</label>
            <input 
              type="number" 
              disabled={newUser.role !== UserRole.TECHNICIAN}
              className="w-full p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary disabled:opacity-30 font-black text-primary"
              value={newUser.commissionRate}
              onChange={e => setNewUser({...newUser, commissionRate: Number(e.target.value)})}
            />
          </div>
        </div>

        <div className="space-y-4 mb-10">
           <label className="block text-[10px] font-black text-slate-400 uppercase px-1 mb-4">تخصيص الصلاحيات (ما الذي يمكنه رؤيته؟)</label>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {availablePermissions.map(perm => (
                <button
                  key={perm.id}
                  onClick={() => togglePermission(perm.id)}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                    (newUser.permissions || []).includes(perm.id) 
                      ? 'border-primary bg-primary/5 text-primary ring-4 ring-primary/5' 
                      : 'border-slate-100 dark:border-slate-700 text-slate-500'
                  }`}
                >
                  <span className="text-xs font-bold">{perm.label}</span>
                  {(newUser.permissions || []).includes(perm.id) ? <CheckCircle2 size={18} /> : <Circle size={18} className="opacity-20"/>}
                </button>
              ))}
           </div>
        </div>

        <button onClick={handleAddUser} className="w-full bg-primary text-white p-5 rounded-2xl hover:bg-primary-dark transition-all font-black shadow-xl shadow-primary/20 text-lg">
          تأكيد إضافة المستخدم الجديد
        </button>
      </div>

      <div className={`${styleClasses} overflow-hidden`}>
        <div className="p-6 bg-slate-50/50 dark:bg-slate-900/50 border-b dark:border-slate-700">
           <h3 className="font-bold">المستخدمون الحاليون وصلاحياتهم</h3>
        </div>
        <table className="w-full text-right">
          <thead className="bg-slate-50/30 dark:bg-slate-900/30 text-slate-500 text-[10px] uppercase font-black tracking-widest">
            <tr>
              <th className="p-5">الموظف</th>
              <th className="p-5">الدور</th>
              <th className="p-5">الوصول المسموح به</th>
              <th className="p-5">العمولة</th>
              <th className="p-5">إدارة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {visibleUsers.map(user => (
              <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition">
                <td className="p-5">
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black">{user.name[0]}</div>
                     <div>
                       <p className="font-black text-slate-800 dark:text-white">{user.name}</p>
                       <p className="text-[10px] text-slate-400">@{user.username}</p>
                     </div>
                   </div>
                </td>
                <td className="p-5">
                   <span className={`px-4 py-1.5 rounded-full text-[10px] font-black border ${user.role === UserRole.ADMIN ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                     {user.role === UserRole.RECEPTIONIST ? 'استقبال' : user.role}
                   </span>
                </td>
                <td className="p-5">
                   <div className="flex flex-wrap gap-1 max-w-xs">
                     {user.permissions && user.permissions.map(p => (
                       <span key={p} className="bg-slate-100 dark:bg-slate-700 text-[8px] font-bold px-2 py-0.5 rounded text-slate-500 uppercase">{p}</span>
                     ))}
                     {(!user.permissions || user.permissions.length === 0) && <span className="text-red-400 text-[9px] font-bold">بلا صلاحيات</span>}
                   </div>
                </td>
                <td className="p-5">
                  {user.role === UserRole.TECHNICIAN ? (
                    <span className="text-primary font-black">{user.commissionRate}%</span>
                  ) : <span className="opacity-20">—</span>}
                </td>
                <td className="p-5">
                  <div className="flex items-center gap-3">
                    <button onClick={() => handleDelete(user.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                      <Trash2 size={20} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
