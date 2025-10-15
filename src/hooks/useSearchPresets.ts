import { useState } from 'react';
import { phrasePresets, initialPhraseCategories, PhraseCategory } from '@/constants/phraseCategories';

export const useSearchPresets = (
  setSelectedPhrases: (value: string[]) => void,
  setPhraseCategories: (value: PhraseCategory[]) => void,
  setMainTopic: (value: string) => void,
  setAdditionalKeywords: (value: string) => void,
  setSelectedPlatforms: (value: string[]) => void,
  setTimeFilter?: (value: 'any' | 'hour' | 'day' | 'week' | 'month' | 'year') => void,
  setAdvancedOptions?: (value: any) => void,
  initialAdvancedOptions?: any,
  setCommentsSearch?: (value: string) => void,
  setContactsSearch?: (value: string) => void,
  setExclusionsSearch?: (value: string) => void
) => {
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [saveQueryTitle, setSaveQueryTitle] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);

  const applyPreset = (presetId: string) => {
    const preset = phrasePresets.find(p => p.id === presetId);
    if (!preset) return;

    // Convert category indices to actual phrases
    const allPhrases: string[] = [];
    preset.categories.forEach(catIndex => {
      const category = initialPhraseCategories[catIndex];
      if (category) {
        allPhrases.push(...category.phrases);
      }
    });

    setSelectedPhrases(allPhrases);
    setSelectedPreset(presetId);

    const updatedCategories = initialPhraseCategories.map((cat, index) => ({
      ...cat,
      isOpen: preset.categories.includes(index)
    }));
    setPhraseCategories(updatedCategories);
  };

  const clearAllPhrases = () => {
    setSelectedPhrases([]);
    setSelectedPreset('');
  };

  const clearAllSettings = () => {
    setMainTopic('');
    setAdditionalKeywords('');
    setSelectedPlatforms([]);
    setSelectedPhrases([]);
    setSelectedPreset('');
    setPhraseCategories(initialPhraseCategories);

    // Reset time filter to 'any'
    if (setTimeFilter) {
      setTimeFilter('any');
    }

    // Reset advanced options to initial state
    if (setAdvancedOptions && initialAdvancedOptions) {
      setAdvancedOptions(initialAdvancedOptions);
    }

    // Clear the three search boxes
    if (setCommentsSearch) {
      setCommentsSearch('');
    }
    if (setContactsSearch) {
      setContactsSearch('');
    }
    if (setExclusionsSearch) {
      setExclusionsSearch('');
    }
  };

  const handleLoadQuery = (queryData: any, platforms: string[]) => {
    setMainTopic(queryData.main_topic || '');
    setAdditionalKeywords(queryData.additional_keywords || '');
    setSelectedPlatforms(platforms || []);

    if (queryData.selected_phrases && Array.isArray(queryData.selected_phrases)) {
      setSelectedPhrases(queryData.selected_phrases);
      const updatedCategories = initialPhraseCategories.map(cat => ({
        ...cat,
        isOpen: queryData.selected_phrases.some((p: string) => cat.phrases.includes(p))
      }));
      setPhraseCategories(updatedCategories);
    }
  };

  return {
    selectedPreset,
    setSelectedPreset,
    saveQueryTitle,
    setSaveQueryTitle,
    showSaveInput,
    setShowSaveInput,
    applyPreset,
    clearAllPhrases,
    clearAllSettings,
    handleLoadQuery
  };
};
