import React, { useState } from 'react';
import { Customer, Ticket } from '../types';
import { User, Phone, FileText, History, Star } from 'lucide-react';

interface CRMProps {
  customers: Customer[];
  tickets: Ticket[];
  styleClasses: string;
}

export const CRM: React.FC<CRMProps> = ({ customers, tickets, styleClasses }) => {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const getCustomerHistory = (customerId: string) => {
    return tickets.filter(t => t.customerId === customerId);
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-160px)] gap-8 animate-fade-in">
      {/* Customer List */}
      <div className={`${styleClasses} w-full lg:w-1/3 flex flex-col overflow-hidden`}>
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
          <h2 className="font-bold text-slate-800 dark:text-white flex items-center gap-2"><User size={20}/> قاعدة بيانات العملاء</h2>
        </div>
        <div className="overflow-y-auto flex-1 p-4 space-y-3">
          {customers.map(c => (
            <div 
              key={c.id} 
              onClick={() => setSelectedCustomer(c)}
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
        </div>
      </div>

      {/* Customer Details */}
      <div className={`${styleClasses} w-full lg:w-2/3 flex flex-col overflow-hidden`}>
        {selectedCustomer ? (
          <div className="h-full flex flex-col">
            <div className="p-8 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center">
               <div className="flex items-center gap-6">
                 <div className="w-20 h-20 rounded-3xl bg-primary text-white flex items-center justify-center text-4xl font-black shadow-xl shadow-primary/30">{selectedCustomer.name[0]}</div>
                 <div>
                   <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-1">{selectedCustomer.name}</h2>
                   <p className="text-slate-500 dark:text-slate-400 flex items-center gap-2 text-lg font-bold"><Phone size={20} className="text-primary"/> {selectedCustomer.phone}</p>
                 </div>
               </div>
               <div className="text-center bg-white dark:bg-slate-800 px-8 py-4 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
                 <span className="block text-[10px] font-black text-slate-400 uppercase mb-1">إجمالي الحركات</span>
                 <span className="block text-3xl font-black text-primary">{getCustomerHistory(selectedCustomer.id).length}</span>
               </div>
            </div>
            
            <div className="p-8 flex-1 overflow-y-auto space-y-10">
              <div>
                <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2"><FileText size={20} className="text-primary"/> ملاحظات الملف الشخصي</h3>
                <textarea 
                  className="w-full p-5 border-2 border-slate-100 dark:border-slate-700 rounded-3xl bg-slate-50/50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-200 h-28 resize-none focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium"
                  defaultValue={selectedCustomer.notes}
                  placeholder="سجل أي تفاصيل هامة عن هذا العميل هنا..."
                />
              </div>

              <div>
                <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-6 flex items-center gap-2"><History size={20} className="text-primary"/> سجل العمليات السابق</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
    </div>
  );
};
