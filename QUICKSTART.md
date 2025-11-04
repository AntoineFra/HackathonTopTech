# 🚀 Quick Start - Territory 06 Data Portal

## Start Development (2 minutes)

```bash
cd /home/hades/HackathonTopTech
pnpm install
pnpm dev
```

Then open: **http://localhost:3000**

---

## Connect AI Service (10 minutes)

### 1. Get API Key
- OpenAI: https://platform.openai.com/api-keys
- Anthropic: https://console.anthropic.com/

### 2. Add to Environment
```bash
# Create .env.local
echo "OPENAI_API_KEY=your-key-here" > .env.local
```

### 3. Update lib/ai-service.ts

Replace line ~15 in `queryAI` function with:

```typescript
// Add at top of file
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// In queryAI function:
const completion = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [
    {
      role: "system",
      content: "You answer questions about Nice Côte d'Azur territory data..."
    },
    {
      role: "user",
      content: question
    }
  ]
});

const answer = completion.choices[0].message.content;
```

### 4. Install OpenAI SDK
```bash
pnpm add openai
```

---

## Test Queries

Try these in the UI:
- "What is the population of Nice?"
- "Show me employment statistics"
- "Tourism data for the region"

---

## Project Structure

```
📁 app/
  └── page.tsx              ← Main page
  └── api/query/route.ts    ← API endpoint

📁 components/
  └── query-interface.tsx   ← Search box
  └── ai-response-display.tsx
  └── indicator-card.tsx
  └── category-grid.tsx

📁 lib/
  └── ai-service.ts         ← 🎯 EDIT THIS
  └── sample-data.ts        ← Test data
  └── constants.ts

📁 types/
  └── index.ts              ← Type definitions
```

---

## Key Files to Edit

| Priority | File | What to do |
|----------|------|------------|
| 🔴 HIGH | `lib/ai-service.ts` | Add AI integration |
| 🟡 MED | `.env.local` | Add API keys |
| 🟢 LOW | `lib/sample-data.ts` | Update test data |

---

## Commands

```bash
# Development
pnpm dev          # Start dev server
pnpm build        # Check for errors
pnpm start        # Production server

# Testing
pnpm lint         # Check code
pnpm type-check   # TypeScript check
```

---

## Common Issues

**"Module not found"**: Run `pnpm install`

**"API key not found"**: Check `.env.local` exists

**"Build errors"**: Run `pnpm build` to see details

---

## Resources

- 📖 Full guide: `AI_INTEGRATION.md`
- 📋 Summary: `HACKATHON_SUMMARY.md`
- 🔧 Setup: `PROJECT_README.md`

---

**Need help?** Check the detailed guides above!

**Ready to present?** Test all demo queries first!

Good luck! 🎉
