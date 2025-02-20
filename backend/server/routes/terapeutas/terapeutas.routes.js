const express = require("express");
const router = express.Router();
const {
  getAllTerapeutas,
  getTerapeutaById,
  crearTerapeuta,
  updateTerapeuta,
  deleteTerapeuta,
} = require("../../controllers/terapeutas");

router.get("/", getAllTerapeutas);
router.get("/:id", getTerapeutaById);
router.post("/", crearTerapeuta);
router.put("/:id", updateTerapeuta);
router.delete("/:id", deleteTerapeuta);

module.exports = router;
