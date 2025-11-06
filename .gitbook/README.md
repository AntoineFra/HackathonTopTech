# 📚 Documentation GitBook

Ce dossier contient la configuration et les ressources pour la documentation GitBook de 06 Analytics.

## 🚀 Démarrage rapide

### Installation de GitBook CLI

```bash
# Installer GitBook CLI globalement
npm install -g gitbook-cli

# Ou utiliser le script npm
pnpm docs:install
```

### Initialiser GitBook

```bash
# Initialiser la structure GitBook
pnpm docs:init
```

### Servir la documentation localement

```bash
# Démarrer le serveur de documentation
pnpm docs:serve
```

La documentation sera accessible sur http://localhost:4000

### Builder la documentation

```bash
# Générer les fichiers HTML statiques
pnpm docs:build
```

Les fichiers générés seront dans le dossier `_book/`

### Générer un PDF

```bash
# Générer un PDF de toute la documentation
pnpm docs:pdf
```

Le PDF sera créé dans `docs/paca-analytics-documentation.pdf`

## 📁 Structure

```
.gitbook/
├── assets/           # Images et ressources
└── styles/
    └── website.css   # Styles personnalisés

book.json             # Configuration GitBook
SUMMARY.md           # Table des matières
README.md            # Page d'accueil
api-reference/       # Documentation API
docs/                # Documentation technique
```

## 🎨 Personnalisation

### Thème et styles

Les styles personnalisés sont dans `.gitbook/styles/website.css`. Vous pouvez modifier :

- Les couleurs de la marque
- La typographie
- Les styles de code
- Les composants personnalisés

### Plugins

Les plugins GitBook sont configurés dans `book.json`. Plugins actuels :

- `github` : Lien vers le repo GitHub
- `edit-link` : Bouton "Éditer cette page"
- `search` : Recherche dans la documentation
- `prism` : Coloration syntaxique du code
- `copy-code-button` : Bouton copier pour les blocs de code
- `expandable-chapters` : Chapitres pliables
- `back-to-top-button` : Bouton retour en haut

## 📝 Écrire de la documentation

### Format Markdown

Tous les fichiers de documentation utilisent Markdown :

```markdown
# Titre H1

## Titre H2

### Titre H3

**Gras** et _italique_

- Liste
- À puces

1. Liste
2. Numérotée

[Lien](URL)

![Image](chemin/vers/image.png)

\`\`\`javascript
// Bloc de code
const exemple = "code";
\`\`\`
```

### Ajouter une nouvelle page

1. Créer le fichier Markdown dans le bon dossier
2. Ajouter une entrée dans `SUMMARY.md`
3. Reconstruire la documentation

### Callouts et astuces

Utilisez des blockquotes pour les callouts :

```markdown
> 💡 **Astuce** : Ceci est une astuce utile
```

## 🔗 Liens utiles

- [Documentation GitBook](https://docs.gitbook.com/)
- [Markdown Guide](https://www.markdownguide.org/)
- [GitBook Plugins](https://plugins.gitbook.com/)

## 🚀 Déploiement

### GitBook.com (Recommandé)

1. Créer un compte sur [gitbook.com](https://www.gitbook.com)
2. Connecter votre repository GitHub
3. GitBook détectera automatiquement `.gitbook.yaml`
4. La documentation sera déployée automatiquement

### GitHub Pages

```bash
# Builder la documentation
pnpm docs:build

# Déployer sur GitHub Pages
git subtree push --prefix _book origin gh-pages
```

### Netlify / Vercel

1. Connecter votre repo
2. Configurer le build :
    - Build command : `npm run docs:build`
    - Publish directory : `_book`
3. Déployer

## 🔄 Workflow

### Mise à jour de la documentation

1. Éditer les fichiers Markdown
2. Tester localement avec `pnpm docs:serve`
3. Commit et push vers GitHub
4. La documentation sera automatiquement mise à jour

### Structure recommandée

```
docs/
├── getting-started/
│   ├── installation.md
│   ├── quickstart.md
│   └── configuration.md
│
├── guides/
│   ├── feature-1.md
│   └── feature-2.md
│
├── api-reference/
│   ├── backend.md
│   └── frontend.md
│
└── advanced/
    ├── architecture.md
    └── deployment.md
```

## 🎯 Bonnes pratiques

1. **Toujours tester localement** avant de commit
2. **Utiliser des liens relatifs** pour la navigation interne
3. **Ajouter des captures d'écran** dans `.gitbook/assets/`
4. **Maintenir SUMMARY.md à jour** avec la structure
5. **Utiliser des titres descriptifs** pour le SEO
6. **Ajouter des exemples de code** quand approprié
7. **Inclure des callouts** pour les informations importantes

## 🐛 Dépannage

### GitBook CLI ne se lance pas

```bash
# Réinstaller GitBook CLI
npm uninstall -g gitbook-cli
npm install -g gitbook-cli
gitbook -V
```

### Erreur de build

```bash
# Nettoyer et reconstruire
pnpm docs:clean
rm -rf node_modules
pnpm install
pnpm docs:build
```

### Les plugins ne se chargent pas

```bash
# Installer les plugins manuellement
cd _book
gitbook install
```

## 📧 Support

Pour toute question sur la documentation :

- Ouvrir une issue sur GitHub
- Contacter l'équipe de développement

---

**Dernière mise à jour** : Novembre 2025
**Mainteneur** : CCI Nice Côte d'Azur
