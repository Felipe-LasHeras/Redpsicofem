const pool = require("../config/db");

// Obtener todos los campos configurados
const getAllCampos = async (req, res) => {
  try {
    const query = "SELECT * FROM configuracion_campos ORDER BY orden ASC";
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener campos:", error);
    res.status(500).json({ error: "Error al obtener los campos" });
  }
};

// Obtener campos activos
const getCamposActivos = async (req, res) => {
  try {
    const query = "SELECT * FROM configuracion_campos WHERE activo = true ORDER BY orden ASC";
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener campos activos:", error);
    res.status(500).json({ error: "Error al obtener los campos activos" });
  }
};

// Crear nuevo campo
// Crear nuevo campo
const crearCampo = async (req, res) => {
  try {
    const {
      nombre_campo,
      etiqueta,
      tipo,
      opciones,
      requerido,
      activo,
      orden,
      categoria
    } = req.body;

    // Asegúrate de que opciones sea un objeto JSON válido
    const opcionesJSON = opciones ? JSON.stringify(opciones) : null;

    const query = `
      INSERT INTO configuracion_campos (
        nombre_campo, etiqueta, tipo, opciones, requerido, activo, orden, categoria
      )
      VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7, $8)
      RETURNING *;
    `;

    const values = [
      nombre_campo,
      etiqueta,
      tipo,
      opcionesJSON, // Usar la versión convertida a string
      requerido || false,
      activo !== undefined ? activo : true,
      orden,
      categoria || 'general'
    ];

    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error detallado al crear campo:", error);
    res.status(500).json({ error: "Error al crear el campo", details: error.message });
  }
};

// Actualizar campo
const updateCampo = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre_campo,
      etiqueta,
      tipo,
      opciones,
      requerido,
      activo,
      orden,
      categoria
    } = req.body;

    // Asegúrate de que opciones sea un objeto JSON válido
    const opcionesJSON = opciones ? JSON.stringify(opciones) : null;

    const query = `
      UPDATE configuracion_campos SET
        nombre_campo = $1,
        etiqueta = $2,
        tipo = $3,
        opciones = $4::jsonb,
        requerido = $5,
        activo = $6,
        orden = $7,
        categoria = $8
      WHERE id = $9
      RETURNING *;
    `;

    const values = [
      nombre_campo,
      etiqueta,
      tipo,
      opcionesJSON, // Usar la versión convertida a string
      requerido || false,
      activo !== undefined ? activo : true,
      orden,
      categoria || 'general',
      id
    ];

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Campo no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al actualizar campo:", error);
    res.status(500).json({ error: "Error al actualizar el campo", details: error.message });
  }
};
// Eliminar campo
const deleteCampo = async (req, res) => {
  try {
    const { id } = req.params;
    const query = "DELETE FROM configuracion_campos WHERE id = $1 RETURNING *";
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Campo no encontrado" });
    }

    res.json({ message: "Campo eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar campo:", error);
    res.status(500).json({ error: "Error al eliminar el campo" });
  }
};

module.exports = {
  getAllCampos,
  getCamposActivos,
  crearCampo,
  updateCampo,
  deleteCampo
};