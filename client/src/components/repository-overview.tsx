import { Heart, GitCommit, Bug, Users } from "lucide-react";
import { Repository } from "../types/github";

interface RepositoryOverviewProps {
  repository: Repository;
}

export function RepositoryOverview({ repository }: RepositoryOverviewProps) {
  const stats = [
    {
      label: "Repository Health",
      value: `${repository.healthScore}%`,
      icon: Heart,
      color: "text-github-green",
      bgColor: "bg-github-green/20",
      testId: "health-score",
    },
    {
      label: "Total Commits",
      value: repository.totalCommits.toLocaleString(),
      icon: GitCommit,
      color: "text-github-blue",
      bgColor: "bg-github-blue/20",
      testId: "total-commits",
    },
    {
      label: "Bug Fixes",
      value: repository.bugFixes.toLocaleString(),
      icon: Bug,
      color: "text-github-red",
      bgColor: "bg-github-red/20",
      testId: "bug-fixes",
    },
    {
      label: "Active Contributors",
      value: repository.contributors.toLocaleString(),
      icon: Users,
      color: "text-github-text",
      bgColor: "bg-github-text/20",
      testId: "contributors",
    },
  ];

  return (
    <section className="grid grid-cols-1 md:grid-cols-4 gap-4" data-testid="repository-overview">
      {stats.map((stat) => {
        const IconComponent = stat.icon;
        return (
          <div
            key={stat.label}
            className="bg-github-card border border-github-border rounded-lg p-4"
            data-testid={`stat-${stat.testId}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-github-text-muted text-sm" data-testid={`${stat.testId}-label`}>
                  {stat.label}
                </p>
                <p className={`text-2xl font-bold ${stat.color}`} data-testid={`${stat.testId}-value`}>
                  {stat.value}
                </p>
              </div>
              <div className={`w-12 h-12 ${stat.bgColor} rounded-full flex items-center justify-center`}>
                <IconComponent className={stat.color} size={24} />
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}
