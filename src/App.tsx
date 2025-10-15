import IndexSimpleNoAuth from './pages/IndexSimpleNoAuth';

/**
 * Main App Component - Demo Mode (No Supabase)
 *
 * Simplified Business Lead Finder:
 * - Header: "BUSINESS LEAD FINDER"
 * - I'm a: dropdown (from trades-config.json)
 * - Location: input field
 * - Hidden: Platform (Facebook + Nextdoor only)
 * - Hidden: Time filter (24 hours only)
 * - Keywords: Handled by trades-config.json
 * - Demo: Shows query building without actual search
 */

function App() {
  return <IndexSimpleNoAuth />;
}

export default App;
