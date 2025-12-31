import React from 'react';
import { Ticket, TicketStatus, Transaction, TransactionType } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Wallet, Users, Smartphone, Wrench } from 'lucide-react';

interface DashboardProps {
  tickets: Ticket[];
  transactions: Transaction[];
  currency: string;
  styleClasses: string;
}

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export const Dashboard: React.FC<DashboardProps> = ({ tickets, transactions, currency, styleClasses }) => {
  const totalIncome = transactions
    .filter(t => t.type === TransactionType.INCOME)
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpense = transactions
    .filter(t => t.type === TransactionType.EXPENSE || t.type === TransactionType.COMMISSION)
    .reduce((sum, t) => sum + t.amount, 0);
  
  const netProfit = totalIncome - totalExpense;

  const activeTickets = tickets.filter(t => t.status !== TicketStatus.DELIVERED && t.status !== TicketStatus.READY).length;
  const readyTickets = tickets.filter(t => t.status === TicketStatus.READY).length;

  const statusCounts = Object.values(TicketStatus).map(status => ({
    name: status,
    value: tickets.filter(t => t.status === status).length
  })).filter(item => item.value > 0);

  const StatCard = ({ title, value, icon: Icon, color }: { title: string, value: string, icon: any, color: string }) => (
    <div className={`${styleClasses} p-6 flex items-center justify-between`}>
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-2xl font-bold">{value}</h3>
      </div>
      <div className={`p-4 rounded-2xl ${color} text-white shadow-lg`}>
        <Icon size={24} />
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="الأرباح الصافية" value={`${netProfit.toLocaleString()} ${currency}`} icon={Wallet} color="bg-emerald-500" />
        <StatCard title="تحت الإصلاح" value={activeTickets.toString()} icon={Wrench} color="bg-primary" />
        <StatCard title="جاهز للتسليم" value={readyTickets.toString()} icon={Smartphone} color="bg-amber-500" />
        <StatCard title="عدد التذاكر" value={tickets.length.toString()} icon={Users} color="bg-slate-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <div className={`${styleClasses} p-8 h-96`}>
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">توزيع الحالات</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusCounts}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={90}
                paddingAngle={8}
                dataKey="value"
              >
                {statusCounts.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                itemStyle={{ color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className={`${styleClasses} p-8 h-96 flex flex-col`}>
          <h3 className="text-lg font-bold mb-8">الميزانية العامة</h3>
          <div className="flex flex-col justify-center flex-1 space-y-6">
             <div className="flex items-center justify-between p-5 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                <span className="text-emerald-500 font-bold">إجمالي الداخل</span>
                <span className="text-emerald-500 font-bold text-2xl">{totalIncome.toLocaleString()}</span>
             </div>
             <div className="flex items-center justify-between p-5 bg-red-500/10 rounded-2xl border border-red-500/20">
                <span className="text-red-500 font-bold">إجمالي الخارج</span>
                <span className="text-red-500 font-bold text-2xl">{totalExpense.toLocaleString()}</span>
             </div>
             <div className="pt-4">
                <div className="flex justify-between text-xs font-bold mb-2 px-1">
                  <span>نسبة الربحية</span>
                  <span>{Math.round((netProfit / (totalIncome || 1)) * 100)}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                  <div className="bg-primary h-3 rounded-full transition-all duration-1000" style={{ width: `${(totalIncome / (totalIncome + totalExpense || 1)) * 100}%` }}></div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
