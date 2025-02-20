// Server/routes/pacientes.js
const express = require('express');
const router = express.Router();
const {
    getAllPacientes,
    getPacienteById,
    crearPaciente,
    updatePaciente,
    deletePaciente
} = require('../../controllers/pacientes');

// Obtener todos los pacientes
router.get('/', getAllPacientes);

// Obtener un paciente específico
router.get('/:id', getPacienteById);

// Crear nuevo paciente
router.post('/', crearPaciente);

// Actualizar paciente
router.put('/:id', updatePaciente);

// Eliminar paciente
router.delete('/:id', deletePaciente);

module.exports = router;