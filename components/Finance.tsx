
import React, { useState } from 'react';
import { Transaction, TransactionType } from '../types';
import { StorageService } from '../services/storage';
import { TrendingUp, TrendingDown, DollarSign, Calendar, PlusCircle } from 'lucide-react';

interface FinanceProps {
  transactions: Transaction[];
  onUpdate: (t: Transaction[]) => void;
  currency: string;
  styleClasses: string;
  onAddLog: (action: string, details: string, type: 'CREATE' | 'UPDATE' | 'DELETE' | 'SYSTEM') => void;
}

export const Finance: React.FC<FinanceProps> = ({ transactions, onUpdate, currency, styleClasses, onAddLog }) => {
  const [newTrans, setNewTrans] = useState<Partial<Transaction>>({ type: TransactionType.EXPENSE, amount: 0, description: '' });

  const handleAdd = () => {
    if (!newTrans.amount || !newTrans.description) return;
    const trans: Transaction = {
      id: StorageService.generateId(),
      type: newTrans.type!,
      amount: Number(newTrans.amount),
      description: newTrans.description,
      date: new Date().toISOString(),
    };
    onUpdate([trans, ...transactions]);
    onAddLog('تسجيل معاملة مالية', `تم تسجيل ${newTrans.type} بمبلغ ${newTrans.amount} ${currency}: ${newTrans.description}`, 'CREATE');
    setNewTrans({ type: TransactionType.EXPENSE, amount: 0, description: '' });
  };

  const income = transactions.filter(t => t.type === TransactionType.INCOME).reduce((acc, curr) => acc + curr.amount, 0);
  const expense = transactions.filter(t => t.type === TransactionType.EXPENSE || t.type === TransactionType.COMMISSION).reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-8 animate-fade-in">
      <h2 className="text-3xl font-bold text-slate-800 dark:text-white">الحسابات والمالية</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className={`${styleClasses} p-8 flex items-center justify-between overflow-hidden relative group`}>
           <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-500/10 rounded-full -mr-12 -mt-12 transition-all group-hover:scale-150"></div>
           <div>
              <p className="text-xs font-black text-emerald-500 uppercase tracking-widest mb-2">إجمالي الإيرادات</p>
              <p className="text-4xl font-black text-slate-800 dark:text-white">{income.toLocaleString()} <span className="text-sm font-normal opacity-50">{currency}</span></p>
           </div>
           <div className="bg-emerald-500 p-4 rounded-2xl text-white shadow-lg shadow-emerald-500/20"><TrendingUp size={28}/></div>
        </div>
        
        <div className={`${styleClasses} p-8 flex items-center justify-between overflow-hidden relative group`}>
           <div className="absolute right-0 top-0 w-24 h-24 bg-red-500/10 rounded-full -mr-12 -mt-12 transition-all group-hover:scale-150"></div>
           <div>
              <p className="text-xs font-black text-red-500 uppercase tracking-widest mb-2">إجمالي المصروفات</p>
              <p className="text-4xl font-black text-slate-800 dark:text-white">{expense.toLocaleString()} <span className="text-sm font-normal opacity-50">{currency}</span></p>
           </div>
           <div className="bg-red-500 p-4 rounded-2xl text-white shadow-lg shadow-red-500/20"><TrendingDown size={28}/></div>
        </div>

        <div className={`${styleClasses} p-8 flex items-center justify-between overflow-hidden relative group border-2 border-primary/20`}>
           <div className="absolute right-0 top-0 w-24 h-24 bg-primary/10 rounded-full -mr-12 -mt-12 transition-all group-hover:scale-150"></div>
           <div>
              <p className="text-xs font-black text-primary uppercase tracking-widest mb-2">صافي الربح</p>
              <p className="text-4xl font-black text-slate-800 dark:text-white">{(income - expense).toLocaleString()} <span className="text-sm font-normal opacity-50">{currency}</span></p>
           </div>
           <div className="bg-primary p-4 rounded-2xl text-white shadow-lg shadow-primary/20"><DollarSign size={28}/></div>
        </div>
      </div>

      <div className={`${styleClasses} p-8`}>
        <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-6 flex items-center gap-2">
          <PlusCircle size={22} className="text-primary"/> تسجيل معاملة مالية يدوية
        </h3>
        <div className="flex flex-col md:flex-row gap-6 items-end">
           <div className="flex-1 w-full space-y-2">
            <label className="block text-xs font-bold text-slate-400 px-1 uppercase tracking-widest">نوع المعاملة</label>
            <select 
              className="w-full p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary font-bold"
              value={newTrans.type}
              onChange={e => setNewTrans({...newTrans, type: e.target.value as TransactionType})}
            >
              <option value={TransactionType.EXPENSE}>مصروف (إيجار، كهرباء، رواتب)</option>
              <option value={TransactionType.INCOME}>إيراد إضافي (مبيعات، خدمات)</option>
            </select>
           </div>
           <div className="w-48 space-y-2">
            <label className="block text-xs font-bold text-slate-400 px-1 uppercase tracking-widest">المبلغ</label>
            <input 
              type="number" 
              className="w-full p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary font-bold text-primary"
              value={newTrans.amount}
              onChange={e => setNewTrans({...newTrans, amount: Number(e.target.value)})}
            />
           </div>
           <div className="flex-[2] w-full space-y-2">
            <label className="block text-xs font-bold text-slate-400 px-1 uppercase tracking-widest">التفاصيل والوصف</label>
            <input 
              type="text" 
              className="w-full p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary"
              value={newTrans.description}
              onChange={e => setNewTrans({...newTrans, description: e.target.value})}
              placeholder="مثال: فاتورة كهرباء شهر يوليو"
            />
           </div>
           <button onClick={handleAdd} className="bg-primary text-white px-10 py-3.5 rounded-xl font-black hover:bg-primary-dark transition shadow-xl shadow-primary/20">
             تسجيل المعاملة
           </button>
        </div>
      </div>

      <div className={`${styleClasses} overflow-hidden`}>
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
          <h3 className="font-bold text-slate-800 dark:text-white">سجل المعاملات والعمليات</h3>
        </div>
        <table className="w-full text-right">
          <thead className="bg-slate-50/30 dark:bg-slate-900/30 text-slate-500 text-[10px] uppercase font-bold tracking-widest">
            <tr>
              <th className="p-5">التصنيف</th>
              <th className="p-5">بيان المعاملة</th>
              <th className="p-5">المبلغ المالي</th>
              <th className="p-5">تاريخ القيد</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {transactions.map(t => (
              <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition">
                <td className="p-5">
                  <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-tight ${t.type === TransactionType.INCOME ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                    {t.type}
                  </span>
                </td>
                <td className="p-5 text-slate-800 dark:text-slate-200 font-medium">{t.description}</td>
                <td className={`p-5 font-black text-lg ${t.type === TransactionType.INCOME ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                  {t.type === TransactionType.INCOME ? '+' : '-'}{t.amount.toLocaleString()}
                </td>
                <td className="p-5 text-slate-400 text-xs flex items-center gap-1.5">
                  <Calendar size={14}/> {new Date(t.date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
