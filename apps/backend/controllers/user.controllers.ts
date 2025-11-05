import type { Request, Response } from "express";
import { prisma } from "../server.js";

export async function listUsers(req: Request, res: Response) {
    try {
        const users = await prisma.user.findMany();
        res.json(users);
    } catch (e: any) {
        res.status(500).json({ error: "Internal server error" });
    }
}

export async function createUser(req: Request, res: Response) {
    const { name, email } = req.body;
    try {
        const user = await prisma.user.create({ data: { name, email } });
        res.json(user);
    } catch (e: any) {
        if (e.code === "P2002") {
            return res.status(400).json({ error: "Email already exists" });
        }
        res.status(500).json({ error: "Internal server error" });
    }
}
