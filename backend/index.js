// index.js
const express = require('express');
const cors = require('cors');
const pacientesRoutes = require('./server/routes/pacientes');

const app = express();


// Modificar la configuración de CORS
app.use(cors({
  origin: 'http://localhost:3000', // Tu frontend
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());
app.use('/api/pacientes', pacientesRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});