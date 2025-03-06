const express = require("express");
const router = express.Router();
const {
  getAllTerapeutas,
  getTerapeutaById,
  crearTerapeuta,
  updateTerapeuta,
  deleteTerapeuta,
  getTerapeutasPorTipo,
  updateHorariosTerapeuta
} = require("../../controllers/terapeutas");

router.get("/", getAllTerapeutas);
router.get("/tipo/:tipo", getTerapeutasPorTipo); // Ruta para filtrar por tipo
router.get("/:id", getTerapeutaById);
router.post("/", crearTerapeuta);
router.put("/:id", updateTerapeuta);
router.patch("/:id/horarios", updateHorariosTerapeuta); // Nueva ruta para actualizar solo horarios
router.delete("/:id", deleteTerapeuta);

module.exports = router;