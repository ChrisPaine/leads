import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SearchResult, SearchResponse, GenerateReportRequest, Report } from '@/types/search';
import { SearchResultsGrid } from '@/components/search/SearchResultsGrid';
import { ReportTypeSelector } from '@/components/reports/ReportTypeSelector';
import { ReportLoadingOverlay } from '@/components/reports/ReportLoadingOverlay';
import { ReportDisplay } from '@/components/reports/ReportDisplay';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function SearchResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isPro, isPremium, isEnterprise, isAdmin, subscriptionTier, signOut } = useAuth();

  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchId, setSearchId] = useState<string | null>(null);
  const [resultsPerPlatform, setResultsPerPlatform] = useState<number>(25);

  const [reportTypeSelectorOpen, setReportTypeSelectorOpen] = useState(false);
  const [reportLoadingOpen, setReportLoadingOpen] = useState(false);
  const [reportDisplayOpen, setReportDisplayOpen] = useState(false);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);

  const [selectedResultsForReport, setSelectedResultsForReport] = useState<SearchResult[]>([]);
  const [currentReport, setCurrentReport] = useState<Report | null>(null);

  const isPaidUser = isPro || isPremium || isEnterprise || isAdmin;

  // Get search params from location state
  const searchParams = location.state as {
    query: string;
    platforms: string[];
    timeFilter?: string;
    verbatim?: boolean;
    exclusions?: string;
    painPointPhrases?: string[];
  } | null;

  useEffect(() => {
    if (!searchParams) {
      navigate('/');
      return;
    }

    performSearch();
  }, [searchParams, resultsPerPlatform]);

  const performSearch = async () => {
    if (!searchParams) return;

    setLoading(true);
    setError(null);

    try {
      console.log('Performing search with params:', {
        query: searchParams.query,
        platforms: searchParams.platforms,
        timeFilter: searchParams.timeFilter || 'any',
        verbatim: searchParams.verbatim || false,
        resultsPerPlatform: resultsPerPlatform,
      });

      const { data, error: funcError } = await supabase.functions.invoke('serp-search', {
        body: {
          query: searchParams.query,
          platforms: searchParams.platforms,
          timeFilter: searchParams.timeFilter || 'any',
          verbatim: searchParams.verbatim || false,
          resultsPerPlatform: resultsPerPlatform,
          customExclusions: searchParams.exclusions || '',
        },
      });

      if (funcError) throw funcError;

      const response = data as SearchResponse;
      console.log('Search response:', {
        totalResults: response.results?.length || 0,
        resultsPerPlatform: resultsPerPlatform,
        cached: response.cached,
      });
      setSearchResults(response.results || []);
      setSearchId(response.searchId || null);

      if (response.results.length === 0) {
        toast({
          title: 'No results found',
          description: 'Try different keywords or platforms',
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

  const handleGenerateReportClick = (selectedResults: SearchResult[]) => {
    setSelectedResultsForReport(selectedResults);
    setReportTypeSelectorOpen(true);
  };

  const handleReportTypeSelect = async (reportType: 'summary' | 'mvp_builder') => {
    setReportTypeSelectorOpen(false);
    setReportLoadingOpen(true);

    try {
      const request: GenerateReportRequest = {
        reportType,
        selectedResults: selectedResultsForReport,
        searchResultId: searchId || undefined,
      };

      const { data, error: funcError } = await supabase.functions.invoke('generate-report', {
        body: request,
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

  const handleCancelReportGeneration = () => {
    setReportLoadingOpen(false);
    toast({
      title: 'Canceled',
      description: 'Report generation was canceled',
    });
  };

  const handleUpgrade = () => {
    setReportTypeSelectorOpen(false);
    setUpgradeDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header
        user={user}
        isPro={isPro}
        isPremium={isPremium}
        isEnterprise={isEnterprise}
        isAdmin={isAdmin}
        subscriptionTier={subscriptionTier}
        signOut={signOut}
        setSavedQueriesDialogOpen={() => {}}
        setShowTutorial={() => {}}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search Results Grid */}
        <SearchResultsGrid
          results={searchResults}
          loading={loading}
          error={error || undefined}
          onGenerateReport={handleGenerateReportClick}
          isPaidUser={isPaidUser}
          searchParams={searchParams}
          onBackClick={() => navigate('/')}
          resultsPerPlatform={resultsPerPlatform}
          onResultsPerPlatformChange={setResultsPerPlatform}
        />
      </main>

      <Footer />

      {/* Report Type Selector */}
      <ReportTypeSelector
        open={reportTypeSelectorOpen}
        onOpenChange={setReportTypeSelectorOpen}
        onSelectType={handleReportTypeSelect}
        isPaidUser={isPaidUser}
        onUpgrade={handleUpgrade}
      />

      {/* Report Loading Overlay */}
      <ReportLoadingOverlay
        open={reportLoadingOpen}
        onCancel={handleCancelReportGeneration}
      />

      {/* Report Display */}
      <ReportDisplay
        open={reportDisplayOpen}
        onOpenChange={setReportDisplayOpen}
        report={currentReport}
      />
    </div>
  );
}
