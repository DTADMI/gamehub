// Search-related types
export interface SearchResultItem {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  type: 'quest' | 'user';
  [key: string]: any;
}

export interface SearchResults {
  results: SearchResultItem[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface SearchResult {
  quests: SearchResultItem[];
  users: SearchResultItem[];
  total: number;
}
