const pool = require("../server/config/db");

const actualizarTablaPacientes = async () => {
  try {
    // Añadir columna de campos dinámicos a la tabla de pacientes
    await pool.query(`
      ALTER TABLE perfiles_pacientes 
      ADD COLUMN IF NOT EXISTS campos_dinamicos JSONB DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    `);
    console.log("Tabla de pacientes actualizada exitosamente");

    // Crear tabla de configuración de campos
    await pool.query(`
      CREATE TABLE IF NOT EXISTS configuracion_campos (
        id SERIAL PRIMARY KEY,
        nombre_campo VARCHAR(100) NOT NULL,
        etiqueta VARCHAR(100) NOT NULL,
        tipo VARCHAR(50) NOT NULL,
        opciones JSONB,
        requerido BOOLEAN DEFAULT false,
        activo BOOLEAN DEFAULT true,
        orden INTEGER NOT NULL,
        categoria VARCHAR(50) DEFAULT 'general',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Tabla de configuración de campos creada exitosamente");
  } catch (error) {
    console.error("Error al actualizar la estructura de la base de datos:", error);
  }
};

module.exports = {
  actualizarTablaPacientes
};