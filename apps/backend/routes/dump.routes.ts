import { Router } from "express";
import * as dumpController from "../controllers/dump.controllers.js";

const router: Router = Router();

/**
 * @swagger
 * /api/dump:
 *   get:
 *     summary: Liste tous les dumps disponibles
 *     description: Récupère la liste de tous les types de dumps avec leur statut
 *     tags: [Dump]
 *     responses:
 *       200:
 *         description: Liste des dumps récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 dumps:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Dump'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/", (req, res) => dumpController.getDumpList(req, res));

/**
 * @swagger
 * /api/dump/{dumpType}:
 *   get:
 *     summary: Lance un dump de données
 *     description: Exécute l'import de données pour le type spécifié (legal_unit ou cities)
 *     tags: [Dump]
 *     parameters:
 *       - in: path
 *         name: dumpType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [legal_unit, cities]
 *         description: Type de dump à exécuter
 *     responses:
 *       200:
 *         description: Dump exécuté avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DumpResult'
 *       400:
 *         description: Type de dump invalide
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid dump type
 *       500:
 *         description: Erreur lors de l'exécution du dump
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/:dumpType", (req, res) => dumpController.dumpData(req, res));

export default router;
