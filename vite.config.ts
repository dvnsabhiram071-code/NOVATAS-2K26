import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'security-headers-and-api-guard',
      configureServer(server) {
        // 1. Security Headers middleware
        server.middlewares.use((_req, res, next) => {
          res.setHeader('X-Frame-Options', 'DENY');
          res.setHeader('X-Content-Type-Options', 'nosniff');
          res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
          res.setHeader('X-XSS-Protection', '1; mode=block');
          next();
        });

        // 2. Mock protected server-side API guard for /api/admin/*
        server.middlewares.use((req, res, next) => {
          if (req.url?.startsWith('/api/admin')) {
            const authHeader = req.headers['authorization'];
            if (!authHeader || !authHeader.startsWith('Bearer nvt_sess_')) {
              res.statusCode = 401;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ 
                error: '401 Unauthorized: Valid NOVATAS 2K26 admin session token required.',
                access: 'DENIED' 
              }));
              return;
            }
          }
          next();
        });
      },
    },
  ],
});
