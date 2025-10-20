import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Search } from 'lucide-react';

interface Suggestion {
  title: string;
  snippet: string;
  volume?: number;
  formattedVolume?: string;
}

interface GoogleAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
}

export const GoogleAutocomplete = ({ 
  value, 
  onChange, 
  placeholder = "Enter your topic...",
  className = "",
  id
}: GoogleAutocompleteProps) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceTimeout = useRef<NodeJS.Timeout>();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('google-suggestions', {
        body: { query }
      });

      if (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      } else {
        setSuggestions(data.suggestions || []);
        setShowSuggestions(data.suggestions?.length > 0);
      }
    } catch (error) {
      console.error('Error:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Clear previous debounce
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    // Debounce the API call
    debounceTimeout.current = setTimeout(() => {
      fetchSuggestions(newValue);
    }, 300);
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    // Use the suggestion title verbatim
    onChange(suggestion.title);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          id={id}
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="pl-10"
          onFocus={() => value.length >= 2 && suggestions.length > 0 && setShowSuggestions(true)}
          onBlur={() => setShowSuggestions(false)}
        />
      </div>
      
      {showSuggestions && (suggestions.length > 0 || isLoading) && (
        <Card className="absolute z-50 w-full mt-1 max-h-64 overflow-y-auto border shadow-lg bg-background">
          {isLoading ? (
            <div className="p-3 text-center text-muted-foreground">
              Loading suggestions...
            </div>
          ) : (
            <div className="py-1">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="px-3 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
                  onMouseDown={() => handleSuggestionClick(suggestion)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {suggestion.title}
                      </div>
                      {suggestion.formattedVolume && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {suggestion.formattedVolume} monthly searches
                        </div>
                      )}
                    </div>
                    {suggestion.formattedVolume && (
                      <div className="ml-2 px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
                        {suggestion.formattedVolume}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};