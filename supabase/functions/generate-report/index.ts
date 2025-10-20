import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import OpenAI from 'https://esm.sh/openai@4.28.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GenerateReportRequest {
  reportType: 'summary' | 'mvp_builder'
  selectedResults: any[]
  searchResultId?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    const { reportType, selectedResults, searchResultId }: GenerateReportRequest = await req.json()

    if (!reportType || !selectedResults || selectedResults.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Report type and selected results are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Check if user has credits (for paid users) or is Pro/Premium/Enterprise/Agency
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('subscription_status')
      .eq('id', user.id)
      .single()

    const isPaidUser = profile?.subscription_status && ['pro', 'premium', 'enterprise', 'agency', 'admin'].includes(profile.subscription_status.toLowerCase())

    if (!isPaidUser) {
      return new Response(
        JSON.stringify({ error: 'This feature requires a paid subscription' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      )
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    const openai = new OpenAI({ apiKey: openaiApiKey })

    // Prepare content from selected results
    const content = selectedResults.map((result, index) =>
      `Source ${index + 1} [${result.platform}]:\nTitle: ${result.title}\nURL: ${result.url}\nContent: ${result.snippet}\n---`
    ).join('\n\n')

    let systemPrompt = ''
    let userPrompt = ''
    let maxTokens = 4000

    if (reportType === 'summary') {
      systemPrompt = `You are generating a Summary Report analyzing pain points from community discussions.

INPUT: Search results from social platforms (Reddit, Twitter, etc.) about [TOPIC]

OUTPUT FORMAT:

---

## 📊 EXECUTIVE SUMMARY
[Analyze key themes and pain points. Include confidence qualifier based on sample size:
- <10 discussions: Add "Medium-Low confidence based on X discussions - findings should be validated with additional research"
- 10-30 discussions: "Medium confidence based on X discussions"
- 30+: "High confidence based on X discussions"]

---

## 🎯 QUICK ANSWER
[One sentence summarizing the core insight]

---

## 💰 KEY METRICS
- **Context-Appropriate Metric**: [Choose based on topic type and format as:
  - Products/Services: "Price Range: $X - $Y"
  - Construction/Services with $/unit: "Cost Benchmark: $X/unit in [context]"
  - Medical/Recovery: "Time Investment: X weeks/months"
  - Learning/Skills: "Learning Curve: X hours/months"
  - Keep it concise - one line only]
- **Sample Size**: X discussions
- **Confidence Level**: [Low/Medium-Low/Medium/High based on sample size and data quality]
- **Trend**: [Growing/Stable/Declining/Unclear - with brief reason]
- **Geographic Concentration**: [ONLY if explicitly mentioned in discussions. Otherwise state "Not available from data"]

---

## 💡 KEY INSIGHTS

### What's Working ✅
[2-3 points with evidence from discussions]

### Common Mistakes ⚠️
[2-3 points with evidence]

### Hidden Costs/Considerations 💸
[Time, money, effort - whatever is relevant]

### Regional/Contextual Variations 📍
[ONLY if geographic differences appear in the data]

---

## 💬 WHAT REAL PEOPLE ARE SAYING
[Include 3-5 direct quotes with attribution and key takeaway for each]

**[Platform User (source)]:**
> "Quote"

**Key Takeaway**: [Insight]

---

## 📈 SENTIMENT ANALYSIS
- **Overall Sentiment**: [Positive/Negative/Mixed]
- **Consensus Level**: [High/Moderate/Low]
- **Controversy Index**: [High/Medium/Low]
- **Urgency Signals**: [High/Medium/Low with brief explanation]

---

## 🎬 RECOMMENDED ACTIONS
[3-5 specific, actionable recommendations for someone building a solution]

---

## ⚠️ IMPORTANT WARNINGS
[Top 2-3 misconceptions or risks mentioned frequently]
- **[Warning Title]**: [Description] - mentioned X times [or "recurring theme" if count unavailable]

---

## 🔍 DATA QUALITY ASSESSMENT
- **Source Credibility**: [Assessment]
- **Recency**: [Time range of discussions]
- **Sample Size**: [Number] unique perspectives
- **Limitations**: [Be honest about data gaps, sample size constraints, anecdotal nature]

---

## 🔗 SOURCES
[List top 3-5 most valuable discussions with engagement level and link]

---

## 📊 RELATED OPPORTUNITIES
- **Adjacent Markets**: [Related areas]
- **Content Angles**: [Potential topics/angles]
- **Partnership Ideas**: [Potential collaborations]

---

RULES:
1. Base everything on actual data provided - no speculation
2. Use exact quotes from discussions
3. Keep KEY METRICS lines concise (one line per bullet)
4. Be honest about sample size limitations in both exec summary AND confidence level
5. Skip sections where data doesn't exist
6. Focus on actionable insights for product builders`

      userPrompt = `Analyze these community discussions and generate a Summary Report following the exact format specified:

${content}`
    } else if (reportType === 'mvp_builder') {
      maxTokens = 6000
      systemPrompt = `You are generating an MVP Builder Report that provides product specifications and a ready-to-use AI builder prompt.

INPUT: Search results from social platforms about [TOPIC]

OUTPUT FORMAT:

---

## 🚀 PRODUCT CONCEPT

**Problem Space**: [One sentence - what pain point this addresses]

**Solution Concept**: [One sentence - what the MVP does]

**Target Market**: [Specific user type from discussions]

**Sample Size**: [X discussions analyzed]
**Confidence Level**: [If <10 discussions, add "Medium-Low confidence - validate findings with more research". If 10-30, say "Medium confidence". If 30+, say "High confidence"]

---

## 💔 PROBLEM STATEMENTS WITH EVIDENCE

[List 3-4 core problems. Each should have:]

**Problem [#]: [Clear problem title]**
- **Who has this**: [Specific user type]
- **Current bad solutions**: [What they're doing now]
- **Evidence from discussions**:
  "[Quote]" - [Platform]
  "[Different quote showing same problem]" - [Platform]
- **Pain level**: High/Medium/Low
- **Frequency**: [How often mentioned]

---

## ✨ CORE MVP FEATURES

[3-5 features max - focus on what can realistically be built]

**Feature [#]: [Feature Name]**
- **What it does**: [One clear sentence]
- **Solves problem**: [Link to problem # above]
- **User evidence**: "[Quote showing need]" - [Platform]
- **MVP Scope**: [Specifically what's included in v1]
- **Priority**: Must-have / Should-have

---

## 👥 USER PERSONAS FROM REAL DATA

[2-3 personas max, based on distinct user types found in discussions]

**Persona [#]: [Name] - [Role/Title]**
- **Background**: Age range, relevant context
- **Main pain point**: [Specific problem they have]
- **Current workaround**: [What they do now]
- **Real quote**: "[Actual quote from discussions]" - [Platform]
- **Success metric**: [What good looks like for them]
- **Technical comfort**: Low/Medium/High

---

## 💬 KEY USER QUOTES

[5-8 diverse quotes - avoid repetition from earlier sections]

**[#]. [Platform] - [Context]:**
"[Quote]"
**Product Implication**: [What this means for your MVP - be specific]

---

## 🎯 COMPETITIVE LANDSCAPE

**Current Solutions Users Mentioned:**
- [Solution 1]: [Why it's inadequate - with quote]
- [Solution 2]: [Why it's inadequate - with quote]

**Opportunity Gap**: [What's missing that you could build]

**Differentiation Angle**: [Based on what users actually want]

---

## 📊 MARKET VALIDATION

**Evidence of Demand:**
- [X] discussions analyzed
- [Y] unique pain points identified
- Key themes: [List 3-4 recurring themes]
- Urgency indicators: [Quote showing urgency]

**Adjacent Products/Markets:**
[What exists nearby that validates this space]

**Realistic MVP Scope:**
[What can actually be built in 17-30 min - be honest]

---

## 🔗 SOURCES & EVIDENCE

[List all sources analyzed]

**[#]. [Platform]: "[Discussion Title]"**
- Link: [URL]
- Engagement: [High/Medium/Low - based on comments/reactions]
- Key insight: [Main takeaway]
- Best quote: "[Quote]"

---

## 💻 READY-TO-USE AI BUILDER PROMPT

---
📋 COPY EVERYTHING FROM HERE DOWN ⬇️
Paste this entire section into Replit, Lovable.dev, or Bolt.new
---

# Product Brief: [Problem Space Description - NOT a branded product name]

## Overview
Build [description of what to build based on the pain points discovered].

**Core Value Proposition**: [One sentence - based on evidence]

## Target Users & Their Problems

[For each persona, format as:]

### [Persona Name/Type]
- **Profile**: [Background details]
- **Core Problem**: [Specific pain they have]
- **Current Bad Solution**: [What they do now]
- **Real Quote**: "[Quote from discussions]" - [Platform]
- **Success Metric**: [What they need to achieve]

## Problems This MVP Solves

### Problem 1: [Title]
**Evidence**: "[Quote 1]" - [Platform]
**Evidence**: "[Quote 2]" - [Platform]

**Current bad solution**: [What exists now]
**Why it fails**: [Specific reason from discussions]
**MVP Solution**: [What you'll build instead]

[Repeat for 3-4 core problems]

## What Real Users Are Saying

Include these actual user quotes in your UX/design decisions:

1. "[Quote]" - [Platform]
   → **Design implication**: [Specific UI/feature decision]

2. "[Quote]" - [Platform]
   → **Design implication**: [Specific UI/feature decision]

[5-8 quotes with implications]

## MVP Features (Priority Order)

### 1. [Feature Name] - MUST HAVE
**What it does**: [Clear description]
**Why it matters**: "[User quote showing need]"
**User story**: As a [user type], I want [feature] so that [benefit]
**Acceptance criteria**:
- [Specific, testable criteria]
- [Specific, testable criteria]

[Repeat for 3-5 features]

## Technical Stack Recommendation

[Base ALL recommendations on 'What can be built in 17-30 min' - prefer static/frontend-only solutions]

**Frontend**: [Suggest based on feature complexity - React for interactive, HTML/CSS for simple]
**Backend**: [ONLY if absolutely necessary - otherwise say "Not required for MVP - use frontend-only solution"]
**Database**: [ONLY if absolutely necessary - otherwise say "Not required for MVP - use local storage/state"]
**Key Libraries/APIs**: [Based on features - be specific and minimal]
**Realistic Build Time**: [17-30 min estimate based on scope]

## Design & UX Requirements

**Visual Style**: [Based on user persona technical comfort]
**Key User Flows**:
1. [Primary flow based on main use case]
2. [Secondary flow]

**Critical UX Considerations**:
- [Based on user pain points]
- [Based on user pain points]

**Accessibility**: [Minimum requirements]

## MVP Scope (What to Build First)

**Include in v1**:
- [Feature stripped to bare minimum]
- [Feature stripped to bare minimum]

**Explicitly EXCLUDE from MVP**:
- [Feature that can wait]
- [Feature that can wait]
- Auth/login (add later if needed)
- [ONLY include this if you recommended frontend-only: Backend/API (add later if needed)]
- [ONLY include this if you recommended local storage: Database (add later if needed)]

**Success Criteria for MVP**:
- [Testable outcome based on user problems]
- [Testable outcome based on user problems]

## Starting Point Suggestions

**Page Structure**:
- [Suggested page 1]
- [Suggested page 2]

**Data Structure**:
[If needed - basic JSON structure or state shape]

---
⛔ STOP COPYING HERE ⬆️
Everything above this line goes into your AI builder
---

RULES:
1. Base everything on actual data provided - no speculation
2. Use exact quotes from discussions
3. Be realistic about MVP scope (17-30 min build time)
4. Focus the AI builder prompt on actionable, specific requirements
5. Strip features to bare essentials for MVP
6. Include evidence and quotes throughout
7. Make the AI builder prompt copy-paste ready
8. NO contradictions: If you say "frontend-only", don't suggest backend. If you say "local storage", don't suggest database
9. Prefer frontend-only solutions unless data persistence across sessions is CRITICAL to solving the core problem
10. Use "Problem Space Description" not a branded product name (e.g., "Reddit Discussion Analyzer" not "RedditPro")`

      userPrompt = `Analyze these community discussions and generate a complete MVP Builder Report following the exact structure. Make the AI builder prompt detailed, realistic for a 17-30 minute build, and ready to paste into Lovable.dev, Bolt.new, or Replit:

${content}`
    }

    // Generate report using GPT-4
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: maxTokens,
    })

    const reportContent = completion.choices[0]?.message?.content || ''

    // Save report to database
    const { data: savedReport, error: saveError } = await supabaseClient
      .from('reports')
      .insert({
        user_id: user.id,
        search_result_id: searchResultId || null,
        report_type: reportType,
        selected_results: selectedResults,
        report_content: { markdown: reportContent },
      })
      .select()
      .single()

    if (saveError) {
      console.error('Error saving report:', saveError)
      return new Response(
        JSON.stringify({ error: 'Failed to save report' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    return new Response(
      JSON.stringify({
        report: savedReport,
        content: reportContent
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in generate-report function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
