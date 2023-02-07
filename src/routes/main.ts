import { Router } from "express";
const mainController = require("../controllers/main");

const router = Router();

router.get("/", mainController.getHome);

export default router;
