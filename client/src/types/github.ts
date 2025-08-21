export interface Repository {
  id: string;
  owner: string;
  name: string;
  fullName: string;
  url: string;
  analyzedAt: Date;
  totalCommits: number;
  bugFixes: number;
  contributors: number;
  healthScore: number;
  issuesOpen: number;
  issuesClosed: number;
  prMergeRate: string;
  avgResolutionTime: string;
  commitData: CommitData[];
  bugKeywords: Record<string, number>;
  topContributors: Contributor[];
  recentBugFixes: BugFix[];
  busFactorScore: number;
  busFactor: BusFactor;
  staleBranches: StaleBranch[];
  changelog: ChangelogEntry[];
}

export interface CommitData {
  date: string;
  count: number;
  level: number;
}

export interface Contributor {
  username: string;
  commitCount: number;
  avatar: string;
  initials: string;
}

export interface BugFix {
  message: string;
  author: string;
  date: string;
  sha: string;
}

export interface AnalyzeRequest {
  url: string;
}

export interface BusFactor {
  riskLevel: 'low' | 'medium' | 'high';
  primaryContributorPercentage: number;
  contributorDistribution: Array<{
    username: string;
    commitCount: number;
    percentage: number;
    avatar: string;
  }>;
  recommendations: string[];
}

export interface StaleBranch {
  name: string;
  lastCommitDate: string;
  lastCommitSha: string;
  daysSinceLastCommit: number;
  status: 'active' | 'inactive' | 'abandoned';
  lastCommitMessage: string;
  author: string;
}

export interface ChangelogEntry {
  version: string;
  date: string;
  features: string[];
  bugFixes: string[];
  improvements: string[];
  breaking: string[];
}

export interface AnalyzeResponse extends Repository {}
