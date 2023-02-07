const express = require("express");
const familyController = require("../controllers/family");

const router = express.Router();

router.get("/:id", familyController.getAbout);

module.exports = router;
