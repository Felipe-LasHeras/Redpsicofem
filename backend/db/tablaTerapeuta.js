const { Pool } = require('pg');

const pool = new Pool({
  user: 'tu_usuario',
  host: 'localhost',
  database: 'tu_base_de_datos',
  password: 'tu_contraseña',
  port: 5432,
});

const createTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS psicologos (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(50) NOT NULL,
      apellido VARCHAR(50) NOT NULL,
      especialidad VARCHAR(100) NOT NULL,
      region VARCHAR(100) NOT NULL,
      comuna VARCHAR(100) NOT NULL,
      lugar_atencion VARCHAR(255) NOT NULL,
      valor_consulta DECIMAL(10,2) NOT NULL,
      descripcion TEXT,
      perfil_rrss VARCHAR(255),
      tipo_terapeuta SMALLINT CHECK (tipo_terapeuta IN (1, 2)),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await pool.query(query);
    console.log('Tabla creada exitosamente.');
  } catch (error) {
    console.error('Error al crear la tabla:', error);
  } finally {
    pool.end();
  }
};

createTable();
