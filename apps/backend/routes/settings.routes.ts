import express, { Router } from "express";
import * as settingsController from "../controllers/settings.controllers.js";

const router: Router = express.Router();

/**
 * @swagger
 * /api/settings:
 *   get:
 *     summary: Récupère les paramètres de l'application
 *     description: Récupère la configuration actuelle de l'application
 *     tags: [Settings]
 *     responses:
 *       200:
 *         description: Paramètres récupérés avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 settings:
 *                   $ref: '#/components/schemas/Settings'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 */
router.get("/", (req, res) => settingsController.getSettings(req, res));

/**
 * @swagger
 * /api/settings:
 *   put:
 *     summary: Met à jour les paramètres de l'application
 *     description: Modifie la configuration de l'application
 *     tags: [Settings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateSettingsInput'
 *     responses:
 *       200:
 *         description: Paramètres mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 settings:
 *                   $ref: '#/components/schemas/Settings'
 *       400:
 *         description: Paramètre invalide
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: aiTimeout must be a positive number (ms) and reasonable
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 */
router.put("/", (req, res) => settingsController.updateSettings(req, res));

export default router;

