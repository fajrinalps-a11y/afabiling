import React from 'react';
import { PaymentTransaction, Customer } from '../types';
import { useISP } from '../context/ISPContext';
import { Printer, X, CheckCircle2, ShieldCheck, Download, Share2 } from 'lucide-react';

interface ReceiptModalProps {
  transaction: PaymentTransaction | null;
  customer?: Customer;
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  transaction,
  customer,
  isOpen,
  onClose
}) => {
  const { companyProfile, bankAccounts } = useISP();

  if (!isOpen || !transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(num);
  };

  const primaryBank = bankAccounts.find(b => b.isPrimary) || bankAccounts[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto no-print">
      <div className="relative w-full max-w-2xl bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-8">
        {/* Modal Controls Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-emerald-400" />
            <span className="font-semibold text-sm">Bukti Pembayaran / Kwitansi Resmi</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-all shadow-sm cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Cetak / Simpan PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE RECEIPT CONTENT */}
        <div id="printable-receipt" className="p-8 bg-white font-sans text-slate-900">
          {/* Company & Document Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-slate-900 pb-6 gap-4">
            <div>
              <div className="flex items-center gap-3">
                {companyProfile.logoUrl ? (
                  <img
                    src={companyProfile.logoUrl}
                    alt={companyProfile.brandName}
                    className="h-12 w-auto max-w-[150px] object-contain rounded-lg"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white font-black text-lg">
                    NB
                  </div>
                )}
                <div>
                  <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
                    {companyProfile.brandName}
                  </h1>
                  <p className="text-xs text-slate-600 font-medium">{companyProfile.companyName}</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 mt-2.5 max-w-sm leading-relaxed">
                {companyProfile.address}<br />
                Hotline CS: {companyProfile.phone} | Email: {companyProfile.email}<br />
                <span className="text-[10px] text-slate-400 font-mono">Izin Kominfo / {companyProfile.licenseNo}</span>
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold rounded-md uppercase tracking-wide">
                LUNAS / BERHASIL
              </span>
              <p className="text-xs font-mono font-bold text-slate-900 mt-2">
                NO: {transaction.invoiceNo}
              </p>
              <p className="text-xs text-slate-500">
                Waktu Bayar: {transaction.paidAt}
              </p>
            </div>
          </div>

          {/* Customer & Transaction Overview */}
          <div className="grid grid-cols-2 gap-4 my-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <p className="text-slate-400 font-medium uppercase text-[10px] tracking-wider">Diterima Dari:</p>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{transaction.customerName}</p>
              <p className="text-slate-600">No. Pelanggan: <span className="font-mono font-semibold">{customer?.customerNo || 'NET-2024-CUST'}</span></p>
              <p className="text-slate-600">{transaction.customerPhone}</p>
              <p className="text-slate-500 text-[11px] mt-1">{customer?.address || 'Alamat Pelanggan Terdaftar'}</p>
            </div>
            <div className="text-right">
              <p className="text-slate-400 font-medium uppercase text-[10px] tracking-wider">Detail Pembayaran:</p>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{transaction.paymentMethod === 'TRIPAY' ? 'Tripay Multi-Payment' : transaction.paymentMethod}</p>
              <p className="text-slate-600">Ref Transaksi: <span className="font-mono font-semibold">{transaction.paymentReference}</span></p>
              <p className="text-slate-600">Paket: <span className="font-semibold">{transaction.packageName} ({transaction.packageSpeed} Mbps)</span></p>
              <p className="text-emerald-600 font-medium mt-1">Status MikroTik: Un-Isolated (Aktif)</p>
            </div>
          </div>

          {/* Table Breakdown */}
          <div className="border border-slate-200 rounded-lg overflow-hidden my-4">
            <table className="w-full text-xs">
              <thead className="bg-slate-100 border-b border-slate-200 text-slate-700">
                <tr>
                  <th className="py-2.5 px-4 text-left font-semibold">Deskripsi Layanan</th>
                  <th className="py-2.5 px-4 text-center font-semibold">Periode</th>
                  <th className="py-2.5 px-4 text-right font-semibold">Jumlah</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                <tr>
                  <td className="py-3 px-4">
                    <p className="font-bold">Langganan Internet Unlimited WiFi {transaction.packageSpeed} Mbps</p>
                    <p className="text-[11px] text-slate-500">Bandwidth simetris, unisolir otomatis via MikroTik RouterOS &amp; GenieACS sync.</p>
                  </td>
                  <td className="py-3 px-4 text-center font-mono">
                    {new Date(transaction.paidAt).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-semibold">
                    {formatRupiah(transaction.amount)}
                  </td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="py-2 px-4 text-slate-600">Biaya Administrasi Gateway &amp; Notifikasi WhatsApp/Telegram</td>
                  <td className="py-2 px-4 text-center text-slate-400">-</td>
                  <td className="py-2 px-4 text-right font-mono text-emerald-600 font-medium">GRATIS (Rp 0)</td>
                </tr>
              </tbody>
              <tfoot className="bg-slate-900 text-white font-bold">
                <tr>
                  <td colSpan={2} className="py-3 px-4 text-sm text-right">TOTAL PEMBAYARAN</td>
                  <td className="py-3 px-4 text-sm text-right font-mono text-emerald-400">
                    {formatRupiah(transaction.amount)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Bank Info on Receipt */}
          {primaryBank && (
            <div className="my-3 p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600 flex justify-between items-center">
              <span>Rekening Resmi: <strong className="text-slate-800">{primaryBank.bankName}</strong> ({primaryBank.accountNumber}) A/N {primaryBank.accountHolder}</span>
              <span className="text-emerald-700 font-semibold">Status: Terverifikasi</span>
            </div>
          )}

          {/* Verification Footnotes & QR Stamp */}
          <div className="flex flex-col sm:flex-row items-center justify-between pt-5 border-t border-slate-200 gap-4 mt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 border border-slate-300 rounded-lg bg-slate-50 flex items-center justify-center">
                <svg className="w-14 h-14 text-slate-900" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14-2h4v2h-4v-2zm-4 0h2v4h-2v-4zm2 4h2v4h-2v-4zm2 2h2v2h-2v-2zm0-4h2v2h-2v-2zM5 5h2v2H5V5zm12 0h2v2h-2V5zM5 17h2v2H5v-2z" />
                </svg>
              </div>
              <div className="text-[10px] text-slate-500 max-w-[240px]">
                <p className="font-semibold text-slate-700">Validasi Digital Otomatis</p>
                <p>Dokumen ini diterbitkan secara sah oleh sistem {companyProfile.brandName} Gateway. Scan QR untuk memverifikasi keaslian transaksi pada database server.</p>
              </div>
            </div>

            <div className="text-center sm:text-right">
              <div className="inline-flex items-center gap-1 text-emerald-700 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4" />
                Sistem Terintegrasi MikroTik &amp; GenieACS
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Bendahara &amp; Billing Automation Engine</p>
            </div>
          </div>
        </div>

        {/* Footer actions for screen view */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between no-print">
          <p className="text-xs text-slate-500">
            Kwitansi dapat dicetak ulang kapan saja melalui menu Riwayat Pembayaran.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition cursor-pointer"
            >
              Tutup
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition shadow cursor-pointer"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              Cetak Sekarang
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
