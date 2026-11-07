import React, { useState } from 'react';
import { useISP } from '../context/ISPContext';
import { Customer, PaymentTransaction, WifiPackage } from '../types';
import { GisMap } from './GisMap';
import { MikrotikBridge } from './MikrotikBridge';
import { GenieAcsBridge } from './GenieAcsBridge';
import { NotificationCenter } from './NotificationCenter';
import { ReceiptModal } from './ReceiptModal';
import { SettingsManager } from './SettingsManager';
import { IntegrationsManager } from './IntegrationsManager';
import {
  TrendingUp,
  DollarSign,
  Users,
  ShieldAlert,
  Zap,
  Activity,
  CreditCard,
  Wifi,
  Search,
  Plus,
  Edit,
  Trash2,
  Lock,
  Unlock,
  KeyRound,
  Signal,
  MapPin,
  CheckCircle2,
  RotateCw,
  Printer,
  ChevronRight,
  Sliders,
  Radio,
  BellRing,
  Settings
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    customers,
    packages,
    transactions,
    odcs,
    odps,
    toggleCustomerIsolir,
    runAutoIsolirJob,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    updateCustomerWifi,
    rebootCustomerOnt
  } = useISP();

  const [activeTab, setActiveTab] = useState<
    'OVERVIEW' | 'CUSTOMERS' | 'GIS_MAP' | 'MIKROTIK' | 'GENIEACS' | 'NOTIFICATIONS' | 'INTEGRATIONS' | 'SETTINGS'
  >('OVERVIEW');

  // Search & Filter in Customers tab
  const [custSearch, setCustSearch] = useState('');
  const [custStatusFilter, setCustStatusFilter] = useState<'ALL' | 'ACTIVE' | 'ISOLIR' | 'UNPAID'>('ALL');

  // Modals state
  const [showAddCustModal, setShowAddCustModal] = useState(false);
  const [editingCust, setEditingCust] = useState<Customer | null>(null);
  const [showWifiEditModal, setShowWifiEditModal] = useState<Customer | null>(null);
  const [newWifiSsid, setNewWifiSsid] = useState('');
  const [newWifiPassword, setNewWifiPassword] = useState('');
  const [wifiUpdateMsg, setWifiUpdateMsg] = useState<string | null>(null);

  // Receipt Modal state
  const [selectedTx, setSelectedTx] = useState<PaymentTransaction | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // New Customer Form state
  const [newCustForm, setNewCustForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    packageId: 'pkg-15m',
    wifiSSID: 'WiFi_Home_Net',
    wifiPassword: 'password123',
    ontSerial: `ZTEGC${Math.floor(1000000 + Math.random() * 9000000)}`,
    ontModel: 'ZTE ZXHN F609 V5.3',
    opticalPowerRx: -19.2,
    odcId: 'odc-01',
    odpId: 'odp-01-a',
    odpPort: 4,
    lat: -6.1600,
    lng: 106.8480,
    billingDueDay: 10
  });

  // Financial calculations
  const totalPaidRevenue = transactions
    .filter(t => t.paidAt.startsWith('2026-11'))
    .reduce((acc, t) => acc + t.amount, 0);

  const totalOverdueRevenue = customers
    .filter(c => c.currentBill.status !== 'PAID')
    .reduce((acc, c) => acc + c.currentBill.amount, 0);

  const mrrTarget = customers.reduce((acc, c) => {
    const pkg = packages.find(p => p.id === c.packageId);
    return acc + (pkg ? pkg.price : 200000);
  }, 0);

  const activeCount = customers.filter(c => c.status === 'ACTIVE').length;
  const isolatedCount = customers.filter(c => c.status === 'ISOLIR').length;
  const arpu = customers.length > 0 ? Math.round(mrrTarget / customers.length) : 0;

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(num);
  };

  // Submit New Customer
  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    const pkg = packages.find(p => p.id === newCustForm.packageId) || packages[1];
    const newNo = `NET-2024-${String(customers.length + 1).padStart(3, '0')}`;
    const nowMonth = 'November';
    const nowYear = 2026;

    addCustomer({
      name: newCustForm.name,
      phone: newCustForm.phone,
      email: newCustForm.email || `${newCustForm.name.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      address: newCustForm.address,
      packageId: newCustForm.packageId,
      status: 'ACTIVE',
      pppoeUsername: `${newCustForm.name.toLowerCase().replace(/[^a-z0-9]/g, '')}_${Math.floor(10 + Math.random() * 90)}`,
      pppoePassword: 'pass_' + Math.floor(1000 + Math.random() * 9000),
      ipAddress: `10.20.${pkg.speedMbps}.${Math.floor(20 + Math.random() * 150)}`,
      macAddress: `00:1E:${Math.floor(10 + Math.random() * 80)}:${Math.floor(10 + Math.random() * 80)}:${Math.floor(10 + Math.random() * 80)}:AA`,
      wifiSSID: newCustForm.wifiSSID,
      wifiPassword: newCustForm.wifiPassword,
      ontSerial: newCustForm.ontSerial,
      ontModel: newCustForm.ontModel,
      opticalPowerRx: Number(newCustForm.opticalPowerRx),
      uptimeHours: 1,
      deviceConnected: true,
      odcId: newCustForm.odcId,
      odpId: newCustForm.odpId,
      odpPort: Number(newCustForm.odpPort),
      lat: Number(newCustForm.lat),
      lng: Number(newCustForm.lng),
      joinDate: '2026-11-01',
      billingDueDay: Number(newCustForm.billingDueDay),
      dataUsageCurrentMonthGB: 0,
      fupLimitGB: pkg.speedMbps === 30 ? 1000 : pkg.speedMbps === 15 ? 500 : 300,
      currentBill: {
        invoiceNo: `INV/202611/${String(customers.length + 1).padStart(3, '0')}`,
        month: nowMonth,
        year: nowYear,
        amount: pkg.price,
        dueDate: `2026-11-${String(newCustForm.billingDueDay).padStart(2, '0')}`,
        status: 'PAID',
        paidAt: '2026-11-01 10:00:00',
        paymentMethod: 'CASH',
        paymentRef: 'REG-NEW-CUST'
      }
    });

    setShowAddCustModal(false);
  };

  // Submit Admin Change WiFi SSID & Password
  const handleSaveAdminWifi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showWifiEditModal) return;
    const res = await updateCustomerWifi(showWifiEditModal.id, newWifiSsid, newWifiPassword);
    setWifiUpdateMsg(res.message);
    setTimeout(() => {
      setShowWifiEditModal(null);
      setWifiUpdateMsg(null);
    }, 1500);
  };

  // Filter customers
  const filteredCustomers = customers.filter(c => {
    const matchSearch =
      c.name.toLowerCase().includes(custSearch.toLowerCase()) ||
      c.customerNo.toLowerCase().includes(custSearch.toLowerCase()) ||
      c.phone.includes(custSearch) ||
      c.address.toLowerCase().includes(custSearch.toLowerCase());

    if (!matchSearch) return false;

    if (custStatusFilter === 'ACTIVE') return c.status === 'ACTIVE';
    if (custStatusFilter === 'ISOLIR') return c.status === 'ISOLIR';
    if (custStatusFilter === 'UNPAID') return c.currentBill.status !== 'PAID';

    return true;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Top Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
        {[
          { key: 'OVERVIEW', label: 'Statistik Pendapatan', icon: TrendingUp },
          { key: 'CUSTOMERS', label: `Data Pelanggan (${customers.length})`, icon: Users },
          { key: 'GIS_MAP', label: 'Peta GIS (ODC/ODP)', icon: MapPin },
          { key: 'MIKROTIK', label: 'MikroTik RouterOS', icon: Activity },
          { key: 'GENIEACS', label: 'GenieACS TR-069', icon: Radio },
          { key: 'NOTIFICATIONS', label: 'WhatsApp & Telegram', icon: BellRing },
          { key: 'INTEGRATIONS', label: 'Pusat Integrasi', icon: Zap },
          { key: 'SETTINGS', label: 'Pengaturan Sistem', icon: Settings }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-950/50'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & STATISTIK PENDAPATAN */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-8">
          {/* Executive Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Total Pendapatan Terverifikasi
                </span>
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl font-black text-white font-mono mt-3">
                {formatRupiah(totalPaidRevenue)}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 mt-2 font-medium">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Bulan November 2026 (Real-Time Gateway)</span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Target MRR Bulanan
                </span>
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <Activity className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl font-black text-cyan-400 font-mono mt-3">
                {formatRupiah(mrrTarget)}
              </p>
              <p className="text-xs text-slate-400 mt-2">
                Realisasi:{' '}
                <span className="font-bold text-white">
                  {mrrTarget > 0 ? Math.round((totalPaidRevenue / mrrTarget) * 100) : 0}%
                </span>{' '}
                dari kapasitas langganan
              </p>
            </div>

            {/* Card 3 */}
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Tunggakan / Belum Lunas
                </span>
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <CreditCard className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl font-black text-amber-400 font-mono mt-3">
                {formatRupiah(totalOverdueRevenue)}
              </p>
              <p className="text-xs text-slate-400 mt-2">
                Dari{' '}
                <span className="font-bold text-white">
                  {customers.filter(c => c.currentBill.status !== 'PAID').length} Pelanggan
                </span>{' '}
                belum membayar
              </p>
            </div>

            {/* Card 4 */}
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Pelanggan Aktif / Isolir
                </span>
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline gap-2 mt-3">
                <span className="text-2xl font-black text-emerald-400 font-mono">{activeCount}</span>
                <span className="text-xs text-slate-400 font-semibold">Aktif</span>
                <span className="text-slate-600">/</span>
                <span className="text-2xl font-black text-rose-400 font-mono">{isolatedCount}</span>
                <span className="text-xs text-slate-400 font-semibold">Isolir</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                ARPU: <span className="font-bold text-white font-mono">{formatRupiah(arpu)}</span> /user
              </p>
            </div>
          </div>

          {/* Revenue Breakdown & Package Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Monthly Trend Visualizer (2 Cols) */}
            <div className="lg:col-span-2 rounded-3xl bg-slate-900 border border-slate-800 p-6 md:p-8 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-5">
                <div>
                  <h3 className="font-bold text-white text-base">
                    Grafik Riwayat Pendapatan Bulanan
                  </h3>
                  <p className="text-xs text-slate-400">
                    Perbandingan performa penerimaan kas WiFi selama 5 bulan terakhir
                  </p>
                </div>
                <span className="text-xs font-mono px-3 py-1 bg-slate-950 border border-slate-800 text-emerald-400 rounded-lg">
                  Rata-rata 98% On-Time
                </span>
              </div>

              {/* Bar Chart Representation */}
              <div className="mt-8 space-y-4">
                {[
                  { month: 'Juli 2026', amount: 850000, target: 900000, pct: 94 },
                  { month: 'Agustus 2026', amount: 950000, target: 950000, pct: 100 },
                  { month: 'September 2026', amount: 1000000, target: 1050000, pct: 95 },
                  { month: 'Oktober 2026', amount: 1050000, target: 1050000, pct: 100 },
                  { month: 'November 2026 (Berjalan)', amount: totalPaidRevenue, target: mrrTarget, pct: Math.round((totalPaidRevenue / mrrTarget) * 100) }
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-white">{item.month}</span>
                      <span className="font-mono text-cyan-300 font-bold">
                        {formatRupiah(item.amount)}{' '}
                        <span className="text-slate-400 font-normal">({item.pct}%)</span>
                      </span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-600 via-teal-500 to-emerald-400 transition-all duration-500"
                        style={{ width: `${Math.min(100, item.pct)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-5 border-t border-slate-800 grid grid-cols-3 gap-4 text-center text-xs">
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                  <p className="text-slate-400 text-[10px] uppercase">Metode Terbanyak</p>
                  <p className="font-bold text-white mt-1">QRIS Dinamis (68%)</p>
                </div>
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                  <p className="text-slate-400 text-[10px] uppercase">Rata-rata Waktu Bayar</p>
                  <p className="font-bold text-white mt-1">3 Hari sebelum Tempo</p>
                </div>
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                  <p className="text-slate-400 text-[10px] uppercase">Tingkat Retensi</p>
                  <p className="font-bold text-emerald-400 mt-1">99.4% Pelanggan Setia</p>
                </div>
              </div>
            </div>

            {/* Paket Distribution & Payment Channels (1 Col) */}
            <div className="space-y-6">
              {/* Package Breakdown */}
              <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
                <h3 className="font-bold text-white text-base border-b border-slate-800 pb-3">
                  Distribusi Paket Internet
                </h3>
                <div className="mt-4 space-y-3.5">
                  {packages.map(pkg => {
                    const count = customers.filter(c => c.packageId === pkg.id).length;
                    const pct = customers.length > 0 ? Math.round((count / customers.length) * 100) : 0;
                    return (
                      <div key={pkg.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <div className="flex justify-between items-center text-xs">
                          <div>
                            <span className="font-bold text-white">{pkg.name}</span>
                            <span className="text-cyan-400 font-mono ml-2 font-bold">{pkg.downloadSpeed}</span>
                          </div>
                          <span className="font-mono text-slate-300 font-bold">{formatRupiah(pkg.price)}</span>
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-400 mt-2">
                          <span>{count} Pelanggan</span>
                          <span>{pct}% Pangsa</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Payment Gateways breakdown */}
              <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
                <h3 className="font-bold text-white text-base border-b border-slate-800 pb-3">
                  Kanal Gateway Real-Time
                </h3>
                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-slate-300">QRIS Nasional</span>
                    <span className="font-mono text-emerald-400 font-bold">Instan (0 detik)</span>
                  </div>
                  <div className="flex justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-slate-300">BCA / Mandiri / BRI VA</span>
                    <span className="font-mono text-indigo-400 font-bold">Auto Callback</span>
                  </div>
                  <div className="flex justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-slate-300">e-Wallet (Dana / GoPay)</span>
                    <span className="font-mono text-teal-400 font-bold">1-Click Push</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MANAJEMEN PELANGGAN LENGKAP */}
      {activeTab === 'CUSTOMERS' && (
        <div className="space-y-6">
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                value={custSearch}
                onChange={e => setCustSearch(e.target.value)}
                placeholder="Cari Nama, ID (NET-2024-xxx), No HP, Alamat..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            </div>

            {/* Filter Pills & Add Button */}
            <div className="flex items-center gap-2 overflow-x-auto">
              {(['ALL', 'ACTIVE', 'ISOLIR', 'UNPAID'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setCustStatusFilter(f)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    custStatusFilter === f
                      ? 'bg-slate-800 text-white border border-slate-700'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {f === 'ALL'
                    ? 'Semua'
                    : f === 'ACTIVE'
                    ? 'Aktif'
                    : f === 'ISOLIR'
                    ? 'Terisolir'
                    : 'Belum Lunas'}
                </button>
              ))}

              <button
                onClick={() => setShowAddCustModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Pelanggan</span>
              </button>
            </div>
          </div>

          {/* Customers Table */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4 font-semibold">Pelanggan</th>
                    <th className="py-3.5 px-4 font-semibold">Paket WiFi</th>
                    <th className="py-3.5 px-4 font-semibold">Tagihan / Jatuh Tempo</th>
                    <th className="py-3.5 px-4 font-semibold">Nama WiFi (SSID)</th>
                    <th className="py-3.5 px-4 font-semibold">Redaman RX</th>
                    <th className="py-3.5 px-4 font-semibold">Status</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Aksi Manajemen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {filteredCustomers.map(cust => {
                    const pkg = packages.find(p => p.id === cust.packageId) || packages[1];
                    const isIso = cust.status === 'ISOLIR';
                    const isPaid = cust.currentBill.status === 'PAID';
                    return (
                      <tr key={cust.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-white text-sm">{cust.name}</p>
                          <p className="text-[11px] text-slate-400 font-mono">
                            {cust.customerNo} • {cust.phone}
                          </p>
                          <p className="text-[10px] text-slate-500 line-clamp-1">{cust.address}</p>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-cyan-300">{pkg.name}</span>
                          <p className="text-[11px] text-slate-400 font-mono">
                            {pkg.downloadSpeed} ({formatRupiah(pkg.price)}/bln)
                          </p>
                        </td>

                        <td className="py-3.5 px-4">
                          <p className="font-mono font-bold text-white">
                            {formatRupiah(cust.currentBill.amount)}
                          </p>
                          <p className="text-[10px] text-slate-400">Tempo: {cust.currentBill.dueDate}</p>
                          <span
                            className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[9px] font-bold ${
                              isPaid ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                            }`}
                          >
                            {isPaid ? 'LUNAS' : 'MENUNGGAK'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 font-medium text-white">
                            <Wifi className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                            <span className="font-mono text-xs">{cust.wifiSSID}</span>
                          </div>
                          <p className="text-[10px] text-slate-500 font-mono">
                            Pass: {cust.wifiPassword}
                          </p>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                              cust.opticalPowerRx >= -24
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : 'bg-amber-500/10 text-amber-400'
                            }`}
                          >
                            {cust.opticalPowerRx} dBm
                          </span>
                          <p className="text-[10px] text-slate-500">Port ODP #{cust.odpPort}</p>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              isIso
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            }`}
                          >
                            ● {isIso ? 'TERISOLIR' : 'AKTIF'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Toggle Isolir */}
                            <button
                              onClick={() => toggleCustomerIsolir(cust.id)}
                              title={isIso ? 'Buka Isolir' : 'Kunci Isolir'}
                              className={`p-2 rounded-xl transition cursor-pointer ${
                                isIso
                                  ? 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/40 border border-emerald-500/30'
                                  : 'bg-rose-600/20 text-rose-400 hover:bg-rose-600/40 border border-rose-500/30'
                              }`}
                            >
                              {isIso ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                            </button>

                            {/* Edit WiFi directly */}
                            <button
                              onClick={() => {
                                setShowWifiEditModal(cust);
                                setNewWifiSsid(cust.wifiSSID);
                                setNewWifiPassword(cust.wifiPassword);
                              }}
                              title="Ganti Nama & Password WiFi"
                              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer border border-slate-700"
                            >
                              <KeyRound className="w-4 h-4 text-cyan-400" />
                            </button>

                            {/* Reboot ONT */}
                            <button
                              onClick={() => rebootCustomerOnt(cust.id)}
                              title="Reboot Modem ONT (GenieACS)"
                              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer border border-slate-700"
                            >
                              <RotateCw className="w-4 h-4 text-teal-400" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => {
                                if (window.confirm(`Hapus pelanggan ${cust.name}?`)) {
                                  deleteCustomer(cust.id);
                                }
                              }}
                              title="Hapus Pelanggan"
                              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PETA GIS TOPOLOGI (ODC / ODP & REAL-TIME GPS) */}
      {activeTab === 'GIS_MAP' && (
        <div>
          <GisMap />
        </div>
      )}

      {/* TAB 4: MIKROTIK ROUTEROS CORE */}
      {activeTab === 'MIKROTIK' && (
        <div>
          <MikrotikBridge />
        </div>
      )}

      {/* TAB 5: GENIEACS TR-069 */}
      {activeTab === 'GENIEACS' && (
        <div>
          <GenieAcsBridge />
        </div>
      )}

      {/* TAB 6: NOTIFIKASI WA & TELEGRAM */}
      {activeTab === 'NOTIFICATIONS' && (
        <div>
          <NotificationCenter />
        </div>
      )}

      {/* TAB 7: PUSAT INTEGRASI (EMAIL, TRIPAY, WHATSAPP, MIKROTIK, TELEGRAM) */}
      {activeTab === 'INTEGRATIONS' && (
        <div>
          <IntegrationsManager />
        </div>
      )}

      {/* TAB 8: PENGATURAN SISTEM (LOGO, PROFIL PERUSAHAAN, REKENING BANK, SYARAT & KETENTUAN) */}
      {activeTab === 'SETTINGS' && (
        <div>
          <SettingsManager />
        </div>
      )}

      {/* MODAL: Tambah Pelanggan Baru */}
      {showAddCustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl my-8">
            <h3 className="text-lg font-bold text-white">Tambah Pelanggan Baru WiFi</h3>
            <p className="text-xs text-slate-400 mt-1">
              Data akan otomatis di-provisioning ke MikroTik PPPoE dan GenieACS TR-069.
            </p>

            <form onSubmit={handleCreateCustomer} className="mt-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Lengkap:</label>
                  <input
                    type="text"
                    required
                    value={newCustForm.name}
                    onChange={e => setNewCustForm({ ...newCustForm, name: e.target.value })}
                    placeholder="Contoh: Ahmad Fauzi"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nomor WhatsApp:</label>
                  <input
                    type="text"
                    required
                    value={newCustForm.phone}
                    onChange={e => setNewCustForm({ ...newCustForm, phone: e.target.value })}
                    placeholder="081234567890"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Alamat Pemasangan:</label>
                <input
                  type="text"
                  required
                  value={newCustForm.address}
                  onChange={e => setNewCustForm({ ...newCustForm, address: e.target.value })}
                  placeholder="Jl. Cempaka Raya No. 10..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Pilihan Paket:</label>
                  <select
                    value={newCustForm.packageId}
                    onChange={e => setNewCustForm({ ...newCustForm, packageId: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    {packages.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.downloadSpeed}) - {formatRupiah(p.price)}/bln
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tanggal Jatuh Tempo:</label>
                  <select
                    value={newCustForm.billingDueDay}
                    onChange={e => setNewCustForm({ ...newCustForm, billingDueDay: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value={5}>Tanggal 5 Setiap Bulan</option>
                    <option value={10}>Tanggal 10 Setiap Bulan</option>
                    <option value={15}>Tanggal 15 Setiap Bulan</option>
                    <option value={20}>Tanggal 20 Setiap Bulan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nama WiFi (SSID):</label>
                  <input
                    type="text"
                    required
                    value={newCustForm.wifiSSID}
                    onChange={e => setNewCustForm({ ...newCustForm, wifiSSID: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Password WiFi:</label>
                  <input
                    type="text"
                    required
                    value={newCustForm.wifiPassword}
                    onChange={e => setNewCustForm({ ...newCustForm, wifiPassword: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Kabinet ODC:</label>
                  <select
                    value={newCustForm.odcId}
                    onChange={e => setNewCustForm({ ...newCustForm, odcId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  >
                    {odcs.map(o => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Titik ODP:</label>
                  <select
                    value={newCustForm.odpId}
                    onChange={e => setNewCustForm({ ...newCustForm, odpId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  >
                    {odps.map(o => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Serial ONT:</label>
                  <input
                    type="text"
                    value={newCustForm.ontSerial}
                    onChange={e => setNewCustForm({ ...newCustForm, ontSerial: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-cyan-300"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs transition cursor-pointer"
                >
                  Simpan & Daftarkan ke MikroTik
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddCustModal(false)}
                  className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Admin Ganti Nama & Password WiFi Pelanggan Langsung */}
      {showWifiEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-cyan-400" />
              Ganti Pengaturan WiFi Pelanggan
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Pelanggan: <span className="font-bold text-white">{showWifiEditModal.name}</span> ({showWifiEditModal.customerNo})
            </p>

            {wifiUpdateMsg && (
              <div className="mt-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{wifiUpdateMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveAdminWifi} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nama WiFi (SSID):
                </label>
                <input
                  type="text"
                  required
                  value={newWifiSsid}
                  onChange={e => setNewWifiSsid(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Password WiFi Baru:
                </label>
                <input
                  type="text"
                  required
                  minLength={8}
                  value={newWifiPassword}
                  onChange={e => setNewWifiPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition cursor-pointer"
                >
                  Terapkan via GenieACS
                </button>
                <button
                  type="button"
                  onClick={() => setShowWifiEditModal(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      <ReceiptModal
        transaction={selectedTx}
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
      />
    </div>
  );
};
