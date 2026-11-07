import React, { useState } from 'react';
import { useISP } from '../context/ISPContext';
import {
  Server,
  Activity,
  Cpu,
  ShieldAlert,
  Zap,
  CheckCircle2,
  RefreshCw,
  Power,
  Users,
  Wifi,
  Sliders,
  Terminal,
  Layers
} from 'lucide-react';

export const MikrotikBridge: React.FC = () => {
  const {
    mikrotikConfig,
    customers,
    packages,
    toggleCustomerIsolir,
    runAutoIsolirJob,
    updateMikrotikConfig
  } = useISP();

  const [isExecutingCron, setIsExecutingCron] = useState(false);
  const [cronResult, setCronResult] = useState<string | null>(null);

  const isolatedCustomers = customers.filter(c => c.status === 'ISOLIR');
  const activeCustomers = customers.filter(c => c.status === 'ACTIVE');

  const handleRunAutoIsolir = () => {
    setIsExecutingCron(true);
    setCronResult(null);
    setTimeout(() => {
      const res = runAutoIsolirJob();
      setCronResult(res.message);
      setIsExecutingCron(false);
    }, 900);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* MikroTik RouterOS Live Hardware Banner */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 md:p-8 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Server className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-extrabold text-white">
                  MikroTik RouterOS Core Engine
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  API Connected
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Model: <span className="text-white font-medium">{mikrotikConfig.routerModel}</span> | Versi:{' '}
                <span className="text-white font-medium">{mikrotikConfig.routerOsVersion}</span> | Host:{' '}
                <span className="font-mono text-cyan-300">{mikrotikConfig.host}:{mikrotikConfig.port}</span>
              </p>
            </div>
          </div>

          {/* Real-time Hardware Meters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-xs">
            <div>
              <p className="text-[10px] text-slate-400 uppercase">CPU LOAD</p>
              <p className="font-mono font-bold text-white text-base mt-0.5">
                {mikrotikConfig.cpuLoadPercent}%
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase">PPPoE SESSIONS</p>
              <p className="font-mono font-bold text-cyan-400 text-base mt-0.5">
                {mikrotikConfig.activeSessions} Aktif
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase">TX TRAFFIC</p>
              <p className="font-mono font-bold text-emerald-400 text-base mt-0.5">
                {mikrotikConfig.currentTrafficTxMbps} Mbps
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase">RX TRAFFIC</p>
              <p className="font-mono font-bold text-sky-400 text-base mt-0.5">
                {mikrotikConfig.currentTrafficRxMbps} Mbps
              </p>
            </div>
          </div>
        </div>

        {/* Action Trigger for Auto-Isolir Scheduler */}
        <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-950/80 p-5 rounded-2xl border border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-white text-sm">
                Sistem Isolir Otomatis (Auto-Isolir Scheduler Rule)
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Aturan otomatis memindai pelanggan yang menunggak melewati tanggal jatuh tempo ({mikrotikConfig.gracePeriodDays} hari masa tenggang), memasukkan IP ke address-list <code className="text-rose-400 font-mono">ISOLIR_USER_BLOCKED</code>, dan memutus rute internet publik kecuali akses portal pembayaran.
            </p>
          </div>

          <button
            onClick={handleRunAutoIsolir}
            disabled={isExecutingCron}
            className="shrink-0 flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs shadow-lg shadow-rose-950/50 transition cursor-pointer disabled:opacity-50"
          >
            <Zap className={`w-4 h-4 ${isExecutingCron ? 'animate-spin' : ''}`} />
            {isExecutingCron ? 'Mengeksekusi Rule MikroTik...' : 'Jalankan Auto-Isolir Sekarang'}
          </button>
        </div>

        {cronResult && (
          <div className="mt-4 p-4 rounded-xl bg-cyan-950/40 border border-cyan-800/40 text-xs text-cyan-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{cronResult}</span>
          </div>
        )}
      </div>

      {/* Grid: Address-List ISOLIR Table & Queue Bandwidth Profiles */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: MikroTik Address-List Isolir (2 Cols) */}
        <div className="lg:col-span-2 rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              <h3 className="font-bold text-white text-base">
                MikroTik Firewall Address-List: <span className="font-mono text-rose-400 text-sm">ISOLIR_USER_BLOCKED</span>
              </h3>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold">
              {isolatedCustomers.length} Pelanggan Terisolir
            </span>
          </div>

          <p className="text-xs text-slate-400 mt-3">
            Daftar IP pelanggan yang sedang terisolir di router MikroTik. Begitu pelanggan membayar via QRIS/VA, baris ini otomatis dihapus dan koneksi normal seketika.
          </p>

          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Pelanggan</th>
                  <th className="py-2.5 px-3 font-semibold">IP Address</th>
                  <th className="py-2.5 px-3 font-semibold">PPPoE User</th>
                  <th className="py-2.5 px-3 font-semibold">Tunggakan Tagihan</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {isolatedCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-emerald-400">
                      ✓ Bersih! Tidak ada pelanggan yang sedang terisolir saat ini.
                    </td>
                  </tr>
                ) : (
                  isolatedCustomers.map(c => (
                    <tr key={c.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-3">
                        <p className="font-bold text-white">{c.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{c.customerNo}</p>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-rose-400">
                        {c.ipAddress}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-300">
                        {c.pppoeUsername}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-mono text-amber-400 font-semibold">
                          Rp {c.currentBill.amount.toLocaleString('id-ID')}
                        </span>
                        <p className="text-[10px] text-rose-400 font-medium">Jatuh Tempo: {c.currentBill.dueDate}</p>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => toggleCustomerIsolir(c.id, 'Pencabutan manual oleh Administrator')}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
                        >
                          Buka Isolir
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Simple Queues Rate-Limit Profiles (1 Col) */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
              <Sliders className="w-5 h-5 text-cyan-400" />
              <h3 className="font-bold text-white text-base">
                MikroTik Simple Queues Rate-Limit
              </h3>
            </div>

            <p className="text-xs text-slate-400 mt-3">
              Profil kecepatan bandwidth yang disinkronkan ke pelanggan:
            </p>

            <div className="mt-4 space-y-3">
              {packages.map(pkg => (
                <div key={pkg.id} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-white">{pkg.name}</span>
                    <span className="font-mono text-xs font-bold text-cyan-400">
                      {pkg.downloadSpeed}
                    </span>
                  </div>
                  <div className="mt-2 text-[11px] font-mono text-slate-400 space-y-1">
                    <p>max-limit: {pkg.uploadSpeed} / {pkg.downloadSpeed}</p>
                    <p>burst-limit: {(pkg.speedMbps * 1.2).toFixed(0)}M/{(pkg.speedMbps * 0.6).toFixed(0)}M</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-500">
            Engine terintegrasi via MikroTik RouterOS API Port 8728 (SSL Enabled).
          </div>
        </div>
      </div>
    </div>
  );
};
