import express, { Router } from "express";
import * as aiController from "../controllers/ai.controllers.js";

const router: Router = express.Router();

router.post("/answer", (req, res) => aiController.answer(req, res));
router.get("/health", (req, res) => aiController.health(req, res));

export default router;
