import React, { useState, useRef } from 'react';
import { useISP } from '../context/ISPContext';
import { BankAccount, CompanyProfile } from '../types';
import {
  Building2,
  Upload,
  Image as ImageIcon,
  CreditCard,
  FileText,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  AlertCircle,
  Check,
  Globe,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Star,
  RefreshCw,
  Eye
} from 'lucide-react';

export const SettingsManager: React.FC = () => {
  const {
    companyProfile,
    updateCompanyProfile,
    uploadLogo,
    bankAccounts,
    addBankAccount,
    updateBankAccount,
    deleteBankAccount,
    setPrimaryBankAccount
  } = useISP();

  const [activeSubTab, setActiveSubTab] = useState<'COMPANY' | 'LOGO' | 'BANKS' | 'TERMS'>('COMPANY');

  // Company Profile form
  const [profileForm, setProfileForm] = useState<CompanyProfile>(companyProfile);
  const [profileSavedMsg, setProfileSavedMsg] = useState<string | null>(null);

  // Logo upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoFeedback, setLogoFeedback] = useState<string | null>(null);

  // Bank Account Modal state
  const [showBankModal, setShowBankModal] = useState(false);
  const [editingBankId, setEditingBankId] = useState<string | null>(null);
  const [bankForm, setBankForm] = useState({
    bankName: 'Bank Central Asia (BCA)',
    bankCode: '014',
    accountNumber: '',
    accountHolder: companyProfile.companyName,
    branch: '',
    isPrimary: false,
    isActive: true
  });

  // Terms and conditions editor state
  const [termsText, setTermsText] = useState(companyProfile.termsAndConditions);
  const [termsSavedMsg, setTermsSavedMsg] = useState<string | null>(null);
  const [isTermsPreview, setIsTermsPreview] = useState(false);

  // Handle Logo Upload File
  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('File harus berupa gambar (PNG, JPG, WebP, SVG)');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran file maksimal 2 MB!');
      return;
    }

    const reader = new FileReader();
    reader.onload = event => {
      const result = event.target?.result as string;
      uploadLogo(result);
      setLogoFeedback('Logo perusahaan berhasil diperbarui dan diterapkan ke seluruh sistem!');
      setTimeout(() => setLogoFeedback(null), 3500);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    if (window.confirm('Hapus logo kustom dan gunakan logo standar NetBilling Pro?')) {
      uploadLogo(null);
      setLogoFeedback('Logo kustom dihapus. Menggunakan logo standar bawaan sistem.');
      setTimeout(() => setLogoFeedback(null), 3000);
    }
  };

  // Handle Save Company Profile
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompanyProfile(profileForm);
    setProfileSavedMsg('Informasi profil perusahaan berhasil disimpan!');
    setTimeout(() => setProfileSavedMsg(null), 3000);
  };

  // Handle Save Bank Account
  const handleSaveBank = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankForm.accountNumber || !bankForm.accountHolder) {
      alert('Nomor Rekening dan Atas Nama wajib diisi!');
      return;
    }

    if (editingBankId) {
      updateBankAccount(editingBankId, bankForm);
    } else {
      addBankAccount({
        ...bankForm,
        isPrimary: bankAccounts.length === 0 ? true : bankForm.isPrimary
      });
    }

    setShowBankModal(false);
    setEditingBankId(null);
    setBankForm({
      bankName: 'Bank Central Asia (BCA)',
      bankCode: '014',
      accountNumber: '',
      accountHolder: companyProfile.companyName,
      branch: '',
      isPrimary: false,
      isActive: true
    });
  };

  // Open Edit Bank
  const handleOpenEditBank = (bank: BankAccount) => {
    setEditingBankId(bank.id);
    setBankForm({
      bankName: bank.bankName,
      bankCode: bank.bankCode || '014',
      accountNumber: bank.accountNumber,
      accountHolder: bank.accountHolder,
      branch: bank.branch,
      isPrimary: bank.isPrimary,
      isActive: bank.isActive
    });
    setShowBankModal(true);
  };

  // Handle Save Terms & Conditions
  const handleSaveTerms = () => {
    updateCompanyProfile({ termsAndConditions: termsText });
    setTermsSavedMsg('Syarat dan Ketentuan layanan berhasil diperbarui!');
    setTimeout(() => setTermsSavedMsg(null), 3000);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Settings Sub-navigation Bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-4">
        {[
          { key: 'COMPANY', label: 'Tentang Perusahaan', icon: Building2 },
          { key: 'LOGO', label: 'Upload Logo ISP', icon: ImageIcon },
          { key: 'BANKS', label: `Rekening Bank (${bankAccounts.length})`, icon: CreditCard },
          { key: 'TERMS', label: 'Syarat & Ketentuan', icon: FileText }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveSubTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                isActive
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-950/50'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SUBTAB 1: TENTANG PERUSAHAAN */}
      {activeSubTab === 'COMPANY' && (
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 md:p-8 shadow-xl">
          <div className="border-b border-slate-800 pb-5 mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-cyan-400" />
              Profil & Legalitas Perusahaan ISP
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Informasi ini akan tertera pada faktur resmi, header portal pelanggan, kwitansi pembayaran, serta pesan notifikasi otomatis.
            </p>
          </div>

          {profileSavedMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/40 text-xs text-emerald-300 flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{profileSavedMsg}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-5 max-w-4xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Nama Brand / Merek Layanan:
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.brandName}
                  onChange={e => setProfileForm({ ...profileForm, brandName: e.target.value })}
                  placeholder="Contoh: NetBilling Pro"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Bentuk Badan Usaha:
                </label>
                <select
                  value={profileForm.legalEntity}
                  onChange={e => setProfileForm({ ...profileForm, legalEntity: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="Perseroan Terbatas (PT)">Perseroan Terbatas (PT)</option>
                  <option value="Commanditaire Vennootschap (CV)">Commanditaire Vennootschap (CV)</option>
                  <option value="Koperasi Jasa Telekomunikasi">Koperasi Jasa Telekomunikasi</option>
                  <option value="Badan Usaha Milik Desa (BUMDes)">Badan Usaha Milik Desa (BUMDes)</option>
                  <option value="Perorangan / RT RW Net Legal">Perorangan / Kemitraan ISP</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Nama Lengkap Perusahaan (Badan Hukum):
              </label>
              <input
                type="text"
                required
                value={profileForm.companyName}
                onChange={e => setProfileForm({ ...profileForm, companyName: e.target.value })}
                placeholder="PT. Nusantara Telekomunikasi Digital"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Deskripsi Singkat Usaha:
              </label>
              <textarea
                rows={2}
                value={profileForm.description}
                onChange={e => setProfileForm({ ...profileForm, description: e.target.value })}
                placeholder="Penyelenggara jasa internet fiber optik cepat dan terpercaya..."
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Alamat Kantor Pusat / Operasional:
              </label>
              <input
                type="text"
                required
                value={profileForm.address}
                onChange={e => setProfileForm({ ...profileForm, address: e.target.value })}
                placeholder="Jl. Garuda No. 45, Kemayoran, Jakarta Pusat..."
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Nomor Telepon / Helpdesk:
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.phone}
                  onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                  placeholder="0812-3456-7890 / (021) 8899-2345"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Email Resmi Billing:
                </label>
                <input
                  type="email"
                  required
                  value={profileForm.email}
                  onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                  placeholder="billing@netbilling.co.id"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Website:
                </label>
                <input
                  type="url"
                  value={profileForm.website}
                  onChange={e => setProfileForm({ ...profileForm, website: e.target.value })}
                  placeholder="https://netbilling.co.id"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                No. Izin Kominfo / NIB (Legalitas ISP):
              </label>
              <input
                type="text"
                value={profileForm.licenseNo}
                onChange={e => setProfileForm({ ...profileForm, licenseNo: e.target.value })}
                placeholder="NIB: 912000847192 / KOMINFO-ISP-2024"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div className="pt-4 flex items-center justify-end">
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg transition cursor-pointer"
              >
                Simpan Perubahan Profil
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SUBTAB 2: UPLOAD LOGO */}
      {activeSubTab === 'LOGO' && (
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 md:p-8 shadow-xl">
          <div className="border-b border-slate-800 pb-5 mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-cyan-400" />
              Upload & Kustomisasi Logo Perusahaan
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Gunakan logo resmi ISP Anda untuk dipasang di navigasi atas, faktur tagihan, kwitansi cetak, dan portal pelanggan.
            </p>
          </div>

          {logoFeedback && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/40 text-xs text-emerald-300 flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{logoFeedback}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Upload Area */}
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-cyan-500 rounded-3xl p-8 text-center bg-slate-950/50 hover:bg-slate-950 transition cursor-pointer flex flex-col items-center justify-center min-h-[220px]"
              >
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-white">Klik untuk Pilih File Gambar Logo</p>
                <p className="text-xs text-slate-400 mt-1">
                  Format didukung: PNG, JPG, WebP, SVG (Maks. 2 MB)
                </p>
                <span className="mt-4 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold rounded-lg">
                  Pilih Gambar dari Komputer
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={handleLogoFileChange}
                  className="hidden"
                />
              </div>

              {companyProfile.logoUrl && (
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-rose-950/50 text-slate-300 hover:text-rose-400 border border-slate-700 text-xs font-semibold transition cursor-pointer"
                >
                  Hapus Logo Kustom & Reset ke Default
                </button>
              )}
            </div>

            {/* Live Preview Card */}
            <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Pratinjau Tampilan Logo:
              </p>

              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center min-h-[160px]">
                {companyProfile.logoUrl ? (
                  <div className="text-center">
                    <img
                      src={companyProfile.logoUrl}
                      alt="Logo ISP"
                      className="max-h-24 max-w-[260px] object-contain mx-auto"
                    />
                    <span className="inline-block mt-3 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                      ✓ Logo Kustom Aktif
                    </span>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-600 via-teal-500 to-blue-600 flex items-center justify-center text-slate-950 font-black text-2xl mx-auto shadow-lg">
                      NB
                    </div>
                    <p className="text-xs font-bold text-white mt-3">{companyProfile.brandName}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]">
                      Logo Standar Bawaan
                    </span>
                  </div>
                )}
              </div>

              <div className="text-xs text-slate-400 space-y-1">
                <p>• Logo ini otomatis muncul pada kwitansi yang dicetak oleh pelanggan.</p>
                <p>• Disarankan menggunakan gambar dengan latar belakang transparan (PNG).</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: MENAMBAHKAN & MENGELOLA REKENING BANK */}
      {activeSubTab === 'BANKS' && (
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 md:p-8 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-cyan-400" />
                Rekening Bank untuk Pembayaran Manual
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Daftar rekening bank resmi perusahaan yang tampil pada portal pembayaran pelanggan dan bukti transfer kwitansi.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingBankId(null);
                setBankForm({
                  bankName: 'Bank Central Asia (BCA)',
                  bankCode: '014',
                  accountNumber: '',
                  accountHolder: companyProfile.companyName,
                  branch: '',
                  isPrimary: false,
                  isActive: true
                });
                setShowBankModal(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg transition cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Rekening Baru</span>
            </button>
          </div>

          {/* Bank Accounts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {bankAccounts.map(bank => (
              <div
                key={bank.id}
                className={`p-5 rounded-2xl border transition flex flex-col justify-between ${
                  bank.isPrimary
                    ? 'bg-gradient-to-b from-cyan-950/40 to-slate-950 border-cyan-500 ring-2 ring-cyan-500/20'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white">{bank.bankName}</span>
                    {bank.isPrimary && (
                      <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        <Star className="w-3 h-3 fill-cyan-400 text-cyan-400" />
                        Rekening Utama
                      </span>
                    )}
                  </div>

                  <p className="font-mono text-lg font-black text-cyan-400 mt-3 tracking-wider">
                    {bank.accountNumber}
                  </p>

                  <div className="mt-2 text-xs space-y-0.5">
                    <p className="text-slate-300 font-medium">A/N: {bank.accountHolder}</p>
                    <p className="text-[11px] text-slate-500">Cabang: {bank.branch || '-'}</p>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                  {!bank.isPrimary ? (
                    <button
                      type="button"
                      onClick={() => setPrimaryBankAccount(bank.id)}
                      className="text-[11px] text-cyan-400 hover:underline font-semibold cursor-pointer"
                    >
                      Jadikan Utama
                    </button>
                  ) : (
                    <span className="text-[11px] text-emerald-400 font-semibold">Aktif di Struk</span>
                  )}

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEditBank(bank)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                      title="Edit Rekening"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Hapus rekening ${bank.bankName} - ${bank.accountNumber}?`)) {
                          deleteBankAccount(bank.id);
                        }
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                      title="Hapus Rekening"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 4: SYARAT DAN KETENTUAN */}
      {activeSubTab === 'TERMS' && (
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 md:p-8 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-400" />
                Syarat dan Ketentuan Layanan (Terms & SLA)
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Aturan hak & kewajiban pelanggan, kebijakan isolir otomatis, jatuh tempo, serta SLA ketersediaan jaringan.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsTermsPreview(!isTermsPreview)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{isTermsPreview ? 'Mode Edit Teks' : 'Pratinjau Tampilan'}</span>
              </button>

              <button
                type="button"
                onClick={handleSaveTerms}
                className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg transition cursor-pointer"
              >
                Simpan Ketentuan
              </button>
            </div>
          </div>

          {termsSavedMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/40 text-xs text-emerald-300 flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{termsSavedMsg}</span>
            </div>
          )}

          {isTermsPreview ? (
            <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-200 font-mono leading-relaxed whitespace-pre-line max-h-[500px] overflow-y-auto">
              {termsText}
            </div>
          ) : (
            <div>
              <textarea
                rows={16}
                value={termsText}
                onChange={e => setTermsText(e.target.value)}
                className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white font-mono leading-relaxed focus:outline-none focus:border-cyan-500"
              />
              <p className="text-[11px] text-slate-500 mt-2">
                Teks ini dapat dilihat langsung oleh pelanggan pada halaman login portal dan rincian transaksi.
              </p>
            </div>
          )}
        </div>
      )}

      {/* MODAL: Tambah / Edit Rekening Bank */}
      {showBankModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-cyan-400" />
              {editingBankId ? 'Edit Rekening Bank' : 'Tambah Rekening Bank Baru'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Rekening ini akan menjadi opsi tujuan transfer resmi bagi pelanggan.
            </p>

            <form onSubmit={handleSaveBank} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nama Bank:
                </label>
                <select
                  value={bankForm.bankName}
                  onChange={e => setBankForm({ ...bankForm, bankName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="Bank Central Asia (BCA)">Bank Central Asia (BCA)</option>
                  <option value="Bank Mandiri">Bank Mandiri</option>
                  <option value="Bank Rakyat Indonesia (BRI)">Bank Rakyat Indonesia (BRI)</option>
                  <option value="Bank Negara Indonesia (BNI)">Bank Negara Indonesia (BNI)</option>
                  <option value="Bank Syariah Indonesia (BSI)">Bank Syariah Indonesia (BSI)</option>
                  <option value="Bank Jago">Bank Jago</option>
                  <option value="Bank Permata">Bank Permata</option>
                  <option value="Bank CIMB Niaga">Bank CIMB Niaga</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nomor Rekening:
                </label>
                <input
                  type="text"
                  required
                  value={bankForm.accountNumber}
                  onChange={e => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                  placeholder="Contoh: 8829-1029-4411"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Atas Nama (A/N):
                </label>
                <input
                  type="text"
                  required
                  value={bankForm.accountHolder}
                  onChange={e => setBankForm({ ...bankForm, accountHolder: e.target.value })}
                  placeholder="PT. Nusantara Telekomunikasi Digital"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Kantor Cabang:
                </label>
                <input
                  type="text"
                  value={bankForm.branch}
                  onChange={e => setBankForm({ ...bankForm, branch: e.target.value })}
                  placeholder="KCU Kemayoran, Jakarta Pusat"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="primaryBank"
                  checked={bankForm.isPrimary}
                  onChange={e => setBankForm({ ...bankForm, isPrimary: e.target.checked })}
                  className="w-4 h-4 rounded text-cyan-600 focus:ring-0 bg-slate-950 border-slate-800 cursor-pointer"
                />
                <label htmlFor="primaryBank" className="text-xs text-slate-300 cursor-pointer">
                  Jadikan sebagai rekening utama (default)
                </label>
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition cursor-pointer"
                >
                  {editingBankId ? 'Perbarui Rekening' : 'Tambahkan Rekening'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowBankModal(false)}
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
