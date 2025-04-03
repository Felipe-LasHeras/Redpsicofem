const pool = require("../server/config/db");

const actualizarTablaTerapeutas = async () => {
  try {
    // Añadir columnas para ambos tipos de terapeutas
    await pool.query(`
      ALTER TABLE psicologos 
      ADD COLUMN IF NOT EXISTS tipo_terapeuta_nombre VARCHAR(50),
      ADD COLUMN IF NOT EXISTS direccion_atencion VARCHAR(255),
      ADD COLUMN IF NOT EXISTS atiende_ninos BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS atiende_adolescentes BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS atiende_adultos BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS atiende_hombre_cis BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS atiende_presencial BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS atiende_online BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS arancel_diferencial BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS valor_general_atencion INTEGER,
      ADD COLUMN IF NOT EXISTS cupos_30000_35000 INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS cupos_25000_29000 INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS cupos_20000_24000 INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS cupos_15000_19000 INTEGER DEFAULT 0;
    `);
    
    // Actualizar los registros existentes para asignar un tipo_terapeuta_nombre 
    // basado en el campo tipo_terapeuta
    await pool.query(`
      UPDATE psicologos
      SET tipo_terapeuta_nombre = CASE 
        WHEN tipo_terapeuta = true THEN 'Redpsicofem'
        ELSE 'Red derivacion'
      END
      WHERE tipo_terapeuta_nombre IS NULL;
    `);
    
    console.log("Tabla de terapeutas actualizada exitosamente");
  } catch (error) {
    console.error("Error al actualizar la estructura de la tabla de terapeutas:", error);
  }
};

module.exports = {
  actualizarTablaTerapeutas
};