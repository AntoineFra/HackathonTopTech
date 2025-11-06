import express, { Router } from "express";
import * as aiController from "../controllers/ai.controllers.js";

const router: Router = express.Router();

/**
 * @swagger
 * /api/ai/answer:
 *   post:
 *     summary: Pose une question à l'IA
 *     description: Envoie une question à Ollama et reçoit une réponse générée par l'IA
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AIRequest'
 *     responses:
 *       200:
 *         description: Réponse de l'IA générée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AIResponse'
 *       400:
 *         description: Question manquante
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Question is required
 *       500:
 *         description: Erreur serveur ou erreur IA
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/answer", (req, res) => aiController.answer(req, res));

/**
 * @swagger
 * /api/ai/health:
 *   get:
 *     summary: Vérifie l'état de santé du service IA
 *     description: Vérifie si Ollama est en ligne et accessible
 *     tags: [AI]
 *     responses:
 *       200:
 *         description: Service IA en bonne santé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AIHealth'
 *       503:
 *         description: Service IA indisponible
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AIHealth'
 *       500:
 *         description: Erreur lors de la vérification
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/health", (req, res) => aiController.health(req, res));

export default router;
