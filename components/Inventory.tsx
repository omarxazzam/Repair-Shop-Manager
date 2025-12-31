import React, { useState } from 'react';
import { InventoryItem, User, UserRole } from '../types';
import { StorageService } from '../services/storage';
import { Plus, Trash2, AlertTriangle, Package } from 'lucide-react';

interface InventoryProps {
  items: InventoryItem[];
  onUpdate: (items: InventoryItem[]) => void;
  currency: string;
  currentUser: User;
  styleClasses: string;
}

export const Inventory: React.FC<InventoryProps> = ({ items, onUpdate, currency, currentUser, styleClasses }) => {
  const [newItem, setNewItem] = useState<Partial<InventoryItem>>({ name: '', quantity: 0, price: 0, minThreshold: 5 });
  
  const canEdit = currentUser.role !== UserRole.TECHNICIAN;

  const handleAddItem = () => {
    if (!newItem.name) return;
    const item: InventoryItem = {
      id: StorageService.generateId(),
      name: newItem.name,
      quantity: Number(newItem.quantity),
      price: Number(newItem.price),
      minThreshold: Number(newItem.minThreshold),
    };
    onUpdate([...items, item]);
    setNewItem({ name: '', quantity: 0, price: 0, minThreshold: 5 });
  };

  const handleDelete = (id: string) => {
    onUpdate(items.filter(i => i.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    onUpdate(items.map(i => i.id === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i));
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <h2 className="text-3xl font-bold text-slate-800 dark:text-white">إدارة المخزن</h2>
      
      {canEdit && (
        <div className={`${styleClasses} p-8`}>
          <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-6 flex items-center gap-2"><Package size={22} className="text-primary"/> إضافة قطعة جديدة للمخزون</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-end">
            <div className="md:col-span-2 space-y-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest px-1">اسم القطعة</label>
              <input 
                type="text" 
                className="w-full p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                value={newItem.name}
                onChange={e => setNewItem({...newItem, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest px-1">الكمية</label>
              <input 
                type="number" 
                className="w-full p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                value={newItem.quantity}
                onChange={e => setNewItem({...newItem, quantity: Number(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest px-1">السعر ({currency})</label>
              <input 
                type="number" 
                className="w-full p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                value={newItem.price}
                onChange={e => setNewItem({...newItem, price: Number(e.target.value)})}
              />
            </div>
            <button 
              onClick={handleAddItem}
              className="bg-primary text-white p-3.5 rounded-xl hover:bg-primary-dark transition-all flex justify-center items-center shadow-lg shadow-primary/20"
            >
              <Plus size={24} /> <span className="mr-2 font-bold">إضافة</span>
            </button>
          </div>
        </div>
      )}

      <div className={`${styleClasses} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="p-5 font-bold">اسم القطعة</th>
                <th className="p-5 font-bold">السعر الوحدوي</th>
                <th className="p-5 font-bold">الكمية المتاحة</th>
                <th className="p-5 font-bold">الحالة</th>
                {canEdit && <th className="p-5 font-bold">إجراءات</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {items.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition">
                  <td className="p-5 font-bold text-slate-800 dark:text-white">{item.name}</td>
                  <td className="p-5 text-primary font-bold">{item.price} {currency}</td>
                  <td className="p-5">
                    <div className="flex items-center gap-4">
                      {canEdit && <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-primary hover:text-white text-slate-600 dark:text-slate-300 font-bold transition-all">-</button>}
                      <span className="font-black text-lg w-6 text-center">{item.quantity}</span>
                      {canEdit && <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-primary hover:text-white text-slate-600 dark:text-slate-300 font-bold transition-all">+</button>}
                    </div>
                  </td>
                  <td className="p-5">
                    {item.quantity <= item.minThreshold ? (
                      <span className="flex items-center gap-1.5 text-red-500 text-[10px] font-black bg-red-100 dark:bg-red-900/30 px-3 py-1.5 rounded-full w-fit">
                        <AlertTriangle size={14} /> منخفض جداً
                      </span>
                    ) : (
                      <span className="text-emerald-500 text-[10px] font-black bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1.5 rounded-full">متوفر بكثرة</span>
                    )}
                  </td>
                  {canEdit && (
                    <td className="p-5">
                      <button onClick={() => handleDelete(item.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                        <Trash2 size={20} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={canEdit ? 5 : 4} className="p-10 text-center text-slate-400 italic font-medium">لا توجد أي بيانات لعرضها في المخزن</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
