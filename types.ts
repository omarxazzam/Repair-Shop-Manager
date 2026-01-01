
export enum TicketStatus {
  RECEIVED = 'تم الاستلام',
  ASSIGNED = 'تم التعيين',
  IN_PROGRESS = 'قيد الإصلاح',
  WAITING_PARTS = 'بانتظار قطع',
  READY = 'جاهز للتسليم',
  DELIVERED = 'تم التسليم',
  REJECTED = 'مرفوض',
}

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  TECHNICIAN = 'technician',
  RECEPTIONIST = 'receptionist',
}

export type View = 'DASHBOARD' | 'TICKETS' | 'INVENTORY' | 'FINANCE' | 'CRM' | 'SETTINGS' | 'USERS' | 'LOGS';

export interface User {
  id: string;
  name: string;
  username: string;
  password?: string;
  role: UserRole;
  commissionRate?: number;
  permissions: View[]; // قائمة بالواجهات المسموح للمستخدم بالوصول إليها
}

export type VisualStyle = 'professional' | 'glass' | 'minimal' | 'soft';

export interface AppTheme {
  darkMode: boolean;
  primaryColor: string;
  fontSize: 'small' | 'medium' | 'large';
  layoutType: 'spacious' | 'compact';
  visualStyle: VisualStyle;
}

export interface PrintConfig {
  showId: boolean;
  showCustomerName: boolean;
  showDeviceModel: boolean;
  showIssue: boolean;
  showCost: boolean;
  showDate: boolean;
  showShopName: boolean;
}

export interface AppSettings {
  shopName: string;
  currency: string;
  taxRate: number;
  phone: string;
  address: string;
  theme: AppTheme;
  printConfig: PrintConfig;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  notes: string;
  totalVisits: number;
}

export interface UsedPart {
  itemId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Ticket {
  id: string;
  customerId: string;
  customerName: string; 
  deviceModel: string;
  serialNumber: string;
  issueDescription: string;
  status: TicketStatus;
  technicianId?: string;
  technicianName?: string;
  cost: number;
  paid: boolean;
  createdAt: string;
  updatedAt: string;
  aiDiagnosis?: string;
  commissionCalculated?: boolean;
  usedParts?: UsedPart[];
  partsCost?: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  minThreshold: number;
}

export enum TransactionType {
  INCOME = 'إيراد',
  EXPENSE = 'مصروف',
  COMMISSION = 'عمولة فني',
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  date: string;
  relatedTicketId?: string;
  relatedTechnicianId?: string;
}

export interface LogEntry {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE' | 'SYSTEM';
}
