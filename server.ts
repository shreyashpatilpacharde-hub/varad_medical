import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import inventoryRoutes from './server/routes/inventory.js';
import billingRoutes from './server/routes/billing.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // JSON request body parser
  app.use(express.json());

  // Request logger for API calls
  app.use((req, _res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`[API] ${req.method} ${req.path}`);
    }
    next();
  });

  // Backend API route registration
  app.use('/api/inventory', inventoryRoutes);
  app.use('/api/billing', billingRoutes);
  // Also expose /api/receipts directly for convenience
  app.use('/api/receipts', (req, res, next) => {
    if (req.url === '/' || req.url === '') {
      req.url = '/receipts';
    } else {
      req.url = `/receipts${req.url}`;
    }
    billingRoutes(req, res, next);
  });

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'CuraStore Medical Management API', timestamp: new Date().toISOString() });
  });

  // Vite middleware in dev or static files in production
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('[Dev] Vite middleware attached');
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
    console.log('[Prod] Serving static build from dist');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CuraStore Medical Management running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
