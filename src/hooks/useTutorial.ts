import { useState, useEffect } from 'react';
import { PhraseCategory } from '@/constants/phraseCategories';

interface TutorialStep {
  target: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  action?: () => void;
  buttons?: Array<{ text: string; action: () => void }>;
}

interface UseTutorialProps {
  user: any;
  isPro: boolean;
  isPremium: boolean;
  isEnterprise: boolean;
  isAdmin: boolean;
  setMainTopic: (value: string) => void;
  setAdditionalKeywords: (value: string) => void;
  setSelectedPlatforms: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedPhrases: (value: string[]) => void;
  setSelectedPreset: (value: string) => void;
  setRedditAdvancedOpen: (value: boolean) => void;
  setShowAdvancedModal: (value: boolean) => void;
  setSelectedPlatformForAdvanced: (value: string) => void;
}

export const useTutorial = ({
  user,
  isPro,
  isPremium,
  isEnterprise,
  isAdmin,
  setMainTopic,
  setAdditionalKeywords,
  setSelectedPlatforms,
  setSelectedPhrases,
  setSelectedPreset,
  setRedditAdvancedOpen,
  setShowAdvancedModal,
  setSelectedPlatformForAdvanced
}: UseTutorialProps) => {
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [spotlightTick, setSpotlightTick] = useState(0);

  const tutorialSteps: TutorialStep[] = [
    {
      target: '#main-topic',
      title: 'Step 1: Enter Your Research Topic',
      content: 'Start by entering the main topic or market you want to research. For example: "SaaS tools", "fitness apps", or "productivity software".',
      position: 'bottom'
    },
    {
      target: '.profitable-market-templates',
      title: 'Step 2: Explore Profitable Market Templates',
      content: 'Save time with our pre-built market topic templates! Each template includes hundreds of profitable niches and sub-niches with real search volume data (like "1.2M" or "450K"). Perfect for discovering high-demand topics in Health, Wealth, and Relationships markets.',
      position: 'bottom'
    },
    {
      target: '#additional-keywords',
      title: 'Step 3: Search Within Comments & Content',
      content: 'Use this field to search within the actual text of posts and comments. This powerful feature helps you find specific discussions, pain points, and user feedback that contain your exact keywords.',
      position: 'bottom'
    },
    {
      target: '#platform-selector',
      title: 'Step 4: Choose Platforms',
      content: 'Select which social media platforms to search. Each platform has unique advanced options for better targeting. Let me show you Reddit\'s advanced features!',
      position: 'left',
      action: () => {
        setSelectedPlatforms((prev) => (prev.includes('reddit') ? prev : [...prev, 'reddit']));
        setRedditAdvancedOpen(true);
      }
    },
    {
      target: '#advanced-modal-trigger',
      title: 'Step 5: Platform Advanced Features',
      content: user && (isPro || isPremium || isEnterprise || isAdmin)
        ? 'Each platform offers powerful advanced options! Click the settings icon next to any selected platform to access features like Reddit\'s self-posts, high-engagement filtering, and more.'
        : 'Each platform offers powerful advanced options like Reddit\'s self-posts and high-engagement filtering. These features are available with a Pro subscription - for now, let\'s continue with the basic setup!',
      position: 'left',
      action: () => {
        if (user && (isPro || isPremium || isEnterprise || isAdmin)) {
          setShowAdvancedModal(true);
          setSelectedPlatformForAdvanced('reddit');
        }
      }
    },
    {
      target: '#phrase-builder',
      title: 'Step 6: Select Pain Point Phrases',
      content: 'Choose from pre-built phrase categories that help identify customer pain points, or select a preset for quick setup.',
      position: 'right'
    },
    {
      target: '#main-topic',
      title: 'Step 7: Search Settings',
      content: 'Use the time filter in the Research Topic section to focus on recent discussions. You can also enable browser tabs if you prefer the old-style search.',
      position: 'bottom'
    },
    {
      target: '#search-button',
      title: 'Step 8: Try It Now!',
      content: 'Ready to see this in action? Click "Load Weight Loss Example" below to populate the form with a complete weight loss research setup, then hit the search button to start finding real customer pain points!',
      position: 'top',
      buttons: [
        {
          text: 'Load Weight Loss Example',
          action: () => {
            setMainTopic('weight loss');
            setAdditionalKeywords('"struggling with diet motivation" "craving plateau" "emotional eating"');
            setSelectedPlatforms(['reddit', 'facebook', 'google-trends']);
            setSelectedPhrases([
              "I can't",
              "I struggle with",
              "I'm frustrated by",
              "I hate",
              "I need help with",
              "I don't know how to",
              "I'm tired of",
              "I wish I could",
              "I'm stuck",
              "I'm overwhelmed by",
              "I'm confused about",
              "I'm worried about",
              "I'm afraid of",
              "I keep failing at",
              "I give up on",
              "I'm discouraged by",
              "I'm stressed about",
              "I can't afford",
              "I don't have time for",
              "I'm too busy for"
            ]);
            setSelectedPreset('complete-research');
          }
        }
      ]
    }
  ];

  const nextStep = () => {
    const currentStep = tutorialSteps[tutorialStep];

    if (currentStep.action) {
      currentStep.action();
    }

    if (tutorialStep < tutorialSteps.length - 1) {
      setTutorialStep(tutorialStep + 1);
    } else {
      setShowTutorial(false);
      setTutorialStep(0);
    }
  };

  const prevStep = () => {
    if (tutorialStep > 0) {
      setTutorialStep(tutorialStep - 1);
    }
  };

  const skipTutorial = () => {
    setShowTutorial(false);
    setTutorialStep(0);
  };

  useEffect(() => {
    if (!showTutorial) return;
    const step = tutorialSteps[tutorialStep];
    if (!step?.target) return;

    const tryScroll = () => {
      const selector = step.target;
      let el = document.querySelector(selector) as HTMLElement | null;
      if (!el && selector === '#advanced-modal-trigger') {
        el = document.querySelector('#platform-selector') as HTMLElement | null;
      }
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
        setTimeout(() => setSpotlightTick((t) => t + 1), 300);
        return true;
      }
      return false;
    };

    let attempts = 0;
    const maxAttempts = 10;
    let timer: number | undefined;
    const run = () => {
      if (tryScroll() || attempts++ >= maxAttempts) {
        if (timer) clearInterval(timer);
      }
    };
    timer = window.setInterval(run, 200);
    run();
    return () => { if (timer) clearInterval(timer); };
  }, [tutorialStep, showTutorial]);

  return {
    showTutorial,
    setShowTutorial,
    tutorialStep,
    setTutorialStep,
    spotlightTick,
    tutorialSteps,
    nextStep,
    prevStep,
    skipTutorial
  };
};
