import { Search, Users, History, Bug } from "lucide-react";
import { Repository } from "../types/github";

interface CommitPatternsProps {
  repository: Repository;
}

export function CommitPatterns({ repository }: CommitPatternsProps) {
  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return "less than an hour ago";
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    
    const diffWeeks = Math.floor(diffDays / 7);
    return `${diffWeeks} week${diffWeeks !== 1 ? 's' : ''} ago`;
  };

  return (
    <section className="bg-github-card border border-github-border rounded-lg p-6" data-testid="commit-patterns">
      <h3 className="text-lg font-semibold text-github-text mb-4" data-testid="patterns-title">
        Commit Pattern Analysis
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Bug Fix Keywords */}
        <div data-testid="bug-keywords">
          <h4 className="text-github-text font-medium mb-3 flex items-center">
            <Search className="text-github-blue mr-2" size={16} />
            Bug Fix Keywords
          </h4>
          <div className="space-y-2">
            {Object.entries(repository.bugKeywords || {})
              .sort(([,a], [,b]) => b - a)
              .slice(0, 6)
              .map(([keyword, count]) => (
                <div
                  key={keyword}
                  className="flex items-center justify-between p-2 bg-github-darker/50 rounded"
                  data-testid={`keyword-${keyword}`}
                >
                  <span className="text-github-text text-sm" data-testid={`keyword-${keyword}-name`}>
                    {keyword}
                  </span>
                  <span className="text-github-text-muted text-sm" data-testid={`keyword-${keyword}-count`}>
                    {count}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* Top Contributors */}
        <div data-testid="top-contributors">
          <h4 className="text-github-text font-medium mb-3 flex items-center">
            <Users className="text-github-green mr-2" size={16} />
            Top Contributors
          </h4>
          <div className="space-y-2">
            {repository.topContributors?.slice(0, 6).map((contributor, index) => (
              <div
                key={contributor.username}
                className="flex items-center space-x-3 p-2 bg-github-darker/50 rounded"
                data-testid={`contributor-${index}`}
              >
                <div 
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    index === 0 ? 'bg-github-blue' : 
                    index === 1 ? 'bg-github-green' : 
                    index === 2 ? 'bg-github-orange' : 'bg-github-text-muted'
                  }`}
                  data-testid={`contributor-${index}-avatar`}
                >
                  {contributor.initials}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-github-text text-sm" data-testid={`contributor-${index}-username`}>
                      {contributor.username}
                    </span>
                    <span className="text-github-text-muted text-sm" data-testid={`contributor-${index}-commits`}>
                      {contributor.commitCount}
                    </span>
                  </div>
                </div>
              </div>
            )) || []}
          </div>
        </div>

        {/* Recent Bug Fixes */}
        <div data-testid="recent-bug-fixes">
          <h4 className="text-github-text font-medium mb-3 flex items-center">
            <History className="text-github-orange mr-2" size={16} />
            Recent Bug Fixes
          </h4>
          <div className="space-y-2">
            {repository.recentBugFixes?.map((fix, index) => (
              <div
                key={fix.sha}
                className="p-2 bg-github-darker/50 rounded"
                data-testid={`bug-fix-${index}`}
              >
                <div className="flex items-start space-x-2">
                  <Bug className="text-github-red text-sm mt-1" size={12} />
                  <div className="flex-1 min-w-0">
                    <p 
                      className="text-github-text text-sm truncate" 
                      data-testid={`bug-fix-${index}-message`}
                      title={fix.message}
                    >
                      {fix.message}
                    </p>
                    <p className="text-github-text-muted text-xs" data-testid={`bug-fix-${index}-meta`}>
                      {formatTimeAgo(fix.date)} • {fix.author}
                    </p>
                  </div>
                </div>
              </div>
            )) || []}
          </div>
        </div>
      </div>
    </section>
  );
}
