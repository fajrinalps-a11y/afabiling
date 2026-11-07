import React, { useState } from 'react';
import { useISP } from '../context/ISPContext';
import { Customer } from '../types';
import {
  Radio,
  Wifi,
  Signal,
  RotateCw,
  CheckCircle2,
  AlertTriangle,
  Server,
  Activity,
  Layers,
  Sliders,
  Search,
  ExternalLink
} from 'lucide-react';

export const GenieAcsBridge: React.FC = () => {
  const { genieacsConfig, customers, rebootCustomerOnt } = useISP();
  const [rebootingId, setRebootingId] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [searchOnt, setSearchOnt] = useState('');

  const handleReboot = async (cust: Customer) => {
    if (!window.confirm(`Kirim perintah reboot via TR-069 GenieACS ke ONT Serial ${cust.ontSerial} (${cust.name})?`)) {
      return;
    }
    setRebootingId(cust.id);
    setActionFeedback(null);
    try {
      const res = await rebootCustomerOnt(cust.id);
      setActionFeedback(res.message);
    } finally {
      setRebootingId(null);
    }
  };

  const filteredCustomers = customers.filter(
    c =>
      c.name.toLowerCase().includes(searchOnt.toLowerCase()) ||
      c.ontSerial.toLowerCase().includes(searchOnt.toLowerCase()) ||
      c.ontModel.toLowerCase().includes(searchOnt.toLowerCase()) ||
      c.wifiSSID.toLowerCase().includes(searchOnt.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12">
      {/* GenieACS Banner Header */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 md:p-8 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <Radio className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-extrabold text-white">
                  GenieACS TR-069 Remote Management
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                  NBI Connected
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                API Endpoint: <span className="font-mono text-teal-300">{genieacsConfig.apiUrl}</span> | CWMP Port:{' '}
                <span className="font-mono text-white">{genieacsConfig.tr069Port}</span> | Terakhir Sinkron:{' '}
                <span className="text-white font-mono">{genieacsConfig.lastSyncTime}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs">
            <div>
              <p className="text-[10px] text-slate-400 uppercase">TOTAL ONT</p>
              <p className="font-mono font-bold text-white text-base mt-0.5">
                {genieacsConfig.totalDevices} Unit
              </p>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase">ONLINE CWMP</p>
              <p className="font-mono font-bold text-emerald-400 text-base mt-0.5">
                {genieacsConfig.onlineDevices} Online
              </p>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase">OFFLINE / LOS</p>
              <p className="font-mono font-bold text-rose-400 text-base mt-0.5">
                {genieacsConfig.offlineDevices} Offline
              </p>
            </div>
          </div>
        </div>

        {actionFeedback && (
          <div className="mt-4 p-4 rounded-xl bg-teal-950/40 border border-teal-800/40 text-xs text-teal-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
            <span>{actionFeedback}</span>
          </div>
        )}
      </div>

      {/* ONT Device Table */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 md:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <h3 className="font-bold text-white text-base">
              Inventaris Modem ONT & Monitoring Redaman Optik (RX dBm)
            </h3>
            <p className="text-xs text-slate-400">
              Parameter WiFi SSID, WPA2 Key, dan status redaman terhubung langsung via GenieACS TR-069
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchOnt}
              onChange={e => setSearchOnt(e.target.value)}
              placeholder="Cari Serial, Nama, Model ONT..."
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          </div>
        </div>

        <div className="overflow-x-auto mt-6">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Pelanggan</th>
                <th className="py-3 px-4 font-semibold">Model ONT / Vendor</th>
                <th className="py-3 px-4 font-semibold">Serial Number (SN)</th>
                <th className="py-3 px-4 font-semibold">Nama WiFi (SSID)</th>
                <th className="py-3 px-4 font-semibold">Sinyal Optik (RX)</th>
                <th className="py-3 px-4 font-semibold">Uptime</th>
                <th className="py-3 px-4 font-semibold text-right">Aksi Remote TR-069</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredCustomers.map(c => {
                const isGoodSignal = c.opticalPowerRx >= -24;
                const isWarningSignal = c.opticalPowerRx < -24 && c.opticalPowerRx >= -27;
                return (
                  <tr key={c.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-white">{c.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{c.customerNo}</p>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-200">
                      {c.ontModel}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-teal-300">
                      {c.ontSerial}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-medium text-white">
                        <Wifi className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{c.wifiSSID}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono font-extrabold px-2 py-0.5 rounded text-xs ${
                            isGoodSignal
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : isWarningSignal
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {c.opticalPowerRx} dBm
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {isGoodSignal ? 'Bagus' : isWarningSignal ? 'Cek FO' : 'Redaman Buruk'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      {c.uptimeHours} Jam
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleReboot(c)}
                        disabled={rebootingId === c.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold border border-slate-700 transition cursor-pointer disabled:opacity-50"
                      >
                        <RotateCw
                          className={`w-3.5 h-3.5 text-teal-400 ${
                            rebootingId === c.id ? 'animate-spin' : ''
                          }`}
                        />
                        <span>{rebootingId === c.id ? 'Rebooting...' : 'Remote Reboot'}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
