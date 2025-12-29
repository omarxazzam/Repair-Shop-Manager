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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Load initial data
  useEffect(() => {
    setTickets(StorageService.getTickets());
    setInventory(StorageService.getInventory());
    setCustomers(StorageService.getCustomers());
    setTransactions(StorageService.getTransactions());
    setUsers(StorageService.getUsers());
    setSettings(StorageService.getSettings());
  }, []);

  // Sync with storage on updates
  const updateTickets = (data: Ticket[]) => {
    setTickets(data);
    StorageService.saveTickets(data);
  };
  
  const updateInventory = (data: InventoryItem[]) => {
    setInventory(data);
    StorageService.saveInventory(data);
  };

  const updateTransactions = (data: Transaction[]) => {
    setTransactions(data);
    StorageService.saveTransactions(data);
  };

  const updateUsers = (data: User[]) => {
    setUsers(data);
    StorageService.saveUsers(data);
  };

  const updateSettings = (data: AppSettings) => {
    setSettings(data);
    StorageService.saveSettings(data);
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    // Redirect logic based on role
    if (user.role === UserRole.TECHNICIAN) {
      setCurrentView('TICKETS');
    } else {
      setCurrentView('DASHBOARD');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('DASHBOARD');
  };

  const renderView = () => {
    if (!currentUser) return null;

    switch (currentView) {
      case 'DASHBOARD':
        return <Dashboard tickets={tickets} transactions={transactions} currency={settings.currency} />;
      case 'TICKETS':
        return <Tickets tickets={tickets} onUpdate={updateTickets} customers={customers} users={users} currentUser={currentUser} currency={settings.currency} shopName={settings.shopName} />;
      case 'INVENTORY':
        return <Inventory items={inventory} onUpdate={updateInventory} currency={settings.currency} currentUser={currentUser} />;
      case 'FINANCE':
        return <Finance transactions={transactions} onUpdate={updateTransactions} currency={settings.currency} />;
      case 'CRM':
        return <CRM customers={customers} tickets={tickets} />;
      case 'SETTINGS':
        return <Settings settings={settings} onUpdate={updateSettings} />;
      case 'USERS':
        return <Users users={users} onUpdate={updateUsers} currentUser={currentUser} />;
      default:
        return <Dashboard tickets={tickets} transactions={transactions} currency={settings.currency} />;
    }
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex" dir="rtl">
      {/* Sidebar */}
      <Sidebar 
        currentView={currentView} 
        onChangeView={(v) => { setCurrentView(v); setMobileMenuOpen(false); }} 
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setMobileMenuOpen(false)}>
           <div className="w-64 h-full bg-slate-900 pt-16" onClick={e => e.stopPropagation()}>
               <div className="flex flex-col space-y-2 p-4">
                  {/* Simplistic mobile menu replication - in real app would use shared config */}
                   <button onClick={handleLogout} className="text-right px-4 py-3 rounded text-red-400 hover:bg-slate-800">تسجيل خروج</button>
               </div>
           </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 md:mr-64 transition-all duration-300">
        {/* Header */}
        <header className="bg-white h-16 border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
          <button className="md:hidden text-slate-600" onClick={() => setMobileMenuOpen(true)}>
            <Menu />
          </button>
          <div className="font-bold text-slate-700 md:hidden">{settings.shopName}</div>
          <div className="flex items-center gap-4 mr-auto">
            <div className="flex items-center gap-2">
              <div className="text-left hidden sm:block">
                <p className="text-sm font-bold text-slate-800">{currentUser.name}</p>
                <p className="text-xs text-slate-500">{currentUser.role}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold uppercase">
                {currentUser.username.substring(0, 2)}
              </div>
            </div>
          </div>
        </header>

        {/* View Content */}
        <main className="p-6 max-w-7xl mx-auto">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default App;
