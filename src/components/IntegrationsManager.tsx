import React, { useState } from 'react';
import { useISP } from '../context/ISPContext';
import {
  Layers,
  Mail,
  CreditCard,
  MessageSquare,
  Activity,
  Send,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Zap,
  Server,
  Radio,
  Sliders,
  ExternalLink,
  ShieldCheck,
  QrCode,
  RotateCw,
  Wifi,
  Signal
} from 'lucide-react';

export const IntegrationsManager: React.FC = () => {
  const {
    emailConfig,
    updateEmailConfig,
    testEmailConnection,
    tripayConfig,
    updateTripayConfig,
    testTripayConnection,
    whatsappConfig,
    updateWhatsappConfig,
    testWhatsappConnection,
    mikrotikConfig,
    updateMikrotikConfig,
    testMikrotikConnection,
    genieacsConfig,
    updateGenieacsConfig,
    testGenieacsConnection,
    telegramConfig,
    updateTelegramConfig,
    testTelegramConnection,
    customers
  } = useISP();

  const [activeTab, setActiveTab] = useState<
    'EMAIL' | 'TRIPAY' | 'WHATSAPP' | 'MIKROTIK' | 'GENIEACS' | 'TELEGRAM'
  >('TRIPAY');

  // Test states & toast feedback
  const [testResult, setTestResult] = useState<{
    service: string;
    success: boolean;
    message: string;
  } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [copiedCallback, setCopiedCallback] = useState(false);
  const [copiedCwmp, setCopiedCwmp] = useState(false);

  // Email test input
  const [testTargetEmail, setTestTargetEmail] = useState('');
  const [testTargetPhone, setTestTargetPhone] = useState('');

  // Handle Copy Callback URL
  const handleCopyCallback = () => {
    navigator.clipboard.writeText(tripayConfig.callbackUrl);
    setCopiedCallback(true);
    setTimeout(() => setCopiedCallback(false), 2000);
  };

  const handleCopyCwmp = () => {
    navigator.clipboard.writeText(genieacsConfig.cwmpUrl);
    setCopiedCwmp(true);
    setTimeout(() => setCopiedCwmp(false), 2000);
  };

  // Run Test Handlers
  const handleTestEmail = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testEmailConnection(testTargetEmail);
      setTestResult({ service: 'Email SMTP', success: res.success, message: res.message });
    } finally {
      setIsTesting(false);
    }
  };

  const handleTestTripay = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testTripayConnection();
      setTestResult({ service: 'Tripay Payment Gateway', success: res.success, message: res.message });
    } finally {
      setIsTesting(false);
    }
  };

  const handleTestWhatsapp = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testWhatsappConnection(testTargetPhone);
      setTestResult({ service: 'WhatsApp Gateway', success: res.success, message: res.message });
    } finally {
      setIsTesting(false);
    }
  };

  const handleTestMikrotik = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testMikrotikConnection();
      setTestResult({ service: 'MikroTik RouterOS API', success: res.success, message: res.message });
    } finally {
      setIsTesting(false);
    }
  };

  const handleTestGenieacs = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testGenieacsConnection();
      setTestResult({ service: 'GenieACS TR-069 NBI', success: res.success, message: res.message });
    } finally {
      setIsTesting(false);
    }
  };

  const handleTestTelegram = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testTelegramConnection();
      setTestResult({ service: 'Telegram Bot API', success: res.success, message: res.message });
    } finally {
      setIsTesting(false);
    }
  };

  // Toggle Tripay channel
  const handleToggleTripayChannel = (channel: string) => {
    const current = tripayConfig.enabledChannels;
    const next = current.includes(channel)
      ? current.filter(c => c !== channel)
      : [...current, channel];
    updateTripayConfig({ enabledChannels: next });
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-4">
        {[
          { key: 'EMAIL', label: 'Email SMTP', icon: Mail, status: emailConfig.status },
          { key: 'TRIPAY', label: 'Payment Gateway Tripay', icon: CreditCard, status: tripayConfig.status },
          { key: 'WHATSAPP', label: 'WhatsApp Gateway', icon: MessageSquare, status: whatsappConfig.status },
          { key: 'MIKROTIK', label: 'MikroTik RouterOS', icon: Server, status: mikrotikConfig.apiConnected ? 'CONNECTED' : 'DISCONNECTED' },
          { key: 'GENIEACS', label: 'GenieACS TR-069', icon: Radio, status: genieacsConfig.connected ? 'CONNECTED' : 'DISCONNECTED' },
          { key: 'TELEGRAM', label: 'Telegram Bot', icon: Send, status: telegramConfig.status }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          const isConnected = tab.status === 'CONNECTED';
          return (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key as any);
                setTestResult(null);
              }}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                isActive
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-950/50'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-emerald-400' : 'bg-slate-500'
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* Global Feedback Banner */}
      {testResult && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center justify-between gap-3 ${
            testResult.success
              ? 'bg-emerald-950/50 border border-emerald-800/50 text-emerald-300'
              : 'bg-rose-950/50 border border-rose-800/50 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {testResult.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <div>
              <p className="font-bold text-white">{testResult.service}</p>
              <p className="text-[11px] mt-0.5">{testResult.message}</p>
            </div>
          </div>
          <button
            onClick={() => setTestResult(null)}
            className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded"
          >
            ✕
          </button>
        </div>
      )}

      {/* TAB 1: EMAIL (SMTP) */}
      {activeTab === 'EMAIL' && (
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 md:p-8 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-cyan-400" />
                Integrasi Email Notifikasi (SMTP / Mailgun / SendGrid)
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Digunakan untuk mengirimkan e-Kwitansi PDF, faktur tagihan bulanan, serta tiket laporan pelanggan.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  emailConfig.enabled
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                ● {emailConfig.enabled ? 'Email Aktif' : 'Email Nonaktif'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                SMTP Host Server:
              </label>
              <input
                type="text"
                value={emailConfig.host}
                onChange={e => updateEmailConfig({ host: e.target.value })}
                placeholder="smtp.mailgun.org"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                SMTP Port:
              </label>
              <input
                type="number"
                value={emailConfig.port}
                onChange={e => updateEmailConfig({ port: Number(e.target.value) })}
                placeholder="587"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Username / API User:
              </label>
              <input
                type="text"
                value={emailConfig.username}
                onChange={e => updateEmailConfig({ username: e.target.value })}
                placeholder="postmaster@mg.isp.com"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Password / Secret Key:
              </label>
              <input
                type="password"
                value={emailConfig.password || ''}
                onChange={e => updateEmailConfig({ password: e.target.value })}
                placeholder="••••••••••••••••"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Nama Pengirim (From Name):
              </label>
              <input
                type="text"
                value={emailConfig.fromName}
                onChange={e => updateEmailConfig({ fromName: e.target.value })}
                placeholder="NetBilling Pro Billing System"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Alamat Email Pengirim (From Email):
              </label>
              <input
                type="email"
                value={emailConfig.fromEmail}
                onChange={e => updateEmailConfig({ fromEmail: e.target.value })}
                placeholder="billing@netbilling.co.id"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Test Action */}
          <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex-1 max-w-sm">
              <input
                type="email"
                value={testTargetEmail}
                onChange={e => setTestTargetEmail(e.target.value)}
                placeholder="Masukkan email tujuan pengujian..."
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <button
              onClick={handleTestEmail}
              disabled={isTesting}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition cursor-pointer disabled:opacity-50"
            >
              <Send className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              {isTesting ? 'Menguji SMTP...' : 'Kirim Email Percobaan'}
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: PAYMENT GATEWAY TRIPAY */}
      {activeTab === 'TRIPAY' && (
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 md:p-8 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase">
                  TRIPAY PAYMENT GATEWAY
                </span>
                <span className="text-xs text-slate-400">Multi-Channel Otomatis</span>
              </div>
              <h3 className="text-lg font-bold text-white mt-1 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-cyan-400" />
                Konfigurasi Gateway Pembayaran Tripay
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Terima pembayaran QRIS nasional, Virtual Account BCA/BRI/Mandiri/BNI/BSI/Permata, dan e-Wallet dengan callback unisolir seketika.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400">Mode:</span>
              <button
                type="button"
                onClick={() =>
                  updateTripayConfig({
                    mode: tripayConfig.mode === 'SANDBOX' ? 'PRODUCTION' : 'SANDBOX'
                  })
                }
                className={`px-3 py-1 rounded-xl text-xs font-black transition cursor-pointer ${
                  tripayConfig.mode === 'PRODUCTION'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-600 text-white'
                }`}
              >
                {tripayConfig.mode}
              </button>
            </div>
          </div>

          <div className="space-y-6 max-w-4xl">
            {/* API Credentials */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Merchant Code:
                </label>
                <input
                  type="text"
                  value={tripayConfig.merchantCode}
                  onChange={e => updateTripayConfig({ merchantCode: e.target.value })}
                  placeholder="T12984"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  API Key:
                </label>
                <input
                  type="password"
                  value={tripayConfig.apiKey}
                  onChange={e => updateTripayConfig({ apiKey: e.target.value })}
                  placeholder="DEV-sk_live_tripay..."
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Private Key:
                </label>
                <input
                  type="password"
                  value={tripayConfig.privateKey}
                  onChange={e => updateTripayConfig({ privateKey: e.target.value })}
                  placeholder="priv_key_99217..."
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Webhook Callback URL */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <label className="block text-xs font-bold text-cyan-400 uppercase tracking-wider">
                Webhook / Callback URL Tripay:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={tripayConfig.callbackUrl}
                  className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 font-mono"
                />
                <button
                  type="button"
                  onClick={handleCopyCallback}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  {copiedCallback ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedCallback ? 'Tersalin' : 'Salin URL'}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                Salin URL ini ke Dashboard Tripay &gt; Pengaturan &gt; Webhook Callback agar sistem billing otomatis unisolir seketika saat pelanggan membayar.
              </p>
            </div>

            {/* Channels Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                Kanal Pembayaran Tripay Aktif:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: 'QRIS', label: 'QRIS Dinamis' },
                  { id: 'BCAVA', label: 'BCA Virtual Account' },
                  { id: 'BRIVA', label: 'BRI Virtual Account' },
                  { id: 'MANDIRIVA', label: 'Mandiri Virtual Account' },
                  { id: 'BNIVA', label: 'BNI Virtual Account' },
                  { id: 'PERMATAVA', label: 'Permata VA' },
                  { id: 'OVO', label: 'OVO e-Wallet' },
                  { id: 'DANA', label: 'DANA e-Wallet' }
                ].map(ch => {
                  const isChecked = tripayConfig.enabledChannels.includes(ch.id);
                  return (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => handleToggleTripayChannel(ch.id)}
                      className={`p-3 rounded-xl border text-left text-xs font-semibold transition cursor-pointer flex items-center justify-between ${
                        isChecked
                          ? 'bg-cyan-950/40 border-cyan-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                      }`}
                    >
                      <span>{ch.label}</span>
                      {isChecked && <Check className="w-4 h-4 text-cyan-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Test */}
            <div className="pt-4 flex items-center justify-between border-t border-slate-800">
              <span className="text-xs text-slate-400">
                Status Koneksi API: <span className="text-emerald-400 font-bold">{tripayConfig.status}</span>
              </span>
              <button
                type="button"
                onClick={handleTestTripay}
                disabled={isTesting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition cursor-pointer disabled:opacity-50"
              >
                <Zap className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                {isTesting ? 'Memverifikasi API Tripay...' : 'Tes Koneksi Tripay API'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: WHATSAPP GATEWAY */}
      {activeTab === 'WHATSAPP' && (
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 md:p-8 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-400" />
                Gateway WhatsApp Otomatis (Fonnte / WABlas / MPWA)
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Kirim tagihan bulanan otomatis, broadcast gangguan jaringan, dan struk pembayaran instan via WhatsApp.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              ● Sesi WhatsApp Terhubung
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start max-w-4xl">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Penyedia Gateway:
                </label>
                <select
                  value={whatsappConfig.provider}
                  onChange={e => updateWhatsappConfig({ provider: e.target.value as any })}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="FONNTE">Fonnte API Gateway</option>
                  <option value="WABLAS">WABlas Business API</option>
                  <option value="WHATSAPP_CLOUD">Official WhatsApp Cloud API (Meta)</option>
                  <option value="MPWA">MPWA Multi-Device</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  API Token / Device Key:
                </label>
                <input
                  type="password"
                  value={whatsappConfig.apiToken}
                  onChange={e => updateWhatsappConfig({ apiToken: e.target.value })}
                  placeholder="FONNTE_TOKEN_8829..."
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Nomor Pengirim (Sender Number):
                </label>
                <input
                  type="text"
                  value={whatsappConfig.senderNumber}
                  onChange={e => updateWhatsappConfig({ senderNumber: e.target.value })}
                  placeholder="0812-3456-7890"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Test Phone Input & Send */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Uji Kirim Pesan ke Nomor:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={testTargetPhone}
                    onChange={e => setTestTargetPhone(e.target.value)}
                    placeholder="081234567890"
                    className="flex-1 px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="button"
                    onClick={handleTestWhatsapp}
                    disabled={isTesting}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Send className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                    <span>Tes WA</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Device QR Simulation Box */}
            <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 text-center space-y-3">
              <p className="text-xs font-bold text-white uppercase tracking-wider">
                Status Perangkat WhatsApp
              </p>
              <div className="p-4 bg-emerald-950/20 border border-emerald-800/30 rounded-2xl flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-2">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <p className="font-bold text-white text-xs">Device Paired & Connected</p>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  {whatsappConfig.senderNumber}
                </p>
              </div>
              <p className="text-[11px] text-slate-500">
                Pesan tagihan otomatis dikirim dengan interval antrean aman untuk mencegah blokir nomor.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: MIKROTIK ROUTEROS */}
      {activeTab === 'MIKROTIK' && (
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 md:p-8 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Server className="w-5 h-5 text-cyan-400" />
                Pengaturan Integrasi MikroTik RouterOS API
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Koneksi langsung ke router core untuk isolir otomatis, rate-limit simple queues, dan PPPoE sync.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              ● API Port 8728 Aktif
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-4xl">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Host / IP Router MikroTik:
              </label>
              <input
                type="text"
                value={mikrotikConfig.host}
                onChange={e => updateMikrotikConfig({ host: e.target.value })}
                placeholder="192.168.88.1"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Port API:
              </label>
              <input
                type="number"
                value={mikrotikConfig.port}
                onChange={e => updateMikrotikConfig({ port: Number(e.target.value) })}
                placeholder="8728"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Username API:
              </label>
              <input
                type="text"
                value={mikrotikConfig.username}
                onChange={e => updateMikrotikConfig({ username: e.target.value })}
                placeholder="admin_isp"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Password API:
              </label>
              <input
                type="password"
                value={mikrotikConfig.password || '••••••••'}
                onChange={e => updateMikrotikConfig({ password: e.target.value })}
                placeholder="Password router..."
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Firewall Address-List Isolir:
              </label>
              <input
                type="text"
                value={mikrotikConfig.isolirAddressList}
                onChange={e => updateMikrotikConfig({ isolirAddressList: e.target.value })}
                placeholder="ISOLIR_USER_BLOCKED"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-rose-400 font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Masa Toleransi Jatuh Tempo (Grace Period):
              </label>
              <select
                value={mikrotikConfig.gracePeriodDays}
                onChange={e => updateMikrotikConfig({ gracePeriodDays: Number(e.target.value) })}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value={1}>1 Hari setelah jatuh tempo</option>
                <option value={2}>2 Hari setelah jatuh tempo</option>
                <option value={3}>3 Hari setelah jatuh tempo</option>
                <option value={5}>5 Hari setelah jatuh tempo</option>
              </select>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleTestMikrotik}
              disabled={isTesting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition cursor-pointer disabled:opacity-50"
            >
              <Zap className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              {isTesting ? 'Menguji API MikroTik...' : 'Tes Koneksi RouterOS API'}
            </button>
          </div>
        </div>
      )}

      {/* TAB 5: GENIEACS TR-069 INTEGRATION */}
      {activeTab === 'GENIEACS' && (
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 md:p-8 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-teal-500/10 text-teal-400 border border-teal-500/20 uppercase">
                  TR-069 CWMP &amp; NBI ACS
                </span>
                <span className="text-xs text-slate-400">Remote CPE Management</span>
              </div>
              <h3 className="text-lg font-bold text-white mt-1 flex items-center gap-2">
                <Radio className="w-5 h-5 text-teal-400" />
                Integrasi GenieACS TR-069 Auto-Configuration Server
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Koneksi NBI REST API port 7557 dan CWMP server port 7547 untuk sinkronisasi nama/password WiFi mandiri, pemantauan redaman optik (RX dBm), dan reboot ONT.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-500/10 text-teal-400 border border-teal-500/20">
              ● GenieACS NBI Terhubung
            </span>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800 mb-6 text-xs">
            <div>
              <p className="text-[10px] text-slate-400 uppercase">Total ONT Terdaftar</p>
              <p className="text-base font-extrabold text-white font-mono mt-0.5">
                {genieacsConfig.totalDevices} Unit
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase">Online Inform</p>
              <p className="text-base font-extrabold text-emerald-400 font-mono mt-0.5">
                {genieacsConfig.onlineDevices} Online
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase">Offline / LOS</p>
              <p className="text-base font-extrabold text-rose-400 font-mono mt-0.5">
                {genieacsConfig.offlineDevices} Unit
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase">Waktu Sinkron Terakhir</p>
              <p className="text-xs font-semibold text-slate-300 font-mono mt-0.5">
                {genieacsConfig.lastSyncTime}
              </p>
            </div>
          </div>

          <div className="space-y-6 max-w-4xl">
            {/* Server URLs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  GenieACS NBI API URL (Port 7557):
                </label>
                <input
                  type="text"
                  value={genieacsConfig.apiUrl}
                  onChange={e => updateGenieacsConfig({ apiUrl: e.target.value })}
                  placeholder="http://acs.isp-netbilling.local:7557"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  CWMP / TR-069 Server URL (Port 7547):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={genieacsConfig.cwmpUrl}
                    onChange={e => updateGenieacsConfig({ cwmpUrl: e.target.value })}
                    placeholder="http://acs.isp-netbilling.local:7547"
                    className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-teal-500"
                  />
                  <button
                    type="button"
                    onClick={handleCopyCwmp}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1"
                  >
                    {copiedCwmp ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCwmp ? 'Tersalin' : 'Salin'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  URL ini dimasukkan ke konfigurasi TR-069 ACS pada modem ONT (ZTE/Huawei/Fiberhome).
                </p>
              </div>
            </div>

            {/* Auth and Ports */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  NBI Username:
                </label>
                <input
                  type="text"
                  value={genieacsConfig.nbiUsername || ''}
                  onChange={e => updateGenieacsConfig({ nbiUsername: e.target.value })}
                  placeholder="genieacs_nbi_user"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  NBI Secret Password / Token:
                </label>
                <input
                  type="password"
                  value={genieacsConfig.nbiPassword || ''}
                  onChange={e => updateGenieacsConfig({ nbiPassword: e.target.value })}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Inform Interval (Detik):
                </label>
                <input
                  type="number"
                  value={genieacsConfig.informIntervalSeconds}
                  onChange={e => updateGenieacsConfig({ informIntervalSeconds: Number(e.target.value) })}
                  placeholder="300"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            {/* Feature Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white">Sinkronisasi WiFi Mandiri</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Izinkan perubahan SSID &amp; Password dari portal pelanggan langsung diteruskan ke TR-069.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={genieacsConfig.autoSyncWifi}
                  onChange={e => updateGenieacsConfig({ autoSyncWifi: e.target.checked })}
                  className="w-5 h-5 rounded text-teal-600 focus:ring-0 bg-slate-900 border-slate-700 cursor-pointer"
                />
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white">Ambang Redaman Buruk (Threshold)</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Beri tanda peringatan jika redaman optik RX lebih buruk dari: <span className="font-mono text-amber-400 font-bold">{genieacsConfig.opticalAlertDbmThreshold} dBm</span>
                  </p>
                </div>
                <span className="font-mono text-xs font-extrabold px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-teal-300">
                  {genieacsConfig.opticalAlertDbmThreshold} dBm
                </span>
              </div>
            </div>

            {/* Action Test Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800">
              <span className="text-xs text-slate-400">
                GenieACS NBI Status: <span className="text-teal-400 font-bold">{genieacsConfig.status}</span>
              </span>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleTestGenieacs}
                  disabled={isTesting}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition cursor-pointer disabled:opacity-50"
                >
                  <Radio className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                  {isTesting ? 'Memverifikasi NBI GenieACS...' : 'Tes Koneksi GenieACS NBI'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: TELEGRAM BOT */}
      {activeTab === 'TELEGRAM' && (
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 md:p-8 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Send className="w-5 h-5 text-sky-400" />
                Bot Telegram Notifikasi &amp; Laporan Real-Time
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Terima notifikasi real-time ke channel/grup admin setiap ada pembayaran berhasil atau laporan gangguan jaringan.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
              ● Telegram Bot Online
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-4xl">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Bot Token (dari @BotFather):
              </label>
              <input
                type="password"
                value={telegramConfig.botToken}
                onChange={e => updateTelegramConfig({ botToken: e.target.value })}
                placeholder="719827391:AAHk..."
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Username Bot:
              </label>
              <input
                type="text"
                value={telegramConfig.botUsername}
                onChange={e => updateTelegramConfig({ botUsername: e.target.value })}
                placeholder="@NetBillingIspBot"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-sky-300 font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Admin Chat ID / Group ID:
              </label>
              <input
                type="text"
                value={telegramConfig.adminChatId}
                onChange={e => updateTelegramConfig({ adminChatId: e.target.value })}
                placeholder="-100192837482"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Channel Broadcast Publik:
              </label>
              <input
                type="text"
                value={telegramConfig.channelId}
                onChange={e => updateTelegramConfig({ channelId: e.target.value })}
                placeholder="@netbilling_broadcast"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleTestTelegram}
              disabled={isTesting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition cursor-pointer disabled:opacity-50"
            >
              <Send className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              {isTesting ? 'Menguji Bot Telegram...' : 'Tes Kirim Notifikasi Telegram'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
