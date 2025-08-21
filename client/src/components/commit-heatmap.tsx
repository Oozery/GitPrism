import { CommitData } from "../types/github";

interface CommitHeatmapProps {
  commitData: CommitData[];
}

export function CommitHeatmap({ commitData }: CommitHeatmapProps) {
  // Group commits by weeks (7 days each)
  const weeks: CommitData[][] = [];
  const sortedData = [...commitData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  for (let i = 0; i < sortedData.length; i += 7) {
    weeks.push(sortedData.slice(i, i + 7));
  }

  const getIntensityClass = (level: number) => {
    switch (level) {
      case 0:
        return "bg-github-darker border border-github-border";
      case 1:
        return "bg-github-green/25";
      case 2:
        return "bg-github-green/50";
      case 3:
        return "bg-github-green/75";
      case 4:
        return "bg-github-green";
      default:
        return "bg-github-darker border border-github-border";
    }
  };

  const totalContributions = commitData.reduce((sum, day) => sum + day.count, 0);

  return (
    <section className="bg-github-card border border-github-border rounded-lg p-6" data-testid="commit-heatmap">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-github-text" data-testid="heatmap-title">
          Commit Activity
        </h3>
        <div className="flex items-center space-x-4 text-sm">
          <span className="text-github-text-muted">Less</span>
          <div className="flex space-x-1" data-testid="heatmap-legend">
            {[0, 1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={`w-3 h-3 rounded-sm ${getIntensityClass(level)}`}
                data-testid={`legend-level-${level}`}
              />
            ))}
          </div>
          <span className="text-github-text-muted">More</span>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <div className="grid grid-flow-col gap-1" style={{ gridTemplateRows: "repeat(7, 12px)" }}>
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-rows-7 gap-1" data-testid={`week-${weekIndex}`}>
                {Array.from({ length: 7 }, (_, dayIndex) => {
                  const dayData = week[dayIndex];
                  return (
                    <div
                      key={dayIndex}
                      className={`w-3 h-3 rounded-sm ${
                        dayData ? getIntensityClass(dayData.level) : "bg-github-darker border border-github-border"
                      }`}
                      title={
                        dayData
                          ? `${dayData.count} contributions on ${dayData.date}`
                          : "No contributions"
                      }
                      data-testid={`day-${weekIndex}-${dayIndex}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="text-github-text-muted text-sm mt-3" data-testid="contributions-summary">
        <span className="font-medium text-github-text" data-testid="total-contributions">
          {totalContributions.toLocaleString()}
        </span>{" "}
        contributions in the last year
      </p>
    </section>
  );
}
