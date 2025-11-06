import { Router } from "express";
import * as troisDController from "../controllers/trois-d.controllers.js";

const router: Router = Router();

router.get("/cities", (req, res) => troisDController.getAllCities(req, res));

router.get("/cities/:name", (req, res) => troisDController.getCity(req, res));


router.get("/population", (req, res) => troisDController.getPopulationData(req, res));

// par nom de ville
router.get("/population/:codeINSEE", (req, res) => troisDController.getPopulationDataForCity(req, res));

export default router;
