import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Tickets } from './components/Tickets';
import { Inventory } from './components/Inventory';
import { Finance } from './components/Finance';
import { CRM } from './components/CRM';
import { Settings } from './components/Settings';
import { Users } from './components/Users';
import { Login } from './components/Login';
import { StorageService } from './services/storage';
import { AppSettings, Customer, InventoryItem, Ticket, Transaction, User, UserRole, View } from './types';
import { Menu } from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>('DASHBOARD');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [settings, setSettings] = useState<AppSettings>(StorageService.getSettings());

  useEffect(() => {
    const data = {
      tickets: StorageService.getTickets(),
      inventory: StorageService.getInventory(),
      customers: StorageService.getCustomers(),
      transactions: StorageService.getTransactions(),
      users: StorageService.getUsers(),
      settings: StorageService.getSettings()
    };
    
    setTickets(data.tickets);
    setInventory(data.inventory);
    setCustomers(data.customers);
    setTransactions(data.transactions);
    setUsers(data.users);
    setSettings(data.settings);
    applyTheme(data.settings);
  }, []);

  const applyTheme = (s: AppSettings) => {
    const root = document.documentElement;
    if (s.theme.darkMode) root.classList.add('dark');
    else root.classList.remove('dark');

    root.classList.remove('style-professional', 'style-glass', 'style-minimal', 'style-soft');
    root.classList.add(`style-${s.theme.visualStyle}`);

    root.style.setProperty('--color-primary', s.theme.primaryColor);
    
    if (s.theme.visualStyle === 'glass') {
      root.style.setProperty('--bg-gradient', s.theme.darkMode ? 
        'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)' : 
        'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)');
    } else if (s.theme.visualStyle === 'soft') {
      root.style.setProperty('--bg-gradient', s.theme.darkMode ? '#1e293b' : '#f0f4f8');
    } else {
      root.style.setProperty('--bg-gradient', 'none');
    }

    const sizes = { small: '14px', medium: '16px', large: '18px' };
    root.style.fontSize = sizes[s.theme.fontSize] || '16px';
  };

  const updateSettings = (data: AppSettings) => {
    setSettings(data);
    StorageService.saveSettings(data);
    applyTheme(data);
  };

  if (!currentUser) return <Login onLogin={setCurrentUser} />;

  const styleClasses = "themed-card transition-all duration-300";

  const renderView = () => {
    const commonProps = {
      currency: settings.currency,
      currentUser,
      styleClasses
    };

    switch (currentView) {
      case 'DASHBOARD': return <Dashboard tickets={tickets} transactions={transactions} {...commonProps} />;
      case 'TICKETS': return (
        <Tickets 
          tickets={tickets} onUpdate={(d: any) => { setTickets(d); StorageService.saveTickets(d); }}
          customers={customers} onUpdateCustomers={(d: any) => { setCustomers(d); StorageService.saveCustomers(d); }}
          transactions={transactions} onUpdateTransactions={(d: any) => { setTransactions(d); StorageService.saveTransactions(d); }}
          inventory={inventory} onUpdateInventory={(d: any) => { setInventory(d); StorageService.saveInventory(d); }}
          users={users} shopName={settings.shopName} layout={settings.theme.layoutType}
          {...commonProps}
        />
      );
      case 'INVENTORY': return <Inventory items={inventory} onUpdate={(d) => { setInventory(d); StorageService.saveInventory(d); }} {...commonProps} />;
      case 'FINANCE': return <Finance transactions={transactions} onUpdate={(d) => { setTransactions(d); StorageService.saveTransactions(d); }} {...commonProps} />;
      case 'CRM': return <CRM customers={customers} tickets={tickets} {...commonProps} />;
      case 'SETTINGS': return <Settings settings={settings} onUpdate={updateSettings} />;
      case 'USERS': return <Users users={users} onUpdate={(d) => { setUsers(d); StorageService.saveUsers(d); }} {...commonProps} />;
      default: return <Dashboard tickets={tickets} transactions={transactions} {...commonProps} />;
    }
  };

  return (
    <div className={`min-h-screen flex main-bg-gradient transition-all duration-500 ${settings.theme.darkMode ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'}`} dir="rtl">
      <Sidebar 
        currentView={currentView} 
        onChangeView={setCurrentView} 
        currentUser={currentUser} 
        onLogout={() => setCurrentUser(null)}
        darkMode={settings.theme.darkMode}
        visualStyle={settings.theme.visualStyle}
      />
      <div className="flex-1 md:mr-64">
        <header className={`h-16 border-b flex items-center justify-between px-6 sticky top-0 z-10 ${settings.theme.visualStyle === 'glass' ? 'glass-panel' : (settings.theme.darkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white/80 border-slate-200')} backdrop-blur-md`}>
          <div className="font-bold text-primary text-xl tracking-tight">{settings.shopName}</div>
          <div className="flex items-center gap-3">
             <div className="text-left hidden sm:block">
                <p className="text-sm font-bold">{currentUser.name}</p>
                <p className="text-[10px] opacity-60 uppercase">{currentUser.role}</p>
             </div>
             <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold border border-primary/30">
               {currentUser.username[0].toUpperCase()}
             </div>
          </div>
        </header>
        <main className={`p-6 max-w-7xl mx-auto ${settings.theme.layoutType === 'compact' ? 'space-y-3' : 'space-y-6'}`}>
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default App;
