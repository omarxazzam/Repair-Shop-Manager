
import React, { useState, useEffect } from 'react';
import { Ticket, TicketStatus, Customer, User, UserRole, Transaction, TransactionType, InventoryItem } from '../types';
import { StorageService } from '../services/storage';
import { analyzeRepairIssue } from '../services/geminiService';
import { Plus, Search, Printer, Edit2, Clock, Bot, X, Trash2, XCircle, AlertCircle } from 'lucide-react';

interface TicketsProps {
  tickets: Ticket[];
  onUpdate: (tickets: Ticket[]) => void;
  customers: Customer[];
  onUpdateCustomers: (customers: Customer[]) => void;
  transactions: Transaction[];
  onUpdateTransactions: (transactions: Transaction[]) => void;
  inventory: InventoryItem[];
  onUpdateInventory: (items: InventoryItem[]) => void;
  users: User[];
  currentUser: User;
  currency: string;
  shopName: string;
  layout: 'spacious' | 'compact';
  styleClasses: string;
  onAddLog: (action: string, details: string, type: 'CREATE' | 'UPDATE' | 'DELETE' | 'SYSTEM') => void;
}

export const Tickets: React.FC<TicketsProps> = ({ 
  tickets, onUpdate, customers, onUpdateCustomers, 
  transactions, onUpdateTransactions, inventory, onUpdateInventory,
  users, currentUser, currency, shopName, layout, styleClasses, onAddLog 
}) => {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewCustomer, setIsNewCustomer] = useState(true);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  
  // نموذج التذكرة الافتراضي
  const defaultTicket: Partial<Ticket> = {
    customerName: '',
    deviceModel: '',
    serialNumber: '',
    issueDescription: '',
    status: TicketStatus.RECEIVED,
    cost: 0,
    technicianId: currentUser.role === UserRole.TECHNICIAN ? currentUser.id : '',
    usedParts: []
  };

  const [newTicket, setNewTicket] = useState<Partial<Ticket>>(defaultTicket);
  const [newCustPhone, setNewCustPhone] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);

  const technicians = users.filter(u => u.role === UserRole.TECHNICIAN);

  const resetForm = () => {
    setNewTicket({...defaultTicket});
    setNewCustPhone('');
    setSelectedCustomerId('');
    setIsNewCustomer(true);
    setAiSuggestion(null);
  };

  // توليد رقم تذكرة تسلسلي
  const getNextId = () => {
    if (tickets.length === 0) return "1";
    const ids = tickets.map(t => parseInt(String(t.id))).filter(id => !isNaN(id));
    return ids.length > 0 ? (Math.max(...ids) + 1).toString() : (tickets.length + 1).toString();
  };

  // وظيفة الحذف النهائية (Atomic Delete)
  const handleDeleteTicket = (id: any) => {
    if (!id) return;
    const idToDelete = String(id);
    
    if (window.confirm("⚠️ تنبيه: هل أنت متأكد من حذف هذا الجهاز نهائياً؟ سيتم إلغاء التذكرة واسترجاع قطع الغيار.")) {
      const targetTicket = tickets.find(t => String(t.id) === idToDelete);
      if (!targetTicket) return;

      // 1. استرجاع قطع الغيار للمخزن
      if (targetTicket.usedParts && targetTicket.usedParts.length > 0) {
        const nextInv = inventory.map(item => {
          const used = targetTicket.usedParts?.find(up => up.itemId === item.id);
          return used ? { ...item, quantity: item.quantity + used.quantity } : item;
        });
        onUpdateInventory(nextInv);
      }

      // 2. تحديث قائمة التذاكر (حذف العنصر)
      const nextTickets = tickets.filter(t => String(t.id) !== idToDelete);
      onUpdate(nextTickets);

      // 3. التوثيق والإغلاق
      onAddLog('حذف تذكرة', `حذف التذكرة #${idToDelete} للعميل ${targetTicket.customerName}`, 'DELETE');
      setShowForm(false);
      resetForm();
    }
  };

  const handleSaveTicket = () => {
    if (!newTicket.deviceModel || (!isNewCustomer && !selectedCustomerId && !newTicket.id)) {
      alert("يرجى إكمال البيانات الأساسية (الموديل والعميل)");
      return;
    }

    const isEditing = !!newTicket.id;
    let finalCustomerId = selectedCustomerId;
    let finalCustomerName = newTicket.customerName || '';

    // معالجة العميل الجديد
    if (isNewCustomer && !isEditing) {
      if (!newTicket.customerName || !newCustPhone) {
        alert("يرجى إدخال اسم العميل ورقم هاتفه");
        return;
      }
      const newId = StorageService.generateId();
      onUpdateCustomers([...customers, { id: newId, name: newTicket.customerName, phone: newCustPhone, notes: '', totalVisits: 1 }]);
      finalCustomerId = newId;
    } else if (!isEditing) {
      const existing = customers.find(c => c.id === selectedCustomerId);
      finalCustomerName = existing?.name || '';
    }

    const finalTicket: Ticket = {
      id: isEditing ? String(newTicket.id) : getNextId(),
      customerId: finalCustomerId || (newTicket.customerId as string),
      customerName: finalCustomerName || (newTicket.customerName as string),
      deviceModel: newTicket.deviceModel!,
      serialNumber: newTicket.serialNumber || '',
      issueDescription: newTicket.issueDescription || '',
      status: newTicket.status || TicketStatus.RECEIVED,
      technicianId: newTicket.technicianId,
      technicianName: users.find(u => u.id === newTicket.technicianId)?.name || 'غير معين',
      cost: Number(newTicket.cost) || 0,
      partsCost: (newTicket.usedParts || []).reduce((s, p) => s + (p.price * p.quantity), 0),
      paid: newTicket.paid || false,
      createdAt: newTicket.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usedParts: newTicket.usedParts || [],
    };

    if (isEditing) {
      onUpdate(tickets.map(t => String(t.id) === String(finalTicket.id) ? finalTicket : t));
      onAddLog('تعديل تذكرة', `تحديث بيانات التذكرة #${finalTicket.id}`, 'UPDATE');
    } else {
      onUpdate([finalTicket, ...tickets]);
      onAddLog('استلام جهاز', `استلام جهاز ${finalTicket.deviceModel} برقم ${finalTicket.id}`, 'CREATE');
    }
    
    setShowForm(false);
    resetForm();
  };

  const handleEditTicket = (e: React.MouseEvent, ticket: Ticket) => {
    e.stopPropagation();
    setNewTicket({ ...ticket });
    setSelectedCustomerId(ticket.customerId);
    setIsNewCustomer(false);
    setShowForm(true);
  };

  const handleStatusChange = (id: string, status: TicketStatus) => {
    const updated = tickets.map(t => String(t.id) === String(id) ? { ...t, status, updatedAt: new Date().toISOString() } : t);
    onUpdate(updated);
  };

  const handleAddPart = (itemId: string) => {
    const item = inventory.find(i => i.id === itemId);
    if (!item || item.quantity <= 0) return;
    
    const parts = newTicket.usedParts || [];
    const existing = parts.find(p => p.itemId === itemId);
    
    if (existing) {
      setNewTicket({...newTicket, usedParts: parts.map(p => p.itemId === itemId ? {...p, quantity: p.quantity + 1} : p)});
    } else {
      setNewTicket({...newTicket, usedParts: [...parts, { itemId: item.id, name: item.name, quantity: 1, price: item.price }]});
    }
  };

  const handlePrint = (e: React.MouseEvent, ticket: Ticket) => {
    e.stopPropagation();
    alert(`جاري تجهيز الطباعة للتذكرة #${ticket.id}`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">قسم الصيانة</h2>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold shadow-lg hover:scale-105 transition-all">
          <Plus size={20} className="inline ml-2"/> استلام جهاز
        </button>
      </div>

      <div className="relative">
        <Search className="absolute right-3 top-3.5 text-slate-400" size={18} />
        <input 
          type="text" placeholder="بحث باسم العميل أو رقم التذكرة..." 
          className={`w-full pr-10 pl-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-primary ${styleClasses}`}
          value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {tickets.filter(t => t.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || String(t.id).includes(searchTerm)).map(ticket => (
          <div key={ticket.id} className={`${styleClasses} p-5 hover:border-primary border-t-4 border-transparent group transition-all`}>
            <div className="flex justify-between mb-2">
              <span className="bg-primary/10 text-primary px-2 py-1 rounded-lg font-black text-xs">#{ticket.id}</span>
              <div className="flex gap-2">
                <button onClick={(e) => handleEditTicket(e, ticket)} className="text-slate-400 hover:text-blue-500"><Edit2 size={16}/></button>
                <button onClick={(e) => handlePrint(e, ticket)} className="text-slate-400 hover:text-primary"><Printer size={16}/></button>
              </div>
            </div>
            <h4 className="font-bold truncate">{ticket.customerName}</h4>
            <p className="text-primary text-sm font-bold">{ticket.deviceModel}</p>
            <div className="mt-4 pt-4 border-t dark:border-slate-700 flex justify-between items-center">
              <span className="text-[10px] font-bold px-2 py-1 rounded bg-slate-100 dark:bg-slate-700">{ticket.status}</span>
              <span className="font-black text-primary">{ticket.cost} {currency}</span>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-[100]">
          <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-[2rem] p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 border-b dark:border-slate-700 pb-4">
              <h3 className="text-xl font-bold">{newTicket.id ? `تعديل التذكرة #${newTicket.id}` : 'استلام جهاز جديد'}</h3>
              {newTicket.id && (
                <button onClick={() => handleDeleteTicket(newTicket.id)} className="bg-red-500 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-600 transition-colors">
                  <Trash2 size={14} className="inline ml-1"/> حذف نهائياً
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {!newTicket.id && (
                  <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-xl">
                    <button onClick={() => setIsNewCustomer(true)} className={`flex-1 py-2 rounded-lg text-xs font-bold ${isNewCustomer ? 'bg-white shadow text-primary' : ''}`}>عميل جديد</button>
                    <button onClick={() => setIsNewCustomer(false)} className={`flex-1 py-2 rounded-lg text-xs font-bold ${!isNewCustomer ? 'bg-white shadow text-primary' : ''}`}>مسجل</button>
                  </div>
                )}
                
                {isNewCustomer && !newTicket.id ? (
                  <div className="space-y-3">
                    <input type="text" placeholder="اسم العميل" className="w-full p-3 border rounded-xl dark:bg-slate-900 dark:border-slate-700 outline-none focus:border-primary" value={newTicket.customerName} onChange={e => setNewTicket({...newTicket, customerName: e.target.value})} />
                    <input type="text" placeholder="رقم الهاتف" className="w-full p-3 border rounded-xl dark:bg-slate-900 dark:border-slate-700 outline-none focus:border-primary" value={newCustPhone} onChange={e => setNewCustPhone(e.target.value)} />
                  </div>
                ) : !newTicket.id ? (
                  <select className="w-full p-3 border rounded-xl dark:bg-slate-900 dark:border-slate-700 outline-none" value={selectedCustomerId} onChange={e => setSelectedCustomerId(e.target.value)}>
                    <option value="">اختر عميلاً...</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>)}
                  </select>
                ) : <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-xl font-bold">{newTicket.customerName}</div>}

                <input type="text" placeholder="موديل الجهاز (مثال: iPhone 13)" className="w-full p-3 border rounded-xl dark:bg-slate-900 dark:border-slate-700 outline-none" value={newTicket.deviceModel} onChange={e => setNewTicket({...newTicket, deviceModel: e.target.value})} />
                <textarea placeholder="وصف العطل..." className="w-full p-3 border rounded-xl dark:bg-slate-900 dark:border-slate-700 outline-none h-24 resize-none" value={newTicket.issueDescription} onChange={e => setNewTicket({...newTicket, issueDescription: e.target.value})} />
              </div>

              <div className="space-y-4">
                <select className="w-full p-3 border rounded-xl dark:bg-slate-900 dark:border-slate-700 outline-none" onChange={e => handleAddPart(e.target.value)}>
                  <option value="">إضافة قطع غيار من المخزن...</option>
                  {inventory.filter(i => i.quantity > 0).map(i => <option key={i.id} value={i.id}>{i.name} ({i.price} {currency})</option>)}
                </select>
                <div className="border rounded-xl p-3 h-32 overflow-y-auto bg-slate-50 dark:bg-slate-900">
                  <p className="text-[10px] font-bold opacity-40 mb-2">القطع المختارة:</p>
                  {(newTicket.usedParts || []).map(p => (
                    <div key={p.itemId} className="flex justify-between items-center text-xs py-1 border-b dark:border-slate-700 last:border-0">
                      <span>{p.name} (x{p.quantity})</span>
                      <button onClick={() => setNewTicket({...newTicket, usedParts: newTicket.usedParts?.filter(up => up.itemId !== p.itemId)})} className="text-red-400 hover:text-red-600"><X size={12}/></button>
                    </div>
                  ))}
                </div>
                <div>
                  <label className="text-xs font-bold opacity-50 px-1">التكلفة المتفق عليها ({currency})</label>
                  <input type="number" className="w-full p-3 border rounded-xl dark:bg-slate-900 dark:border-slate-700 outline-none font-bold text-primary" value={newTicket.cost} onChange={e => setNewTicket({...newTicket, cost: Number(e.target.value)})} />
                </div>
                <select className="w-full p-3 border rounded-xl dark:bg-slate-900 dark:border-slate-700 outline-none" value={newTicket.technicianId} onChange={e => setNewTicket({...newTicket, technicianId: e.target.value})}>
                  <option value="">تعيين فني مختص...</option>
                  {technicians.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
            </div>

            <div className="flex gap-4 mt-8 pt-6 border-t dark:border-slate-700">
              <button onClick={handleSaveTicket} className="flex-1 bg-primary text-white py-3.5 rounded-2xl font-bold shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all">
                {newTicket.id ? 'حفظ التغييرات' : 'تأكيد الاستلام'}
              </button>
              <button onClick={() => { setShowForm(false); resetForm(); }} className="flex-1 bg-slate-100 dark:bg-slate-700 py-3.5 rounded-2xl font-bold">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
