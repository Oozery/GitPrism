import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Repository } from "../types/github";

interface BugAnalysisChartProps {
  repository: Repository;
}

export function BugAnalysisChart({ repository }: BugAnalysisChartProps) {
  // Generate monthly data for the last 6 months
  const generateChartData = () => {
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = month.toLocaleDateString('en-US', { month: 'short' });
      
      // Simulate data based on repository stats (in a real app, this would come from the API)
      const bugFixes = Math.floor(Math.random() * (repository.bugFixes / 6)) + 5;
      const features = Math.floor(Math.random() * (repository.totalCommits / 12)) + 10;
      
      months.push({
        month: monthName,
        bugFixes,
        features,
      });
    }
    
    return months;
  };

  const data = generateChartData();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-github-card border border-github-border rounded-lg p-3 shadow-lg">
          <p className="text-github-text font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name === 'bugFixes' ? 'Bug Fixes' : 'Features'}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-github-card border border-github-border rounded-lg p-6" data-testid="bug-analysis-chart">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-github-text" data-testid="chart-title">
          Bug Fix Trends
        </h3>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-github-red rounded-full" />
            <span className="text-github-text-muted text-sm">Bug Fixes</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-github-blue rounded-full" />
            <span className="text-github-text-muted text-sm">Features</span>
          </div>
        </div>
      </div>

      <div className="h-64" data-testid="chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <XAxis 
              dataKey="month" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--github-text-muted)', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--github-text-muted)', fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="bugFixes" 
              fill="var(--github-red)" 
              radius={[2, 2, 0, 0]}
              data-testid="bug-fixes-bar"
            />
            <Bar 
              dataKey="features" 
              fill="var(--github-blue)" 
              radius={[2, 2, 0, 0]}
              data-testid="features-bar"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
