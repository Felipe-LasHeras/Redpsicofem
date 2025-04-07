const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config();

// Conexión a la base de datos de origen
const sourcePool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT),
});

// Conexión a Supabase
const supabasePool = new Pool({
  user: process.env.SUPABASE_DB_USER,
  host: process.env.SUPABASE_DB_HOST,
  database: process.env.SUPABASE_DB_NAME,
  password: process.env.SUPABASE_DB_PASSWORD,
  port: parseInt(process.env.SUPABASE_DB_PORT),
  ssl: {
    rejectUnauthorized: false
  }
});

async function migrateData() {
  try {
    // Obtener la lista de tablas
    const tablesResult = await sourcePool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    const tables = tablesResult.rows.map(row => row.table_name);
    
    // Iterar por cada tabla y exportar datos
    for (const table of tables) {
      console.log(`Migrando datos para tabla: ${table}`);
      
      // Obtener datos de la tabla origen
      const dataResult = await sourcePool.query(`SELECT * FROM ${table}`);
      const rows = dataResult.rows;
      
      if (rows.length === 0) {
        console.log(`La tabla ${table} está vacía, saltando...`);
        continue;
      }
      
      // Preparar la inserción para Supabase
      const columns = Object.keys(rows[0]).join(', ');
      
      // Usando transacción para mantener integridad
      const supabaseClient = await supabasePool.connect();
      
      try {
        await supabaseClient.query('BEGIN');
        
        // Truncar la tabla destino para evitar duplicados
        await supabaseClient.query(`TRUNCATE TABLE ${table} CASCADE`);
        
        for (const row of rows) {
          // Construir valores y su placeholder para la consulta preparada
          const values = Object.values(row);
          const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
          
          // Insertar en Supabase
          await supabaseClient.query(
            `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`,
            values
          );
        }
        
        await supabaseClient.query('COMMIT');
        console.log(`Migración completada para tabla ${table}: ${rows.length} filas`);
        
      } catch (error) {
        await supabaseClient.query('ROLLBACK');
        console.error(`Error al migrar datos para ${table}:`, error);
      } finally {
        supabaseClient.release();
      }
    }
    
  } catch (error) {
    console.error('Error al migrar datos:', error);
  } finally {
    await sourcePool.end();
    await supabasePool.end();
  }
}

migrateData();