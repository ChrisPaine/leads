import React, { useState } from 'react';
import {
  getAvailableTrades,
  buildSearchQuery,
  formatQueryExplanation,
  type SearchQuery,
} from '../lib/queryBuilder';

interface SimplifiedPainPointInterfaceProps {
  onSearch: (queryString: string, searchParams: SearchQuery) => void;
  isLoading?: boolean;
}

/**
 * Simplified interface matching your Pain Point Discovery Tool style
 * but with only 3 fields instead of complex keyword builder
 */
export function SimplifiedPainPointInterface({
  onSearch,
  isLoading = false
}: SimplifiedPainPointInterfaceProps) {
  const [trade, setTrade] = useState('');
  const [location, setLocation] = useState('');
  const [platform, setPlatform] = useState('facebook');
  const [timeFilter, setTimeFilter] = useState('24h');
  const [showQueryPreview, setShowQueryPreview] = useState(false);

  const trades = getAvailableTrades();
  const platforms = [
    { value: 'facebook', label: 'Facebook' },
    { value: 'nextdoor', label: 'Nextdoor' },
  ];

  const timeFilters = [
    { value: '24h', label: '24 Hours' },
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (!trade || !location) {
      alert('Please select a trade and enter a location');
      return;
    }

    const query: SearchQuery = { trade, location, platform };
    const queryString = buildSearchQuery(query);

    onSearch(queryString, query);
  };

  const handleClearAll = () => {
    setTrade('');
    setLocation('');
    setPlatform('facebook');
    setTimeFilter('24h');
  };

  const isFormValid = trade && location;
  const queryExplanation = isFormValid
    ? formatQueryExplanation({ trade, location, platform })
    : null;

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '1.5rem',
      marginBottom: '1rem',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
      }}>
        <h3 style={{
          fontSize: '1.125rem',
          fontWeight: '600',
          color: '#1f2937',
          margin: 0,
        }}>
          Research Topic
        </h3>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            style={{
              padding: '0.5rem 2rem 0.5rem 0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '0.875rem',
              cursor: 'pointer',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
              backgroundPosition: 'right 0.5rem center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '1.25em',
              appearance: 'none',
            }}
          >
            {timeFilters.map(tf => (
              <option key={tf.value} value={tf.value}>{tf.label}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleClearAll}
            style={{
              padding: '0.5rem 1rem',
              background: 'transparent',
              border: 'none',
              color: '#6366f1',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer',
            }}
          >
            Clear All
          </button>
        </div>
      </div>

      <form onSubmit={handleSearch}>
        {/* Trade Selection */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '0.5rem',
          }}>
            I'm a:
          </label>
          <select
            value={trade}
            onChange={(e) => setTrade(e.target.value)}
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '0.625rem 2.5rem 0.625rem 0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '0.9375rem',
              cursor: 'pointer',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
              backgroundPosition: 'right 0.5rem center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '1.25em',
              appearance: 'none',
            }}
          >
            <option value="">Select your trade...</option>
            {trades.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        {/* Location */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '0.5rem',
          }}>
            Location:
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g., Seattle, Portland, Boston..."
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '0.625rem 0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '0.9375rem',
            }}
          />
        </div>

        {/* Platform */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '0.5rem',
          }}>
            Platform:
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {platforms.map(p => (
              <button
                key={p.value}
                type="button"
                onClick={() => setPlatform(p.value)}
                disabled={isLoading}
                style={{
                  padding: '0.5rem 1rem',
                  border: platform === p.value ? '2px solid #6366f1' : '1px solid #d1d5db',
                  borderRadius: '6px',
                  background: platform === p.value ? '#eef2ff' : '#fff',
                  color: platform === p.value ? '#6366f1' : '#374151',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search Button */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button
            type="submit"
            disabled={!isFormValid || isLoading}
            style={{
              padding: '0.625rem 2rem',
              background: isFormValid && !isLoading ? '#6366f1' : '#9ca3af',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.9375rem',
              fontWeight: '600',
              cursor: isFormValid && !isLoading ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <svg
              width="16"
              height="16"
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
            {isLoading ? 'Searching...' : 'Search'}
          </button>

          {/* Query Preview Toggle */}
          {isFormValid && (
            <button
              type="button"
              onClick={() => setShowQueryPreview(!showQueryPreview)}
              style={{
                padding: '0.625rem 1rem',
                background: 'transparent',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                color: '#6b7280',
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
            >
              {showQueryPreview ? '▼' : '▶'} Query Preview
            </button>
          )}
        </div>
      </form>

      {/* Query Preview */}
      {showQueryPreview && isFormValid && queryExplanation && (
        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          background: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '6px',
          fontSize: '0.875rem',
        }}>
          <div style={{ marginBottom: '1rem' }}>
            <strong style={{ color: '#374151' }}>Full Query:</strong>
            <code style={{
              display: 'block',
              marginTop: '0.5rem',
              padding: '0.75rem',
              background: '#1f2937',
              color: '#10b981',
              borderRadius: '4px',
              fontSize: '0.8125rem',
              fontFamily: 'monospace',
              overflowX: 'auto',
            }}>
              {queryExplanation.fullQuery}
            </code>
          </div>

          <div>
            <strong style={{ color: '#374151' }}>Breakdown:</strong>
            <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div>
                <span style={{ color: '#6b7280' }}>Keywords:</span>{' '}
                <span style={{ color: '#2563eb' }}>{queryExplanation.breakdown.keywords}</span>
              </div>
              <div>
                <span style={{ color: '#6b7280' }}>Required:</span>{' '}
                <span style={{ color: '#16a34a' }}>{queryExplanation.breakdown.required}</span>
              </div>
              <div>
                <span style={{ color: '#6b7280' }}>Exclude:</span>{' '}
                <span style={{ color: '#dc2626' }}>{queryExplanation.breakdown.exclude}</span>
              </div>
              <div>
                <span style={{ color: '#6b7280' }}>Location:</span>{' '}
                <span style={{ color: '#9333ea' }}>{queryExplanation.breakdown.location}</span>
              </div>
              <div>
                <span style={{ color: '#6b7280' }}>Time Filter:</span>{' '}
                <span style={{ color: '#ea580c' }}>{timeFilter === '24h' ? '24 hours' : timeFilter === '7d' ? '7 days' : '30 days'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
