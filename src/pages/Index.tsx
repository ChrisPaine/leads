import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, X, ChevronDown } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { AuthDialog } from '@/components/auth/AuthDialog';
import { PaywallDialog } from '@/components/paywall/PaywallDialog';
import { SavedQueriesDialog } from '@/components/queries/SavedQueriesDialog';
import { SaveQueryDialog } from '@/components/queries/SaveQueryDialog';
import { UpgradeDialog } from '@/components/upgrade/UpgradeDialog';
import { useQueries } from '@/hooks/useQueries';
import { useUsageLimit } from '@/hooks/useUsageLimit';
import { useToast } from '@/hooks/use-toast';
import { GoogleAutocomplete } from '@/components/ui/google-autocomplete';

// Import constants
import { platforms, type Platform, getAllowedPlatforms } from '@/constants/platforms';
import { initialPhraseCategories, type PhraseCategory } from '@/constants/phraseCategories';
import queryConfigs from '../../query-config.json';

// Import components
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { WhyIBuiltThisDialog } from '@/components/welcome/WhyIBuiltThisDialog';
import { UpgradeAfterSearchesDialog } from '@/components/upgrade/UpgradeAfterSearchesDialog';
import { useEmailSignupSearches } from '@/hooks/useEmailSignupSearches';
import { PainPointFiltersModal } from '@/components/PainPointFiltersModal';
import { ExamplesModal } from '@/components/ExamplesModal';
import { NicheIdeasModal } from '@/components/NicheIdeasModal';
import { SearchResultCard } from '@/components/search/SearchResultCard';
import { supabase } from '@/integrations/supabase/client';
import { SearchResult, SearchResponse } from '@/types/search';
import { ReportTypeSelector } from '@/components/reports/ReportTypeSelector';
import { ReportLoadingOverlay } from '@/components/reports/ReportLoadingOverlay';
import { ReportDisplay } from '@/components/reports/ReportDisplay';
import type { Report } from '@/types/search';

const Index = () => {
  // Helper function to format search terms
  const formatSearchTerms = (input: string) => {
    if (!input.includes(',')) {
      return input;
    }
    const terms = input
      .split(',')
      .map(term => term.trim())
      .filter(term => term.length > 0)
      .map(term => {
        if (term.includes(' ') && !term.startsWith('"')) {
          return `"${term}"`;
        }
        return term;
      });
    return terms.join(' OR ');
  };

  // Core search state
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [phraseCategories, setPhraseCategories] = useState<PhraseCategory[]>(initialPhraseCategories);
  const [selectedPhrases, setSelectedPhrases] = useState<string[]>([]);
  const [mainTopic, setMainTopic] = useState('');
  const [commentsSearch, setCommentsSearch] = useState('');
  const [contactsSearch, setContactsSearch] = useState('');
  const [exclusionsSearch, setExclusionsSearch] = useState('');
  const [combinedKeywords, setCombinedKeywords] = useState('');
  const [timeFilter, setTimeFilter] = useState<'any' | 'hour' | 'day' | 'week' | 'month' | 'year'>('any');

  // Modal states
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [paywallDialogOpen, setPaywallDialogOpen] = useState(false);
  const [paywallFeature, setPaywallFeature] = useState('');
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState('');
  const [savedQueriesDialogOpen, setSavedQueriesDialogOpen] = useState(false);
  const [saveQueryDialogOpen, setSaveQueryDialogOpen] = useState(false);
  const [whyIBuiltThisOpen, setWhyIBuiltThisOpen] = useState(false);
  const [upgradeAfterSearchesOpen, setUpgradeAfterSearchesOpen] = useState(false);
  const [painPointFiltersOpen, setPainPointFiltersOpen] = useState(false);
  const [examplesModalOpen, setExamplesModalOpen] = useState(false);
  const [nicheIdeasModalOpen, setNicheIdeasModalOpen] = useState(false);

  // Search results state
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchId, setSearchId] = useState<string | null>(null);
  const [selectedResults, setSelectedResults] = useState<SearchResult[]>([]);
  const [sortBy, setSortBy] = useState<'comments' | 'recent' | 'upvotes'>('comments');
  const [exampleApplied, setExampleApplied] = useState(false);

  // Report states
  const [reportTypeSelectorOpen, setReportTypeSelectorOpen] = useState(false);
  const [reportLoadingOpen, setReportLoadingOpen] = useState(false);
  const [reportDisplayOpen, setReportDisplayOpen] = useState(false);
  const [currentReport, setCurrentReport] = useState<Report | null>(null);

  // Auth hooks
  const {
    user,
    signOut,
    isPro,
    isPremium,
    isEnterprise,
    isAdmin,
    isSupabaseConnected,
    loading: authLoading,
    checkSubscription,
    subscriptionTier,
    monthlySearchesUsed,
    monthlySearchLimit,
    monthlySearchesRemaining
  } = useAuth();
  const { saveQuery } = useQueries();
  const { canSearch, incrementSearchCount, getRemainingSearches, isLimited } = useUsageLimit();
  const { toast } = useToast();

  const {
    canSearch: canEmailSearch,
    incrementSearchCount: incrementEmailSearchCount,
    getRemainingSearches: getEmailRemainingSearches,
    hasEmail,
  } = useEmailSignupSearches();

  const isPaidUser = isPro || isPremium || isEnterprise || isAdmin;

  // Update commentsSearch field when selectedPhrases changes
  useEffect(() => {
    if (selectedPhrases.length > 0) {
      setCommentsSearch(selectedPhrases.join(', '));
    }
  }, [selectedPhrases]);

  // Sync combinedKeywords whenever the underlying state changes
  useEffect(() => {
    const parts = [];

    if (commentsSearch.trim()) {
      parts.push(commentsSearch);
    }

    if (contactsSearch.trim()) {
      const terms = contactsSearch.split(',').map(t => {
        const trimmed = t.trim();
        if (!trimmed.startsWith('+')) {
          return trimmed.includes(' ') ? `+"${trimmed}"` : `+${trimmed}`;
        }
        return trimmed;
      }).join(', ');
      parts.push(terms);
    }

    if (exclusionsSearch.trim()) {
      const terms = exclusionsSearch.split(',').map(t => {
        const trimmed = t.trim();
        if (!trimmed.startsWith('-')) {
          return trimmed.includes(' ') ? `-"${trimmed}"` : `-${trimmed}`;
        }
        return trimmed;
      }).join(', ');
      parts.push(terms);
    }

    setCombinedKeywords(parts.join(' & '));
  }, [commentsSearch, contactsSearch, exclusionsSearch]);

  // Show "Why I Built This" dialog for first-time visitors (free users only)
  useEffect(() => {
    // Don't show for logged-in users with paid subscriptions
    if (user && (isPro || isPremium || isEnterprise || isAdmin || subscriptionTier)) {
      return;
    }

    const emailSubmitted = localStorage.getItem('email_submitted');
    if (!emailSubmitted && !user) {
      setTimeout(() => {
        setWhyIBuiltThisOpen(true);
      }, 1000);
    }
  }, [user, isPro, isPremium, isEnterprise, isAdmin, subscriptionTier]);

  // Handle phrase selection
  const handleSelectPhrase = (phrase: string) => {
    setSelectedPhrases(prev =>
      prev.includes(phrase)
        ? prev.filter(p => p !== phrase)
        : [...prev, phrase]
    );
  };

  const handleSelectCategory = (categoryIndex: number) => {
    const category = phraseCategories[categoryIndex];
    const allSelected = category.phrases.every(phrase => selectedPhrases.includes(phrase));

    if (allSelected) {
      // Deselect all phrases in category
      setSelectedPhrases(prev => prev.filter(p => !category.phrases.includes(p)));
    } else {
      // Select all phrases in category
      setSelectedPhrases(prev => {
        const newPhrases = [...prev];
        category.phrases.forEach(phrase => {
          if (!newPhrases.includes(phrase)) {
            newPhrases.push(phrase);
          }
        });
        return newPhrases;
      });
    }
  };

  const handleSelectAllPhrases = () => {
    const allPhrases = phraseCategories.flatMap(cat => cat.phrases);
    setSelectedPhrases(allPhrases);
  };

  const handleClearAllPhrases = () => {
    setSelectedPhrases([]);
  };

  const clearAllSettings = () => {
    setMainTopic('');
    setSelectedPlatforms([]);
    setCommentsSearch('');
    setContactsSearch('');
    setExclusionsSearch('');
    setTimeFilter('any');
    setSelectedPhrases([]);
    setSearchResults([]);
    setSelectedResults([]);
    setExampleApplied(false);
  };

  const handleNicheSelect = (niche: string) => {
    setMainTopic(niche);
    toast({
      title: 'Niche Selected',
      description: `"${niche}" has been added to your Main Topic`,
    });
  };

  const handleSaveQuery = async (title: string) => {
    const queryData = {
      mainTopic,
      commentsSearch,
      contactsSearch,
      exclusionsSearch,
      timeFilter,
      selectedPhrases,
    };

    const result = await saveQuery(title, queryData, selectedPlatforms);
    if (!result) {
      throw new Error('Failed to save query');
    }
  };

  const handleLoadQuery = (queryData: any, platforms: string[]) => {
    setMainTopic(queryData.mainTopic || '');
    setCommentsSearch(queryData.commentsSearch || '');
    setContactsSearch(queryData.contactsSearch || '');
    setExclusionsSearch(queryData.exclusionsSearch || '');
    setTimeFilter(queryData.timeFilter || 'any');
    setSelectedPhrases(queryData.selectedPhrases || []);
    setSelectedPlatforms(platforms || []);
  };

  const handleExampleSelect = (exampleType: 'business-leads' | 'pain-points' | 'real-estate' | 'free-furniture' | 'job-listings') => {
    // Load configuration from query-config.json
    const config = queryConfigs[exampleType as keyof typeof queryConfigs];

    if (!config) {
      toast({
        title: 'Example not found',
        description: 'Could not load example configuration.',
        variant: 'destructive',
      });
      return;
    }

    // Apply the configuration
    setTimeFilter(config.timeFilter as typeof timeFilter);
    setMainTopic(config.mainTopic || '');

    // Use phrases if available, otherwise fall back to keywords/required
    if (config.phrases && config.phrases.length > 0) {
      setCommentsSearch(config.phrases.join(', '));
      setContactsSearch('');
    } else {
      setCommentsSearch(config.keywords.join(', '));
      setContactsSearch(config.required.join(', '));
    }

    setExclusionsSearch(config.exclude.join(', '));
    setSelectedPlatforms(config.platforms || []);

    // Handle special case for pain-points with all phrases selected
    if (config.useAllPhrases) {
      handleSelectAllPhrases();
    } else {
      setSelectedPhrases([]);
    }

    setExampleApplied(true);

    toast({
      title: `${config.name} Applied`,
      description: 'Review the settings and click Search to continue.',
    });
  };

  const handleSearch = async () => {
    if (!mainTopic.trim() || selectedPlatforms.length === 0) {
      toast({ title: 'Missing info', description: 'Please enter a main topic and select at least one platform.' });
      return;
    }

    // Turn off the flashing animation when search is clicked
    setExampleApplied(false);

    // Check if Google Trends is selected and open it in a new tab
    if (selectedPlatforms.includes('google-trends')) {
      const trendsUrl = `https://trends.google.com/trends/explore?date=all&q=${encodeURIComponent(mainTopic.trim())}`;
      window.open(trendsUrl, '_blank');

      // If ONLY Google Trends is selected, don't continue with search
      if (selectedPlatforms.length === 1) {
        toast({
          title: 'Google Trends opened',
          description: 'Opening Google Trends in a new tab',
        });
        return;
      }
    }

    // Check limits for email users
    if (hasEmail && !user) {
      if (!canEmailSearch()) {
        setUpgradeAfterSearchesOpen(true);
        return;
      }
    } else {
      if (!canSearch()) {
        if (!user) {
          setAuthDialogOpen(true);
          return;
        } else {
          setUpgradeReason('continue searching');
          setUpgradeDialogOpen(true);
          return;
        }
      }
      incrementSearchCount();
    }

    if (hasEmail && !user) {
      await incrementEmailSearchCount();
    }

    // Perform search
    setLoading(true);
    setError(null);
    setSearchResults([]);
    setSelectedResults([]);

    try {
      const formattedComments = commentsSearch.trim() ? formatSearchTerms(commentsSearch) : '';
      const formattedContacts = contactsSearch.trim() ? formatSearchTerms(contactsSearch) : '';

      let queryString = mainTopic;
      if (formattedComments && formattedContacts) {
        queryString += ` (${formattedComments}) and (${formattedContacts})`;
      } else if (formattedComments) {
        queryString += ` (${formattedComments})`;  // Wrap in parentheses!
      } else if (formattedContacts) {
        queryString += ` (${formattedContacts})`;  // Wrap in parentheses!
      }

      const { data, error: funcError } = await supabase.functions.invoke('serp-search', {
        body: {
          query: queryString,
          platforms: selectedPlatforms,
          timeFilter: timeFilter === 'any' ? undefined : timeFilter,
          verbatim: false,
          resultsPerPlatform: 10, // Fixed at 10 results per platform
          customExclusions: exclusionsSearch.trim() ? formatSearchTerms(exclusionsSearch) : '',
        },
      });

      if (funcError) throw funcError;

      const response = data as SearchResponse;
      setSearchResults(response.results || []);
      setSearchId(response.searchId || null);

      if (response.results.length === 0) {
        toast({
          title: 'No results found',
          description: 'Try different keywords or platforms',
        });
      } else {
        toast({
          title: 'Search complete',
          description: `Found ${response.results.length} results`,
        });
      }
    } catch (err: any) {
      console.error('Search error:', err);
      setError(err.message || 'Failed to perform search');
      toast({
        title: 'Search failed',
        description: err.message || 'Failed to perform search',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleResult = (result: SearchResult) => {
    setSelectedResults(prev => {
      const isSelected = prev.some(r => r.id === result.id);
      if (isSelected) {
        return prev.filter(r => r.id !== result.id);
      } else {
        return [...prev, result];
      }
    });
  };

  // Sort results based on selected criteria
  const getSortedResults = () => {
    const sorted = [...searchResults];

    switch (sortBy) {
      case 'comments':
        return sorted.sort((a, b) => (b.comments || 0) - (a.comments || 0));
      case 'upvotes':
        return sorted.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
      case 'recent':
        // Assuming results are already in chronological order from API
        return sorted;
      default:
        return sorted;
    }
  };

  const handleGenerateReport = () => {
    if (selectedResults.length === 0) {
      toast({ title: 'No results selected', description: 'Please select at least one result.' });
      return;
    }
    setReportTypeSelectorOpen(true);
  };

  const handleReportTypeSelect = async (reportType: 'summary' | 'mvp_builder') => {
    setReportTypeSelectorOpen(false);
    setReportLoadingOpen(true);

    try {
      const { data, error: funcError } = await supabase.functions.invoke('generate-report', {
        body: {
          reportType,
          selectedResults: selectedResults,
          searchResultId: searchId || undefined,
        },
      });

      if (funcError) throw funcError;

      setCurrentReport(data.report);
      setReportLoadingOpen(false);
      setReportDisplayOpen(true);

      toast({
        title: 'Report generated!',
        description: `Your ${reportType === 'summary' ? 'Summary' : 'MVP Builder'} report is ready`,
      });
    } catch (err: any) {
      console.error('Report generation error:', err);
      setReportLoadingOpen(false);
      toast({
        title: 'Report generation failed',
        description: err.message || 'Failed to generate report',
        variant: 'destructive',
      });
    }
  };

  const allowedPlatformIds = getAllowedPlatforms(isPro, isPremium, isEnterprise, isAdmin, subscriptionTier, false);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {authLoading ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      ) : (
        <>
          <Header
            user={user}
            isPro={isPro}
            isPremium={isPremium}
            isEnterprise={isEnterprise}
            isAdmin={isAdmin}
            subscriptionTier={subscriptionTier}
            signOut={signOut}
            setSavedQueriesDialogOpen={setSavedQueriesDialogOpen}
            setShowTutorial={() => {}}
          />

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Research Topic Card */}
            <Card className="shadow-card mb-4">
              <CardContent className="pt-3 pb-3 px-4">
                {/* Top Row: Title and Actions */}
                <div className="flex items-center justify-between mb-3 pb-3 border-b">
                  <h2 className="text-base font-semibold">Research Topic</h2>
                  <div className="flex items-center gap-2">
                    {user && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSaveQueryDialogOpen(true)}
                      >
                        💾 Save Query
                      </Button>
                    )}
                    <Select value={timeFilter} onValueChange={(v) => setTimeFilter(v as typeof timeFilter)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any Time</SelectItem>
                        <SelectItem value="hour">Past hour</SelectItem>
                        <SelectItem value="day">24 Hours</SelectItem>
                        <SelectItem value="week">Past week</SelectItem>
                        <SelectItem value="month">Past month</SelectItem>
                        <SelectItem value="year">Past year</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" onClick={clearAllSettings}>
                      Clear All
                    </Button>
                  </div>
                </div>

                {/* Main Topic */}
                <div className="mb-3">
                  <Label htmlFor="mainTopic" className="text-sm font-medium block mb-2">
                    Main Topic
                  </Label>
                  <div className="flex gap-2 items-start">
                    <div className="flex-1">
                      <GoogleAutocomplete
                        id="mainTopic"
                        value={mainTopic}
                        onChange={setMainTopic}
                        placeholder=""
                        className="w-full"
                      />
                      <div className="flex justify-end mt-1">
                        <button
                          type="button"
                          onClick={() => setNicheIdeasModalOpen(true)}
                          className="text-xs text-primary hover:text-primary/80 inline-flex items-center gap-1"
                        >
                          <span>🔗</span>
                          <span className="underline decoration-primary">Niche ideas...</span>
                        </button>
                      </div>
                    </div>
                    <Button variant="default" size="sm" onClick={() => setExamplesModalOpen(true)}>
                      Examples
                    </Button>
                  </div>
                </div>

                {/* Platforms Row */}
                <div className="mb-3">
                  <div className="flex gap-4 items-center">
                  <Label htmlFor="platforms" className="text-sm font-medium whitespace-nowrap">
                    Platforms
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="w-[700px] justify-between font-normal"
                      >
                        <span className="truncate">
                          {selectedPlatforms.length === 0
                            ? "Select"
                            : selectedPlatforms
                                .map(id => platforms.find(p => p.id === id)?.name)
                                .filter(Boolean)
                                .join(', ')
                          }
                        </span>
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[700px] p-0" align="start">
                      <div className="max-h-[300px] overflow-auto p-1">
                        {[...platforms].sort((a, b) => a.name.localeCompare(b.name)).map(platform => {
                          const isLocked = !allowedPlatformIds.includes(platform.id);
                          const isSelected = selectedPlatforms.includes(platform.id);
                          const PlatformIcon = platform.icon;

                          return (
                            <div
                              key={platform.id}
                              className={`flex items-center gap-2 px-2 py-2 cursor-pointer rounded hover:bg-accent ${
                                isLocked ? 'opacity-50 cursor-not-allowed' : ''
                              } ${isSelected ? 'bg-accent' : ''}`}
                              onClick={() => {
                                if (isLocked) {
                                  if (!user) {
                                    setAuthDialogOpen(true);
                                  } else {
                                    setPaywallFeature(`access ${platform.id}`);
                                    setPaywallDialogOpen(true);
                                  }
                                  return;
                                }

                                setSelectedPlatforms(prev => {
                                  if (prev.includes(platform.id)) {
                                    return prev.filter(p => p !== platform.id);
                                  } else {
                                    return [...prev, platform.id];
                                  }
                                });
                              }}
                            >
                              <div className={`w-4 h-4 border rounded flex items-center justify-center ${
                                isSelected ? 'bg-primary border-primary' : 'border-input'
                              }`}>
                                {isSelected && (
                                  <svg className="w-3 h-3 text-primary-foreground" viewBox="0 0 12 12" fill="none">
                                    <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                )}
                              </div>
                              <span className={platform.color}>
                                <PlatformIcon className="w-4 h-4" />
                              </span>
                              <span className="flex-1">{platform.name}</span>
                              {isLocked && <span className="text-xs text-muted-foreground">Pro</span>}
                            </div>
                          );
                        })}
                      </div>
                    </PopoverContent>
                  </Popover>

                  <Button variant="outline" size="sm" onClick={() => setPainPointFiltersOpen(true)}>
                    Pain Point Filters
                  </Button>
                  </div>
                </div>

                {/* Keywords or Pain Points */}
                <div className="mb-3">
                  <Label className="text-sm font-medium block mb-2">
                    Keywords or Pain Points
                  </Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      value={combinedKeywords}
                      onChange={(e) => {
                        // Just update the display value while typing
                        setCombinedKeywords(e.target.value);
                      }}
                      onBlur={(e) => {
                        // Parse when user finishes editing (leaves the field)
                        const value = e.target.value;

                        // Split by & first to separate the three sections
                        const sections = value.split('&').map(s => s.trim());

                        const keywords = [];
                        const required = [];
                        const excluded = [];

                        // Process each section
                        sections.forEach(section => {
                          const terms = section.split(',').map(t => t.trim()).filter(t => t);

                          terms.forEach(term => {
                            if (term.startsWith('+')) {
                              // Required term - remove the + prefix
                              required.push(term.substring(1).replace(/^"|"$/g, ''));
                            } else if (term.startsWith('-')) {
                              // Excluded term - remove the - prefix
                              excluded.push(term.substring(1).replace(/^"|"$/g, ''));
                            } else if (term) {
                              // Regular keyword/pain point (ignore & itself)
                              keywords.push(term);
                            }
                          });
                        });

                        setCommentsSearch(keywords.join(', '));
                        setContactsSearch(required.join(', '));
                        setExclusionsSearch(excluded.join(', '));
                      }}
                      placeholder=""
                      className="flex-1"
                    />
                    <div className="relative">
                      {exampleApplied && (
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce">
                          <span className="text-xs font-medium text-primary whitespace-nowrap">Click here!</span>
                          <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                          </svg>
                        </div>
                      )}
                      <Button
                        variant="default"
                        onClick={handleSearch}
                        disabled={!mainTopic.trim() || selectedPlatforms.length === 0 || loading}
                        className={exampleApplied ? 'animate-pulse' : ''}
                      >
                        <Search className="w-4 h-4 mr-2" />
                        {loading ? 'Searching...' : 'Search'}
                      </Button>
                    </div>
                  </div>

                  {/* Helper Text and Usage Indicator */}
                  <div className="mt-2 flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      💡 Use & for alternatives, + for required, - to exclude
                    </div>

                    {/* Usage Indicator - Below search input, aligned right */}
                    {user && subscriptionTier && subscriptionTier !== 'free' ? (
                      // Show monthly limit for paid users (Starter, Professional)
                      subscriptionTier === 'starter' || subscriptionTier === 'professional' ? (
                        <p className="text-sm text-muted-foreground">
                          {monthlySearchesRemaining} of {monthlySearchLimit} searches remaining this month
                        </p>
                      ) : null // Agency/Pro/Enterprise have unlimited, no need to show
                    ) : hasEmail && !user ? (
                      // Show email signup counter for users who provided email but haven't signed up
                      <p className="text-sm text-muted-foreground">
                        {getEmailRemainingSearches()} free search{getEmailRemainingSearches() === 1 ? '' : 'es'} remaining today
                      </p>
                    ) : isLimited && (
                      // Show daily limit for anonymous free users
                      <p className="text-sm text-muted-foreground">
                        {getRemainingSearches() > 0 ? (
                          <>
                            {getRemainingSearches()} free search{getRemainingSearches() === 1 ? '' : 'es'} remaining today
                          </>
                        ) : (
                          <>
                            Daily limit reached.
                            <Button
                              variant="link"
                              size="sm"
                              className="ml-1 p-0 h-auto text-primary"
                              onClick={() => setAuthDialogOpen(true)}
                            >
                              Sign up for more searches
                            </Button>
                          </>
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Search Results Section */}
            {searchResults.length > 0 && (
              <Card className="shadow-card">
                <CardContent className="pt-3 pb-3 px-4">
                  <div className="flex items-center justify-between mb-3 pb-3 border-b">
                    <h2 className="text-lg font-semibold">
                      Search Results ({searchResults.length} results)
                    </h2>
                    <div className="flex items-center gap-4">
                      <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="comments">Most Comments</SelectItem>
                          <SelectItem value="recent">Most Recent</SelectItem>
                          <SelectItem value="upvotes">Most Upvotes</SelectItem>
                        </SelectContent>
                      </Select>
                      {selectedResults.length > 0 && (
                        <span className="text-sm text-muted-foreground">
                          Selected: {selectedResults.length}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Generate Report Button - Only visible when results are selected */}
                  {selectedResults.length > 0 && (
                    <div className="mb-4">
                      <Button
                        variant="default"
                        size="lg"
                        className="w-full"
                        onClick={handleGenerateReport}
                      >
                        Generate Report from {selectedResults.length} Result{selectedResults.length !== 1 ? 's' : ''}
                      </Button>
                    </div>
                  )}

                  {/* Results List */}
                  <div className="space-y-3">
                    {getSortedResults().map(result => {
                      // Collect all search keywords for highlighting
                      const keywords = [
                        mainTopic,
                        ...commentsSearch.split(',').map(k => k.trim().replace(/^["']|["']$/g, '')), // Remove quotes
                        ...contactsSearch.split(',').map(k => k.trim().replace(/^["']|["']$/g, '')), // Remove quotes
                        ...selectedPhrases,
                      ].filter(k => k.length > 0 && k !== '+' && k !== '-'); // Filter empty and operators

                      return (
                        <SearchResultCard
                          key={result.id}
                          result={result}
                          isSelected={selectedResults.some(r => r.id === result.id)}
                          onToggleSelect={handleToggleResult}
                          searchKeywords={keywords}
                        />
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Loading State */}
            {loading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Searching...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-12">
                <p className="text-destructive">{error}</p>
              </div>
            )}
          </main>

          <Footer />
        </>
      )}

      {/* Dialogs */}
      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
      <PaywallDialog
        open={paywallDialogOpen}
        onOpenChange={setPaywallDialogOpen}
        feature={paywallFeature}
      />
      <SaveQueryDialog
        open={saveQueryDialogOpen}
        onOpenChange={setSaveQueryDialogOpen}
        onSave={handleSaveQuery}
      />
      <SavedQueriesDialog
        open={savedQueriesDialogOpen}
        onOpenChange={setSavedQueriesDialogOpen}
        onLoadQuery={handleLoadQuery}
      />
      <UpgradeDialog
        open={upgradeDialogOpen}
        onOpenChange={setUpgradeDialogOpen}
        reason={upgradeReason}
      />
      <WhyIBuiltThisDialog
        open={whyIBuiltThisOpen}
        onOpenChange={setWhyIBuiltThisOpen}
      />
      <UpgradeAfterSearchesDialog
        open={upgradeAfterSearchesOpen}
        onOpenChange={setUpgradeAfterSearchesOpen}
      />
      <PainPointFiltersModal
        open={painPointFiltersOpen}
        onOpenChange={setPainPointFiltersOpen}
        phraseCategories={phraseCategories}
        selectedPhrases={selectedPhrases}
        onSelectPhrase={handleSelectPhrase}
        onSelectCategory={handleSelectCategory}
        onSelectAll={handleSelectAllPhrases}
        onClearAll={handleClearAllPhrases}
      />
      <ExamplesModal
        open={examplesModalOpen}
        onOpenChange={setExamplesModalOpen}
        onSelectExample={handleExampleSelect}
      />
      <NicheIdeasModal
        open={nicheIdeasModalOpen}
        onOpenChange={setNicheIdeasModalOpen}
        onSelectNiche={handleNicheSelect}
      />
      <ReportTypeSelector
        open={reportTypeSelectorOpen}
        onOpenChange={setReportTypeSelectorOpen}
        onSelectType={handleReportTypeSelect}
        isPaidUser={isPaidUser}
        onUpgrade={() => {
          setReportTypeSelectorOpen(false);
          setUpgradeDialogOpen(true);
        }}
      />
      <ReportLoadingOverlay
        open={reportLoadingOpen}
        onCancel={() => setReportLoadingOpen(false)}
      />
      <ReportDisplay
        open={reportDisplayOpen}
        onOpenChange={setReportDisplayOpen}
        report={currentReport}
      />
    </div>
  );
};

export default Index;
