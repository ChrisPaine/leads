import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ExternalLink, ThumbsUp, MessageCircle, Share2, Eye, Clock } from 'lucide-react';
import { SearchResult, PLATFORM_COLORS, PLATFORM_NAMES } from '@/types/search';

const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

const highlightKeywords = (text: string, keywords: string[]): string => {
  if (!keywords || keywords.length === 0) return text;

  let highlightedText = text;

  // Sort keywords by length (longest first) to avoid partial matches overriding longer phrases
  const sortedKeywords = [...keywords].sort((a, b) => b.length - a.length);

  sortedKeywords.forEach(keyword => {
    if (keyword.length < 2) return; // Skip very short keywords

    // Escape special regex characters
    const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Create regex for case-insensitive match
    const regex = new RegExp(`(${escapedKeyword})`, 'gi');
    highlightedText = highlightedText.replace(regex, '<mark style="background: #FFFF00; color: #000000; padding: 2px 0; border-radius: 2px;">$1</mark>');
  });

  return highlightedText;
};

const extractKeywordsFromQuery = (query: string): string[] => {
  // Remove special characters and operators, split by spaces
  const cleaned = query
    .replace(/["()]/g, ' ') // Remove quotes and parentheses
    .replace(/\b(OR|AND|NOT|site:|inurl:|intext:)\b/gi, ' ') // Remove operators
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();

  return cleaned
    .split(' ')
    .filter(word => word.length > 2) // Only keep words longer than 2 chars
    .map(word => word.replace(/[^\w]/g, '')); // Remove remaining special chars
};

interface ResultCardProps {
  result: SearchResult;
  isSelected: boolean;
  onToggle: (id: string) => void;
  disabled?: boolean;
  searchQuery?: string;
  painPointPhrases?: string[];
}

export const ResultCard: React.FC<ResultCardProps> = ({
  result,
  isSelected,
  onToggle,
  disabled = false,
  searchQuery = '',
  painPointPhrases = []
}) => {
  const platformColor = PLATFORM_COLORS[result.platform] || '#666666';
  const platformName = PLATFORM_NAMES[result.platform] || result.platform;

  // Extract keywords from search query
  const keywords = extractKeywordsFromQuery(searchQuery);

  // Highlight with different colors: pain points = orange, main topic = yellow
  let highlightedSnippet = result.snippet;

  // First highlight pain point phrases in orange (higher priority - longer phrases)
  const sortedPainPoints = [...painPointPhrases].sort((a, b) => b.length - a.length);
  sortedPainPoints.forEach(phrase => {
    if (phrase.length < 2) return;
    const escapedPhrase = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedPhrase})`, 'gi');
    highlightedSnippet = highlightedSnippet.replace(regex, '<mark style="background: #FF9800; color: #fff; padding: 2px 4px; border-radius: 3px; font-weight: 500;">$1</mark>');
  });

  // Then highlight main keywords in yellow
  const sortedKeywords = [...keywords].sort((a, b) => b.length - a.length);
  sortedKeywords.forEach(keyword => {
    if (keyword.length < 2) return;
    const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?!<mark[^>]*>)(${escapedKeyword})(?![^<]*<\/mark>)`, 'gi');
    highlightedSnippet = highlightedSnippet.replace(regex, '<mark style="background: #FFEB3B; color: #000; padding: 2px 4px; border-radius: 3px;">$1</mark>');
  });

  return (
    <Card
      className={`relative transition-all duration-200 hover:shadow-lg cursor-pointer ${
        isSelected ? 'border-2 border-blue-500 bg-blue-50 dark:bg-blue-950/20' : ''
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={() => !disabled && onToggle(result.id)}
    >
      <CardContent className="p-4">
        {/* Platform Badge */}
        <div
          className="absolute top-3 left-3 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
          style={{ backgroundColor: result.platform === 'twitter' ? '#000000' : platformColor }}
          title={platformName}
        >
          {result.platform === 'twitter' ? 'X' : platformName.charAt(0)}
        </div>

        {/* Checkbox */}
        <div className="absolute top-3 right-3" onClick={(e) => e.stopPropagation()}>
          {disabled ? (
            <div className="w-5 h-5 flex items-center justify-center text-gray-400">
              🔒
            </div>
          ) : (
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onToggle(result.id)}
            />
          )}
        </div>

        {/* Content */}
        <div className="mt-8">
          {/* Title */}
          <h3
            className="font-semibold text-base mb-2 line-clamp-2 pr-8"
            dangerouslySetInnerHTML={{ __html: result.title }}
          />

          {/* Snippet */}
          <p
            className="text-sm text-muted-foreground line-clamp-3 mb-3"
            dangerouslySetInnerHTML={{ __html: highlightedSnippet }}
          />

          {/* Engagement Metrics Footer */}
          {(result.upvotes || result.comments || result.shares || result.views || result.date) && (
            <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-200 dark:border-gray-700 flex-wrap">
              {result.upvotes !== undefined && result.upvotes > 0 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span className="font-medium">{formatNumber(result.upvotes)}</span>
                </div>
              )}
              {result.comments !== undefined && result.comments > 0 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span className="font-medium">{formatNumber(result.comments)}</span>
                </div>
              )}
              {result.shares !== undefined && result.shares > 0 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="font-medium">{formatNumber(result.shares)}</span>
                </div>
              )}
              {result.views !== undefined && result.views > 0 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Eye className="w-3.5 h-3.5" />
                  <span className="font-medium">{formatNumber(result.views)}</span>
                </div>
              )}
              {result.date && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatDate(result.date)}</span>
                </div>
              )}
            </div>
          )}

          {/* Displayed Link and View Original */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500 truncate flex-1">
              {result.displayedLink}
            </span>
            <a
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-blue-600 hover:text-blue-800 ml-2 whitespace-nowrap"
              onClick={(e) => e.stopPropagation()}
            >
              View Original
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
