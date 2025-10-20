import React from 'react';
import { Button } from './ui/button';

interface TutorialStep {
  target: string;
  position: 'left' | 'right' | 'top' | 'bottom';
  title: string;
  content: string;
  buttons?: { text: string; action: () => void }[];
}

interface TutorialOverlayProps {
  showTutorial: boolean;
  tutorialSteps: TutorialStep[];
  tutorialStep: number;
  skipTutorial: () => void;
  nextStep: () => void;
  prevStep: () => void;
}

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({
  showTutorial,
  tutorialSteps,
  tutorialStep,
  skipTutorial,
  nextStep,
  prevStep,
}) => {
  if (!showTutorial) return null;

  const currentStep = tutorialSteps[tutorialStep];
  let targetElement = document.querySelector(currentStep.target);
  if (!targetElement && currentStep.target === '#advanced-modal-trigger') {
    targetElement = document.querySelector('#platform-selector');
  }
  if (!targetElement) return null;

  const rect = targetElement.getBoundingClientRect();
  const isLeft = currentStep.position === 'left';
  const isRight = currentStep.position === 'right';
  const isTop = currentStep.position === 'top';
  const isBottom = currentStep.position === 'bottom';

  // Calculate tooltip position
  let tooltipStyle: React.CSSProperties = {};
  let arrowClass = '';

  if (isLeft) {
    tooltipStyle = {
      right: window.innerWidth - rect.left + 20,
      top: rect.top + rect.height / 2,
      transform: 'translateY(-50%)'
    };
    arrowClass = 'border-l-0 border-r-8 border-r-background left-full top-1/2 -translate-y-1/2';
  } else if (isRight) {
    tooltipStyle = {
      left: rect.right + 20,
      top: rect.top + rect.height / 2,
      transform: 'translateY(-50%)'
    };
    arrowClass = 'border-r-0 border-l-8 border-l-background right-full top-1/2 -translate-y-1/2';
  } else if (isTop) {
    tooltipStyle = {
      left: rect.left + rect.width / 2,
      bottom: window.innerHeight - rect.top + 20,
      transform: 'translateX(-50%)'
    };
    arrowClass = 'border-t-0 border-b-8 border-b-background top-full left-1/2 -translate-x-1/2';
  } else {
    tooltipStyle = {
      left: rect.left + rect.width / 2,
      top: rect.bottom + 20,
      transform: 'translateX(-50%)'
    };
    arrowClass = 'border-b-0 border-t-8 border-t-background bottom-full left-1/2 -translate-x-1/2';
  }

  return (
    <>
      {/* Dark overlay */}
      <div className="fixed inset-0 bg-black/60 z-40" onClick={skipTutorial} />
      {/* Spotlight highlight */}
      <div
        className="fixed border-2 border-primary rounded-lg animate-pulse z-50"
        style={{
          left: rect.left - 4,
          top: rect.top - 4,
          width: rect.width + 8,
          height: rect.height + 8,
          boxShadow: '0 0 0 9999px rgba(0,0,0,0.6)'
        }}
      />
      {/* Tutorial tooltip */}
      <div className="fixed inset-0 z-50 pointer-events-none">
        <div
          className="absolute pointer-events-auto bg-background border border-border rounded-lg shadow-lg p-4 max-w-sm animate-fade-in"
          style={tooltipStyle}
        >
          {/* Arrow */}
          <div className={`absolute w-0 h-0 border-transparent border-8 ${arrowClass}`} />
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-sm text-foreground mb-1">
                {currentStep.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {currentStep.content}
              </p>
              {Array.isArray(currentStep.buttons) && currentStep.buttons.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {currentStep.buttons.map((btn, i) => (
                    <Button key={i} size="sm" variant="secondary" className="text-xs" onClick={btn.action}>
                      {btn.text}
                    </Button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                {tutorialSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${index === tutorialStep ? 'bg-primary' : 'bg-muted'}`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={skipTutorial} className="text-xs">
                  Skip
                </Button>
                {tutorialStep > 0 && (
                  <Button variant="outline" size="sm" onClick={prevStep} className="text-xs">
                    Back
                  </Button>
                )}
                <Button variant="default" size="sm" onClick={nextStep} className="text-xs">
                  {tutorialStep === tutorialSteps.length - 1 ? 'Finish' : 'Next'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TutorialOverlay;