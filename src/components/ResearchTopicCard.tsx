import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { GoogleAutocomplete } from './ui/google-autocomplete';

interface ResearchTopicCardProps {
  mainTopic: string;
  setMainTopic: (value: string) => void;
  additionalKeywords: string;
  setAdditionalKeywords: (value: string) => void;
  timeFilter: 'any' | 'hour' | 'day' | 'week' | 'month' | 'year';
  setTimeFilter: (value: 'any' | 'hour' | 'day' | 'week' | 'month' | 'year') => void;
}

export const ResearchTopicCard: React.FC<ResearchTopicCardProps> = ({
  mainTopic,
  setMainTopic,
  additionalKeywords,
  setAdditionalKeywords,
  timeFilter,
  setTimeFilter
}) => {
  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <span className="bg-gradient-to-r from-research-blue to-research-blue-dark bg-clip-text text-transparent">
              Research Topic
            </span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Label htmlFor="time-filter" className="text-sm text-muted-foreground whitespace-nowrap">
              Time:
            </Label>
            <Select value={timeFilter} onValueChange={(value: any) => setTimeFilter(value)}>
              <SelectTrigger id="time-filter" className="w-[120px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any time</SelectItem>
                <SelectItem value="hour">Past hour</SelectItem>
                <SelectItem value="day">Past day</SelectItem>
                <SelectItem value="week">Past week</SelectItem>
                <SelectItem value="month">Past month</SelectItem>
                <SelectItem value="year">Past year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="main-topic">Main Topic or Market</Label>
          <GoogleAutocomplete
            id="main-topic"
            value={mainTopic}
            onChange={setMainTopic}
            placeholder="e.g., weight loss, SaaS tools, productivity apps..."
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="additional-keywords">
            Search Within Comments & Content
            <span className="text-xs text-muted-foreground ml-2">(Optional - use quotes for exact phrases)</span>
          </Label>
          <Input
            id="additional-keywords"
            value={additionalKeywords}
            onChange={(e) => setAdditionalKeywords(e.target.value)}
            placeholder='e.g., "struggling with" "can\'t find" motivation'
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Tip: Use quotes around phrases to search for exact matches within post text and comments
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
