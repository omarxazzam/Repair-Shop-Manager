
import { AppSettings, Customer, InventoryItem, Ticket, Transaction, User, UserRole, LogEntry, View } from '../types';

const generateId = () => Math.random().toString(36).substr(2, 9);

const ALL_VIEWS: View[] = ['DASHBOARD', 'TICKETS', 'INVENTORY', 'FINANCE', 'CRM', 'SETTINGS', 'USERS', 'LOGS'];

const INITIAL_SETTINGS: AppSettings = {
  shopName: 'مركز الصيانة المحترف',
  currency: 'ج.م',
  taxRate: 14,
  phone: '01000000000',
  address: 'القاهرة، مصر',
  theme: {
    darkMode: false,
    primaryColor: '#2563eb',
    fontSize: 'medium',
    layoutType: 'spacious',
    visualStyle: 'professional'
  },
  printConfig: {
    showId: true,
    showCustomerName: true,
    showDeviceModel: true,
    showIssue: true,
    showCost: false,
    showDate: true,
    showShopName: true
  }
};

const INITIAL_USERS: User[] = [
  { 
    id: 'u_root', 
    name: 'صاحب النظام', 
    username: 'admin', 
    password: '1977', 
    role: UserRole.ADMIN, 
    commissionRate: 0,
    permissions: ALL_VIEWS 
  },
];

const load = <T,>(key: string, initial: T): T => {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return initial;
    const parsed = JSON.parse(stored);
    return parsed || initial;
  } catch (e) {
    console.error(`Error loading key ${key}:`, e);
    return initial;
  }
};

const save = <T,>(key: string, data: T) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving key ${key}:`, e);
  }
};

export const StorageService = {
  getTickets: (): Ticket[] => load('tickets', []),
  saveTickets: (tickets: Ticket[]) => save('tickets', tickets),
  getInventory: (): InventoryItem[] => load('inventory', []),
  saveInventory: (items: InventoryItem[]) => save('inventory', items),
  getCustomers: (): Customer[] => load('customers', []),
  saveCustomers: (customers: Customer[]) => save('customers', customers),
  getTransactions: (): Transaction[] => load('transactions', []),
  saveTransactions: (transactions: Transaction[]) => save('transactions', transactions),
  getUsers: (): User[] => load('users', INITIAL_USERS),
  saveUsers: (users: User[]) => save('users', users),
  getSettings: (): AppSettings => load('settings', INITIAL_SETTINGS),
  saveSettings: (settings: AppSettings) => save('settings', settings),
  getLogs: (): LogEntry[] => load('audit_logs', []),
  saveLogs: (logs: LogEntry[]) => save('audit_logs', logs),
  generateId
};
