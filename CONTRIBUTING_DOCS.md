# 🤝 Contributing to Documentation

Thank you for your interest in improving the PACA Analytics documentation!

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Documentation Structure](#documentation-structure)
- [Writing Guidelines](#writing-guidelines)
- [Submitting Changes](#submitting-changes)
- [Review Process](#review-process)

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- GitBook CLI installed (`npm install -g gitbook-cli`)
- Basic knowledge of Markdown
- Git installed

### Setup

```bash
# Clone the repository
git clone https://github.com/AntoineFra/HackathonTopTech.git
cd HackathonTopTech

# Install dependencies
pnpm install

# Install GitBook CLI
pnpm docs:install

# Serve documentation locally
pnpm docs:serve
```

## 📁 Documentation Structure

```
HackathonTopTech/
├── .gitbook/
│   ├── assets/         # Images, diagrams, screenshots
│   ├── styles/         # Custom CSS
│   ├── README.md       # GitBook documentation guide
│   └── EXAMPLE.md      # Example page with all features
│
├── api-reference/
│   ├── backend.md      # Backend API documentation
│   └── frontend.md     # Frontend components documentation
│
├── docs/
│   ├── getting-started/
│   ├── guides/
│   ├── advanced/
│   └── ...
│
├── SUMMARY.md          # Table of contents (IMPORTANT!)
├── README.md           # Main documentation homepage
├── book.json           # GitBook configuration
└── .gitbook.yaml       # GitBook integration config
```

## ✍️ Writing Guidelines

### General Principles

1. **Clarity First**: Write for beginners, clarify for experts
2. **Be Concise**: Remove unnecessary words
3. **Show, Don't Just Tell**: Include examples and code snippets
4. **Stay Consistent**: Follow established patterns
5. **Test Everything**: Verify all code examples work

### Markdown Style

#### Headings

```markdown
# H1 - Page Title (Only one per page)

## H2 - Main Section

### H3 - Subsection

#### H4 - Minor subsection
```

#### Text Formatting

```markdown
**Bold** for emphasis
_Italic_ for subtle emphasis
`inline code` for code references
[Links](url) for navigation
```

#### Code Blocks

Always specify the language:

````markdown
```typescript
const example: string = "TypeScript code";
```

```bash
docker compose up -d
```
````

#### Lists

```markdown
- Unordered list item
- Another item
    - Nested item

1. Ordered list item
2. Another item
    1. Nested item
```

#### Tables

```markdown
| Header 1 | Header 2 | Header 3 |
| -------- | -------- | -------- |
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |
```

#### Callouts

```markdown
> 💡 **Tip**: Helpful advice

> ℹ️ **Info**: Important information

> ⚠️ **Warning**: Be careful

> ❌ **Danger**: Critical warning
```

### Content Guidelines

#### Code Examples

Always include:

```typescript
// ✅ Good: Complete, working example with comments
async function fetchCities(): Promise<City[]> {
    try {
        const response = await fetch("/api/trois-d/cities");
        if (!response.ok) {
            throw new Error("Failed to fetch cities");
        }
        return await response.json();
    } catch (error) {
        console.error("Error:", error);
        return [];
    }
}
```

```typescript
// ❌ Bad: Incomplete, no context
fetch("/api/cities");
```

#### Screenshots

- Use high-resolution images (2x for Retina)
- Annotate important areas
- Keep file sizes reasonable (<500KB)
- Use descriptive filenames: `map-3d-overview.png`

```markdown
![3D Map Overview](.gitbook/assets/map-3d-overview.png)
_Figure 1: 3D map showing Nice department_
```

#### API Documentation

Use consistent structure:

````markdown
### Endpoint Name

```http
GET /api/endpoint/:parameter
```
````

**Description**: Brief description of what the endpoint does.

**Parameters**:

- `parameter` (string, required): Description

**Response**:

```json
{
    "field": "value"
}
```

**Example**:

```bash
curl http://localhost:3000/api/endpoint/value
```

````

### Language and Tone

- **Use second person** ("you" instead of "the user")
- **Active voice** preferred over passive
- **Present tense** for current features
- **Future tense** for planned features
- **Be friendly but professional**

#### Examples

✅ **Good**:
```markdown
You can start the server by running `pnpm dev`.
````

❌ **Bad**:

```markdown
The server can be started by the developer using the command `pnpm dev`.
```

## 🔄 Submitting Changes

### Step 1: Create a Branch

```bash
git checkout -b docs/improve-api-reference
```

Branch naming:

- `docs/add-new-feature` - New documentation
- `docs/fix-typo` - Fix errors
- `docs/update-api` - Update existing docs

### Step 2: Make Changes

1. Edit or create Markdown files
2. Add images to `.gitbook/assets/` if needed
3. Update `SUMMARY.md` if adding new pages
4. Test locally with `pnpm docs:serve`

### Step 3: Verify Changes

```bash
# Check locally
pnpm docs:serve

# Build to ensure no errors
pnpm docs:build
```

### Step 4: Commit

```bash
git add .
git commit -m "docs: improve API reference with more examples"
```

Commit message format:

- `docs: add new page about X`
- `docs: fix typos in Y`
- `docs: update screenshots for Z`
- `docs: improve clarity of W`

### Step 5: Push and Create PR

```bash
git push origin docs/improve-api-reference
```

Create a Pull Request on GitHub with:

- Clear title
- Description of changes
- Screenshots if visual changes
- Link to related issues

## 👀 Review Process

### What We Look For

1. **Accuracy**: Is the information correct?
2. **Clarity**: Is it easy to understand?
3. **Completeness**: Are examples working?
4. **Consistency**: Does it match our style?
5. **Grammar**: Is it well-written?

### Review Checklist

- [ ] Markdown syntax is correct
- [ ] All links work
- [ ] Code examples are tested
- [ ] Images are optimized
- [ ] SUMMARY.md is updated
- [ ] No spelling/grammar errors
- [ ] Follows style guidelines
- [ ] Builds without errors

## 📝 Common Tasks

### Adding a New Page

1. Create the Markdown file in appropriate folder
2. Add entry to `SUMMARY.md`
3. Link from related pages
4. Test navigation

Example `SUMMARY.md` entry:

```markdown
## Features

- [AI Integration](docs/AI_INTEGRATION.md)
- [3D Map Guide](docs/MAP_3D_GUIDE.md)
- [Your New Feature](docs/YOUR_NEW_FEATURE.md) <!-- Add here -->
```

### Adding Images

1. Save image to `.gitbook/assets/`
2. Use descriptive name: `feature-name-screenshot.png`
3. Reference in Markdown:

```markdown
![Feature Overview](.gitbook/assets/feature-name-screenshot.png)
```

### Updating API Reference

1. Edit `api-reference/backend.md` or `api-reference/frontend.md`
2. Follow existing structure
3. Include request/response examples
4. Add error cases

### Creating Diagrams

Tools:

- [Excalidraw](https://excalidraw.com/) - Hand-drawn style
- [Draw.io](https://draw.io/) - Professional diagrams
- [Mermaid](https://mermaid.js.org/) - Code-based diagrams

Save as PNG/SVG in `.gitbook/assets/diagrams/`

## 🎯 Best Practices

### Do's

✅ Write for your audience (developers, users, admins)
✅ Use real examples from the project
✅ Keep paragraphs short (3-5 sentences)
✅ Add navigation links (previous/next)
✅ Update timestamps on major changes
✅ Test all commands and code

### Don'ts

❌ Don't use "here" as link text
❌ Don't make assumptions about user knowledge
❌ Don't use abbreviations without explanation
❌ Don't add broken links or examples
❌ Don't forget to update SUMMARY.md
❌ Don't commit large binary files

## 🆘 Getting Help

- **Questions?** Open a discussion on GitHub
- **Found a bug?** Open an issue
- **Need clarification?** Comment on PR
- **Style questions?** Check EXAMPLE.md

## 📚 Resources

- [Markdown Guide](https://www.markdownguide.org/)
- [GitBook Documentation](https://docs.gitbook.com/)
- [Google Developer Documentation Style Guide](https://developers.google.com/style)
- [Write the Docs](https://www.writethedocs.org/)

## 🙏 Thank You!

Every contribution makes PACA Analytics better for everyone. We appreciate your time and effort!

---

**Last Updated**: November 2025
**Maintained by**: CCI Nice Côte d'Azur Development Team
