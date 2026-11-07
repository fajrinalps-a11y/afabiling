import {
  BankAccount,
  CompanyProfile,
  Customer,
  EmailConfig,
  GenieACSConfig,
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

export const INITIAL_PACKAGES: WifiPackage[] = [
  {
    id: 'pkg-7m',
    name: 'Home Starter',
    speedMbps: 7,
    price: 150000,
    description: 'Cocok untuk browsing, media sosial, streaming YouTube SD/HD, dan 1-3 perangkat.',
    downloadSpeed: '7 Mbps',
    uploadSpeed: '3.5 Mbps',
    recommendedFor: 'Keluarga kecil & Pelajar',
    isPopular: false
  },
  {
    id: 'pkg-15m',
    name: 'Home Family Pro',
    speedMbps: 15,
    price: 200000,
    description: 'Paling favorit! Ideal untuk streaming Full HD, Zoom meeting, gaming kasual & hingga 7 perangkat.',
    downloadSpeed: '15 Mbps',
    uploadSpeed: '7.5 Mbps',
    recommendedFor: 'Keluarga 4-6 Orang & WFH',
    isPopular: true
  },
  {
    id: 'pkg-30m',
    name: 'Ultra Gamer & Bisnis',
    speedMbps: 30,
    price: 250000,
    description: 'Kecepatan maksimal untuk 4K Ultra HD streaming, online gaming latency rendah, upload video cepat.',
    downloadSpeed: '30 Mbps',
    uploadSpeed: '15 Mbps',
    recommendedFor: 'Gamer, Konten Kreator & UMKM',
    isPopular: false
  }
];

export const INITIAL_ODCS: ODC[] = [
  {
    id: 'odc-01',
    name: 'ODC Pusat Kemayoran',
    code: 'ODC-KMY-01',
    locationName: 'Jl. Garuda No. 45, Kemayoran',
    capacityCores: 144,
    usedCores: 86,
    lat: -6.1605,
    lng: 106.8480,
    status: 'NORMAL'
  },
  {
    id: 'odc-02',
    name: 'ODC Cempaka Indah',
    code: 'ODC-CPK-02',
    locationName: 'Simpang Cempaka Putih Raya',
    capacityCores: 96,
    usedCores: 74,
    lat: -6.1750,
    lng: 106.8650,
    status: 'WARNING'
  }
];

export const INITIAL_ODPS: ODP[] = [
  {
    id: 'odp-01-a',
    odcId: 'odc-01',
    name: 'ODP RT 03 Garuda Mas',
    code: 'ODP-KMY-01/04',
    poleNumber: 'PLN-KMY-142',
    capacityPorts: 16,
    usedPorts: 12,
    lat: -6.1585,
    lng: 106.8455,
    status: 'NORMAL',
    rxDbmAverage: -19.4
  },
  {
    id: 'odp-01-b',
    odcId: 'odc-01',
    name: 'ODP Gang Remaja 2',
    code: 'ODP-KMY-01/08',
    poleNumber: 'PLN-KMY-189',
    capacityPorts: 8,
    usedPorts: 7,
    lat: -6.1630,
    lng: 106.8505,
    status: 'NORMAL',
    rxDbmAverage: -20.1
  },
  {
    id: 'odp-02-a',
    odcId: 'odc-02',
    name: 'ODP Cempaka Gardenia 1',
    code: 'ODP-CPK-02/02',
    poleNumber: 'PLN-CPK-088',
    capacityPorts: 16,
    usedPorts: 14,
    lat: -6.1725,
    lng: 106.8620,
    status: 'NORMAL',
    rxDbmAverage: -18.7
  },
  {
    id: 'odp-02-b',
    odcId: 'odc-02',
    name: 'ODP Perintis Kemerdekaan',
    code: 'ODP-CPK-02/09',
    poleNumber: 'PLN-CPK-114',
    capacityPorts: 8,
    usedPorts: 8,
    lat: -6.1780,
    lng: 106.8685,
    status: 'FULL',
    rxDbmAverage: -22.3
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-001',
    customerNo: 'NET-2024-001',
    name: 'Budi Santoso',
    phone: '081234567890',
    email: 'budi.santoso@gmail.com',
    address: 'Jl. Garuda Mas Blok B3 No. 12, RT 03/RW 04',
    packageId: 'pkg-15m',
    status: 'ACTIVE',
    pppoeUsername: 'budi_garuda12',
    pppoePassword: 'pwd_budi_secure',
    ipAddress: '10.20.15.42',
    macAddress: 'BC:67:1C:89:12:34',
    wifiSSID: 'Budi_Home_5G',
    wifiPassword: 'santoso_family123',
    ontSerial: 'ZTEGC901B824',
    ontModel: 'ZTE ZXHN F609 V5.3',
    opticalPowerRx: -18.6,
    uptimeHours: 342,
    deviceConnected: true,
    odcId: 'odc-01',
    odpId: 'odp-01-a',
    odpPort: 3,
    lat: -6.1578,
    lng: 106.8462,
    joinDate: '2024-01-15',
    billingDueDay: 10,
    dataUsageCurrentMonthGB: 148.5,
    fupLimitGB: 500,
    currentBill: {
      invoiceNo: 'INV/202611/001',
      month: 'November',
      year: 2026,
      amount: 200000,
      dueDate: '2026-11-10',
      status: 'PAID',
      paidAt: '2026-11-05 14:22:10',
      paymentMethod: 'QRIS',
      paymentRef: 'QRIS-MID-992147'
    }
  },
  {
    id: 'cust-002',
    customerNo: 'NET-2024-002',
    name: 'Siti Rahmawati',
    phone: '085712348899',
    email: 'siti.rahma@yahoo.com',
    address: 'Jl. Remaja II No. 8A, RT 01/RW 02',
    packageId: 'pkg-7m',
    status: 'ISOLIR',
    pppoeUsername: 'siti_remaja08',
    pppoePassword: 'pwd_siti_1234',
    ipAddress: '10.20.7.19',
    macAddress: 'F4:8E:38:11:90:AB',
    wifiSSID: 'Rahma_WiFi_Fiber',
    wifiPassword: 'berkah_selalu2024',
    ontSerial: 'HWTC4588912A',
    ontModel: 'Huawei HG8245H5',
    opticalPowerRx: -21.2,
    uptimeHours: 120,
    deviceConnected: true,
    odcId: 'odc-01',
    odpId: 'odp-01-b',
    odpPort: 5,
    lat: -6.1622,
    lng: 106.8512,
    joinDate: '2024-02-01',
    billingDueDay: 5,
    dataUsageCurrentMonthGB: 82.1,
    fupLimitGB: 300,
    currentBill: {
      invoiceNo: 'INV/202611/002',
      month: 'November',
      year: 2026,
      amount: 150000,
      dueDate: '2026-11-05',
      status: 'OVERDUE'
    }
  },
  {
    id: 'cust-003',
    customerNo: 'NET-2024-003',
    name: 'Rian Pratama',
    phone: '081399887711',
    email: 'rian.gaming@gmail.com',
    address: 'Perum Cempaka Indah Kav. 19',
    packageId: 'pkg-30m',
    status: 'PENDING_PAYMENT',
    pppoeUsername: 'rian_cempaka19',
    pppoePassword: 'pwd_rian_gamer',
    ipAddress: '10.20.30.88',
    macAddress: 'E0:CC:7A:44:81:66',
    wifiSSID: 'Valo_HighPingNoNo',
    wifiPassword: 'headshotking99',
    ontSerial: 'FHCP88319980',
    ontModel: 'Fiberhome AN5506-04',
    opticalPowerRx: -17.9,
    uptimeHours: 512,
    deviceConnected: true,
    odcId: 'odc-02',
    odpId: 'odp-02-a',
    odpPort: 7,
    lat: -6.1718,
    lng: 106.8631,
    joinDate: '2024-03-10',
    billingDueDay: 15,
    dataUsageCurrentMonthGB: 340.8,
    fupLimitGB: 1000,
    currentBill: {
      invoiceNo: 'INV/202611/003',
      month: 'November',
      year: 2026,
      amount: 250000,
      dueDate: '2026-11-15',
      status: 'UNPAID'
    }
  },
  {
    id: 'cust-004',
    customerNo: 'NET-2024-004',
    name: 'Dr. Hendra Wijaya',
    phone: '081198765432',
    email: 'dr.hendra@klinik.co.id',
    address: 'Ruko Perintis No. 3, Cempaka Putih',
    packageId: 'pkg-30m',
    status: 'ACTIVE',
    pppoeUsername: 'hendra_klinik03',
    pppoePassword: 'pwd_hendra_doc',
    ipAddress: '10.20.30.95',
    macAddress: '00:1E:67:9A:88:CC',
    wifiSSID: 'Klinik_Hendra_FreeWiFi',
    wifiPassword: 'sehatselalu2026',
    ontSerial: 'ZTEGC8811449',
    ontModel: 'ZTE ZXHN F670L DualBand',
    opticalPowerRx: -19.1,
    uptimeHours: 720,
    deviceConnected: true,
    odcId: 'odc-02',
    odpId: 'odp-02-b',
    odpPort: 2,
    lat: -6.1772,
    lng: 106.8679,
    joinDate: '2023-11-20',
    billingDueDay: 10,
    dataUsageCurrentMonthGB: 412.3,
    fupLimitGB: 1000,
    currentBill: {
      invoiceNo: 'INV/202611/004',
      month: 'November',
      year: 2026,
      amount: 250000,
      dueDate: '2026-11-10',
      status: 'PAID',
      paidAt: '2026-11-04 09:15:30',
      paymentMethod: 'BCA_VA',
      paymentRef: 'VA-BCA-8829104'
    }
  },
  {
    id: 'cust-005',
    customerNo: 'NET-2024-005',
    name: 'Dewi Lestari',
    phone: '087812993344',
    email: 'dewi.lestari@gmail.com',
    address: 'Jl. Garuda Mas No. 5B',
    packageId: 'pkg-15m',
    status: 'ACTIVE',
    pppoeUsername: 'dewi_garuda05',
    pppoePassword: 'pwd_dewi_pass',
    ipAddress: '10.20.15.56',
    macAddress: 'D8:07:B6:33:41:99',
    wifiSSID: 'Dewi_Family_Net',
    wifiPassword: 'cantikbersama22',
    ontSerial: 'HWTC99441122',
    ontModel: 'Huawei HG8245H5',
    opticalPowerRx: -20.5,
    uptimeHours: 210,
    deviceConnected: true,
    odcId: 'odc-01',
    odpId: 'odp-01-a',
    odpPort: 8,
    lat: -6.1590,
    lng: 106.8448,
    joinDate: '2024-04-12',
    billingDueDay: 10,
    dataUsageCurrentMonthGB: 189.4,
    fupLimitGB: 500,
    currentBill: {
      invoiceNo: 'INV/202611/005',
      month: 'November',
      year: 2026,
      amount: 200000,
      dueDate: '2026-11-10',
      status: 'PAID',
      paidAt: '2026-11-06 18:40:11',
      paymentMethod: 'DANA',
      paymentRef: 'DANA-WAL-771923'
    }
  }
];

export const INITIAL_TRANSACTIONS: PaymentTransaction[] = [
  {
    id: 'tx-001',
    invoiceNo: 'INV/202611/001',
    customerId: 'cust-001',
    customerName: 'Budi Santoso',
    customerPhone: '081234567890',
    packageName: 'Home Family Pro',
    packageSpeed: 15,
    amount: 200000,
    paidAt: '2026-11-05 14:22:10',
    dueDate: '2026-11-10',
    paymentMethod: 'QRIS',
    paymentReference: 'QRIS-MID-992147',
    status: 'SUCCESS',
    mikrotikUnisolated: true,
    genieAcsSynced: true,
    waReceiptSent: true,
    telegramReceiptSent: true
  },
  {
    id: 'tx-004',
    invoiceNo: 'INV/202611/004',
    customerId: 'cust-004',
    customerName: 'Dr. Hendra Wijaya',
    customerPhone: '081198765432',
    packageName: 'Ultra Gamer & Bisnis',
    packageSpeed: 30,
    amount: 250000,
    paidAt: '2026-11-04 09:15:30',
    dueDate: '2026-11-10',
    paymentMethod: 'BCA_VA',
    paymentReference: 'VA-BCA-8829104',
    status: 'SUCCESS',
    mikrotikUnisolated: true,
    genieAcsSynced: true,
    waReceiptSent: true,
    telegramReceiptSent: true
  },
  {
    id: 'tx-005',
    invoiceNo: 'INV/202611/005',
    customerId: 'cust-005',
    customerName: 'Dewi Lestari',
    customerPhone: '087812993344',
    packageName: 'Home Family Pro',
    packageSpeed: 15,
    amount: 200000,
    paidAt: '2026-11-06 18:40:11',
    dueDate: '2026-11-10',
    paymentMethod: 'DANA',
    paymentReference: 'DANA-WAL-771923',
    status: 'SUCCESS',
    mikrotikUnisolated: true,
    genieAcsSynced: true,
    waReceiptSent: true,
    telegramReceiptSent: true
  },
  // Previous month records for monthly revenue charts
  {
    id: 'tx-oct-01',
    invoiceNo: 'INV/202610/001',
    customerId: 'cust-001',
    customerName: 'Budi Santoso',
    customerPhone: '081234567890',
    packageName: 'Home Family Pro',
    packageSpeed: 15,
    amount: 200000,
    paidAt: '2026-10-06 11:10:00',
    dueDate: '2026-10-10',
    paymentMethod: 'QRIS',
    paymentReference: 'QRIS-OCT-1001',
    status: 'SUCCESS',
    mikrotikUnisolated: true,
    genieAcsSynced: true,
    waReceiptSent: true,
    telegramReceiptSent: true
  },
  {
    id: 'tx-oct-02',
    invoiceNo: 'INV/202610/002',
    customerId: 'cust-002',
    customerName: 'Siti Rahmawati',
    customerPhone: '085712348899',
    packageName: 'Home Starter',
    packageSpeed: 7,
    amount: 150000,
    paidAt: '2026-10-05 08:30:22',
    dueDate: '2026-10-05',
    paymentMethod: 'GOPAY',
    paymentReference: 'GOPAY-OCT-1002',
    status: 'SUCCESS',
    mikrotikUnisolated: true,
    genieAcsSynced: true,
    waReceiptSent: true,
    telegramReceiptSent: true
  },
  {
    id: 'tx-oct-03',
    invoiceNo: 'INV/202610/003',
    customerId: 'cust-003',
    customerName: 'Rian Pratama',
    customerPhone: '081399887711',
    packageName: 'Ultra Gamer & Bisnis',
    packageSpeed: 30,
    amount: 250000,
    paidAt: '2026-10-12 17:18:40',
    dueDate: '2026-10-15',
    paymentMethod: 'MANDIRI_VA',
    paymentReference: 'VA-MAN-OCT-1003',
    status: 'SUCCESS',
    mikrotikUnisolated: true,
    genieAcsSynced: true,
    waReceiptSent: true,
    telegramReceiptSent: true
  },
  {
    id: 'tx-oct-04',
    invoiceNo: 'INV/202610/004',
    customerId: 'cust-004',
    customerName: 'Dr. Hendra Wijaya',
    customerPhone: '081198765432',
    packageName: 'Ultra Gamer & Bisnis',
    packageSpeed: 30,
    amount: 250000,
    paidAt: '2026-10-08 10:04:12',
    dueDate: '2026-10-10',
    paymentMethod: 'BCA_VA',
    paymentReference: 'VA-BCA-OCT-1004',
    status: 'SUCCESS',
    mikrotikUnisolated: true,
    genieAcsSynced: true,
    waReceiptSent: true,
    telegramReceiptSent: true
  },
  {
    id: 'tx-oct-05',
    invoiceNo: 'INV/202610/005',
    customerId: 'cust-005',
    customerName: 'Dewi Lestari',
    customerPhone: '087812993344',
    packageName: 'Home Family Pro',
    packageSpeed: 15,
    amount: 200000,
    paidAt: '2026-10-09 20:11:55',
    dueDate: '2026-10-10',
    paymentMethod: 'QRIS',
    paymentReference: 'QRIS-OCT-1005',
    status: 'SUCCESS',
    mikrotikUnisolated: true,
    genieAcsSynced: true,
    waReceiptSent: true,
    telegramReceiptSent: true
  }
];

export const INITIAL_OUTAGES: OutageAlert[] = [
  {
    id: 'outage-01',
    ticketNo: 'TKT-202611-042',
    title: 'Pemeliharaan Rutin Jalur Fiber Core ODC Cempaka',
    description: 'Penyambungan ulang core fiber feeder ODC-CPK-02 untuk optimasi redaman dan stabilitas koneksi.',
    scope: 'ODC',
    targetId: 'odc-02',
    severity: 'MEDIUM',
    affectedCustomerCount: 2,
    reportedAt: '2026-11-06 23:00',
    estimatedResolution: '2026-11-07 04:00 (Selesai)',
    status: 'RESOLVED',
    waBroadcastSent: true
  }
];

export const INITIAL_NOTIFICATIONS: NotificationLog[] = [
  {
    id: 'notif-01',
    type: 'PAYMENT_RECEIPT',
    channel: 'BOTH',
    recipient: '081234567890 / @budi_santoso',
    recipientName: 'Budi Santoso',
    title: 'Pembayaran Berhasil Diterima',
    message: 'Halo Budi Santoso, pembayaran WiFi paket Home Family Pro (15 Mbps) sebesar Rp 200.000 (No. Tagihan INV/202611/001) telah berhasil diverifikasi via QRIS. Status internet: AKTIF. Terima kasih!',
    timestamp: '2026-11-05 14:22:15',
    status: 'SENT'
  },
  {
    id: 'notif-02',
    type: 'ISOLIR_ALERT',
    channel: 'WHATSAPP',
    recipient: '085712348899',
    recipientName: 'Siti Rahmawati',
    title: 'Pemberitahuan Isolir Layanan Otomatis',
    message: 'Yth. Pelanggan Siti Rahmawati (ID: NET-2024-002), tagihan periode November 2026 sebesar Rp 150.000 telah melewati batas jatuh tempo (05/11/2026). Layanan internet Anda telah disesuaikan ke mode ISOLIR otomatis. Silakan lakukan pembayaran online di portal mandiri untuk aktivasi instan tanpa biaya tambahan.',
    timestamp: '2026-11-06 00:01:00',
    status: 'SENT'
  },
  {
    id: 'notif-03',
    type: 'BILLING_REMINDER',
    channel: 'WHATSAPP',
    recipient: '081399887711',
    recipientName: 'Rian Pratama',
    title: 'Pengingat Tagihan WiFi Bulanan',
    message: 'Halo Rian Pratama, tagihan WiFi bulan November 2026 sebesar Rp 250.000 (30 Mbps) akan jatuh tempo pada 15 November 2026. Bayar lebih awal melalui QRIS / Virtual Account di portal mandiri untuk kelancaran berinternet tanpa jeda.',
    timestamp: '2026-11-06 09:00:00',
    status: 'SENT'
  }
];

export const INITIAL_MIKROTIK_CONFIG: MikroTikConfig = {
  host: '192.168.88.1',
  port: 8728,
  username: 'admin_isp',
  apiConnected: true,
  isolirAddressList: 'ISOLIR_USER_BLOCKED',
  isolirPool: 'pool_isolir_10.200.0.0/24',
  autoIsolirEnabled: true,
  gracePeriodDays: 2,
  activeSessions: 84,
  currentTrafficTxMbps: 218.4,
  currentTrafficRxMbps: 489.2,
  cpuLoadPercent: 18,
  routerModel: 'MikroTik CCR2004-16G-2S+',
  routerOsVersion: 'RouterOS v7.16 (Stable)'
};

export const INITIAL_GENIEACS_CONFIG: GenieACSConfig = {
  apiUrl: 'http://acs.isp-netbilling.local:7557',
  nbiPort: 7557,
  cwmpUrl: 'http://acs.isp-netbilling.local:7547',
  tr069Port: 7547,
  fsPort: 7567,
  nbiUsername: 'genieacs_nbi_user',
  nbiPassword: 'nbi_secret_key_8829',
  informIntervalSeconds: 300,
  autoSyncWifi: true,
  autoRebootOnLOS: false,
  opticalAlertDbmThreshold: -27,
  connected: true,
  totalDevices: 95,
  onlineDevices: 92,
  offlineDevices: 3,
  lastSyncTime: '2026-11-07 01:10:00',
  status: 'CONNECTED'
};

export const INITIAL_COMPANY_PROFILE: CompanyProfile = {
  logoUrl: null,
  brandName: 'NetBilling Pro',
  companyName: 'PT. Nusantara Telekomunikasi Digital',
  legalEntity: 'Perseroan Terbatas (PT)',
  description: 'Penyedia Layanan Internet Dedicated & Broadband Fiber Optic Berkecepatan Tinggi untuk Perumahan, Kantor, dan Pelaku Usaha UMKM.',
  address: 'Jl. Garuda No. 45, Kemayoran, Jakarta Pusat, DKI Jakarta 10610',
  phone: '0812-3456-7890 / (021) 8899-2345',
  email: 'helpdesk@netbilling.co.id',
  website: 'https://netbilling.co.id',
  licenseNo: 'NIB: 912000847192 / KOMINFO-ISP-2024/098',
  termsAndConditions: `SYARAT DAN KETENTUAN LAYANAN INTERNET NETBILLING PRO

1. KETENTUAN BERLANGGANAN & PEMBAYARAN:
- Tagihan langganan internet bulanan diterbitkan setiap awal siklus dan harus dibayarkan selambat-lambatnya pada tanggal jatuh tempo yang tertera pada faktur.
- Pembayaran dapat dilakukan secara real-time melalui Payment Gateway Tripay (QRIS Dinamis, Virtual Account BCA, BRI, Mandiri, BNI, e-Wallet) atau transfer langsung ke Rekening Bank resmi perusahaan.

2. KEBIJAKAN ISOLIR OTOMATIS:
- Apabila tagihan belum diselesaikan setelah melewati tanggal jatuh tempo ditambah masa toleransi (Grace Period 2 hari), sistem secara otomatis akan mengalihkan koneksi pelanggan ke status ISOLIR melalui firewall MikroTik RouterOS.
- Pembukaan status isolir dilakukan secara otomatis dan instan (kurang dari 10 detik) setelah pembayaran sukses diverifikasi oleh Payment Gateway Tripay atau sistem perbankan.

3. KUALITAS LAYANAN (SLA) & PEMELIHARAAN:
- Penyedia berkomitmen menjaga ketersediaan layanan (Uptime Service Level Agreement) minimal 99.5% setiap bulannya.
- Pemberitahuan pemeliharaan terencana atau gangguan darurat (kabel putus / optical attenuation) akan disiarkan secara otomatis kepada pelanggan terdampak melalui WhatsApp resmi.

4. PENGGUNAAN PERANGKAT (ONT/ROUTER):
- Perangkat modem ONT yang dipasang di tempat pelanggan merupakan fasilitas pinjam-pakai dan dikelola secara remote melalui sistem TR-069 GenieACS untuk pemantauan redaman sinyal dan reboot mandiri.
- Pelanggan berhak mengubah nama WiFi (SSID) dan kata sandi mandiri melalui portal pelanggan.

5. KEBIJAKAN PENGGUNAAN WAJAR (FUP) & LARANGAN:
- Pelanggan dilarang keras menyalahgunakan koneksi internet untuk kegiatan ilegal, penipuan online, penyebaran malware, atau tindakan yang melanggar Undang-Undang Informasi dan Transaksi Elektronik (UU ITE).`
};

export const INITIAL_BANK_ACCOUNTS: BankAccount[] = [
  {
    id: 'bank-bca-01',
    bankName: 'Bank Central Asia (BCA)',
    bankCode: '014',
    accountNumber: '8829-1029-4411',
    accountHolder: 'PT. Nusantara Telekomunikasi Digital',
    branch: 'KCU Kemayoran, Jakarta Pusat',
    isPrimary: true,
    isActive: true
  },
  {
    id: 'bank-mandiri-02',
    bankName: 'Bank Mandiri',
    bankCode: '008',
    accountNumber: '120-00-9988776-5',
    accountHolder: 'PT. Nusantara Telekomunikasi Digital',
    branch: 'KC Cempaka Putih Raya',
    isPrimary: false,
    isActive: true
  },
  {
    id: 'bank-bri-03',
    bankName: 'Bank Rakyat Indonesia (BRI)',
    bankCode: '002',
    accountNumber: '0341-01-002819-30-2',
    accountHolder: 'PT. Nusantara Telekomunikasi Digital',
    branch: 'KCP Pasar Senen',
    isPrimary: false,
    isActive: true
  }
];

export const INITIAL_EMAIL_CONFIG: EmailConfig = {
  host: 'smtp.mailgun.org',
  port: 587,
  secure: false,
  username: 'postmaster@mg.netbilling.co.id',
  password: 'smtp_password_secure_key',
  fromEmail: 'billing@netbilling.co.id',
  fromName: 'NetBilling Pro Billing System',
  enabled: true,
  status: 'CONNECTED'
};

export const INITIAL_TRIPAY_CONFIG: TripayConfig = {
  mode: 'SANDBOX',
  merchantCode: 'T12984',
  apiKey: 'DEV-sk_live_tripay9812497120194882',
  privateKey: 'priv_key_99217482910482910482',
  callbackUrl: 'https://app.netbilling.co.id/api/callback/tripay',
  enabledChannels: ['QRIS', 'BCAVA', 'BRIVA', 'MANDIRIVA', 'BNIVA', 'PERMATAVA', 'OVO', 'DANA'],
  enabled: true,
  status: 'CONNECTED'
};

export const INITIAL_WHATSAPP_CONFIG: WhatsappConfig = {
  provider: 'FONNTE',
  apiToken: 'FONNTE_TOKEN_88291049281739281',
  senderNumber: '0812-3456-7890',
  webhookUrl: 'https://app.netbilling.co.id/api/webhook/whatsapp',
  connected: true,
  qrState: 'CONNECTED',
  status: 'CONNECTED'
};

export const INITIAL_TELEGRAM_CONFIG: TelegramConfig = {
  botToken: '719827391:AAHk_NetBillingIspNotificationBotToken_xyz',
  botUsername: '@NetBillingIspBot',
  adminChatId: '-100192837482',
  channelId: '@netbilling_broadcast',
  enabled: true,
  status: 'CONNECTED'
};

