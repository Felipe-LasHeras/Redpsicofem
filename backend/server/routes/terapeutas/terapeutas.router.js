const express = require("express");
const router = express.Router();
const terapeutaRoutes = require("./terapeutas.routes");

router.use("/", terapeutaRoutes);

module.exports = router;