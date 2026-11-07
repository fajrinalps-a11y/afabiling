export type CustomerStatus = 'ACTIVE' | 'ISOLIR' | 'PENDING_PAYMENT' | 'SUSPENDED';

export interface WifiPackage {
  id: string;
  name: string;
  speedMbps: number;
  price: number;
  description: string;
  downloadSpeed: string;
  uploadSpeed: string;
  recommendedFor: string;
  isPopular?: boolean;
}

export interface CustomerBill {
  invoiceNo: string;
  month: string;
  year: number;
  amount: number;
  dueDate: string;
  status: 'PAID' | 'UNPAID' | 'OVERDUE';
  paidAt?: string;
  paymentMethod?: string;
  paymentRef?: string;
}

export interface Customer {
  id: string;
  customerNo: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  packageId: string;
  status: CustomerStatus;
  
  // MikroTik PPPoE & IP
  pppoeUsername: string;
  pppoePassword: string;
  ipAddress: string;
  macAddress: string;
  
  // GenieACS / ONT device settings
  wifiSSID: string;
  wifiPassword: string;
  ontSerial: string;
  ontModel: string;
  opticalPowerRx: number; // in dBm, e.g., -19.5
  uptimeHours: number;
  deviceConnected: boolean;
  
  // GIS Topology
  odcId: string;
  odpId: string;
  odpPort: number;
  lat: number;
  lng: number;
  
  // Billing cycle
  joinDate: string;
  billingDueDay: number; // e.g. 10th of every month
  dataUsageCurrentMonthGB: number;
  fupLimitGB: number;
  currentBill: CustomerBill;
}

export interface PaymentTransaction {
  id: string;
  invoiceNo: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  packageName: string;
  packageSpeed: number;
  amount: number;
  paidAt: string;
  dueDate: string;
  paymentMethod: 'QRIS' | 'BCA_VA' | 'BRI_VA' | 'MANDIRI_VA' | 'TRIPAY' | 'DANA' | 'GOPAY' | 'BANK_TRANSFER' | 'CASH';
  paymentReference: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  mikrotikUnisolated: boolean;
  genieAcsSynced: boolean;
  waReceiptSent: boolean;
  telegramReceiptSent: boolean;
  emailReceiptSent?: boolean;
}

export interface ODC {
  id: string;
  name: string;
  code: string;
  locationName: string;
  capacityCores: number;
  usedCores: number;
  lat: number;
  lng: number;
  status: 'NORMAL' | 'WARNING' | 'ALERT';
}

export interface ODP {
  id: string;
  odcId: string;
  name: string;
  code: string;
  poleNumber: string;
  capacityPorts: number;
  usedPorts: number;
  lat: number;
  lng: number;
  status: 'NORMAL' | 'FULL' | 'LOS';
  rxDbmAverage: number;
}

export interface OutageAlert {
  id: string;
  ticketNo: string;
  title: string;
  description: string;
  scope: 'ALL' | 'ODC' | 'ODP' | 'INDIVIDUAL';
  targetId?: string; // specific ODC/ODP id
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  affectedCustomerCount: number;
  reportedAt: string;
  estimatedResolution: string;
  status: 'OPEN' | 'INVESTIGATING' | 'REPAIRING' | 'RESOLVED';
  waBroadcastSent: boolean;
}

export interface NotificationLog {
  id: string;
  type: 'BILLING_REMINDER' | 'PAYMENT_RECEIPT' | 'OUTAGE_NOTICE' | 'ISOLIR_ALERT' | 'UNISOLIR_NOTICE';
  channel: 'WHATSAPP' | 'TELEGRAM' | 'EMAIL' | 'BOTH';
  recipient: string; // phone or chat id or email
  recipientName: string;
  title: string;
  message: string;
  timestamp: string;
  status: 'SENT' | 'QUEUED' | 'FAILED';
  meta?: Record<string, any>;
}

export interface MikroTikConfig {
  host: string;
  port: number;
  username: string;
  password?: string;
  apiConnected: boolean;
  isolirAddressList: string;
  isolirPool: string;
  autoIsolirEnabled: boolean;
  gracePeriodDays: number;
  activeSessions: number;
  currentTrafficTxMbps: number;
  currentTrafficRxMbps: number;
  cpuLoadPercent: number;
  routerModel: string;
  routerOsVersion: string;
}

export interface GenieACSConfig {
  apiUrl: string;
  nbiPort: number;
  cwmpUrl: string;
  tr069Port: number;
  fsPort: number;
  nbiUsername?: string;
  nbiPassword?: string;
  informIntervalSeconds: number;
  autoSyncWifi: boolean;
  autoRebootOnLOS: boolean;
  opticalAlertDbmThreshold: number;
  connected: boolean;
  totalDevices: number;
  onlineDevices: number;
  offlineDevices: number;
  lastSyncTime: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'TESTING';
}

// ============ COMPANY & BANK SETTINGS ============
export interface BankAccount {
  id: string;
  bankName: string;
  bankCode?: string;
  accountNumber: string;
  accountHolder: string;
  branch: string;
  isPrimary: boolean;
  isActive: boolean;
}

export interface CompanyProfile {
  logoUrl: string | null;
  brandName: string;
  companyName: string;
  legalEntity: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  licenseNo: string; // NIB / Izin Kominfo
  termsAndConditions: string;
}

// ============ INTEGRATION CONFIGS ============
export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password?: string;
  fromEmail: string;
  fromName: string;
  enabled: boolean;
  status: 'CONNECTED' | 'DISCONNECTED' | 'TESTING';
}

export interface TripayConfig {
  mode: 'SANDBOX' | 'PRODUCTION';
  merchantCode: string;
  apiKey: string;
  privateKey: string;
  callbackUrl: string;
  enabledChannels: string[];
  enabled: boolean;
  status: 'CONNECTED' | 'DISCONNECTED' | 'TESTING';
}

export interface WhatsappConfig {
  provider: 'FONNTE' | 'WABLAS' | 'WHATSAPP_CLOUD' | 'MPWA';
  apiToken: string;
  senderNumber: string;
  webhookUrl: string;
  connected: boolean;
  qrState: 'CONNECTED' | 'QR_READY' | 'DISCONNECTED';
  status: 'CONNECTED' | 'DISCONNECTED' | 'TESTING';
}

export interface TelegramConfig {
  botToken: string;
  botUsername: string;
  adminChatId: string;
  channelId: string;
  enabled: boolean;
  status: 'CONNECTED' | 'DISCONNECTED' | 'TESTING';
}

export interface IntegrationsConfig {
  email: EmailConfig;
  tripay: TripayConfig;
  whatsapp: WhatsappConfig;
  mikrotik: MikroTikConfig;
  telegram: TelegramConfig;
}
