import express, { Router } from "express";
import * as settingsController from "../controllers/settings.controllers.js";

const router: Router = express.Router();

router.get("/", (req, res) => settingsController.getSettings(req, res));
router.put("/", (req, res) => settingsController.updateSettings(req, res));

export default router;

