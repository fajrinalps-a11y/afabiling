import React, { useState } from 'react';
import { useISP } from '../context/ISPContext';
import {
  Wifi,
  ShieldCheck,
  User,
  Activity,
  Radio,
  Zap,
  ChevronDown,
  Lock,
  Layers,
  CheckCircle2,
  AlertTriangle,
  LogOut
} from 'lucide-react';

interface NavbarProps {
  onLogout?: () => void;
  isAuthenticated?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onLogout, isAuthenticated = true }) => {
  const {
    currentView,
    setCurrentView,
    activeCustomerId,
    setActiveCustomerId,
    activeCustomer,
    customers,
    mikrotikConfig,
    genieacsConfig,
    companyProfile,
    runAutoIsolirJob
  } = useISP();

  const [cronFeedback, setCronFeedback] = useState<string | null>(null);

  const handleRunAutoIsolirQuick = () => {
    const res = runAutoIsolirJob();
    setCronFeedback(res.message);
    setTimeout(() => setCronFeedback(null), 4000);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Brand Logo & Name (Supports uploaded custom logo) */}
          <div className="flex items-center gap-3">
            {companyProfile.logoUrl ? (
              <img
                src={companyProfile.logoUrl}
                alt={companyProfile.brandName}
                className="h-10 w-auto max-w-[150px] object-contain rounded-xl p-1 bg-white/5 border border-white/10"
              />
            ) : (
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-600 via-teal-500 to-blue-600 flex items-center justify-center text-slate-950 shadow-lg shadow-cyan-950/60 ring-2 ring-white/10">
                <Wifi className="w-6 h-6 stroke-[2.5]" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-white tracking-tight">
                  {companyProfile.brandName}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase tracking-wider hidden sm:inline-block">
                  ISP Billing &amp; GIS
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                MikroTik RouterOS • GenieACS TR-069 • Tripay QRIS
              </p>
            </div>
          </div>

          {/* Quick Live Network Status (MikroTik & GenieACS) */}
          <div className="hidden xl:flex items-center gap-2.5 bg-slate-900/80 px-3.5 py-1.5 rounded-2xl border border-slate-800 text-xs">
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold text-white">MikroTik:</span>
              <span className="font-mono text-cyan-400">{mikrotikConfig.currentTrafficTxMbps}M Tx</span>
            </div>
            <div className="h-4 w-px bg-slate-800" />
            <div className="flex items-center gap-1.5 text-slate-300">
              <Radio className="w-3.5 h-3.5 text-teal-400" />
              <span className="font-semibold text-white">GenieACS:</span>
              <span className="font-mono text-emerald-400">{genieacsConfig.onlineDevices} ONT</span>
            </div>
          </div>

          {/* View Switcher, Customer Selector & Logout */}
          <div className="flex items-center gap-3">
            {/* Quick Auto-Isolir Button */}
            <button
              type="button"
              onClick={handleRunAutoIsolirQuick}
              title="Pindai & Eksekusi Isolir Otomatis Pelanggan Overdue"
              className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold transition cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-rose-400" />
              <span>Auto-Isolir</span>
            </button>

            {/* View Selector Tabs */}
            <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-2xl">
              <button
                type="button"
                onClick={() => setCurrentView('CUSTOMER_PORTAL')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  currentView === 'CUSTOMER_PORTAL'
                    ? 'bg-cyan-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Portal</span> Pelanggan
              </button>

              <button
                type="button"
                onClick={() => setCurrentView('ADMIN')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  currentView === 'ADMIN'
                    ? 'bg-slate-800 text-white shadow-md border border-slate-700'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>Admin <span className="hidden sm:inline">Billing</span></span>
              </button>
            </div>

            {/* Customer Switcher (Visible in Customer Portal Mode) */}
            {currentView === 'CUSTOMER_PORTAL' && (
              <div className="relative">
                <select
                  value={activeCustomerId}
                  onChange={e => setActiveCustomerId(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-2 bg-slate-900 border border-cyan-500/40 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-cyan-400 transition cursor-pointer shadow-sm max-w-[140px] sm:max-w-none"
                >
                  {customers.map(c => (
                    <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                      {c.name} ({c.status === 'ISOLIR' ? 'TERISOLIR' : 'Aktif'})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
              </div>
            )}

            {/* Logout / Switch Account Button */}
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                title="Keluar ke Halaman Login"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-rose-400 text-xs font-semibold transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Keluar</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Global Feedback Banner for Auto-Isolir */}
      {cronFeedback && (
        <div className="bg-slate-900 border-t border-b border-rose-500/30 px-4 py-2 text-center text-xs text-rose-300 font-medium flex items-center justify-center gap-2">
          <Zap className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
          <span>{cronFeedback}</span>
        </div>
      )}
    </header>
  );
};
