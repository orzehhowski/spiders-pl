import { Router } from "express";
import spiderController from "../controllers/spider";

const router = Router();

router.get("/:id", spiderController.getAbout);

export default router;
