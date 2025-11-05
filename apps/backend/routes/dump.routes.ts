import { Router } from "express";
import * as dumpController from "../controllers/dump.controllers.js";

const router: Router = Router();

// List all dump entries
router.get("/", (req, res) => dumpController.getDumpList(req, res));
router.get("/:dumpType", (req, res) => dumpController.dumpData(req, res));

export default router;
