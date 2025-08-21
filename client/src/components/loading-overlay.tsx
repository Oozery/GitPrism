interface LoadingOverlayProps {
  isVisible: boolean;
}

export function LoadingOverlay({ isVisible }: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 bg-github-dark/75 flex items-center justify-center z-50"
      data-testid="loading-overlay"
    >
      <div className="bg-github-card border border-github-border rounded-lg p-8 max-w-md mx-4 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-github-blue border-t-transparent rounded-full mx-auto mb-4" />
        <h3 className="text-github-text font-medium mb-2" data-testid="loading-title">
          Analyzing Repository
        </h3>
        <p className="text-github-text-muted text-sm" data-testid="loading-description">
          Fetching commit history and parsing bug patterns...
        </p>
      </div>
    </div>
  );
}
