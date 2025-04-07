const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Configuración de CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'apikey']
}));

// Middleware para logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Proxy para Supabase Functions
app.use('/api', createProxyMiddleware({
  target: process.env.SUPABASE_FUNCTIONS_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api': '', // Remove /api prefix
  },
  onProxyReq: (proxyReq) => {
    // Añadir encabezados de autorización para Supabase
    proxyReq.setHeader('apikey', process.env.SUPABASE_ANON_KEY);
    proxyReq.setHeader('Authorization', `Bearer ${process.env.SUPABASE_ANON_KEY}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    // Modificar encabezados de respuesta si es necesario
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(500).json({ error: 'Proxy error', message: err.message });
  }
}));

// Ruta para verificar el estado del proxy
app.get('/status', (req, res) => {
  res.json({ status: 'Online', mode: 'Proxy' });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`API Proxy server running on port ${PORT}`);
});