import path from 'path';
import fs from 'fs';
import os from 'os';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Read Heretto credentials (server-side only, never exposed to browser).
// Wrapped in an object so the proxy closure always reads the latest value
// after credential updates via the PUT endpoint.
const herettoState: { auth: string | null } = { auth: null };
try {
  const configPath = path.join(os.homedir(), 'heretto.json');
  const raw = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  if (raw.email && raw.token) {
    herettoState.auth = 'Basic ' + Buffer.from(`${raw.email}:${raw.token}`).toString('base64');
  }
} catch {
  console.warn('[DITA Architect] ~/heretto.json not found or invalid — Heretto proxy disabled');
}

const herettoConfigPath = path.join(os.homedir(), 'heretto.json');

const pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'package.json'), 'utf-8'));

export default defineConfig({
    define: {
      __APP_VERSION__: JSON.stringify(pkg.version),
    },
    server: {
      port: 3000,
      host: 'localhost',
      proxy: herettoState.auth
        ? {
            '/heretto-api': {
              target: 'https://geotab.heretto.com',
              changeOrigin: true,
              rewrite: (p) => p.replace(/^\/heretto-api/, '/rest'),
              configure: (proxy) => {
                proxy.on('proxyReq', (proxyReq) => {
                  if (herettoState.auth) {
                    proxyReq.setHeader('Authorization', herettoState.auth);
                  }
                });
              },
            },
          }
        : undefined,
    },
    plugins: [
      tailwindcss(),
      react(),
      {
        name: 'heretto-credentials-api',
        configureServer(server) {
          server.middlewares.use('/heretto-credentials', (req, res) => {
            if (req.method === 'GET') {
              try {
                const raw = JSON.parse(fs.readFileSync(herettoConfigPath, 'utf-8'));
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ email: raw.email || '', token: raw.token || '' }));
              } catch {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ email: '', token: '' }));
              }
            } else if (req.method === 'PUT') {
              let body = '';
              req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
              req.on('end', () => {
                try {
                  const { email, token } = JSON.parse(body);
                  fs.writeFileSync(herettoConfigPath, JSON.stringify({ email, token }, null, 2));
                  // Update the in-memory auth header (mutates object property
                  // so the proxy closure picks up the new value immediately)
                  if (email && token) {
                    herettoState.auth = 'Basic ' + Buffer.from(`${email}:${token}`).toString('base64');
                  }
                  res.writeHead(200, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ ok: true }));
                } catch {
                  res.writeHead(400, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ error: 'Invalid JSON' }));
                }
              });
            } else {
              res.writeHead(405);
              res.end();
            }
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
});
