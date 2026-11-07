/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ISPProvider, useISP } from './context/ISPContext';
import { Navbar } from './components/Navbar';
import { CustomerPortal } from './components/CustomerPortal';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthPage } from './components/AuthPage';
import { ShieldCheck, Wifi, Radio, MessageSquare } from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentView, setCurrentView } = useISP();

  // If in Login View, display full auth experience
  if (currentView === 'LOGIN') {
    return (
      <AuthPage
        initialRole="CUSTOMER"
        onLoginSuccess={role => {
          setCurrentView(role === 'ADMIN' ? 'ADMIN' : 'CUSTOMER_PORTAL');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Navbar */}
      <Navbar onLogout={() => setCurrentView('LOGIN')} />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {currentView === 'CUSTOMER_PORTAL' ? <CustomerPortal /> : <AdminDashboard />}
      </main>

      {/* Bottom Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950/80 py-8 text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-[10px]">
              NB
            </div>
            <span className="font-semibold text-slate-400">
              NetBilling Pro &copy; 2026 • Sistem Pembayaran WiFi &amp; Manajemen Jaringan ISP Terpadu
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Tripay &amp; QRIS Real-Time
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Radio className="w-3.5 h-3.5 text-teal-400" />
              GenieACS TR-069
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              WhatsApp &amp; Telegram Bot
            </span>
            <span>•</span>
            <button
              onClick={() => setCurrentView('LOGIN')}
              className="text-cyan-400 hover:underline font-semibold cursor-pointer"
            >
              Halaman Login
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <ISPProvider>
      <AppContent />
    </ISPProvider>
  );
}
