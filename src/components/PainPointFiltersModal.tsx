import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { PhraseCategory } from '@/constants/phraseCategories';

interface PainPointFiltersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  phraseCategories: PhraseCategory[];
  selectedPhrases: string[];
  onSelectPhrase: (phrase: string) => void;
  onSelectCategory: (categoryIndex: number) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
}

export const PainPointFiltersModal: React.FC<PainPointFiltersModalProps> = ({
  open,
  onOpenChange,
  phraseCategories,
  selectedPhrases,
  onSelectPhrase,
  onSelectCategory,
  onSelectAll,
  onClearAll,
}) => {
  const isCategoryFullySelected = (category: PhraseCategory) => {
    return category.phrases.every(phrase => selectedPhrases.includes(phrase));
  };

  const isAllSelected = () => {
    const allPhrases = phraseCategories.flatMap(cat => cat.phrases);
    return allPhrases.every(phrase => selectedPhrases.includes(phrase));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Pain Point Filters</DialogTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onSelectAll}
                disabled={isAllSelected()}
              >
                Select All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onClearAll}
                disabled={selectedPhrases.length === 0}
              >
                Clear All
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {phraseCategories.map((category, categoryIndex) => {
            const categoryFullySelected = isCategoryFullySelected(category);
            const categorySomeSelected = category.phrases.some(phrase => selectedPhrases.includes(phrase));

            return (
              <div key={category.title} className="space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <Checkbox
                    checked={categoryFullySelected}
                    onCheckedChange={() => onSelectCategory(categoryIndex)}
                    className={categorySomeSelected && !categoryFullySelected ? 'opacity-50' : ''}
                  />
                  <h3 className="font-semibold text-base">{category.title}</h3>
                  <span className="text-xs text-muted-foreground">
                    ({category.phrases.filter(p => selectedPhrases.includes(p)).length}/{category.phrases.length})
                  </span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pl-6">
                  {category.phrases.map((phrase) => (
                    <Badge
                      key={phrase}
                      variant={selectedPhrases.includes(phrase) ? "default" : "secondary"}
                      className="cursor-pointer justify-center py-1.5 px-3 hover:scale-105 transition-transform text-xs"
                      onClick={() => onSelectPhrase(phrase)}
                    >
                      {phrase}
                    </Badge>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            {selectedPhrases.length} phrase{selectedPhrases.length !== 1 ? 's' : ''} selected
          </p>
          <Button onClick={() => onOpenChange(false)}>Done</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
