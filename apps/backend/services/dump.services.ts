import { downloadAndExtractZip } from "../utils/download.utils.js";
import fs from "fs";
import path from "path";
import { prisma } from "../server.js";
import { spawn } from "node:child_process";

export interface DumpResult {
    count: number;
    items?: any[];
    summary?: Record<string, any>;
}

export async function dumpLegalUnit(): Promise<DumpResult> {
    if (!process.env.LEGAL_UNIT_URL) {
        throw new Error(
            "LEGAL_UNITS_URL is not defined in environment variables.",
        );
    }
    const existingCount = await prisma.legalUnit.count();
    if (existingCount > 0) {
        console.log(
            "Legal units already exist in the database. Skipping dump.",
        );
        return {
            count: existingCount,
            items: await prisma.legalUnit.findMany(),
            summary: {
                message: "Legal units already exist in database",
            },
        };
    }

    await downloadAndExtractZip(process.env.LEGAL_UNIT_URL);

    if (!fs.existsSync("data/StockUniteLegale_utf8.csv")) {
        throw new Error("CSV file not found after extraction.");
    }

    console.log("📂 Importing CSV directly into SQLite...");

    const sqliteFile = path.join(process.cwd(), "prisma/dev.db");

    await new Promise<void>((resolve) => {
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

    const count = await prisma.legalUnit.count();
    return {
        count,
        items: await prisma.legalUnit.findMany(),
        summary: {
            message: "Legal units imported successfully"
        }
    };
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

type CityWithGeo = {
    code: string;
    nom: string;
    surface?: number;
    zone?: string;
    centre?: { coordinates: [number, number] };
    contour?: any;
    mairie?: { coordinates: [number, number] };
    bbox?: any;
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

async function fetchCityGeoData(cityName: string): Promise<CityWithGeo | null> {
  try {
    const response = await fetch(
      `https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(cityName)}&fields=code,nom,surface,zone,centre,contour,mairie,bbox`,
    );

    if (!response.ok) {
      console.warn(`Failed to fetch geo data for city: ${cityName}`);
      return null;
    }

    const data: CityWithGeo[] = await response.json();
    return data[0] || null;
  } catch (error) {
    console.error(`Error fetching geo data for ${cityName}:`, error);
    return null;
  }
}

export async function dumpCities(cities: City[]): Promise<DumpResult> {
  const existingCount = await prisma.city.count();
  if (existingCount > 0) {
    console.log("Cities already exist in the database. Skipping dump.");
    return {
      count: existingCount,
      items: await prisma.city.findMany(),
      summary: {
        message: "Cities already exist in database",
        cities: existingCount
      }
    };
  }

  // Étape 1: Insérer les villes et codes postaux
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

  // Étape 2: Fetch et insertion des données GeoJSON pour chaque ville
  console.log("\n🌍 Fetching geo data for each city...");
  let geoDataCount = 0;

  for (const city of cities) {
    const geoCity = await fetchCityGeoData(city.nom);

    if (geoCity && (geoCity.centre || geoCity.mairie || geoCity.contour || geoCity.bbox)) {
      try {
        // Mise à jour des champs surface et zone de la ville
        await prisma.city.update({
          where: { codeINSEE: city.code },
          data: {
            surface: geoCity.surface ?? null,
            zone: geoCity.zone ?? null,
          },
        });

        // Création des données géographiques
        await prisma.cityGeoData.create({
          data: {
            cityCodeINSEE: city.code,
            centreLat: geoCity.centre?.coordinates[1] ?? null,
            centreLon: geoCity.centre?.coordinates[0] ?? null,
            mairieLat: geoCity.mairie?.coordinates[1] ?? null,
            mairieLon: geoCity.mairie?.coordinates[0] ?? null,
            contour: geoCity.contour ? JSON.stringify(geoCity.contour) : null,
            bbox: geoCity.bbox ? JSON.stringify(geoCity.bbox) : null,
          },
        });

        geoDataCount++;
        if (geoDataCount % 10 === 0) {
          console.log(`  ✓ ${geoDataCount}/${cities.length} cities processed...`);
        }
      } catch (error) {
        console.error(`Error inserting geo data for ${city.nom}:`, error);
      }
    }

    // Pause pour éviter de surcharger l'API
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  console.log(`\n✅ Geo data inserted for ${geoDataCount} cities.`);

  return {
    count: cities.length,
    items: await prisma.city.findMany(),
    summary: {
      cities: cities.length,
      postalCodes: postalCodeData.length,
      geoData: geoDataCount
    }
  };
}
