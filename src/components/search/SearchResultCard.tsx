import React from 'react';
import { SearchResult } from '@/types/search';
import { Checkbox } from '@/components/ui/checkbox';
import { MessageCircle, ThumbsUp, Share2, Eye, Award } from 'lucide-react';
import { platforms } from '@/constants/platforms';

interface SearchResultCardProps {
  result: SearchResult;
  isSelected: boolean;
  onToggleSelect: (result: SearchResult) => void;
  searchKeywords?: string[];
}

// Helper function to highlight keywords in text
const highlightKeywords = (text: string, keywords: string[] = []) => {
  if (!keywords.length) return <>{text}</>;

  // Create a regex pattern that matches any of the keywords (case insensitive)
  const pattern = keywords
    .filter(k => k.trim().length > 0)
    .map(k => k.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) // Escape special chars
    .join('|');

  if (!pattern) return <>{text}</>;

  const regex = new RegExp(`(${pattern})`, 'gi');
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) => {
        const isMatch = regex.test(part);
        regex.lastIndex = 0; // Reset regex
        return isMatch ? (
          <span key={i} className="bg-yellow-300 dark:bg-yellow-600 font-bold">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        );
      })}
    </>
  );
};

export const SearchResultCard: React.FC<SearchResultCardProps> = ({
  result,
  isSelected,
  onToggleSelect,
  searchKeywords = [],
}) => {
  const platform = platforms.find(p => p.id === result.platform);
  const PlatformIcon = platform?.icon;

  // Get platform-specific styling
  const getPlatformIconStyle = () => {
    switch (result.platform) {
      case 'facebook':
        return 'w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center';
      case 'reddit':
        return 'w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center';
      case 'twitter':
        return 'w-6 h-6 rounded bg-blue-400 flex items-center justify-center';
      case 'youtube':
        return 'w-6 h-6 rounded bg-red-600 flex items-center justify-center';
      case 'linkedin':
        return 'w-6 h-6 rounded bg-blue-700 flex items-center justify-center';
      case 'instagram':
        return 'w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center';
      case 'tiktok':
        return 'w-6 h-6 rounded bg-black flex items-center justify-center';
      default:
        return 'w-6 h-6 rounded flex items-center justify-center bg-gray-500';
    }
  };

  return (
    <div
      className="flex items-start gap-3 p-3 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors cursor-pointer"
      onClick={() => onToggleSelect(result)}
    >
      {/* Checkbox */}
      <Checkbox
        checked={isSelected}
        onCheckedChange={() => onToggleSelect(result)}
        className="mt-0.5"
        onClick={(e) => e.stopPropagation()}
      />

      {/* Platform Icon */}
      <div className={`${getPlatformIconStyle()} flex-shrink-0`}>
        {result.platform === 'facebook' ? (
          <span className="text-white text-xs font-bold">f</span>
        ) : result.platform === 'reddit' ? (
          <span className="text-white text-xs font-bold">r/</span>
        ) : result.platform === 'twitter' ? (
          <span className="text-white text-xs font-bold">𝕏</span>
        ) : result.platform === 'youtube' ? (
          <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        ) : result.platform === 'linkedin' ? (
          <span className="text-white text-xs font-bold">in</span>
        ) : result.platform === 'instagram' ? (
          <div className="w-3 h-3 border-2 border-white rounded-sm"></div>
        ) : result.platform === 'tiktok' ? (
          <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.10-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
          </svg>
        ) : PlatformIcon ? (
          <PlatformIcon className="w-4 h-4 text-white" />
        ) : null}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Title - clickable link */}
        <a
          href={result.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-base text-blue-600 hover:text-blue-700 hover:underline active:text-blue-900 visited:text-purple-600 dark:text-blue-400 dark:hover:text-blue-300 dark:active:text-blue-200 dark:visited:text-purple-400 transition-colors duration-200 line-clamp-2 block"
          onClick={(e) => e.stopPropagation()}
        >
          {highlightKeywords(result.title, searchKeywords)}
        </a>

        {/* Snippet */}
        {result.snippet && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {highlightKeywords(result.snippet, searchKeywords)}
          </p>
        )}

        {/* Engagement Metrics */}
        {(result.upvotes || result.comments || result.shares || result.views || result.awards) && (
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            {result.upvotes !== undefined && result.upvotes > 0 && (
              <div className="flex items-center gap-1">
                <ThumbsUp className="w-3 h-3" />
                <span>{result.upvotes.toLocaleString()}</span>
              </div>
            )}
            {result.comments !== undefined && result.comments > 0 && (
              <div className="flex items-center gap-1">
                <MessageCircle className="w-3 h-3" />
                <span>{result.comments.toLocaleString()}</span>
              </div>
            )}
            {result.shares !== undefined && result.shares > 0 && (
              <div className="flex items-center gap-1">
                <Share2 className="w-3 h-3" />
                <span>{result.shares.toLocaleString()}</span>
              </div>
            )}
            {result.views !== undefined && result.views > 0 && (
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span>{result.views.toLocaleString()}</span>
              </div>
            )}
            {result.awards !== undefined && result.awards > 0 && (
              <div className="flex items-center gap-1">
                <Award className="w-3 h-3" />
                <span>{result.awards}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
