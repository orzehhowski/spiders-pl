import { Router } from "express";

import imageController from "../controllers/image";
import excludeFile from "../middlewares/excludeFile";

const router = Router();

router.get("/:id", excludeFile, imageController.get);
router.post("/", imageController.post);
router.put("/:id", imageController.put);
router.delete("/:id", excludeFile, imageController.delete);

export default router;
