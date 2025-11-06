# 🚀 GitHub Pages Deployment Setup

Your GitBook documentation is now configured to deploy automatically to GitHub Pages!

## ✅ What's Been Configured

- ✅ GitHub Actions workflow created (`.github/workflows/deploy-docs.yml`)
- ✅ Automatic deployment on push to `main` branch
- ✅ Uses pnpm for package management
- ✅ Builds GitBook documentation
- ✅ Deploys to GitHub Pages

## 📋 Setup Steps (Complete These)

### Step 1: Enable GitHub Pages

1. Go to your repository: https://github.com/AntoineFra/HackathonTopTech
2. Click **Settings** (top menu)
3. Scroll down to **Pages** (left sidebar)
4. Under "Build and deployment":
    - **Source**: Select "GitHub Actions"
    - (Do NOT select "Deploy from a branch")
5. Click **Save**

### Step 2: Push Your Changes

```bash
# Stage all GitBook files
git add .

# Commit
git commit -m "docs: add GitBook documentation with GitHub Pages deployment"

# Push to main
git push origin main
```

### Step 3: Monitor Deployment

1. Go to **Actions** tab in your repository
2. You'll see the workflow "Deploy GitBook Documentation to GitHub Pages" running
3. Wait for it to complete (usually 2-3 minutes)
4. Once complete, a green checkmark will appear

### Step 4: Access Your Documentation

Your documentation will be available at:

```
https://antoinefra.github.io/HackathonTopTech/
```

## 🔄 Automatic Updates

The documentation will automatically rebuild and redeploy when you:

- Push changes to any `.md` file
- Update `SUMMARY.md`
- Modify files in `docs/` or `api-reference/`
- Change `book.json` configuration
- Edit `.gitbook/` files

## 🎯 Workflow Triggers

The workflow runs on:

- ✅ Push to `main` branch (when docs change)
- ✅ Manual trigger (via Actions tab)

It only builds when these files change:

- `docs/**`
- `api-reference/**`
- `.gitbook/**`
- `*.md` files
- `SUMMARY.md`
- `book.json`

## 📊 Workflow Steps

1. **Checkout** - Downloads your repository
2. **Setup pnpm** - Installs pnpm 10
3. **Setup Node.js** - Installs Node.js 20 with pnpm cache
4. **Install GitBook CLI** - Installs gitbook-cli globally
5. **Install Plugins** - Installs GitBook plugins from book.json
6. **Build** - Builds documentation to `_book/` folder
7. **Create .nojekyll** - Prevents Jekyll processing
8. **Upload** - Prepares artifact for deployment
9. **Deploy** - Deploys to GitHub Pages

## 🔧 Manual Deployment

If you want to trigger deployment manually:

1. Go to **Actions** tab
2. Select "Deploy GitBook Documentation to GitHub Pages"
3. Click **Run workflow**
4. Select `main` branch
5. Click **Run workflow**

## 🌐 Custom Domain (Optional)

Want to use your own domain? Follow these steps:

### 1. Update CNAME in Workflow

Edit `.github/workflows/deploy-docs.yml`, line 48:

```yaml
- name: 📝 Create .nojekyll file
  run: |
      touch _book/.nojekyll
      echo "docs.yourcompany.com" > _book/CNAME  # Change this
```

### 2. Configure DNS

Add these DNS records at your domain provider:

**For apex domain (yourcompany.com):**

```
A     @    185.199.108.153
A     @    185.199.109.153
A     @    185.199.110.153
A     @    185.199.111.153
```

**For subdomain (docs.yourcompany.com):**

```
CNAME docs antoinefra.github.io
```

### 3. Configure in GitHub

1. Go to Settings → Pages
2. Under "Custom domain", enter: `docs.yourcompany.com`
3. Check "Enforce HTTPS"
4. Wait for DNS check to pass

## 🐛 Troubleshooting

### Build Fails

**Error: "gitbook: command not found"**

The workflow installs GitBook CLI automatically. If it fails:

1. Check the Actions log
2. Ensure Node.js 20 is being used
3. Try manual trigger

**Error: "Plugin not found"**

Some plugins might not install correctly:

1. Remove problematic plugins from `book.json`
2. Test build locally first
3. Push updated configuration

### Deployment Fails

**Error: "Pages deployment failed"**

1. Ensure GitHub Pages is enabled
2. Check that source is set to "GitHub Actions"
3. Verify workflow has Pages permissions

**Error: "CNAME already taken"**

1. Remove the CNAME line from workflow
2. Or change to a different domain
3. Redeploy

### 404 Page Not Found

If you get 404 after deployment:

1. Wait 2-3 minutes for propagation
2. Try accessing: `https://antoinefra.github.io/HackathonTopTech/index.html`
3. Clear browser cache
4. Check Actions log for errors

### Broken Links

If internal links don't work:

1. Use relative paths: `[Link](../docs/file.md)`
2. Not absolute: `[Link](/docs/file.md)`
3. Rebuild and redeploy

## 📝 Local Testing

Before pushing, test the build locally:

```bash
# Install GitBook CLI (if not already installed)
pnpm docs:install

# Build documentation
pnpm docs:build

# Serve locally to test
cd _book
python3 -m http.server 8000
```

Open http://localhost:8000 to preview.

## 🔒 Security

The workflow uses:

- `GITHUB_TOKEN` (automatic, no setup needed)
- Minimal permissions (read contents, write pages)
- Only runs on specific file changes

## 📊 Monitoring

### View Deployment Status

Badge for README (optional):

```markdown
[![Docs](https://github.com/AntoineFra/HackathonTopTech/actions/workflows/deploy-docs.yml/badge.svg)](https://github.com/AntoineFra/HackathonTopTech/actions/workflows/deploy-docs.yml)
```

### Check Build Times

Typical build times:

- First build: ~3-4 minutes
- Subsequent builds: ~2-3 minutes

## 🎨 Customization

### Change Build Trigger

Edit `.github/workflows/deploy-docs.yml`:

```yaml
on:
    push:
        branches: [main, develop] # Add more branches
        paths:
            - "docs/**"
            # Add more paths
```

### Add Build Steps

Add custom steps before deployment:

```yaml
- name: 🧪 Run Tests
  run: |
      pnpm test:docs

- name: 📝 Generate Changelog
  run: |
      pnpm generate:changelog
```

## 📚 Resources

- [GitHub Pages Docs](https://docs.github.com/pages)
- [GitHub Actions Docs](https://docs.github.com/actions)
- [GitBook Documentation](https://docs.gitbook.com/)

## ✅ Checklist

Before pushing, ensure:

- [ ] All documentation files are created
- [ ] SUMMARY.md is up to date
- [ ] book.json is configured
- [ ] Links are relative (not absolute)
- [ ] Images are in `.gitbook/assets/`
- [ ] No sensitive information in docs
- [ ] Local build works (`pnpm docs:build`)

## 🚀 Ready to Deploy!

Run these commands to deploy:

```bash
git add .
git commit -m "docs: add GitBook documentation with GitHub Pages deployment"
git push origin main
```

Then:

1. Go to Settings → Pages
2. Set Source to "GitHub Actions"
3. Wait for deployment
4. Access at: https://antoinefra.github.io/HackathonTopTech/

---

**Need help?** Check the troubleshooting section or open an issue.

**Deployment URL**: Will be available at `https://antoinefra.github.io/HackathonTopTech/` once deployed.
