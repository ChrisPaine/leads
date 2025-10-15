# UI Design - Simplified Lead Finder

## Visual Layout

```
┌─────────────────────────────────────────────────────────────┐
│                    BROWSER WINDOW                            │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                                                           │ │
│ │          [Purple Gradient Background]                    │ │
│ │                                                           │ │
│ │    ┌────────────────────────────────────────────┐       │ │
│ │    │         [White Card - Rounded]             │       │ │
│ │    │                                             │       │ │
│ │    │  Business Lead Finder                      │       │ │
│ │    │  Find clients looking for your services    │       │ │
│ │    │  (24-hour filter)                          │       │ │
│ │    │                                             │       │ │
│ │    │  ┌─────────────────────────────────────┐  │       │ │
│ │    │  │ I'm a:                               │  │       │ │
│ │    │  │ ┌─────────────────────────────────┐ │  │       │ │
│ │    │  │ │ Select your trade...        ▼ │ │  │       │ │
│ │    │  │ └─────────────────────────────────┘ │  │       │ │
│ │    │  └─────────────────────────────────────┘  │       │ │
│ │    │                                             │       │ │
│ │    │  ┌─────────────────────────────────────┐  │       │ │
│ │    │  │ Location:                            │  │       │ │
│ │    │  │ ┌─────────────────────────────────┐ │  │       │ │
│ │    │  │ │ e.g., Seattle, Portland, etc. │ │  │       │ │
│ │    │  │ └─────────────────────────────────┘ │  │       │ │
│ │    │  └─────────────────────────────────────┘  │       │ │
│ │    │                                             │       │ │
│ │    │  ┌─────────────────────────────────────┐  │       │ │
│ │    │  │ Platform:                            │  │       │ │
│ │    │  │ ┌─────────────────────────────────┐ │  │       │ │
│ │    │  │ │ Select platform...          ▼ │ │  │       │ │
│ │    │  │ └─────────────────────────────────┘ │  │       │ │
│ │    │  └─────────────────────────────────────┘  │       │ │
│ │    │                                             │       │ │
│ │    │  ┌─────────────────────────────────────┐  │       │ │
│ │    │  │  🔍 Find Leads  [Purple Button]    │  │       │ │
│ │    │  └─────────────────────────────────────┘  │       │ │
│ │    │                                             │       │ │
│ │    │  ─────────────────────────────────────────│       │ │
│ │    │                                             │       │ │
│ │    │  ┌─────────────────────────────────────┐  │       │ │
│ │    │  │ ▶ Query Preview    [For Testing]   │  │       │ │
│ │    │  └─────────────────────────────────────┘  │       │ │
│ │    │                                             │       │ │
│ │    │  [Collapsible - Shows when expanded]      │       │ │
│ │    │                                             │       │ │
│ │    └────────────────────────────────────────────┘       │ │
│ │                                                           │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Form Fields

### 1. Trade Dropdown

```
┌───────────────────────────────────────┐
│ I'm a:                                 │
│ ┌───────────────────────────────────┐ │
│ │ Carpenter                       ▼ │ │  ← Click to expand
│ └───────────────────────────────────┘ │
└───────────────────────────────────────┘

When Expanded:
┌───────────────────────────────────────┐
│ Select your trade...                  │
│ Carpenter                              │  ← From JSON
│ Plumber                                │  ← From JSON
│ Electrician                            │  ← From JSON
└───────────────────────────────────────┘
```

**Source:** Automatically populated from `trades-config.json`

**Behavior:**
- Shows trade "name" field as display text
- Uses key as value
- Alphabetically sorted
- Required field

### 2. Location Input

```
┌───────────────────────────────────────┐
│ Location:                              │
│ ┌───────────────────────────────────┐ │
│ │ Seattle                          │ │  ← Free text input
│ └───────────────────────────────────┘ │
└───────────────────────────────────────┘
```

**Placeholder:** "e.g., Seattle, Portland, etc."

**Behavior:**
- Free text input
- Added to query as quoted string
- Required field
- Trimmed before use

### 3. Platform Dropdown

```
┌───────────────────────────────────────┐
│ Platform:                              │
│ ┌───────────────────────────────────┐ │
│ │ Facebook                        ▼ │ │  ← Click to expand
│ └───────────────────────────────────┘ │
└───────────────────────────────────────┘

When Expanded:
┌───────────────────────────────────────┐
│ Select platform...                     │
│ Facebook                               │
│ Nextdoor                               │
│ Reddit                                 │
└───────────────────────────────────────┘
```

**Options:**
- Facebook
- Nextdoor
- Reddit

**Behavior:**
- Fixed list (not from JSON)
- Determines search URL format
- Required field

## Search Button

```
┌─────────────────────────────────────────┐
│    🔍  Find Leads                       │  ← Big, prominent
│    [Purple Gradient Button]             │  ← Eye-catching
└─────────────────────────────────────────┘

States:
┌─────────────────────────────────────────┐
│    🔍  Find Leads                       │  ← Enabled (hover effect)
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│    🔍  Find Leads                       │  ← Disabled (grayed out)
└─────────────────────────────────────────┘  ← When fields incomplete
```

**Behavior:**
- Disabled until all fields filled
- Hover: Lifts up with shadow
- Click: Builds query and opens search
- Smooth transitions

## Query Preview Section

### Collapsed State

```
┌─────────────────────────────────────────┐
│ ▶ Query Preview        [For Testing]   │  ← Click to expand
└─────────────────────────────────────────┘
```

### Expanded State

```
┌─────────────────────────────────────────┐
│ ▼ Query Preview        [For Testing]   │  ← Click to collapse
├─────────────────────────────────────────┤
│                                          │
│ Full Query:                              │
│ ┌──────────────────────────────────────┐│
│ │ (carpenter OR carpentry) +need      ││ ← Dark background
│ │ +needed "Seattle" -"seeking work"   ││ ← Green code text
│ └──────────────────────────────────────┘│
│                                          │
│ Breakdown:                               │
│ ┌──────────────────────────────────────┐│
│ │ Keywords: carpenter, carpentry       ││ ← Blue text
│ ├──────────────────────────────────────┤│
│ │ Required: +need +needed              ││ ← Green text
│ ├──────────────────────────────────────┤│
│ │ Exclude: -"seeking work"             ││ ← Red text
│ ├──────────────────────────────────────┤│
│ │ Location: Seattle                    ││ ← Purple text
│ ├──────────────────────────────────────┤│
│ │ Time Filter: 24 hours                ││ ← Orange text
│ └──────────────────────────────────────┘│
│                                          │
└─────────────────────────────────────────┘
```

**Purpose:**
- Testing and debugging
- Verify query construction
- Educational (shows what's happening)
- Only visible when all fields filled

## Color Scheme

### Primary Colors

```
Background Gradient:
├─ Start: #667eea (Soft Purple)
└─ End:   #764ba2 (Deep Purple)

Card:
└─ Background: #ffffff (White)

Text:
├─ Headings:  #1f2937 (Dark Gray)
├─ Labels:    #374151 (Medium Gray)
└─ Subtle:    #6b7280 (Light Gray)

Button:
├─ Background: Purple gradient (same as page bg)
├─ Text:       #ffffff (White)
└─ Shadow:     Soft black shadow
```

### Accent Colors (Query Preview)

```
Keywords:  #2563eb (Blue)
Required:  #16a34a (Green)
Exclude:   #dc2626 (Red)
Location:  #9333ea (Purple)
Time:      #ea580c (Orange)
Badge:     #dbeafe (Light Blue) bg, #1e40af (Dark Blue) text
```

## Responsive Design

### Desktop (> 640px)

```
┌─────────────────────────────────────────────────────────────┐
│                                                               │
│                    [Full Width Card]                         │
│                    Max-width: 600px                          │
│                    Centered                                  │
│                                                               │
│    Padding: 2.5rem                                           │
│    Font Size: Normal                                         │
└─────────────────────────────────────────────────────────────┘
```

### Mobile (≤ 640px)

```
┌──────────────────────────────────┐
│                                   │
│     [Narrower Card]              │
│     Full width - 1rem margins    │
│                                   │
│  Padding: 1.5rem                 │
│  Font Size: Slightly smaller     │
│  Button: Full width              │
└──────────────────────────────────┘
```

## Interactive States

### Form Focus

```
Normal:
┌───────────────────────────────────┐
│ Seattle                          │  ← Gray border
└───────────────────────────────────┘

Focused:
┌───────────────────────────────────┐
│ Seattle|                         │  ← Purple border
└───────────────────────────────────┘  ← Purple glow
```

### Button Hover

```
Default:
┌─────────────────────────────┐
│    🔍  Find Leads          │
└─────────────────────────────┘

Hover:
     ┌─────────────────────────────┐
     │    🔍  Find Leads          │  ← Lifted up
     └─────────────────────────────┘  ← Larger shadow
```

## Typography

```
Title (Business Lead Finder):
├─ Size: 2rem (32px)
├─ Weight: 700 (Bold)
└─ Color: #1f2937

Subtitle (Find clients...):
├─ Size: 0.95rem (15px)
├─ Weight: 400 (Normal)
└─ Color: #6b7280

Labels (I'm a:, Location:, Platform:):
├─ Size: 0.95rem (15px)
├─ Weight: 600 (Semi-bold)
└─ Color: #374151

Input Text:
├─ Size: 1rem (16px)
├─ Weight: 400 (Normal)
└─ Color: #1f2937

Button:
├─ Size: 1.125rem (18px)
├─ Weight: 600 (Semi-bold)
└─ Color: #ffffff
```

## Spacing

```
Form Groups: 1.5rem gap
Card Padding: 2.5rem
Border Radius: 0.5rem (inputs), 1rem (card)
Button Padding: 1rem vertical, 2rem horizontal
```

## Animations

### Button Hover

```css
Transform: translateY(-2px)
Duration: 0.2s
Easing: ease
```

### Focus State

```css
Border Color: Purple
Box Shadow: Purple glow (3px)
Duration: 0.2s
```

### Query Preview Toggle

```css
Opacity: 0 → 1
Max Height: 0 → auto
Duration: 0.3s
Easing: ease-in-out
```

## Accessibility

```
✓ All inputs have labels
✓ Focus states clearly visible
✓ Color contrast meets WCAG AA
✓ Keyboard navigation works
✓ Screen reader friendly
✓ Error states announced
✓ Button disabled state clear
```

## Visual Hierarchy

```
1. Title (Largest, Bold)
   └─ "Business Lead Finder"

2. Subtitle (Medium, Gray)
   └─ "Find clients looking for your services"

3. Form Labels (Semi-bold)
   └─ "I'm a:", "Location:", "Platform:"

4. Form Inputs (Standard)
   └─ Input fields and dropdowns

5. Button (Large, Colorful)
   └─ "Find Leads" - Most prominent

6. Query Preview (Subtle)
   └─ Collapsed by default, expandable
```

## User Flow Visual

```
1. User sees clean, simple form
       ↓
2. Selects trade from dropdown
       ↓
3. Types location
       ↓
4. Selects platform
       ↓
5. Button becomes enabled (color brightens)
       ↓
6. (Optional) Clicks "Query Preview" to verify
       ↓
7. Clicks "Find Leads" button
       ↓
8. New tab opens with search results
```

## Empty State

```
┌────────────────────────────────────────┐
│  Business Lead Finder                  │
│  Find clients looking for your         │
│  services (24-hour filter)             │
│                                         │
│  I'm a:                                │
│  [Select your trade...           ▼]   │
│                                         │
│  Location:                             │
│  [e.g., Seattle, Portland, etc.]      │
│                                         │
│  Platform:                             │
│  [Select platform...             ▼]   │
│                                         │
│  [🔍 Find Leads] (Disabled)           │
└────────────────────────────────────────┘
```

## Filled State

```
┌────────────────────────────────────────┐
│  Business Lead Finder                  │
│  Find clients looking for your         │
│  services (24-hour filter)             │
│                                         │
│  I'm a:                                │
│  [Carpenter                      ▼]   │
│                                         │
│  Location:                             │
│  [Seattle                         ]   │
│                                         │
│  Platform:                             │
│  [Facebook                       ▼]   │
│                                         │
│  [🔍 Find Leads] (Enabled, Hover)     │
│                                         │
│  ▶ Query Preview    [For Testing]     │
└────────────────────────────────────────┘
```

## Preview Expanded State

```
┌────────────────────────────────────────┐
│  ... (form above) ...                  │
│                                         │
│  ▼ Query Preview    [For Testing]     │
│  ┌──────────────────────────────────┐ │
│  │                                   │ │
│  │ Full Query:                       │ │
│  │ (carpenter OR carpentry) +need... │ │
│  │                                   │ │
│  │ Breakdown:                        │ │
│  │ Keywords: ...                     │ │
│  │ Required: ...                     │ │
│  │ Exclude: ...                      │ │
│  │ Location: Seattle                 │ │
│  │ Time Filter: 24 hours             │ │
│  │                                   │ │
│  └──────────────────────────────────┘ │
└────────────────────────────────────────┘
```

---

## Design Principles

1. **Simplicity** - Only essential fields visible
2. **Clarity** - Clear labels, obvious actions
3. **Feedback** - Visual states for all interactions
4. **Progressive Disclosure** - Advanced info hidden by default
5. **Accessibility** - Works for everyone
6. **Mobile-First** - Great on all devices
7. **Visual Appeal** - Modern, professional design

The design prioritizes ease of use while hiding complexity. Users can get started immediately without training or documentation.
