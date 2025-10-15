import React, { useState } from 'react';
import { LeadFinder } from './LeadFinder';
import type { SearchQuery } from '../lib/queryBuilder';
import { performSearch, type SearchResult } from '../lib/searchAPI';

/**
 * Example component showing how to display search results
 * This is an optional enhancement if you want to show results in-app
 * instead of opening platform websites
 */
export function LeadFinderWithResults() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (query: SearchQuery, queryString: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await performSearch(query);
      setResults(response.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <LeadFinder onSearch={handleSearch} />

      {/* Loading State */}
      {loading && (
        <div className="results-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Searching for leads...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="results-container">
          <div className="error-message">
            <svg
              className="error-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3>Search Error</h3>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Results */}
      {!loading && !error && results.length > 0 && (
        <div className="results-container">
          <div className="results-header">
            <h2>Found {results.length} leads</h2>
          </div>

          <div className="results-grid">
            {results.map((result) => (
              <div key={result.id} className="result-card">
                <div className="result-header">
                  <span className="result-platform">{result.platform}</span>
                  <span className="result-time">
                    {new Date(result.timestamp).toLocaleString()}
                  </span>
                </div>

                <h3 className="result-title">{result.title}</h3>
                <p className="result-content">{result.content}</p>

                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="result-link"
                >
                  View Post →
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {!loading && !error && results.length === 0 && (
        <div className="results-container">
          <div className="no-results">
            <svg
              className="no-results-icon"
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
            <h3>No results yet</h3>
            <p>Fill in the form above and click "Find Leads" to start searching</p>
          </div>
        </div>
      )}

      <style jsx>{`
        .results-container {
          max-width: 1200px;
          margin: 2rem auto;
          padding: 0 1rem;
        }

        .loading-spinner {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          gap: 1rem;
        }

        .spinner {
          width: 50px;
          height: 50px;
          border: 4px solid #e5e7eb;
          border-top-color: #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .error-message {
          background: #fee2e2;
          border: 2px solid #ef4444;
          border-radius: 0.5rem;
          padding: 2rem;
          text-align: center;
        }

        .error-icon {
          width: 3rem;
          height: 3rem;
          color: #ef4444;
          margin: 0 auto 1rem;
        }

        .error-message h3 {
          color: #991b1b;
          margin-bottom: 0.5rem;
        }

        .error-message p {
          color: #7f1d1d;
        }

        .results-header {
          margin-bottom: 2rem;
        }

        .results-header h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
        }

        .results-grid {
          display: grid;
          gap: 1.5rem;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        }

        .result-card {
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 0.75rem;
          padding: 1.5rem;
          transition: all 0.2s ease;
        }

        .result-card:hover {
          border-color: #667eea;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }

        .result-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          gap: 0.5rem;
        }

        .result-platform {
          padding: 0.25rem 0.75rem;
          background: #dbeafe;
          color: #1e40af;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: capitalize;
        }

        .result-time {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .result-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.75rem;
        }

        .result-content {
          color: #4b5563;
          line-height: 1.6;
          margin-bottom: 1rem;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .result-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: #667eea;
          font-weight: 600;
          text-decoration: none;
          transition: color 0.2s;
        }

        .result-link:hover {
          color: #764ba2;
        }

        .no-results {
          text-align: center;
          padding: 4rem 2rem;
        }

        .no-results-icon {
          width: 4rem;
          height: 4rem;
          color: #9ca3af;
          margin: 0 auto 1.5rem;
        }

        .no-results h3 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #6b7280;
          margin-bottom: 0.5rem;
        }

        .no-results p {
          color: #9ca3af;
        }

        @media (max-width: 640px) {
          .results-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
