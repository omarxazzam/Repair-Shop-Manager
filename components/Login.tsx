
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { StorageService } from '../services/storage';
import { Lock, User as UserIcon } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const users = StorageService.getUsers();
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
      onLogin(user);
    } else {
      setError('اسم المستخدم أو كلمة المرور غير صحيحة');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-xl border border-slate-200">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
            <Lock size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">تسجيل الدخول</h1>
          <p className="text-slate-500 mt-2">نظام إدارة مركز الصيانة</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">اسم المستخدم</label>
            <div className="relative">
              <UserIcon className="absolute right-3 top-3 text-slate-400" size={20} />
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pr-10 pl-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                placeholder="أدخل اسم المستخدم"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">كلمة المرور</label>
            <div className="relative">
              <Lock className="absolute right-3 top-3 text-slate-400" size={20} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pr-10 pl-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                placeholder="أدخل كلمة المرور"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <button 
            type="submit"
            className="w-full bg-primary hover:bg-blue-700 text-white py-3 rounded-lg font-bold transition-colors shadow-lg shadow-blue-500/30"
          >
            دخول
          </button>
        </form>
      </div>
    </div>
  );
};
