const { Router } = require("express");
const { healthController } = require("./health.controller");

const router = Router();

router.get("/", healthController);

module.exports = router;
