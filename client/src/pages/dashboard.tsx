import { useState } from "react";
import { Bug, Settings, HelpCircle } from "lucide-react";
import { RepositoryInput } from "../components/repository-input";
import { RepositoryOverview } from "../components/repository-overview";
import { CommitHeatmap } from "../components/commit-heatmap";
import { BugAnalysisChart } from "../components/bug-analysis-chart";
import { IssueMetrics } from "../components/issue-metrics";
import { CommitPatterns } from "../components/commit-patterns";
import { LoadingOverlay } from "../components/loading-overlay";
import { BusFactor } from "../components/bus-factor";
import { StaleBranches } from "../components/stale-branches";
import { Changelog } from "../components/changelog";
import { Repository } from "../types/github";

export default function Dashboard() {
  const [currentRepository, setCurrentRepository] = useState<Repository | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalysisStart = () => {
    setIsLoading(true);
  };

  const handleAnalysisComplete = (repository: Repository) => {
    setCurrentRepository(repository);
    setIsLoading(false);
  };

  const handleAnalysisError = () => {
    setIsLoading(false);
  };

  return (
    <div className="bg-github-dark min-h-screen text-github-text" data-testid="dashboard">
      {/* Header */}
      <header className="bg-github-card border-b border-github-border px-4 py-3" data-testid="header">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Bug className="text-github-blue text-xl" data-testid="logo-icon" />
              <h1 className="text-xl font-semibold text-github-text" data-testid="app-title">
                GitPrism
              </h1>
            </div>
            <span className="text-github-text-muted text-sm" data-testid="app-subtitle">
              Know the repository
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              className="p-2 text-github-text-muted hover:text-github-text hover:bg-github-hover rounded-md transition-colors"
              data-testid="help-button"
            >
              <HelpCircle size={20} />
            </button>
            <button 
              className="p-2 text-github-text-muted hover:text-github-text hover:bg-github-hover rounded-md transition-colors"
              data-testid="settings-button"
            >
              <Settings size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6" data-testid="main-content">
        <RepositoryInput
          onAnalysisStart={handleAnalysisStart}
          onAnalysisComplete={handleAnalysisComplete}
          onAnalysisError={handleAnalysisError}
        />

        {currentRepository && (
          <>
            <RepositoryOverview repository={currentRepository} />
            
            <CommitHeatmap commitData={currentRepository.commitData} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BugAnalysisChart repository={currentRepository} />
              <IssueMetrics repository={currentRepository} />
            </div>

            <CommitPatterns repository={currentRepository} />

            {/* New Advanced Features */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BusFactor repository={currentRepository} />
              <StaleBranches repository={currentRepository} />
            </div>

            <Changelog repository={currentRepository} />

            {/* Export Actions */}
            <section className="bg-github-card border border-github-border rounded-lg p-6" data-testid="export-section">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-github-text" data-testid="export-title">
                    Export & Share
                  </h3>
                  <p className="text-github-text-muted text-sm" data-testid="export-description">
                    Generate reports and share insights
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button 
                    className="px-4 py-2 bg-github-darker border border-github-border text-github-text rounded-md hover:bg-github-hover transition-colors flex items-center space-x-2"
                    data-testid="export-pdf-button"
                  >
                    <span>📄</span>
                    <span>Export PDF</span>
                  </button>
                  <button 
                    className="px-4 py-2 bg-github-darker border border-github-border text-github-text rounded-md hover:bg-github-hover transition-colors flex items-center space-x-2"
                    data-testid="export-data-button"
                  >
                    <span>⬇️</span>
                    <span>Export Data</span>
                  </button>
                  <button 
                    className="px-4 py-2 bg-github-blue hover:bg-github-blue-dark text-white rounded-md transition-colors flex items-center space-x-2"
                    data-testid="share-button"
                  >
                    <span>🔗</span>
                    <span>Share</span>
                  </button>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      <LoadingOverlay isVisible={isLoading} />
    </div>
  );
}
