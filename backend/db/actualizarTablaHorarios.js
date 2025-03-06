const pool = require("../server/config/db");

const actualizarTablaHorarios = async () => {
  try {
    // Añadir columnas para almacenar los horarios online y presenciales
    await pool.query(`
      ALTER TABLE psicologos 
      ADD COLUMN IF NOT EXISTS horarios_online JSONB DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS horarios_presencial JSONB DEFAULT '{}';
    `);
    
    console.log("Tabla de terapeutas actualizada con campos de horarios");
  } catch (error) {
    console.error("Error al actualizar la estructura de la tabla de terapeutas con horarios:", error);
  }
};

module.exports = {
  actualizarTablaHorarios
};