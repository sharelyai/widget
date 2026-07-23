export interface Space {
  id: string;
  name: string;
  description?: string;
  status?: "PRIVATE" | "PUBLIC";
  metadata?: Record<string, any>;
}

export interface Group {
  id: string;
  name?: string;
  type?: string; // 'SPACE' | 'THREAD'
  metadata?: Record<string, any>;
}
