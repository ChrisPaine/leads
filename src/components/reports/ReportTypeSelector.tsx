import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Rocket, Lock } from 'lucide-react';

interface ReportTypeSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectType: (type: 'summary' | 'mvp_builder') => void;
  isPaidUser: boolean;
  onUpgrade?: () => void;
}

export const ReportTypeSelector: React.FC<ReportTypeSelectorProps> = ({
  open,
  onOpenChange,
  onSelectType,
  isPaidUser,
  onUpgrade
}) => {
  const handleSelect = (type: 'summary' | 'mvp_builder') => {
    if (!isPaidUser) {
      onUpgrade?.();
      return;
    }
    onSelectType(type);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Choose Report Type</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {/* Summary Report */}
          <Card
            className={`relative cursor-pointer transition-all hover:shadow-lg flex flex-col ${
              !isPaidUser ? 'opacity-60' : ''
            }`}
            onClick={() => handleSelect('summary')}
          >
            {!isPaidUser && (
              <div className="absolute top-4 right-4">
                <Lock className="w-5 h-5 text-muted-foreground" />
              </div>
            )}
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-lg">Summary Report</CardTitle>
              </div>
              <CardDescription className="text-sm">
                Quick answers and actionable insights from community discussions
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="space-y-2 flex-1">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-0.5">Best for:</p>
                  <p className="text-xs">Consumers, researchers, quick decisions</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-0.5">Includes:</p>
                  <ul className="text-xs space-y-0.5">
                    <li>• Quick actionable answer</li>
                    <li>• Step-by-step solution</li>
                    <li>• Key insights & warnings</li>
                    <li>• Community consensus</li>
                    <li>• Source citations</li>
                  </ul>
                </div>
                {isPaidUser && (
                  <div className="pt-1">
                    <span className="text-xs text-green-600 dark:text-green-400 font-semibold">
                      ✓ Available with your plan
                    </span>
                  </div>
                )}
              </div>
              <Button className="w-full mt-3" size="sm" disabled={!isPaidUser}>
                {isPaidUser ? 'Generate Summary Report' : 'Upgrade to Generate'}
              </Button>
            </CardContent>
          </Card>

          {/* MVP Builder */}
          <Card
            className={`relative cursor-pointer transition-all hover:shadow-lg flex flex-col ${
              !isPaidUser ? 'opacity-60' : ''
            }`}
            onClick={() => handleSelect('mvp_builder')}
          >
            {!isPaidUser && (
              <div className="absolute top-4 right-4">
                <Lock className="w-5 h-5 text-muted-foreground" />
              </div>
            )}
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                  <Rocket className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-lg">MVP Builder</CardTitle>
              </div>
              <CardDescription className="text-sm">
                AI-generated product specifications ready for development
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="space-y-2 flex-1">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-0.5">Best for:</p>
                  <p className="text-xs">Founders, product managers, developers</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-0.5">Includes:</p>
                  <ul className="text-xs space-y-0.5">
                    <li>• Product name & positioning</li>
                    <li>• Problem statements with evidence</li>
                    <li>• Core MVP features list</li>
                    <li>• User personas from real data</li>
                    <li>• User quotes from discussions</li>
                    <li>• <strong>Working code template</strong> for Lovable.dev/ Bolt.new/ Replit.com</li>
                  </ul>
                </div>
                {isPaidUser && (
                  <div className="pt-1">
                    <span className="text-xs text-green-600 dark:text-green-400 font-semibold">
                      ✓ Available with your plan
                    </span>
                  </div>
                )}
              </div>
              <Button className="w-full mt-3" size="sm" disabled={!isPaidUser}>
                {isPaidUser ? 'Generate MVP Builder Report' : 'Upgrade to Generate'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {!isPaidUser && (
          <div className="mt-4 p-3 bg-muted rounded-lg text-center">
            <p className="text-xs mb-2">
              <Lock className="w-3 h-3 inline mr-1" />
              Upgrade to generate AI-powered reports from your search results
            </p>
            <Button onClick={onUpgrade} variant="default" size="sm">
              View Plans
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
