import React, { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ThemeToggle } from './theme-toggle';
import { User, LogOut, Crown, TrendingUp, FolderOpen, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        {/* Desktop Layout */}
        <div className="hidden md:grid md:grid-cols-3 md:items-center md:gap-4">
          {/* Left Section */}
          <div className="flex items-center gap-4 justify-start">
            {user && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSavedQueriesDialogOpen(true)}
              >
                <FolderOpen className="w-4 h-4 mr-2" />
                Saved Queries
              </Button>
            )}
          </div>

          {/* Center Section - Title */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground uppercase tracking-wide mb-1">
              Pain Point Discovery Tool
            </h1>
            <p className="text-sm text-muted-foreground">
              Build advanced search queries to discover customer insights across social platforms
            </p>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2 justify-end">
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
              <>
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
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={() => navigate('/auth')}>
                <User className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden">
          <div className="flex items-center justify-between">
            {/* Left - Saved Queries (if logged in) */}
            <div className="flex-1">
              {user && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSavedQueriesDialogOpen(true)}
                  className="px-2"
                >
                  <FolderOpen className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Center - Title */}
            <div className="flex-1 text-center">
              <h1 className="text-lg font-bold text-foreground uppercase tracking-wide">
                PPDT
              </h1>
            </div>

            {/* Right - Hamburger Menu */}
            <div className="flex-1 flex justify-end">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="px-2">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-64">
                  <div className="flex flex-col gap-4 mt-8">
                    {/* Theme Toggle */}
                    <div className="flex items-center justify-between px-2">
                      <span className="text-sm font-medium">Theme</span>
                      <ThemeToggle />
                    </div>

                    {/* Pricing */}
                    <Button
                      variant="outline"
                      onClick={() => {
                        navigate('/pricing');
                        setMobileMenuOpen(false);
                      }}
                      className="text-primary border-primary hover:bg-primary hover:text-primary-foreground w-full"
                    >
                      Pricing
                    </Button>

                    {/* User Section */}
                    {user ? (
                      <>
                        {(isPro || isPremium || isEnterprise || isAdmin || subscriptionTier) && (
                          <Badge variant="secondary" className="bg-primary/10 text-primary w-fit">
                            <Crown className="w-3 h-3 mr-1" />
                            {getBadgeText()}
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          onClick={() => {
                            signOut();
                            setMobileMenuOpen(false);
                          }}
                          className="w-full justify-start"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Sign Out
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => {
                          navigate('/auth');
                          setMobileMenuOpen(false);
                        }}
                        className="w-full justify-start"
                      >
                        <User className="w-4 h-4 mr-2" />
                        Sign In
                      </Button>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Mobile - Subtitle */}
          <p className="text-xs text-muted-foreground text-center mt-2">
            Build advanced search queries to discover customer insights
          </p>
        </div>
      </div>
    </header>
  );
};
