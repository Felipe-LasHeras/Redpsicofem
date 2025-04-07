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

async function exportTables() {
  try {
    // Obtener la lista de tablas
    const tablesResult = await sourcePool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    const tables = tablesResult.rows.map(row => row.table_name);
    
    let schemaSQL = '';
    
    // Iterar por cada tabla y extraer su esquema
    for (const table of tables) {
      console.log(`Exportando esquema para tabla: ${table}`);
      
      // Obtener la definición de la tabla
      const tableDefResult = await sourcePool.query(`
        SELECT column_name, data_type, character_maximum_length, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = $1
        ORDER BY ordinal_position
      `, [table]);
      
      // Construir la sentencia CREATE TABLE
      let createTableSQL = `DROP TABLE IF EXISTS ${table} CASCADE;\nCREATE TABLE ${table} (\n`;
      
      const columns = tableDefResult.rows.map(col => {
        let colDef = `  ${col.column_name} ${col.data_type}`;
        
        // Añadir longitud si aplica
        if (col.character_maximum_length) {
          colDef += `(${col.character_maximum_length})`;
        }
        
        // Añadir NULLABLE
        colDef += col.is_nullable === 'YES' ? ' NULL' : ' NOT NULL';
        
        // Añadir DEFAULT si existe
        if (col.column_default) {
          colDef += ` DEFAULT ${col.column_default}`;
        }
        
        return colDef;
      });
      
      // Añadir las restricciones y claves
      const constraintsResult = await sourcePool.query(`
        SELECT 
          tc.constraint_name, 
          tc.constraint_type,
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM 
          information_schema.table_constraints tc
        JOIN 
          information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
        LEFT JOIN 
          information_schema.constraint_column_usage ccu
          ON tc.constraint_name = ccu.constraint_name
        WHERE 
          tc.table_name = $1
      `, [table]);
      
      for (const constraint of constraintsResult.rows) {
        if (constraint.constraint_type === 'PRIMARY KEY') {
          columns.push(`  PRIMARY KEY (${constraint.column_name})`);
        } else if (constraint.constraint_type === 'FOREIGN KEY') {
          columns.push(`  FOREIGN KEY (${constraint.column_name}) REFERENCES ${constraint.foreign_table_name}(${constraint.foreign_column_name})`);
        }
      }
      
      createTableSQL += columns.join(',\n');
      createTableSQL += '\n);\n\n';
      
      // Añadir índices
      const indexesResult = await sourcePool.query(`
        SELECT indexname, indexdef
        FROM pg_indexes
        WHERE tablename = $1
      `, [table]);
      
      for (const index of indexesResult.rows) {
        // Evitar duplicar índices de clave primaria que ya se crearon con la tabla
        if (!index.indexname.endsWith('_pkey')) {
          createTableSQL += `${index.indexdef};\n`;
        }
      }
      
      schemaSQL += createTableSQL;
    }
    
    // Guardar el esquema en un archivo
    fs.writeFileSync('db_schema.sql', schemaSQL);
    console.log('Esquema exportado a db_schema.sql');
    
  } catch (error) {
    console.error('Error al exportar esquema:', error);
  } finally {
    await sourcePool.end();
  }
}

exportTables();