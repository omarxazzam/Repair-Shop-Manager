import React from 'react';
import { Ticket, TicketStatus, Transaction, TransactionType } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Wallet, Users, Smartphone, Wrench } from 'lucide-react';

interface DashboardProps {
  tickets: Ticket[];
  transactions: Transaction[];
  currency: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export const Dashboard: React.FC<DashboardProps> = ({ tickets, transactions, currency }) => {
  // Stats
  const totalIncome = transactions
    .filter(t => t.type === TransactionType.INCOME)
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpense = transactions
    .filter(t => t.type === TransactionType.EXPENSE)
    .reduce((sum, t) => sum + t.amount, 0);
  
  const netProfit = totalIncome - totalExpense;

  const activeTickets = tickets.filter(t => t.status !== TicketStatus.DELIVERED && t.status !== TicketStatus.READY).length;
  const readyTickets = tickets.filter(t => t.status === TicketStatus.READY).length;

  // Chart Data
  const statusCounts = Object.values(TicketStatus).map(status => ({
    name: status,
    value: tickets.filter(t => t.status === status).length
  })).filter(item => item.value > 0);

  const StatCard = ({ title, value, icon: Icon, color }: { title: string, value: string, icon: any, color: string }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
      <div>
        <p className="text-sm text-slate-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
      </div>
      <div className={`p-3 rounded-full ${color} text-white`}>
        <Icon size={24} />
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">لوحة التحكم</h2>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="صافي الأرباح" 
          value={`${netProfit.toLocaleString()} ${currency}`} 
          icon={Wallet} 
          color="bg-emerald-500" 
        />
        <StatCard 
          title="قيد الإصلاح" 
          value={activeTickets.toString()} 
          icon={Wrench} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="جاهزة للتسليم" 
          value={readyTickets.toString()} 
          icon={Smartphone} 
          color="bg-amber-500" 
        />
        <StatCard 
          title="إجمالي التذاكر" 
          value={tickets.length.toString()} 
          icon={Users} 
          color="bg-slate-500" 
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-80">
          <h3 className="text-lg font-bold text-slate-700 mb-4">حالة التذاكر</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusCounts}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                label={({name, value}) => `${name} (${value})`}
              >
                {statusCounts.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-80">
          <h3 className="text-lg font-bold text-slate-700 mb-4">الأداء المالي</h3>
          <div className="flex flex-col justify-center h-full space-y-4">
             <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg">
                <span className="text-emerald-700 font-medium">الإيرادات</span>
                <span className="text-emerald-700 font-bold text-xl">{totalIncome.toLocaleString()} {currency}</span>
             </div>
             <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                <span className="text-red-700 font-medium">المصروفات</span>
                <span className="text-red-700 font-bold text-xl">{totalExpense.toLocaleString()} {currency}</span>
             </div>
             <div className="w-full bg-slate-200 rounded-full h-2.5 dark:bg-slate-700 mt-4">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${(totalIncome / (totalIncome + totalExpense || 1)) * 100}%` }}></div>
             </div>
             <div className="flex justify-between text-xs text-slate-500">
                <span>نسبة الإيرادات</span>
                <span>نسبة المصروفات</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
