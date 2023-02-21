import { Router } from "express";

import excludeFile from "../middlewares/excludeFile";
import familyController from "../controllers/family";

const router = Router();

router.get("/", excludeFile, familyController.getAll);
router.get("/:id", excludeFile, familyController.get);
router.post("/", familyController.post);
router.put("/:id", familyController.put);
router.delete("/:id", excludeFile, familyController.delete);

export default router;
