
import { AppSettings, Customer, InventoryItem, Ticket, TicketStatus, Transaction, TransactionType, User, UserRole, LogEntry } from '../types';

const generateId = () => Math.random().toString(36).substr(2, 9);

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
  { id: 'u1', name: 'المدير العام', username: 'admin', password: '123', role: UserRole.ADMIN, commissionRate: 0 },
  { id: 'u2', name: 'مشرف الصالة', username: 'manager', password: '123', role: UserRole.MANAGER, commissionRate: 0 },
  { id: 'u3', name: 'فني محمد', username: 'tech', password: '123', role: UserRole.TECHNICIAN, commissionRate: 20 },
];

const INITIAL_CUSTOMERS: Customer[] = [
  { id: 'c1', name: 'أحمد محمد', phone: '01012345678', notes: 'عميل مميز', totalVisits: 2 },
  { id: 'c2', name: 'سارة خالد', phone: '01198765432', notes: '', totalVisits: 1 },
];

const INITIAL_INVENTORY: InventoryItem[] = [
  { id: 'i1', name: 'شاشة iPhone 13 Pro', quantity: 5, price: 4500, minThreshold: 2 },
  { id: 'i2', name: 'بطارية Samsung S22', quantity: 10, price: 1200, minThreshold: 3 },
];

const INITIAL_TICKETS: Ticket[] = [];
const INITIAL_TRANSACTIONS: Transaction[] = [];
const INITIAL_LOGS: LogEntry[] = [];

const load = <T,>(key: string, initial: T): T => {
  const stored = localStorage.getItem(key);
  if (!stored) return initial;
  try {
    return JSON.parse(stored);
  } catch {
    return initial;
  }
};

const save = <T,>(key: string, data: T) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const StorageService = {
  getTickets: (): Ticket[] => load('tickets', INITIAL_TICKETS),
  saveTickets: (tickets: Ticket[]) => save('tickets', tickets),
  getInventory: (): InventoryItem[] => load('inventory', INITIAL_INVENTORY),
  saveInventory: (items: InventoryItem[]) => save('inventory', items),
  getCustomers: (): Customer[] => load('customers', INITIAL_CUSTOMERS),
  saveCustomers: (customers: Customer[]) => save('customers', customers),
  getTransactions: (): Transaction[] => load('transactions', INITIAL_TRANSACTIONS),
  saveTransactions: (transactions: Transaction[]) => save('transactions', transactions),
  getUsers: (): User[] => load('users', INITIAL_USERS),
  saveUsers: (users: User[]) => save('users', users),
  getSettings: (): AppSettings => load('settings', INITIAL_SETTINGS),
  saveSettings: (settings: AppSettings) => save('settings', settings),
  getLogs: (): LogEntry[] => load('audit_logs', INITIAL_LOGS),
  saveLogs: (logs: LogEntry[]) => save('audit_logs', logs),
  generateId
};
