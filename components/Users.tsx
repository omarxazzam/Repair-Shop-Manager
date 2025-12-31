import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { StorageService } from '../services/storage';
import { Plus, Trash2, UserCog, Shield, Percent, UserPlus } from 'lucide-react';

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
    commissionRate: 15 
  });

  const handleAddUser = () => {
    if (!newUser.name || !newUser.username || !newUser.password) return;
    
    const user: User = {
      id: StorageService.generateId(),
      name: newUser.name,
      username: newUser.username,
      password: newUser.password,
      role: newUser.role || UserRole.TECHNICIAN,
      commissionRate: newUser.role === UserRole.TECHNICIAN ? (newUser.commissionRate || 0) : 0,
    };

    onUpdate([...users, user]);
    setNewUser({ name: '', username: '', password: '', role: UserRole.TECHNICIAN, commissionRate: 15 });
  };

  const updateCommission = (id: string, rate: number) => {
    onUpdate(users.map(u => u.id === id ? {...u, commissionRate: rate} : u));
  };

  const handleDelete = (id: string) => {
    if (id === currentUser.id) {
      alert("لا يمكنك حذف حسابك الحالي");
      return;
    }
    onUpdate(users.filter(u => u.id !== id));
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <h2 className="text-3xl font-bold text-slate-800 dark:text-white">إدارة المستخدمين والفنيين</h2>

      <div className={`${styleClasses} p-8`}>
        <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-8 flex items-center gap-2">
          <UserPlus size={22} className="text-primary"/> إضافة مستخدم جديد للنظام
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 items-end">
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase px-1">الاسم الكامل</label>
            <input 
              type="text" 
              className="w-full p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary outline-none"
              value={newUser.name}
              onChange={e => setNewUser({...newUser, name: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase px-1">اسم الدخول</label>
            <input 
              type="text" 
              className="w-full p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary outline-none"
              value={newUser.username}
              onChange={e => setNewUser({...newUser, username: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase px-1">كلمة المرور</label>
            <input 
              type="text" 
              className="w-full p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary outline-none"
              value={newUser.password}
              onChange={e => setNewUser({...newUser, password: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase px-1">الصلاحية</label>
            <select 
              className="w-full p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary font-bold"
              value={newUser.role}
              onChange={e => setNewUser({...newUser, role: e.target.value as UserRole})}
            >
              <option value={UserRole.TECHNICIAN}>فني صيانة</option>
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
          <button onClick={handleAddUser} className="bg-primary text-white p-4 rounded-xl hover:bg-primary-dark transition-all font-black shadow-xl shadow-primary/20">تأكيد الإضافة</button>
        </div>
      </div>

      <div className={`${styleClasses} overflow-hidden`}>
        <div className="p-6 bg-slate-50/50 dark:bg-slate-900/50 border-b dark:border-slate-700">
           <h3 className="font-bold">قائمة المستخدمين الحاليين</h3>
        </div>
        <table className="w-full text-right">
          <thead className="bg-slate-50/30 dark:bg-slate-900/30 text-slate-500 text-[10px] uppercase font-black tracking-widest">
            <tr>
              <th className="p-5">اسم الموظف</th>
              <th className="p-5">الصلاحية الممنوحة</th>
              <th className="p-5">نسبة العمولة</th>
              <th className="p-5">إدارة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition">
                <td className="p-5 font-black text-slate-800 dark:text-white flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-primary font-black">{user.name[0]}</div>
                   {user.name}
                </td>
                <td className="p-5">
                   <span className={`px-4 py-1.5 rounded-full text-[10px] font-black border ${user.role === UserRole.ADMIN ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>{user.role}</span>
                </td>
                <td className="p-5">
                  {user.role === UserRole.TECHNICIAN ? (
                    <div className="flex items-center gap-2">
                       <input 
                         type="number" 
                         className="w-16 p-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-600 rounded-lg text-center text-primary font-black"
                         value={user.commissionRate}
                         onChange={(e) => updateCommission(user.id, Number(e.target.value))}
                       />
                       <span className="text-xs font-bold text-slate-400">%</span>
                    </div>
                  ) : <span className="opacity-20">—</span>}
                </td>
                <td className="p-5">
                  {user.id !== currentUser.id && (
                    <button onClick={() => handleDelete(user.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                      <Trash2 size={20} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
