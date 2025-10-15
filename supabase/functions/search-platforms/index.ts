import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SearchRequest {
  mainTopic: string;
  additionalKeywords?: string;
  platforms: string[];
  timeFilter?: string;
}

interface SearchResult {
  id: string;
  title: string;
  url: string;
  description: string;
  date?: string;
  author?: string;
  platform: string;
  favicon?: string;
  painPointMatches: string[];
  previewImage?: boolean;
  engagement?: {
    views?: number;
    likes?: number;
    comments?: number;
  };
}

async function searchPlatform(platform: string, query: string): Promise<SearchResult[]> {
  try {
    console.log(`Searching ${platform} for: ${query}`);
    
    // Generate mock search results instead of using external APIs
    const mockResults: SearchResult[] = [];
    const numResults = Math.floor(Math.random() * 8) + 3; // 3-10 results
    
    const painPointIndicators = [
      'problem', 'issue', 'frustrat', 'difficult', 'struggle', 'annoying', 
      'hate', 'wish', 'need', 'looking for', 'help', 'solution'
    ];
    
    const platformDomains = {
      facebook: 'facebook.com',
      reddit: 'reddit.com',
      twitter: 'twitter.com', 
      linkedin: 'linkedin.com',
      youtube: 'youtube.com',
      instagram: 'instagram.com',
      tiktok: 'tiktok.com'
    };
    
    const sampleTitles = {
      facebook: [
        `Anyone else struggling with ${query}?`,
        `Looking for help with ${query} - frustrated!`,
        `${query} problems - need advice`,
        `Why is ${query} so difficult?`,
        `Has anyone found a solution for ${query}?`
      ],
      reddit: [
        `[Discussion] Major issues with ${query}`,
        `Why does ${query} have to be so complicated?`,
        `LPT: Avoid these ${query} mistakes I made`,
        `${query} is driving me crazy - help!`,
        `What I wish I knew about ${query} before starting`
      ],
      twitter: [
        `Ugh, ${query} is so frustrating right now 😤`,
        `Anyone else hate dealing with ${query}?`,
        `Hot take: ${query} shouldn't be this hard`,
        `${query} problems got me like 😩`,
        `Why is finding good ${query} so difficult?`
      ],
      linkedin: [
        `The hidden challenges of ${query} in 2024`,
        `3 common ${query} mistakes that cost me thousands`,
        `Why most ${query} strategies fail (and what works)`,
        `My biggest ${query} pain points as a professional`,
        `The real problems with ${query} nobody talks about`
      ],
      youtube: [
        `${query} Problems Nobody Warns You About`,
        `Why ${query} Doesn't Work (My Experience)`,
        `${query} Mistakes That Cost Me Everything`,
        `The Truth About ${query} - Honest Review`,
        `How I Finally Solved My ${query} Problems`
      ],
      instagram: [
        `Real talk about ${query} struggles 💯`,
        `${query} isn't as easy as it looks...`,
        `The ${query} problems nobody shows you`,
        `Honest review: ${query} reality check`,
        `${query} expectations vs reality 😅`
      ],
      tiktok: [
        `${query} problems be like... 😭`,
        `POV: You're struggling with ${query}`,
        `Things I wish I knew about ${query}`,
        `${query} red flags 🚩`,
        `Why ${query} is actually harder than you think`
      ]
    };
    
    for (let i = 0; i < numResults; i++) {
      const titles = sampleTitles[platform as keyof typeof sampleTitles] || [`${query} discussion #${i + 1}`];
      const title = titles[Math.floor(Math.random() * titles.length)];
      
      const painPointMatches = painPointIndicators.filter(() => Math.random() > 0.6);
      
      const mockResult: SearchResult = {
        id: `${platform}-${i}`,
        title,
        url: `https://${platformDomains[platform as keyof typeof platformDomains] || 'example.com'}/post/${i + 1}`,
        description: `Discussion about ${query} showing real user experiences and pain points. Users share their struggles and solutions.`,
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        author: `user${Math.floor(Math.random() * 1000)}`,
        platform,
        painPointMatches,
        engagement: {
          views: Math.floor(Math.random() * 10000) + 100,
          likes: Math.floor(Math.random() * 1000) + 10,
          comments: Math.floor(Math.random() * 500) + 5,
        }
      };
      
      mockResults.push(mockResult);
    }

    console.log(`Found ${mockResults.length} results for ${platform}`);
    return mockResults;

  } catch (error) {
    console.error(`Error searching ${platform}:`, error);
    return [];
  }
}

async function generateGoogleTrendsResult(mainTopic: string): Promise<SearchResult[]> {
  // Generate a mock Google Trends result since we can't easily access the actual API
  return [{
    id: 'google-trends-1',
    title: `"${mainTopic}" - Search Interest Over Time`,
    url: `https://trends.google.com/trends/explore?q=${encodeURIComponent(mainTopic)}`,
    description: `Search interest for "${mainTopic}" has shown consistent activity over the past 12 months. Peak interest typically occurs during specific seasonal patterns, with notable spikes indicating emerging opportunities in this market.`,
    platform: 'google-trends',
    painPointMatches: ['interest', 'opportunity', 'trending'],
    previewImage: true,
    engagement: {
      views: Math.floor(Math.random() * 50000) + 10000,
    }
  }];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mainTopic, additionalKeywords, platforms }: SearchRequest = await req.json();
    
    console.log('Search request:', { mainTopic, additionalKeywords, platforms });
    
    if (!mainTopic || platforms.length === 0) {
      return new Response(JSON.stringify({ 
        error: 'Missing required parameters: mainTopic and platforms' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // No external API keys needed for mock search

    // Build search query
    let searchQuery = mainTopic;
    if (additionalKeywords) {
      searchQuery += ` ${additionalKeywords}`;
    }

    const results: Record<string, SearchResult[]> = {};

    // Search each platform
    const searchPromises = platforms.map(async (platform) => {
      if (platform === 'google-trends') {
        results[platform] = await generateGoogleTrendsResult(mainTopic);
      } else {
        results[platform] = await searchPlatform(platform, searchQuery);
      }
    });

    await Promise.all(searchPromises);

    console.log('Search completed:', Object.keys(results).map(k => `${k}: ${results[k].length}`));

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in search-platforms function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      results: {}
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});