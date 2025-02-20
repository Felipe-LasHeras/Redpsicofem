// index.js
const express = require("express");
const cors = require("cors");
const pacientesRoutes = require("./server/routes/pacientes/pacientes.router");
const terapeutasRoutes = require("./server/routes/terapeutas/terapeutas.router");
const { createTable: createTablePacientes } = require("./db/tablaPacientes");
const { createTable: createTableTerapeutas } = require("./db/tablaTerapeuta");

const app = express();

// Configuración CORS más específica
app.use(
  cors({
    origin: "http://localhost:3000", // Tu frontend
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Accept"],
  })
);

app.use(express.json());
app.use("/api/pacientes", pacientesRoutes);
app.use("/api/terapeutas", terapeutasRoutes);

// Inicializar las bases de datos
const initDatabase = async () => {
  try {
    await createTablePacientes();
    await createTableTerapeutas();
    console.log("Tablas creadas exitosamente");
  } catch (error) {
    console.error("Error al crear las tablas:", error);
  }
};

// Inicializar la base de datos
initDatabase();

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
