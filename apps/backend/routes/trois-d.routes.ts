import { Router } from "express";
import * as troisDController from "../controllers/trois-d.controllers.js";

const router: Router = Router();

/**
 * @swagger
 * /api/trois-d/cities:
 *   get:
 *     summary: Récupère toutes les villes
 *     description: Récupère la liste complète des villes avec leurs données géographiques et codes postaux
 *     tags: [3D]
 *     responses:
 *       200:
 *         description: Liste des villes récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/City'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/cities", (req, res) => troisDController.getAllCities(req, res));

/**
 * @swagger
 * /api/trois-d/cities/{name}:
 *   get:
 *     summary: Récupère une ville par son nom
 *     description: Récupère les détails d'une ville spécifique avec ses données géographiques
 *     tags: [3D]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Nom de la ville
 *         example: Nice
 *     responses:
 *       200:
 *         description: Ville trouvée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/City'
 *       400:
 *         description: Nom de ville manquant
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: City name is required
 *       404:
 *         description: Ville non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: City not found
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/cities/:name", (req, res) => troisDController.getCity(req, res));

router.get("/population", (req, res) =>
    troisDController.getPopulationData(req, res),
);

// par nom de ville
router.get("/population/:codeINSEE", (req, res) =>
    troisDController.getPopulationDataForCity(req, res),
);

export default router;
