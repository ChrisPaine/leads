import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { ExternalLink, Calendar, User, Eye, ThumbsUp, MessageCircle } from 'lucide-react';
import { 
  Facebook, 
  MessageCircle as Reddit, 
  Search as Google,
  Search,
  TrendingUp,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  Music
} from 'lucide-react';
import googleTrendsPreview from '@/assets/google-trends-preview.png';

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
  // Enhanced preview data
  fullDescription?: string;
  engagement?: {
    views?: number;
    likes?: number;
    comments?: number;
  };
  snippet?: string;
  tags?: string[];
  previewImage?: string;
}

interface SearchResultsProps {
  results: Record<string, SearchResult[]>;
  selectedPlatforms: string[];
  painPointPhrases: string[];
  mainTopic: string;
  isLoading?: boolean;
}

const platformIcons: Record<string, React.ElementType> = {
  facebook: Facebook,
  reddit: Reddit,
  'google-trends': TrendingUp,
  google: Google,
  twitter: Twitter,
  linkedin: Linkedin,
  instagram: Instagram,
  youtube: Youtube,
  tiktok: Music,
};

const platformNames: Record<string, string> = {
  facebook: 'Facebook',
  reddit: 'Reddit',
  'google-trends': 'Google Trends',
  google: 'Google',
  twitter: 'Twitter',
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
  youtube: 'YouTube',
  tiktok: 'TikTok',
};

const platformDomains: Record<string, string> = {
  facebook: 'facebook.com',
  reddit: 'reddit.com',
  'google-trends': 'trends.google.com',
  google: 'google.com',
  twitter: 'twitter.com',
  linkedin: 'linkedin.com',
  instagram: 'instagram.com',
  youtube: 'youtube.com',
  tiktok: 'tiktok.com',
};

const highlightPainPoints = (text: string, painPoints: string[], mainTopic?: string) => {
  if (!painPoints.length && !mainTopic) return text;
  
  let highlightedText = text;
  
  // First highlight pain points in bright yellow (like Google search highlighting)
  painPoints.forEach(phrase => {
    if (!phrase.trim()) return;
    const regex = new RegExp(`(${phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    highlightedText = highlightedText.replace(
      regex, 
      '<span style="background-color: #ffff00; color: #000; font-weight: bold; padding: 1px 2px;">$1</span>'
    );
  });
  
  // Then highlight main topic in bold (like Google titles)
  if (mainTopic && mainTopic.trim()) {
    const topicRegex = new RegExp(`(${mainTopic.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    highlightedText = highlightedText.replace(
      topicRegex, 
      '<span style="background-color: #ffff00; color: #000; font-weight: bold; padding: 1px 2px;">$1</span>'
    );
  }
  
  return highlightedText;
};

const sanitizeAuthor = (author?: string, platform?: string) => {
  if (!author) return '';
  let a = author;
  const removeWords = ['Facebook','LinkedIn','Reddit','YouTube','Twitter','X','TikTok','Instagram','Google','Quora'];
  removeWords.forEach(w => { const re = new RegExp(`\\b${w}\\b`, 'gi'); a = a.replace(re, ''); });
  a = a
    .replace(/^@/, '')
    .replace(/^u\//, '')
    .replace(/^r\//, '')
    .replace(/^(Page|Group)\s*:?/i, '')
    .replace(/-?\s*Official$/i, '')
    .replace(/^[\-–—\s]+/, '')
    .replace(/[\s\-–—]+$/,'')
    .replace(/\s{2,}/g, ' ')
    .trim();
  return a || author;
};

const SearchResultCard: React.FC<{ 
  result: SearchResult; 
  painPoints: string[];
  mainTopic: string;
}> = ({ result, painPoints, mainTopic }) => {
  const [preferredSide, setPreferredSide] = useState<'left' | 'right'>('right');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    window.open(result.url, '_blank', 'noopener,noreferrer');
  };

  const formatNumber = (num?: number) => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Track mouse position for hover card positioning
  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  // Determine hover card side based on card position
  const handleMouseEnter = () => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const cardWidth = 320; // w-80 = 320px
      const rightSpace = viewportWidth - rect.right;
      
      // If there's not enough space on the right (< card width + padding), show on the left
      setPreferredSide(rightSpace < cardWidth + 40 ? 'left' : 'right');
    }
  };

  return (
    <HoverCard openDelay={300} closeDelay={200}>
      <HoverCardTrigger asChild>
        <Card 
          ref={cardRef}
          className="hover:shadow-md transition-all duration-300 cursor-pointer border-l-4 border-l-primary/20 hover:border-l-primary/40 hover:scale-[1.01]"
          onMouseEnter={handleMouseEnter}
          onMouseMove={handleMouseMove}
        >
          <CardContent className="p-4 space-y-3">
            {/* Site info and title */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {result.favicon ? (
                  <img src={result.favicon} alt="" className="w-4 h-4" />
                ) : (
                  <div className="w-4 h-4 bg-muted rounded-sm" />
                )}
                <span className="truncate">{platformDomains[result.platform] || (() => { try { return new URL(result.url).hostname } catch { return '' } })()}</span>
              </div>
              
              <h3 
                className="text-lg font-medium text-primary hover:underline cursor-pointer line-clamp-2 transition-colors"
                onClick={handleClick}
                dangerouslySetInnerHTML={{
                  __html: highlightPainPoints(result.title, painPoints, mainTopic)
                }}
              />
              
            </div>

            {/* Description with highlighted pain points and preview image for Google Trends */}
            {result.previewImage ? (
              <div className="space-y-3">
                <img 
                  src={googleTrendsPreview} 
                  alt="Google Trends Preview" 
                  className="w-full h-32 object-cover rounded-md border"
                />
                <div 
                  className="text-sm text-muted-foreground leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: highlightPainPoints(result.description, painPoints, mainTopic)
                  }}
                />
              </div>
            ) : (
              <div 
                className="text-sm text-muted-foreground leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: highlightPainPoints(result.description, painPoints, mainTopic)
                }}
              />
            )}

            {result.painPointMatches && result.painPointMatches.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {result.painPointMatches.slice(0, 5).map((p, i) => (
                  <Badge key={i} variant="secondary" className="text-[10px]">
                    {p}
                  </Badge>
                ))}
              </div>
            )}

            {/* Metadata with grouped engagement metrics */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
              {result.date && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{result.date}</span>
                </div>
              )}
              {result.author && (
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  <span>{sanitizeAuthor(result.author, result.platform)}</span>
                </div>
              )}
              {/* Engagement metrics grouped together */}
              {result.engagement && (result.engagement.views || result.engagement.likes || result.engagement.comments) && (
                <div className="flex items-center gap-2">
                  {result.engagement.views && (
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>{formatNumber(result.engagement.views)}</span>
                    </div>
                  )}
                  {result.engagement.likes && (
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3" />
                      <span>{formatNumber(result.engagement.likes)}</span>
                    </div>
                  )}
                  {result.engagement.comments && (
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      <span>{formatNumber(result.engagement.comments)}</span>
                    </div>
                  )}
                </div>
              )}
              <div className="flex items-center gap-1">
                <ExternalLink className="w-3 h-3" />
                <span>Open link</span>
              </div>
            </div>

          </CardContent>
        </Card>
      </HoverCardTrigger>

      <HoverCardContent 
        className="w-80 p-4 animate-fade-in" 
        side={preferredSide}
        align="start"
        sideOffset={10}
        avoidCollisions={true}
        collisionPadding={20}
      >
        <div className="space-y-4">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {result.favicon ? (
                <img src={result.favicon} alt="" className="w-4 h-4" />
              ) : (
                <div className="w-4 h-4 bg-muted rounded-sm" />
              )}
              <span className="font-medium">{platformNames[result.platform]}</span>
              <span className="text-xs">•</span>
              <span>{result.date || 'Recent'}</span>
            </div>
            
            <h4 className="font-semibold text-base leading-tight">
              {result.title}
            </h4>
          </div>

          {/* What was found and where */}
          {result.painPointMatches && result.painPointMatches.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-primary">
                Found pain points: {result.painPointMatches.join(', ')}
              </div>
            </div>
          )}

          {/* Content source and extended description */}
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground">
              {result.platform === 'reddit' ? 'From post and comments:' : 
               result.platform === 'facebook' ? 'From post and engagement:' :
               result.platform === 'linkedin' ? 'From post content:' :
               result.platform === 'google-trends' ? 'Trending data:' :
               'Content preview:'}
            </div>
            
            {result.previewImage ? (
              <div className="space-y-3">
                <img 
                  src={googleTrendsPreview} 
                  alt="Google Trends Preview" 
                  className="w-full h-40 object-cover rounded-md border"
                />
                <div 
                  className="text-sm text-muted-foreground leading-relaxed max-h-40 overflow-y-auto"
                  dangerouslySetInnerHTML={{
                    __html: highlightPainPoints(
                      result.fullDescription || result.description, 
                      painPoints,
                      mainTopic
                    )
                  }}
                />
              </div>
            ) : (
              <div 
                className="text-sm text-muted-foreground leading-relaxed max-h-40 overflow-y-auto bg-muted/30 p-3 rounded border-l-2 border-primary/20"
                dangerouslySetInnerHTML={{
                  __html: highlightPainPoints(
                    result.fullDescription || result.description || result.snippet || "Content preview not available", 
                    painPoints,
                    mainTopic
                  )
                }}
              />
            )}
          </div>

          {/* Engagement stats - hide for Google Trends */}
          {result.engagement && result.platform !== 'google-trends' && (
            <div className="flex items-center gap-4 text-xs text-muted-foreground border-t pt-3">
              {result.engagement.views && (
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>{formatNumber(result.engagement.views)} views</span>
                </div>
              )}
              {result.engagement.likes && (
                <div className="flex items-center gap-1">
                  <ThumbsUp className="w-3 h-3" />
                  <span>{formatNumber(result.engagement.likes)} likes</span>
                </div>
              )}
              {result.engagement.comments && (
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-3 h-3" />
                  <span>{formatNumber(result.engagement.comments)} comments</span>
                </div>
              )}
            </div>
          )}

          {/* Tags */}
          {result.tags && result.tags.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground">Related topics:</div>
              <div className="flex flex-wrap gap-1">
                {result.tags.slice(0, 5).map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}


          {/* CTA */}
          <div className="border-t pt-3">
            <button 
              onClick={handleClick}
              className="w-full flex items-center justify-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              {result.platform === 'google-trends' ? 'View Google Trends' : 'Open full post'}
            </button>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

const SearchResults: React.FC<SearchResultsProps> = ({ 
  results, 
  selectedPlatforms, 
  painPointPhrases, 
  mainTopic,
  isLoading = false 
}) => {
  const [activeTab, setActiveTab] = useState(selectedPlatforms[0] || '');

  // Don't render if no results or not loading
  if (!isLoading && Object.keys(results).length === 0) {
    return null;
  }

  return (
    <div className="w-full mt-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Search className="w-6 h-6 text-primary" />
            Search Results
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Click any result to open it in a new tab. Pain points are highlighted in yellow.
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-3 text-muted-foreground">Searching platforms...</span>
              </div>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${selectedPlatforms.length}, 1fr)` }}>
                {selectedPlatforms.map((platform) => {
                  const Icon = platformIcons[platform];
                  const resultCount = results[platform]?.length || 0;
                  
                  return (
                    <TabsTrigger 
                      key={platform} 
                      value={platform}
                      className="flex items-center gap-2"
                    >
                      {Icon && <Icon className="w-4 h-4" />}
                      <span className="hidden sm:inline">
                        {platformNames[platform]}
                      </span>
                      <Badge variant="secondary" className="ml-1">
                        {resultCount}
                      </Badge>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {selectedPlatforms.map((platform) => (
                <TabsContent key={platform} value={platform} className="mt-6">
                  <div className="space-y-4">
                    {results[platform]?.length > 0 ? (
                      <>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                          <span>Found {results[platform].length} results</span>
                        </div>
                        {results[platform].map((result) => (
                          <SearchResultCard 
                            key={result.id} 
                            result={result} 
                            painPoints={painPointPhrases}
                            mainTopic={mainTopic}
                          />
                        ))}
                      </>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <div className="mb-2">No results found for {platformNames[platform]}</div>
                        <div className="text-sm">Try adjusting your search terms or pain point filters</div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SearchResults;