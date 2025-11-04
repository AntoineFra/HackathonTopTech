// Data types for socio-demographic indicators

export interface Indicator {
  id: string;
  name: string;
  category: string;
  value: number | string;
  unit: string;
  year: number;
  source: string;
  description?: string;
}

export interface IndicatorCategory {
  id: string;
  name: string;
  description: string;
  icon?: string;
}

// AI Query types
export interface Query {
  id: string;
  text: string;
  timestamp: Date;
  userId?: string;
}

export interface AIResponse {
  success: boolean;
  query: string;
  answer: string;
  indicators?: Indicator[];
  visualizations?: Visualization[];
  confidence: number;
  sources?: string[];
  limitations?: string;
  error?: string;
}

export interface Visualization {
  type: 'bar' | 'line' | 'pie' | 'table' | 'map' | 'card';
  title: string;
  data: any;
  description?: string;
}

// Territory data
export interface TerritoryData {
  name: string;
  code: string;
  indicators: Indicator[];
  lastUpdate: Date;
}

// Search and filter types
export interface SearchFilters {
  categories?: string[];
  yearRange?: {
    from: number;
    to: number;
  };
  keywords?: string[];
}

export interface QueryHistory {
  queries: Query[];
  responses: AIResponse[];
}
