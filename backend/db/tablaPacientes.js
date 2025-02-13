const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'Redpsicofem',
  password: '',
  port: 5432, // Puerto por defecto de PostgreSQL
});

const createTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS perfiles_pacientes (
      id SERIAL PRIMARY KEY,
  email VARCHAR(100) NOT NULL,
  nombre VARCHAR(50) NOT NULL,
  apellido VARCHAR(50) NOT NULL,
  rut VARCHAR(12) UNIQUE NOT NULL,
  edad INT NOT NULL,
  region VARCHAR(100) NOT NULL,
  comuna VARCHAR(100) NOT NULL,
  ciudad VARCHAR(100) NOT NULL,
  direccion VARCHAR(255) NOT NULL,
  telefono VARCHAR(20) NOT NULL,
  nombre_contacto_emergencia VARCHAR(100) NOT NULL,
  telefono_contacto_emergencia VARCHAR(20) NOT NULL,
  motivo_consulta TEXT NOT NULL,
  diagnostico TEXT NOT NULL,
  sintomas TEXT NOT NULL,
  horarios TIME NOT NULL,
  arancel VARCHAR(50) NOT NULL,
  prevision VARCHAR(100) NOT NULL,
  modalidad VARCHAR(50) NOT NULL,
  psicologo_varon BOOLEAN NOT NULL,
  practicante BOOLEAN NOT NULL,
  pregunta TEXT NOT NULL,
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
