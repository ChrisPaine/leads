import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-border mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="text-center space-y-2">
          <p className="text-muted-foreground dark:text-gray-300 text-sm">
            © 2024 Social media research tool. Built for researchers, marketers, and founders.
          </p>
          <p className="text-muted-foreground dark:text-gray-300 text-sm">
            Need help? Contact us at{' '}
            <a
              href="mailto:support@mvpseedai.com"
              className="text-research-blue-dark hover:text-research-blue hover:underline active:text-research-blue-dark visited:text-purple-600 dark:text-gray-400 dark:hover:text-gray-200 dark:active:text-gray-300 dark:visited:text-purple-400 transition-colors duration-200"
            >
              support@mvpseedai.com
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};
