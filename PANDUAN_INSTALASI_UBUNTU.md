# 📖 Panduan Lengkap Instalasi NetBilling Pro di Ubuntu Server
**Sistem Billing WiFi & ISP Management Terpadu**
*(Dukungan: Ubuntu 20.04 LTS, Ubuntu 22.04 LTS, Ubuntu 24.04 LTS)*

---

## 📋 Fitur Utama Aplikasi
1. **Portal Mandiri Pelanggan**: Cek tagihan bulanan, bayar online real-time, unduh/cetak kwitansi digital (QR code validasi), ganti nama WiFi (SSID) & password, ubah paket (7 Mbps, 15 Mbps, 30 Mbps), cek kuota/FUP, speedtest langsung, & reboot ONT.
2. **Dashboard Pemilik ISP**: Statistik pendapatan bulanan, MRR, ARPU, rasio penagihan, tabel isolir otomatis, dan manajemen pelanggan lengkap.
3. **Pusat Integrasi**:
   - **Tripay Payment Gateway**: Pembayaran QRIS real-time, Virtual Account bank, dan e-wallet dengan auto un-isolir.
   - **WhatsApp Gateway**: Pengingat tagihan bulanan otomatis & siaran notifikasi gangguan massal.
   - **MikroTik RouterOS**: Integrasi API PPPoE, Simple Queues, dan isolir otomatis ke address-list `ISOLIR_USER_BLOCKED`.
   - **GenieACS (TR-069)**: Manajemen ONT jarak jauh, pantau daya optik Rx dBm, sinkronisasi parameter, dan reboot ONT.
   - **Telegram Bot**: Notifikasi pembayaran diterima ke channel/grup teknisi.
   - **Email SMTP**: Konfirmasi pembayaran dan kwitansi elektronik.
4. **GIS Mapping**: Pemetaan ODC (144 core), ODP, dan drop line pelanggan dengan pelacakan lokasi teknisi GPS real-time.
5. **Pengaturan Perusahaan**: Upload logo perusahaan (Base64/PNG), edit profil perusahaan (tanpa NPWP), kelola rekening bank, dan syarat ketentuan (S&K).

---

## 🚀 Metode 1: Instalasi Otomatis (Direkomendasikan)

Script instalasi otomatis telah disertakan di dalam paket aplikasi (`install-ubuntu.sh`). Script ini akan secara otomatis:
- Melakukan update repository Ubuntu
- Menginstal Node.js 20 LTS & npm
- Menginstal Nginx dan build tool pendukung
- Menginstal dependensi & mengompilasi aplikasi (`npm run build`)
- Mendaftarkan Systemd Service agar aplikasi auto-start saat server reboot
- Mengonfigurasi Nginx Reverse Proxy di port 80
- Membuka port firewall UFW (80, 443, 3000, 22)

### Langkah Eksekusi:
```bash
# 1. Masuk ke direktori aplikasi di Ubuntu
cd /var/www/netbilling

# 2. Berikan izin eksekusi pada script instalasi
chmod +x install-ubuntu.sh

# 3. Jalankan script instalasi dengan hak akses root / sudo
sudo ./install-ubuntu.sh
```

Setelah selesai, aplikasi dapat langsung diakses melalui browser di alamat:
`http://IP_SERVER_ANDA` atau `http://billing.yourisp.id`

---

## 🛠️ Metode 2: Instalasi Manual Step-by-Step

Jika Anda ingin menginstal dan mengonfigurasi secara manual di Ubuntu Server:

### 1. Update Server & Install Node.js 20 LTS
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git ufw nginx

# Install Node.js 20 LTS via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g tsx
```

### 2. Pasang Aplikasi ke `/var/www/netbilling`
```bash
sudo mkdir -p /var/www/netbilling
# Salin semua file project ke dalam /var/www/netbilling
sudo chown -R $USER:$USER /var/www/netbilling
cd /var/www/netbilling

# Install dependensi dan build aplikasi
npm install
npm run build
```

### 3. Pasang Systemd Service (Auto-Start)
Salin file service yang sudah disediakan:
```bash
sudo cp netbilling.service /etc/systemd/system/netbilling.service

# Reload daemon dan aktifkan service
sudo systemctl daemon-reload
sudo systemctl enable netbilling
sudo systemctl start netbilling

# Cek status aplikasi
sudo systemctl status netbilling
```

### 4. Konfigurasi Nginx Reverse Proxy
```bash
sudo cp nginx-netbilling.conf /etc/nginx/sites-available/netbilling
sudo ln -sf /etc/nginx/sites-available/netbilling /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Uji konfigurasi nginx dan restart
sudo nginx -t
sudo systemctl restart nginx
```

### 5. Atur Firewall UFW
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp
sudo ufw --force enable
```

---

## 🐳 Metode 3: Instalasi dengan Docker & Docker Compose

Jika Anda menggunakan lingkungan Docker di Ubuntu:

```bash
cd /var/www/netbilling

# Jalankan container di background
docker compose up -d --build

# Periksa status kontainer
docker compose ps
docker compose logs -f
```

---

## 🔒 Konfigurasi SSL Gratis (HTTPS dengan Let's Encrypt)
Untuk mengaktifkan gembok hijau HTTPS pada domain Anda (misal: `billing.ispanda.net`):

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d billing.ispanda.net
```
Sertifikat akan terpasang otomatis dan diperpanjang otomatis setiap 90 hari.

---

## ⚙️ Perintah Manajemen Service di Ubuntu

| Perintah | Deskripsi |
| :--- | :--- |
| `sudo systemctl status netbilling` | Cek status aplikasi aktif / berhenti |
| `sudo systemctl restart netbilling` | Restart aplikasi setelah pembaruan |
| `sudo systemctl stop netbilling` | Menghentikan aplikasi |
| `sudo systemctl start netbilling` | Menyalakan kembali aplikasi |
| `journalctl -u netbilling -f` | Memantau log aplikasi secara real-time |

---

## 🔑 Informasi Akun Default untuk Login

- **Login Admin**:
  - URL: Masuk ke halaman login lalu pilih tab **Admin ISP**
  - Username: `admin`
  - Password: `admin123`
  - *(Tersedia juga tombol 1-Click Fast Login di halaman)*

- **Login Pelanggan**:
  - Nomor WhatsApp / ID: `081234567890` atau `CUST-001`
  - PIN Default: `123456`
  - *(Tersedia juga selector akun demo pelanggan siap pakai)*
