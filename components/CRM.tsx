
import React, { useState } from 'react';
import { Customer, Ticket } from '../types';
import { StorageService } from '../services/storage';
import { User, Phone, FileText, History, Star, UserPlus, Edit2, Trash2, X, Save, Mail, AlertTriangle, Check } from 'lucide-react';

interface CRMProps {
  customers: Customer[];
  onUpdateCustomers: (customers: Customer[]) => void;
  tickets: Ticket[];
  styleClasses: string;
  onAddLog: (action: string, details: string, type: 'CREATE' | 'UPDATE' | 'DELETE' | 'SYSTEM') => void;
}

export const CRM: React.FC<CRMProps> = ({ customers, onUpdateCustomers, tickets, styleClasses, onAddLog }) => {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState<Partial<Customer>>({ name: '', phone: '', email: '', notes: '' });

  const getCustomerHistory = (customerId: string) => {
    return tickets.filter(t => t.customerId === customerId);
  };

  const handleOpenForm = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({ ...customer });
    } else {
      setEditingCustomer(null);
      setFormData({ name: '', phone: '', email: '', notes: '' });
    }
    setShowForm(true);
  };

  const handleSaveCustomer = () => {
    if (!formData.name || !formData.phone) {
      alert("يرجى إدخال الاسم ورقم الهاتف على الأقل");
      return;
    }

    if (editingCustomer) {
      const updated = customers.map(c => c.id === editingCustomer.id ? { ...c, ...formData } : c);
      onUpdateCustomers(updated);
      setSelectedCustomer({ ...editingCustomer, ...formData } as Customer);
      onAddLog('تعديل بيانات عميل', `تم تعديل بيانات العميل: ${formData.name}`, 'UPDATE');
    } else {
      const newCustomer: Customer = {
        id: StorageService.generateId(),
        name: formData.name!,
        phone: formData.phone!,
        email: formData.email,
        notes: formData.notes || '',
        totalVisits: 0
      };
      onUpdateCustomers([...customers, newCustomer]);
      onAddLog('إضافة عميل جديد', `تم تسجيل العميل الجديد: ${formData.name}`, 'CREATE');
    }
    setShowForm(false);
  };

  const confirmDelete = () => {
    if (selectedCustomer) {
      const name = selectedCustomer.name;
      const updatedList = customers.filter(c => c.id !== selectedCustomer.id);
      onUpdateCustomers(updatedList);
      onAddLog('حذف عميل', `تم حذف ملف العميل: ${name}`, 'DELETE');
      setSelectedCustomer(null);
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-160px)] gap-8 animate-fade-in relative">
      {/* Customer List */}
      <div className={`${styleClasses} w-full lg:w-1/3 flex flex-col overflow-hidden`}>
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center">
          <h2 className="font-bold text-slate-800 dark:text-white flex items-center gap-2"><User size={20}/> العملاء</h2>
          <button 
            onClick={() => handleOpenForm()}
            className="p-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors shadow-md shadow-primary/20"
          >
            <UserPlus size={18} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-4 space-y-3">
          {customers.map(c => (
            <div 
              key={c.id} 
              onClick={() => { setSelectedCustomer(c); setIsDeleting(false); }}
              className={`p-5 rounded-2xl cursor-pointer border-2 transition-all ${selectedCustomer?.id === c.id ? 'border-primary bg-primary/10 shadow-lg' : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl ${selectedCustomer?.id === c.id ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                  {c.name[0]}
                </div>
                <div className="flex-1 overflow-hidden">
                  <h3 className="font-bold text-slate-800 dark:text-white truncate">{c.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1"><Phone size={12}/> {c.phone}</p>
                </div>
                {c.totalVisits > 2 && <Star size={16} className="text-amber-400 fill-amber-400" />}
              </div>
            </div>
          ))}
          {customers.length === 0 && (
            <div className="p-10 text-center opacity-30 italic font-medium">لا يوجد عملاء مسجلين حالياً</div>
          )}
        </div>
      </div>

      {/* Customer Details */}
      <div className={`${styleClasses} w-full lg:w-2/3 flex flex-col overflow-hidden relative`}>
        {selectedCustomer ? (
          <div className="h-full flex flex-col">
            <div className="p-8 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex flex-wrap justify-between items-center gap-4 relative">
               
               {/* Delete Confirmation Overlay */}
               {isDeleting && (
                 <div className="absolute inset-0 bg-red-600 z-20 flex items-center justify-between px-8 text-white animate-fade-in">
                    <div className="flex items-center gap-4">
                      <AlertTriangle size={32} className="animate-pulse" />
                      <div>
                        <p className="font-black text-lg">هل أنت متأكد من حذف هذا العميل؟</p>
                        <p className="text-xs opacity-80 uppercase font-bold">سيتم تسجيل هذه العملية في النظام</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                       <button onClick={confirmDelete} className="bg-white text-red-600 px-6 py-2 rounded-xl font-black hover:bg-red-50 transition-all flex items-center gap-2">
                         <Check size={18}/> نعم، احذف
                       </button>
                       <button onClick={() => setIsDeleting(false)} className="bg-red-800/50 text-white px-6 py-2 rounded-xl font-black hover:bg-red-800 transition-all">
                         إلغاء
                       </button>
                    </div>
                 </div>
               )}

               <div className="flex items-center gap-6">
                 <div className="w-20 h-20 rounded-3xl bg-primary text-white flex items-center justify-center text-4xl font-black shadow-xl shadow-primary/30">{selectedCustomer.name[0]}</div>
                 <div>
                   <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-1">{selectedCustomer.name}</h2>
                   <div className="flex flex-col gap-1">
                     <p className="text-slate-500 dark:text-slate-400 flex items-center gap-2 text-sm font-bold"><Phone size={16} className="text-primary"/> {selectedCustomer.phone}</p>
                     {selectedCustomer.email && <p className="text-slate-500 dark:text-slate-400 flex items-center gap-2 text-sm"><Mail size={16} className="text-primary"/> {selectedCustomer.email}</p>}
                   </div>
                 </div>
               </div>
               <div className="flex items-center gap-3">
                 <button 
                  onClick={() => handleOpenForm(selectedCustomer)} 
                  className="p-3 bg-blue-500/10 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                 >
                   <Edit2 size={20} />
                 </button>
                 <button 
                  onClick={() => setIsDeleting(true)} 
                  className="p-3 bg-red-500/10 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                 >
                   <Trash2 size={20} />
                 </button>
                 <div className="text-center bg-white dark:bg-slate-800 px-6 py-3 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm ml-4">
                   <span className="block text-[10px] font-black text-slate-400 uppercase mb-1">الزيارات</span>
                   <span className="block text-2xl font-black text-primary">{getCustomerHistory(selectedCustomer.id).length}</span>
                 </div>
               </div>
            </div>
            
            <div className="p-8 flex-1 overflow-y-auto space-y-10">
              <div>
                <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2"><FileText size={20} className="text-primary"/> ملاحظات إضافية</h3>
                <div className="p-5 border-2 border-slate-50 dark:border-slate-800 rounded-3xl bg-slate-50/30 dark:bg-slate-900/30 text-slate-700 dark:text-slate-200 min-h-[100px] font-medium italic">
                  {selectedCustomer.notes || "لا توجد ملاحظات مسجلة لهذا العميل."}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-6 flex items-center gap-2"><History size={20} className="text-primary"/> سجل العمليات السابق</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
                  {getCustomerHistory(selectedCustomer.id).map(ticket => (
                    <div key={ticket.id} className="border-2 border-slate-50 dark:border-slate-800 rounded-3xl p-6 hover:border-primary/30 hover:shadow-xl transition-all group bg-white dark:bg-slate-800/30">
                      <div className="flex justify-between items-start mb-4">
                        <span className="font-black text-slate-800 dark:text-white text-lg group-hover:text-primary transition-colors">{ticket.deviceModel}</span>
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">{ticket.issueDescription}</p>
                      <div className="flex justify-between items-center pt-4 border-t border-slate-50 dark:border-slate-800">
                         <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black ${ticket.paid ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30' : 'bg-red-100 text-red-700 dark:bg-red-900/30'}`}>
                           {ticket.paid ? 'مدفوع' : 'غير مدفوع'}
                         </span>
                         <span className="font-black text-primary text-xl">{ticket.cost} <span className="text-xs font-normal opacity-50">ر.س</span></span>
                      </div>
                    </div>
                  ))}
                  {getCustomerHistory(selectedCustomer.id).length === 0 && (
                     <div className="col-span-2 py-10 text-center opacity-30 italic">لا يوجد سجل سابق متاح لهذا العميل</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 animate-pulse">
            <User size={100} className="mb-6 opacity-10" />
            <p className="text-xl font-bold opacity-30">برجاء اختيار عميل من القائمة الجانبية</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div className={`bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 w-full max-w-lg shadow-2xl border border-white/20 relative animate-scale-up`}>
            <button onClick={() => setShowForm(false)} className="absolute left-6 top-6 text-slate-400 hover:text-red-500 transition-colors">
              <X size={24} />
            </button>
            <h3 className="text-2xl font-black mb-8 text-slate-800 dark:text-white flex items-center gap-3">
               <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                 {editingCustomer ? <Edit2 size={24}/> : <UserPlus size={24}/>}
               </div>
               {editingCustomer ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'}
            </h3>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">الاسم الكامل</label>
                <input 
                  type="text" 
                  className="w-full p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold"
                  value={formData.name || ''}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="مثال: محمد علي"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">رقم الجوال</label>
                  <input 
                    type="tel" 
                    className="w-full p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold text-left"
                    value={formData.phone || ''}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    placeholder="05xxxxxxx"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">البريد (اختياري)</label>
                  <input 
                    type="email" 
                    className="w-full p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold text-left"
                    value={formData.email || ''}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">ملاحظات الملف</label>
                <textarea 
                  className="w-full p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all h-24 resize-none"
                  value={formData.notes || ''}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                  placeholder="أي تفاصيل إضافية..."
                />
              </div>

              <button 
                onClick={handleSaveCustomer}
                className="w-full bg-primary text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-primary/30 hover:bg-primary-dark transition-all flex items-center justify-center gap-3"
              >
                <Save size={20} />
                {editingCustomer ? 'حفظ التغييرات' : 'تأكيد الإضافة'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
