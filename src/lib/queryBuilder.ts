import tradesConfig from '../../trades-config.json';

export interface TradeConfig {
  name: string;
  keywords: string[];
  required: string[];
  exclude: string[];
}

export type TradesConfigMap = Record<string, TradeConfig>;

export interface SearchQuery {
  trade: string;
  location: string;
  platform: string;
}

/**
 * Get all available trades from the config
 */
export function getAvailableTrades(): Array<{ value: string; label: string }> {
  return Object.entries(tradesConfig as TradesConfigMap).map(([key, config]) => ({
    value: key,
    label: config.name,
  }));
}

/**
 * Build a search query string from the selected trade, location, and platform
 */
export function buildSearchQuery(query: SearchQuery): string {
  const config = (tradesConfig as TradesConfigMap)[query.trade];

  if (!config) {
    throw new Error(`Trade configuration not found for: ${query.trade}`);
  }

  // Build the query parts
  const parts: string[] = [];

  // Add keywords (at least one must match)
  if (config.keywords.length > 0) {
    const keywordQuery = `(${config.keywords.join(' OR ')})`;
    parts.push(keywordQuery);
  }

  // Add required terms (all must be present)
  if (config.required.length > 0) {
    parts.push(...config.required);
  }

  // Add exclude terms
  if (config.exclude.length > 0) {
    parts.push(...config.exclude);
  }

  // Add location if provided
  if (query.location.trim()) {
    parts.push(`"${query.location.trim()}"`);
  }

  // Combine all parts
  return parts.join(' ');
}

/**
 * Get the full search URL for the selected platform
 * Hardcoded to 24 hours time filter
 */
export function getSearchUrl(query: SearchQuery): string {
  const searchQuery = buildSearchQuery(query);
  const encodedQuery = encodeURIComponent(searchQuery);

  const baseUrls: Record<string, string> = {
    facebook: `https://www.facebook.com/search/posts/?q=${encodedQuery}`,
    nextdoor: `https://nextdoor.com/search/?query=${encodedQuery}`,
  };

  return baseUrls[query.platform.toLowerCase()] || '';
}

/**
 * Format query for display with explanation
 */
export function formatQueryExplanation(query: SearchQuery): {
  fullQuery: string;
  breakdown: {
    keywords: string;
    required: string;
    exclude: string;
    location: string;
  };
} {
  const config = (tradesConfig as TradesConfigMap)[query.trade];

  if (!config) {
    return {
      fullQuery: '',
      breakdown: {
        keywords: '',
        required: '',
        exclude: '',
        location: '',
      },
    };
  }

  return {
    fullQuery: buildSearchQuery(query),
    breakdown: {
      keywords: config.keywords.join(', '),
      required: config.required.join(' '),
      exclude: config.exclude.join(' '),
      location: query.location || '(none)',
    },
  };
}
