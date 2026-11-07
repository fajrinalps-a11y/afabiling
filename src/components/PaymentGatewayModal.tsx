import React, { useState, useEffect } from 'react';
import { Customer, PaymentTransaction, WifiPackage } from '../types';
import { useISP } from '../context/ISPContext';
import confetti from 'canvas-confetti';
import {
  QrCode,
  CreditCard,
  Wallet,
  Clock,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  AlertCircle,
  X,
  Zap,
  ArrowRight,
  Building2,
  ExternalLink
} from 'lucide-react';

interface PaymentGatewayModalProps {
  customer: Customer;
  pkg: WifiPackage;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (transaction: PaymentTransaction) => void;
}

export const PaymentGatewayModal: React.FC<PaymentGatewayModalProps> = ({
  customer,
  pkg,
  isOpen,
  onClose,
  onPaymentSuccess
}) => {
  const { processPayment, bankAccounts, companyProfile, tripayConfig } = useISP();
  const [selectedMethod, setSelectedMethod] = useState<PaymentTransaction['paymentMethod']>('TRIPAY');
  const [tripaySubChannel, setTripaySubChannel] = useState('QRIS');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [copiedBank, setCopiedBank] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes timer

  useEffect(() => {
    if (!isOpen) {
      setTimeLeft(900);
      setIsProcessing(false);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const amount = customer.currentBill.amount || pkg.price;

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(num);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const vaNumber =
    selectedMethod === 'BCA_VA'
      ? `88290${customer.phone.replace(/[^0-9]/g, '').slice(-8)}`
      : selectedMethod === 'BRI_VA'
      ? `10240${customer.phone.replace(/[^0-9]/g, '').slice(-8)}`
      : `89120${customer.phone.replace(/[^0-9]/g, '').slice(-8)}`;

  const handleCopyVA = () => {
    navigator.clipboard.writeText(vaNumber);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleCopyBankAccount = (accNo: string) => {
    navigator.clipboard.writeText(accNo.replace(/[^0-9]/g, ''));
    setCopiedBank(accNo);
    setTimeout(() => setCopiedBank(null), 2000);
  };

  const handleSimulatePayment = async () => {
    setIsProcessing(true);
    try {
      // Simulate real-time gateway webhook latency
      await new Promise(r => setTimeout(r, 1100));

      const tx = await processPayment(customer.id, selectedMethod);

      // Trigger Confetti Celebration
      confetti({
        particleCount: 85,
        spread: 75,
        origin: { y: 0.6 }
      });

      onPaymentSuccess(tx);
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan memproses pembayaran');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                PAYMENT GATEWAY 24/7
              </span>
              <span className="text-xs text-slate-400">Tripay &amp; QRIS Real-Time</span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1">Pembayaran Tagihan WiFi</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Invoice Summary Strip */}
        <div className="px-6 py-3.5 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-xs">
          <div>
            <p className="text-slate-400">Total Tagihan ({pkg.name} {pkg.speedMbps}M)</p>
            <p className="text-xl font-extrabold text-cyan-400 font-mono mt-0.5">
              {formatRupiah(amount)}
            </p>
          </div>
          <div className="text-right">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono text-xs">
              <Clock className="w-3.5 h-3.5" />
              Sisa Waktu: {timeFormatted}
            </div>
            <p className="text-[11px] text-slate-400 mt-1 font-mono">
              Inv: {customer.currentBill.invoiceNo}
            </p>
          </div>
        </div>

        {/* Method Selector Tabs */}
        <div className="p-6">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
            Pilih Jalur Pembayaran:
          </label>
          <div className="grid grid-cols-4 gap-2 mb-6">
            {/* Tripay */}
            <button
              type="button"
              onClick={() => setSelectedMethod('TRIPAY')}
              className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                selectedMethod === 'TRIPAY'
                  ? 'border-cyan-500 bg-cyan-950/40 text-cyan-200 shadow-lg shadow-cyan-950/50'
                  : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span className="text-[9px] font-black px-1.5 py-0.2 bg-cyan-500/20 text-cyan-300 rounded">Auto</span>
              </div>
              <p className="font-bold text-[11px] text-white">Tripay</p>
              <p className="text-[9px] text-slate-400">Multi-Channel</p>
            </button>

            {/* QRIS */}
            <button
              type="button"
              onClick={() => setSelectedMethod('QRIS')}
              className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                selectedMethod === 'QRIS'
                  ? 'border-cyan-500 bg-cyan-950/40 text-cyan-200 shadow-lg shadow-cyan-950/50'
                  : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <QrCode className="w-4 h-4 text-emerald-400" />
                <span className="text-[9px] font-black px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded">Instant</span>
              </div>
              <p className="font-bold text-[11px] text-white">QRIS</p>
              <p className="text-[9px] text-slate-400">Semua e-Wallet</p>
            </button>

            {/* Virtual Account */}
            <button
              type="button"
              onClick={() => setSelectedMethod('BCA_VA')}
              className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                selectedMethod === 'BCA_VA' || selectedMethod === 'BRI_VA' || selectedMethod === 'MANDIRI_VA'
                  ? 'border-cyan-500 bg-cyan-950/40 text-cyan-200 shadow-lg shadow-cyan-950/50'
                  : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <CreditCard className="w-4 h-4 text-indigo-400" />
                <span className="text-[9px] font-black px-1.5 py-0.2 bg-indigo-500/20 text-indigo-300 rounded">Auto VA</span>
              </div>
              <p className="font-bold text-[11px] text-white">Virtual Account</p>
              <p className="text-[9px] text-slate-400">BCA, BRI, Mandiri</p>
            </button>

            {/* Bank Transfer Manual */}
            <button
              type="button"
              onClick={() => setSelectedMethod('BANK_TRANSFER')}
              className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                selectedMethod === 'BANK_TRANSFER'
                  ? 'border-cyan-500 bg-cyan-950/40 text-cyan-200 shadow-lg shadow-cyan-950/50'
                  : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <Building2 className="w-4 h-4 text-amber-400" />
                <span className="text-[9px] font-black px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded">Direct</span>
              </div>
              <p className="font-bold text-[11px] text-white">Transfer Bank</p>
              <p className="text-[9px] text-slate-400">Rek. Perusahaan</p>
            </button>
          </div>

          {/* TRIPAY GATEWAY VIEW */}
          {selectedMethod === 'TRIPAY' && (
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  Tripay Payment Engine ({tripayConfig.mode})
                </span>
                <span className="text-[10px] font-mono text-cyan-300">
                  Merchant: {tripayConfig.merchantCode}
                </span>
              </div>

              {/* Sub-channel pill selector */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'QRIS', label: 'Tripay QRIS' },
                  { id: 'BCAVA', label: 'Tripay BCA VA' },
                  { id: 'MANDIRIVA', label: 'Tripay Mandiri VA' }
                ].map(sc => (
                  <button
                    key={sc.id}
                    type="button"
                    onClick={() => setTripaySubChannel(sc.id)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition cursor-pointer text-center ${
                      tripaySubChannel === sc.id
                        ? 'bg-cyan-600 border-cyan-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {sc.label}
                  </button>
                ))}
              </div>

              {tripaySubChannel === 'QRIS' ? (
                <div className="flex flex-col items-center p-3 bg-white rounded-2xl shadow-lg my-1">
                  <svg className="w-40 h-40 text-slate-950" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm7-9h2v2h-2V7zm2 2h2v2h-2V9zm-2 2h2v2h-2v-2zm4-4h2v2h-2V7zm2 2h2v2h-2V9zm-2 2h2v2h-2v-2zm-6 3h2v2h-2v-2zm2 2h2v2h-2v-2zm2-2h2v2h-2v-2zm2 2h2v2h-2v-2zm2-2h2v2h-2v-2zm0 4h2v2h-2v-2zm-6 2h2v2h-2v-2zm2-2h2v2h-2v-2zm2 2h2v2h-2v-2zM5 5h2v2H5V5zm12 0h2v2h-2V5zM5 17h2v2H5v-2z" />
                  </svg>
                  <p className="text-[10px] text-slate-600 font-mono mt-1">
                    Powered by Tripay Gateway API • Kode Ref: TP-{tripayConfig.merchantCode}-9912
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <p className="text-xs text-slate-400">No. Virtual Account Tripay ({tripaySubChannel}):</p>
                  <p className="font-mono text-lg font-bold text-white tracking-wider mt-1">
                    88790{customer.phone.replace(/[^0-9]/g, '').slice(-8)}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* QRIS STANDAR VIEW */}
          {selectedMethod === 'QRIS' && (
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-center flex flex-col items-center">
              <span className="text-xs font-bold text-slate-300 tracking-wider mb-2">
                QRIS STANDAR PEMBAYARAN NASIONAL
              </span>

              <div className="p-4 bg-white rounded-2xl shadow-xl border border-slate-300 my-2">
                <svg className="w-44 h-44 text-slate-950" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm7-9h2v2h-2V7zm2 2h2v2h-2V9zm-2 2h2v2h-2v-2zm4-4h2v2h-2V7zm2 2h2v2h-2V9zm-2 2h2v2h-2v-2zm-6 3h2v2h-2v-2zm2 2h2v2h-2v-2zm2-2h2v2h-2v-2zm2 2h2v2h-2v-2zm2-2h2v2h-2v-2zm0 4h2v2h-2v-2zm-6 2h2v2h-2v-2zm2-2h2v2h-2v-2zm2 2h2v2h-2v-2zM5 5h2v2H5V5zm12 0h2v2h-2V5zM5 17h2v2H5v-2z" />
                </svg>
                <div className="text-[10px] text-slate-500 font-mono font-medium mt-1">
                  NMID: ID2026119827391 | {companyProfile.brandName}
                </div>
              </div>

              <p className="text-xs text-slate-400 mt-2 max-w-sm">
                Scan kode QR ini menggunakan m-Banking BCA, Mandiri, BRI, BNI atau GoPay, OVO, ShopeePay.
              </p>
            </div>
          )}

          {/* VIRTUAL ACCOUNT VIEW */}
          {(selectedMethod === 'BCA_VA' || selectedMethod === 'BRI_VA' || selectedMethod === 'MANDIRI_VA') && (
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="flex gap-2 mb-4">
                {(['BCA_VA', 'BRI_VA', 'MANDIRI_VA'] as const).map(bank => (
                  <button
                    key={bank}
                    type="button"
                    onClick={() => setSelectedMethod(bank)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                      selectedMethod === bank
                        ? 'bg-indigo-600 border-indigo-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {bank.replace('_VA', '')}
                  </button>
                ))}
              </div>

              <p className="text-xs text-slate-400">Nomor Virtual Account:</p>
              <div className="flex items-center justify-between p-3.5 bg-slate-900 border border-slate-800 rounded-xl mt-1.5">
                <span className="font-mono text-lg font-bold text-white tracking-wider">
                  {vaNumber}
                </span>
                <button
                  type="button"
                  onClick={handleCopyVA}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition cursor-pointer"
                >
                  {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedText ? 'Tersalin' : 'Salin VA'}</span>
                </button>
              </div>
            </div>
          )}

          {/* DIRECT BANK TRANSFER (REKENING PERUSAHAAN) VIEW */}
          {selectedMethod === 'BANK_TRANSFER' && (
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <p className="text-xs font-bold text-white uppercase tracking-wider">
                Rekening Bank Resmi {companyProfile.companyName}:
              </p>

              <div className="space-y-2.5">
                {bankAccounts.map(b => (
                  <div
                    key={b.id}
                    className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-white">{b.bankName}</p>
                      <p className="font-mono text-sm font-bold text-cyan-400 mt-0.5">{b.accountNumber}</p>
                      <p className="text-[10px] text-slate-400">A/N: {b.accountHolder}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyBankAccount(b.accountNumber)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition cursor-pointer flex items-center gap-1"
                    >
                      {copiedBank === b.accountNumber ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Salin No. Rek</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Simulation Button */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleSimulatePayment}
              disabled={isProcessing}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-cyan-950/50 transition transform active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Memverifikasi Gateway &amp; Unisolir MikroTik...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-slate-950" />
                  <span>Simulasikan Pembayaran Berhasil ({selectedMethod})</span>
                  <ArrowRight className="w-4 h-4 text-slate-950" />
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-5 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition cursor-pointer"
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
