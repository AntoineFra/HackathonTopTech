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

export async function getCityByCode(req: Request, res: Response) {
    try {
        const codeINSEE = req.params.codeINSEE;
        if (!codeINSEE) {
            return res.status(400).json({ error: "Code INSEE is required" });
        }

        const city = await prisma.city.findFirst({
            where: { codeINSEE: codeINSEE },
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

export async function getPopulationData(req: Request, res: Response) {
    try {
        const populationData = await prisma.populationHistory.findMany();
        res.json(populationData);
    } catch (e: any) {
        res.status(500).json({ error: "Internal server error: " + e.message });
    }
}

export async function getPopulationDataForCity(req: Request, res: Response) {
    try {
        const codeINSEE = req.params.codeINSEE;
        if (!codeINSEE) {
            return res
                .status(400)
                .json({ error: "City code INSEE is required" });
        }

        const city = await prisma.city.findFirst({
            where: { codeINSEE: codeINSEE },
        });

        if (!city) {
            return res.status(404).json({ error: "City not found" });
        }

        const populationData = await prisma.populationHistory.findMany({
            where: { codeGeo: codeINSEE },
        });
        res.json(populationData);
    } catch (e: any) {
        res.status(500).json({ error: "Internal server error: " + e.message });
    }
}
