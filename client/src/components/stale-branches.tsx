import { GitBranch, Calendar, User, Trash2, GitMerge, AlertTriangle } from "lucide-react";
import { Repository, StaleBranch } from "../types/github";

interface StaleBranchesProps {
  repository: Repository;
}

export function StaleBranches({ repository }: StaleBranchesProps) {
  const { staleBranches } = repository;
  
  if (!staleBranches || staleBranches.length === 0) {
    return (
      <div className="bg-github-card border border-github-border rounded-lg p-6" data-testid="stale-branches">
        <h3 className="text-lg font-semibold text-github-text mb-2">Stale Branch Detector</h3>
        <p className="text-github-green">✨ Great! No stale branches detected. All branches are active.</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-github-green';
      case 'inactive': return 'text-github-orange';
      case 'abandoned': return 'text-github-red';
      default: return 'text-github-text-muted';
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case 'active': return `${baseClasses} bg-github-green/20 text-github-green`;
      case 'inactive': return `${baseClasses} bg-github-orange/20 text-github-orange`;
      case 'abandoned': return `${baseClasses} bg-github-red/20 text-github-red`;
      default: return `${baseClasses} bg-github-text-muted/20 text-github-text-muted`;
    }
  };

  const formatTimeAgo = (days: number) => {
    if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;
    if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) !== 1 ? 's' : ''} ago`;
    if (days < 365) return `${Math.floor(days / 30)} month${Math.floor(days / 30) !== 1 ? 's' : ''} ago`;
    return `${Math.floor(days / 365)} year${Math.floor(days / 365) !== 1 ? 's' : ''} ago`;
  };

  const staleCounts = staleBranches.reduce((acc, branch) => {
    acc[branch.status] = (acc[branch.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="bg-github-card border border-github-border rounded-lg p-6" data-testid="stale-branches">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-github-text" data-testid="stale-branches-title">
            Stale Branch Detector
          </h3>
          <p className="text-github-text-muted text-sm">
            Found {staleBranches.length} branches needing attention
          </p>
        </div>
        
        {/* Status Summary */}
        <div className="flex space-x-2">
          {Object.entries(staleCounts).map(([status, count]) => (
            <div key={status} className={getStatusBadge(status)} data-testid={`status-${status}-count`}>
              {count} {status}
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations Banner */}
      {staleBranches.filter(b => b.status === 'abandoned').length > 0 && (
        <div className="mb-4 p-3 bg-github-red/10 border border-github-red/20 rounded-lg flex items-start space-x-3">
          <AlertTriangle className="text-github-red mt-0.5" size={16} />
          <div>
            <p className="text-github-red text-sm font-medium">Cleanup Recommended</p>
            <p className="text-github-red/80 text-xs">
              Consider merging or deleting abandoned branches to keep the repository clean.
            </p>
          </div>
        </div>
      )}

      {/* Branch List */}
      <div className="space-y-3" data-testid="branch-list">
        {staleBranches.slice(0, 10).map((branch, index) => (
          <div
            key={branch.name}
            className="p-4 bg-github-darker/30 rounded-lg border border-github-border/50 hover:bg-github-hover transition-colors"
            data-testid={`branch-${index}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3">
                  <GitBranch className="text-github-blue" size={16} />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-github-text font-medium truncate" data-testid={`branch-${index}-name`}>
                        {branch.name}
                      </h4>
                      <span className={getStatusBadge(branch.status)} data-testid={`branch-${index}-status`}>
                        {branch.status}
                      </span>
                    </div>
                    <p className="text-github-text-muted text-sm truncate mt-1" data-testid={`branch-${index}-message`}>
                      {branch.lastCommitMessage}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 mt-2 text-xs text-github-text-muted">
                  <div className="flex items-center space-x-1">
                    <Calendar size={12} />
                    <span data-testid={`branch-${index}-time`}>
                      {formatTimeAgo(branch.daysSinceLastCommit)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <User size={12} />
                    <span data-testid={`branch-${index}-author`}>{branch.author}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span data-testid={`branch-${index}-sha`}>#{branch.lastCommitSha}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2 ml-4">
                {branch.status === 'abandoned' ? (
                  <button
                    className="p-2 text-github-red hover:bg-github-red/10 rounded-md transition-colors"
                    title="Suggest deletion"
                    data-testid={`branch-${index}-delete-button`}
                  >
                    <Trash2 size={14} />
                  </button>
                ) : (
                  <button
                    className="p-2 text-github-blue hover:bg-github-blue/10 rounded-md transition-colors"
                    title="Suggest merge"
                    data-testid={`branch-${index}-merge-button`}
                  >
                    <GitMerge size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {staleBranches.length > 10 && (
        <div className="mt-4 text-center">
          <p className="text-github-text-muted text-sm" data-testid="more-branches-indicator">
            + {staleBranches.length - 10} more branches
          </p>
        </div>
      )}

      {/* Action Summary */}
      <div className="mt-6 pt-4 border-t border-github-border">
        <div className="flex items-center justify-between text-sm">
          <div className="flex space-x-4">
            <span className="text-github-text-muted">
              <span className="font-medium text-github-red">
                {staleBranches.filter(b => b.status === 'abandoned').length}
              </span> can be deleted
            </span>
            <span className="text-github-text-muted">
              <span className="font-medium text-github-orange">
                {staleBranches.filter(b => b.status === 'inactive').length}
              </span> need review
            </span>
          </div>
          <button
            className="px-3 py-1 bg-github-blue hover:bg-github-blue-dark text-white rounded-md text-xs transition-colors"
            data-testid="cleanup-actions-button"
          >
            View Cleanup Actions
          </button>
        </div>
      </div>
    </div>
  );
}