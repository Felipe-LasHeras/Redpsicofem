const express = require("express");
const router = express.Router();
const camposRoutes = require("./campos.routes");

router.use("/", camposRoutes);

module.exports = router;