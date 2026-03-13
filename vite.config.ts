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

// Module-level queue for pending external content loads
interface PendingLoad {
  xml: string;
  fileName: string;
  herettoTargetUuid?: string;
}
const pendingLoads: PendingLoad[] = [];

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
      {
        name: 'load-content-api',
        configureServer(server) {
          server.middlewares.use('/api/load-content', (req, res) => {
            if (req.method === 'POST') {
              let body = '';
              req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
              req.on('end', () => {
                try {
                  const { xml, fileName, herettoTargetUuid } = JSON.parse(body);
                  if (!xml || !fileName) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'xml and fileName are required' }));
                    return;
                  }
                  pendingLoads.push({ xml, fileName, herettoTargetUuid });
                  res.writeHead(200, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ status: 'loaded' }));
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

          server.middlewares.use('/api/pending-loads', (req, res) => {
            if (req.method === 'GET') {
              res.writeHead(200, { 'Content-Type': 'application/json' });
              const loads = [...pendingLoads];
              pendingLoads.length = 0; // Clear the queue
              res.end(JSON.stringify(loads));
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
