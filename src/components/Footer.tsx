import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-border mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="text-center space-y-2">
          <p className="text-muted-foreground text-sm">
            © 2024 Social media research tool. Built for researchers, marketers, and founders.
          </p>
          <p className="text-muted-foreground text-sm">
            Need help? Contact us at{' '}
            <a
              href="mailto:support@painpointresearch.com"
              className="text-research-blue-dark hover:underline"
            >
              support@painpointresearch.com
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};
