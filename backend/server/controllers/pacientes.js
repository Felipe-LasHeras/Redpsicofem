// Server/controllers/pacientes.js
const pool = require('../config/db');

// Obtener todos los pacientes
const getAllPacientes = async (req, res) => {
    try {
        const query = 'SELECT * FROM perfiles_pacientes ORDER BY created_at DESC';
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener pacientes:', error);
        res.status(500).json({ error: 'Error al obtener los pacientes' });
    }
};

// Obtener un paciente por ID
const getPacienteById = async (req, res) => {
    try {
        const { id } = req.params;
        const query = 'SELECT * FROM perfiles_pacientes WHERE id = $1';
        const result = await pool.query(query, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Paciente no encontrado' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error al obtener paciente:', error);
        res.status(500).json({ error: 'Error al obtener el paciente' });
    }
};

// Crear nuevo paciente
const crearPaciente = async (req, res) => {
    try {
        const {
            email,
            nombre,
            apellido,
            rut,
            edad,
            region,
            comuna,
            ciudad,
            direccion,
            telefono,
            nombre_contacto_emergencia,
            telefono_contacto_emergencia,
            motivo_consulta,
            diagnostico,
            sintomas,
            horarios,
            arancel,
            prevision,
            modalidad,
            psicologo_varon,
            practicante,
            pregunta
        } = req.body;

        const query = `
            INSERT INTO perfiles_pacientes (
                email, nombre, apellido, rut, edad, region, comuna, ciudad,
                direccion, telefono, nombre_contacto_emergencia, telefono_contacto_emergencia,
                motivo_consulta, diagnostico, sintomas, horarios, arancel, prevision,
                modalidad, psicologo_varon, practicante, pregunta
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
            RETURNING *;
        `;

        const values = [
            email,
            nombre,
            apellido,
            rut,
            edad,
            region,
            comuna,
            ciudad,
            direccion,
            telefono,
            nombre_contacto_emergencia,
            telefono_contacto_emergencia,
            motivo_consulta,
            diagnostico,
            sintomas,
            horarios,
            arancel,
            prevision,
            modalidad,
            psicologo_varon === 'true',
            practicante === 'Si',
            pregunta
        ];

        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error al crear perfil:', error);
        res.status(500).json({ error: 'Error al crear el perfil del paciente' });
    }
};

// Actualizar paciente
const updatePaciente = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            email,
            nombre,
            apellido,
            rut,
            edad,
            region,
            comuna,
            ciudad,
            direccion,
            telefono,
            nombre_contacto_emergencia,
            telefono_contacto_emergencia,
            motivo_consulta,
            diagnostico,
            sintomas,
            horarios,
            arancel,
            prevision,
            modalidad,
            psicologo_varon,
            practicante,
            pregunta
        } = req.body;

        const query = `
            UPDATE perfiles_pacientes SET
                email = $1, nombre = $2, apellido = $3, rut = $4, edad = $5,
                region = $6, comuna = $7, ciudad = $8, direccion = $9,
                telefono = $10, nombre_contacto_emergencia = $11,
                telefono_contacto_emergencia = $12, motivo_consulta = $13,
                diagnostico = $14, sintomas = $15, horarios = $16,
                arancel = $17, prevision = $18, modalidad = $19,
                psicologo_varon = $20, practicante = $21, pregunta = $22
            WHERE id = $23
            RETURNING *;
        `;

        const values = [
            email,
            nombre,
            apellido,
            rut,
            edad,
            region,
            comuna,
            ciudad,
            direccion,
            telefono,
            nombre_contacto_emergencia,
            telefono_contacto_emergencia,
            motivo_consulta,
            diagnostico,
            sintomas,
            horarios,
            arancel,
            prevision,
            modalidad,
            psicologo_varon === 'true',
            practicante === 'Si',
            pregunta,
            id
        ];

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Paciente no encontrado' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error al actualizar paciente:', error);
        res.status(500).json({ error: 'Error al actualizar el paciente' });
    }
};

// Eliminar paciente
const deletePaciente = async (req, res) => {
    try {
        const { id } = req.params;
        const query = 'DELETE FROM perfiles_pacientes WHERE id = $1 RETURNING *';
        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Paciente no encontrado' });
        }

        res.json({ message: 'Paciente eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar paciente:', error);
        res.status(500).json({ error: 'Error al eliminar el paciente' });
    }
};

module.exports = {
    getAllPacientes,
    getPacienteById,
    crearPaciente,
    updatePaciente,
    deletePaciente
};