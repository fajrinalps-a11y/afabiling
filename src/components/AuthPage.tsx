import React, { useState } from 'react';
import { useISP } from '../context/ISPContext';
import {
  Wifi,
  ShieldCheck,
  User,
  Lock,
  ArrowRight,
  Phone,
  FileText,
  AlertCircle,
  CheckCircle2,
  Radio,
  Sparkles,
  HelpCircle,
  Eye,
  EyeOff
} from 'lucide-react';

interface AuthPageProps {
  initialRole?: 'CUSTOMER' | 'ADMIN';
  onLoginSuccess: (role: 'CUSTOMER' | 'ADMIN') => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  initialRole = 'CUSTOMER',
  onLoginSuccess
}) => {
  const {
    customers,
    packages,
    companyProfile,
    setActiveCustomerId
  } = useISP();

  const [authMode, setAuthMode] = useState<'CUSTOMER' | 'ADMIN'>(initialRole);

  // Customer Login Form State
  const [customerIdentifier, setCustomerIdentifier] = useState('085712348899'); // Default to Siti (Isolir) or Budi
  const [customerPin, setCustomerPin] = useState('123456');
  const [customerError, setCustomerError] = useState<string | null>(null);
  const [isCustomerLoading, setIsCustomerLoading] = useState(false);

  // Admin Login Form State
  const [adminUsername, setAdminUsername] = useState('admin');
  const [adminPassword, setAdminPassword] = useState('admin123');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [isAdminLoading, setIsAdminLoading] = useState(false);

  // Terms Modal State
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Handle Customer Login
  const handleCustomerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCustomerLoading(true);
    setCustomerError(null);

    setTimeout(() => {
      const trimmed = customerIdentifier.trim();
      const matched = customers.find(
        c =>
          c.customerNo.toLowerCase() === trimmed.toLowerCase() ||
          c.phone.replace(/[^0-9]/g, '') === trimmed.replace(/[^0-9]/g, '') ||
          c.email.toLowerCase() === trimmed.toLowerCase()
      );

      if (matched) {
        setActiveCustomerId(matched.id);
        setIsCustomerLoading(false);
        onLoginSuccess('CUSTOMER');
      } else {
        setIsCustomerLoading(false);
        setCustomerError(
          'Nomor Pelanggan atau Nomor WhatsApp tidak ditemukan. Silakan cek kembali atau pilih salah satu akun demo di bawah.'
        );
      }
    }, 600);
  };

  // Quick Select Customer Demo
  const handleSelectDemoCustomer = (customerId: string) => {
    const cust = customers.find(c => c.id === customerId);
    if (cust) {
      setCustomerIdentifier(cust.phone);
      setActiveCustomerId(cust.id);
      setIsCustomerLoading(true);
      setTimeout(() => {
        setIsCustomerLoading(false);
        onLoginSuccess('CUSTOMER');
      }, 300);
    }
  };

  // Handle Admin Login
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdminLoading(true);
    setAdminError(null);

    setTimeout(() => {
      if (
        (adminUsername.trim().toLowerCase() === 'admin' && adminPassword === 'admin123') ||
        (adminUsername.trim().toLowerCase() === 'isp' && adminPassword === 'isp123')
      ) {
        setIsAdminLoading(false);
        onLoginSuccess('ADMIN');
      } else {
        setIsAdminLoading(false);
        setAdminError('Username atau Password Admin salah. Gunakan default: admin / admin123');
      }
    }, 600);
  };

  const handleInstantAdminDemo = () => {
    setAdminUsername('admin');
    setAdminPassword('admin123');
    setIsAdminLoading(true);
    setTimeout(() => {
      setIsAdminLoading(false);
      onLoginSuccess('ADMIN');
    }, 300);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background Ambience Glows */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-xl z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center">
            {companyProfile.logoUrl ? (
              <img
                src={companyProfile.logoUrl}
                alt="Logo"
                className="h-16 w-auto max-w-[200px] object-contain rounded-xl p-1 bg-white/5 border border-white/10 shadow-lg"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 via-teal-500 to-blue-600 flex items-center justify-center text-slate-950 shadow-xl shadow-cyan-950/60 ring-2 ring-white/10">
                <Wifi className="w-8 h-8 stroke-[2.5]" />
              </div>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {companyProfile.brandName}
          </h1>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {companyProfile.companyName} • Sistem Pembayaran WiFi Otomatis, Manajemen MikroTik & GenieACS TR-069
          </p>
        </div>

        {/* Role Tab Switcher */}
        <div className="p-1.5 bg-slate-900 border border-slate-800 rounded-2xl flex gap-1 shadow-lg">
          <button
            type="button"
            onClick={() => setAuthMode('CUSTOMER')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition cursor-pointer ${
              authMode === 'CUSTOMER'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-950/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-850'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Portal Pelanggan</span>
          </button>

          <button
            type="button"
            onClick={() => setAuthMode('ADMIN')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition cursor-pointer ${
              authMode === 'ADMIN'
                ? 'bg-slate-800 text-white shadow-md border border-slate-700'
                : 'text-slate-400 hover:text-white hover:bg-slate-850'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Login Administrator</span>
          </button>
        </div>

        {/* Card Body */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
          {/* CUSTOMER LOGIN VIEW */}
          {authMode === 'CUSTOMER' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white">Masuk ke Portal Mandiri</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Pantau tagihan, bayar via QRIS/VA real-time, cetak kwitansi resmi, dan ganti nama/password WiFi rumah Anda.
                </p>
              </div>

              {customerError && (
                <div className="p-3.5 rounded-2xl bg-rose-950/50 border border-rose-800/50 text-xs text-rose-300 flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{customerError}</span>
                </div>
              )}

              <form onSubmit={handleCustomerLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    No. WhatsApp atau ID Pelanggan
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={customerIdentifier}
                      onChange={e => setCustomerIdentifier(e.target.value)}
                      placeholder="Contoh: 081234567890 atau NET-2024-001"
                      className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 font-medium"
                    />
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                      PIN Keamanan
                    </label>
                    <span className="text-[11px] text-slate-500">Default Demo: 123456</span>
                  </div>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={customerPin}
                      onChange={e => setCustomerPin(e.target.value)}
                      placeholder="••••••"
                      className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 font-mono tracking-widest"
                    />
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isCustomerLoading}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 via-teal-500 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-slate-950 font-black text-xs shadow-xl shadow-cyan-950/60 transition cursor-pointer disabled:opacity-50"
                  >
                    {isCustomerLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        <span>Memverifikasi Akun...</span>
                      </>
                    ) : (
                      <>
                        <span>Masuk ke Portal Mandiri</span>
                        <ArrowRight className="w-4 h-4 text-slate-950" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Instant Demo Accounts Picker */}
              <div className="pt-5 border-t border-slate-800">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Pilih Akun Demo untuk Uji Coba Instan:
                  </span>
                </div>
                <div className="space-y-2">
                  {customers.slice(0, 3).map(c => {
                    const pkg = packages.find(p => p.id === c.packageId);
                    const isIso = c.status === 'ISOLIR';
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleSelectDemoCustomer(c.id)}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 transition cursor-pointer text-left"
                      >
                        <div>
                          <p className="text-xs font-bold text-white">{c.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {c.customerNo} • {c.phone} • {pkg?.downloadSpeed}
                          </p>
                        </div>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            isIso
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          {isIso ? 'TERISOLIR (Uji Buka Isolir)' : 'Lancar'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Footer Links */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTermsModal(true)}
                  className="hover:text-cyan-400 underline cursor-pointer"
                >
                  Syarat & Ketentuan Layanan
                </button>
                <span>Bantuan CS: {companyProfile.phone.split('/')[0]}</span>
              </div>
            </div>
          )}

          {/* ADMIN LOGIN VIEW */}
          {authMode === 'ADMIN' && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase">
                    Admin NOC & Billing
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white mt-1">Login Administrator ISP</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Akses modul statistik keuangan, pengelolaan MikroTik RouterOS, GenieACS TR-069, peta GIS ODC/ODP, dan integrasi Payment Gateway Tripay.
                </p>
              </div>

              {adminError && (
                <div className="p-3.5 rounded-2xl bg-rose-950/50 border border-rose-800/50 text-xs text-rose-300 flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{adminError}</span>
                </div>
              )}

              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Username Admin
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={adminUsername}
                      onChange={e => setAdminUsername(e.target.value)}
                      placeholder="admin"
                      className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 font-medium"
                    />
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showAdminPassword ? 'text' : 'password'}
                      required
                      value={adminPassword}
                      onChange={e => setAdminPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-12 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                    />
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                      className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300 cursor-pointer"
                    >
                      {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isAdminLoading}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-xl shadow-cyan-950/60 transition cursor-pointer disabled:opacity-50"
                  >
                    {isAdminLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Mengautentikasi Admin...</span>
                      </>
                    ) : (
                      <>
                        <span>Masuk ke Dashboard Billing</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Instant Demo Admin Button */}
              <div className="pt-5 border-t border-slate-800 text-center">
                <p className="text-[11px] text-slate-400">
                  Kredensial Default:{' '}
                  <code className="text-cyan-300 font-mono font-bold">admin</code> /{' '}
                  <code className="text-cyan-300 font-mono font-bold">admin123</code>
                </p>
                <button
                  type="button"
                  onClick={handleInstantAdminDemo}
                  className="mt-2.5 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold transition cursor-pointer border border-slate-700"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>⚡ Masuk Cepat sebagai Admin (1-Klik)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Syarat & Ketentuan Layanan */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-white text-base">Syarat dan Ketentuan Layanan</h3>
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

            <div className="mt-5 text-right">
              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition cursor-pointer"
              >
                Saya Mengerti & Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
