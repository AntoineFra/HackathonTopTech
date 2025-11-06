import { Router } from "express";
import * as userController from "../controllers/user.controllers.js";

const router: Router = Router();

router.get("/", (req, res) => userController.listUsers(req, res));
router.post("/", (req, res) => userController.createUser(req, res));

export default router;
