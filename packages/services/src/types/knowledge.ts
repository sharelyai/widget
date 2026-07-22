export interface Category {
  id: string;
  name: string;
  children?: Category[];
  resources?: Resource[];
}

export interface Resource {
  id: string;
  title: string;
  type?: string;
  blobType?: string;
  url?: string;
  metadata?: Record<string, any>;
}

export interface SearchResult extends Resource {
  score?: number;
  highlight?: Record<string, string[]>;
}
