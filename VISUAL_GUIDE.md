# 🎨 Territory 06 Data Portal - Visual Overview

## Application Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERFACE                            │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  🏠 Home Page (app/page.tsx)                          │  │
│  │                                                        │  │
│  │  ┌──────────────────────────────────────────────┐    │  │
│  │  │  💬 Query Interface                          │    │  │
│  │  │  - Natural language input                    │    │  │
│  │  │  - Suggestion chips                          │    │  │
│  │  │  - Submit button                             │    │  │
│  │  └──────────────────────────────────────────────┘    │  │
│  │                                                        │  │
│  │  ┌──────────────────────────────────────────────┐    │  │
│  │  │  📊 AI Response Display                      │    │  │
│  │  │  - Answer text                               │    │  │
│  │  │  - Confidence indicator                      │    │  │
│  │  │  - Related indicators                        │    │  │
│  │  │  - Limitations warning                       │    │  │
│  │  └──────────────────────────────────────────────┘    │  │
│  │                                                        │  │
│  │  ┌──────────────────────────────────────────────┐    │  │
│  │  │  🗂️  Category Grid                           │    │  │
│  │  │  [Demographics] [Economy] [Tourism] [etc]    │    │  │
│  │  └──────────────────────────────────────────────┘    │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    SERVICE LAYER                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  🤖 AI Service (lib/ai-service.ts)                    │  │
│  │                                                        │  │
│  │  queryAI()           ← Connect OpenAI/Claude here     │  │
│  │  extractIndicators() ← Parse query intent             │  │
│  │  fetchIndicators()   ← Get data from DB               │  │
│  │  getSuggestions()    ← Autocomplete                   │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    DATA LAYER                                │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  📚 Sample Data (lib/sample-data.ts)                  │  │
│  │  OR                                                    │  │
│  │  🗄️  Your Database (PostgreSQL/MongoDB/API)           │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Hierarchy

```
App
└── page.tsx
    ├── QueryInterface
    │   ├── Input (shadcn)
    │   ├── Button (shadcn)
    │   └── Badge (shadcn) - suggestions
    │
    ├── AIResponseDisplay
    │   ├── Card (shadcn)
    │   ├── Alert (shadcn) - limitations
    │   └── IndicatorList
    │       └── IndicatorCard (multiple)
    │           ├── Card
    │           ├── Badge - year
    │           └── data display
    │
    └── CategoryGrid
        └── Card (multiple) - categories
```

---

## Data Flow

```
1. User Input
   "What is the population of Nice?"
          ↓
2. Query Interface Component
   - Sanitize input
   - Show loading state
          ↓
3. AI Service
   - Parse query
   - Call AI API (OpenAI/Claude)
   - Extract intent and keywords
          ↓
4. Data Retrieval
   - Fetch relevant indicators
   - Get from DB or sample data
          ↓
5. Response Generation
   - Format answer
   - Add visualizations
   - Calculate confidence
   - Include sources
          ↓
6. Display to User
   - Show formatted answer
   - Display indicator cards
   - Show confidence level
   - List limitations
```

---

## Color Coding Guide

### In the UI:
- 🟢 Green: High confidence (≥80%)
- 🟡 Yellow: Medium confidence (60-79%)
- 🔴 Red: Low confidence (<60%)
- 🟠 Amber: Warnings and limitations

### Component States:
- ⚪ Default: Normal state
- 🔵 Loading: Processing query
- ✅ Success: Data loaded
- ❌ Error: Failed to load

---

## Key Features Visualization

```
┌─────────────────────────────────────────────────────────┐
│  💬 Natural Language Queries                            │
│  "Quelle est la population de Nice?"                    │
│  ↓ Understands French & English                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  📊 Data Visualization                                  │
│  [Bar Chart] [Line Graph] [Data Cards] [Tables]        │
│  ↓ Multiple formats supported                           │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  🎯 Smart Suggestions                                   │
│  [Population] [Employment] [Tourism] [Housing]          │
│  ↓ Context-aware recommendations                        │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  ⚠️  Transparent Limitations                            │
│  "This data is from 2023. 2024 data not yet available"  │
│  ↓ Honest about data gaps                               │
└─────────────────────────────────────────────────────────┘
```

---

## Integration Points

### 🔌 What You Need to Connect:

1. **AI Service** (Priority 1)
   - File: `lib/ai-service.ts`
   - Options: OpenAI, Claude, Azure OpenAI
   - Time: 1-2 hours

2. **Data Source** (Priority 2)
   - File: `lib/ai-service.ts` or new API
   - Options: Database, API, Enhanced sample data
   - Time: 1-3 hours

3. **Charts** (Optional)
   - Install: recharts, Chart.js, or similar
   - Time: 1-2 hours

---

## File Size Overview

```
📦 Project Size
├── 🎨 Components (UI)    ████████░░ 80% done
├── 🔧 Services           ███░░░░░░░ 30% done (needs AI)
├── 📊 Data              ████████░░ 80% done (sample data)
├── 🎯 Types             ██████████ 100% done
└── 📝 Documentation     ██████████ 100% done
```

---

## Demo Scenarios

### Scenario 1: Population Query
```
User: "What is the population of Nice?"
  ↓
AI: Processes query
  ↓
System: Finds population indicators
  ↓
Display: Shows Nice (342,669) and AM (1,083,310)
  ↓
Result: ✅ Success with data cards
```

### Scenario 2: Economic Data
```
User: "Show me employment statistics"
  ↓
AI: Identifies economy category
  ↓
System: Retrieves employment indicators
  ↓
Display: Shows unemployment rate, new businesses, etc.
  ↓
Result: ✅ Success with multiple indicators
```

### Scenario 3: Unavailable Data
```
User: "What will the population be in 2050?"
  ↓
AI: Recognizes future prediction
  ↓
System: No prediction data available
  ↓
Display: Clear message about limitation
  ↓
Result: ⚠️ Transparent about unavailable data
```

---

This visual guide helps you understand the project structure at a glance!
