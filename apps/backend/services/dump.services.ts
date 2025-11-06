import { downloadAndExtractZip } from "../utils/download.utils.js";
import fs from "fs";
import path from "path";
import { prisma } from "../server.js";
import { spawn } from "node:child_process";

export async function dumpLegalUnit() {
    if (!process.env.LEGAL_UNIT_URL) {
        throw new Error(
            "LEGAL_UNITS_URL is not defined in environment variables.",
        );
    }

    await downloadAndExtractZip(process.env.LEGAL_UNIT_URL);

    if (!fs.existsSync("data/StockUniteLegale_utf8.csv")) {
        throw new Error("CSV file not found after extraction.");
    }

    console.log("📂 Importing CSV directly into SQLite...");

    const sqliteFile = path.join(process.cwd(), "prisma/dev.db");

    await new Promise<void>((resolve, reject) => {
        const child = spawn("sqlite3", [sqliteFile], {
            stdio: ["pipe", "ignore", "ignore"],
        });

        // commande SQLite pour importer le CSV
        child.stdin.write(`.mode csv\n`);
        child.stdin.write(
            `.import 'data/StockUniteLegale_utf8.csv' LegalUnit\n`,
        );
        child.stdin.end();

        child.on("close", (code) => {
            if (code === 0) {
                console.log("✅ CSV imported successfully!");
                //fs.unlinkSync(data/StockUniteLegale_utf8.csv);
                console.log("🧹 Temporary CSV removed.");
            } else {
              console.log(`❌ SQLite process exited with code ${code}`);
              //reject(new Error(`SQLite process exited with code ${code}`));
            }
            resolve();
        });
    });
}

export type City = {
    nom: string;
    code: string;
    codeDepartement: string;
    siren: string;
    codeEpci: string;
    codeRegion: string;
    codesPostaux: string[];
    population: number;
};

export async function getAllCities(code: string) {
    try {
        code = code.slice(0, 2);
        const cities = await fetch(
            `https://geo.api.gouv.fr/departements/${code}/communes`,
        );

        if (!cities.ok) {
            throw new Error(
                `Failed to fetch cities for department code: ${code}`,
            );
        }
        const data: City[] = await cities.json();

        return data;
    } catch (error) {
        console.error("Error fetching cities:", error);
        return [];
    }
}

export async function dumpCities(cities: City[]) {
    if ((await prisma.city.count()) > 0) {
        console.log("Cities already exist in the database. Skipping dump.");
        return;
    }

    const cityData = cities.map((city: City) => ({
        codeINSEE: city.code,
        name: city.nom,
        codeDepartement: city.codeDepartement,
        siren: city.siren,
        codeEpci: city.codeEpci,
        codeRegion: city.codeRegion,
        population: city.population,
    }));
    const postalCodeData = cities.flatMap((city: City) =>
        city.codesPostaux.map((codePostal: string) => ({
            code: codePostal,
            cityCodeINSEE: city.code,
        })),
    );
    await prisma.$transaction([
        prisma.city.createMany({ data: cityData }),
        prisma.postalCode.createMany({ data: postalCodeData }),
    ]);
    console.log(
        `${cities.length} cities and ${postalCodeData.length} postal codes inserted.`,
    );
}
