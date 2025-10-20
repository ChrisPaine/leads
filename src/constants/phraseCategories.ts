export interface PhraseCategory {
  title: string;
  phrases: string[];
  isOpen: boolean;
}

export interface PhrasePreset {
  id: string;
  name: string;
  description: string;
  categories: number[];
}

export const initialPhraseCategories: PhraseCategory[] = [
  {
    title: 'Personal Expressions',
    isOpen: false,
    phrases: [
      '"I think"', '"I feel"', '"I was"', '"I have been"', '"I experienced"',
      '"my experience"', '"in my opinion"', 'IMO', '"my advice"'
    ]
  },
  {
    title: 'Learning Moments',
    isOpen: false,
    phrases: [
      '"I found that"', '"I learned"', '"I realized"', '"what I wish I knew"',
      '"what I regret"', '"my biggest mistake"'
    ]
  },
  {
    title: 'Problems & Struggles',
    isOpen: false,
    phrases: [
      '"struggling with"', 'problem', 'issues', 'challenge', 'difficulties',
      'hardships', '"pain point"', 'barriers', 'obstacles', 'needed'
    ]
  },
  {
    title: 'Emotions & Concerns',
    isOpen: false,
    phrases: [
      'concerns', 'frustrations', 'worries', 'hesitations',
      '"my biggest struggle"', '"my biggest fear"'
    ]
  }
];

export const phrasePresets: PhrasePreset[] = [
  {
    id: 'customer-feedback',
    name: 'Customer Feedback',
    description: 'Personal opinions and emotional responses',
    categories: [0, 3] // Personal Expressions + Emotions & Concerns
  },
  {
    id: 'user-research',
    name: 'User Research',
    description: 'Learning experiences and challenges',
    categories: [1, 2] // Learning Moments + Problems & Struggles
  },
  {
    id: 'pain-discovery',
    name: 'Pain Point Discovery',
    description: 'Problems and emotional concerns',
    categories: [2, 3] // Problems & Struggles + Emotions & Concerns
  },
  {
    id: 'experience-insights',
    name: 'Experience Insights',
    description: 'Personal experiences and learnings',
    categories: [0, 1] // Personal Expressions + Learning Moments
  },
  {
    id: 'complete-research',
    name: 'Complete Research',
    description: 'All phrase categories',
    categories: [0, 1, 2, 3] // All categories
  }
];
