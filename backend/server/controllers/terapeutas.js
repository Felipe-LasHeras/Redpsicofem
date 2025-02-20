const pool = require("../config/db");

const getAllTerapeutas = async (req, res) => {
  try {
    const query = "SELECT * FROM psicologos ORDER BY created_at DESC";
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener terapeutas:", error);
    res.status(500).json({ error: "Error al obtener los terapeutas" });
  }
};

const getTerapeutaById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = "SELECT * FROM psicologos WHERE id = $1";
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Terapeuta no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al obtener terapeuta:", error);
    res.status(500).json({ error: "Error al obtener el terapeuta" });
  }
};

const crearTerapeuta = async (req, res) => {
  try {
    const {
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
      horarios,
    } = req.body;

    console.log("Datos recibidos:", req.body);

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
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *;
    `;

    const values = [
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
      horarios,
    ];

    console.log("Valores a insertar:", values);

    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error detallado al crear terapeuta:", error);
    res.status(500).json({
      error: "Error al crear el perfil del terapeuta",
      details: error.message,
    });
  }
};

const updateTerapeuta = async (req, res) => {
  try {
    const { id } = req.params;
    const {
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
      horarios,
    } = req.body;

    const query = `
      UPDATE psicologos SET
        nombre = $1,
        apellido = $2,
        tipo_terapeuta = $3,
        especialidad = $4,
        region = $5,
        comuna = $6,
        lugar_atencion = $7,
        valor_consulta = $8,
        descripcion = $9,
        rut = $10,
        edad_atencion = $11,
        tipo_atencion = $12,
        horarios = $13
      WHERE id = $14
      RETURNING *;
    `;

    const values = [
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
      horarios,
      id,
    ];

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Terapeuta no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al actualizar terapeuta:", error);
    res.status(500).json({ error: "Error al actualizar el terapeuta" });
  }
};

const deleteTerapeuta = async (req, res) => {
  try {
    const { id } = req.params;
    const query = "DELETE FROM psicologos WHERE id = $1 RETURNING *";
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Terapeuta no encontrado" });
    }

    res.json({ message: "Terapeuta eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar terapeuta:", error);
    res.status(500).json({ error: "Error al eliminar el terapeuta" });
  }
};

module.exports = {
  getAllTerapeutas,
  getTerapeutaById,
  crearTerapeuta,
  updateTerapeuta,
  deleteTerapeuta,
};
