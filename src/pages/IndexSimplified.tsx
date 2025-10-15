import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { AuthDialog } from '@/components/auth/AuthDialog';
import { PaywallDialog } from '@/components/paywall/PaywallDialog';
import { useUsageLimit } from '@/hooks/useUsageLimit';
import { useToast } from '@/hooks/use-toast';
// Removed Header and Footer imports - they require router context
// import { Header } from '@/components/Header';
// import { Footer } from '@/components/Footer';
import { SearchResultCard } from '@/components/search/SearchResultCard';
import { supabase } from '@/integrations/supabase/client';
import { SearchResult, SearchResponse } from '@/types/search';
import tradesConfig from '../../trades-config.json';

// Helper to get available trades from config
const getAvailableTrades = () => {
  return Object.entries(tradesConfig).map(([key, config]) => ({
    value: key,
    label: config.name,
  }));
};

// Build search query from trade config
const buildSearchQuery = (trade: string, location: string) => {
  const config = tradesConfig[trade as keyof typeof tradesConfig];
  if (!config) return '';

  const parts: string[] = [];

  // Add keywords (OR logic)
  if (config.keywords.length > 0) {
    const keywordQuery = `(${config.keywords.join(' OR ')})`;
    parts.push(keywordQuery);
  }

  // Add required terms
  if (config.required.length > 0) {
    parts.push(...config.required);
  }

  // Add exclude terms
  if (config.exclude.length > 0) {
    parts.push(...config.exclude);
  }

  // Add location
  if (location.trim()) {
    parts.push(`"${location.trim()}"`);
  }

  return parts.join(' ');
};

const IndexSimplified = () => {
  // Simplified search state
  const [selectedTrade, setSelectedTrade] = useState('');
  const [location, setLocation] = useState('');

  // Hidden defaults
  const selectedPlatforms = ['facebook', 'nextdoor']; // Hidden, always these two
  const timeFilter = 'day'; // Hidden, always 24 hours

  // Modal states
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [paywallDialogOpen, setPaywallDialogOpen] = useState(false);
  const [paywallFeature, setPaywallFeature] = useState('');

  // Search results state
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchId, setSearchId] = useState<string | null>(null);
  const [selectedResults, setSelectedResults] = useState<SearchResult[]>([]);
  const [sortBy, setSortBy] = useState<'comments' | 'recent' | 'upvotes'>('comments');

  // Auth hooks
  const { user, session } = useAuth();
  const { toast } = useToast();
  const {
    searchesRemaining,
    canPerformSearch,
    incrementSearchCount,
    subscriptionTier,
    isLoading: usageLimitLoading,
  } = useUsageLimit();

  const trades = getAvailableTrades();

  // Handle search
  const handleSearch = async () => {
    if (!selectedTrade || !location) {
      toast({
        title: "Missing Information",
        description: "Please select your trade and enter a location.",
        variant: "destructive",
      });
      return;
    }

    // Check if user is authenticated
    if (!user || !session) {
      setAuthDialogOpen(true);
      return;
    }

    // Check usage limits
    if (!canPerformSearch) {
      setPaywallDialogOpen(true);
      setPaywallFeature('search');
      return;
    }

    setLoading(true);
    setError(null);
    setSearchResults([]);
    setSearchId(null);

    try {
      const query = buildSearchQuery(selectedTrade, location);

      console.log('Searching with query:', query);
      console.log('Platforms:', selectedPlatforms);
      console.log('Time filter:', timeFilter);

      const { data, error: searchError } = await supabase.functions.invoke('search-platforms', {
        body: {
          query,
          platforms: selectedPlatforms,
          timeFilter,
        },
      });

      if (searchError) throw searchError;

      const response = data as SearchResponse;

      if (response.results) {
        setSearchResults(response.results);
        setSearchId(response.searchId || null);

        // Increment search count
        await incrementSearchCount();

        toast({
          title: "Search Complete",
          description: `Found ${response.results.length} results`,
        });
      } else {
        setSearchResults([]);
        toast({
          title: "No Results",
          description: "No results found for your search.",
        });
      }
    } catch (err: any) {
      console.error('Search error:', err);
      setError(err.message || 'An error occurred during search');
      toast({
        title: "Search Error",
        description: err.message || 'Failed to perform search',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle result selection
  const toggleResultSelection = (result: SearchResult) => {
    setSelectedResults(prev => {
      const isSelected = prev.some(r => r.id === result.id);
      if (isSelected) {
        return prev.filter(r => r.id !== result.id);
      } else {
        return [...prev, result];
      }
    });
  };

  // Clear all selections
  const clearSelections = () => {
    setSelectedResults([]);
  };

  // Sort results
  const sortedResults = [...searchResults].sort((a, b) => {
    switch (sortBy) {
      case 'comments':
        return (b.comment_count || 0) - (a.comment_count || 0);
      case 'recent':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'upvotes':
        return (b.upvotes || 0) - (a.upvotes || 0);
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Simple Header */}
      <header className="bg-white border-b border-slate-200 py-4">
        <div className="container mx-auto px-4 flex items-center justify-between max-w-7xl">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Business Lead Finder</h2>
          </div>
          <div className="flex items-center gap-4">
            {!user ? (
              <Button onClick={() => setAuthDialogOpen(true)} variant="outline">
                Sign In
              </Button>
            ) : (
              <span className="text-sm text-slate-600">
                {user.email}
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            BUSINESS LEAD FINDER
          </h1>
          <p className="text-slate-600">
            Find clients looking for your services across social platforms
          </p>
        </div>

        {/* Simplified Search Card */}
        <Card className="shadow-lg mb-8">
          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* I'm a: Trade Selection */}
              <div className="space-y-2">
                <Label htmlFor="trade">I'm a:</Label>
                <Select value={selectedTrade} onValueChange={setSelectedTrade}>
                  <SelectTrigger id="trade" className="w-full">
                    <SelectValue placeholder="Select your trade..." />
                  </SelectTrigger>
                  <SelectContent>
                    {trades.map(trade => (
                      <SelectItem key={trade.value} value={trade.value}>
                        {trade.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">Location:</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Seattle, Portland, Boston..."
                  className="w-full"
                />
              </div>

              {/* Search Button */}
              <div className="flex items-center gap-4">
                <Button
                  onClick={handleSearch}
                  disabled={loading || !selectedTrade || !location}
                  className="flex-1"
                  size="lg"
                >
                  <Search className="w-4 h-4 mr-2" />
                  {loading ? 'Searching...' : 'Find Leads'}
                </Button>

                {user && (
                  <div className="text-sm text-muted-foreground">
                    {searchesRemaining !== null && searchesRemaining !== undefined ? (
                      <span>
                        {searchesRemaining === -1 ? 'Unlimited' : `${searchesRemaining} searches left`}
                      </span>
                    ) : (
                      <span>Loading...</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search Results */}
        {error && (
          <Card className="mb-8 border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {searchResults.length > 0 && (
          <div className="space-y-4">
            {/* Results Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                Search Results ({searchResults.length} results)
              </h2>

              <div className="flex items-center gap-4">
                {selectedResults.length > 0 && (
                  <Button variant="outline" size="sm" onClick={clearSelections}>
                    Clear Selection ({selectedResults.length})
                  </Button>
                )}

                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="comments">Most Comments</SelectItem>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="upvotes">Most Upvotes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Results Grid */}
            <div className="space-y-4">
              {sortedResults.map(result => (
                <SearchResultCard
                  key={result.id}
                  result={result}
                  isSelected={selectedResults.some(r => r.id === result.id)}
                  onToggleSelection={() => toggleResultSelection(result)}
                  searchTerms={buildSearchQuery(selectedTrade, location)}
                />
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-slate-600">Searching for leads...</p>
          </div>
        )}

        {!loading && searchResults.length === 0 && !error && (
          <div className="text-center py-12">
            <p className="text-slate-600">Select your trade and location, then click "Find Leads" to start searching.</p>
          </div>
        )}
      </main>

      {/* Simple Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-slate-600">
          © {new Date().getFullYear()} Business Lead Finder. All rights reserved.
        </div>
      </footer>

      {/* Modals */}
      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
      <PaywallDialog
        open={paywallDialogOpen}
        onOpenChange={setPaywallDialogOpen}
        feature={paywallFeature}
      />
    </div>
  );
};

export default IndexSimplified;
