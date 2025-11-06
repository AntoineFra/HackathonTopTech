-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "name" TEXT
);

-- CreateTable
CREATE TABLE "LegalUnit" (
    "siren" TEXT NOT NULL PRIMARY KEY,
    "diffusionStatus" TEXT,
    "purgedUnit" TEXT,
    "creationDate" DATETIME,
    "acronym" TEXT,
    "gender" TEXT,
    "firstName1" TEXT,
    "firstName2" TEXT,
    "firstName3" TEXT,
    "firstName4" TEXT,
    "usualFirstName" TEXT,
    "pseudonym" TEXT,
    "associationId" TEXT,
    "employeeRange" TEXT,
    "employeeYear" INTEGER,
    "lastProcessedDate" DATETIME,
    "numberOfPeriods" INTEGER,
    "companyCategory" TEXT,
    "companyCategoryYear" INTEGER,
    "startDate" DATETIME,
    "administrativeState" TEXT,
    "legalName" TEXT,
    "usageName" TEXT,
    "denomination" TEXT,
    "usualDenomination1" TEXT,
    "usualDenomination2" TEXT,
    "usualDenomination3" TEXT,
    "legalForm" TEXT,
    "mainActivity" TEXT,
    "mainActivityCode" TEXT,
    "headquarterNic" TEXT,
    "socialEconomy" TEXT,
    "missionCompany" TEXT,
    "employerStatus" TEXT
);

-- CreateTable
CREATE TABLE "City" (
    "codeINSEE" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "codeDepartement" TEXT NOT NULL,
    "siren" TEXT NOT NULL,
    "codeEpci" TEXT NOT NULL,
    "codeRegion" TEXT NOT NULL,
    "population" INTEGER NOT NULL,
    "surface" REAL,
    "zone" TEXT
);

-- CreateTable
CREATE TABLE "CityGeoData" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cityCodeINSEE" TEXT NOT NULL,
    "centreLat" REAL,
    "centreLon" REAL,
    "mairieLat" REAL,
    "mairieLon" REAL,
    "contour" TEXT,
    "bbox" TEXT,
    CONSTRAINT "CityGeoData_cityCodeINSEE_fkey" FOREIGN KEY ("cityCodeINSEE") REFERENCES "City" ("codeINSEE") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PostalCode" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "cityCodeINSEE" TEXT NOT NULL,
    CONSTRAINT "PostalCode_cityCodeINSEE_fkey" FOREIGN KEY ("cityCodeINSEE") REFERENCES "City" ("codeINSEE") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Dump" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PAS_A_JOUR',
    "lastUpdate" DATETIME
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "CityGeoData_cityCodeINSEE_key" ON "CityGeoData"("cityCodeINSEE");

-- CreateIndex
CREATE UNIQUE INDEX "Dump_type_key" ON "Dump"("type");
