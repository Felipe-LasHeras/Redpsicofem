const express = require("express");
const router = express.Router();
const pacienteRoutes = require("./pacientes.routes");

router.use("/", pacienteRoutes);

module.exports = router;
