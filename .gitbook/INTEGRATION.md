# 🚀 GitBook Integration with GitHub

This guide explains how to integrate your GitBook documentation with GitHub for automatic deployment.

## 📋 Prerequisites

- GitHub repository with documentation
- GitBook account (free tier available)
- Admin access to the repository

## 🔗 Integration Methods

### Method 1: GitBook.com (Recommended)

GitBook.com provides free hosting with automatic builds from GitHub.

#### Step 1: Create GitBook Account

1. Go to [gitbook.com](https://www.gitbook.com)
2. Click "Sign Up"
3. Choose "Sign up with GitHub" for easier integration
4. Authorize GitBook to access your GitHub

#### Step 2: Create a Space

1. Click "New Space"
2. Select "Import from GitHub"
3. Choose your repository: `AntoineFra/HackathonTopTech`
4. Select branch: `main`
5. Click "Import"

#### Step 3: Configure

GitBook will automatically detect:

- `.gitbook.yaml` configuration
- `SUMMARY.md` for navigation
- All Markdown files

Your documentation will be available at:

```
https://your-username.gitbook.io/paca-analytics
```

#### Step 4: Auto-sync

Every push to `main` branch will automatically update the documentation.

### Method 2: GitHub Pages

Host documentation directly on GitHub Pages.

#### Step 1: Build Locally

```bash
# Install GitBook CLI
npm install -g gitbook-cli

# Build documentation
pnpm docs:build
```

This creates a `_book/` folder with static HTML.

#### Step 2: Deploy to GitHub Pages

**Option A: Using gh-pages branch**

```bash
# Install gh-pages package
npm install -g gh-pages

# Deploy
gh-pages -d _book
```

**Option B: Using GitHub Actions**

Create `.github/workflows/deploy-docs.yml`:

```yaml
name: Deploy Documentation

on:
    push:
        branches: [main]
        paths:
            - "docs/**"
            - "*.md"
            - "SUMMARY.md"
            - "book.json"

jobs:
    deploy:
        runs-on: ubuntu-latest

        steps:
            - name: Checkout
              uses: actions/checkout@v3

            - name: Setup Node.js
              uses: actions/setup-node@v3
              with:
                  node-version: "20"

            - name: Install GitBook CLI
              run: npm install -g gitbook-cli

            - name: Install GitBook Plugins
              run: gitbook install

            - name: Build Documentation
              run: gitbook build

            - name: Deploy to GitHub Pages
              uses: peaceiris/actions-gh-pages@v3
              with:
                  github_token: ${{ secrets.GITHUB_TOKEN }}
                  publish_dir: ./_book
```

#### Step 3: Enable GitHub Pages

1. Go to repository Settings
2. Navigate to "Pages"
3. Select source: "gh-pages" branch
4. Click "Save"

Documentation will be available at:

```
https://antoinefra.github.io/HackathonTopTech
```

### Method 3: Netlify

Deploy documentation on Netlify with automatic builds.

#### Step 1: Connect Repository

1. Go to [netlify.com](https://www.netlify.com)
2. Click "New site from Git"
3. Choose GitHub
4. Select repository: `AntoineFra/HackathonTopTech`

#### Step 2: Configure Build

- **Branch to deploy**: `main`
- **Build command**: `npm run docs:build`
- **Publish directory**: `_book`

#### Step 3: Deploy

Click "Deploy site" - automatic builds on every push!

Custom domain available at:

```
https://paca-analytics.netlify.app
```

### Method 4: Vercel

Similar to Netlify, optimized for Next.js projects.

#### Step 1: Import Project

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import from GitHub
4. Select repository

#### Step 2: Configure

```json
{
    "buildCommand": "npm run docs:build",
    "outputDirectory": "_book",
    "installCommand": "npm install -g gitbook-cli && npm install"
}
```

#### Step 3: Deploy

Automatic deployment on push to main branch.

## ⚙️ Configuration Files

### .gitbook.yaml

Already configured in your project:

```yaml
root: ./

structure:
    readme: README.md
    summary: SUMMARY.md

redirects:
    previous/page: new-folder/page.md
```

### book.json

Contains plugins and configuration:

```json
{
    "title": "06 Analytics Platform",
    "description": "Documentation complète",
    "plugins": ["github", "edit-link", "search", "prism"],
    "pluginsConfig": {
        "github": {
            "url": "https://github.com/AntoineFra/HackathonTopTech"
        }
    }
}
```

## 🔄 Automatic Updates

### GitBook.com

- ✅ Automatic on every push
- ✅ No configuration needed
- ✅ Preview for pull requests
- ✅ Custom domain support

### GitHub Actions

- ✅ Runs on every push
- ✅ Fully customizable
- ✅ Free for public repos
- ✅ Can trigger on specific paths

### Netlify/Vercel

- ✅ Deploy previews for PRs
- ✅ Custom domains
- ✅ Fast CDN
- ✅ HTTPS by default

## 📝 Workflow

### Making Updates

1. **Edit Documentation**

    ```bash
    # Create branch
    git checkout -b docs/update-api-reference

    # Edit files
    vim docs/API_GUIDE.md

    # Test locally
    pnpm docs:serve
    ```

2. **Commit and Push**

    ```bash
    git add .
    git commit -m "docs: update API reference"
    git push origin docs/update-api-reference
    ```

3. **Create Pull Request**
    - GitHub will show preview (if configured)
    - Review changes
    - Merge to main

4. **Automatic Deployment**
    - GitBook/Netlify/Vercel automatically deploys
    - Documentation updated in ~2 minutes

## 🎯 Best Practices

### Branch Protection

Protect `main` branch:

- Require pull request reviews
- Run documentation build checks
- Require status checks to pass

### Preview Deployments

Enable preview deployments for PRs:

- Review changes before merging
- Test links and navigation
- Verify images load correctly

### Versioning

Create version tags for major releases:

```bash
git tag -a v1.0.0 -m "Version 1.0.0 documentation"
git push origin v1.0.0
```

GitBook can host multiple versions!

## 🔍 SEO Optimization

### Add metadata to book.json

```json
{
    "title": "06 Analytics Platform",
    "description": "Documentation complète de la plateforme d'analyse territoriale",
    "author": "CCI Nice Côte d'Azur",
    "language": "fr",
    "links": {
        "sidebar": {
            "Website": "https://paca-analytics.com"
        }
    }
}
```

### Add robots.txt

Create `robots.txt` in root:

```
User-agent: *
Allow: /

Sitemap: https://your-docs-url.com/sitemap.xml
```

### Google Analytics

Add to `.gitbook/styles/website.css`:

```html
<script
    async
    src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
></script>
```

## 🐛 Troubleshooting

### Build Fails

```bash
# Clear cache
rm -rf _book node_modules
npm cache clean --force

# Reinstall
npm install -g gitbook-cli
gitbook install

# Try build again
pnpm docs:build
```

### Plugins Don't Load

```bash
# Install plugins manually
cd _book
gitbook install
```

### Links Break

- Use relative links: `[Link](../docs/file.md)`
- Not absolute: `[Link](/docs/file.md)`
- Test all links before merging

### Images Don't Load

- Check file paths are correct
- Use `.gitbook/assets/` folder
- Commit images to repository
- Use lowercase filenames

## 📊 Analytics

### Track Documentation Usage

#### GitBook Analytics (Built-in)

- Page views
- Popular pages
- Search queries
- User locations

#### Google Analytics

Add tracking in book.json:

```json
{
    "plugins": ["ga"],
    "pluginsConfig": {
        "ga": {
            "token": "UA-XXXX-Y"
        }
    }
}
```

#### Custom Analytics

Use Plausible, Fathom, or similar:

```html
<!-- In .gitbook/styles/website.css -->
<script
    defer
    data-domain="yourdomain.com"
    src="https://plausible.io/js/script.js"
></script>
```

## 🔐 Access Control

### Public Documentation

Free and open to everyone (current setup)

### Private Documentation (GitBook Pro)

- Restrict access by email
- Require authentication
- Team collaboration features

### Password Protection (Netlify)

Add to `netlify.toml`:

```toml
[[redirects]]
  from = "/*"
  to = "/.netlify/functions/auth"
  status = 200
  conditions = {Role = ["visitor"]}
  force = true

[context.production.environment]
  SITE_PASSWORD = "your_password"
```

## 📞 Support

### GitBook Support

- [GitBook Help Center](https://docs.gitbook.com)
- Community Forum
- Email support (Pro plans)

### Issues

Report documentation issues:

```
https://github.com/AntoineFra/HackathonTopTech/issues
```

## 🎉 Next Steps

1. ✅ Choose deployment method
2. ✅ Configure automatic builds
3. ✅ Set up custom domain (optional)
4. ✅ Enable analytics
5. ✅ Share documentation URL with team

---

**Recommended Setup**: GitBook.com for ease of use and features!

**Alternative**: GitHub Pages with GitHub Actions for full control.

**Production**: Consider Netlify/Vercel for enterprise features.
