import { Router } from "express";
import spiderController from "../controllers/spider";

const router = Router();

router.get("/:id", spiderController.getById);
router.post("/", spiderController.post);
router.put("/", spiderController.put);

export default router;
