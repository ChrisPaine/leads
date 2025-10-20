import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Briefcase, Lightbulb, Home, Sofa, Briefcase as BriefcaseAlt } from 'lucide-react';

interface ExamplesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectExample: (exampleType: 'business-leads' | 'pain-points' | 'real-estate' | 'free-furniture' | 'job-listings') => void;
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
            Choose a template to get started quickly
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
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-base mb-1">Business Leads</h3>
                <p className="text-sm text-muted-foreground font-normal">
                  Find people looking to hire you locally
                </p>
                <p className="text-xs text-muted-foreground mt-2 font-normal">
                  Example: Carpenters in Maine looking for work
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
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-base mb-1">Research Pain Points</h3>
                <p className="text-sm text-muted-foreground font-normal">
                  Discover customer problems and unmet needs
                </p>
                <p className="text-xs text-muted-foreground mt-2 font-normal">
                  Example: E-bike owner frustrations
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
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-base mb-1">Real Estate Market</h3>
                <p className="text-sm text-muted-foreground font-normal">
                  Find construction costs and market intelligence
                </p>
                <p className="text-xs text-muted-foreground mt-2 font-normal">
                  Example: Construction costs per sqft in Maine
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
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-base mb-1">Free Furniture</h3>
                <p className="text-sm text-muted-foreground font-normal">
                  Find free or needed furniture in your area
                </p>
                <p className="text-xs text-muted-foreground mt-2 font-normal">
                  Example: Free tables and furniture in Maine
                </p>
              </div>
            </div>
          </Button>

          {/* Job Listings */}
          <Button
            variant="outline"
            className="h-auto py-4 px-4 border-2 border-pink-200 hover:border-pink-400 hover:bg-pink-50 dark:border-pink-800 dark:hover:border-pink-600 dark:hover:bg-pink-950/20"
            onClick={() => {
              onSelectExample('job-listings');
              onOpenChange(false);
            }}
          >
            <div className="flex items-start gap-3 w-full">
              <BriefcaseAlt className="w-6 h-6 text-pink-600 dark:text-pink-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-base mb-1">Job Listings</h3>
                <p className="text-sm text-muted-foreground font-normal">
                  Find families looking for childcare help
                </p>
                <p className="text-xs text-muted-foreground mt-2 font-normal">
                  Example: Families in Maine looking for nanny
                </p>
              </div>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
