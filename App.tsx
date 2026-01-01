
import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Tickets } from './components/Tickets';
import { Inventory } from './components/Inventory';
import { Finance } from './components/Finance';
import { CRM } from './components/CRM';
import { Settings } from './components/Settings';
import { Users } from './components/Users';
import { Logs } from './components/Logs';
import { Login } from './components/Login';
import { StorageService } from './services/storage';
import { AppSettings, Customer, InventoryItem, Ticket, Transaction, User, UserRole, View, LogEntry } from './types';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>('DASHBOARD');
  
  // الـ States الأساسية
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [settings, setSettings] = useState<AppSettings>(StorageService.getSettings());
  
  // حارس التهيئة: يمنع الحفظ التلقائي حتى يتم التحميل الفعلي
  const initialized = useRef(false);

  // 1. تحميل البيانات عند البداية فقط
  useEffect(() => {
    setTickets(StorageService.getTickets());
    setInventory(StorageService.getInventory());
    setCustomers(StorageService.getCustomers());
    setTransactions(StorageService.getTransactions());
    setUsers(StorageService.getUsers());
    setLogs(StorageService.getLogs());
    setSettings(StorageService.getSettings());
    
    // تأخير تفعيل الـ initialized لضمان استقرار الـ state
    setTimeout(() => {
      initialized.current = true;
    }, 500);
  }, []);

  // 2. الحفظ التلقائي فقط بعد اكتمال التهيئة
  useEffect(() => { if (initialized.current) StorageService.saveTickets(tickets); }, [tickets]);
  useEffect(() => { if (initialized.current) StorageService.saveInventory(inventory); }, [inventory]);
  useEffect(() => { if (initialized.current) StorageService.saveCustomers(customers); }, [customers]);
  useEffect(() => { if (initialized.current) StorageService.saveTransactions(transactions); }, [transactions]);
  useEffect(() => { if (initialized.current) StorageService.saveUsers(users); }, [users]);
  useEffect(() => { if (initialized.current) StorageService.saveLogs(logs); }, [logs]);
  useEffect(() => { 
    if (initialized.current) {
      StorageService.saveSettings(settings); 
      applyTheme(settings);
    }
  }, [settings]);

  const applyTheme = (s: AppSettings) => {
    const root = document.documentElement;
    if (s.theme.darkMode) root.classList.add('dark');
    else root.classList.remove('dark');

    root.classList.remove('style-professional', 'style-glass', 'style-minimal', 'style-soft');
    root.classList.add(`style-${s.theme.visualStyle}`);
    root.style.setProperty('--color-primary', s.theme.primaryColor);
  };

  const addLog = (action: string, details: string, type: 'CREATE' | 'UPDATE' | 'DELETE' | 'SYSTEM' = 'SYSTEM') => {
    if (!currentUser) return;
    const newLog: LogEntry = {
      id: StorageService.generateId(),
      userId: currentUser.id,
      userName: currentUser.name,
      action,
      details,
      timestamp: new Date().toISOString(),
      type
    };
    setLogs(prev => [...prev, newLog]);
  };

  if (!currentUser) return <Login onLogin={setCurrentUser} />;

  const styleClasses = "themed-card transition-all duration-300";

  return (
    <div className={`min-h-screen flex main-bg-gradient ${settings.theme.darkMode ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'}`} dir="rtl">
      <Sidebar 
        currentView={currentView} 
        onChangeView={setCurrentView} 
        currentUser={currentUser} 
        onLogout={() => { initialized.current = false; setCurrentUser(null); }}
        darkMode={settings.theme.darkMode}
        visualStyle={settings.theme.visualStyle}
      />
      <div className="flex-1 md:mr-64">
        <header className={`h-16 border-b flex items-center justify-between px-6 sticky top-0 z-10 ${settings.theme.darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} backdrop-blur-md bg-opacity-80`}>
          <div className="font-bold text-primary text-xl tracking-tight">{settings.shopName}</div>
          <div className="flex items-center gap-3">
             <div className="text-left hidden sm:block">
                <p className="text-sm font-bold">{currentUser.name}</p>
                <p className="text-[10px] opacity-60 uppercase">{currentUser.role}</p>
             </div>
             <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
               {currentUser.username[0].toUpperCase()}
             </div>
          </div>
        </header>
        <main className="p-6 max-w-7xl mx-auto">
          {currentView === 'DASHBOARD' && <Dashboard tickets={tickets} transactions={transactions} currency={settings.currency} styleClasses={styleClasses} />}
          {currentView === 'TICKETS' && (
            <Tickets 
              tickets={tickets} 
              onUpdate={setTickets}
              customers={customers} 
              onUpdateCustomers={setCustomers}
              transactions={transactions} 
              onUpdateTransactions={setTransactions}
              inventory={inventory} 
              onUpdateInventory={setInventory}
              users={users} 
              currentUser={currentUser}
              currency={settings.currency}
              shopName={settings.shopName}
              layout={settings.theme.layoutType}
              styleClasses={styleClasses}
              onAddLog={addLog}
            />
          )}
          {currentView === 'INVENTORY' && <Inventory items={inventory} onUpdate={setInventory} currency={settings.currency} currentUser={currentUser} styleClasses={styleClasses} />}
          {currentView === 'FINANCE' && <Finance transactions={transactions} onUpdate={setTransactions} currency={settings.currency} styleClasses={styleClasses} onAddLog={addLog} />}
          {currentView === 'CRM' && <CRM customers={customers} onUpdateCustomers={setCustomers} tickets={tickets} styleClasses={styleClasses} onAddLog={addLog} />}
          {currentView === 'USERS' && <Users users={users} onUpdate={setUsers} currentUser={currentUser} styleClasses={styleClasses} />}
          {currentView === 'SETTINGS' && <Settings settings={settings} onUpdate={setSettings} />}
          {currentView === 'LOGS' && <Logs logs={logs} styleClasses={styleClasses} />}
        </main>
      </div>
    </div>
  );
};

export default App;
