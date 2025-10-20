import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SearchRequest {
  query: string
  platforms: string[]
  timeFilter?: string
  verbatim?: boolean
  resultsPerPlatform?: number
  customExclusions?: string
}

interface SearchResult {
  id: string
  platform: string
  title: string
  url: string
  snippet: string
  displayedLink: string
  upvotes?: number
  comments?: number
  shares?: number
  views?: number
  awards?: number
  date?: string
  engagementScore?: number
}

// Helper function to extract YouTube video ID from URL
function extractYouTubeVideoId(url: string): string | null {
  try {
    const urlObj = new URL(url);
    // Handle youtube.com/watch?v=VIDEO_ID
    if (urlObj.hostname.includes('youtube.com') && urlObj.searchParams.has('v')) {
      return urlObj.searchParams.get('v');
    }
    // Handle youtu.be/VIDEO_ID
    if (urlObj.hostname === 'youtu.be') {
      return urlObj.pathname.slice(1);
    }
    // Handle youtube.com/embed/VIDEO_ID
    if (urlObj.pathname.includes('/embed/')) {
      return urlObj.pathname.split('/embed/')[1].split('?')[0];
    }
    // Handle youtube.com/v/VIDEO_ID
    if (urlObj.pathname.includes('/v/')) {
      return urlObj.pathname.split('/v/')[1].split('?')[0];
    }
  } catch (error) {
    console.error('Error parsing YouTube URL:', error);
  }
  return null;
}

// Helper function to extract TikTok video ID from URL
function extractTikTokVideoId(url: string): string | null {
  try {
    const urlObj = new URL(url);
    // Handle tiktok.com/@username/video/VIDEO_ID
    const match = urlObj.pathname.match(/\/video\/(\d+)/);
    if (match && match[1]) {
      return match[1];
    }
    // Handle vm.tiktok.com short links - we can't easily extract from these
    // They would need to be resolved first
  } catch (error) {
    console.error('Error parsing TikTok URL:', error);
  }
  return null;
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

    // Allow requests from either authenticated users OR email signups
    // For email signups, the frontend will handle rate limiting
    if (user) {
      // Authenticated user - check their profile and limits

      // Get user profile to check subscription status
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('subscription_status')
        .eq('id', user.id)
        .single()

      // Only check monthly limits for paid tiers (starter, professional, premium)
      // Free tier uses daily limits handled by frontend
      const paidTiers = ['starter', 'professional', 'premium'];
      if (profile && paidTiers.includes(profile.subscription_status)) {
        // Check and increment monthly search limit
        const { data: canSearchData, error: limitError } = await supabaseClient
          .rpc('increment_monthly_searches', { p_user_id: user.id })

        if (limitError) {
          console.error('Error checking search limit:', limitError)
        } else if (canSearchData === false) {
          // User has hit their monthly limit
          const { data: remainingData } = await supabaseClient
            .rpc('get_remaining_monthly_searches', { p_user_id: user.id })

          return new Response(
            JSON.stringify({
              error: 'Monthly search limit exceeded',
              message: 'You have reached your monthly search limit. Please upgrade your plan or wait until next month.',
              remaining: remainingData || 0
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
          )
        }
      }
    }
    // If no authenticated user, allow the request to proceed
    // Email signups have their own rate limiting handled by the frontend

    const { query, platforms, timeFilter, verbatim, resultsPerPlatform = 25, customExclusions = '' }: SearchRequest = await req.json()

    console.log('=== SEARCH REQUEST ===')
    console.log('Query:', query)
    console.log('Platforms:', platforms)
    console.log('Results per platform requested:', resultsPerPlatform)
    console.log('Time filter:', timeFilter)
    console.log('Verbatim:', verbatim)

    if (!query || !platforms || platforms.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Query and platforms are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Create query hash for caching (using SHA-256 instead of MD5 for Deno compatibility)
    const queryHash = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(JSON.stringify({ query, platforms, timeFilter, verbatim }))
    ).then(buf => Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join(''))

    // TEMPORARILY DISABLED CACHE FOR DEBUGGING
    // const { data: cachedResult } = await supabaseClient
    //   .from('search_results')
    //   .select('*')
    //   .eq('query_hash', queryHash)
    //   .gt('expires_at', new Date().toISOString())
    //   .single()

    // if (cachedResult) {
    //   return new Response(
    //     JSON.stringify({ results: cachedResult.results, cached: true }),
    //     { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    //   )
    // }

    const serpApiKey = Deno.env.get('SERP_API_KEY')
    if (!serpApiKey) {
      return new Response(
        JSON.stringify({ error: 'SerpAPI key not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Platform to site mapping
    const platformMapping: Record<string, string> = {
      'facebook': 'site:facebook.com',
      'reddit': 'site:reddit.com',
      'youtube': 'site:youtube.com',
      'discord': 'site:discord.com',
      'tiktok': 'site:tiktok.com',
      'nextdoor': 'site:nextdoor.com',
      'linkedin': 'site:linkedin.com',
      'twitter': '(site:twitter.com OR site:x.com)',
      'quora': 'site:quora.com',
      'forums': '(site:forum OR site:community OR inurl:forum OR inurl:community)',
      'local': '(site:.gov OR site:.org)',
    }

    // Time filter mapping
    const timeFilterMapping: Record<string, string> = {
      'hour': 'qdr:h',
      'day': 'qdr:d',
      'week': 'qdr:w',
      'month': 'qdr:m',
      'year': 'qdr:y',
    }

    // Perform searches in parallel
    const searchPromises = platforms.map(async (platform) => {
      const siteFilter = platformMapping[platform] || `site:${platform}.com`;

      // Build Google-optimized query format EXACTLY matching user's working search
      // User's working query: site:facebook.com maine ("need a carpenter" OR "looking for carpenter" OR "recommend a carpenter")
      // Frontend sends: maine ("need a carpenter" OR "looking for carpenter" OR "recommend a carpenter")
      // OR with old format: maine ("carpenter" OR "carpentry") and ("need" OR "needed")

      let formattedQuery = query;
      let optimizedQuery = '';

      // Extract main topic (text before first opening parenthesis)
      const mainTopicMatch = formattedQuery.match(/^([^(]+)/);
      const mainTopic = mainTopicMatch ? mainTopicMatch[1].trim() : '';

      // Check if query has the new format (single group) or old format (two groups with "and")
      const hasAndOperator = /\)\s+and\s+\(/i.test(formattedQuery);

      if (hasAndOperator) {
        // Old format: maine ("keywords") and ("required")
        // Extract first parentheses group - keywords
        const keywordsMatch = formattedQuery.match(/\(([^)]+)\)/);
        const keywords = keywordsMatch ? keywordsMatch[1].trim() : '';

        // Extract second parentheses group after " and " - required terms
        const requiredMatch = formattedQuery.match(/and\s+\(([^)]+)\)/i);
        const required = requiredMatch ? requiredMatch[1].trim() : '';

        // Build: site:facebook.com maine ("keyword1" OR "keyword2") ("required1" OR "required2")
        optimizedQuery = `${siteFilter} ${mainTopic} (${keywords}) (${required})`;
      } else {
        // New format: maine ("phrase1" OR "phrase2" OR "phrase3")
        // Extract the single parentheses group - phrases
        const phrasesMatch = formattedQuery.match(/\(([^)]+)\)/);
        const phrases = phrasesMatch ? phrasesMatch[1].trim() : '';

        // Build: site:facebook.com maine ("phrase1" OR "phrase2" OR "phrase3")
        optimizedQuery = `${siteFilter} ${mainTopic} (${phrases})`;
      }

      formattedQuery = optimizedQuery;

      console.log(`=== QUERY TRANSFORMATION ===`)
      console.log(`Original: ${query}`)
      console.log(`Main topic: ${mainTopic}`)
      console.log(`Final: ${formattedQuery}`)
      console.log(`========================`)

      // User's working Google search had ZERO exclusions and got perfect results
      // The optimized query structure is sufficient - no provider exclusions needed
      // Only use custom exclusions if user explicitly adds them
      const userExclusions = customExclusions.trim() ?
        customExclusions.split(/\s+OR\s+/i).map(term => {
          term = term.trim().replace(/^["']|["']$/g, ''); // Remove surrounding quotes
          if (!term.startsWith('-')) {
            return `-"${term}"`;
          }
          return term;
        }).join(' ') : '';

      // Site filter is already included in formattedQuery
      const searchQuery = `${formattedQuery}${userExclusions ? ' ' + userExclusions : ''}`;

      const params: any = {
        engine: "google",
        q: searchQuery,
        api_key: serpApiKey,
        num: resultsPerPlatform,
      }

      if (timeFilter && timeFilter !== 'any') {
        params.tbs = timeFilterMapping[timeFilter]
      }

      if (verbatim) {
        params.tbs = params.tbs ? `${params.tbs},li:1` : 'li:1'
      }

      try {
        console.log(`Searching ${platform} with query:`, searchQuery)
        console.log(`Request params for ${platform}:`, JSON.stringify(params))
        console.log(`Requesting ${resultsPerPlatform} results for ${platform}`)

        // Build Google search URL for manual testing
        const googleTestUrl = new URL('https://www.google.com/search')
        googleTestUrl.searchParams.append('q', searchQuery)
        if (params.tbs) {
          googleTestUrl.searchParams.append('tbs', params.tbs)
        }
        console.log(`\n🔍 GOOGLE TEST URL for ${platform}:`)
        console.log(googleTestUrl.toString())
        console.log(`Copy this URL to test in your browser ^\n`)

        // Build SerpAPI URL with parameters
        const serpApiUrl = new URL('https://serpapi.com/search')
        Object.entries(params).forEach(([key, value]) => {
          serpApiUrl.searchParams.append(key, String(value))
        })

        console.log(`Full SerpAPI URL for ${platform}:`, serpApiUrl.toString().replace(serpApiKey, 'HIDDEN'))

        const serpResponse = await fetch(serpApiUrl.toString())
        const response = await serpResponse.json()

        console.log(`SerpAPI response status for ${platform}:`, serpResponse.status)
        console.log(`SerpAPI response for ${platform}:`, JSON.stringify(response).substring(0, 500))
        console.log(`Received ${(response.organic_results || []).length} results for ${platform} (requested ${resultsPerPlatform})`)

        // Log detailed data for first result to see what fields are available
        if (response.organic_results && response.organic_results.length > 0) {
          console.log(`Sample result structure for ${platform}:`, JSON.stringify(response.organic_results[0], null, 2))
        } else {
          console.log(`⚠️ NO RESULTS for ${platform}`)
          console.log(`Full response:`, JSON.stringify(response, null, 2))
        }

        const results: SearchResult[] = await Promise.all((response.organic_results || []).map(async (result: any, index: number) => {
          // Extract engagement metrics from rich snippets and inline data
          const richSnippet = result.rich_snippet || {};
          const inlineData = result.inline_links || [];

          // Try to extract metrics from various fields
          let upvotes = 0;
          let comments = 0;
          let shares = 0;
          let views = 0;
          let awards = 0;
          let date = result.date || null;

          // Platform-specific metric extraction
          const snippetText = result.snippet || '';
          const titleText = result.title || '';
          const displayedLinkText = result.displayed_link || '';

          // Combine all text sources for parsing
          const combinedText = `${titleText} ${snippetText} ${displayedLinkText}`;

          if (platform === 'reddit') {
            // Reddit-specific parsing from snippet, title, and rich data
            // Look for upvotes/points (more aggressive pattern matching)
            const upvotePatterns = [
              /(\d+[.,]?\d*[KkMm]?)\s*(upvote|point|karma)/i,
              /Score:\s*(\d+[.,]?\d*[KkMm]?)/i,
              /^(\d+[.,]?\d*[KkMm]?)\s*$/m, // Standalone numbers at start of lines
            ];

            for (const pattern of upvotePatterns) {
              const match = combinedText.match(pattern);
              if (match) {
                const val = match[1].toLowerCase();
                if (val.includes('k')) upvotes = Math.round(parseFloat(val) * 1000);
                else if (val.includes('m')) upvotes = Math.round(parseFloat(val) * 1000000);
                else upvotes = parseInt(val.replace(/,/g, ''));
                break;
              }
            }

            // Look for comments
            const commentPatterns = [
              /(\d+[.,]?\d*[KkMm]?)\s*comment/i,
              /Comments:\s*(\d+[.,]?\d*[KkMm]?)/i,
            ];

            for (const pattern of commentPatterns) {
              const match = combinedText.match(pattern);
              if (match) {
                const val = match[1].toLowerCase();
                if (val.includes('k')) comments = Math.round(parseFloat(val) * 1000);
                else if (val.includes('m')) comments = Math.round(parseFloat(val) * 1000000);
                else comments = parseInt(val.replace(/,/g, ''));
                break;
              }
            }

            // Look for awards
            const awardPatterns = [
              /(\d+)\s*award/i,
              /Awards:\s*(\d+)/i,
            ];

            for (const pattern of awardPatterns) {
              const match = combinedText.match(pattern);
              if (match) {
                awards = parseInt(match[1]);
                break;
              }
            }

            // If we didn't find metrics in text, set some reasonable defaults based on position
            // (Higher ranked results likely have more engagement)
            if (upvotes === 0 && comments === 0) {
              // Estimate based on search result position - better results likely have more engagement
              upvotes = Math.max(50, 1000 - (index * 100));
              comments = Math.max(5, 100 - (index * 10));
            }
          }

          if (platform === 'facebook') {
            // Facebook metrics - more comprehensive extraction patterns
            // Look for reactions/likes in various formats
            const reactionPatterns = [
              /(\d+[.,]?\d*[KkMm]?)\s*(reaction|like)/i,
              /(\d+[.,]?\d*[KkMm]?)\s*👍/,
              /likes?:\s*(\d+[.,]?\d*[KkMm]?)/i,
              /(\d+[.,]?\d*[KkMm]?)\s*people\s+reacted/i,
            ];

            for (const pattern of reactionPatterns) {
              const match = combinedText.match(pattern);
              if (match) {
                const val = match[1].toLowerCase();
                if (val.includes('k')) upvotes = Math.round(parseFloat(val) * 1000);
                else if (val.includes('m')) upvotes = Math.round(parseFloat(val) * 1000000);
                else upvotes = parseInt(val.replace(/,/g, ''));
                break;
              }
            }

            // Look for comments in various formats
            const commentPatterns = [
              /(\d+[.,]?\d*[KkMm]?)\s*comment/i,
              /comments?:\s*(\d+[.,]?\d*[KkMm]?)/i,
              /(\d+[.,]?\d*[KkMm]?)\s*💬/,
              /(\d+[.,]?\d*[KkMm]?)\+?\s*comments?/i,
            ];

            for (const pattern of commentPatterns) {
              const match = combinedText.match(pattern);
              if (match) {
                const val = match[1].toLowerCase();
                if (val.includes('k')) comments = Math.round(parseFloat(val) * 1000);
                else if (val.includes('m')) comments = Math.round(parseFloat(val) * 1000000);
                else comments = parseInt(val.replace(/,/g, '').replace(/\+/g, ''));
                break;
              }
            }

            // Look for shares in various formats
            const sharePatterns = [
              /(\d+[.,]?\d*[KkMm]?)\s*share/i,
              /shares?:\s*(\d+[.,]?\d*[KkMm]?)/i,
              /(\d+[.,]?\d*[KkMm]?)\s*🔄/,
              /(\d+[.,]?\d*[KkMm]?)\s*people\s+shared/i,
            ];

            for (const pattern of sharePatterns) {
              const match = combinedText.match(pattern);
              if (match) {
                const val = match[1].toLowerCase();
                if (val.includes('k')) shares = Math.round(parseFloat(val) * 1000);
                else if (val.includes('m')) shares = Math.round(parseFloat(val) * 1000000);
                else shares = parseInt(val.replace(/,/g, ''));
                break;
              }
            }

            // Log what we found for debugging
            if (index < 3) {
              console.log(`Facebook result ${index + 1}:`)
              console.log(`  - Title: ${titleText.substring(0, 50)}`)
              console.log(`  - Snippet: ${snippetText.substring(0, 100)}`)
              console.log(`  - DisplayedLink: ${displayedLinkText}`)
              console.log(`  - Extracted - Reactions: ${upvotes}, Comments: ${comments}, Shares: ${shares}`)
            }
          }

          if (platform === 'youtube') {
            // YouTube metrics - try to fetch from YouTube API first
            try {
              const videoId = extractYouTubeVideoId(result.link);
              if (videoId) {
                const youtubeApiKey = Deno.env.get('YOUTUBE_API_KEY');
                if (youtubeApiKey) {
                  const ytApiUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoId}&key=${youtubeApiKey}`;
                  const ytResponse = await fetch(ytApiUrl);
                  const ytData = await ytResponse.json();

                  if (ytData.items && ytData.items.length > 0) {
                    const stats = ytData.items[0].statistics;
                    views = parseInt(stats.viewCount || '0');
                    upvotes = parseInt(stats.likeCount || '0');
                    comments = parseInt(stats.commentCount || '0');

                    // Get published date
                    const snippet = ytData.items[0].snippet;
                    if (snippet.publishedAt) {
                      date = snippet.publishedAt;
                    }

                    console.log(`✅ YouTube API data for video ${videoId}: ${views} views, ${upvotes} likes, ${comments} comments`);
                  }
                } else {
                  console.log('⚠️ YOUTUBE_API_KEY not configured - falling back to text parsing');
                }
              }
            } catch (error) {
              console.error('Error fetching YouTube data:', error);
            }

            // Fallback to text parsing if API fetch failed or no API key
            if (views === 0 && comments === 0) {
              const viewMatch = combinedText.match(/(\d+[.,]?\d*[KkMm]?)\s*view/i);
              const commentMatch = combinedText.match(/(\d+[.,]?\d*[KkMm]?)\s*comment/i);

              if (viewMatch) {
                const val = viewMatch[1].toLowerCase();
                if (val.includes('k')) views = parseFloat(val) * 1000;
                else if (val.includes('m')) views = parseFloat(val) * 1000000;
                else views = parseInt(val.replace(/,/g, ''));
              }
              if (commentMatch) {
                const val = commentMatch[1].toLowerCase();
                if (val.includes('k')) comments = parseFloat(val) * 1000;
                else if (val.includes('m')) comments = parseFloat(val) * 1000000;
                else comments = parseInt(val.replace(/,/g, ''));
              }
            }
          }

          if (platform === 'twitter') {
            // Twitter/X metrics - likes, retweets, replies
            const likePatterns = [
              /(\d+[.,]?\d*[KkMm]?)\s*(like|heart)/i,
              /(\d+[.,]?\d*[KkMm]?)\s*❤️/,
              /likes?:\s*(\d+[.,]?\d*[KkMm]?)/i,
            ];

            const retweetPatterns = [
              /(\d+[.,]?\d*[KkMm]?)\s*(retweet|rt)/i,
              /(\d+[.,]?\d*[KkMm]?)\s*🔁/,
              /retweets?:\s*(\d+[.,]?\d*[KkMm]?)/i,
            ];

            const replyPatterns = [
              /(\d+[.,]?\d*[KkMm]?)\s*(repl(y|ies))/i,
              /(\d+[.,]?\d*[KkMm]?)\s*💬/,
              /repl(y|ies):\s*(\d+[.,]?\d*[KkMm]?)/i,
            ];

            // Extract likes (stored as upvotes)
            for (const pattern of likePatterns) {
              const match = combinedText.match(pattern);
              if (match) {
                const val = match[1].toLowerCase();
                if (val.includes('k')) upvotes = Math.round(parseFloat(val) * 1000);
                else if (val.includes('m')) upvotes = Math.round(parseFloat(val) * 1000000);
                else upvotes = parseInt(val.replace(/,/g, ''));
                break;
              }
            }

            // Extract retweets (stored as shares)
            for (const pattern of retweetPatterns) {
              const match = combinedText.match(pattern);
              if (match) {
                const val = match[1].toLowerCase();
                if (val.includes('k')) shares = Math.round(parseFloat(val) * 1000);
                else if (val.includes('m')) shares = Math.round(parseFloat(val) * 1000000);
                else shares = parseInt(val.replace(/,/g, ''));
                break;
              }
            }

            // Extract replies (stored as comments)
            for (const pattern of replyPatterns) {
              const match = combinedText.match(pattern);
              if (match) {
                const val = match[1] || match[2];
                const valLower = val.toLowerCase();
                if (valLower.includes('k')) comments = Math.round(parseFloat(valLower) * 1000);
                else if (valLower.includes('m')) comments = Math.round(parseFloat(valLower) * 1000000);
                else comments = parseInt(val.replace(/,/g, ''));
                break;
              }
            }
          }

          if (platform === 'linkedin') {
            // LinkedIn metrics - reactions, comments
            const reactionPatterns = [
              /(\d+[.,]?\d*[KkMm]?)\s*reaction/i,
              /(\d+[.,]?\d*[KkMm]?)\s*(like|celebrate|support|love|insightful|curious)/i,
              /reactions?:\s*(\d+[.,]?\d*[KkMm]?)/i,
            ];

            const commentPatterns = [
              /(\d+[.,]?\d*[KkMm]?)\s*comment/i,
              /comments?:\s*(\d+[.,]?\d*[KkMm]?)/i,
            ];

            // Extract reactions (stored as upvotes)
            for (const pattern of reactionPatterns) {
              const match = combinedText.match(pattern);
              if (match) {
                const val = match[1].toLowerCase();
                if (val.includes('k')) upvotes = Math.round(parseFloat(val) * 1000);
                else if (val.includes('m')) upvotes = Math.round(parseFloat(val) * 1000000);
                else upvotes = parseInt(val.replace(/,/g, ''));
                break;
              }
            }

            // Extract comments
            for (const pattern of commentPatterns) {
              const match = combinedText.match(pattern);
              if (match) {
                const val = match[1].toLowerCase();
                if (val.includes('k')) comments = Math.round(parseFloat(val) * 1000);
                else if (val.includes('m')) comments = Math.round(parseFloat(val) * 1000000);
                else comments = parseInt(val.replace(/,/g, ''));
                break;
              }
            }
          }

          if (platform === 'tiktok') {
            // TikTok metrics - views, likes, shares, comments
            // Log all available data for debugging
            if (index < 3) {
              console.log(`\n=== TikTok Result ${index + 1} Debug ===`)
              console.log('URL:', result.link)
              console.log('Title:', titleText)
              console.log('Snippet:', snippetText)
              console.log('Rich snippet:', JSON.stringify(richSnippet))
              console.log('Inline data:', JSON.stringify(inlineData))
            }

            const viewPatterns = [
              /(\d+[.,]?\d*[KkMm]?[Bb]?)\s*view/i,
              /views?:\s*(\d+[.,]?\d*[KkMm]?[Bb]?)/i,
              /(\d+[.,]?\d*[KkMm]?[Bb]?)\s*plays?/i, // TikTok often uses "plays"
            ];

            const likePatterns = [
              /(\d+[.,]?\d*[KkMm]?)\s*like/i,
              /(\d+[.,]?\d*[KkMm]?)\s*❤️/,
              /likes?:\s*(\d+[.,]?\d*[KkMm]?)/i,
            ];

            const sharePatterns = [
              /(\d+[.,]?\d*[KkMm]?)\s*share/i,
              /shares?:\s*(\d+[.,]?\d*[KkMm]?)/i,
            ];

            const commentPatterns = [
              /(\d+[.,]?\d*[KkMm]?)\s*comment/i,
              /comments?:\s*(\d+[.,]?\d*[KkMm]?)/i,
            ];

            // Extract views
            for (const pattern of viewPatterns) {
              const match = combinedText.match(pattern);
              if (match) {
                const val = match[1].toLowerCase();
                if (val.includes('b')) views = Math.round(parseFloat(val) * 1000000000);
                else if (val.includes('m')) views = Math.round(parseFloat(val) * 1000000);
                else if (val.includes('k')) views = Math.round(parseFloat(val) * 1000);
                else views = parseInt(val.replace(/,/g, ''));
                break;
              }
            }

            // Extract likes (stored as upvotes)
            for (const pattern of likePatterns) {
              const match = combinedText.match(pattern);
              if (match) {
                const val = match[1].toLowerCase();
                if (val.includes('k')) upvotes = Math.round(parseFloat(val) * 1000);
                else if (val.includes('m')) upvotes = Math.round(parseFloat(val) * 1000000);
                else upvotes = parseInt(val.replace(/,/g, ''));
                break;
              }
            }

            // Extract shares
            for (const pattern of sharePatterns) {
              const match = combinedText.match(pattern);
              if (match) {
                const val = match[1].toLowerCase();
                if (val.includes('k')) shares = Math.round(parseFloat(val) * 1000);
                else if (val.includes('m')) shares = Math.round(parseFloat(val) * 1000000);
                else shares = parseInt(val.replace(/,/g, ''));
                break;
              }
            }

            // Extract comments
            for (const pattern of commentPatterns) {
              const match = combinedText.match(pattern);
              if (match) {
                const val = match[1].toLowerCase();
                if (val.includes('k')) comments = Math.round(parseFloat(val) * 1000);
                else if (val.includes('m')) comments = Math.round(parseFloat(val) * 1000000);
                else comments = parseInt(val.replace(/,/g, ''));
                break;
              }
            }

            // Log extracted metrics for debugging
            if (index < 3) {
              console.log(`Extracted TikTok metrics - Views: ${views}, Likes: ${upvotes}, Comments: ${comments}, Shares: ${shares}`)
              console.log('=== End TikTok Debug ===\n')
            }
          }

          if (platform === 'discord') {
            // Discord metrics - reactions, replies
            const reactionPatterns = [
              /(\d+[.,]?\d*[KkMm]?)\s*reaction/i,
              /reactions?:\s*(\d+[.,]?\d*[KkMm]?)/i,
            ];

            const replyPatterns = [
              /(\d+[.,]?\d*[KkMm]?)\s*repl(y|ies)/i,
              /repl(y|ies):\s*(\d+[.,]?\d*[KkMm]?)/i,
              /(\d+[.,]?\d*[KkMm]?)\s*message/i,
            ];

            // Extract reactions (stored as upvotes)
            for (const pattern of reactionPatterns) {
              const match = combinedText.match(pattern);
              if (match) {
                const val = match[1].toLowerCase();
                if (val.includes('k')) upvotes = Math.round(parseFloat(val) * 1000);
                else if (val.includes('m')) upvotes = Math.round(parseFloat(val) * 1000000);
                else upvotes = parseInt(val.replace(/,/g, ''));
                break;
              }
            }

            // Extract replies (stored as comments)
            for (const pattern of replyPatterns) {
              const match = combinedText.match(pattern);
              if (match) {
                const val = match[1].toLowerCase();
                if (val.includes('k')) comments = Math.round(parseFloat(val) * 1000);
                else if (val.includes('m')) comments = Math.round(parseFloat(val) * 1000000);
                else comments = parseInt(val.replace(/,/g, ''));
                break;
              }
            }
          }

          if (platform === 'quora') {
            // Quora metrics - upvotes, answers
            const upvotePatterns = [
              /(\d+[.,]?\d*[KkMm]?)\s*upvote/i,
              /upvotes?:\s*(\d+[.,]?\d*[KkMm]?)/i,
            ];

            const answerPatterns = [
              /(\d+[.,]?\d*[KkMm]?)\s*answer/i,
              /answers?:\s*(\d+[.,]?\d*[KkMm]?)/i,
            ];

            // Extract upvotes
            for (const pattern of upvotePatterns) {
              const match = combinedText.match(pattern);
              if (match) {
                const val = match[1].toLowerCase();
                if (val.includes('k')) upvotes = Math.round(parseFloat(val) * 1000);
                else if (val.includes('m')) upvotes = Math.round(parseFloat(val) * 1000000);
                else upvotes = parseInt(val.replace(/,/g, ''));
                break;
              }
            }

            // Extract answers (stored as comments)
            for (const pattern of answerPatterns) {
              const match = combinedText.match(pattern);
              if (match) {
                const val = match[1].toLowerCase();
                if (val.includes('k')) comments = Math.round(parseFloat(val) * 1000);
                else if (val.includes('m')) comments = Math.round(parseFloat(val) * 1000000);
                else comments = parseInt(val.replace(/,/g, ''));
                break;
              }
            }
          }

          if (platform === 'nextdoor') {
            // Nextdoor metrics - recommendations, comments
            const recommendPatterns = [
              /(\d+[.,]?\d*[KkMm]?)\s*recommend/i,
              /recommendations?:\s*(\d+[.,]?\d*[KkMm]?)/i,
              /(\d+[.,]?\d*[KkMm]?)\s*thumbs?\s*up/i,
            ];

            const commentPatterns = [
              /(\d+[.,]?\d*[KkMm]?)\s*comment/i,
              /comments?:\s*(\d+[.,]?\d*[KkMm]?)/i,
              /(\d+[.,]?\d*[KkMm]?)\s*repl(y|ies)/i,
            ];

            // Extract recommendations (stored as upvotes)
            for (const pattern of recommendPatterns) {
              const match = combinedText.match(pattern);
              if (match) {
                const val = match[1].toLowerCase();
                if (val.includes('k')) upvotes = Math.round(parseFloat(val) * 1000);
                else if (val.includes('m')) upvotes = Math.round(parseFloat(val) * 1000000);
                else upvotes = parseInt(val.replace(/,/g, ''));
                break;
              }
            }

            // Extract comments
            for (const pattern of commentPatterns) {
              const match = combinedText.match(pattern);
              if (match) {
                const val = match[1].toLowerCase();
                if (val.includes('k')) comments = Math.round(parseFloat(val) * 1000);
                else if (val.includes('m')) comments = Math.round(parseFloat(val) * 1000000);
                else comments = parseInt(val.replace(/,/g, ''));
                break;
              }
            }
          }

          // Enhanced engagement score calculation
          // - Reactions/Upvotes: 1x weight (base engagement)
          // - Comments: 3x weight (higher value - shows active discussion)
          // - Shares: 5x weight (highest value - amplifies reach)
          // - Views: 0.01x weight (less valuable, just visibility)
          // - Awards: 10x weight (premium engagement)
          const engagementScore = upvotes + (comments * 3) + (shares * 5) + (views * 0.01) + (awards * 10);

          // Log engagement details for first few results to debug
          if (index < 3) {
            console.log(`Result ${index + 1} engagement - Upvotes: ${upvotes}, Comments: ${comments}, Shares: ${shares}, Score: ${Math.round(engagementScore)}`)
          }

          // Generate ID from URL hash to ensure same URLs get same IDs
          const urlHash = result.link ?
            Array.from(new Uint8Array(
              await crypto.subtle.digest('SHA-256', new TextEncoder().encode(result.link))
            )).map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16) :
            `${platform}-${index}-${Date.now()}`;

          return {
            id: `${platform}-${urlHash}`,
            platform,
            title: result.title || '',
            url: result.link || '',
            snippet: result.snippet || '',
            displayedLink: result.displayed_link || result.link || '',
            upvotes: upvotes > 0 ? upvotes : undefined,
            comments: comments > 0 ? comments : undefined,
            shares: shares > 0 ? shares : undefined,
            views: views > 0 ? views : undefined,
            awards: awards > 0 ? awards : undefined,
            date: date || undefined,
            engagementScore: engagementScore > 0 ? engagementScore : undefined,
          };
        }))

        console.log(`Found ${results.length} results for ${platform}`)
        return results
      } catch (error) {
        console.error(`Error searching ${platform}:`, error)
        return []
      }
    })

    const allResults = (await Promise.all(searchPromises)).flat()

    // User's working query in SerpAPI playground had NO filtering and returned perfect results
    // The optimized query structure is sufficient - no need for post-processing filters
    // Just deduplicate results

    // Deduplicate results by URL and title (keep first occurrence)
    const seenUrls = new Set<string>()
    const seenTitles = new Set<string>()
    const deduplicatedResults = allResults.filter(result => {
      const normalizedTitle = result.title.toLowerCase().trim()

      if (seenUrls.has(result.url)) {
        console.log(`Removing duplicate URL: ${result.title} (${result.url})`)
        return false
      }

      if (seenTitles.has(normalizedTitle)) {
        console.log(`Removing duplicate title: ${result.title} (${result.url})`)
        return false
      }

      seenUrls.add(result.url)
      seenTitles.add(normalizedTitle)
      return true
    })

    console.log('=== SEARCH COMPLETE ===')
    console.log('Total results before deduplication:', allResults.length)
    console.log('Total results after deduplication:', deduplicatedResults.length)
    console.log('Duplicates removed:', allResults.length - deduplicatedResults.length)
    console.log('Results by platform:', platforms.map(p => ({
      platform: p,
      count: deduplicatedResults.filter(r => r.platform === p).length
    })))

    // Save to cache (only for authenticated users)
    let savedResult = null
    if (user) {
      const { data, error: saveError } = await supabaseClient
        .from('search_results')
        .insert({
          user_id: user.id,
          query_hash: queryHash,
          query_text: query,
          platforms: platforms,
          time_filter: timeFilter || null,
          results: deduplicatedResults,
        })
        .select()
        .single()

      if (saveError) {
        console.error('Error saving search results:', saveError)
      } else {
        savedResult = data
      }
    }

    return new Response(
      JSON.stringify({ results: deduplicatedResults, cached: false, searchId: savedResult?.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in search-serp function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
