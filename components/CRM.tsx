import React, { useState } from 'react';
import { Customer, Ticket } from '../types';
import { User, Phone, FileText, History } from 'lucide-react';

interface CRMProps {
  customers: Customer[];
  tickets: Ticket[];
}

export const CRM: React.FC<CRMProps> = ({ customers, tickets }) => {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const getCustomerHistory = (customerId: string) => {
    return tickets.filter(t => t.customerId === customerId);
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-100px)] gap-6">
      {/* Customer List */}
      <div className="w-full lg:w-1/3 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <h2 className="font-bold text-slate-800">قائمة العملاء</h2>
        </div>
        <div className="overflow-y-auto flex-1 p-2 space-y-2">
          {customers.map(c => (
            <div 
              key={c.id} 
              onClick={() => setSelectedCustomer(c)}
              className={`p-4 rounded-lg cursor-pointer border transition-all ${selectedCustomer?.id === c.id ? 'border-primary bg-blue-50' : 'border-transparent hover:bg-slate-50'}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                  <User size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">{c.name}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1"><Phone size={12}/> {c.phone}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Customer Details */}
      <div className="w-full lg:w-2/3 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
        {selectedCustomer ? (
          <div className="h-full flex flex-col">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-start">
               <div>
                 <h2 className="text-2xl font-bold text-slate-800 mb-1">{selectedCustomer.name}</h2>
                 <p className="text-slate-500 flex items-center gap-2"><Phone size={16}/> {selectedCustomer.phone}</p>
               </div>
               <div className="bg-white px-4 py-2 rounded border border-slate-200 text-center">
                 <span className="block text-xs text-slate-500">إجمالي الزيارات</span>
                 <span className="block text-xl font-bold text-primary">{getCustomerHistory(selectedCustomer.id).length}</span>
               </div>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="mb-6">
                <h3 className="font-bold text-slate-700 mb-2 flex items-center gap-2"><FileText size={18}/> ملاحظات عن العميل</h3>
                <textarea 
                  className="w-full p-3 border rounded-lg bg-slate-50 text-slate-700 h-24 resize-none focus:ring-2 focus:ring-primary outline-none"
                  defaultValue={selectedCustomer.notes}
                  placeholder="أضف ملاحظات هنا..."
                />
              </div>

              <div>
                <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><History size={18}/> سجل الإصلاحات السابق</h3>
                <div className="space-y-4">
                  {getCustomerHistory(selectedCustomer.id).map(ticket => (
                    <div key={ticket.id} className="border border-slate-100 rounded-lg p-4 hover:shadow-sm transition">
                      <div className="flex justify-between mb-2">
                        <span className="font-bold text-slate-800">{ticket.deviceModel}</span>
                        <span className="text-xs text-slate-500">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{ticket.issueDescription}</p>
                      <div className="flex justify-between items-center text-sm">
                         <span className={`px-2 py-0.5 rounded text-xs ${ticket.paid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                           {ticket.paid ? 'تم الدفع' : 'غير مدفوع'}
                         </span>
                         <span className="font-bold text-slate-700">{ticket.cost} ر.س</span>
                      </div>
                    </div>
                  ))}
                  {getCustomerHistory(selectedCustomer.id).length === 0 && (
                     <p className="text-slate-400 text-center py-4">لا يوجد سجل سابق لهذا العميل</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <User size={64} className="mb-4 opacity-20" />
            <p>اختر عميلاً من القائمة لعرض التفاصيل</p>
          </div>
        )}
      </div>
    </div>
  );
};
