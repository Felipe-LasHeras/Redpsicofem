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
      // Campos adicionales
      tipo_terapeuta_nombre,
      direccion_atencion,
      atiende_ninos,
      atiende_adolescentes,
      atiende_adultos,
      atiende_hombre_cis,
      atiende_presencial,
      atiende_online,
      arancel_diferencial,
      valor_general_atencion,
      cupos_30000_35000,
      cupos_25000_29000,
      cupos_20000_24000,
      cupos_15000_19000,
      perfil_reservo
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
        horarios,
        tipo_terapeuta_nombre,
        direccion_atencion,
        atiende_ninos,
        atiende_adolescentes,
        atiende_adultos,
        atiende_hombre_cis,
        atiende_presencial,
        atiende_online,
        arancel_diferencial,
        valor_general_atencion,
        cupos_30000_35000,
        cupos_25000_29000,
        cupos_20000_24000,
        cupos_15000_19000,
        perfil_reservo
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28)
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
      tipo_terapeuta_nombre,
      direccion_atencion,
      atiende_ninos,
      atiende_adolescentes,
      atiende_adultos,
      atiende_hombre_cis,
      atiende_presencial,
      atiende_online,
      arancel_diferencial,
      valor_general_atencion,
      cupos_30000_35000,
      cupos_25000_29000,
      cupos_20000_24000,
      cupos_15000_19000,
      perfil_reservo
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
      // Campos adicionales
      tipo_terapeuta_nombre,
      direccion_atencion,
      atiende_ninos,
      atiende_adolescentes,
      atiende_adultos,
      atiende_hombre_cis,
      atiende_presencial,
      atiende_online,
      arancel_diferencial,
      valor_general_atencion,
      cupos_30000_35000,
      cupos_25000_29000,
      cupos_20000_24000,
      cupos_15000_19000,
      perfil_reservo
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
        horarios = $13,
        tipo_terapeuta_nombre = $14,
        direccion_atencion = $15,
        atiende_ninos = $16,
        atiende_adolescentes = $17,
        atiende_adultos = $18,
        atiende_hombre_cis = $19,
        atiende_presencial = $20,
        atiende_online = $21,
        arancel_diferencial = $22,
        valor_general_atencion = $23,
        cupos_30000_35000 = $24,
        cupos_25000_29000 = $25,
        cupos_20000_24000 = $26,
        cupos_15000_19000 = $27,
        perfil_reservo = $28
      WHERE id = $29
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
      tipo_terapeuta_nombre,
      direccion_atencion,
      atiende_ninos,
      atiende_adolescentes,
      atiende_adultos,
      atiende_hombre_cis,
      atiende_presencial,
      atiende_online,
      arancel_diferencial,
      valor_general_atencion,
      cupos_30000_35000,
      cupos_25000_29000,
      cupos_20000_24000,
      cupos_15000_19000,
      perfil_reservo,
      id
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

// Función para obtener terapeutas por tipo
const getTerapeutasPorTipo = async (req, res) => {
  try {
    const { tipo } = req.params;
    
    if (tipo !== 'Redpsicofem' && tipo !== 'Red derivacion') {
      return res.status(400).json({ error: "Tipo de terapeuta inválido" });
    }
    
    const query = "SELECT * FROM psicologos WHERE tipo_terapeuta_nombre = $1 ORDER BY created_at DESC";
    const result = await pool.query(query, [tipo]);
    
    res.json(result.rows);
  } catch (error) {
    console.error(`Error al obtener terapeutas de tipo ${req.params.tipo}:`, error);
    res.status(500).json({ error: "Error al obtener los terapeutas" });
  }
};

module.exports = {
  getAllTerapeutas,
  getTerapeutaById,
  crearTerapeuta,
  updateTerapeuta,
  deleteTerapeuta,
  getTerapeutasPorTipo
};