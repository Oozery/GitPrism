import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { AlertTriangle, CheckCircle2, AlertCircle } from "lucide-react";
import { Repository, BusFactor as BusFactorType } from "../types/github";

interface BusFactorProps {
  repository: Repository;
}

export function BusFactor({ repository }: BusFactorProps) {
  const { busFactor } = repository;
  
  if (!busFactor) return null;

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return 'text-github-red';
      case 'medium': return 'text-github-orange';
      case 'low': return 'text-github-green';
      default: return 'text-github-text-muted';
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return <AlertTriangle className="text-github-red" size={20} />;
      case 'medium': return <AlertCircle className="text-github-orange" size={20} />;
      case 'low': return <CheckCircle2 className="text-github-green" size={20} />;
      default: return null;
    }
  };

  const getRiskBgColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return 'bg-github-red/20 border-github-red/30';
      case 'medium': return 'bg-github-orange/20 border-github-orange/30';
      case 'low': return 'bg-github-green/20 border-github-green/30';
      default: return 'bg-github-card';
    }
  };

  const chartData = busFactor.contributorDistribution.slice(0, 6);
  const colors = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-github-card border border-github-border rounded-lg p-3 shadow-lg">
          <p className="text-github-text font-medium">{data.username}</p>
          <p className="text-github-text-muted text-sm">
            {data.commitCount} commits ({data.percentage.toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-github-card border border-github-border rounded-lg p-6" data-testid="bus-factor">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-github-text flex items-center" data-testid="bus-factor-title">
            Bus Factor Score
          </h3>
          <p className="text-github-text-muted text-sm">Knowledge distribution risk assessment</p>
        </div>
        <div className={`px-4 py-2 rounded-lg border ${getRiskBgColor(busFactor.riskLevel)}`}>
          <div className="flex items-center space-x-2">
            {getRiskIcon(busFactor.riskLevel)}
            <div>
              <div className={`font-semibold ${getRiskColor(busFactor.riskLevel)}`} data-testid="bus-factor-score">
                {repository.busFactorScore}/100
              </div>
              <div className={`text-sm capitalize ${getRiskColor(busFactor.riskLevel)}`} data-testid="risk-level">
                {busFactor.riskLevel} Risk
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div data-testid="contribution-chart">
          <h4 className="text-github-text font-medium mb-3">Contribution Distribution</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  dataKey="percentage"
                  nameKey="username"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 mt-3">
            {chartData.map((contributor, index) => (
              <div key={contributor.username} className="flex items-center space-x-2 text-sm">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <span className="text-github-text truncate" data-testid={`contributor-legend-${index}`}>
                  {contributor.username} ({contributor.percentage.toFixed(1)}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div data-testid="bus-factor-recommendations">
          <h4 className="text-github-text font-medium mb-3">Recommendations</h4>
          <div className="space-y-3">
            {busFactor.recommendations.map((recommendation, index) => (
              <div 
                key={index}
                className="p-3 bg-github-darker/50 rounded-lg"
                data-testid={`recommendation-${index}`}
              >
                <p className="text-github-text text-sm">{recommendation}</p>
              </div>
            ))}
          </div>

          {/* Key Metrics */}
          <div className="mt-4 pt-4 border-t border-github-border">
            <div className="grid grid-cols-1 gap-3">
              <div className="flex justify-between items-center">
                <span className="text-github-text-muted text-sm">Primary Contributor</span>
                <span className="text-github-text font-medium" data-testid="primary-contributor-percentage">
                  {busFactor.primaryContributorPercentage.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-github-text-muted text-sm">Total Contributors</span>
                <span className="text-github-text font-medium" data-testid="total-contributors-count">
                  {busFactor.contributorDistribution.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}