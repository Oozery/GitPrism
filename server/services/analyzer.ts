import { GitHubService } from './github.js';

interface CommitAnalysis {
  totalCommits: number;
  bugFixes: number;
  contributors: number;
  healthScore: number;
  commitData: any[];
  bugKeywords: Record<string, number>;
  topContributors: any[];
  recentBugFixes: any[];
  busFactorScore: number;
  busFactor: any;
  staleBranches: any[];
  changelog: any[];
}

export class RepositoryAnalyzer {
  private github: GitHubService;
  private bugKeywords = ['fix', 'bug', 'patch', 'hotfix', 'bugfix', 'error', 'issue', 'crash', 'fail'];

  constructor() {
    this.github = new GitHubService();
  }

  async analyzeRepository(owner: string, name: string): Promise<CommitAnalysis> {
    const [commits, issues, pullRequests, contributors, branches, releases] = await Promise.all([
      this.github.getAllCommits(owner, name),
      this.github.getIssues(owner, name),
      this.github.getPullRequests(owner, name),
      this.github.getContributors(owner, name),
      this.github.getBranches(owner, name),
      this.github.getReleases(owner, name),
    ]);

    const bugFixes = this.analyzeBugFixes(commits);
    const commitData = this.generateCommitHeatmapData(commits);
    const bugKeywordCounts = this.countBugKeywords(commits);
    const topContributors = this.getTopContributors(commits, contributors);
    const recentBugFixes = this.getRecentBugFixes(commits);
    const healthScore = this.calculateHealthScore(commits, issues, pullRequests);
    const busFactor = this.calculateBusFactor(commits, contributors);
    const staleBranches = await this.analyzeStaleBranches(owner, name, branches);
    const changelog = this.generateChangelog(commits, issues, pullRequests, releases);

    return {
      totalCommits: commits.length,
      bugFixes: bugFixes.length,
      contributors: new Set(commits.map(c => c.author?.login).filter(Boolean)).size,
      healthScore,
      commitData,
      bugKeywords: bugKeywordCounts,
      topContributors,
      recentBugFixes,
      busFactorScore: busFactor.score,
      busFactor: busFactor.data,
      staleBranches,
      changelog,
    };
  }

  private analyzeBugFixes(commits: any[]): any[] {
    return commits.filter(commit => {
      const message = commit.commit.message.toLowerCase();
      return this.bugKeywords.some(keyword => message.includes(keyword));
    });
  }

  private generateCommitHeatmapData(commits: any[]): any[] {
    const commitsByDate: Record<string, number> = {};
    const now = new Date();
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

    // Initialize all dates in the past year with 0 commits
    for (let d = new Date(oneYearAgo); d <= now; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      commitsByDate[dateStr] = 0;
    }

    // Count commits by date
    commits.forEach(commit => {
      const date = new Date(commit.commit.author.date);
      if (date >= oneYearAgo) {
        const dateStr = date.toISOString().split('T')[0];
        commitsByDate[dateStr] = (commitsByDate[dateStr] || 0) + 1;
      }
    });

    return Object.entries(commitsByDate).map(([date, count]) => ({
      date,
      count,
      level: Math.min(4, Math.floor(count / 2)), // 0-4 scale for heatmap colors
    }));
  }

  private countBugKeywords(commits: any[]): Record<string, number> {
    const counts: Record<string, number> = {};
    
    this.bugKeywords.forEach(keyword => {
      counts[keyword] = 0;
    });

    commits.forEach(commit => {
      const message = commit.commit.message.toLowerCase();
      this.bugKeywords.forEach(keyword => {
        if (message.includes(keyword)) {
          counts[keyword]++;
        }
      });
    });

    return counts;
  }

  private getTopContributors(commits: any[], contributors: any[]): any[] {
    const contributorCommits: Record<string, number> = {};

    commits.forEach(commit => {
      if (commit.author?.login) {
        contributorCommits[commit.author.login] = (contributorCommits[commit.author.login] || 0) + 1;
      }
    });

    return Object.entries(contributorCommits)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([username, commitCount]) => {
        const contributor = contributors.find(c => c.login === username);
        return {
          username,
          commitCount,
          avatar: contributor?.avatar_url || '',
          initials: username.substring(0, 2).toUpperCase(),
        };
      });
  }

  private getRecentBugFixes(commits: any[]): any[] {
    const bugFixes = this.analyzeBugFixes(commits);
    
    return bugFixes
      .sort((a, b) => new Date(b.commit.author.date).getTime() - new Date(a.commit.author.date).getTime())
      .slice(0, 5)
      .map(commit => ({
        message: commit.commit.message.split('\n')[0], // First line only
        author: commit.author?.login || commit.commit.author.name,
        date: commit.commit.author.date,
        sha: commit.sha.substring(0, 7),
      }));
  }

  private calculateHealthScore(commits: any[], issues: any[], pullRequests: any[]): number {
    let score = 50; // Base score

    // Recent activity bonus
    const recentCommits = commits.filter(c => {
      const date = new Date(c.commit.author.date);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      return date >= thirtyDaysAgo;
    });
    score += Math.min(20, recentCommits.length);

    // Issue resolution rate
    const closedIssues = issues.filter(i => i.state === 'closed');
    if (issues.length > 0) {
      const resolutionRate = closedIssues.length / issues.length;
      score += resolutionRate * 15;
    }

    // PR merge rate
    const mergedPRs = pullRequests.filter(pr => pr.merged_at);
    if (pullRequests.length > 0) {
      const mergeRate = mergedPRs.length / pullRequests.length;
      score += mergeRate * 15;
    }

    return Math.min(100, Math.round(score));
  }

  private calculateBusFactor(commits: any[], contributors: any[]): { score: number; data: any } {
    const contributorCommits: Record<string, number> = {};
    
    commits.forEach(commit => {
      if (commit.author?.login) {
        contributorCommits[commit.author.login] = (contributorCommits[commit.author.login] || 0) + 1;
      }
    });

    const totalCommits = commits.length;
    const sortedContributors = Object.entries(contributorCommits)
      .sort(([,a], [,b]) => b - a)
      .map(([username, commitCount]) => {
        const contributor = contributors.find(c => c.login === username);
        return {
          username,
          commitCount,
          percentage: (commitCount / totalCommits) * 100,
          avatar: contributor?.avatar_url || '',
        };
      });

    const primaryContributorPercentage = sortedContributors[0]?.percentage || 0;
    const topTwoPercentage = (sortedContributors[0]?.percentage || 0) + (sortedContributors[1]?.percentage || 0);

    let riskLevel: 'low' | 'medium' | 'high';
    let score: number;
    
    if (primaryContributorPercentage >= 80) {
      riskLevel = 'high';
      score = 20;
    } else if (topTwoPercentage >= 70) {
      riskLevel = 'medium';
      score = 50;
    } else {
      riskLevel = 'low';
      score = 80;
    }

    const recommendations = [];
    if (riskLevel === 'high') {
      recommendations.push('Critical: Knowledge is concentrated in one developer');
      recommendations.push('Implement pair programming and code reviews');
      recommendations.push('Document key processes and architectural decisions');
    } else if (riskLevel === 'medium') {
      recommendations.push('Consider spreading contributions more evenly');
      recommendations.push('Encourage more contributors to participate');
    } else {
      recommendations.push('Good distribution of contributions');
      recommendations.push('Continue encouraging diverse participation');
    }

    return {
      score,
      data: {
        riskLevel,
        primaryContributorPercentage,
        contributorDistribution: sortedContributors.slice(0, 8),
        recommendations,
      }
    };
  }

  private async analyzeStaleBranches(owner: string, name: string, branches: any[]): Promise<any[]> {
    const staleBranches = [];
    const now = new Date();
    
    for (const branch of branches.slice(0, 20)) { // Limit to avoid rate limits
      try {
        const commits = await this.github.getBranchCommits(owner, name, branch.name);
        if (commits.length > 0) {
          const lastCommit = commits[0];
          const lastCommitDate = new Date(lastCommit.commit.author.date);
          const daysSinceLastCommit = Math.floor((now.getTime() - lastCommitDate.getTime()) / (1000 * 60 * 60 * 24));
          
          let status: 'active' | 'inactive' | 'abandoned';
          if (daysSinceLastCommit <= 7) {
            status = 'active';
          } else if (daysSinceLastCommit <= 30) {
            status = 'inactive';
          } else {
            status = 'abandoned';
          }

          if (daysSinceLastCommit > 7 || branch.name !== 'main' && branch.name !== 'master') {
            staleBranches.push({
              name: branch.name,
              lastCommitDate: lastCommit.commit.author.date,
              lastCommitSha: lastCommit.sha.substring(0, 7),
              daysSinceLastCommit,
              status,
              lastCommitMessage: lastCommit.commit.message.split('\n')[0],
              author: lastCommit.author?.login || lastCommit.commit.author.name,
            });
          }
        }
      } catch (error) {
        console.warn(`Could not analyze branch ${branch.name}:`, error);
      }
    }

    return staleBranches.sort((a, b) => b.daysSinceLastCommit - a.daysSinceLastCommit);
  }

  private generateChangelog(commits: any[], issues: any[], pullRequests: any[], releases: any[]): any[] {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
    
    // Group commits by month for recent changes
    const recentCommits = commits.filter(c => new Date(c.commit.author.date) >= sixMonthsAgo);
    const changelogEntries = [];

    // Create entries for the last 3 months
    for (let i = 0; i < 3; i++) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const monthCommits = recentCommits.filter(c => {
        const commitDate = new Date(c.commit.author.date);
        return commitDate >= monthStart && commitDate <= monthEnd;
      });

      if (monthCommits.length === 0) continue;

      const features: string[] = [];
      const bugFixes: string[] = [];
      const improvements: string[] = [];
      const breaking: string[] = [];

      monthCommits.forEach(commit => {
        const message = commit.commit.message.toLowerCase();
        const firstLine = commit.commit.message.split('\n')[0];
        
        if (this.bugKeywords.some(keyword => message.includes(keyword))) {
          bugFixes.push(firstLine);
        } else if (message.includes('feat') || message.includes('add') || message.includes('implement')) {
          features.push(firstLine);
        } else if (message.includes('improve') || message.includes('update') || message.includes('enhance')) {
          improvements.push(firstLine);
        } else if (message.includes('break') || message.includes('remove') || message.includes('deprecate')) {
          breaking.push(firstLine);
        } else {
          improvements.push(firstLine);
        }
      });

      const monthName = monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      changelogEntries.push({
        version: `v${now.getFullYear()}.${String(now.getMonth() + 1 - i).padStart(2, '0')}.0`,
        date: monthStart.toISOString().split('T')[0],
        features: features.slice(0, 5),
        bugFixes: bugFixes.slice(0, 5),
        improvements: improvements.slice(0, 3),
        breaking: breaking.slice(0, 2),
      });
    }

    return changelogEntries;
  }
}
