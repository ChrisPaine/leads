import React from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ThemeToggle } from './theme-toggle';
import { User, LogOut, Crown, TrendingUp, FolderOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  user: any;
  isPro: boolean;
  isPremium: boolean;
  isEnterprise: boolean;
  isAdmin: boolean;
  subscriptionTier: string | null;
  signOut: () => void;
  setSavedQueriesDialogOpen: (open: boolean) => void;
  setShowTutorial: (show: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  isPro,
  isPremium,
  isEnterprise,
  isAdmin,
  subscriptionTier,
  signOut,
  setSavedQueriesDialogOpen,
  setShowTutorial
}) => {
  const navigate = useNavigate();

  // Determine badge display text
  const getBadgeText = () => {
    if (isAdmin) return 'Admin';
    if (isEnterprise) return 'Enterprise';
    if (subscriptionTier === 'agency' || isPro) return 'Agency';
    if (subscriptionTier === 'professional' || isPremium) return 'Professional';
    if (subscriptionTier === 'starter') return 'Starter';
    return 'Pro'; // Fallback for legacy
  };

  return (
    <header className="bg-background shadow-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSavedQueriesDialogOpen(true)}
                >
                  <FolderOpen className="w-4 h-4 mr-2" />
                  Saved Queries
                </Button>
              </div>
            )}
          </div>

          <div className="flex-1 text-center">
            <h1 className="text-2xl font-bold text-foreground uppercase tracking-wide mb-1">
              Pain Point Discovery Tool
            </h1>
            <p className="text-sm text-muted-foreground">
              Build advanced search queries to discover customer insights across social platforms
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Help Tour button hidden for now - can be re-enabled later */}
            {/* <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTutorial(true)}
              className="text-muted-foreground hover:text-foreground"
            >
              Help Tour
            </Button> */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/pricing')}
              className="text-primary border-primary hover:bg-primary hover:text-primary-foreground"
            >
              Pricing
            </Button>
            <ThemeToggle />
            {user ? (
              <div className="flex items-center gap-2">
                {(isPro || isPremium || isEnterprise || isAdmin || subscriptionTier) && (
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    <Crown className="w-3 h-3 mr-1" />
                    {getBadgeText()}
                  </Badge>
                )}
                <Button variant="ghost" size="sm" onClick={signOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={() => navigate('/auth')}>
                <User className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
