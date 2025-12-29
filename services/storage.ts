import { AppSettings, Customer, InventoryItem, Ticket, TicketStatus, Transaction, TransactionType, User, UserRole } from '../types';

// Mock Data Generators
const generateId = () => Math.random().toString(36).substr(2, 9);

const INITIAL_SETTINGS: AppSettings = {
  shopName: 'مركز الصيانة المحترف',
  currency: 'ج.م',
  taxRate: 14,
  phone: '01000000000',
  address: 'القاهرة، مصر'
};

const INITIAL_USERS: User[] = [
  { id: 'u1', name: 'المدير العام', username: 'admin', password: '123', role: UserRole.ADMIN },
  { id: 'u2', name: 'مشرف الصالة', username: 'manager', password: '123', role: UserRole.MANAGER },
  { id: 'u3', name: 'فني محمد', username: 'tech', password: '123', role: UserRole.TECHNICIAN },
];

const INITIAL_CUSTOMERS: Customer[] = [
  { id: 'c1', name: 'أحمد محمد', phone: '01012345678', notes: 'عميل مميز', totalVisits: 2 },
  { id: 'c2', name: 'سارة خالد', phone: '01198765432', notes: '', totalVisits: 1 },
];

const INITIAL_INVENTORY: InventoryItem[] = [
  { id: 'i1', name: 'شاشة iPhone 13 Pro', quantity: 5, price: 4500, minThreshold: 2 },
  { id: 'i2', name: 'بطارية Samsung S22', quantity: 10, price: 1200, minThreshold: 3 },
  { id: 'i3', name: 'منفذ شحن Type-C', quantity: 20, price: 350, minThreshold: 5 },
];

const INITIAL_TICKETS: Ticket[] = [
  {
    id: 't1',
    customerId: 'c1',
    customerName: 'أحمد محمد',
    deviceModel: 'iPhone 13',
    serialNumber: 'SN12345678',
    issueDescription: 'الشاشة مكسورة ولا تعمل باللمس',
    status: TicketStatus.IN_PROGRESS,
    technicianId: 'u3',
    technicianName: 'فني محمد',
    cost: 5000,
    paid: false,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 't2',
    customerId: 'c2',
    customerName: 'سارة خالد',
    deviceModel: 'Samsung A52',
    serialNumber: 'SN87654321',
    issueDescription: 'الجهاز لا يشحن',
    status: TicketStatus.WAITING_PARTS,
    technicianId: 'u3',
    technicianName: 'فني محمد',
    cost: 1500,
    paid: false,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 'tr1', type: TransactionType.EXPENSE, amount: 20000, description: 'إيجار المحل', date: new Date(Date.now() - 259200000).toISOString() },
  { id: 'tr2', type: TransactionType.INCOME, amount: 1500, description: 'إصلاح شاشة (تذكرة قديمة)', date: new Date().toISOString() },
];

// Storage Helpers
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

// Data Store
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

  generateId
};
