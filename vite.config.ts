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

// Module-level state for read-only API endpoints
interface EditorState {
  version: string;
  herettoConnected: boolean;
  tabCount: number;
  activeTabId: string;
  theme: string;
  tabs: Map<string, {
    id: string;
    fileName: string | null;
    herettoFile: { uuid: string; name: string; path: string } | null;
    dirty: boolean;
    xmlErrorCount: number;
    xmlContent: string;
    xmlErrors: Array<{ line: number; column: number; message: string; severity: 'error' | 'warning' }>;
  }>;
}

const editorState: EditorState = {
  version: pkg.version,
  herettoConnected: false,
  tabCount: 0,
  activeTabId: '',
  theme: 'dark',
  tabs: new Map()
};

// Set up reference for the bridge to update this state
import('./lib/editor-state-bridge').then(bridge => {
  bridge.setEditorStateReference(editorState);
});

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
      {
        name: 'read-only-api',
        configureServer(server) {
          // GET /api/status
          server.middlewares.use('/api/status', (req, res) => {
            if (req.method === 'GET') {
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({
                version: editorState.version,
                herettoConnected: editorState.herettoConnected,
                tabCount: editorState.tabCount,
                activeTabId: editorState.activeTabId,
                theme: editorState.theme
              }));
            } else {
              res.writeHead(405);
              res.end();
            }
          });

          // GET /api/tabs/:id/content (more specific route must come first)
          server.middlewares.use((req, res, next) => {
            if (req.method === 'GET' && req.url?.startsWith('/api/tabs/') && req.url.endsWith('/content')) {
              const urlPath = req.url || '';
              const match = urlPath.match(/^\/api\/tabs\/([^\/]+)\/content$/);
              if (!match) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Not found' }));
                return;
              }

              const tabId = match[1];
              const tab = editorState.tabs.get(tabId);
              if (!tab) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Tab not found' }));
                return;
              }

              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({
                id: tab.id,
                fileName: tab.fileName,
                herettoFile: tab.herettoFile,
                dirty: tab.dirty,
                xmlErrors: tab.xmlErrors,
                xml: tab.xmlContent
              }));
            } else {
              next();
            }
          });

          // GET /api/tabs (general route comes after specific route)
          server.middlewares.use('/api/tabs', (req, res) => {
            if (req.method === 'GET') {
              const tabs = Array.from(editorState.tabs.values()).map(tab => ({
                id: tab.id,
                fileName: tab.fileName,
                herettoFile: tab.herettoFile,
                dirty: tab.dirty,
                xmlErrorCount: tab.xmlErrorCount
              }));
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({
                activeTabId: editorState.activeTabId,
                tabs
              }));
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
