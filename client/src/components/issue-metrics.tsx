import { CheckCircle, AlertCircle, GitPullRequest, Clock } from "lucide-react";
import { Repository } from "../types/github";

interface IssueMetricsProps {
  repository: Repository;
}

export function IssueMetrics({ repository }: IssueMetricsProps) {
  const codeQualityScore = Math.min(10, repository.healthScore / 10);

  const metrics = [
    {
      label: "Open Issues",
      value: repository.issuesOpen.toString(),
      icon: AlertCircle,
      color: "text-github-green",
      testId: "open-issues",
    },
    {
      label: "Closed Issues",
      value: repository.issuesClosed.toString(),
      icon: CheckCircle,
      color: "text-github-text-muted",
      testId: "closed-issues",
    },
    {
      label: "PR Merge Rate",
      value: repository.prMergeRate,
      icon: GitPullRequest,
      color: "text-github-blue",
      testId: "pr-merge-rate",
    },
    {
      label: "Avg. Resolution Time",
      value: repository.avgResolutionTime,
      icon: Clock,
      color: "text-github-orange",
      testId: "avg-resolution-time",
    },
  ];

  return (
    <div className="bg-github-card border border-github-border rounded-lg p-6" data-testid="issue-metrics">
      <h3 className="text-lg font-semibold text-github-text mb-4" data-testid="metrics-title">
        Issue & PR Analytics
      </h3>

      <div className="space-y-4">
        {metrics.map((metric) => {
          const IconComponent = metric.icon;
          return (
            <div
              key={metric.label}
              className="flex items-center justify-between p-3 bg-github-darker/50 rounded"
              data-testid={`metric-${metric.testId}`}
            >
              <div className="flex items-center space-x-3">
                <IconComponent className={metric.color} size={16} />
                <span className="text-github-text" data-testid={`${metric.testId}-label`}>
                  {metric.label}
                </span>
              </div>
              <span className="text-github-text font-medium" data-testid={`${metric.testId}-value`}>
                {metric.value}
              </span>
            </div>
          );
        })}

        {/* Health indicators */}
        <div className="pt-4 border-t border-github-border" data-testid="health-indicator">
          <div className="flex items-center justify-between mb-2">
            <span className="text-github-text text-sm" data-testid="quality-score-label">
              Code Quality Score
            </span>
            <span className="text-github-green font-medium" data-testid="quality-score-value">
              {codeQualityScore.toFixed(1)}/10
            </span>
          </div>
          <div className="w-full bg-github-border rounded-full h-2" data-testid="quality-score-bar">
            <div
              className="bg-github-green h-2 rounded-full transition-all duration-300"
              style={{ width: `${(codeQualityScore / 10) * 100}%` }}
              data-testid="quality-score-progress"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
