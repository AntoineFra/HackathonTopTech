# Territory 06 Data Portal - AI Integration Guide

An AI-powered interactive portal for querying socio-demographic indicators of the Nice Côte d'Azur territory (Alpes-Maritimes, France).

## Project Overview

This application allows users to:
- Ask questions in natural French language about territory indicators
- Get instant responses with data visualizations
- Explore socio-demographic, economic, and infrastructure data
- Receive transparent information about data limitations

## Technology Stack

- **Framework**: Next.js 14+ (React)
- **UI**: shadcn/ui components + Tailwind CSS
- **TypeScript**: Full type safety
- **Icons**: Lucide React

## Project Structure

```
├── app/
│   ├── page.tsx           # Main application page
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/
│   ├── ui/                # shadcn/ui base components
│   ├── query-interface.tsx      # AI query input interface
│   ├── ai-response-display.tsx  # Response visualization
│   ├── indicator-card.tsx       # Data card components
│   └── category-grid.tsx        # Category browser
├── lib/
│   ├── ai-service.ts      # AI service functions (TO IMPLEMENT)
│   └── utils.ts           # Utility functions
└── types/
    └── index.ts           # TypeScript type definitions
```

## AI Integration - TODO

### 1. Connect Your AI Service

Edit `lib/ai-service.ts` and implement the `queryAI` function:

```typescript
export async function queryAI(question: string): Promise<AIResponse> {
  // Example with OpenAI
  const response = await fetch('YOUR_AI_ENDPOINT', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an assistant for the CCI Nice Côte d\'Azur that answers questions about socio-demographic indicators...'
        },
        {
          role: 'user',
          content: question
        }
      ]
    })
  });

  const data = await response.json();
  
  return {
    success: true,
    query: question,
    answer: data.choices[0].message.content,
    confidence: 0.85,
    indicators: await extractIndicators(question),
    visualizations: []
  };
}
```

### 2. Implement Data Source Connection

Update `fetchIndicators` function to connect to your database:

```typescript
export async function fetchIndicators(filters: SearchFilters): Promise<Indicator[]> {
  // Connect to your data source (PostgreSQL, MongoDB, API, etc.)
  const response = await fetch('/api/indicators', {
    method: 'POST',
    body: JSON.stringify(filters)
  });
  
  return response.json();
}
```

### 3. Set Up Environment Variables

Create a `.env.local` file:

```env
# AI Service
OPENAI_API_KEY=your_key_here
# or
ANTHROPIC_API_KEY=your_key_here

# Database
DATABASE_URL=your_database_url

# API Endpoints
NEXT_PUBLIC_API_URL=your_api_url
```

### 4. Create API Routes (Optional)

Create `app/api/query/route.ts` for server-side AI calls:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { queryAI } from '@/lib/ai-service';

export async function POST(request: NextRequest) {
  const { query } = await request.json();
  
  try {
    const response = await queryAI(query);
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process query' },
      { status: 500 }
    );
  }
}
```

## Key Features to Implement

### 1. Natural Language Processing
- Parse user queries to extract intent (population, employment, etc.)
- Identify location entities (Nice, Alpes-Maritimes, etc.)
- Extract time references (2025, last year, etc.)

### 2. Data Retrieval
- Query your database based on extracted parameters
- Aggregate and format data for display
- Include metadata (sources, dates, confidence)

### 3. Response Generation
- Generate natural language explanations
- Create appropriate visualizations (charts, tables, maps)
- Include limitations and caveats

### 4. Visualization Support
- Implement chart components (recharts, chart.js, etc.)
- Add data export functionality
- Support multiple visualization types

## Example Data Structure

Your indicators should follow this structure:

```typescript
{
  id: "pop-nice-2025",
  name: "Population of Nice",
  category: "Demographics",
  value: 342669,
  unit: "inhabitants",
  year: 2025,
  source: "INSEE",
  description: "Total population"
}
```

## Development

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## Testing AI Integration

1. Start the development server
2. Open http://localhost:3000
3. Try example queries:
   - "What is the population of Nice?"
   - "Show me employment statistics"
   - "Economic indicators for 2025"

## Next Steps

1. ✅ Base project structure created
2. ✅ UI components implemented
3. ✅ Type definitions ready
4. ⏳ Connect AI service (OpenAI/Claude/etc.)
5. ⏳ Set up data source/database
6. ⏳ Implement data retrieval logic
7. ⏳ Add visualization library
8. ⏳ Deploy to production

## Notes for Hackathon

- All placeholder functions are marked with `// TODO:`
- The UI is fully functional and ready for demo
- Focus on implementing `queryAI()` function first
- Use mock data if real data isn't available yet
- The system gracefully handles errors and shows limitations

## Support

For questions about CCI Nice Côte d'Azur data requirements, refer to your hackathon documentation.

---

Built for the CCI Nice Côte d'Azur Hackathon 2025
