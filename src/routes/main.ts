import { Router } from "express";
import mainController from "../controllers/main";

const router = Router();

router.get("/", mainController.getHome);

export default router;
