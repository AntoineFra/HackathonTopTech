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

        if (
            geoCity &&
            (geoCity.centre ||
                geoCity.mairie ||
                geoCity.contour ||
                geoCity.bbox)
        ) {
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
                        contour: geoCity.contour
                            ? JSON.stringify(geoCity.contour)
                            : null,
                        bbox: geoCity.bbox
                            ? JSON.stringify(geoCity.bbox)
                            : null,
                    },
                });

                geoDataCount++;
                if (geoDataCount % 10 === 0) {
                    console.log(
                        `  ✓ ${geoDataCount}/${cities.length} cities processed...`,
                    );
                }
            } catch (error) {
                console.error(
                    `Error inserting geo data for ${city.nom}:`,
                    error,
                );
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

export async function dumpPopulationData(): Promise<DumpResult>  {
  console.log("📊 Starting population data import for department 06...");

  const XLSX = await import('xlsx');
  const filePath = path.join(process.cwd(), 'resources/base-pop-historiques-1876-2022.xlsx');

  if (!fs.existsSync(filePath)) {
    throw new Error(`Excel file not found at ${filePath}`);
  }

  // Check if data already exists
  const existingCount = await prisma.populationHistory.count();
  if (existingCount > 0) {
    console.log("Population data already exists in database. Skipping import.");
    return;
  }

  console.log("📖 Reading Excel file...");
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // Convert to JSON, starting from row 6 (skip headers)
  const data: any[] = XLSX.utils.sheet_to_json(worksheet, {
    range: 5, // Start from row 6 (0-indexed, so 5)
    defval: null
  });

  console.log(`📈 Total rows in file: ${data.length}`);

  // Filter only department 06
  const dept06Data = data.filter((row: any) => row.DEP === '06');
  console.log(`🎯 Rows for department 06: ${dept06Data.length}`);

  // Transform and prepare data for insertion
  const populationData = dept06Data.map((row: any) => ({
    codeGeo: row.CODGEO?.toString() || '',
    region: row.REG?.toString() || '',
    departement: row.DEP?.toString() || '',
    libelle: row.LIBGEO?.toString() || '',

    // Recent data (2006-2022)
    pop2022: row.PMUN2022 || null,
    pop2021: row.PMUN2021 || null,
    pop2020: row.PMUN2020 || null,
    pop2019: row.PMUN2019 || null,
    pop2018: row.PMUN2018 || null,
    pop2017: row.PMUN2017 || null,
    pop2016: row.PMUN2016 || null,
    pop2015: row.PMUN2015 || null,
    pop2014: row.PMUN2014 || null,
    pop2013: row.PMUN2013 || null,
    pop2012: row.PMUN2012 || null,
    pop2011: row.PMUN2011 || null,
    pop2010: row.PMUN2010 || null,
    pop2009: row.PMUN2009 || null,
    pop2008: row.PMUN2008 || null,
    pop2007: row.PMUN2007 || null,
    pop2006: row.PMUN2006 || null,

    // Intermediate historical data (1954-1999)
    pop1999: row.PSDC1999 || null,
    pop1990: row.PSDC1990 || null,
    pop1982: row.PSDC1982 || null,
    pop1975: row.PSDC1975 || null,
    pop1968: row.PSDC1968 || null,
    pop1962: row.PSDC1962 || null,
    pop1954: row.PTOT1954 || null,

    // Older historical data (1876-1936)
    pop1936: row.PTOT1936 || null,
    pop1931: row.PTOT1931 || null,
    pop1926: row.PTOT1926 || null,
    pop1921: row.PTOT1921 || null,
    pop1911: row.PTOT1911 || null,
    pop1906: row.PTOT1906 || null,
    pop1901: row.PTOT1901 || null,
    pop1896: row.PTOT1896 || null,
    pop1891: row.PTOT1891 || null,
    pop1886: row.PTOT1886 || null,
    pop1881: row.PTOT1881 || null,
    pop1876: row.PTOT1876 || null,
  }));

  console.log("💾 Inserting population data into database...");

  // Insert in batches to avoid potential issues with large datasets
  const batchSize = 100;
  for (let i = 0; i < populationData.length; i += batchSize) {
    const batch = populationData.slice(i, i + batchSize);
    await prisma.populationHistory.createMany({
      data: batch,
      skipDuplicates: true,
    });
    console.log(`✅ Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(populationData.length / batchSize)}`);
  }

  console.log(`\n✅ Geo data inserted for ${geoDataCount} cities.`);

const populationHistory = await prisma.populationHistory.findMany();
  return {
    count: populationHistory.length,
    items: populationHistory,
    summary: {
      populationHistory: populationHistory.length,
    }
  };
}
