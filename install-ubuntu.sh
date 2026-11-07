#!/usr/bin/env bash
# ==============================================================================
# Script Instalasi Otomatis NetBilling Pro di Ubuntu Server (20.04 / 22.04 / 24.04)
# Sistem Pembayaran WiFi & Manajemen ISP Terpadu
# ==============================================================================

set -e

# Warna output terminal
RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo -e "${CYAN}${BOLD}"
echo "=================================================================="
echo "    🚀 INSTALASI NETBILLING PRO - UBUNTU SERVER LINUX             "
echo "    Sistem Pembayaran WiFi & Billing ISP Otomatis                "
echo "=================================================================="
echo -e "${NC}"

# Cek apakah dijalankan sebagai root / sudo
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}[ERROR] Harap jalankan script ini dengan akses root atau gunakan: sudo bash install-ubuntu.sh${NC}"
  exit 1
fi

APP_DIR=$(pwd)
APP_USER=$(logname 2>/dev/null || echo "root")
APP_PORT=3000

echo -e "${YELLOW}[1/6] Memperbarui paket sistem Ubuntu...${NC}"
apt-get update -y
apt-get install -y curl wget git build-essential ufw nginx

echo -e "${YELLOW}[2/6] Memeriksa & Menginstal Node.js 20 LTS...${NC}"
if ! command -v node > /dev/null 2>&1 || [ "$(node -v | cut -d'.' -f1 | tr -d 'v')" -lt 18 ]; then
  echo "Mengunduh repositori NodeSource Node.js 20.x..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi

NODE_VER=$(node -v)
NPM_VER=$(npm -v)
echo -e "${GREEN}✓ Node.js terinstal: ${NODE_VER} | npm: ${NPM_VER}${NC}"

echo -e "${YELLOW}[3/6] Menginstal dependensi aplikasi via npm...${NC}"
cd "$APP_DIR"
npm install --legacy-peer-deps

echo -e "${YELLOW}[4/6] Melakukan kompilasi build produksi (npm run build)...${NC}"
npm run build

echo -e "${YELLOW}[5/6] Mengonfigurasi Layanan Systemd (netbilling.service)...${NC}"
SERVICE_FILE="/etc/systemd/system/netbilling.service"

cat <<EOF > "$SERVICE_FILE"
[Unit]
Description=NetBilling Pro ISP Management System
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=${APP_DIR}
ExecStart=$(which npm) start
Restart=always
RestartSec=5
Environment=NODE_ENV=production
Environment=PORT=${APP_PORT}

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable netbilling
systemctl restart netbilling

echo -e "${YELLOW}[6/6] Mengonfigurasi Firewall (UFW) & Nginx Reverse Proxy...${NC}"
# Buka port firewall jika ufw aktif
if ufw status | grep -q "Status: active"; then
  ufw allow 80/tcp
  ufw allow 443/tcp
  ufw allow ${APP_PORT}/tcp
  echo -e "${GREEN}✓ Firewall port 80, 443, dan ${APP_PORT} diizinkan.${NC}"
fi

# Konfigurasi Nginx Reverse Proxy
NGINX_CONF="/etc/nginx/sites-available/netbilling"
cat <<EOF > "$NGINX_CONF"
server {
    listen 80;
    server_name _;

    client_max_body_size 20M;

    location / {
        proxy_pass http://127.0.0.1:${APP_PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Aktifkan konfigurasi Nginx jika belum ada
if [ ! -f /etc/nginx/sites-enabled/netbilling ]; then
  ln -s "$NGINX_CONF" /etc/nginx/sites-enabled/
  # Hapus default jika ada
  rm -f /etc/nginx/sites-enabled/default
fi

nginx -t && systemctl restart nginx || echo -e "${YELLOW}[INFO] Nginx dilewati atau port 80 digunakan layanan lain.${NC}"

SERVER_IP=$(hostname -I | awk '{print $1}')

echo ""
echo -e "${GREEN}${BOLD}=================================================================="
echo "    🎉 INSTALASI NETBILLING PRO BERHASIL SELESAI!"
echo "==================================================================${NC}"
echo ""
echo -e "Aplikasi siap diakses melalui browser pada URL:"
echo -e "  🌐 Akses Langsung Port:  ${CYAN}${BOLD}http://${SERVER_IP}:${APP_PORT}${NC}"
echo -e "  🌐 Akses via Nginx:      ${CYAN}${BOLD}http://${SERVER_IP}${NC}"
echo ""
echo -e "${BOLD}Perintah Pengelolaan Layanan (Systemd):${NC}"
echo -e "  • Cek Status:     ${YELLOW}sudo systemctl status netbilling${NC}"
echo -e "  • Restart Server: ${YELLOW}sudo systemctl restart netbilling${NC}"
echo -e "  • Stop Server:    ${YELLOW}sudo systemctl stop netbilling${NC}"
echo -e "  • Lihat Log Real: ${YELLOW}sudo journalctl -u netbilling -f${NC}"
echo ""
echo -e "${CYAN}Default Login Admin:${NC} username: ${BOLD}admin${NC} | password: ${BOLD}admin123${NC}"
echo -e "${GREEN}==================================================================${NC}"
