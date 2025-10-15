# Setup Guide - Simplified Lead Finder

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:8080`

## File Structure

```
project/
├── trades-config.json          # Trade configurations
├── src/
│   ├── components/
│   │   ├── LeadFinder.tsx     # Main simplified component
│   │   ├── LeadFinder.css     # Component styles
│   │   └── LeadFinderWithResults.tsx  # Optional: with results display
│   ├── lib/
│   │   ├── queryBuilder.ts    # Query building logic
│   │   └── searchAPI.ts       # API integration examples
│   ├── App.tsx                # Main app component
│   ├── main.tsx               # React entry point
│   └── index.css              # Global styles
└── INTEGRATION_GUIDE.md       # Detailed integration docs
```

## Usage

### Basic Setup (Default)

The simplest setup opens searches directly on platform websites:

**src/App.tsx:**
```tsx
import { LeadFinder } from './components/LeadFinder';
import './components/LeadFinder.css';

function App() {
  return <LeadFinder />;
}

export default App;
```

### With Custom Handler

Add custom logic when searches are performed:

```tsx
import { LeadFinder } from './components/LeadFinder';
import type { SearchQuery } from './lib/queryBuilder';

function App() {
  const handleSearch = (query: SearchQuery, queryString: string) => {
    // Log to analytics
    console.log('Search:', query);

    // Save to database
    // sendToAPI(query);
  };

  return <LeadFinder onSearch={handleSearch} />;
}
```

### With Results Display

Use the enhanced component to show results in-app:

```tsx
import { LeadFinderWithResults } from './components/LeadFinderWithResults';

function App() {
  return <LeadFinderWithResults />;
}
```

## Configuration

### Edit Trade Definitions

Modify `trades-config.json` to add/update trades:

```json
{
  "your-trade": {
    "name": "Display Name",
    "keywords": ["keyword1", "keyword2"],
    "required": ["+need", "+needed"],
    "exclude": ["-offering", "-available"]
  }
}
```

### Customize Styling

Edit `src/components/LeadFinder.css` to change colors, spacing, etc.

### Change Platforms

Edit the platforms array in `src/components/LeadFinder.tsx`:

```tsx
const platforms = [
  { value: 'facebook', label: 'Facebook' },
  { value: 'nextdoor', label: 'Nextdoor' },
  { value: 'reddit', label: 'Reddit' },
  // Add more platforms here
];
```

## Time Filter

The time filter is **hardcoded to 24 hours** as requested.

To change this, edit:
- `src/lib/queryBuilder.ts` - `getSearchUrl()` function
- Platform-specific URL parameters

## Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Troubleshooting

### TypeScript Errors with JSON Import

Add to `tsconfig.json`:

```json
{
  "compilerOptions": {
    "resolveJsonModule": true
  }
}
```

### Styles Not Loading

Make sure to import the CSS in your component:

```tsx
import './components/LeadFinder.css';
```

### Query Not Working

1. Check your `trades-config.json` syntax
2. Use the Query Preview feature to debug
3. Verify special characters are properly escaped

## Next Steps

1. ✅ Test the interface with your trades
2. ✅ Verify query preview shows correct results
3. ✅ Test searches on each platform
4. ✅ Customize styling to match your brand
5. ✅ Add backend integration (if needed)

See [INTEGRATION_GUIDE.md](src/INTEGRATION_GUIDE.md) for detailed integration options.

## Support

For issues or questions:
- Check the Integration Guide for detailed documentation
- Review the example files in `src/lib/searchAPI.ts`
- Test using the Query Preview feature
