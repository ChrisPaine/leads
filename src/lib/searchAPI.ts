import type { SearchQuery } from './queryBuilder';
import { buildSearchQuery } from './queryBuilder';

/**
 * Example API integration for the search functionality
 * Replace this with your actual backend API endpoint
 */

export interface SearchResult {
  id: string;
  title: string;
  content: string;
  platform: string;
  url: string;
  timestamp: string;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  query: string;
}

/**
 * Perform a search using your backend API
 * This is a placeholder - replace with your actual API integration
 */
export async function performSearch(
  query: SearchQuery
): Promise<SearchResponse> {
  const queryString = buildSearchQuery(query);

  // Example: Using your backend API
  try {
    const response = await fetch('/api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: queryString,
        platform: query.platform,
        location: query.location,
        trade: query.trade,
        timeFilter: '24h', // Hardcoded to 24 hours
      }),
    });

    if (!response.ok) {
      throw new Error(`Search failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
}

/**
 * Alternative: Direct platform search (opens in new tab)
 * This is what the component currently uses by default
 */
export function openPlatformSearch(query: SearchQuery): void {
  const queryString = buildSearchQuery(query);
  const encodedQuery = encodeURIComponent(queryString);

  const urls: Record<string, string> = {
    facebook: `https://www.facebook.com/search/posts/?q=${encodedQuery}`,
    nextdoor: `https://nextdoor.com/search/?query=${encodedQuery}`,
    reddit: `https://www.reddit.com/search/?q=${encodedQuery}&t=day`, // 24 hours
  };

  const url = urls[query.platform.toLowerCase()];
  if (url) {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

/**
 * Example: Search with SerpAPI (if using server-side scraping)
 */
export async function searchWithSerpAPI(
  query: SearchQuery
): Promise<SearchResponse> {
  const queryString = buildSearchQuery(query);

  try {
    const response = await fetch('/api/serpapi-search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: queryString,
        platform: query.platform,
        timeFilter: 'day', // 24 hours
      }),
    });

    if (!response.ok) {
      throw new Error(`SerpAPI search failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('SerpAPI search error:', error);
    throw error;
  }
}
