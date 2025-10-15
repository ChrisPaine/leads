import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Briefcase, Lightbulb, Home, Sofa, Baby } from 'lucide-react';

interface ExamplesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectExample: (exampleType: 'business-leads' | 'pain-points' | 'real-estate' | 'free-furniture' | 'nanny-jobs') => void;
}

export const ExamplesModal: React.FC<ExamplesModalProps> = ({
  open,
  onOpenChange,
  onSelectExample,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Search Examples</DialogTitle>
          <DialogDescription>
            Choose a template to get started quickly with pre-configured search settings
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 py-4">
          {/* Business Leads */}
          <Button
            variant="outline"
            className="h-auto py-4 px-4 border-2 border-green-200 hover:border-green-400 hover:bg-green-50 dark:border-green-800 dark:hover:border-green-600 dark:hover:bg-green-950/20"
            onClick={() => {
              onSelectExample('business-leads');
              onOpenChange(false);
            }}
          >
            <div className="flex items-start gap-3 w-full">
              <Briefcase className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 text-left min-w-0 overflow-hidden">
                <h3 className="font-semibold text-base mb-1 break-words">Business Leads</h3>
                <p className="text-sm text-muted-foreground font-normal break-words">
                  Find people looking to hire you locally. Perfect for contractors, service providers, and local businesses.
                </p>
                <p className="text-xs text-muted-foreground mt-2 font-normal break-words">
                  Example: Carpenters in Maine looking for work opportunities
                </p>
              </div>
            </div>
          </Button>

          {/* Research Pain Points */}
          <Button
            variant="outline"
            className="h-auto py-4 px-4 border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 dark:border-blue-800 dark:hover:border-blue-600 dark:hover:bg-blue-950/20"
            onClick={() => {
              onSelectExample('pain-points');
              onOpenChange(false);
            }}
          >
            <div className="flex items-start gap-3 w-full">
              <Lightbulb className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 text-left min-w-0 overflow-hidden">
                <h3 className="font-semibold text-base mb-1 break-words">Research Pain Points</h3>
                <p className="text-sm text-muted-foreground font-normal break-words">
                  Discover what people want before you build. Find customer problems and unmet needs.
                </p>
                <p className="text-xs text-muted-foreground mt-2 font-normal break-words">
                  Example: E-bike owner frustrations and desires
                </p>
              </div>
            </div>
          </Button>

          {/* Real Estate Market */}
          <Button
            variant="outline"
            className="h-auto py-4 px-4 border-2 border-orange-200 hover:border-orange-400 hover:bg-orange-50 dark:border-orange-800 dark:hover:border-orange-600 dark:hover:bg-orange-950/20"
            onClick={() => {
              onSelectExample('real-estate');
              onOpenChange(false);
            }}
          >
            <div className="flex items-start gap-3 w-full">
              <Home className="w-6 h-6 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 text-left min-w-0 overflow-hidden">
                <h3 className="font-semibold text-base mb-1 break-words">Real Estate Market</h3>
                <p className="text-sm text-muted-foreground font-normal break-words">
                  Get construction cost and market intelligence by state. Find real build costs from actual homeowners.
                </p>
                <p className="text-xs text-muted-foreground mt-2 font-normal break-words">
                  Example: Construction costs per square foot in Maine
                </p>
              </div>
            </div>
          </Button>

          {/* Free Furniture */}
          <Button
            variant="outline"
            className="h-auto py-4 px-4 border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 dark:border-purple-800 dark:hover:border-purple-600 dark:hover:bg-purple-950/20"
            onClick={() => {
              onSelectExample('free-furniture');
              onOpenChange(false);
            }}
          >
            <div className="flex items-start gap-3 w-full">
              <Sofa className="w-6 h-6 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 text-left min-w-0 overflow-hidden">
                <h3 className="font-semibold text-base mb-1 break-words">Free Furniture</h3>
                <p className="text-sm text-muted-foreground font-normal break-words">
                  Find free or needed furniture listings in your area. Great for finding deals or items people are giving away.
                </p>
                <p className="text-xs text-muted-foreground mt-2 font-normal break-words">
                  Example: Free tables and furniture needed in Maine
                </p>
              </div>
            </div>
          </Button>

          {/* Nanny Jobs */}
          <Button
            variant="outline"
            className="h-auto py-4 px-4 border-2 border-pink-200 hover:border-pink-400 hover:bg-pink-50 dark:border-pink-800 dark:hover:border-pink-600 dark:hover:bg-pink-950/20"
            onClick={() => {
              onSelectExample('nanny-jobs');
              onOpenChange(false);
            }}
          >
            <div className="flex items-start gap-3 w-full">
              <Baby className="w-6 h-6 text-pink-600 dark:text-pink-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 text-left min-w-0 overflow-hidden">
                <h3 className="font-semibold text-base mb-1 break-words">Nanny Jobs</h3>
                <p className="text-sm text-muted-foreground font-normal break-words">
                  Find families looking for childcare help. Perfect for nannies, babysitters, and childcare providers.
                </p>
                <p className="text-xs text-muted-foreground mt-2 font-normal break-words">
                  Example: Families in Maine looking for nanny or childcare
                </p>
              </div>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
