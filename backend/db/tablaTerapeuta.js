const pool = require("../server/config/db");

const createTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS psicologos (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(50) NOT NULL,
      apellido VARCHAR(50) NOT NULL,
      tipo_terapeuta BOOLEAN NOT NULL,
      especialidad VARCHAR(100) NOT NULL,
      region VARCHAR(100) NOT NULL,
      comuna VARCHAR(100) NOT NULL,
      lugar_atencion VARCHAR(255) NOT NULL,
      valor_consulta INTEGER NOT NULL,
      descripcion TEXT,
      rut VARCHAR(12) UNIQUE NOT NULL,
      edad_atencion VARCHAR(100) NOT NULL,
      tipo_atencion VARCHAR(100) NOT NULL,
      horarios VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await pool.query(query);
    console.log("Tabla creada exitosamente.");
  } catch (error) {
    console.error("Error al crear la tabla:", error);
  }
};

const insertTerapeuta = async (terapeuta) => {
  const query = `
    INSERT INTO psicologos (
      nombre, 
      apellido, 
      tipo_terapeuta,
      especialidad, 
      region, 
      comuna, 
      lugar_atencion, 
      valor_consulta, 
      descripcion,
      rut,
      edad_atencion,
      tipo_atencion,
      horarios
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
    RETURNING *;
  `;

  const values = [
    terapeuta.nombre,
    terapeuta.apellido,
    terapeuta.tipo_terapeuta,
    terapeuta.especialidad,
    terapeuta.region,
    terapeuta.comuna,
    terapeuta.lugar_atencion,
    terapeuta.valor_consulta,
    terapeuta.descripcion,
    terapeuta.rut,
    terapeuta.edad_atencion,
    terapeuta.tipo_atencion,
    terapeuta.horarios,
  ];

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error("Error al insertar terapeuta:", error);
    throw error;
  }
};

module.exports = {
  createTable,
  insertTerapeuta,
};
