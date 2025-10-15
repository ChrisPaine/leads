# Lead Finder Integration Guide

This guide explains how to integrate and customize the simplified Lead Finder component.

## Overview

The Lead Finder provides a simple 3-field interface:
1. **Trade Dropdown** - Populated from `trades-config.json`
2. **Location Input** - City, region, or area
3. **Platform Dropdown** - Facebook, Nextdoor, or Reddit
4. **24-Hour Filter** - Hardcoded (not user-selectable)

## File Structure

```
src/
├── components/
│   ├── LeadFinder.tsx       # Main component
│   └── LeadFinder.css       # Styles
├── lib/
│   ├── queryBuilder.ts      # Query building logic
│   └── searchAPI.ts         # API integration examples
├── App.tsx                  # App entry point
├── main.tsx                 # React entry
└── index.css                # Global styles
```

## Quick Start

### 1. Basic Usage

```tsx
import { LeadFinder } from './components/LeadFinder';
import './components/LeadFinder.css';

function App() {
  return <LeadFinder />;
}
```

### 2. With Search Handler

```tsx
import { LeadFinder } from './components/LeadFinder';
import type { SearchQuery } from './lib/queryBuilder';

function App() {
  const handleSearch = (query: SearchQuery, queryString: string) => {
    console.log('Search query:', queryString);

    // Your custom logic here
    // e.g., send to analytics, save to database, etc.
  };

  return <LeadFinder onSearch={handleSearch} />;
}
```

## Integration Options

### Option 1: Direct Platform Search (Default)

The component opens searches directly on the platform websites:

```tsx
<LeadFinder />
```

This is the simplest option - no backend required!

### Option 2: Backend API Integration

Integrate with your existing search API:

```tsx
import { performSearch } from './lib/searchAPI';

function App() {
  const handleSearch = async (query, queryString) => {
    try {
      const results = await performSearch(query);
      // Handle results...
      console.log('Found', results.total, 'results');
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  return <LeadFinder onSearch={handleSearch} />;
}
```

### Option 3: SerpAPI Integration

For server-side scraping with SerpAPI:

```tsx
import { searchWithSerpAPI } from './lib/searchAPI';

function App() {
  const handleSearch = async (query, queryString) => {
    try {
      const results = await searchWithSerpAPI(query);
      // Process results...
    } catch (error) {
      console.error('SerpAPI error:', error);
    }
  };

  return <LeadFinder onSearch={handleSearch} />;
}
```

## Customizing trades-config.json

Add or modify trades in `trades-config.json`:

```json
{
  "your-trade": {
    "name": "Display Name",
    "keywords": ["keyword1", "keyword2", "\"exact phrase\""],
    "required": ["+must", "+have", "+these"],
    "exclude": ["-dont", "-want", "-these"]
  }
}
```

### Query Syntax

- **Keywords**: At least one must match (OR logic)
- **Required**: All must be present (+ prefix)
- **Exclude**: None should be present (- prefix)
- **Quotes**: Use for exact phrases: `"looking for"`

### Example

```json
{
  "hvac": {
    "name": "HVAC Technician",
    "keywords": ["hvac", "heating", "cooling", "\"air conditioning\""],
    "required": ["+need", "+needed", "+looking for", "+recommend"],
    "exclude": ["-\"seeking work\"", "-\"I am a\"", "-\"I offer\""]
  }
}
```

## Styling Customization

### Using CSS Variables

Add to your global CSS:

```css
:root {
  --lead-finder-primary: #667eea;
  --lead-finder-secondary: #764ba2;
  --lead-finder-radius: 1rem;
}
```

### Tailwind Integration

The component works alongside Tailwind. Modify `LeadFinder.css` classes as needed.

### Custom Theme

Replace the gradient background:

```css
.lead-finder-container {
  background: linear-gradient(135deg, #your-color-1 0%, #your-color-2 100%);
}
```

## Query Builder API

### Available Functions

```typescript
import {
  getAvailableTrades,
  buildSearchQuery,
  formatQueryExplanation,
  getSearchUrl,
} from './lib/queryBuilder';

// Get all trades
const trades = getAvailableTrades();
// Returns: [{ value: 'carpenter', label: 'Carpenter' }, ...]

// Build query string
const query = { trade: 'carpenter', location: 'Seattle', platform: 'facebook' };
const queryString = buildSearchQuery(query);
// Returns: "(carpenter OR carpentry) +need +needed \"Seattle\" -\"seeking work\""

// Get formatted explanation
const explanation = formatQueryExplanation(query);
// Returns: { fullQuery: "...", breakdown: { keywords: "...", ... } }

// Get platform URL
const url = getSearchUrl(query);
// Returns: "https://www.facebook.com/search/posts/?q=..."
```

## Backend API Setup

### Express Example

```javascript
app.post('/api/search', async (req, res) => {
  const { query, platform, location, trade, timeFilter } = req.body;

  // Your search logic here
  const results = await yourSearchFunction(query, platform);

  res.json({
    results,
    total: results.length,
    query,
  });
});
```

### SerpAPI Example

```javascript
const { getJson } = require('serpapi');

app.post('/api/serpapi-search', async (req, res) => {
  const { query, platform, timeFilter } = req.body;

  const results = await getJson({
    engine: platform, // 'google', 'facebook', etc.
    q: query,
    tbs: 'qdr:d', // 24 hours
    api_key: process.env.SERPAPI_KEY,
  });

  res.json(results);
});
```

## Testing

### Enable Query Preview

The query preview is automatically shown when all fields are filled. Click the "Query Preview" button to see:

- Full constructed query
- Keywords breakdown
- Required terms
- Excluded terms
- Location
- Time filter (24 hours)

### Testing Tips

1. Fill in all three fields
2. Click "Query Preview" to verify the query
3. Check that keywords, required, and exclude terms are correct
4. Click "Find Leads" to test the actual search

## Platform-Specific Notes

### Facebook
- Uses Facebook's search URL format
- 24-hour filter applied via query structure

### Nextdoor
- Location-based searches work best
- Users must be logged in to see results

### Reddit
- Time filter: `&t=day` (24 hours)
- Best for broader geographic areas

## Troubleshooting

### TypeScript Errors

If you get JSON import errors, add to `tsconfig.json`:

```json
{
  "compilerOptions": {
    "resolveJsonModule": true,
    "esModuleInterop": true
  }
}
```

### Styling Issues

Make sure to import the CSS:

```tsx
import './components/LeadFinder.css';
```

### Query Not Working

1. Check `trades-config.json` syntax
2. Verify the trade key exists
3. Use query preview to inspect the generated query
4. Test quotes and special characters

## Advanced Customization

### Add More Platforms

Edit the platforms array in `LeadFinder.tsx`:

```typescript
const platforms = [
  { value: 'facebook', label: 'Facebook' },
  { value: 'nextdoor', label: 'Nextdoor' },
  { value: 'reddit', label: 'Reddit' },
  { value: 'twitter', label: 'Twitter' }, // Add new platform
];
```

Then update the URLs in the search handler or `queryBuilder.ts`.

### Dynamic Time Filter

To make the time filter dynamic instead of hardcoded:

1. Add a time filter state to `LeadFinder.tsx`
2. Add a dropdown for time selection
3. Update `getSearchUrl()` in `queryBuilder.ts` to accept time parameter

### Save Search History

```typescript
const handleSearch = (query: SearchQuery, queryString: string) => {
  // Save to localStorage
  const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
  history.push({ query, queryString, timestamp: Date.now() });
  localStorage.setItem('searchHistory', JSON.stringify(history));
};
```

## Production Checklist

- [ ] Update `trades-config.json` with your actual trades
- [ ] Test all trade configurations
- [ ] Verify platform URLs work correctly
- [ ] Set up backend API (if using server-side search)
- [ ] Add error handling for failed searches
- [ ] Add analytics tracking
- [ ] Test responsive design on mobile
- [ ] Add loading states for async searches
- [ ] Implement rate limiting (if applicable)
- [ ] Add user authentication (if needed)

## Support

For issues or questions, refer to the main project README or create an issue in your repository.
