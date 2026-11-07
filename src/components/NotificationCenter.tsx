import React, { useState } from 'react';
import { useISP } from '../context/ISPContext';
import { NotificationLog, OutageAlert } from '../types';
import {
  MessageSquare,
  Send,
  AlertTriangle,
  BellRing,
  CheckCircle2,
  Filter,
  RefreshCw,
  Smartphone,
  Radio,
  FileCheck,
  Zap,
  Users
} from 'lucide-react';

export const NotificationCenter: React.FC = () => {
  const {
    notifications,
    customers,
    odcs,
    odps,
    outages,
    createOutageAlert,
    broadcastMonthlyBillingReminders,
    sendCustomNotification
  } = useISP();

  const [channelFilter, setChannelFilter] = useState<'ALL' | 'WHATSAPP' | 'TELEGRAM'>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | NotificationLog['type']>('ALL');

  // Outage Broadcast form state
  const [showOutageForm, setShowOutageForm] = useState(false);
  const [outageTitle, setOutageTitle] = useState('Gangguan Redaman Tinggi & Putus Kabel FO');
  const [outageDesc, setOutageDesc] = useState(
    'Terjadi penurunan kualitas redaman pada jalur distribusi ODC Cempaka akibat perbaikan tiang PLN. Tim teknisi kami sedang melakukan splicing core FO di lokasi.'
  );
  const [outageScope, setOutageScope] = useState<OutageAlert['scope']>('ALL');
  const [outageTargetId, setOutageTargetId] = useState<string>('');
  const [outageSeverity, setOutageSeverity] = useState<OutageAlert['severity']>('HIGH');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastFeedback, setBroadcastFeedback] = useState<string | null>(null);

  // Billing Reminder state
  const [isSendingBillReminder, setIsSendingBillReminder] = useState(false);
  const [billReminderFeedback, setBillReminderFeedback] = useState<string | null>(null);

  // Custom single message state
  const [showCustomMsgModal, setShowCustomMsgModal] = useState(false);
  const [customRecipient, setCustomRecipient] = useState('');
  const [customName, setCustomName] = useState('');
  const [customTitle, setCustomTitle] = useState('Pemberitahuan Khusus');
  const [customMsg, setCustomMsg] = useState('');
  const [customChannel, setCustomChannel] = useState<'WHATSAPP' | 'TELEGRAM' | 'BOTH'>('WHATSAPP');

  // Handle Outage Broadcast Submit
  const handleBroadcastOutage = (e: React.FormEvent) => {
    e.preventDefault();
    setIsBroadcasting(true);
    setBroadcastFeedback(null);

    setTimeout(() => {
      const res = createOutageAlert(
        outageTitle,
        outageDesc,
        outageScope,
        outageTargetId || undefined,
        outageSeverity
      );
      setBroadcastFeedback(
        `Berhasil menyiarkan Notifikasi Gangguan ke ${res.waCount} pelanggan terdampak via WhatsApp (Tiket: ${res.outage.ticketNo})`
      );
      setIsBroadcasting(false);
      setShowOutageForm(false);
    }, 700);
  };

  // Handle Monthly Billing Reminder Broadcast
  const handleBroadcastBilling = () => {
    setIsSendingBillReminder(true);
    setBillReminderFeedback(null);
    setTimeout(() => {
      const res = broadcastMonthlyBillingReminders();
      setBillReminderFeedback(res.message);
      setIsSendingBillReminder(false);
    }, 800);
  };

  // Handle Custom Message Submit
  const handleSendCustomMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customRecipient || !customMsg) return;
    sendCustomNotification(
      'BILLING_REMINDER',
      customChannel,
      customRecipient,
      customName || 'Pelanggan',
      customTitle,
      customMsg
    );
    setShowCustomMsgModal(false);
    setCustomMsg('');
    setCustomRecipient('');
  };

  const filteredLogs = notifications.filter(n => {
    if (channelFilter !== 'ALL' && n.channel !== channelFilter && n.channel !== 'BOTH') return false;
    if (typeFilter !== 'ALL' && n.type !== typeFilter) return false;
    return true;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Action Header: Billing & Outage Broadcast Engine */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Broadcast Tagihan Bulanan Otomatis */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <BellRing className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Notifikasi Tagihan Otomatis</h3>
                <p className="text-xs text-slate-400">
                  Engine pengingat tagihan bulanan via WhatsApp Gateway
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 mt-4 leading-relaxed">
              Kirimkan pesan pengingat tagihan resmi otomatis yang memuat detail invoice, tanggal jatuh tempo, dan tautan portal pembayaran online bagi pelanggan yang belum lunas.
            </p>

            {billReminderFeedback && (
              <div className="mt-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{billReminderFeedback}</span>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Pelanggan Belum Bayar:{' '}
              <span className="font-mono font-bold text-amber-400">
                {customers.filter(c => c.currentBill.status !== 'PAID').length}
              </span>
            </span>
            <button
              onClick={handleBroadcastBilling}
              disabled={isSendingBillReminder}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/50 transition cursor-pointer disabled:opacity-50"
            >
              <Send className={`w-3.5 h-3.5 ${isSendingBillReminder ? 'animate-spin' : ''}`} />
              {isSendingBillReminder ? 'Mengirim WhatsApp...' : 'Kirim Pengingat Tagihan (WA)'}
            </button>
          </div>
        </div>

        {/* Card 2: Broadcast Gangguan Jaringan Otomatis */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Notifikasi Gangguan Otomatis</h3>
                <p className="text-xs text-slate-400">
                  Broadcast insiden / pemeliharaan kabel fiber optik
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 mt-4 leading-relaxed">
              Peringatkan pelanggan secara instan via WhatsApp ketika terjadi pemeliharaan, putus kabel FO, atau perbaikan ODC/ODP untuk mencegah komplain berulang.
            </p>

            {broadcastFeedback && (
              <div className="mt-4 p-3 rounded-xl bg-rose-950/40 border border-rose-800/40 text-xs text-rose-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{broadcastFeedback}</span>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Total Insiden Terbuka: <span className="font-mono font-bold text-rose-400">{outages.filter(o => o.status === 'OPEN').length}</span>
            </span>
            <button
              onClick={() => setShowOutageForm(!showOutageForm)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-950/50 transition cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              {showOutageForm ? 'Tutup Formulir' : 'Buat Broadcast Gangguan'}
            </button>
          </div>
        </div>
      </div>

      {/* Outage Form Drawer */}
      {showOutageForm && (
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 md:p-8 shadow-2xl">
          <div className="border-b border-slate-800 pb-4 mb-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Radio className="w-5 h-5 text-rose-400" />
              Formulir Broadcast Gangguan Jaringan Otomatis via WhatsApp
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Pesan akan otomatis diformat dan dikirimkan ke nomor WhatsApp pelanggan pada area terdampak.
            </p>
          </div>

          <form onSubmit={handleBroadcastOutage} className="space-y-4 max-w-3xl">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Cakupan Wilayah Terdampak:
                </label>
                <select
                  value={outageScope}
                  onChange={e => setOutageScope(e.target.value as any)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="ALL">Semua Pelanggan (Massal)</option>
                  <option value="ODC">Spesifik Cluster ODC</option>
                  <option value="ODP">Spesifik Titik ODP</option>
                </select>
              </div>

              {outageScope === 'ODC' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Pilih Kabinet ODC:
                  </label>
                  <select
                    value={outageTargetId}
                    onChange={e => setOutageTargetId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="">-- Pilih ODC --</option>
                    {odcs.map(o => (
                      <option key={o.id} value={o.id}>
                        {o.name} ({o.code})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {outageScope === 'ODP' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Pilih Titik ODP:
                  </label>
                  <select
                    value={outageTargetId}
                    onChange={e => setOutageTargetId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="">-- Pilih ODP --</option>
                    {odps.map(o => (
                      <option key={o.id} value={o.id}>
                        {o.name} ({o.code})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Tingkat Keparahan (Severity):
                </label>
                <select
                  value={outageSeverity}
                  onChange={e => setOutageSeverity(e.target.value as any)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="LOW">Rendah (Pengerjaan Minor)</option>
                  <option value="MEDIUM">Sedang (Optimasi Jalur)</option>
                  <option value="HIGH">Tinggi (Kabel Putus / LOS)</option>
                  <option value="CRITICAL">Kritis (Down Total)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Judul Insiden:
              </label>
              <input
                type="text"
                value={outageTitle}
                onChange={e => setOutageTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Pesan WhatsApp Penjelasan Teknis & Estimasi:
              </label>
              <textarea
                rows={3}
                value={outageDesc}
                onChange={e => setOutageDesc(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowOutageForm(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isBroadcasting}
                className="flex items-center gap-2 px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg transition cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                {isBroadcasting ? 'Mengirim Broadcast...' : 'Kirim Siaran WhatsApp Sekarang'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Section 2: Audit Log Notifikasi WhatsApp & Telegram Real-Time */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 md:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                Log Notifikasi WhatsApp & Telegram
              </h3>
              <p className="text-xs text-slate-400">
                Pencatatan real-time pengiriman struk pembayaran, notifikasi isolir, dan pengingat tagihan
              </p>
            </div>
          </div>

          {/* Filters & Action */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={channelFilter}
              onChange={e => setChannelFilter(e.target.value as any)}
              className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none"
            >
              <option value="ALL">Semua Channel</option>
              <option value="WHATSAPP">WhatsApp</option>
              <option value="TELEGRAM">Telegram</option>
            </select>

            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value as any)}
              className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none"
            >
              <option value="ALL">Semua Jenis Pesan</option>
              <option value="PAYMENT_RECEIPT">Struk Pembayaran Diterima</option>
              <option value="BILLING_REMINDER">Pengingat Tagihan Bulanan</option>
              <option value="ISOLIR_ALERT">Isolir Otomatis</option>
              <option value="OUTAGE_NOTICE">Gangguan Jaringan</option>
            </select>

            <button
              onClick={() => setShowCustomMsgModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              Kirim Pesan Manual
            </button>
          </div>
        </div>

        {/* Notification Stream Table */}
        <div className="overflow-x-auto mt-6">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Channel</th>
                <th className="py-3 px-4 font-semibold">Jenis Notifikasi</th>
                <th className="py-3 px-4 font-semibold">Penerima</th>
                <th className="py-3 px-4 font-semibold">Isi Pesan / Template</th>
                <th className="py-3 px-4 font-semibold">Waktu Kirim</th>
                <th className="py-3 px-4 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-800/30 transition">
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                        log.channel === 'WHATSAPP'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : log.channel === 'TELEGRAM'
                          ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                          : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                      }`}
                    >
                      {log.channel === 'WHATSAPP' ? 'WhatsApp' : log.channel === 'TELEGRAM' ? 'Telegram' : 'WA & Telegram'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-white">
                    {log.type === 'PAYMENT_RECEIPT'
                      ? 'Bukti Pembayaran Diterima'
                      : log.type === 'ISOLIR_ALERT'
                      ? 'Pemberitahuan Isolir'
                      : log.type === 'OUTAGE_NOTICE'
                      ? 'Broadcast Gangguan'
                      : 'Pengingat Tagihan'}
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-white">{log.recipientName}</p>
                    <p className="text-[11px] text-slate-400 font-mono">{log.recipient}</p>
                  </td>
                  <td className="py-3.5 px-4 max-w-md">
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-300 whitespace-pre-line font-mono line-clamp-3 hover:line-clamp-none transition-all cursor-pointer">
                      {log.message}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                    {log.timestamp}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" />
                      TERKIRIM
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Kirim Pesan Manual */}
      {showCustomMsgModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white">Kirim Pesan Notifikasi Baru</h3>
            <p className="text-xs text-slate-400 mt-1">
              Uji coba pengiriman pesan ke pelanggan spesifik via API.
            </p>

            <form onSubmit={handleSendCustomMessage} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Saluran (Channel):
                </label>
                <div className="flex gap-2">
                  {(['WHATSAPP', 'TELEGRAM', 'BOTH'] as const).map(ch => (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => setCustomChannel(ch)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                        customChannel === ch
                          ? 'bg-cyan-600 border-cyan-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nama Pelanggan:
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  placeholder="Budi Santoso"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nomor HP / Chat ID Telegram:
                </label>
                <input
                  type="text"
                  value={customRecipient}
                  onChange={e => setCustomRecipient(e.target.value)}
                  placeholder="081234567890"
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Isi Pesan:
                </label>
                <textarea
                  rows={3}
                  value={customMsg}
                  onChange={e => setCustomMsg(e.target.value)}
                  placeholder="Tulis pesan pengingat atau konfirmasi di sini..."
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition cursor-pointer"
                >
                  Kirim Notifikasi
                </button>
                <button
                  type="button"
                  onClick={() => setShowCustomMsgModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
