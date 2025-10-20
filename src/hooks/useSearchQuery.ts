import { useState, useCallback } from 'react';
import { platforms } from '@/constants/platforms';

interface AdvancedOptions {
  facebook: {
    groupId: string;
    publicPostsOnly: boolean;
    communityType: string[];
  };
  reddit: {
    selfPostsOnly: boolean;
    minScore: boolean;
    scoreThreshold: number;
    author: string;
  };
  tiktok: {
    hashtagTrends: string[];
    contentTypes: string[];
    soundTrends: boolean;
    challengeId: boolean;
    creatorCollabs: string[];
    creatorTier: string[];
    specificCreator: string;
    minEngagement: boolean;
    engagementThreshold: number;
    viralPatterns: string[];
    brandMentions: boolean;
    crossPlatformTrends: boolean;
    realTimeAlerts: boolean;
    strictRecency: boolean;
  };
  twitter: {
    verifiedOnly: boolean;
    hasMedia: boolean;
    emotionalContent: boolean;
    communityValidation: boolean;
    opinions: boolean;
    rants: boolean;
    experiences: boolean;
    searchLists: boolean;
    searchCommunities: boolean;
  };
  instagram: {
    linkInBio: boolean;
    swipeUp: boolean;
    reelsOnly: boolean;
  };
  linkedin: {
    publicPosts: boolean;
    pulseArticles: boolean;
    companyPosts: boolean;
    industrySpecific: boolean;
    roleBased: boolean;
    targetRole: string;
  };
  youtube: {
    commentsSearch: boolean;
    videoContent: boolean;
    channelSpecific: boolean;
    videoReactions: boolean;
    tutorialFeedback: boolean;
    productReviews: boolean;
    longTermReviews: boolean;
  };
}

export const useSearchQuery = () => {
  const [generatedQuery, setGeneratedQuery] = useState('');
  const [lastLinks, setLastLinks] = useState<{ name: string; url: string; display: string }[]>([]);

  const generateQuery = useCallback((
    selectedPlatforms: string[] = [],
    selectedPhrases: string[] = [],
    mainTopic: string = '',
    additionalKeywords: string = '',
    advancedOptions: AdvancedOptions,
    timeFilter: 'any' | 'hour' | 'day' | 'week' | 'month' | 'year' = 'any',
    googleTrendsCategory: string = '0'
  ) => {
    if (!selectedPlatforms || !selectedPhrases) {
      setGeneratedQuery('');
      setLastLinks([]);
      return;
    }

    if (selectedPlatforms.length === 0 && !mainTopic && selectedPhrases.length === 0) {
      setGeneratedQuery('');
      setLastLinks([]);
      return;
    }

    const links = [];
    const rawQuery = mainTopic.trim();
    const hasMainTopic = rawQuery !== '';

    for (const platformId of selectedPlatforms) {
      const platform = platforms.find(p => p.id === platformId);
      if (!platform) continue;

      let url = '';
      let displayUrl = '';

      // Special handling for Google Trends - direct platform URL
      if (platformId === 'google-trends') {
        const trendsQuery = encodeURIComponent(rawQuery);
        const categoryParam = googleTrendsCategory !== '0' ? `&cat=${googleTrendsCategory}` : '';
        url = `https://trends.google.com/trends/explore?date=all&q=${trendsQuery}${categoryParam}&hl=en`;
        displayUrl = `Google Trends: ${rawQuery}`;
        links.push({ name: platform.name, url, display: displayUrl });
        continue;
      }

      // All other platforms use Google search with site: operator
      const topicPart = rawQuery;
      const kw2 = additionalKeywords.trim();

      // Build keywords token
      let keywordsToken = '';
      if (kw2) {
        // Check if kw2 contains the pattern (quoted terms) and (quoted terms)
        // This happens when both commentsSearch and contactsSearch have values
        const andMatch = kw2.match(/^\((.+?)\)\s+and\s+\((.+?)\)$/i);
        if (andMatch) {
          // Handle the pattern: (group1) and (group2)
          const group1 = andMatch[1];
          const group2 = andMatch[2];

          // Extract quoted terms from each group and join with OR
          const quoted1 = Array.from(group1.matchAll(/"([^"]+)"/g)).map((m) => m[1]);
          const quoted2 = Array.from(group2.matchAll(/"([^"]+)"/g)).map((m) => m[1]);

          const orPhrases1 = quoted1.map((p) => `"${p}"`).join(' OR ');
          const orPhrases2 = quoted2.map((p) => `"${p}"`).join(' OR ');

          keywordsToken = `intext:(${orPhrases1}) and (${orPhrases2})`;
        } else {
          const quoted2 = Array.from(kw2.matchAll(/"([^"]+)"/g)).map((m) => m[1]);
          if (quoted2.length > 0) {
            const orPhrases2 = quoted2.map((p) => `"${p}"`).join(' OR ');
            keywordsToken = `intext:(${orPhrases2})`;
          } else {
            keywordsToken = `intext:"${kw2}"`;
          }
        }
      }

      // Build platform-specific token for Google search
      let platformToken = '';
      if (platformId === 'reddit') {
        platformToken = 'site:reddit.com (inurl:comments OR inurl:thread)';
      } else {
        platformToken = platform.site;
      }

      // Build platform-specific query in the correct format
      const quotedTopic = `"${topicPart}"`;
      const phrasesToken = selectedPhrases.length > 0 ? `intext:(${selectedPhrases.map((phrase) => `"${phrase}"`).join(' OR ')})` : '';

      // Combine platform site, pain point phrases, and additional keywords inside one group
      const combinedTokens = [platformToken, phrasesToken, keywordsToken].filter(Boolean).join(' ');

      // Final query format
      const platformQuery = combinedTokens ? `${quotedTopic} (${combinedTokens})` : quotedTopic;

      // Build Google search URL
      const engineBase = 'https://www.google.com/search?q=';
      let baseUrl = `${engineBase}${encodeURIComponent(platformQuery)}`;

      // Build tbs tokens for Google time filtering
      const timeParams = {
        hour: 'qdr:h',
        day: 'qdr:d',
        week: 'qdr:w',
        month: 'qdr:m',
        year: 'qdr:y',
      } as const;

      // Build tbs parameter for time filtering
      if (timeFilter !== 'any') {
        baseUrl += `&tbs=${timeParams[timeFilter]}`;
      }
      // Add verbatim mode as a separate parameter
      baseUrl += `&li=1`;

      url = baseUrl;
      displayUrl = `${engineBase}${platformQuery}`;

      links.push({ name: platform.name, url, display: displayUrl });
    }

    setLastLinks(links);
    setGeneratedQuery('Generated');
  }, []);

  return {
    generatedQuery,
    setGeneratedQuery,
    lastLinks,
    setLastLinks,
    generateQuery
  };
};
