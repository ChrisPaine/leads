import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Report } from '@/types/search';
import { Download, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';

interface ReportDisplayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: Report | null;
}

export const ReportDisplay: React.FC<ReportDisplayProps> = ({
  open,
  onOpenChange,
  report
}) => {
  const { toast } = useToast();

  if (!report) return null;

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(report.report_content.markdown);
    toast({
      title: 'Copied!',
      description: 'Report copied to clipboard',
    });
  };

  const handleDownload = () => {
    const blob = new Blob([report.report_content.markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.report_type}-report-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Downloaded!',
      description: 'Report saved as markdown file',
    });
  };

  const getTitle = () => {
    if (report.report_type === 'summary') {
      return '📋 Summary Report';
    }
    return '🚀 MVP Builder Report';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">{getTitle()}</DialogTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyToClipboard}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-6 prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown
            components={{
              h1: ({ children }) => (
                <h1 className="text-3xl font-bold mt-8 mb-4">{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-2xl font-bold mt-6 mb-3">{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-xl font-semibold mt-4 mb-2">{children}</h3>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside space-y-2 my-4">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside space-y-2 my-4">{children}</ol>
              ),
              li: ({ children }) => (
                <li className="ml-4">{children}</li>
              ),
              p: ({ children }) => (
                <p className="my-3 leading-relaxed">{children}</p>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-primary pl-4 italic my-4">
                  {children}
                </blockquote>
              ),
              code: ({ inline, children }) =>
                inline ? (
                  <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
                    {children}
                  </code>
                ) : (
                  <code className="block bg-muted p-4 rounded-lg text-sm font-mono overflow-x-auto my-4">
                    {children}
                  </code>
                ),
              strong: ({ children }) => (
                <strong className="font-bold text-foreground">{children}</strong>
              ),
              a: ({ href, children }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {children}
                </a>
              ),
            }}
          >
            {report.report_content.markdown}
          </ReactMarkdown>
        </div>

        <div className="mt-6 pt-4 border-t text-xs text-muted-foreground">
          Generated on {new Date(report.created_at).toLocaleString()}
        </div>
      </DialogContent>
    </Dialog>
  );
};
