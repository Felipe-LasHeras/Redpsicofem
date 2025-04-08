// En backend/proxy.js
// Middleware para proxying a Supabase Functions
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