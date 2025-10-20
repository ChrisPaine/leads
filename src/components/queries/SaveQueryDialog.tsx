import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface SaveQueryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (title: string) => Promise<void>;
}

export const SaveQueryDialog: React.FC<SaveQueryDialogProps> = ({
  open,
  onOpenChange,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!title.trim()) {
      toast({
        title: 'Title required',
        description: 'Please enter a title for this query.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      await onSave(title.trim());
      setTitle('');
      onOpenChange(false);
      toast({
        title: 'Query saved',
        description: `"${title}" has been saved. Click "Saved Queries" in the top-left to view it.`,
        duration: 5000,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save query. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save Query</DialogTitle>
          <DialogDescription>
            Give your search query a memorable name so you can easily find it later.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Label htmlFor="query-title" className="text-sm font-medium">
            Query Title
          </Label>
          <Input
            id="query-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Maine Carpenter Leads"
            className="mt-2"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSave();
              }
            }}
            autoFocus
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !title.trim()}>
            {saving ? 'Saving...' : 'Save Query'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
