# Architecture Overview

## Component Flow

```
┌─────────────────────────────────────────────────────────────┐
│                         User Interface                       │
│                      (LeadFinder.tsx)                        │
│                                                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   I'm a:    │  │  Location:  │  │  Platform:  │         │
│  │  [Dropdown] │  │   [Input]   │  │  [Dropdown] │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                               │
│         ┌────────────────────────────────┐                  │
│         │      [Find Leads Button]       │                  │
│         └────────────────────────────────┘                  │
│                         │                                    │
│                         ▼                                    │
│         ┌────────────────────────────────┐                  │
│         │   ▶ Query Preview (Testing)    │                  │
│         └────────────────────────────────┘                  │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Query Builder Logic                       │
│                   (queryBuilder.ts)                          │
│                                                               │
│  1. Read trades-config.json                                  │
│  2. Extract: keywords, required, exclude                     │
│  3. Combine with location                                    │
│  4. Build search string                                      │
│  5. Generate platform URL (with 24h filter)                  │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   Search Execution                           │
│                  (3 Options Available)                       │
│                                                               │
│  Option 1: Direct Platform Search                            │
│  ├─ Opens Facebook/Nextdoor/Reddit in new tab               │
│  └─ No backend needed ✓                                     │
│                                                               │
│  Option 2: Custom Handler                                    │
│  ├─ Log analytics                                            │
│  ├─ Save to database                                         │
│  └─ Then opens platform                                      │
│                                                               │
│  Option 3: Backend API                                       │
│  ├─ Fetch results from your API                              │
│  ├─ Display in-app (LeadFinderWithResults)                  │
│  └─ Full control over results ✓                             │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

```
trades-config.json
       │
       │ (Read at runtime)
       ▼
┌─────────────────┐
│  Query Builder  │
│                 │
│  • keywords     │──┐
│  • required     │  │
│  • exclude      │  │  Combine
│                 │  │    into
│  + location     │  │   query
│  + platform     │  │  string
│  + timeFilter   │  │
└─────────────────┘  │
                     │
                     ▼
        "Search Query String"
                     │
                     ▼
           ┌─────────────────┐
           │  Platform URL    │
           │  + Encoded Query │
           │  + Time Filter   │
           └─────────────────┘
                     │
                     ▼
              Open in Browser
              or Fetch via API
```

## Query Construction Example

```
INPUT:
├─ Trade: "carpenter"
├─ Location: "Seattle"
└─ Platform: "facebook"

CONFIG (trades-config.json):
└─ carpenter:
   ├─ keywords: ["carpenter", "carpentry", "trim work"]
   ├─ required: ["+need", "+needed", "+looking for"]
   └─ exclude: ["-seeking work", "-I am a"]

PROCESSING:
1. Build keywords: (carpenter OR carpentry OR "trim work")
2. Add required: +need +needed +"looking for"
3. Add exclude: -"seeking work" -"I am a"
4. Add location: "Seattle"
5. Add time filter: (platform-specific, 24h)

OUTPUT QUERY:
(carpenter OR carpentry OR "trim work") +need +needed +"looking for" "Seattle" -"seeking work" -"I am a"

FINAL URL:
https://www.facebook.com/search/posts/?q=[encoded query]
```

## File Responsibilities

```
src/
├── components/
│   ├── LeadFinder.tsx
│   │   └─ Responsibilities:
│   │      • Render form UI
│   │      • Manage form state
│   │      • Handle user interactions
│   │      • Call query builder
│   │      • Display query preview
│   │
│   ├── LeadFinder.css
│   │   └─ Responsibilities:
│   │      • Component styling
│   │      • Responsive design
│   │      • Visual feedback
│   │
│   └── LeadFinderWithResults.tsx
│       └─ Responsibilities:
│          • Display search results
│          • Loading states
│          • Error handling
│
├── lib/
│   ├── queryBuilder.ts
│   │   └─ Responsibilities:
│   │      • Read trades-config.json
│   │      • Build search queries
│   │      • Format query explanations
│   │      • Generate platform URLs
│   │      • Pure logic (no UI)
│   │
│   └── searchAPI.ts
│       └─ Responsibilities:
│          • API integration examples
│          • Backend communication
│          • SerpAPI integration
│          • Error handling
│
├── App.tsx
│   └─ Responsibilities:
│      • App entry point
│      • Component integration
│      • Custom search handlers
│
└── main.tsx
    └─ Responsibilities:
       • React bootstrap
       • Root rendering
```

## Component Hierarchy

```
App
 └── LeadFinder
      ├── Trade Dropdown
      │    └── (Options from trades-config.json)
      │
      ├── Location Input
      │    └── (Free text)
      │
      ├── Platform Dropdown
      │    └── (Facebook, Nextdoor, Reddit)
      │
      ├── Search Button
      │    └── (Triggers query build + search)
      │
      └── Query Preview (Collapsible)
           ├── Full Query Display
           └── Breakdown Section
                ├── Keywords
                ├── Required
                ├── Exclude
                ├── Location
                └── Time Filter
```

## Alternative: With Results Display

```
App
 └── LeadFinderWithResults
      ├── LeadFinder (top)
      │    └── ... same as above
      │
      └── Results Section (bottom)
           ├── Loading State
           ├── Error State
           ├── No Results State
           └── Results Grid
                └── Result Cards
                     ├── Platform Badge
                     ├── Timestamp
                     ├── Title
                     ├── Content
                     └── Link to Post
```

## State Management

```
LeadFinder Component State:
┌──────────────────────────┐
│ trade: string            │ ← Selected trade key
│ location: string         │ ← User input
│ platform: string         │ ← Selected platform
│ showQueryPreview: bool   │ ← Toggle preview
└──────────────────────────┘

No global state needed!
Everything is local to the component.
```

## Query Builder Functions

```typescript
// Public API of queryBuilder.ts

getAvailableTrades()
  → Returns: Array<{ value: string, label: string }>
  → Purpose: Populate trade dropdown

buildSearchQuery(query: SearchQuery)
  → Returns: string (the full search query)
  → Purpose: Core query construction

formatQueryExplanation(query: SearchQuery)
  → Returns: { fullQuery, breakdown }
  → Purpose: Query preview display

getSearchUrl(query: SearchQuery)
  → Returns: string (full platform URL)
  → Purpose: Direct platform search
```

## Integration Points

```
┌─────────────────────────────────────────────┐
│         Your Existing Application           │
│                                              │
│  You can integrate at any of these points:  │
│                                              │
│  ① Component Level:                         │
│     import { LeadFinder } from './...'      │
│                                              │
│  ② Handler Level:                           │
│     onSearch={(query) => yourLogic(query)}  │
│                                              │
│  ③ API Level:                               │
│     Use queryBuilder functions directly     │
│                                              │
│  ④ Config Level:                            │
│     Just update trades-config.json          │
└─────────────────────────────────────────────┘
```

## Time Filter Implementation

```
24-Hour Filter (Hardcoded)

Platform-Specific Implementation:
├─ Facebook
│  └─ Query structure handles recency
│
├─ Reddit
│  └─ URL parameter: &t=day
│     (day = past 24 hours)
│
└─ Nextdoor
   └─ Query structure handles recency

To Change:
└─ Edit getSearchUrl() in queryBuilder.ts
   └─ Modify platform-specific URL generation
```

## Error Handling Flow

```
User Input
    ↓
Validation
    ├─ Missing field? → Show alert
    ├─ Invalid trade? → Show error
    └─ All valid? → Continue
         ↓
Query Building
    ├─ Config not found? → Throw error
    ├─ Invalid format? → Throw error
    └─ Success? → Continue
         ↓
Search Execution
    ├─ Network error? → Display error state
    ├─ API error? → Display error state
    └─ Success? → Show results or open platform
```

## Performance Considerations

```
trades-config.json
├─ Size: < 10 KB (minimal impact)
├─ Loaded: Once at app start
└─ Cached: By browser

Query Building
├─ Synchronous: No async needed
├─ Fast: < 1ms per query
└─ No API calls: Just string manipulation

Component Rendering
├─ Re-renders: Only on state change
├─ No heavy computations
└─ Responsive: Instant feedback
```

## Security Considerations

```
✓ No user input directly in URLs
  (All queries are encoded)

✓ No eval() or dynamic code execution
  (Safe string concatenation only)

✓ No XSS vulnerabilities
  (React escapes all content)

✓ No sensitive data in queries
  (Just trade terms and location)

⚠ Consider rate limiting
  (If using backend API)

⚠ Consider API key security
  (If using SerpAPI)
```

## Deployment Flow

```
Development:
├─ npm run dev
├─ Edit trades-config.json
├─ Test with Query Preview
└─ Verify searches work

Production Build:
├─ npm run build
├─ Output: dist/ folder
├─ Contains:
│  ├─ index.html
│  ├─ assets/index-*.js
│  └─ assets/index-*.css
└─ Deploy to:
   ├─ Netlify / Vercel
   ├─ Your own server
   └─ Or integrate into existing app
```

## Maintenance Tasks

```
Adding New Trade:
1. Edit trades-config.json
2. Add new entry
3. Test with Query Preview
4. Done! (No code changes needed)

Updating Existing Trade:
1. Edit keywords/required/exclude in JSON
2. Test query output
3. Done!

Adding New Platform:
1. Edit platforms array in LeadFinder.tsx
2. Add URL generation in getSearchUrl()
3. Test search
4. Done!

Changing Styling:
1. Edit LeadFinder.css
2. Modify colors/spacing/etc.
3. Test responsive design
4. Done!
```

---

This architecture is designed to be:
- **Simple** - Easy to understand and modify
- **Maintainable** - Changes in JSON, not code
- **Flexible** - Multiple integration options
- **Scalable** - Can grow with your needs
- **Performant** - Fast, no heavy operations
