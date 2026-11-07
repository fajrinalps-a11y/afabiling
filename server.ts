import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// API Health Check Endpoint (useful for Ubuntu systemd / Docker / Uptime Kuma)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'NetBilling Pro ISP Management System',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Serve static assets from built Vite client
const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));

// SPA Fallback for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.resolve(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`====================================================`);
  console.log(` NetBilling Pro ISP Management Server`);
  console.log(` Running on: http://0.0.0.0:${PORT}`);
  console.log(` Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`====================================================`);
});
