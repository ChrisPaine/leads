import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface ReportLoadingOverlayProps {
  open: boolean;
  onCancel: () => void;
}

const loadingMessages = [
  'Analyzing community discussions...',
  'Extracting key insights...',
  'Generating your report...',
];

export const ReportLoadingOverlay: React.FC<ReportLoadingOverlayProps> = ({
  open,
  onCancel
}) => {
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!open) {
      setMessageIndex(0);
      setProgress(0);
      return;
    }

    // Rotate messages every 10 seconds
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 10000);

    // Update progress bar smoothly
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + 2;
      });
    }, 1000);

    return () => {
      clearInterval(messageInterval);
      clearInterval(progressInterval);
    };
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-md" hideCloseButton>
        <div className="text-center py-8 space-y-6">
          {/* Animated Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-primary/30 rounded-full"></div>
              <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
            </div>
          </div>

          {/* Loading Message */}
          <div className="space-y-2">
            <p className="text-lg font-semibold animate-pulse">
              {loadingMessages[messageIndex]}
            </p>
            <p className="text-sm text-muted-foreground">
              Estimated time: 30-60 seconds
            </p>
          </div>

          {/* Progress Bar */}
          <Progress value={progress} className="w-full" />

          {/* Cancel Button */}
          <Button variant="outline" onClick={onCancel} className="mt-4">
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
