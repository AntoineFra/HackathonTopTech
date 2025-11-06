# Projet Hackabacktek

## Description

Backend TypeScript pour le projet Hackabacktek. Utilise Express, Prisma (SQLite par défaut dans le dépôt) et quelques services pour importer/dumper des données. Le projet expose des routes centralisées dans `routes/` et contient des contrôleurs et services dans `controllers/` et `services/`.

Ce README explique comment installer, configurer et lancer l'application, et donne des conseils pour résoudre le problème des logs qui ne sont pas créés.

## Prérequis

- Node.js (>= 16, recommandé 18+)
- pnpm (recommandé) ou npm/yarn
- Git
- SQLite (si vous gardez la configuration par défaut)

## Installation

Se placer dans le dossier du projet puis installer les dépendances :

```bash
git clone <repo-url> hackabacktek
cd hackabacktek
pnpm install
```

Si vous utilisez npm :

```bash
npm install
```

## Configuration des variables d'environnement

Copiez l'exemple et adaptez-le :

```bash
cp .env.example .env
```

Les variables d'environnement importantes (fournies dans `.env.example`) :

- DATABASE_URL : URL de connexion à la base de données (ex: SQLite `file:./prisma/dev.db`).
- PORT : port d'écoute (ex: 3000)
- NODE_ENV : `development` / `production`.
- LEGAL_UNIT_URL : URL externe utilisée par certains services (ex: API data.gouv.fr).
- LOG_TO_FILE : `true` pour enregistrer les logs dans un fichier (le code par défaut utilise la sortie console).
- LOG_FILE : chemin du fichier de log (ex: `logs/access.log`).

## Prisma (base de données)

Le projet utilise Prisma avec le schéma dans `prisma/schema.prisma`.

Générer le client Prisma :

```bash
npx prisma generate
```

Appliquer les migrations en développement :

```bash
npx prisma migrate dev --name init
```

NB : il existe aussi une commande dans `package.json` : `pnpm run update` qui exécute `pnpm prisma db push` (vérifier si vous préférez `migrate dev` selon votre flux).

## Scripts utiles (voir `package.json`)

- `pnpm run dev` : lance le serveur en mode développement (utilise `tsx watch server.ts`).
- `pnpm start` : démarre le serveur (exécute `npx tsx server.ts`).
- `pnpm run format` : formate le code avec Prettier.
- `pnpm run update` : pousse le schéma Prisma / met à jour la base (`pnpm prisma db push`).

Exemples :

```bash
pnpm run dev
# ou
pnpm start
```

## Comportement des logs

Par défaut le serveur initialise Morgan en mode `dev` : les logs vont vers la console et ne sont pas automatiquement écrits dans `logs/access.log`.

Si vous ne voyez aucun fichier de log créé :

- c'est attendu tant que la configuration de Morgan est en mode console (dev).
- pour écrire les logs dans un fichier, il faut modifier `server.ts` pour ajouter un stream d'écriture vers `logs/access.log`. Exemple (à appliquer manuellement) :

```text
// Exemple à ajouter/modifier dans `server.ts` (TypeScript ESM)
import fs from 'fs';
import path from 'path';
import morgan from 'morgan';

// s'assurer que le dossier existe au démarrage (server.ts utilise déjà fs/promises pour tmp et data)
await fs.promises.mkdir(path.join(process.cwd(), 'logs'), { recursive: true });

const accessLogStream = fs.createWriteStream(path.join(process.cwd(), process.env.LOG_FILE || 'logs/access.log'), { flags: 'a' });
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev', { stream: accessLogStream }));
```

Si vous ne voulez pas modifier le code, vous devez rediriger la sortie standard vers un fichier lors du lancement :

```bash
pnpm start > logs/access.log 2>&1
```

Assurez-vous que le dossier `logs/` existe et que l'utilisateur qui lance le serveur a les permissions d'écriture :

```bash
ls -la logs
mkdir -p logs
chmod 755 logs
```

## Dépannage : logs non créés

- Vérifier la console : lancez `pnpm run dev` et observez la sortie. Morgan en mode `dev` affiche les requêtes dans la console.
- Si vous attendez un fichier `logs/access.log`, forcez la création via la solution ci-dessus (modif de `server.ts` ou redirection STDOUT).
- Vérifier les permissions du répertoire `logs/`.
- Vérifier que l'application est bien démarrée et qu'il y a un trafic HTTP (les logs n'apparaîtront que lorsque des requêtes arrivent).

## Lancer l'application (récapitulatif)

1. Installer les dépendances

```bash
pnpm install
```

2. Copier/configurer les variables d'environnement

```bash
cp .env.example .env
# éditer .env
```

3. Générer Prisma et appliquer les migrations (si besoin)

```bash
npx prisma generate
npx prisma migrate dev --name init
```

4. Lancer en développement

```bash
pnpm run dev
```

ou lancer en production simple

```bash
pnpm start
```

Pour écrire les logs dans un fichier (sans modifier le code) :

```bash
pnpm start > logs/access.log 2>&1
```

## Fichiers et ressources utiles

- Serveur : `server.ts` (initialise Prisma, dossiers temporaires, et routes)
- Routes : `routes/` (fichier central `routes.ts` et fichiers séparés)
- Contrôleurs : `controllers/`
- Services : `services/`
- Logs : `logs/` (ex: `logs/access.log`)
- Prisma : `prisma/schema.prisma` et fichier SQLite `prisma/dev.db`
- Documents projet : `resources/` (PDFs fournis pour le cahier des charges et carnet de bord)

## Remarques finales

- Le comportement actuel (pas de fichier `logs/access.log`) est normal tant que Morgan est configuré pour la console. Suivez la section « Comportement des logs » pour activer l'écriture sur fichier.
- Si vous souhaitez que j'active l'écriture de logs dans le code (modification de `server.ts`) je peux proposer un patch et l'appliquer.
