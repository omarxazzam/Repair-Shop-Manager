import React, { useState } from 'react';
import { InventoryItem, User, UserRole } from '../types';
import { StorageService } from '../services/storage';
import { Plus, Trash2, AlertTriangle, Package } from 'lucide-react';

interface InventoryProps {
  items: InventoryItem[];
  onUpdate: (items: InventoryItem[]) => void;
  currency: string;
  currentUser: User;
}

export const Inventory: React.FC<InventoryProps> = ({ items, onUpdate, currency, currentUser }) => {
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
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">إدارة المخزن</h2>
      
      {/* Add New Item - Only for Admin/Manager */}
      {canEdit && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2"><Package size={20}/> إضافة قطعة جديدة</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div className="md:col-span-2">
              <label className="block text-xs text-slate-500 mb-1">اسم القطعة</label>
              <input 
                type="text" 
                className="w-full p-2 border rounded focus:ring-2 focus:ring-primary outline-none"
                value={newItem.name}
                onChange={e => setNewItem({...newItem, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">الكمية</label>
              <input 
                type="number" 
                className="w-full p-2 border rounded focus:ring-2 focus:ring-primary outline-none"
                value={newItem.quantity}
                onChange={e => setNewItem({...newItem, quantity: Number(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">السعر ({currency})</label>
              <input 
                type="number" 
                className="w-full p-2 border rounded focus:ring-2 focus:ring-primary outline-none"
                value={newItem.price}
                onChange={e => setNewItem({...newItem, price: Number(e.target.value)})}
              />
            </div>
            <button 
              onClick={handleAddItem}
              className="bg-primary text-white p-2 rounded hover:bg-blue-700 transition flex justify-center items-center"
            >
              <Plus size={20} /> <span className="mr-2 md:hidden">إضافة</span>
            </button>
          </div>
        </div>
      )}

      {/* Inventory List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-slate-50 text-slate-600 text-sm">
            <tr>
              <th className="p-4 font-semibold">اسم القطعة</th>
              <th className="p-4 font-semibold">السعر</th>
              <th className="p-4 font-semibold">الكمية</th>
              <th className="p-4 font-semibold">الحالة</th>
              {canEdit && <th className="p-4 font-semibold">إجراءات</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map(item => (
              <tr key={item.id} className="hover:bg-slate-50 transition">
                <td className="p-4 font-medium text-slate-800">{item.name}</td>
                <td className="p-4 text-slate-600">{item.price} {currency}</td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    {canEdit && <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 rounded bg-slate-200 hover:bg-slate-300 text-slate-600">-</button>}
                    <span className="font-bold w-8 text-center">{item.quantity}</span>
                    {canEdit && <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 rounded bg-slate-200 hover:bg-slate-300 text-slate-600">+</button>}
                  </div>
                </td>
                <td className="p-4">
                  {item.quantity <= item.minThreshold ? (
                    <span className="flex items-center gap-1 text-red-500 text-xs font-bold bg-red-50 px-2 py-1 rounded-full w-fit">
                      <AlertTriangle size={12} /> منخفض
                    </span>
                  ) : (
                    <span className="text-emerald-500 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-full">متوفر</span>
                  )}
                </td>
                {canEdit && (
                  <td className="p-4">
                    <button onClick={() => handleDelete(item.id)} className="text-red-400 hover:text-red-600 transition">
                      <Trash2 size={18} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={canEdit ? 5 : 4} className="p-8 text-center text-slate-400">لا توجد قطع في المخزن حالياً</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
