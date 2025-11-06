import type { Request, Response } from "express";
import { prisma } from "../server.js";

export async function getAllCities(req: Request, res: Response) {
    try {
        const cities = await prisma.city.findMany({
            include: {
                postalCodes: true,
                geoData: true,
            },
        });
        res.json(cities);
    } catch (e: any) {
        res.status(500).json({ error: "Internal server error: " + e.message });
    }
}

export async function getCity(req: Request, res: Response) {
    try {
        const cityName = req.params.name;
        if (!cityName) {
            return res.status(400).json({ error: "City name is required" });
        }

        const city = await prisma.city.findFirst({
            where: { name: cityName },
            include: {
                postalCodes: true,
                geoData: true,
            },
        });

        if (!city) {
            return res.status(404).json({ error: "City not found" });
        }

        res.json(city);
    } catch (e: any) {
        res.status(500).json({ error: "Internal server error" });
    }
}
