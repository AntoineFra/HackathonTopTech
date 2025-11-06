# Frontend Components Reference

## UI Components

### Button

A customizable button component with various variants.

**Location:** `components/ui/button.tsx`

**Usage:**

```tsx
import { Button } from "@/components/ui/button"

<Button variant="default">Click me</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>
```

**Props:**

- `variant`: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
- `size`: "default" | "sm" | "lg" | "icon"
- All standard button HTML attributes

### Card

Container component for content grouping.

**Location:** `components/ui/card.tsx`

**Usage:**

```tsx
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from "@/components/ui/card";

<Card>
    <CardHeader>
        <CardTitle>Title</CardTitle>
        <CardDescription>Description</CardDescription>
    </CardHeader>
    <CardContent>Content here</CardContent>
    <CardFooter>Footer content</CardFooter>
</Card>;
```

### Input

Text input field component.

**Location:** `components/ui/input.tsx`

**Usage:**

```tsx
import { Input } from "@/components/ui/input";

<Input type="text" placeholder="Enter text..." />;
```

### Textarea

Multi-line text input component.

**Location:** `components/ui/textarea.tsx`

**Usage:**

```tsx
import { Textarea } from "@/components/ui/textarea";

<Textarea placeholder="Enter description..." />;
```

### Badge

Small status or label indicator.

**Location:** `components/ui/badge.tsx`

**Usage:**

```tsx
import { Badge } from "@/components/ui/badge"

<Badge>New</Badge>
<Badge variant="secondary">Draft</Badge>
<Badge variant="destructive">Error</Badge>
<Badge variant="outline">Outlined</Badge>
```

### Alert

Message display component for notifications.

**Location:** `components/ui/alert.tsx`

**Usage:**

```tsx
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

<Alert>
    <AlertTitle>Heads up!</AlertTitle>
    <AlertDescription>Your message here</AlertDescription>
</Alert>;
```

## Feature Components

### AI Response Display

Displays AI-generated responses.

**Location:** `components/ai-response-display.tsx`

**Usage:**

```tsx
import { AIResponseDisplay } from "@/components/ai-response-display";

<AIResponseDisplay response={aiResponse} />;
```

### Category Grid

Grid layout for category selection.

**Location:** `components/category-grid.tsx`

**Usage:**

```tsx
import { CategoryGrid } from "@/components/category-grid";

<CategoryGrid categories={categories} onSelect={handleSelect} />;
```

### Indicator Card

Displays metric indicators.

**Location:** `components/indicator-card.tsx`

**Usage:**

```tsx
import { IndicatorCard } from "@/components/indicator-card";

<IndicatorCard title="Population" value={123456} trend="+5.2%" />;
```

### Query Interface

User interface for submitting queries.

**Location:** `components/query-interface.tsx`

**Usage:**

```tsx
import { QueryInterface } from "@/components/query-interface";

<QueryInterface onSubmit={handleQuery} isLoading={isLoading} />;
```

## Layout Components

### Navbar

Main navigation bar.

**Location:** `components/navbar/navbar.tsx`

**Usage:**

```tsx
import { Navbar } from "@/components/navbar/navbar";

<Navbar />;
```

### Footer

Site footer.

**Location:** `components/footer/footer.tsx`

**Usage:**

```tsx
import { Footer } from "@/components/footer/footer";

<Footer />;
```

## 3D Map Components

### Map 3D Viewer

Interactive 3D map viewer.

**Location:** `components/map3d/map-3d-viewer.tsx`

**Usage:**

```tsx
import { Map3DViewer } from "@/components/map3d/map-3d-viewer";

<Map3DViewer department="06" initialView="overview" />;
```

### Map 3D Scene

Three.js scene wrapper.

**Location:** `components/map3d/map-3d-scene.tsx`

### Building Component

3D building representation.

**Location:** `components/map3d/building.tsx`

**Usage:**

```tsx
import { Building } from "@/components/map3d/building";

<Building
    position={[x, y, z]}
    height={height}
    color="#4CAF50"
    onClick={handleClick}
/>;
```

### Department Boundary

Department boundary visualization.

**Location:** `components/map3d/department-boundary.tsx`

### Building Info Panel

Information panel for selected buildings.

**Location:** `components/map3d/building-info-panel.tsx`

### Map Controls

Interactive map controls.

**Location:** `components/map3d/map-controls.tsx`

### Map Legend

Map legend component.

**Location:** `components/map3d/map-legend.tsx`

### Map Context

React context for map state management.

**Location:** `components/map3d/map-context.tsx`

**Usage:**

```tsx
import { useMapContext, MapProvider } from "@/components/map3d/map-context";

// Wrap your app
<MapProvider>
    <YourComponent />
</MapProvider>;

// Use in component
const { selectedBuilding, setSelectedBuilding } = useMapContext();
```

## Hooks

### useCommuneData

Fetch commune (city) data.

**Location:** `lib/hooks/use-commune-data.ts`

**Usage:**

```tsx
import { useCommuneData } from "@/lib/hooks/use-commune-data";

const { data, isLoading, error } = useCommuneData(cityCode);
```

### useRealData

Fetch real data from APIs.

**Location:** `lib/hooks/use-real-data.ts`

**Usage:**

```tsx
import { useRealData } from "@/lib/hooks/use-real-data";

const { data, isLoading, error, refetch } = useRealData(query);
```

## Utility Functions

### cn (Class Name merger)

Merge Tailwind CSS classes.

**Location:** `lib/utils.ts`

**Usage:**

```tsx
import { cn } from "@/lib/utils";

<div className={cn("base-class", condition && "conditional-class")} />;
```

## Services

### AI Service

Handle AI queries.

**Location:** `lib/ai-service.ts`

### Map AI Service

AI service for map-related queries.

**Location:** `lib/map-ai-service.ts`

### Geo API Service

Interface with French government geo API.

**Location:** `lib/data-sources/geo-api-service.ts`

### IGN Service

Interface with IGN (Institut Géographique National) API.

**Location:** `lib/data-sources/ign-service.ts`

### INSEE Service

Interface with INSEE API.

**Location:** `lib/data-sources/insee-service.ts`

### OSM Service

Interface with OpenStreetMap API.

**Location:** `lib/data-sources/osm-service.ts`

### Cache Service

Caching layer for API responses.

**Location:** `lib/data-sources/cache-service.ts`
