
import React from 'react';
import { LogEntry } from '../types';
import { ScrollText, Clock, User as UserIcon, ShieldAlert, PlusCircle, Trash2, Edit3, Settings } from 'lucide-react';

interface LogsProps {
  logs: LogEntry[];
  styleClasses: string;
}

export const Logs: React.FC<LogsProps> = ({ logs, styleClasses }) => {
  const getLogIcon = (type: string) => {
    switch (type) {
      case 'CREATE': return <PlusCircle className="text-emerald-500" size={18} />;
      case 'DELETE': return <Trash2 className="text-red-500" size={18} />;
      case 'UPDATE': return <Edit3 className="text-blue-500" size={18} />;
      default: return <Settings className="text-slate-400" size={18} />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-3">
          <ScrollText className="text-primary" size={32} />
          سجل النشاطات الرقابي
        </h2>
        <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2">
          <ShieldAlert size={16} />
          وصول حصري للمدير
        </div>
      </div>

      <div className={`${styleClasses} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 text-[10px] uppercase font-black tracking-widest">
              <tr>
                <th className="p-5">الوقت والتاريخ</th>
                <th className="p-5">المستخدم</th>
                <th className="p-5">نوع الإجراء</th>
                <th className="p-5">التفاصيل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {logs.length > 0 ? (
                logs.slice().reverse().map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-all">
                    <td className="p-5">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                        <Clock size={14} />
                        {new Date(log.timestamp).toLocaleString('ar-EG')}
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-[10px] font-black text-primary">
                          {log.userName[0]}
                        </div>
                        <span className="font-bold text-slate-700 dark:text-slate-200">{log.userName}</span>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-2">
                        {getLogIcon(log.type)}
                        <span className={`text-[10px] font-black px-2 py-1 rounded-md ${
                          log.type === 'CREATE' ? 'bg-emerald-50 text-emerald-600' :
                          log.type === 'DELETE' ? 'bg-red-50 text-red-600' :
                          'bg-blue-50 text-blue-600'
                        }`}>
                          {log.action}
                        </span>
                      </div>
                    </td>
                    <td className="p-5 text-sm font-medium text-slate-600 dark:text-slate-400">
                      {log.details}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-20 text-center opacity-30 italic font-bold text-xl">
                    لا توجد سجلات نشاط حتى الآن
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
