import React, { useState } from 'react';
import {
  getAvailableTrades,
  buildSearchQuery,
  formatQueryExplanation,
  type SearchQuery,
} from '../lib/queryBuilder';
import './LeadFinder.css';

interface SimplifiedSearchInterfaceProps {
  onSearch: (queryString: string, searchParams: SearchQuery) => void;
  isLoading?: boolean;
}

/**
 * Simplified 3-field search interface that integrates with your existing search result cards.
 *
 * Usage:
 * <SimplifiedSearchInterface
 *   onSearch={(queryString, params) => {
 *     // queryString: The full constructed query
 *     // params: { trade, location, platform }
 *     // Pass these to your existing search API
 *   }}
 * />
 *
 * Your existing search result cards should appear below this component.
 */
export function SimplifiedSearchInterface({
  onSearch,
  isLoading = false
}: SimplifiedSearchInterfaceProps) {
  const [trade, setTrade] = useState('');
  const [location, setLocation] = useState('');
  const [platform, setPlatform] = useState('');
  const [showQueryPreview, setShowQueryPreview] = useState(false);

  const trades = getAvailableTrades();
  const platforms = [
    { value: 'facebook', label: 'Facebook' },
    { value: 'nextdoor', label: 'Nextdoor' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (!trade || !location || !platform) {
      alert('Please fill in all fields');
      return;
    }

    const query: SearchQuery = { trade, location, platform };
    const queryString = buildSearchQuery(query);

    // Call your existing search function with the constructed query
    onSearch(queryString, query);
  };

  const isFormValid = trade && location && platform;
  const queryExplanation = isFormValid
    ? formatQueryExplanation({ trade, location, platform })
    : null;

  return (
    <div className="lead-finder-container">
      <div className="lead-finder-card">
        <h1 className="lead-finder-title">Business Lead Finder</h1>
        <p className="lead-finder-subtitle">
          Find clients looking for your services (24-hour filter)
        </p>

        <form onSubmit={handleSearch} className="lead-finder-form">
          {/* Trade Selection */}
          <div className="form-group">
            <label htmlFor="trade" className="form-label">
              I'm a:
            </label>
            <select
              id="trade"
              value={trade}
              onChange={(e) => setTrade(e.target.value)}
              className="form-select"
              disabled={isLoading}
            >
              <option value="">Select your trade...</option>
              {trades.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Location Input */}
          <div className="form-group">
            <label htmlFor="location" className="form-label">
              Location:
            </label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Seattle, Portland, etc."
              className="form-input"
              disabled={isLoading}
            />
          </div>

          {/* Platform Selection */}
          <div className="form-group">
            <label htmlFor="platform" className="form-label">
              Platform:
            </label>
            <select
              id="platform"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="form-select"
              disabled={isLoading}
            >
              <option value="">Select platform...</option>
              {platforms.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {/* Search Button */}
          <button
            type="submit"
            className="search-button"
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? (
              <>
                <svg
                  className="search-icon animate-spin"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Searching...
              </>
            ) : (
              <>
                <svg
                  className="search-icon"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                Find Leads
              </>
            )}
          </button>
        </form>

        {/* Query Preview (Collapsible) */}
        {isFormValid && (
          <div className="query-preview-section">
            <button
              type="button"
              onClick={() => setShowQueryPreview(!showQueryPreview)}
              className="query-preview-toggle"
            >
              <span>{showQueryPreview ? '▼' : '▶'} Query Preview</span>
              <span className="query-preview-badge">For Testing</span>
            </button>

            {showQueryPreview && queryExplanation && (
              <div className="query-preview-content">
                <div className="query-section">
                  <h3 className="query-section-title">Full Query:</h3>
                  <code className="query-code">{queryExplanation.fullQuery}</code>
                </div>

                <div className="query-section">
                  <h3 className="query-section-title">Breakdown:</h3>
                  <div className="query-breakdown">
                    <div className="query-breakdown-item">
                      <strong>Keywords:</strong>{' '}
                      <span className="text-blue-600">
                        {queryExplanation.breakdown.keywords}
                      </span>
                    </div>
                    <div className="query-breakdown-item">
                      <strong>Required:</strong>{' '}
                      <span className="text-green-600">
                        {queryExplanation.breakdown.required}
                      </span>
                    </div>
                    <div className="query-breakdown-item">
                      <strong>Exclude:</strong>{' '}
                      <span className="text-red-600">
                        {queryExplanation.breakdown.exclude}
                      </span>
                    </div>
                    <div className="query-breakdown-item">
                      <strong>Location:</strong>{' '}
                      <span className="text-purple-600">
                        {queryExplanation.breakdown.location}
                      </span>
                    </div>
                    <div className="query-breakdown-item">
                      <strong>Time Filter:</strong>{' '}
                      <span className="text-orange-600">24 hours</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
