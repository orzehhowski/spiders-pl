import { Router } from "express";
import familyController from "../controllers/family";

const router = Router();

router.get("/:id", familyController.getAbout);

export default router;
