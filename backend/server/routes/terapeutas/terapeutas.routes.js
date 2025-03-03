const express = require("express");
const router = express.Router();
const {
  getAllTerapeutas,
  getTerapeutaById,
  crearTerapeuta,
  updateTerapeuta,
  deleteTerapeuta,
  getTerapeutasPorTipo
} = require("../../controllers/terapeutas");

router.get("/", getAllTerapeutas);
router.get("/tipo/:tipo", getTerapeutasPorTipo); // Nueva ruta para filtrar por tipo
router.get("/:id", getTerapeutaById);
router.post("/", crearTerapeuta);
router.put("/:id", updateTerapeuta);
router.delete("/:id", deleteTerapeuta);

module.exports = router;