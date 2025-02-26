const express = require('express');
const router = express.Router();
const {
    getAllCampos,
    getCamposActivos,
    crearCampo,
    updateCampo,
    deleteCampo
} = require('../../controllers/campos');

// Obtener todos los campos
router.get('/', getAllCampos);

// Obtener campos activos
router.get('/activos', getCamposActivos);

// Crear nuevo campo
router.post('/', crearCampo);

// Actualizar campo
router.put('/:id', updateCampo);

// Eliminar campo
router.delete('/:id', deleteCampo);

module.exports = router;