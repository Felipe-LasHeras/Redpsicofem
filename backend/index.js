// index.js
const express = require("express");
const cors = require("cors");
const pacientesRoutes = require("./server/routes/pacientes/pacientes.router");
const terapeutasRoutes = require("./server/routes/terapeutas/terapeutas.router");
const camposRoutes = require("./server/routes/campos/campos.router"); // Nuevo router para campos
const { createTable: createTablePacientes } = require("./db/tablaPacientes");
const { createTable: createTableTerapeutas } = require("./db/tablaTerapeuta");
const { actualizarTablaPacientes } = require("./db/actualizarTablaPacientes");
const { actualizarTablaTerapeutas } = require("./db/actualizarTablaTerapeutas");
const { actualizarTablaHorarios } = require("./db/actualizarTablaHorarios");

const app = express();

// Configuración CORS más específica
app.use(
  cors({
    origin: "http://localhost:3000", // Tu frontend
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Accept"],
  })
);

app.use(express.json());
app.use("/api/pacientes", pacientesRoutes);
app.use("/api/terapeutas", terapeutasRoutes);
app.use("/api/campos", camposRoutes); // Nueva ruta para la API de campos

// Inicializar las bases de datos
const initDatabase = async () => {
  try {
    await createTablePacientes();
    await createTableTerapeutas();
    await actualizarTablaPacientes(); // Ejecutar la actualización
    await actualizarTablaTerapeutas(); // Ejecutar la actualización de terapeutas
    await actualizarTablaHorarios(); // Ejecutar la actualización de horarios
    console.log("Tablas creadas exitosamente");
  } catch (error) {
    console.error("Error al crear las tablas:", error);
  }
};

// Inicializar la base de datos
initDatabase();

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});