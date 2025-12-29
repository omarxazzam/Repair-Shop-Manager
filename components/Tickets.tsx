import React, { useState } from 'react';
import { Ticket, TicketStatus, Customer, User, UserRole } from '../types';
import { StorageService } from '../services/storage';
import { analyzeRepairIssue } from '../services/geminiService';
import { Plus, Search, Printer, Edit2, CheckCircle, Clock, AlertCircle, Bot, User as UserIcon } from 'lucide-react';

interface TicketsProps {
  tickets: Ticket[];
  onUpdate: (tickets: Ticket[]) => void;
  customers: Customer[];
  users: User[];
  currentUser: User;
  currency: string;
  shopName: string;
}

export const Tickets: React.FC<TicketsProps> = ({ tickets, onUpdate, customers, users, currentUser, currency, shopName }) => {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newTicket, setNewTicket] = useState<Partial<Ticket>>({
    customerName: '',
    deviceModel: '',
    serialNumber: '',
    issueDescription: '',
    status: TicketStatus.RECEIVED,
    cost: 0,
    technicianId: currentUser.role === UserRole.TECHNICIAN ? currentUser.id : ''
  });
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);

  const technicians = users.filter(u => u.role === UserRole.TECHNICIAN);

  const handleAddTicket = () => {
    if (!newTicket.customerName || !newTicket.deviceModel) return;
    
    const ticketId = StorageService.generateId();
    const customerId = customers.find(c => c.name === newTicket.customerName)?.id || StorageService.generateId();
    
    // Find Technician Name
    const assignedTech = users.find(u => u.id === newTicket.technicianId);

    const ticket: Ticket = {
      id: ticketId,
      customerId,
      customerName: newTicket.customerName,
      deviceModel: newTicket.deviceModel!,
      serialNumber: newTicket.serialNumber || '',
      issueDescription: newTicket.issueDescription || '',
      status: TicketStatus.RECEIVED,
      technicianId: newTicket.technicianId || undefined,
      technicianName: assignedTech ? assignedTech.name : 'غير معين',
      cost: newTicket.cost || 0,
      paid: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      aiDiagnosis: aiSuggestion || undefined,
    };

    const updatedTickets = [ticket, ...tickets];
    onUpdate(updatedTickets);
    setShowForm(false);
    setNewTicket({
      customerName: '',
      deviceModel: '',
      serialNumber: '',
      issueDescription: '',
      status: TicketStatus.RECEIVED,
      cost: 0,
      technicianId: currentUser.role === UserRole.TECHNICIAN ? currentUser.id : ''
    });
    setAiSuggestion(null);
  };

  const handleStatusChange = (id: string, newStatus: TicketStatus) => {
    const updated = tickets.map(t => t.id === id ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } : t);
    onUpdate(updated);
  };

  const handlePrint = (ticket: Ticket) => {
    const printWindow = window.open('', '', 'width=600,height=600');
    if (printWindow) {
      printWindow.document.write(`
        <html dir="rtl">
          <head><title>إيصال استلام</title></head>
          <body style="font-family: sans-serif; padding: 20px; text-align: center;">
            <h2>${shopName}</h2>
            <hr/>
            <h3>إيصال استلام جهاز</h3>
            <p><strong>رقم التذكرة:</strong> ${ticket.id}</p>
            <p><strong>العميل:</strong> ${ticket.customerName}</p>
            <p><strong>الجهاز:</strong> ${ticket.deviceModel}</p>
            <p><strong>المشكلة:</strong> ${ticket.issueDescription}</p>
            <p><strong>التكلفة المتوقعة:</strong> ${ticket.cost} ${currency}</p>
            <p><strong>الفني:</strong> ${ticket.technicianName || 'غير معين'}</p>
            <p><strong>التاريخ:</strong> ${new Date(ticket.createdAt).toLocaleDateString()}</p>
            <hr/>
            <p>شكراً لتعاملكم معنا</p>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleAiAnalysis = async () => {
    if (!newTicket.deviceModel || !newTicket.issueDescription) return;
    setAiLoading(true);
    const result = await analyzeRepairIssue(newTicket.deviceModel, newTicket.issueDescription);
    setAiSuggestion(result);
    setAiLoading(false);
  };

  // Filter Logic: Techs only see their tickets. Admins see all.
  let displayTickets = tickets;
  if (currentUser.role === UserRole.TECHNICIAN) {
    displayTickets = tickets.filter(t => t.technicianId === currentUser.id);
  }

  const filteredTickets = displayTickets.filter(t => 
    t.customerName.includes(searchTerm) || 
    t.id.includes(searchTerm) || 
    t.deviceModel.includes(searchTerm)
  );

  const getStatusColor = (status: TicketStatus) => {
    switch (status) {
      case TicketStatus.RECEIVED: return 'bg-slate-100 text-slate-700';
      case TicketStatus.ASSIGNED: return 'bg-blue-100 text-blue-700';
      case TicketStatus.IN_PROGRESS: return 'bg-yellow-100 text-yellow-700';
      case TicketStatus.WAITING_PARTS: return 'bg-red-100 text-red-700';
      case TicketStatus.READY: return 'bg-emerald-100 text-emerald-700';
      case TicketStatus.DELIVERED: return 'bg-gray-100 text-gray-500 line-through';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">تذاكر الصيانة</h2>
          {currentUser.role === UserRole.TECHNICIAN && (
            <p className="text-sm text-slate-500 mt-1">عرض التذاكر المعينة لك فقط</p>
          )}
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          <span>تذكرة جديدة</span>
        </button>
      </div>

      <div className="relative">
        <Search className="absolute right-3 top-3 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="بحث برقم التذكرة، اسم العميل، أو الجهاز..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pr-10 pl-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTickets.map(ticket => (
          <div key={ticket.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative">
            <div className="flex justify-between items-start mb-3">
              <span className="font-bold text-lg text-slate-800">#{ticket.id}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                {ticket.status}
              </span>
            </div>
            
            <div className="space-y-2 text-sm text-slate-600 mb-4">
              <p className="flex items-center gap-2"><span className="font-semibold text-slate-900">العميل:</span> {ticket.customerName}</p>
              <p className="flex items-center gap-2"><span className="font-semibold text-slate-900">الجهاز:</span> {ticket.deviceModel}</p>
              <p className="flex items-center gap-2"><span className="font-semibold text-slate-900">العطل:</span> {ticket.issueDescription}</p>
              <p className="flex items-center gap-2"><span className="font-semibold text-slate-900">الفني:</span> {ticket.technicianName || 'غير معين'}</p>
              <p className="flex items-center gap-2 text-xs text-slate-400"><Clock size={14}/> {new Date(ticket.createdAt).toLocaleDateString()}</p>
            </div>

            <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-50 items-center">
               <select 
                 value={ticket.status}
                 onChange={(e) => handleStatusChange(ticket.id, e.target.value as TicketStatus)}
                 className="bg-slate-50 border border-slate-200 text-xs rounded p-1 flex-1 h-8"
               >
                 {Object.values(TicketStatus).map(s => <option key={s} value={s}>{s}</option>)}
               </select>
               <span className="font-bold text-slate-700 text-sm px-2">{ticket.cost} {currency}</span>
               <button 
                onClick={() => handlePrint(ticket)}
                className="text-slate-500 hover:text-primary p-1" title="طباعة">
                 <Printer size={18} />
               </button>
            </div>
            {ticket.aiDiagnosis && (
              <div className="mt-3 bg-purple-50 p-2 rounded text-xs text-purple-800 border border-purple-100">
                <div className="flex items-center gap-1 font-bold mb-1"><Bot size={14}/> تحليل الذكاء الاصطناعي:</div>
                {ticket.aiDiagnosis}
              </div>
            )}
          </div>
        ))}
        {filteredTickets.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <p>لا توجد تذاكر للعرض</p>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4 text-slate-800">إضافة تذكرة جديدة</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">اسم العميل</label>
                <input 
                  type="text" 
                  className="w-full p-2 border rounded"
                  value={newTicket.customerName}
                  onChange={e => setNewTicket({...newTicket, customerName: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">موديل الجهاز</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border rounded"
                    value={newTicket.deviceModel}
                    onChange={e => setNewTicket({...newTicket, deviceModel: e.target.value})}
                  />
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">السيريال / IMEI</label>
                   <input 
                    type="text" 
                    className="w-full p-2 border rounded"
                    value={newTicket.serialNumber}
                    onChange={e => setNewTicket({...newTicket, serialNumber: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">وصف العطل</label>
                <textarea 
                  className="w-full p-2 border rounded h-24"
                  value={newTicket.issueDescription}
                  onChange={e => setNewTicket({...newTicket, issueDescription: e.target.value})}
                ></textarea>
                <button 
                  onClick={handleAiAnalysis}
                  disabled={aiLoading || !newTicket.deviceModel || !newTicket.issueDescription}
                  className="mt-2 text-xs flex items-center gap-2 text-purple-600 hover:text-purple-800 disabled:opacity-50"
                >
                  <Bot size={16} />
                  {aiLoading ? 'جاري التحليل...' : 'تحليل المشكلة بالذكاء الاصطناعي'}
                </button>
                {aiSuggestion && (
                  <div className="mt-2 p-3 bg-purple-50 text-sm text-purple-900 rounded border border-purple-100">
                    {aiSuggestion}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">الفني المسؤول</label>
                   {currentUser.role === UserRole.TECHNICIAN ? (
                     <div className="p-2 bg-slate-50 border rounded text-slate-500 text-sm">
                       {currentUser.name}
                     </div>
                   ) : (
                     <select
                      className="w-full p-2 border rounded bg-white"
                      value={newTicket.technicianId || ''}
                      onChange={e => setNewTicket({...newTicket, technicianId: e.target.value})}
                     >
                       <option value="">اختر فني...</option>
                       {technicians.map(t => (
                         <option key={t.id} value={t.id}>{t.name}</option>
                       ))}
                     </select>
                   )}
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">التكلفة المتوقعة ({currency})</label>
                   <input 
                    type="number" 
                    className="w-full p-2 border rounded"
                    value={newTicket.cost}
                    onChange={e => setNewTicket({...newTicket, cost: Number(e.target.value)})}
                  />
                </div>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button 
                onClick={handleAddTicket}
                className="flex-1 bg-primary text-white py-2 rounded hover:bg-blue-700 transition"
              >
                حفظ التذكرة
              </button>
              <button 
                onClick={() => setShowForm(false)}
                className="flex-1 bg-slate-100 text-slate-700 py-2 rounded hover:bg-slate-200 transition"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
