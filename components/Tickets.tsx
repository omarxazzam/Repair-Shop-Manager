
import React, { useState } from 'react';
import { Ticket, TicketStatus, Customer, User, UserRole, Transaction, TransactionType, InventoryItem, UsedPart } from '../types';
import { StorageService } from '../services/storage';
import { analyzeRepairIssue } from '../services/geminiService';
import { Plus, Search, Printer, Edit2, CheckCircle, Clock, AlertCircle, Bot, User as UserIcon, UserPlus, Package, X } from 'lucide-react';

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
}

export const Tickets: React.FC<TicketsProps> = ({ 
  tickets, onUpdate, customers, onUpdateCustomers, 
  transactions, onUpdateTransactions, inventory, onUpdateInventory,
  users, currentUser, currency, shopName, layout, styleClasses 
}) => {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewCustomer, setIsNewCustomer] = useState(true);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  
  const [newTicket, setNewTicket] = useState<Partial<Ticket>>({
    customerName: '',
    deviceModel: '',
    serialNumber: '',
    issueDescription: '',
    status: TicketStatus.RECEIVED,
    cost: 0,
    technicianId: currentUser.role === UserRole.TECHNICIAN ? currentUser.id : '',
    usedParts: []
  });
  
  const [newCustPhone, setNewCustPhone] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);

  const technicians = users.filter(u => u.role === UserRole.TECHNICIAN);

  const handleAiAnalyze = async () => {
    if (!newTicket.deviceModel || !newTicket.issueDescription) {
      alert("يرجى إدخال موديل الجهاز ووصف المشكلة أولاً");
      return;
    }
    setAiLoading(true);
    try {
      const result = await analyzeRepairIssue(newTicket.deviceModel, newTicket.issueDescription);
      setAiSuggestion(result);
    } catch (error) {
      console.error("AI Analysis failed:", error);
    } finally {
      setAiLoading(false);
    }
  };

  const handleAddPart = (itemId: string) => {
    const item = inventory.find(i => i.id === itemId);
    if (!item || item.quantity <= 0) {
      alert("هذه القطعة غير متوفرة في المخزن");
      return;
    }

    const currentParts = newTicket.usedParts || [];
    const existing = currentParts.find(p => p.itemId === itemId);
    
    if (existing) {
      if (existing.quantity >= item.quantity) {
        alert("لا يمكن تجاوز الكمية المتوفرة في المخزن");
        return;
      }
      setNewTicket({
        ...newTicket,
        usedParts: currentParts.map(p => p.itemId === itemId ? { ...p, quantity: p.quantity + 1 } : p)
      });
    } else {
      setNewTicket({
        ...newTicket,
        usedParts: [...currentParts, { itemId: item.id, name: item.name, quantity: 1, price: item.price }]
      });
    }
  };

  const handleRemovePart = (itemId: string) => {
    setNewTicket({
      ...newTicket,
      usedParts: (newTicket.usedParts || []).filter(p => p.itemId !== itemId)
    });
  };

  const calculatePartsCost = () => {
    return (newTicket.usedParts || []).reduce((sum, p) => sum + (p.price * p.quantity), 0);
  };

  const handleSaveTicket = () => {
    const isEditing = !!newTicket.id;
    const oldTicket = isEditing ? tickets.find(t => t.id === newTicket.id) : null;
    
    let finalCustomerId = selectedCustomerId;
    let finalCustomerName = '';

    if (isNewCustomer && !isEditing) {
      if (!newTicket.customerName || !newCustPhone) return;
      const newId = StorageService.generateId();
      const newCust: Customer = { id: newId, name: newTicket.customerName, phone: newCustPhone, notes: '', totalVisits: 1 };
      onUpdateCustomers([...customers, newCust]);
      finalCustomerId = newId;
      finalCustomerName = newCust.name;
    } else if (!isEditing) {
      const existing = customers.find(c => c.id === selectedCustomerId);
      if (!existing) return;
      finalCustomerName = existing.name;
      onUpdateCustomers(customers.map(c => c.id === selectedCustomerId ? {...c, totalVisits: c.totalVisits + 1} : c));
    } else {
      finalCustomerId = newTicket.customerId || selectedCustomerId;
      finalCustomerName = newTicket.customerName || '';
    }

    const assignedTech = users.find(u => u.id === newTicket.technicianId);
    
    let updatedInventory = [...inventory];
    if (oldTicket && oldTicket.usedParts) {
      oldTicket.usedParts.forEach(oldPart => {
        updatedInventory = updatedInventory.map(item => 
          item.id === oldPart.itemId ? { ...item, quantity: item.quantity + oldPart.quantity } : item
        );
      });
    }

    const newUsedParts = newTicket.usedParts || [];
    let stockError = false;
    newUsedParts.forEach(newPart => {
      const invItem = updatedInventory.find(i => i.id === newPart.itemId);
      if (invItem && invItem.quantity >= newPart.quantity) {
        updatedInventory = updatedInventory.map(item => 
          item.id === newPart.itemId ? { ...item, quantity: item.quantity - newPart.quantity } : item
        );
      } else {
        stockError = true;
      }
    });

    if (stockError) {
      alert("عذراً، بعض القطع المختارة لم تعد متوفرة بالكمية المطلوبة.");
      return;
    }

    const finalTicketData: Ticket = {
      id: newTicket.id || StorageService.generateId(),
      customerId: finalCustomerId,
      customerName: finalCustomerName,
      deviceModel: newTicket.deviceModel!,
      serialNumber: newTicket.serialNumber || '',
      issueDescription: newTicket.issueDescription || '',
      status: newTicket.status || TicketStatus.RECEIVED,
      technicianId: newTicket.technicianId,
      technicianName: assignedTech ? assignedTech.name : 'غير معين',
      cost: newTicket.cost || 0,
      partsCost: calculatePartsCost(),
      paid: newTicket.paid || false,
      createdAt: newTicket.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      aiDiagnosis: aiSuggestion || newTicket.aiDiagnosis,
      usedParts: newUsedParts,
    };

    if (isEditing) {
      onUpdate(tickets.map(t => t.id === finalTicketData.id ? finalTicketData : t));
    } else {
      onUpdate([finalTicketData, ...tickets]);
    }
    
    onUpdateInventory(updatedInventory);
    setShowForm(false);
    resetForm();
  };

  const handleEditTicket = (ticket: Ticket) => {
    setNewTicket({ ...ticket });
    setAiSuggestion(ticket.aiDiagnosis || null);
    setSelectedCustomerId(ticket.customerId);
    setIsNewCustomer(false);
    setShowForm(true);
  };

  const resetForm = () => {
    setNewTicket({ 
      customerName: '', deviceModel: '', serialNumber: '', issueDescription: '', status: TicketStatus.RECEIVED, cost: 0, 
      technicianId: currentUser.role === UserRole.TECHNICIAN ? currentUser.id : '',
      usedParts: []
    });
    setNewCustPhone(''); setSelectedCustomerId(''); setIsNewCustomer(true); setAiSuggestion(null);
  };

  const handleStatusChange = (id: string, newStatus: TicketStatus) => {
    const updated = tickets.map(t => {
      if (t.id === id) {
        let update = { ...t, status: newStatus, updatedAt: new Date().toISOString() };
        if (newStatus === TicketStatus.DELIVERED && !t.commissionCalculated && t.technicianId && t.cost > 0) {
          const tech = users.find(u => u.id === t.technicianId);
          if (tech && tech.commissionRate) {
            const incomeTrans: Transaction = { id: StorageService.generateId(), type: TransactionType.INCOME, amount: t.cost, description: `تذكرة #${t.id}`, date: new Date().toISOString(), relatedTicketId: t.id };
            const commTrans: Transaction = { id: StorageService.generateId(), type: TransactionType.COMMISSION, amount: (t.cost * tech.commissionRate) / 100, description: `عمولة #${t.id}`, date: new Date().toISOString(), relatedTicketId: t.id, relatedTechnicianId: tech.id };
            onUpdateTransactions([incomeTrans, commTrans, ...transactions]);
            update.commissionCalculated = true;
            update.paid = true;
          }
        }
        return update;
      }
      return t;
    });
    onUpdate(updated);
  };

  const getStatusColor = (status: TicketStatus) => {
    switch (status) {
      case TicketStatus.RECEIVED: return 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300';
      case TicketStatus.READY: return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400';
      case TicketStatus.DELIVERED: return 'bg-gray-100 dark:bg-slate-800 text-gray-500';
      default: return 'bg-primary/10 text-primary';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">قسم الصيانة</h2>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="bg-primary text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all">
          <Plus size={20} /> استلام جهاز
        </button>
      </div>

      <div className="relative">
        <Search className="absolute right-3 top-3.5 text-slate-400" size={18} />
        <input 
          type="text" placeholder="بحث باسم العميل أو الموديل..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          className={`w-full pr-10 pl-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none transition-all ${styleClasses}`}
        />
      </div>

      <div className={`grid gap-5 ${layout === 'compact' ? 'grid-cols-1 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
        {tickets.filter(t => t.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || t.deviceModel.toLowerCase().includes(searchTerm.toLowerCase())).map(ticket => (
          <div key={ticket.id} className={`${styleClasses} ${layout === 'compact' ? 'p-3' : 'p-5'}`}>
            <div className="flex justify-between items-start mb-3">
              <span className="font-bold text-primary text-[10px] tracking-widest">#{ticket.id}</span>
              <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${getStatusColor(ticket.status)}`}>{ticket.status}</span>
            </div>
            <div className={`space-y-1.5 text-slate-600 dark:text-slate-300 ${layout === 'compact' ? 'text-xs' : 'text-sm'}`}>
              <div className="flex justify-between items-center">
                <p className="font-bold text-slate-900 dark:text-white truncate flex-1">{ticket.customerName}</p>
                <button onClick={() => handleEditTicket(ticket)} className="text-slate-400 hover:text-primary p-1 transition-colors">
                  <Edit2 size={14} />
                </button>
              </div>
              <p className="opacity-70 truncate">{ticket.deviceModel}</p>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/50">
                <p className="text-[10px] text-slate-400 flex items-center gap-1"><Clock size={10}/> {new Date(ticket.createdAt).toLocaleDateString()}</p>
                <p className="text-[10px] font-medium text-slate-500">{ticket.technicianName}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <select 
                value={ticket.status} onChange={(e) => handleStatusChange(ticket.id, e.target.value as TicketStatus)}
                className="bg-slate-100 dark:bg-slate-700 border-none text-[9px] rounded-md p-1.5 outline-none font-bold"
              >
                {Object.values(TicketStatus).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <div className="text-left">
                <span className="font-bold text-primary text-sm">{ticket.cost} {currency}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className={`bg-white dark:bg-slate-800 rounded-3xl p-8 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto ${styleClasses}`}>
            <h3 className="text-2xl font-bold mb-8 text-slate-800 dark:text-white flex items-center gap-3">
               <div className="p-2 bg-primary/10 rounded-xl text-primary">
                 {newTicket.id ? <Edit2 size={22}/> : <Plus size={22}/>}
               </div>
               {newTicket.id ? 'تحديث بيانات التذكرة' : 'استلام جهاز جديد'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-5">
                {!newTicket.id && (
                  <div className="flex bg-slate-100 dark:bg-slate-700 p-1.5 rounded-xl">
                      <button onClick={() => setIsNewCustomer(true)} className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${isNewCustomer ? 'bg-white dark:bg-slate-600 shadow-sm text-primary' : 'text-slate-500'}`}>عميل جديد</button>
                      <button onClick={() => setIsNewCustomer(false)} className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${!isNewCustomer ? 'bg-white dark:bg-slate-600 shadow-sm text-primary' : 'text-slate-500'}`}>عميل مسجل</button>
                  </div>
                )}
                
                {(isNewCustomer && !newTicket.id) ? (
                  <div className="space-y-4">
                    <input type="text" placeholder="اسم العميل الرباعي" className={`w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-primary dark:bg-slate-900 dark:border-slate-700 text-sm`} value={newTicket.customerName} onChange={e => setNewTicket({...newTicket, customerName: e.target.value})} />
                    <input type="text" placeholder="رقم الموبايل" className={`w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-primary dark:bg-slate-900 dark:border-slate-700 text-sm`} value={newCustPhone} onChange={e => setNewCustPhone(e.target.value)} />
                  </div>
                ) : !newTicket.id ? (
                  <select className={`w-full p-3 border rounded-xl outline-none dark:bg-slate-900 dark:border-slate-700 text-sm`} value={selectedCustomerId} onChange={e => setSelectedCustomerId(e.target.value)}>
                      <option value="">اختر عميلاً من القائمة...</option>
                      {customers.map(c => <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>)}
                  </select>
                ) : (
                  <div className="p-3 bg-slate-50 dark:bg-slate-700/30 rounded-xl text-sm border border-slate-100 dark:border-slate-700">
                    <span className="text-[10px] text-slate-500 block mb-1">اسم العميل:</span>
                    <span className="font-bold">{newTicket.customerName}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="الموديل" className="w-full p-3 border dark:bg-slate-900 dark:border-slate-700 rounded-xl outline-none text-sm" value={newTicket.deviceModel} onChange={e => setNewTicket({...newTicket, deviceModel: e.target.value})} />
                  <input type="text" placeholder="IMEI" className="w-full p-3 border dark:bg-slate-900 dark:border-slate-700 rounded-xl outline-none text-sm" value={newTicket.serialNumber} onChange={e => setNewTicket({...newTicket, serialNumber: e.target.value})} />
                </div>
                
                <textarea 
                  placeholder="وصف العطل بالتفصيل" 
                  className="w-full p-3 border dark:bg-slate-900 dark:border-slate-700 rounded-xl outline-none h-24 text-sm resize-none" 
                  value={newTicket.issueDescription} 
                  onChange={e => setNewTicket({...newTicket, issueDescription: e.target.value})} 
                />
                
                <button type="button" onClick={handleAiAnalyze} disabled={aiLoading} className="w-full flex items-center justify-center gap-2 text-xs font-bold text-primary bg-primary/10 p-3 rounded-xl hover:bg-primary/20 transition-all disabled:opacity-50">
                  {aiLoading ? "جاري التحليل..." : <><Bot size={16}/> المساعد الذكي</>}
                </button>
              </div>

              <div className="space-y-5">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">القطع والتكاليف</h4>
                <select 
                  className="w-full p-3 border dark:bg-slate-900 dark:border-slate-700 rounded-xl outline-none text-sm"
                  onChange={(e) => { if (e.target.value) { handleAddPart(e.target.value); e.target.value = ''; } }}
                >
                  <option value="">إضافة قطعة من المخزن...</option>
                  {inventory.filter(i => i.quantity > 0).map(item => (
                    <option key={item.id} value={item.id}>{item.name} ({item.price} {currency})</option>
                  ))}
                </select>

                <div className="border dark:border-slate-700 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-900/50 min-h-[140px]">
                  <table className="w-full text-[11px]">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500">
                      <tr><th className="p-2 text-right">القطعة</th><th className="p-2">الكمية</th><th className="p-2 text-left"></th></tr>
                    </thead>
                    <tbody className="divide-y dark:divide-slate-700">
                      {(newTicket.usedParts || []).map(part => (
                        <tr key={part.itemId}>
                          <td className="p-2 font-bold">{part.name}</td>
                          <td className="p-2 text-center">{part.quantity}</td>
                          <td className="p-2 text-left"><button onClick={() => handleRemovePart(part.itemId)} className="text-red-400"><X size={14}/></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1 px-1">السعر المتفق عليه</label>
                    <input type="number" className="w-full p-3 border dark:bg-slate-900 dark:border-slate-700 rounded-xl outline-none text-sm font-bold text-primary" value={newTicket.cost} onChange={e => setNewTicket({...newTicket, cost: Number(e.target.value)})} />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1 px-1">الفني المختص</label>
                    <select className="w-full p-3 border dark:bg-slate-900 dark:border-slate-700 rounded-xl outline-none text-sm" value={newTicket.technicianId} onChange={e => setNewTicket({...newTicket, technicianId: e.target.value})}>
                        <option value="">غير محدد</option>
                        {technicians.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-10 pt-6 border-t dark:border-slate-700">
                <button onClick={handleSaveTicket} className="flex-[2] bg-primary text-white py-4 rounded-2xl font-bold shadow-xl shadow-primary/30 hover:bg-primary/90 transition-all text-lg">
                  {newTicket.id ? 'تحديث البيانات' : 'تأكيد الاستلام'}
                </button>
                <button onClick={() => { setShowForm(false); resetForm(); }} className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 py-4 rounded-2xl font-bold transition-all">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
