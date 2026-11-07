import React, { useState } from 'react';
import { useISP } from '../context/ISPContext';
import { Customer, PaymentTransaction, WifiPackage } from '../types';
import { PaymentGatewayModal } from './PaymentGatewayModal';
import { ReceiptModal } from './ReceiptModal';
import {
  Wifi,
  KeyRound,
  Download,
  Upload,
  Gauge,
  CreditCard,
  FileText,
  Printer,
  RotateCw,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
  Signal,
  Radio,
  Zap,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';

export const CustomerPortal: React.FC = () => {
  const {
    activeCustomer,
    packages,
    transactions,
    updateCustomerWifi,
    changeCustomerPackage,
    rebootCustomerOnt,
    companyProfile,
    bankAccounts
  } = useISP();

  const [showTermsModal, setShowTermsModal] = useState(false);

  // If no active customer selected
  if (!activeCustomer) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-slate-900 border border-slate-800 p-8 rounded-3xl">
          <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white">Akun Pelanggan Belum Dipilih</h2>
          <p className="text-sm text-slate-400 mt-2">
            Silakan pilih akun pelanggan dari dropdown di navigasi atas untuk melihat portal mandiri.
          </p>
        </div>
      </div>
    );
  }

  const currentPkg =
    packages.find(p => p.id === activeCustomer.packageId) || packages[1];

  // Modals state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedReceiptTx, setSelectedReceiptTx] = useState<PaymentTransaction | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // WiFi Settings Form
  const [wifiSsid, setWifiSsid] = useState(activeCustomer.wifiSSID);
  const [wifiPassword, setWifiPassword] = useState(activeCustomer.wifiPassword);
  const [showPassword, setShowPassword] = useState(false);
  const [isSavingWifi, setIsSavingWifi] = useState(false);
  const [wifiFeedback, setWifiFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Reboot ONT state
  const [isRebooting, setIsRebooting] = useState(false);
  const [rebootFeedback, setRebootFeedback] = useState<string | null>(null);

  // Package Change Modal state
  const [pendingPackageId, setPendingPackageId] = useState<string | null>(null);
  const [isChangingPackage, setIsChangingPackage] = useState(false);
  const [packageFeedback, setPackageFeedback] = useState<string | null>(null);

  // Speedtest simulation state
  const [isSpeedtesting, setIsSpeedtesting] = useState(false);
  const [speedResults, setSpeedResults] = useState<{
    download: number;
    upload: number;
    ping: number;
    completed: boolean;
  }>({
    download: currentPkg.speedMbps * 0.96,
    upload: currentPkg.speedMbps * 0.48,
    ping: 8,
    completed: false
  });

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(num);
  };

  // Filter transactions for this customer
  const customerTransactions = transactions.filter(
    t => t.customerId === activeCustomer.id
  );

  // Handle Save WiFi SSID & Password
  const handleSaveWifi = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingWifi(true);
    setWifiFeedback(null);
    try {
      const res = await updateCustomerWifi(activeCustomer.id, wifiSsid, wifiPassword);
      if (res.success) {
        setWifiFeedback({ type: 'success', message: res.message });
      } else {
        setWifiFeedback({ type: 'error', message: res.message });
      }
    } catch (err: any) {
      setWifiFeedback({ type: 'error', message: err.message || 'Gagal menyimpan' });
    } finally {
      setIsSavingWifi(false);
    }
  };

  // Handle Remote Reboot
  const handleRebootOnt = async () => {
    if (!window.confirm('Apakah Anda yakin ingin mereboot modem WiFi sekarang? Koneksi akan terputus sekitar 1 menit.')) {
      return;
    }
    setIsRebooting(true);
    setRebootFeedback(null);
    try {
      const res = await rebootCustomerOnt(activeCustomer.id);
      setRebootFeedback(res.message);
    } finally {
      setIsRebooting(false);
    }
  };

  // Handle Change Package
  const handleConfirmChangePackage = async () => {
    if (!pendingPackageId) return;
    setIsChangingPackage(true);
    try {
      const res = await changeCustomerPackage(activeCustomer.id, pendingPackageId);
      setPackageFeedback(res.message);
      setPendingPackageId(null);
    } finally {
      setIsChangingPackage(false);
    }
  };

  // Handle Speedtest run
  const handleRunSpeedtest = () => {
    setIsSpeedtesting(true);
    setSpeedResults(prev => ({ ...prev, completed: false }));
    setTimeout(() => {
      setSpeedResults({
        download: Number((currentPkg.speedMbps * (0.92 + Math.random() * 0.08)).toFixed(1)),
        upload: Number((currentPkg.speedMbps * 0.48 * (0.9 + Math.random() * 0.1)).toFixed(1)),
        ping: Math.floor(6 + Math.random() * 6),
        completed: true
      });
      setIsSpeedtesting(false);
    }, 2000);
  };

  const isIsolated = activeCustomer.status === 'ISOLIR';
  const isPaid = activeCustomer.currentBill.status === 'PAID';

  return (
    <div className="space-y-8 pb-16">
      {/* ISOLIR ALERT BANNER IF ISOLATED */}
      {isIsolated && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-950/80 via-red-900/60 to-rose-950/80 border-2 border-rose-500/50 p-6 shadow-2xl shadow-rose-950/50">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                <AlertTriangle className="w-7 h-7 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-500 text-white uppercase tracking-wider">
                    LAYANAN TERISOLIR OTOMATIS
                  </span>
                  <span className="text-xs font-mono text-rose-300">
                    MikroTik Address-List: ISOLIR_USER_BLOCKED
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mt-1">
                  Akses Internet Sementara Ditangguhkan
                </h3>
                <p className="text-xs text-rose-200/90 mt-1 max-w-2xl leading-relaxed">
                  Tagihan WiFi Anda untuk periode {activeCustomer.currentBill.month} {activeCustomer.currentBill.year} sebesar{' '}
                  <span className="font-bold text-white">{formatRupiah(activeCustomer.currentBill.amount)}</span> telah melewati batas tanggal jatuh tempo ({activeCustomer.currentBill.dueDate}). Silakan lakukan pembayaran online di bawah ini untuk <span className="underline font-bold text-white">membuka isolir secara seketika</span> tanpa menunggu konfirmasi manual!
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsPaymentModalOpen(true)}
              className="shrink-0 flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-950/50 transition transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Zap className="w-4 h-4 text-slate-950" />
              Bayar Sekarang & Buka Isolir
            </button>
          </div>
        </div>
      )}

      {/* Customer Header & Profile Card */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-lg shadow-cyan-950/50">
              {activeCustomer.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-extrabold text-white tracking-tight">
                  {activeCustomer.name}
                </h1>
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-lg bg-slate-800 text-cyan-300 border border-slate-700">
                  {activeCustomer.customerNo}
                </span>
                <span
                  className={`px-3 py-0.5 rounded-full text-xs font-bold ${
                    activeCustomer.status === 'ACTIVE'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : activeCustomer.status === 'ISOLIR'
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}
                >
                  ● {activeCustomer.status === 'ACTIVE' ? 'Koneksi Aktif' : activeCustomer.status === 'ISOLIR' ? 'Terisolir' : 'Menunggu Bayar'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1">
                <span>📱 {activeCustomer.phone}</span>
                <span>📍 {activeCustomer.address}</span>
                <span>🌐 IP: <span className="font-mono text-slate-300">{activeCustomer.ipAddress}</span></span>
                <button
                  type="button"
                  onClick={() => setShowTermsModal(true)}
                  className="text-cyan-400 hover:text-cyan-300 font-semibold underline cursor-pointer"
                >
                  Syarat &amp; Ketentuan
                </button>
              </p>
            </div>
          </div>

          {/* Quick ONT Signal Health */}
          <div className="flex flex-wrap items-center gap-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
            <div className="flex items-center gap-2 text-xs">
              <Signal className={`w-4 h-4 ${activeCustomer.opticalPowerRx > -25 ? 'text-emerald-400' : 'text-amber-400'}`} />
              <div>
                <p className="text-[10px] text-slate-400 uppercase">Redaman Optik (RX)</p>
                <p className="font-mono font-bold text-white">{activeCustomer.opticalPowerRx} dBm</p>
              </div>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div className="text-xs">
              <p className="text-[10px] text-slate-400 uppercase">Modem ONT</p>
              <p className="font-semibold text-slate-300">{activeCustomer.ontModel.split(' ')[0]}</p>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div className="text-xs">
              <p className="text-[10px] text-slate-400 uppercase">Uptime ONT</p>
              <p className="font-mono text-slate-300">{activeCustomer.uptimeHours} Jam</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Billing Card & Data Usage / Speedtest */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: Status Tagihan Bulan Ini (Billing Action) */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-white text-base">Tagihan Bulan Ini</h3>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {activeCustomer.currentBill.month} {activeCustomer.currentBill.year}
              </span>
            </div>

            <div className="mt-5 p-4 rounded-2xl bg-slate-950 border border-slate-800/80">
              <p className="text-xs text-slate-400">Nominal Tagihan:</p>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-black text-cyan-400 font-mono">
                  {formatRupiah(activeCustomer.currentBill.amount)}
                </span>
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-md ${
                    isPaid
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : isIsolated
                      ? 'bg-rose-500/20 text-rose-400'
                      : 'bg-amber-500/20 text-amber-400'
                  }`}
                >
                  {isPaid ? 'LUNAS' : isIsolated ? 'OVERDUE' : 'BELUM DIBAYAR'}
                </span>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>No. Invoice:</span>
                  <span className="font-mono text-slate-200">{activeCustomer.currentBill.invoiceNo}</span>
                </div>
                <div className="flex justify-between">
                  <span>Jatuh Tempo:</span>
                  <span className="text-slate-200 font-medium">{activeCustomer.currentBill.dueDate}</span>
                </div>
                {isPaid && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Dibayar Pada:</span>
                    <span className="font-mono text-xs">{activeCustomer.currentBill.paidAt}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            {!isPaid ? (
              <button
                onClick={() => setIsPaymentModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-950/50 transition transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <Zap className="w-4 h-4 text-white" />
                Bayar Tagihan Sekarang (QRIS / VA)
              </button>
            ) : (
              <button
                onClick={() => {
                  const tx = customerTransactions.find(t => t.invoiceNo === activeCustomer.currentBill.invoiceNo) || customerTransactions[0];
                  if (tx) {
                    setSelectedReceiptTx(tx);
                    setIsReceiptModalOpen(true);
                  }
                }}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm border border-slate-700 transition cursor-pointer"
              >
                <Printer className="w-4 h-4 text-emerald-400" />
                Cetak Bukti Pembayaran Resmi
              </button>
            )}
            <p className="text-[11px] text-center text-slate-400">
              {isPaid ? 'Terima kasih telah membayar tepat waktu' : 'Pembayaran otomatis diverifikasi dalam 5 detik'}
            </p>
          </div>
        </div>

        {/* Card 2: Kontrol Penggunaan Kuota & Speedtest */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gauge className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-white text-base">Kontrol Penggunaan Data</h3>
              </div>
              <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 font-mono">
                FUP Normal
              </span>
            </div>

            {/* Usage Progress Bar */}
            <div className="mt-5">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-400">Penggunaan Bulan Ini</span>
                <span className="text-white font-mono font-bold">
                  {activeCustomer.dataUsageCurrentMonthGB} GB / {activeCustomer.fupLimitGB} GB
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      100,
                      (activeCustomer.dataUsageCurrentMonthGB / activeCustomer.fupLimitGB) * 100
                    )}%`
                  }}
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Sisa kuota batas wajar: <span className="text-cyan-400 font-bold font-mono">{(activeCustomer.fupLimitGB - activeCustomer.dataUsageCurrentMonthGB).toFixed(1)} GB</span>. Tidak ada batas kecepatan (Uncapped).
              </p>
            </div>

            {/* Speedtest Widget */}
            <div className="mt-5 p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-300">Uji Kecepatan Real-Time</span>
                <button
                  type="button"
                  onClick={handleRunSpeedtest}
                  disabled={isSpeedtesting}
                  className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 text-xs font-semibold rounded-lg border border-indigo-500/30 transition cursor-pointer"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isSpeedtesting ? 'animate-spin' : ''}`} />
                  {isSpeedtesting ? 'Menguji...' : 'Test Speed'}
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400">
                    <Download className="w-3 h-3 text-cyan-400" />
                    DOWNLOAD
                  </div>
                  <p className="text-base font-extrabold text-white font-mono mt-0.5">
                    {speedResults.download}
                  </p>
                  <span className="text-[9px] text-slate-400">Mbps</span>
                </div>

                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400">
                    <Upload className="w-3 h-3 text-emerald-400" />
                    UPLOAD
                  </div>
                  <p className="text-base font-extrabold text-white font-mono mt-0.5">
                    {speedResults.upload}
                  </p>
                  <span className="text-[9px] text-slate-400">Mbps</span>
                </div>

                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400">PING</div>
                  <p className="text-base font-extrabold text-white font-mono mt-0.5">
                    {speedResults.ping}
                  </p>
                  <span className="text-[9px] text-slate-400">ms</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Paket: <span className="text-white font-bold">{currentPkg.downloadSpeed}</span></span>
            <span>MikroTik Queue: <span className="font-mono text-emerald-400">OK (No drops)</span></span>
          </div>
        </div>

        {/* Card 3: Status Modem ONT & Remote Action */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">Status Modem (GenieACS)</h3>
              </div>
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Online
              </span>
            </div>

            <div className="mt-5 space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Model Perangkat:</span>
                <span className="font-semibold text-white">{activeCustomer.ontModel}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Nomor Seri (SN):</span>
                <span className="font-mono text-cyan-300 font-semibold">{activeCustomer.ontSerial}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Kekuatan Sinyal Optik:</span>
                <span className={`font-mono font-bold ${activeCustomer.opticalPowerRx > -25 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {activeCustomer.opticalPowerRx} dBm (Bagus)
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Titik ODP Distribusi:</span>
                <span className="font-mono text-slate-200">Port #{activeCustomer.odpPort}</span>
              </div>
            </div>

            {rebootFeedback && (
              <div className="mt-3 p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/40 text-xs text-cyan-300">
                {rebootFeedback}
              </div>
            )}
          </div>

          <div className="mt-5">
            <button
              onClick={handleRebootOnt}
              disabled={isRebooting}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-xs border border-slate-700 transition cursor-pointer disabled:opacity-50"
            >
              <RotateCw className={`w-4 h-4 text-cyan-400 ${isRebooting ? 'animate-spin' : ''}`} />
              {isRebooting ? 'Mengirim Perintah Reboot via GenieACS...' : 'Restart Modem WiFi Mandiri'}
            </button>
            <p className="text-[10px] text-center text-slate-500 mt-2">
              Gunakan jika koneksi lambat atau perangkat WiFi sering terputus.
            </p>
          </div>
        </div>
      </div>

      {/* Section 2: Ganti Nama WiFi & Password WiFi Langsung */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 md:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Wifi className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Pengaturan Nama & Password WiFi</h2>
              <p className="text-xs text-slate-400">
                Ubah SSID dan kata sandi WiFi rumah Anda secara mandiri. Perubahan otomatis disinkronkan ke router ONT via GenieACS TR-069.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-cyan-300 shrink-0">
            WLAN 2.4G & 5G
          </span>
        </div>

        <form onSubmit={handleSaveWifi} className="mt-6 max-w-2xl space-y-5">
          {wifiFeedback && (
            <div
              className={`p-4 rounded-2xl text-xs flex items-center gap-3 ${
                wifiFeedback.type === 'success'
                  ? 'bg-emerald-950/40 border border-emerald-800/40 text-emerald-300'
                  : 'bg-rose-950/40 border border-rose-800/40 text-rose-300'
              }`}
            >
              {wifiFeedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{wifiFeedback.message}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Nama WiFi (SSID)
            </label>
            <div className="relative">
              <input
                type="text"
                value={wifiSsid}
                onChange={e => setWifiSsid(e.target.value)}
                placeholder="Contoh: WiFi_Rumah_Keluarga"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
              />
              <Wifi className="w-4 h-4 text-slate-500 absolute right-4 top-3.5" />
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              Nama yang akan terdeteksi di smartphone, laptop, dan TV pintar Anda.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Password WiFi (WPA2/WPA3 Pre-Shared Key)
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={wifiPassword}
                onChange={e => setWifiPassword(e.target.value)}
                placeholder="Minimal 8 karakter..."
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-slate-500 hover:text-slate-300 transition cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              Disarankan kombinasi huruf besar, huruf kecil, dan angka untuk keamanan jaringan.
            </p>
          </div>

          <div className="pt-2 flex items-center gap-4">
            <button
              type="submit"
              disabled={isSavingWifi}
              className="flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-950/50 transition cursor-pointer disabled:opacity-50"
            >
              {isSavingWifi ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Sinkronisasi ke Modem ONT via GenieACS...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Simpan Perubahan WiFi</span>
                </>
              )}
            </button>
            <span className="text-[11px] text-slate-400">
              Notifikasi otomatis dikirimkan ke WhatsApp Anda.
            </span>
          </div>
        </form>
      </div>

      {/* Section 3: Ubah Paket Internet Secara Mandiri */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 md:p-8 shadow-xl">
        <div className="border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Ubah Paket Internet Mandiri</h2>
              <p className="text-xs text-slate-400">
                Pilih paket kecepatan baru sesuai kebutuhan Anda. Kecepatan queue di MikroTik akan disesuaikan secara real-time.
              </p>
            </div>
          </div>
        </div>

        {packageFeedback && (
          <div className="mt-6 p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/40 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{packageFeedback}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {packages.map(pkg => {
            const isSelected = activeCustomer.packageId === pkg.id;
            return (
              <div
                key={pkg.id}
                className={`rounded-3xl p-6 border transition flex flex-col justify-between ${
                  isSelected
                    ? 'bg-gradient-to-b from-cyan-950/40 to-slate-900 border-cyan-500 ring-2 ring-cyan-500/20 shadow-xl'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                      {pkg.name}
                    </span>
                    {pkg.isPopular && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-slate-950 uppercase">
                        Terpopuler
                      </span>
                    )}
                  </div>

                  <div className="mt-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-white font-mono">
                        {pkg.speedMbps}
                      </span>
                      <span className="text-sm font-bold text-slate-400">Mbps</span>
                    </div>
                    <p className="text-xl font-bold text-cyan-300 font-mono mt-1">
                      {formatRupiah(pkg.price)}
                      <span className="text-xs text-slate-400 font-normal"> /bulan</span>
                    </p>
                  </div>

                  <p className="text-xs text-slate-400 mt-4 leading-relaxed">
                    {pkg.description}
                  </p>

                  <div className="mt-5 space-y-2 pt-4 border-t border-slate-800/80 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <Download className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Download: {pkg.downloadSpeed}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Upload className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Upload: {pkg.uploadSpeed}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{pkg.recommendedFor}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4">
                  {isSelected ? (
                    <div className="w-full py-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-center text-xs font-bold text-cyan-400">
                      ✓ Paket Aktif Saat Ini
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setPendingPackageId(pkg.id)}
                      className="w-full py-3 rounded-xl bg-slate-800 hover:bg-cyan-600 hover:text-white text-slate-200 text-xs font-bold transition shadow cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>Ganti ke Paket Ini</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Confirmation Modal for Package Change */}
        {pendingPackageId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-white">Konfirmasi Perubahan Paket</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Anda akan mengubah paket ke{' '}
                <span className="text-white font-bold">
                  {packages.find(p => p.id === pendingPackageId)?.name} (
                  {packages.find(p => p.id === pendingPackageId)?.speedMbps} Mbps)
                </span>{' '}
                dengan harga{' '}
                <span className="text-cyan-400 font-bold">
                  {formatRupiah(packages.find(p => p.id === pendingPackageId)?.price || 0)}/bulan
                </span>.
              </p>
              <p className="text-[11px] text-slate-500 mt-2">
                Queue rate-limit di MikroTik akan langsung di-update dan nominal tagihan periode selanjutnya disesuaikan.
              </p>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={handleConfirmChangePackage}
                  disabled={isChangingPackage}
                  className="flex-1 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition cursor-pointer"
                >
                  {isChangingPackage ? 'Menyinkronkan MikroTik...' : 'Ya, Ubah Paket'}
                </button>
                <button
                  type="button"
                  onClick={() => setPendingPackageId(null)}
                  disabled={isChangingPackage}
                  className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Section 4: Riwayat Pembayaran & Cetak Transaksi Mandiri */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 md:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Riwayat Transaksi & Bukti Pembayaran</h2>
              <p className="text-xs text-slate-400">
                Pantau seluruh rekam jejak pembayaran tagihan dan cetak bukti kwitansi / invoice resmi secara mandiri.
              </p>
            </div>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {customerTransactions.length} Transaksi Terverifikasi
          </span>
        </div>

        <div className="overflow-x-auto mt-6">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">No. Invoice</th>
                <th className="py-3.5 px-4 font-semibold">Paket WiFi</th>
                <th className="py-3.5 px-4 font-semibold">Jumlah</th>
                <th className="py-3.5 px-4 font-semibold">Metode</th>
                <th className="py-3.5 px-4 font-semibold">Waktu Pembayaran</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {customerTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Belum ada riwayat transaksi pembayaran.
                  </td>
                </tr>
              ) : (
                customerTransactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-cyan-300">
                      {tx.invoiceNo}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-white">{tx.packageName}</span>{' '}
                      <span className="text-slate-500 font-mono">({tx.packageSpeed}M)</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      {formatRupiah(tx.amount)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[11px]">
                        {tx.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono">
                      {tx.paidAt}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        LUNAS
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedReceiptTx(tx);
                          setIsReceiptModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-medium text-xs border border-slate-700 transition shadow-sm cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5 text-emerald-400" />
                        Cetak Bukti
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Gateway Modal */}
      <PaymentGatewayModal
        customer={activeCustomer}
        pkg={currentPkg}
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onPaymentSuccess={tx => {
          setIsPaymentModalOpen(false);
          setSelectedReceiptTx(tx);
          setIsReceiptModalOpen(true);
        }}
      />

      {/* Printable Receipt Modal */}
      <ReceiptModal
        transaction={selectedReceiptTx}
        customer={activeCustomer}
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
      />

      {/* Modal Syarat & Ketentuan Pelanggan */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-white text-base">Syarat &amp; Ketentuan Layanan {companyProfile.brandName}</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800/80 max-h-[60vh] overflow-y-auto text-xs text-slate-300 font-mono leading-relaxed whitespace-pre-line">
              {companyProfile.termsAndConditions}
            </div>

            <div className="mt-5 flex items-center justify-between pt-3 border-t border-slate-800">
              <span className="text-[11px] text-slate-500">
                Penyelenggara: {companyProfile.companyName}
              </span>
              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
