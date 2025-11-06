# Backend API Reference

## Base URL

- **Development**: `http://localhost:3000`
- **Production**: TBD

## Endpoints

### 3D Map Endpoints

#### Get All Cities

```http
GET /api/trois-d/cities
```

Returns all cities with their postal codes and geographic data.

**Response:**

```json
[
    {
        "codeINSEE": "06001",
        "name": "Aiglun",
        "codeDepartement": "06",
        "siren": "210600011",
        "codeEpci": "200039931",
        "codeRegion": "93",
        "population": 99,
        "surface": 1234.5,
        "zone": "metro",
        "postalCodes": [
            {
                "id": 1,
                "code": "06910",
                "cityCodeINSEE": "06001"
            }
        ],
        "geoData": {
            "id": 1,
            "cityCodeINSEE": "06001",
            "centreLat": 43.8,
            "centreLon": 6.9,
            "mairieLat": 43.8,
            "mairieLon": 6.9,
            "contour": "{\"type\":\"Polygon\",\"coordinates\":[...]}",
            "bbox": "{\"type\":\"Polygon\",\"coordinates\":[...]}"
        }
    }
]
```

#### Get City by Name

```http
GET /api/trois-d/cities/:name
```

Returns a specific city by its name.

**Parameters:**

- `name` (string): City name (URL encoded)

**Response:** Same structure as a single city from the list above.

### Query Endpoints

#### Execute Query

```http
POST /api/query
```

Execute an AI-powered query using the Ollama model.

**Request Body:**

```json
{
    "query": "Quelle est la population de Nice?"
}
```

**Response:**

```json
{
    "response": "La population de Nice est de...",
    "metadata": {
        "model": "mistral",
        "tokens": 150
    }
}
```

## Database Models

### City

```typescript
{
  codeINSEE: string;       // Primary key
  name: string;
  codeDepartement: string;
  siren: string;
  codeEpci: string;
  codeRegion: string;
  population: number;
  surface?: number;        // in hectares
  zone?: string;           // "metro" or other
  postalCodes: PostalCode[];
  geoData?: CityGeoData;
}
```

### CityGeoData

```typescript
{
  id: number;              // Primary key
  cityCodeINSEE: string;   // Foreign key to City
  centreLat?: number;
  centreLon?: number;
  mairieLat?: number;
  mairieLon?: number;
  contour?: string;        // JSON stringified Polygon
  bbox?: string;           // JSON stringified Polygon
}
```

### PostalCode

```typescript
{
    id: number; // Primary key
    code: string; // ex: "06910"
    cityCodeINSEE: string; // Foreign key to City
}
```

## Error Responses

All endpoints may return the following error format:

```json
{
    "error": "Error message",
    "details": "Additional error details"
}
```

### Common Error Codes

- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error
