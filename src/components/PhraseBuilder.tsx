import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';
import { PhraseCategory, PhrasePreset } from '@/constants/phraseCategories';

interface PhraseBuilderProps {
  phraseCategories: PhraseCategory[];
  setPhraseCategories: React.Dispatch<React.SetStateAction<PhraseCategory[]>>;
  selectedPhrases: string[];
  selectedPreset: string;
  phrasePresets: PhrasePreset[];
  applyPreset: (presetId: string) => void;
  clearAllPhrases: () => void;
  toggleCategory: (categoryIndex: number) => void;
  togglePhrase: (phrase: string) => void;
}

const PhraseBuilder: React.FC<PhraseBuilderProps> = ({
  phraseCategories,
  selectedPhrases,
  selectedPreset,
  phrasePresets,
  applyPreset,
  clearAllPhrases,
  toggleCategory,
  togglePhrase,
}) => {
  return (
    <Card id="phrase-builder" className="shadow-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg border-b border-border pb-2">
            <MessageSquare className="w-5 h-5 text-research-blue" />
            Pain Point Filter
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={selectedPreset} onValueChange={applyPreset}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Choose preset..." />
              </SelectTrigger>
              <SelectContent>
                {phrasePresets.map((preset) => (
                  <SelectItem key={preset.id} value={preset.id} textValue={preset.name}>
                    <div className="flex flex-col">
                      <span className="font-medium">{preset.name}</span>
                      <span className="text-xs text-muted-foreground">{preset.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedPhrases.length > 0 && (
              <Button variant="outline" size="sm" onClick={clearAllPhrases}>
                Clear All ({selectedPhrases.length})
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {phraseCategories.map((category, categoryIndex) => (
          <Collapsible
            key={category.title}
            open={category.isOpen}
            onOpenChange={() => toggleCategory(categoryIndex)}
          >
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between p-2 bg-research-gray rounded-lg hover:bg-research-blue-light transition-colors">
                <h3 className="font-semibold text-left text-sm">{category.title}</h3>
                {category.isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 p-2 bg-white rounded-lg border border-border">
                {category.phrases.map((phrase) => (
                  <Badge
                    key={phrase}
                    variant={selectedPhrases.includes(phrase) ? "default" : "secondary"}
                    className="cursor-pointer justify-center py-1 px-2 hover:scale-105 transition-transform text-xs"
                    onClick={() => togglePhrase(phrase)}
                  >
                    {phrase}
                  </Badge>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </CardContent>
    </Card>
  );
};

export default PhraseBuilder;
