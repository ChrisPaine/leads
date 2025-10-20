import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Crown, Globe, Settings, Lock } from 'lucide-react';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';
import { Platform, getAllowedPlatforms } from '@/constants/platforms';

interface PlatformSelectorProps {
  selectedPlatforms: string[];
  setSelectedPlatforms: React.Dispatch<React.SetStateAction<string[]>>;
  platforms: Platform[];
  user: any;
  setAuthDialogOpen: (open: boolean) => void;
  setPaywallDialogOpen: (open: boolean) => void;
  setPaywallFeature: (feature: string) => void;
  setSelectedPlatformForAdvanced: (platform: string) => void;
  setShowAdvancedModal: (open: boolean) => void;
  platformDescriptions: Record<string, string>;
  isPro: boolean;
  isPremium: boolean;
  isEnterprise: boolean;
  isAdmin: boolean;
  subscriptionTier?: string;
  hasCredits?: boolean;
}

const PlatformSelector: React.FC<PlatformSelectorProps> = ({
  selectedPlatforms,
  setSelectedPlatforms,
  platforms,
  user,
  setAuthDialogOpen,
  setPaywallDialogOpen,
  setPaywallFeature,
  setSelectedPlatformForAdvanced,
  setShowAdvancedModal,
  platformDescriptions,
  isPro,
  isPremium,
  isEnterprise,
  isAdmin,
  subscriptionTier,
  hasCredits,
}) => {
  // Get allowed platforms based on subscription tier
  const allowedPlatformIds = getAllowedPlatforms(isPro, isPremium, isEnterprise, isAdmin, subscriptionTier, hasCredits);

  const togglePlatform = (platformId: string, isLocked: boolean) => {
    console.log('=== TOGGLE PLATFORM ===');
    console.log('Platform ID clicked:', platformId);
    console.log('Is locked:', isLocked);

    if (isLocked) {
      if (!user) {
        setAuthDialogOpen(true);
      } else {
        setPaywallFeature(`access ${platformId}`);
        setPaywallDialogOpen(true);
      }
      return;
    }

    setSelectedPlatforms(prev => {
      const newPlatforms = prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId];
      console.log('New selected platforms:', newPlatforms);
      return newPlatforms;
    });
  };

  return (
    <Card id="platform-selector" className="shadow-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Globe className="w-5 h-5 text-research-blue" />
            Platforms
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={selectedPlatforms.length === allowedPlatformIds.length && allowedPlatformIds.length > 0}
              onCheckedChange={(checked) => {
                if (checked) {
                  setSelectedPlatforms(allowedPlatformIds);
                } else {
                  setSelectedPlatforms([]);
                }
              }}
              className="h-4 w-4"
              disabled={allowedPlatformIds.length === 0}
            />
            <Label className="text-sm font-medium cursor-pointer">All</Label>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-1">
          {platforms.map((platform) => {
            const isLocked = !allowedPlatformIds.includes(platform.id);
            const platformElement = (
              <label
                key={platform.id}
                className={`flex items-center space-x-3 p-3 rounded-lg border border-transparent transition-all ${
                  isLocked
                    ? 'opacity-60 cursor-not-allowed'
                    : 'hover:bg-muted/50 cursor-pointer hover:border-border'
                }`}
              >
                 <Checkbox
                   checked={selectedPlatforms.includes(platform.id)}
                   onCheckedChange={() => togglePlatform(platform.id, isLocked)}
                   className="h-4 w-4 flex-shrink-0"
                   disabled={isLocked}
                 />
                 <span className={`${platform.color} flex-shrink-0`}>
                   {React.createElement(platform.icon, { className: 'w-4 h-4' })}
                 </span>
                 <span className="font-medium text-sm flex-1">{platform.name}</span>
                 {isLocked && (
                   <Lock className="w-3 h-3 text-muted-foreground" />
                 )}
                  {!isLocked && selectedPlatforms.includes(platform.id) && platform.id !== 'google-trends' && (
                    user && (isPro || isPremium || isEnterprise || isAdmin) ? (
                      <Button
                        id={platform.id === 'reddit' ? 'advanced-modal-trigger' : undefined}
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-muted"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedPlatformForAdvanced(platform.id);
                          setShowAdvancedModal(true);
                        }}
                      >
                        <Settings className="h-3 w-3" />
                      </Button>
                    ) : (
                      <Button
                        id={platform.id === 'reddit' ? 'advanced-modal-trigger' : undefined}
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-muted"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (!user) {
                            setAuthDialogOpen(true);
                          } else {
                            setPaywallFeature('advanced-operators');
                            setPaywallDialogOpen(true);
                          }
                        }}
                      >
                        <Crown className="h-3 w-3" />
                      </Button>
                    )
                  )}
              </label>
            );

            if (platform.id === 'google-trends') {
              return (
                <Tooltip key={platform.id}>
                  <TooltipTrigger asChild>
                    {platformElement}
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Uses Main Topic only! You'll have to change on Google Trends tab to Topic not Search term.</p>
                  </TooltipContent>
                </Tooltip>
              );
            }

            if (platformDescriptions[platform.id]) {
              return (
                <Tooltip key={platform.id}>
                  <TooltipTrigger asChild>
                    {platformElement}
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{platformDescriptions[platform.id]}</p>
                  </TooltipContent>
                </Tooltip>
              );
            }

            return platformElement;
          })}
        </div>

        {selectedPlatforms.length > 0 && (
          <div className="mt-4 p-3 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{selectedPlatforms.length}</span> platform{selectedPlatforms.length !== 1 ? 's' : ''} selected
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PlatformSelector;
