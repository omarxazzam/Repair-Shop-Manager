import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { StorageService } from '../services/storage';
import { Plus, Trash2, UserCog, Shield } from 'lucide-react';

interface UsersProps {
  users: User[];
  onUpdate: (users: User[]) => void;
  currentUser: User;
}

export const Users: React.FC<UsersProps> = ({ users, onUpdate, currentUser }) => {
  const [newUser, setNewUser] = useState<Partial<User>>({ name: '', username: '', password: '', role: UserRole.TECHNICIAN });

  const handleAddUser = () => {
    if (!newUser.name || !newUser.username || !newUser.password) return;
    
    const user: User = {
      id: StorageService.generateId(),
      name: newUser.name,
      username: newUser.username,
      password: newUser.password,
      role: newUser.role || UserRole.TECHNICIAN,
    };

    onUpdate([...users, user]);
    setNewUser({ name: '', username: '', password: '', role: UserRole.TECHNICIAN });
  };

  const handleDelete = (id: string) => {
    if (id === currentUser.id) {
      alert("لا يمكنك حذف حسابك الحالي");
      return;
    }
    onUpdate(users.filter(u => u.id !== id));
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN: return 'مدير النظام (Admin)';
      case UserRole.MANAGER: return 'مسؤول (Manager)';
      case UserRole.TECHNICIAN: return 'فني صيانة';
      default: return role;
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN: return 'bg-purple-100 text-purple-700';
      case UserRole.MANAGER: return 'bg-blue-100 text-blue-700';
      case UserRole.TECHNICIAN: return 'bg-slate-100 text-slate-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">إدارة المستخدمين والفنيين</h2>

      {/* Add User Form */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <UserCog size={20}/> إضافة مستخدم جديد
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div className="lg:col-span-1">
            <label className="block text-xs text-slate-500 mb-1">الاسم الكامل</label>
            <input 
              type="text" 
              className="w-full p-2 border rounded focus:ring-2 focus:ring-primary outline-none"
              value={newUser.name}
              onChange={e => setNewUser({...newUser, name: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">اسم الدخول</label>
            <input 
              type="text" 
              className="w-full p-2 border rounded focus:ring-2 focus:ring-primary outline-none"
              value={newUser.username}
              onChange={e => setNewUser({...newUser, username: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">كلمة المرور</label>
            <input 
              type="text" 
              className="w-full p-2 border rounded focus:ring-2 focus:ring-primary outline-none"
              value={newUser.password}
              onChange={e => setNewUser({...newUser, password: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">الصلاحية</label>
            <select 
              className="w-full p-2 border rounded focus:ring-2 focus:ring-primary outline-none bg-white"
              value={newUser.role}
              onChange={e => setNewUser({...newUser, role: e.target.value as UserRole})}
            >
              <option value={UserRole.TECHNICIAN}>فني صيانة</option>
              <option value={UserRole.MANAGER}>مسؤول / مشرف</option>
              <option value={UserRole.ADMIN}>مدير نظام (Admin)</option>
            </select>
          </div>
          <button 
            onClick={handleAddUser}
            className="bg-primary text-white p-2 rounded hover:bg-blue-700 transition flex justify-center items-center"
          >
            <Plus size={20} /> <span className="mr-2 md:hidden">إضافة</span>
          </button>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-slate-50 text-slate-600 text-sm">
            <tr>
              <th className="p-4 font-semibold">الاسم</th>
              <th className="p-4 font-semibold">اسم الدخول</th>
              <th className="p-4 font-semibold">الصلاحية</th>
              <th className="p-4 font-semibold">كلمة المرور</th>
              <th className="p-4 font-semibold">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-slate-50 transition">
                <td className="p-4 font-bold text-slate-800 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                    <UserCog size={16} />
                  </div>
                  {user.name}
                </td>
                <td className="p-4 text-slate-600 font-mono">{user.username}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit ${getRoleColor(user.role)}`}>
                    {user.role === UserRole.ADMIN && <Shield size={12}/>}
                    {getRoleLabel(user.role)}
                  </span>
                </td>
                <td className="p-4 text-slate-400 font-mono">****</td>
                <td className="p-4">
                  {user.id !== currentUser.id && (
                    <button onClick={() => handleDelete(user.id)} className="text-red-400 hover:text-red-600 transition p-2 rounded hover:bg-red-50">
                      <Trash2 size={18} />
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
