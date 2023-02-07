const express = require("express");
const speciesController = require("../controllers/species");

const router = express.Router();

router.get("/:id", speciesController.getAbout);

module.exports = router;
