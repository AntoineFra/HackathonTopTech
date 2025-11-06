# 📦 GitBook Example Page

> 💡 **Tip**: This is an example page showing GitBook features and formatting options.

## Features Showcase

### Text Formatting

This is **bold text**, this is _italic text_, and this is **_bold and italic_**.

You can also use ~~strikethrough~~ and `inline code`.

### Callouts

> ℹ️ **Info**: Important information for users

> ✅ **Success**: Operation completed successfully

> ⚠️ **Warning**: Be careful with this action

> ❌ **Danger**: This is a critical warning

### Code Blocks

#### JavaScript Example

```javascript
// Example: Fetch cities from API
async function getCities() {
    const response = await fetch("http://localhost:3000/api/trois-d/cities");
    const cities = await response.json();
    return cities;
}

getCities().then((cities) => {
    console.log("Total cities:", cities.length);
});
```

#### TypeScript Example

```typescript
interface City {
    codeINSEE: string;
    name: string;
    population: number;
    geoData?: CityGeoData;
}

const city: City = {
    codeINSEE: "06088",
    name: "Nice",
    population: 340017,
};
```

#### Bash Example

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f backend

# Restart a service
docker compose restart frontend
```

### Lists

#### Unordered List

- Frontend (Next.js 16)
    - React 19
    - TypeScript
    - Tailwind CSS
- Backend (Express 5)
    - Prisma ORM
    - SQLite
    - TypeScript
- AI Engine
    - Ollama
    - Mistral model

#### Ordered List

1. Install Docker and Docker Compose
2. Clone the repository
3. Configure environment variables
4. Start services with `docker compose up`
5. Access the application at http://localhost:8080

#### Task List

- [x] Setup monorepo structure
- [x] Implement frontend UI
- [x] Create backend API
- [x] Integrate Ollama AI
- [x] Add 3D map visualization
- [ ] Deploy to production
- [ ] Add user authentication

### Tables

| Service       | Port  | Description         |
| ------------- | ----- | ------------------- |
| Frontend      | 8080  | Next.js application |
| Backend       | 3000  | Express API         |
| Ollama        | 11434 | AI model server     |
| Prisma Studio | 5555  | Database UI         |

### Links

- [External Link](https://nextjs.org)
- [Internal Link](../docs/QUICKSTART.md)
- [Anchor Link](#features-showcase)

### Images

```markdown
![Alt text](.gitbook/assets/screenshot.png)
```

### Emojis

🚀 🎯 💡 ⚠️ ✅ ❌ 🔧 📊 🗺️ 🤖 📦 🏠 🎨 📝 🔒 🌐

### Horizontal Rule

---

### Blockquotes

> This is a simple blockquote.
>
> It can span multiple paragraphs.

### Nested Blockquotes

> Level 1
>
> > Level 2
> >
> > > Level 3

### Definition Lists

<dl>
<dt>Monorepo</dt>
<dd>A single repository containing multiple projects</dd>

<dt>Docker Compose</dt>
<dd>Tool for defining and running multi-container Docker applications</dd>

<dt>Prisma</dt>
<dd>Next-generation ORM for Node.js and TypeScript</dd>
</dl>

### Keyboard Shortcuts

Press <kbd>Ctrl</kbd> + <kbd>C</kbd> to copy.

Press <kbd>⌘</kbd> + <kbd>S</kbd> to save (macOS).

### Badges

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-Proprietary-red)
![Status](https://img.shields.io/badge/status-active-green)

### Footnotes

Here's a sentence with a footnote[^1].

[^1]: This is the footnote content.

### Math (if supported)

Inline math: $E = mc^2$

Block math:

$$
f(x) = \int_{-\infty}^\infty \hat f(\xi) e^{2 \pi i \xi x} d\xi
$$

### HTML (if needed)

<div style="background: #eff6ff; padding: 1rem; border-radius: 8px; border-left: 4px solid #3b82f6;">
  <strong>Custom HTML Block</strong>
  <p>You can use HTML for advanced formatting if needed.</p>
</div>

## Best Practices

### Documentation Writing

1. **Be Clear and Concise**
    - Use simple language
    - Avoid jargon when possible
    - Provide examples

2. **Structure Content**
    - Use headings hierarchy
    - Break content into sections
    - Add table of contents for long pages

3. **Visual Elements**
    - Add screenshots
    - Use diagrams
    - Include code examples

4. **Keep Updated**
    - Review regularly
    - Update with new features
    - Remove obsolete information

### Code Examples

Always include:

- Clear comments
- Error handling
- Complete examples that work
- Expected output

### Navigation

- Link related pages
- Use breadcrumbs
- Provide "next steps"
- Add "see also" sections

## Next Steps

- [Quick Start Guide](../docs/QUICKSTART.md)
- [API Reference](../api-reference/backend.md)
- [Deployment Guide](../docs/PROJECT_README.md)

---

**Need help?** Check the [GitBook Documentation](https://docs.gitbook.com/) or open an issue on GitHub.
