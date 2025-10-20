import React, { useState, useMemo } from 'react';
import { SearchResult } from '@/types/search';
import { ResultCard } from './ResultCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SearchResultsGridProps {
  results: SearchResult[];
  loading?: boolean;
  error?: string;
  onGenerateReport: (selectedResults: SearchResult[]) => void;
  isPaidUser?: boolean;
  searchParams?: {
    query: string;
    platforms: string[];
    timeFilter?: string;
    verbatim?: boolean;
    painPointPhrases?: string[];
  } | null;
  onBackClick?: () => void;
  resultsPerPlatform?: number;
  onResultsPerPlatformChange?: (value: number) => void;
}

export const SearchResultsGrid: React.FC<SearchResultsGridProps> = ({
  results,
  loading = false,
  error,
  onGenerateReport,
  isPaidUser = false,
  searchParams,
  onBackClick,
  resultsPerPlatform = 25,
  onResultsPerPlatformChange
}) => {
  const [selectedResults, setSelectedResults] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'comments' | 'engagement' | 'date' | 'relevance'>('comments');
  const MAX_SELECTIONS = 10;

  // Calculate result counts per platform
  const platformCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    results.forEach(result => {
      counts[result.platform] = (counts[result.platform] || 0) + 1;
    });
    return counts;
  }, [results]);

  // Platform color mapping
  const platformColors: Record<string, string> = {
    facebook: 'bg-[#1877F2]/10 text-[#1877F2] border-[#1877F2]/20',
    reddit: 'bg-[#FF4500]/10 text-[#FF4500] border-[#FF4500]/20',
    youtube: 'bg-[#FF0000]/10 text-[#FF0000] border-[#FF0000]/20',
    twitter: 'bg-[#1DA1F2]/10 text-[#1DA1F2] border-[#1DA1F2]/20',
    linkedin: 'bg-[#0A66C2]/10 text-[#0A66C2] border-[#0A66C2]/20',
    tiktok: 'bg-[#000000]/10 text-[#000000] border-[#000000]/20',
    discord: 'bg-[#5865F2]/10 text-[#5865F2] border-[#5865F2]/20',
    quora: 'bg-[#B92B27]/10 text-[#B92B27] border-[#B92B27]/20',
    nextdoor: 'bg-[#00B246]/10 text-[#00B246] border-[#00B246]/20',
    forums: 'bg-[#6366F1]/10 text-[#6366F1] border-[#6366F1]/20',
    local: 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20',
  };

  // Time filter mapping to short display format
  const timeFilterDisplay: Record<string, string> = {
    'hour': 'Hour',
    'day': '24 hours',
    'week': 'Week',
    'month': 'Month',
    'year': 'Year',
    'any': 'All time',
  };

  // Extract and format query keywords for display
  const formatQueryForBadge = (query: string): string => {
    // Remove quotes and special characters, keep only words
    const cleanQuery = query.replace(/['"]/g, '').trim();
    const words = cleanQuery.split(/\s+/).filter(w => w.length > 0);

    // Take first 8-10 words
    const keywordCount = Math.min(10, words.length);
    const keywords = words.slice(0, keywordCount).join(' ');

    // Truncate if longer than 60 characters
    if (keywords.length > 60) {
      return keywords.substring(0, 57) + '...';
    }

    return keywords;
  };

  // Sort results based on selected option
  const sortedResults = useMemo(() => {
    const resultsCopy = [...results];

    switch (sortBy) {
      case 'comments':
        return resultsCopy.sort((a, b) => (b.comments || 0) - (a.comments || 0));
      case 'engagement':
        return resultsCopy.sort((a, b) => (b.engagementScore || 0) - (a.engagementScore || 0));
      case 'date':
        return resultsCopy.sort((a, b) => {
          if (!a.date) return 1;
          if (!b.date) return -1;
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
      case 'relevance':
      default:
        return resultsCopy; // Keep original order (from SerpAPI, already relevance-sorted)
    }
  }, [results, sortBy]);

  const handleToggle = (id: string) => {
    const newSelected = new Set(selectedResults);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      if (newSelected.size >= MAX_SELECTIONS) {
        // Show tooltip or toast that max selections reached
        return;
      }
      newSelected.add(id);
    }
    setSelectedResults(newSelected);
  };

  const getSelectedResultObjects = () => {
    return results.filter(r => selectedResults.has(r.id));
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {/* Header Card - Loading State */}
        <div className="bg-card border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={onBackClick}
              className="h-9 px-4 border-border bg-background hover:bg-accent"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Search
            </Button>

            <h1 className="text-3xl font-bold absolute left-1/2 transform -translate-x-1/2">
              Search Results
            </h1>

            <Badge variant="secondary" className="h-7 px-4 font-semibold text-sm">
              Selected: 0
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-24" />
            </div>
          </div>
        </div>

        {/* Loading Results */}
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Searching communities...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-48 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        {/* Header Card - Error State */}
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={onBackClick}
              className="h-9 px-4 border-border bg-background hover:bg-accent"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Search
            </Button>

            <h1 className="text-3xl font-bold absolute left-1/2 transform -translate-x-1/2">
              Search Results
            </h1>

            <Badge variant="secondary" className="h-7 px-4 font-semibold text-sm">
              Selected: 0
            </Badge>
          </div>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="space-y-4">
        {/* Header Card - No Results State */}
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={onBackClick}
              className="h-9 px-4 border-border bg-background hover:bg-accent"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Search
            </Button>

            <h1 className="text-3xl font-bold absolute left-1/2 transform -translate-x-1/2">
              Search Results
            </h1>

            <Badge variant="secondary" className="h-7 px-4 font-semibold text-sm">
              Selected: 0
            </Badge>
          </div>
        </div>

        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold mb-2">No results found</h3>
          <p className="text-muted-foreground">
            Try different keywords or platforms
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Card - Redesigned for cleaner layout */}
      <div className="bg-card border rounded-lg p-4 space-y-3">
        {/* Top Row: Back Button | Title | Selected Badge */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={onBackClick}
            className="h-9 px-4 border-border bg-background hover:bg-accent"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Search
          </Button>

          <h1 className="text-3xl font-bold absolute left-1/2 transform -translate-x-1/2">
            Search Results
          </h1>

          <Badge
            variant={selectedResults.size > 0 ? "default" : "secondary"}
            className="h-7 px-4 font-semibold text-sm"
          >
            Selected: {selectedResults.size}
            {selectedResults.size > 0 && (
              <span className="ml-1 opacity-70">/ {MAX_SELECTIONS}</span>
            )}
          </Badge>
        </div>

        {/* Second Row: Result Badges | Show Dropdown | Sort Dropdown */}
        <div className="flex items-center justify-between">
          {/* Left: Result count badges */}
          <div className="flex flex-wrap gap-2">
            {Object.entries(platformCounts).map(([platform, count]) => {
              const queryKeywords = searchParams?.query ? formatQueryForBadge(searchParams.query) : '';
              const timeFilter = searchParams?.timeFilter && searchParams.timeFilter !== 'any'
                ? timeFilterDisplay[searchParams.timeFilter] || searchParams.timeFilter
                : null;

              return (
                <Badge
                  key={platform}
                  variant="outline"
                  className={`text-xs font-medium whitespace-nowrap ${platformColors[platform] || 'bg-muted/10'}`}
                >
                  <span className="capitalize font-semibold">{platform}</span>
                  {queryKeywords && (
                    <>
                      <span className="mx-1">:</span>
                      <span className="lowercase">{queryKeywords}</span>
                    </>
                  )}
                  {timeFilter && (
                    <>
                      <span className="mx-1.5">•</span>
                      <span>{timeFilter}</span>
                    </>
                  )}
                  <span className="mx-1.5">•</span>
                  <span className="font-semibold">{count} result{count !== 1 ? 's' : ''}</span>
                </Badge>
              );
            })}
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Show:</span>
              <Select
                value={resultsPerPlatform.toString()}
                onValueChange={(value) => onResultsPerPlatformChange?.(parseInt(value))}
              >
                <SelectTrigger className="w-[160px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 per platform</SelectItem>
                  <SelectItem value="25">25 per platform</SelectItem>
                  <SelectItem value="50">50 per platform</SelectItem>
                  <SelectItem value="100">100 per platform</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-[160px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comments">Most Comments</SelectItem>
                  <SelectItem value="engagement">Most Engagement</SelectItem>
                  <SelectItem value="date">Newest First</SelectItem>
                  <SelectItem value="relevance">Relevance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Subtle horizontal divider */}
      <div className="border-t border-border"></div>

      {/* Generate Report Button (only shown when items selected) */}
      {selectedResults.size > 0 && (
        <div className="flex justify-end">
          <Button
            onClick={() => onGenerateReport(getSelectedResultObjects())}
            disabled={!isPaidUser}
            className="relative"
            size="lg"
          >
            {!isPaidUser && (
              <span className="absolute -top-2 -right-2 text-xl">🔒</span>
            )}
            Generate Report from {selectedResults.size} Result{selectedResults.size === 1 ? '' : 's'}
          </Button>
        </div>
      )}

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedResults.map(result => (
          <ResultCard
            key={result.id}
            result={result}
            isSelected={selectedResults.has(result.id)}
            onToggle={handleToggle}
            disabled={!isPaidUser && selectedResults.size === 0}
            searchQuery={searchParams?.query || ''}
            painPointPhrases={searchParams?.painPointPhrases || []}
          />
        ))}
      </div>

      {/* Load More Button */}
      {resultsPerPlatform < 100 && onResultsPerPlatformChange && (
        <div className="flex justify-center mt-6">
          <Button
            variant="outline"
            size="lg"
            onClick={() => {
              const nextSize = resultsPerPlatform === 10 ? 25 : resultsPerPlatform === 25 ? 50 : 100;
              onResultsPerPlatformChange(nextSize);
            }}
            className="min-w-[200px]"
          >
            Load More Results ({resultsPerPlatform === 10 ? 25 : resultsPerPlatform === 25 ? 50 : 100} per platform)
          </Button>
        </div>
      )}

      {/* Max Selection Warning */}
      {selectedResults.size >= MAX_SELECTIONS && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Maximum selections reached</AlertTitle>
          <AlertDescription>
            You can select up to {MAX_SELECTIONS} results for report generation.
            Deselect some to choose others.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
