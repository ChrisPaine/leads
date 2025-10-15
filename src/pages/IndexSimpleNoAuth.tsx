import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import tradesConfig from '../../trades-config.json';
import PotIcon from '@/assets/pot-svgrepo-com.svg';

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

const IndexSimpleNoAuth = () => {
  const [selectedTrade, setSelectedTrade] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [builtQuery, setBuiltQuery] = useState('');
  const [showQueryPreview, setShowQueryPreview] = useState(false);

  const trades = getAvailableTrades();

  // Handle search
  const handleSearch = async () => {
    if (!selectedTrade || !location) {
      alert('Please select your trade and enter a location.');
      return;
    }

    setLoading(true);
    const query = buildSearchQuery(selectedTrade, location);
    setBuiltQuery(query);

    console.log('Search Query:', query);
    console.log('Platforms: Facebook, Nextdoor (hidden)');
    console.log('Time Filter: 24 hours (hidden)');

    // Simulate search
    setTimeout(() => {
      setLoading(false);
      alert(`Search complete!\n\nQuery: ${query}\n\nIn production, this would search Facebook and Nextdoor with a 24-hour filter.`);
    }, 1000);
  };

  const getTradeConfig = () => {
    if (!selectedTrade) return null;
    return tradesConfig[selectedTrade as keyof typeof tradesConfig];
  };

  const tradeConfig = getTradeConfig();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header matching Pain Point Discovery Tool style */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="grid grid-cols-3 items-center gap-8">
            {/* Logo on the left */}
            <div className="flex justify-start">
              <img src={PotIcon} alt="Business Leads Logo" className="h-12 w-auto" />
            </div>

            {/* Title and subtitle in center */}
            <div className="flex justify-center">
              <div className="text-center">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                  BUSINESS LEADS
                </h1>
                <p className="text-base text-slate-600 mt-1">
                  Find fresh clients looking for services across 2 social platforms
                </p>
              </div>
            </div>

            {/* Right side navigation */}
            <div className="flex justify-end items-center gap-4">
              {/* Pricing button */}
              <Button variant="outline" size="sm" className="text-sm text-blue-600 border-blue-600 rounded-full hover:bg-blue-50">
                Pricing
              </Button>

              {/* Light/Dark mode toggle */}
              <button className="p-2 hover:bg-slate-100 rounded-md" title="Toggle theme">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="4"/>
                  <path d="M12 2v2"/>
                  <path d="M12 20v2"/>
                  <path d="m4.93 4.93 1.41 1.41"/>
                  <path d="m17.66 17.66 1.41 1.41"/>
                  <path d="M2 12h2"/>
                  <path d="M20 12h2"/>
                  <path d="m6.34 17.66-1.41 1.41"/>
                  <path d="m19.07 4.93-1.41 1.41"/>
                </svg>
              </button>

              {/* Agency link */}
              <Button variant="ghost" size="sm" className="text-sm text-blue-600 rounded-full hover:bg-blue-50">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                  <polyline points="15 3 21 3 21 9"/>
                  <line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
                Agency
              </Button>

              {/* Sign Out button */}
              <Button variant="ghost" size="sm" className="text-sm rounded-full hover:bg-slate-100">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        {/* Simplified Search Card */}
        <Card className="shadow-lg mb-8">
          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* I'm a and Location on same row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* I'm a: Trade Selection */}
                <div className="space-y-2">
                  <Label htmlFor="trade" className="text-base font-semibold">I'm a:</Label>
                  <Select value={selectedTrade} onValueChange={setSelectedTrade}>
                    <SelectTrigger id="trade" className="w-full h-11">
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
                  <Label htmlFor="location" className="text-base font-semibold">Location:</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g., Seattle, Portland, Boston..."
                    className="w-full h-11"
                  />
                </div>
              </div>

              {/* Hidden Info Display */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                <div className="font-semibold mb-2">Automatic Settings (Hidden from user):</div>
                <div className="space-y-1 text-xs">
                  <div>• Platforms: <span className="font-medium">Facebook + Nextdoor</span></div>
                  <div>• Time Filter: <span className="font-medium">24 hours</span></div>
                  <div>• Keywords: <span className="font-medium">From trades-config.json</span></div>
                </div>
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

                {selectedTrade && location && (
                  <Button
                    onClick={() => setShowQueryPreview(!showQueryPreview)}
                    variant="outline"
                    size="lg"
                  >
                    {showQueryPreview ? 'Hide' : 'Show'} Query
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Query Preview */}
        {showQueryPreview && selectedTrade && location && (
          <Card className="shadow-lg mb-8">
            <CardContent className="pt-6">
              <h3 className="font-bold text-lg mb-4">Query Preview</h3>

              <div className="space-y-4">
                <div>
                  <div className="text-sm font-semibold text-slate-700 mb-2">Built Query:</div>
                  <div className="bg-slate-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    {buildSearchQuery(selectedTrade, location)}
                  </div>
                </div>

                {tradeConfig && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-semibold text-slate-700 mb-2">Keywords (OR logic):</div>
                      <div className="bg-blue-50 p-3 rounded text-sm text-blue-900">
                        {tradeConfig.keywords.join(', ')}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-semibold text-slate-700 mb-2">Required Terms:</div>
                      <div className="bg-green-50 p-3 rounded text-sm text-green-900">
                        {tradeConfig.required.join(', ')}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-semibold text-slate-700 mb-2">Exclude Terms:</div>
                      <div className="bg-red-50 p-3 rounded text-sm text-red-900">
                        {tradeConfig.exclude.join(', ')}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-semibold text-slate-700 mb-2">Location:</div>
                      <div className="bg-purple-50 p-3 rounded text-sm text-purple-900">
                        "{location}"
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Demo Info */}
        {!loading && !builtQuery && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto space-y-4">
              <div className="text-4xl">🚀</div>
              <h3 className="text-xl font-semibold text-slate-800">Ready to Find Leads!</h3>
              <p className="text-slate-600">
                Select your trade and location, then click "Find Leads" to see how the query is built.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
                <div className="font-semibold mb-1">Demo Mode</div>
                <div>This is running without Supabase. In production, clicking "Find Leads" would search Facebook and Nextdoor for actual leads.</div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Simple Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-slate-600">
          © {new Date().getFullYear()} Business Lead Finder. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default IndexSimpleNoAuth;
