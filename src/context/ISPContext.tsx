import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  BankAccount,
  CompanyProfile,
  Customer,
  EmailConfig,
  GenieACSConfig,
  IntegrationsConfig,
  MikroTikConfig,
  NotificationLog,
  ODC,
  ODP,
  OutageAlert,
  PaymentTransaction,
  TelegramConfig,
  TripayConfig,
  WhatsappConfig,
  WifiPackage
} from '../types';
import {
  INITIAL_BANK_ACCOUNTS,
  INITIAL_COMPANY_PROFILE,
  INITIAL_CUSTOMERS,
  INITIAL_EMAIL_CONFIG,
  INITIAL_GENIEACS_CONFIG,
  INITIAL_MIKROTIK_CONFIG,
  INITIAL_NOTIFICATIONS,
  INITIAL_ODCS,
  INITIAL_ODPS,
  INITIAL_OUTAGES,
  INITIAL_PACKAGES,
  INITIAL_TELEGRAM_CONFIG,
  INITIAL_TRANSACTIONS,
  INITIAL_TRIPAY_CONFIG,
  INITIAL_WHATSAPP_CONFIG
} from '../data/mockData';

interface ISPContextType {
  // Current user role & logged-in customer
  currentView: 'ADMIN' | 'CUSTOMER_PORTAL' | 'LOGIN';
  setCurrentView: (view: 'ADMIN' | 'CUSTOMER_PORTAL' | 'LOGIN') => void;
  activeCustomerId: string;
  setActiveCustomerId: (id: string) => void;
  activeCustomer: Customer | undefined;
  
  // Data lists
  packages: WifiPackage[];
  customers: Customer[];
  transactions: PaymentTransaction[];
  odcs: ODC[];
  odps: ODP[];
  outages: OutageAlert[];
  notifications: NotificationLog[];
  mikrotikConfig: MikroTikConfig;
  genieacsConfig: GenieACSConfig;

  // Settings: Company & Bank Accounts
  companyProfile: CompanyProfile;
  updateCompanyProfile: (updates: Partial<CompanyProfile>) => void;
  uploadLogo: (base64OrUrl: string | null) => void;
  bankAccounts: BankAccount[];
  addBankAccount: (bank: Omit<BankAccount, 'id'>) => void;
  updateBankAccount: (id: string, updates: Partial<BankAccount>) => void;
  deleteBankAccount: (id: string) => void;
  setPrimaryBankAccount: (id: string) => void;

  // Integrations: Email, Tripay, WhatsApp, MikroTik, Telegram
  emailConfig: EmailConfig;
  updateEmailConfig: (updates: Partial<EmailConfig>) => void;
  testEmailConnection: (targetEmail?: string) => Promise<{ success: boolean; message: string }>;

  tripayConfig: TripayConfig;
  updateTripayConfig: (updates: Partial<TripayConfig>) => void;
  testTripayConnection: () => Promise<{ success: boolean; message: string }>;

  whatsappConfig: WhatsappConfig;
  updateWhatsappConfig: (updates: Partial<WhatsappConfig>) => void;
  testWhatsappConnection: (targetPhone?: string) => Promise<{ success: boolean; message: string }>;

  telegramConfig: TelegramConfig;
  updateTelegramConfig: (updates: Partial<TelegramConfig>) => void;
  testTelegramConnection: () => Promise<{ success: boolean; message: string }>;

  testMikrotikConnection: () => Promise<{ success: boolean; message: string }>;
  testGenieacsConnection: () => Promise<{ success: boolean; message: string }>;
  
  // Actions
  processPayment: (
    customerId: string,
    method: PaymentTransaction['paymentMethod'],
    customRef?: string
  ) => Promise<PaymentTransaction>;
  
  updateCustomerWifi: (
    customerId: string,
    newSsid: string,
    newPassword: string
  ) => Promise<{ success: boolean; message: string }>;
  
  changeCustomerPackage: (
    customerId: string,
    newPackageId: string
  ) => Promise<{ success: boolean; message: string }>;
  
  toggleCustomerIsolir: (
    customerId: string,
    reason?: string
  ) => { success: boolean; isIsolated: boolean };
  
  runAutoIsolirJob: () => { countIsolated: number; message: string };
  
  rebootCustomerOnt: (customerId: string) => Promise<{ success: boolean; message: string }>;
  
  createOutageAlert: (
    title: string,
    description: string,
    scope: OutageAlert['scope'],
    targetId: string | undefined,
    severity: OutageAlert['severity']
  ) => { outage: OutageAlert; waCount: number };
  
  sendCustomNotification: (
    type: NotificationLog['type'],
    channel: NotificationLog['channel'],
    recipient: string,
    recipientName: string,
    title: string,
    message: string
  ) => void;
  
  broadcastMonthlyBillingReminders: () => { sentCount: number; message: string };
  
  addCustomer: (cust: Omit<Customer, 'id' | 'customerNo'>) => Customer;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  
  updateMikrotikConfig: (updates: Partial<MikroTikConfig>) => void;
  updateGenieacsConfig: (updates: Partial<GenieACSConfig>) => void;
}

const ISPContext = createContext<ISPContextType | undefined>(undefined);

export const ISPProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Persistence with localStorage fallback
  const [currentView, setCurrentView] = useState<'ADMIN' | 'CUSTOMER_PORTAL' | 'LOGIN'>('ADMIN');
  const [activeCustomerId, setActiveCustomerId] = useState<string>('cust-002');
  
  const [packages] = useState<WifiPackage[]>(INITIAL_PACKAGES);
  
  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('isp_customers_v1');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });
  
  const [transactions, setTransactions] = useState<PaymentTransaction[]>(() => {
    const saved = localStorage.getItem('isp_transactions_v1');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });
  
  const [odcs] = useState<ODC[]>(INITIAL_ODCS);
  const [odps] = useState<ODP[]>(INITIAL_ODPS);
  
  const [outages, setOutages] = useState<OutageAlert[]>(() => {
    const saved = localStorage.getItem('isp_outages_v1');
    return saved ? JSON.parse(saved) : INITIAL_OUTAGES;
  });
  
  const [notifications, setNotifications] = useState<NotificationLog[]>(() => {
    const saved = localStorage.getItem('isp_notifications_v1');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });
  
  const [mikrotikConfig, setMikrotikConfig] = useState<MikroTikConfig>(() => {
    const saved = localStorage.getItem('isp_mikrotik_v1');
    return saved ? JSON.parse(saved) : INITIAL_MIKROTIK_CONFIG;
  });

  const [genieacsConfig, setGenieacsConfig] = useState<GenieACSConfig>(INITIAL_GENIEACS_CONFIG);

  // Settings State: Company & Bank Accounts
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>(() => {
    const saved = localStorage.getItem('isp_company_profile_v1');
    return saved ? JSON.parse(saved) : INITIAL_COMPANY_PROFILE;
  });

  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(() => {
    const saved = localStorage.getItem('isp_bank_accounts_v1');
    return saved ? JSON.parse(saved) : INITIAL_BANK_ACCOUNTS;
  });

  // Integrations State: Email, Tripay, WhatsApp, Telegram
  const [emailConfig, setEmailConfig] = useState<EmailConfig>(() => {
    const saved = localStorage.getItem('isp_email_config_v1');
    return saved ? JSON.parse(saved) : INITIAL_EMAIL_CONFIG;
  });

  const [tripayConfig, setTripayConfig] = useState<TripayConfig>(() => {
    const saved = localStorage.getItem('isp_tripay_config_v1');
    return saved ? JSON.parse(saved) : INITIAL_TRIPAY_CONFIG;
  });

  const [whatsappConfig, setWhatsappConfig] = useState<WhatsappConfig>(() => {
    const saved = localStorage.getItem('isp_whatsapp_config_v1');
    return saved ? JSON.parse(saved) : INITIAL_WHATSAPP_CONFIG;
  });

  const [telegramConfig, setTelegramConfig] = useState<TelegramConfig>(() => {
    const saved = localStorage.getItem('isp_telegram_config_v1');
    return saved ? JSON.parse(saved) : INITIAL_TELEGRAM_CONFIG;
  });

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('isp_customers_v1', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('isp_transactions_v1', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('isp_outages_v1', JSON.stringify(outages));
  }, [outages]);

  useEffect(() => {
    localStorage.setItem('isp_notifications_v1', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('isp_company_profile_v1', JSON.stringify(companyProfile));
  }, [companyProfile]);

  useEffect(() => {
    localStorage.setItem('isp_bank_accounts_v1', JSON.stringify(bankAccounts));
  }, [bankAccounts]);

  useEffect(() => {
    localStorage.setItem('isp_email_config_v1', JSON.stringify(emailConfig));
  }, [emailConfig]);

  useEffect(() => {
    localStorage.setItem('isp_tripay_config_v1', JSON.stringify(tripayConfig));
  }, [tripayConfig]);

  useEffect(() => {
    localStorage.setItem('isp_whatsapp_config_v1', JSON.stringify(whatsappConfig));
  }, [whatsappConfig]);

  useEffect(() => {
    localStorage.setItem('isp_telegram_config_v1', JSON.stringify(telegramConfig));
  }, [telegramConfig]);

  useEffect(() => {
    localStorage.setItem('isp_mikrotik_v1', JSON.stringify(mikrotikConfig));
  }, [mikrotikConfig]);

  const activeCustomer = customers.find(c => c.id === activeCustomerId);

  // Format IDR helper
  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
  };

  // Company Profile Actions
  const updateCompanyProfile = (updates: Partial<CompanyProfile>) => {
    setCompanyProfile(prev => ({ ...prev, ...updates }));
  };

  const uploadLogo = (base64OrUrl: string | null) => {
    setCompanyProfile(prev => ({ ...prev, logoUrl: base64OrUrl }));
  };

  // Bank Accounts Actions
  const addBankAccount = (bank: Omit<BankAccount, 'id'>) => {
    const newBank: BankAccount = {
      ...bank,
      id: `bank-${Date.now()}`
    };
    setBankAccounts(prev => [...prev, newBank]);
  };

  const updateBankAccount = (id: string, updates: Partial<BankAccount>) => {
    setBankAccounts(prev => prev.map(b => (b.id === id ? { ...b, ...updates } : b)));
  };

  const deleteBankAccount = (id: string) => {
    setBankAccounts(prev => prev.filter(b => b.id !== id));
  };

  const setPrimaryBankAccount = (id: string) => {
    setBankAccounts(prev =>
      prev.map(b => ({
        ...b,
        isPrimary: b.id === id
      }))
    );
  };

  // Integrations Config Actions & Live Tests
  const updateEmailConfig = (updates: Partial<EmailConfig>) => {
    setEmailConfig(prev => ({ ...prev, ...updates }));
  };

  const testEmailConnection = async (targetEmail?: string): Promise<{ success: boolean; message: string }> => {
    setEmailConfig(prev => ({ ...prev, status: 'TESTING' }));
    await new Promise(r => setTimeout(r, 1200));
    setEmailConfig(prev => ({ ...prev, status: 'CONNECTED' }));
    const emailTo = targetEmail || emailConfig.fromEmail || 'admin@isp.com';
    return {
      success: true,
      message: `Koneksi SMTP ${emailConfig.host}:${emailConfig.port} Berhasil! Email uji coba berhasil dikirim ke ${emailTo}.`
    };
  };

  const updateTripayConfig = (updates: Partial<TripayConfig>) => {
    setTripayConfig(prev => ({ ...prev, ...updates }));
  };

  const testTripayConnection = async (): Promise<{ success: boolean; message: string }> => {
    setTripayConfig(prev => ({ ...prev, status: 'TESTING' }));
    await new Promise(r => setTimeout(r, 1200));
    setTripayConfig(prev => ({ ...prev, status: 'CONNECTED' }));
    return {
      success: true,
      message: `Koneksi Payment Gateway Tripay (${tripayConfig.mode}) Berhasil! Merchant Code ${tripayConfig.merchantCode} valid & channel aktif: ${tripayConfig.enabledChannels.join(', ')}.`
    };
  };

  const updateWhatsappConfig = (updates: Partial<WhatsappConfig>) => {
    setWhatsappConfig(prev => ({ ...prev, ...updates }));
  };

  const testWhatsappConnection = async (targetPhone?: string): Promise<{ success: boolean; message: string }> => {
    setWhatsappConfig(prev => ({ ...prev, status: 'TESTING' }));
    await new Promise(r => setTimeout(r, 1000));
    setWhatsappConfig(prev => ({ ...prev, status: 'CONNECTED', connected: true, qrState: 'CONNECTED' }));
    const dest = targetPhone || whatsappConfig.senderNumber || '081234567890';
    return {
      success: true,
      message: `Gateway WhatsApp (${whatsappConfig.provider}) Berhasil Terhubung! Pesan pengujian berhasil dikirim ke nomor ${dest}.`
    };
  };

  const updateTelegramConfig = (updates: Partial<TelegramConfig>) => {
    setTelegramConfig(prev => ({ ...prev, ...updates }));
  };

  const testTelegramConnection = async (): Promise<{ success: boolean; message: string }> => {
    setTelegramConfig(prev => ({ ...prev, status: 'TESTING' }));
    await new Promise(r => setTimeout(r, 1000));
    setTelegramConfig(prev => ({ ...prev, status: 'CONNECTED' }));
    return {
      success: true,
      message: `Bot Telegram ${telegramConfig.botUsername} Terverifikasi! Pesan notifikasi percobaan berhasil dikirim ke Chat ID: ${telegramConfig.adminChatId}.`
    };
  };

  const testMikrotikConnection = async (): Promise<{ success: boolean; message: string }> => {
    setMikrotikConfig(prev => ({ ...prev, apiConnected: false }));
    await new Promise(r => setTimeout(r, 1100));
    setMikrotikConfig(prev => ({ ...prev, apiConnected: true }));
    return {
      success: true,
      message: `Koneksi API RouterOS MikroTik ${mikrotikConfig.host}:${mikrotikConfig.port} Berhasil! Terhubung ke perangkat ${mikrotikConfig.routerModel}.`
    };
  };

  const testGenieacsConnection = async (): Promise<{ success: boolean; message: string }> => {
    setGenieacsConfig(prev => ({ ...prev, status: 'TESTING' }));
    await new Promise(r => setTimeout(r, 1100));
    setGenieacsConfig(prev => ({
      ...prev,
      status: 'CONNECTED',
      connected: true,
      lastSyncTime: new Date().toISOString().replace('T', ' ').substring(0, 19)
    }));
    return {
      success: true,
      message: `Koneksi GenieACS TR-069 NBI (${genieacsConfig.apiUrl}) Berhasil! Terhubung ke server CWMP port ${genieacsConfig.tr069Port} & File Server port ${genieacsConfig.fsPort}. Terdeteksi ${genieacsConfig.totalDevices} ONT terdaftar.`
    };
  };

  // 1. Process Real-time Payment & Instant Un-isolir
  const processPayment = async (
    customerId: string,
    method: PaymentTransaction['paymentMethod'],
    customRef?: string
  ): Promise<PaymentTransaction> => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) throw new Error('Pelanggan tidak ditemukan');

    const pkg = packages.find(p => p.id === customer.packageId) || packages[1];
    const amount = customer.currentBill.amount || pkg.price;
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const invoiceNo = customer.currentBill.invoiceNo || `INV/${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}/${Math.floor(100 + Math.random() * 900)}`;
    const txRef = customRef || (method === 'TRIPAY' ? `TRIPAY-${tripayConfig.merchantCode}-${Math.floor(100000 + Math.random() * 900000)}` : `${method}-${Math.floor(100000 + Math.random() * 900000)}`);

    const newTx: PaymentTransaction = {
      id: `tx-${Date.now()}`,
      invoiceNo,
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      packageName: pkg.name,
      packageSpeed: pkg.speedMbps,
      amount,
      paidAt: nowStr,
      dueDate: customer.currentBill.dueDate,
      paymentMethod: method,
      paymentReference: txRef,
      status: 'SUCCESS',
      mikrotikUnisolated: true,
      genieAcsSynced: true,
      waReceiptSent: true,
      telegramReceiptSent: true,
      emailReceiptSent: emailConfig.enabled
    };

    // Update customer status: ACTIVE, clear overdue/unpaid bill
    setCustomers(prev =>
      prev.map(c => {
        if (c.id === customerId) {
          return {
            ...c,
            status: 'ACTIVE',
            currentBill: {
              ...c.currentBill,
              status: 'PAID',
              paidAt: nowStr,
              paymentMethod: method,
              paymentRef: txRef
            }
          };
        }
        return c;
      })
    );

    // Add transaction to history
    setTransactions(prev => [newTx, ...prev]);

    // Update MikroTik simulation
    setMikrotikConfig(prev => ({
      ...prev,
      activeSessions: prev.activeSessions + 1
    }));

    // Trigger Automated WhatsApp & Telegram Payment Notifications
    const waMsg = `*BUKTI PEMBAYARAN WIFI - ${companyProfile.brandName}*\n\nYth. Bpk/Ibu *${customer.name}*,\n\nPembayaran tagihan internet Anda sebesar *${formatRupiah(amount)}* (No: *${invoiceNo}*) telah BERHASIL diverifikasi melalui gateway *${method === 'TRIPAY' ? 'Tripay Multi-Channel' : method}*.\n\nStatus Akun: *AKTIF (Normal/Lancar)*\nKecepatan: *${pkg.downloadSpeed}*\nRef Gateway: ${txRef}\nTanggal: ${nowStr}\n\nLayanan MikroTik & ONT telah di-unisolir otomatis. Terima kasih telah mempercayai ${companyProfile.companyName}!`;

    const newNotifWA: NotificationLog = {
      id: `notif-${Date.now()}-wa`,
      type: 'PAYMENT_RECEIPT',
      channel: 'WHATSAPP',
      recipient: customer.phone,
      recipientName: customer.name,
      title: 'Pembayaran Diterima (WhatsApp)',
      message: waMsg,
      timestamp: nowStr,
      status: 'SENT'
    };

    const newNotifTG: NotificationLog = {
      id: `notif-${Date.now()}-tg`,
      type: 'PAYMENT_RECEIPT',
      channel: 'TELEGRAM',
      recipient: `${telegramConfig.botUsername} -> ChatID:${customer.customerNo}`,
      recipientName: customer.name,
      title: 'Notifikasi Transaksi (Telegram Bot)',
      message: `🔔 *PAYMENT RECEIVED!*\nPelanggan: ${customer.name} (${customer.customerNo})\nJumlah: ${formatRupiah(amount)}\nMetode: ${method}\nStatus Router: PPPoE Active & Un-isolated`,
      timestamp: nowStr,
      status: 'SENT'
    };

    const newNotifs = [newNotifWA, newNotifTG];

    if (emailConfig.enabled && customer.email) {
      newNotifs.push({
        id: `notif-${Date.now()}-em`,
        type: 'PAYMENT_RECEIPT',
        channel: 'EMAIL',
        recipient: customer.email,
        recipientName: customer.name,
        title: `E-Kwitansi Pembayaran ${invoiceNo}`,
        message: `Terima kasih! Pembayaran internet Anda sebesar ${formatRupiah(amount)} telah diterima. Bukti pembayaran digital telah diarsip di server.`,
        timestamp: nowStr,
        status: 'SENT'
      });
    }

    setNotifications(prev => [...newNotifs, ...prev]);

    return newTx;
  };

  // 2. Customer or Admin: Change WiFi SSID and Password directly (GenieACS sync)
  const updateCustomerWifi = async (
    customerId: string,
    newSsid: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> => {
    if (newPassword.length < 8) {
      return { success: false, message: 'Password WiFi minimal harus 8 karakter!' };
    }
    if (!newSsid.trim()) {
      return { success: false, message: 'Nama WiFi (SSID) tidak boleh kosong!' };
    }

    setCustomers(prev =>
      prev.map(c => {
        if (c.id === customerId) {
          return {
            ...c,
            wifiSSID: newSsid.trim(),
            wifiPassword: newPassword
          };
        }
        return c;
      })
    );

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const target = customers.find(c => c.id === customerId);

    if (target) {
      const waMsg = `*PEMBERITAHUAN GANTI PENGATURAN WIFI*\n\nYth. *${target.name}*,\nNama WiFi Anda telah diperbarui menjadi: *${newSsid}*\nPassword Baru: *${newPassword}*\n\nParameter ONT telah disinkronkan via GenieACS NBI. Hubungkan perangkat Anda dengan kata sandi baru.`;
      const notif: NotificationLog = {
        id: `notif-${Date.now()}-wifi`,
        type: 'PAYMENT_RECEIPT',
        channel: 'WHATSAPP',
        recipient: target.phone,
        recipientName: target.name,
        title: 'Konfirmasi Perubahan WiFi',
        message: waMsg,
        timestamp: nowStr,
        status: 'SENT'
      };
      setNotifications(prev => [notif, ...prev]);
    }

    return {
      success: true,
      message: 'Nama dan password WiFi berhasil diperbarui dan disinkronkan ke modem ONT via GenieACS!'
    };
  };

  // 3. Customer Self-Service Package Change
  const changeCustomerPackage = async (
    customerId: string,
    newPackageId: string
  ): Promise<{ success: boolean; message: string }> => {
    const pkg = packages.find(p => p.id === newPackageId);
    if (!pkg) return { success: false, message: 'Paket tidak ditemukan' };

    setCustomers(prev =>
      prev.map(c => {
        if (c.id === customerId) {
          return {
            ...c,
            packageId: newPackageId,
            currentBill: {
              ...c.currentBill,
              amount: pkg.price
            }
          };
        }
        return c;
      })
    );

    const target = customers.find(c => c.id === customerId);
    if (target) {
      const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
      const waMsg = `*PERUBAHAN PAKET WIFI BERHASIL*\n\nYth. *${target.name}*,\nPaket WiFi Anda telah diubah menjadi *${pkg.name} (${pkg.downloadSpeed})* seharga *${formatRupiah(pkg.price)}/bln*.\n\nBandwidth queue pada MikroTik telah diperbarui otomatis. Nikmati pengalaman internet lebih optimal!`;
      const notif: NotificationLog = {
        id: `notif-${Date.now()}-pkg`,
        type: 'BILLING_REMINDER',
        channel: 'WHATSAPP',
        recipient: target.phone,
        recipientName: target.name,
        title: 'Ubah Paket Internet Berhasil',
        message: waMsg,
        timestamp: nowStr,
        status: 'SENT'
      };
      setNotifications(prev => [notif, ...prev]);
    }

    return {
      success: true,
      message: `Paket berhasil diubah ke ${pkg.name} (${pkg.speedMbps} Mbps). Queue MikroTik disinkronkan!`
    };
  };

  // 4. Toggle Isolir / Buka Isolir Manual
  const toggleCustomerIsolir = (customerId: string, reason?: string) => {
    let nowIsolated = false;
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    setCustomers(prev =>
      prev.map(c => {
        if (c.id === customerId) {
          nowIsolated = c.status !== 'ISOLIR';
          const newStatus = nowIsolated ? 'ISOLIR' : 'ACTIVE';
          return {
            ...c,
            status: newStatus
          };
        }
        return c;
      })
    );

    const target = customers.find(c => c.id === customerId);
    if (target) {
      const title = nowIsolated ? 'Pemberitahuan Isolir Layanan' : 'Layanan Internet Telah Dibuka (Normal)';
      const waMsg = nowIsolated
        ? `*PEMBERITAHUAN ISOLIR LAYANAN*\n\nYth. ${target.name},\nLayanan internet Anda sementara dialihkan ke mode ISOLIR ${reason ? `karena: ${reason}` : 'terkait keterlambatan pembayaran'}.\nSilakan selesaikan pembayaran melalui portal pelanggan untuk membuka isolir seketika.`
        : `*PEMBERITAHUAN PEMULIHAN LAYANAN*\n\nYth. ${target.name},\nStatus isolir internet Anda telah dicabut. Layanan internet aktif kembali normal dengan kecepatan penuh. Terima kasih!`;

      const notif: NotificationLog = {
        id: `notif-${Date.now()}-toggle-iso`,
        type: nowIsolated ? 'ISOLIR_ALERT' : 'UNISOLIR_NOTICE',
        channel: 'WHATSAPP',
        recipient: target.phone,
        recipientName: target.name,
        title,
        message: waMsg,
        timestamp: nowStr,
        status: 'SENT'
      };
      setNotifications(prev => [notif, ...prev]);
    }

    return { success: true, isIsolated: nowIsolated };
  };

  // 5. Automated Cron / Isolir Otomatis for Overdue Customers
  const runAutoIsolirJob = () => {
    let count = 0;
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newNotifs: NotificationLog[] = [];

    setCustomers(prev =>
      prev.map(c => {
        if (c.status !== 'ISOLIR' && (c.currentBill.status === 'OVERDUE' || (c.currentBill.status === 'UNPAID' && c.billingDueDay <= new Date().getDate()))) {
          count++;
          const waMsg = `*PERINGATAN ISOLIR OTOMATIS MIKROTIK*\n\nYth. Bpk/Ibu *${c.name}* (${c.customerNo}),\nTagihan WiFi Anda sebesar *${formatRupiah(c.currentBill.amount)}* telah melampaui tanggal jatuh tempo (${c.currentBill.dueDate}).\n\nSistem Billing telah otomatis memasukkan IP ${c.ipAddress} ke Firewall Address-List ISOLIR MikroTik. Silakan bayar tagihan Anda melalui QRIS / Virtual Account / Tripay di portal untuk membuka isolir otomatis secara real-time.`;

          newNotifs.push({
            id: `notif-${Date.now()}-${c.id}`,
            type: 'ISOLIR_ALERT',
            channel: 'WHATSAPP',
            recipient: c.phone,
            recipientName: c.name,
            title: `Isolir Otomatis (${c.customerNo})`,
            message: waMsg,
            timestamp: nowStr,
            status: 'SENT'
          });

          return {
            ...c,
            status: 'ISOLIR',
            currentBill: {
              ...c.currentBill,
              status: 'OVERDUE'
            }
          };
        }
        return c;
      })
    );

    if (newNotifs.length > 0) {
      setNotifications(prev => [...newNotifs, ...prev]);
    }

    return {
      countIsolated: count,
      message: count > 0
        ? `Berhasil mengeksekusi Isolir Otomatis: ${count} pelanggan menunggak telah dialihkan ke Address-List Isolir MikroTik & dikirimi notifikasi WhatsApp.`
        : 'Tidak ada pelanggan yang menunggak melewati batas jatuh tempo hari ini.'
    };
  };

  // 6. Reboot Customer ONT remotely via GenieACS
  const rebootCustomerOnt = async (customerId: string) => {
    const cust = customers.find(c => c.id === customerId);
    if (!cust) return { success: false, message: 'Pelanggan tidak ditemukan' };

    return new Promise<{ success: boolean; message: string }>(resolve => {
      setTimeout(() => {
        setCustomers(prev =>
          prev.map(c => (c.id === customerId ? { ...c, uptimeHours: 0 } : c))
        );
        resolve({
          success: true,
          message: `Perintah Reboot berhasil dikirimkan via GenieACS ke ONT Serial ${cust.ontSerial} (${cust.ontModel}). Modem sedang merestart (estimasi 60 detik).`
        });
      }, 900);
    });
  };

  // 7. Create Outage Alert & Send WhatsApp Broadcast
  const createOutageAlert = (
    title: string,
    description: string,
    scope: OutageAlert['scope'],
    targetId: string | undefined,
    severity: OutageAlert['severity']
  ) => {
    let affectedList = customers;
    if (scope === 'ODC' && targetId) {
      affectedList = customers.filter(c => c.odcId === targetId);
    } else if (scope === 'ODP' && targetId) {
      affectedList = customers.filter(c => c.odpId === targetId);
    }

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newAlert: OutageAlert = {
      id: `outage-${Date.now()}`,
      ticketNo: `TKT-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(10 + Math.random() * 90)}`,
      title,
      description,
      scope,
      targetId,
      severity,
      affectedCustomerCount: affectedList.length,
      reportedAt: nowStr,
      estimatedResolution: 'Estimasi 1-2 Jam Perbaikan',
      status: 'OPEN',
      waBroadcastSent: true
    };

    setOutages(prev => [newAlert, ...prev]);

    const notifs: NotificationLog[] = affectedList.map(c => ({
      id: `notif-${Date.now()}-${c.id}-outage`,
      type: 'OUTAGE_NOTICE',
      channel: 'WHATSAPP',
      recipient: c.phone,
      recipientName: c.name,
      title: `Info Gangguan Jaringan: ${title}`,
      message: `*PEMBERITAHUAN GANGGUAN / PEMELIHARAAN JARINGAN*\n\nYth. Pelanggan *${c.name}*,\n\nKami menginformasikan adanya kendala jaringan fiber optic di area Anda:\n⚠️ *Kendala*: ${title}\n📝 *Deskripsi*: ${description}\n⏳ *Status*: Tim teknisi sedang menuju lokasi & melakukan penanganan.\n\nMohon maaf atas ketidaknyamanan ini. Layanan akan segera normal kembali. Terima kasih atas pengertiannya.`,
      timestamp: nowStr,
      status: 'SENT'
    }));

    setNotifications(prev => [...notifs, ...prev]);

    return { outage: newAlert, waCount: affectedList.length };
  };

  // 8. Custom Notification Sender
  const sendCustomNotification = (
    type: NotificationLog['type'],
    channel: NotificationLog['channel'],
    recipient: string,
    recipientName: string,
    title: string,
    message: string
  ) => {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newNotif: NotificationLog = {
      id: `notif-${Date.now()}`,
      type,
      channel,
      recipient,
      recipientName,
      title,
      message,
      timestamp: nowStr,
      status: 'SENT'
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // 9. Monthly Automated Billing Reminders Broadcast
  const broadcastMonthlyBillingReminders = () => {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const unpaidCusts = customers.filter(c => c.currentBill.status !== 'PAID');
    const newNotifs: NotificationLog[] = unpaidCusts.map(c => {
      const pkg = packages.find(p => p.id === c.packageId) || packages[0];
      return {
        id: `notif-${Date.now()}-${c.id}-bill`,
        type: 'BILLING_REMINDER',
        channel: 'WHATSAPP',
        recipient: c.phone,
        recipientName: c.name,
        title: `Tagihan WiFi ${c.currentBill.month} ${c.currentBill.year}`,
        message: `*PENGINGAT TAGIHAN BULANAN WIFI*\n\nYth. *${c.name}* (ID: ${c.customerNo}),\nTagihan internet Anda untuk periode *${c.currentBill.month} ${c.currentBill.year}* sebesar *${formatRupiah(c.currentBill.amount)}* (${pkg.downloadSpeed}) telah diterbitkan.\n\n📅 *Batas Pembayaran*: ${c.currentBill.dueDate}\n💳 *Bayar Praktis via Portal*: QRIS, Virtual Account, Tripay, Transfer Bank.\n\nHindari isolir otomatis dengan membayar tepat waktu. Terima kasih!`,
        timestamp: nowStr,
        status: 'SENT'
      };
    });

    if (newNotifs.length > 0) {
      setNotifications(prev => [...newNotifs, ...prev]);
    }

    return {
      sentCount: newNotifs.length,
      message: `Berhasil mengirim ${newNotifs.length} pesan pengingat tagihan otomatis via WhatsApp ke pelanggan.`
    };
  };

  // 10. CRUD Customer
  const addCustomer = (custData: Omit<Customer, 'id' | 'customerNo'>): Customer => {
    const newId = `cust-${String(customers.length + 1).padStart(3, '0')}`;
    const newNo = `NET-2024-${String(customers.length + 1).padStart(3, '0')}`;
    const newCustomer: Customer = {
      ...custData,
      id: newId,
      customerNo: newNo
    };
    setCustomers(prev => [...prev, newCustomer]);
    return newCustomer;
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers(prev => prev.map(c => (c.id === id ? { ...c, ...updates } : c)));
  };

  const deleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
  };

  const updateMikrotikConfig = (updates: Partial<MikroTikConfig>) => {
    setMikrotikConfig(prev => ({ ...prev, ...updates }));
  };

  const updateGenieacsConfig = (updates: Partial<GenieACSConfig>) => {
    setGenieacsConfig(prev => ({ ...prev, ...updates }));
  };

  return (
    <ISPContext.Provider
      value={{
        currentView,
        setCurrentView,
        activeCustomerId,
        setActiveCustomerId,
        activeCustomer,
        packages,
        customers,
        transactions,
        odcs,
        odps,
        outages,
        notifications,
        mikrotikConfig,
        genieacsConfig,
        companyProfile,
        updateCompanyProfile,
        uploadLogo,
        bankAccounts,
        addBankAccount,
        updateBankAccount,
        deleteBankAccount,
        setPrimaryBankAccount,
        emailConfig,
        updateEmailConfig,
        testEmailConnection,
        tripayConfig,
        updateTripayConfig,
        testTripayConnection,
        whatsappConfig,
        updateWhatsappConfig,
        testWhatsappConnection,
        telegramConfig,
        updateTelegramConfig,
        testTelegramConnection,
        testMikrotikConnection,
        testGenieacsConnection,
        processPayment,
        updateCustomerWifi,
        changeCustomerPackage,
        toggleCustomerIsolir,
        runAutoIsolirJob,
        rebootCustomerOnt,
        createOutageAlert,
        sendCustomNotification,
        broadcastMonthlyBillingReminders,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        updateMikrotikConfig,
        updateGenieacsConfig
      }}
    >
      {children}
    </ISPContext.Provider>
  );
};

export const useISP = () => {
  const context = useContext(ISPContext);
  if (!context) throw new Error('useISP must be used within an ISPProvider');
  return context;
};
