import React, { useState } from 'react';
import { Transaction, TransactionType } from '../types';
import { StorageService } from '../services/storage';
import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';

interface FinanceProps {
  transactions: Transaction[];
  onUpdate: (t: Transaction[]) => void;
  currency: string;
}

export const Finance: React.FC<FinanceProps> = ({ transactions, onUpdate, currency }) => {
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
    setNewTrans({ type: TransactionType.EXPENSE, amount: 0, description: '' });
  };

  const income = transactions.filter(t => t.type === TransactionType.INCOME).reduce((acc, curr) => acc + curr.amount, 0);
  const expense = transactions.filter(t => t.type === TransactionType.EXPENSE).reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">الحسابات والمالية</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-emerald-500 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="opacity-90">إجمالي الإيرادات</span>
            <TrendingUp className="opacity-80" />
          </div>
          <p className="text-3xl font-bold">{income.toLocaleString()} {currency}</p>
        </div>
        <div className="bg-red-500 text-white p-6 rounded-xl shadow-lg">
           <div className="flex items-center justify-between mb-2">
            <span className="opacity-90">إجمالي المصروفات</span>
            <TrendingDown className="opacity-80" />
          </div>
          <p className="text-3xl font-bold">{expense.toLocaleString()} {currency}</p>
        </div>
        <div className="bg-slate-800 text-white p-6 rounded-xl shadow-lg">
           <div className="flex items-center justify-between mb-2">
            <span className="opacity-90">صافي الربح</span>
            <DollarSign className="opacity-80" />
          </div>
          <p className="text-3xl font-bold">{(income - expense).toLocaleString()} {currency}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-700 mb-4">تسجيل معاملة مالية يدوية</h3>
        <div className="flex flex-col md:flex-row gap-4 items-end">
           <div className="flex-1 w-full">
            <label className="block text-xs text-slate-500 mb-1">نوع المعاملة</label>
            <select 
              className="w-full p-2 border rounded bg-white"
              value={newTrans.type}
              onChange={e => setNewTrans({...newTrans, type: e.target.value as TransactionType})}
            >
              <option value={TransactionType.EXPENSE}>مصروف (إيجار، كهرباء...)</option>
              <option value={TransactionType.INCOME}>إيراد إضافي</option>
            </select>
           </div>
           <div className="flex-1 w-full">
            <label className="block text-xs text-slate-500 mb-1">المبلغ ({currency})</label>
            <input 
              type="number" 
              className="w-full p-2 border rounded"
              value={newTrans.amount}
              onChange={e => setNewTrans({...newTrans, amount: Number(e.target.value)})}
            />
           </div>
           <div className="flex-[2] w-full">
            <label className="block text-xs text-slate-500 mb-1">الوصف</label>
            <input 
              type="text" 
              className="w-full p-2 border rounded"
              value={newTrans.description}
              onChange={e => setNewTrans({...newTrans, description: e.target.value})}
            />
           </div>
           <button onClick={handleAdd} className="bg-slate-800 text-white px-6 py-2 rounded hover:bg-slate-700 transition">
             تسجيل
           </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <h3 className="p-4 font-bold text-slate-700 border-b border-slate-100">سجل المعاملات</h3>
        <table className="w-full text-right">
          <thead className="bg-slate-50 text-slate-600 text-sm">
            <tr>
              <th className="p-4">النوع</th>
              <th className="p-4">الوصف</th>
              <th className="p-4">المبلغ</th>
              <th className="p-4">التاريخ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {transactions.map(t => (
              <tr key={t.id} className="hover:bg-slate-50">
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${t.type === TransactionType.INCOME ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {t.type}
                  </span>
                </td>
                <td className="p-4 text-slate-800">{t.description}</td>
                <td className={`p-4 font-bold ${t.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-red-600'}`}>
                  {t.type === TransactionType.INCOME ? '+' : '-'}{t.amount}
                </td>
                <td className="p-4 text-slate-500 text-sm flex items-center gap-1">
                  <Calendar size={14}/> {new Date(t.date).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
