import { Router } from "express";

import excludeFile from "../middlewares/excludeFile";
import spiderController from "../controllers/spider";

const router = Router();

router.get("/:id", excludeFile, spiderController.getById);
router.post("/", spiderController.post);
router.put("/:id", excludeFile, spiderController.put);
router.delete("/:id", excludeFile, spiderController.delete);

export default router;
