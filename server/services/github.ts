interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
  author: {
    login: string;
    avatar_url: string;
  } | null;
}

interface GitHubIssue {
  number: number;
  title: string;
  state: 'open' | 'closed';
  created_at: string;
  closed_at: string | null;
}

interface GitHubPullRequest {
  number: number;
  title: string;
  state: 'open' | 'closed';
  merged_at: string | null;
  created_at: string;
}

interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
  };
  html_url: string;
  open_issues_count: number;
}

export class GitHubService {
  private baseUrl = 'https://api.github.com';
  private token: string;

  constructor() {
    this.token = process.env.GITHUB_TOKEN || process.env.GITHUB_API_TOKEN || '';
  }

  private async makeRequest<T>(endpoint: string): Promise<T> {
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Bug-Explorer-Dashboard/1.0',
    };

    if (this.token) {
      headers['Authorization'] = `token ${this.token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, { headers });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Repository not found. Please check the repository URL.');
      }
      if (response.status === 403) {
        throw new Error('API rate limit exceeded. Please try again later.');
      }
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getRepository(owner: string, name: string): Promise<GitHubRepository> {
    return this.makeRequest<GitHubRepository>(`/repos/${owner}/${name}`);
  }

  async getCommits(owner: string, name: string, page = 1, perPage = 100): Promise<GitHubCommit[]> {
    return this.makeRequest<GitHubCommit[]>(`/repos/${owner}/${name}/commits?page=${page}&per_page=${perPage}`);
  }

  async getAllCommits(owner: string, name: string): Promise<GitHubCommit[]> {
    const commits: GitHubCommit[] = [];
    let page = 1;
    const perPage = 100;

    while (commits.length < 1000) { // Limit to 1000 commits for performance
      const pageCommits = await this.getCommits(owner, name, page, perPage);
      if (pageCommits.length === 0) break;
      
      commits.push(...pageCommits);
      if (pageCommits.length < perPage) break;
      page++;
    }

    return commits;
  }

  async getIssues(owner: string, name: string): Promise<GitHubIssue[]> {
    const openIssues = await this.makeRequest<GitHubIssue[]>(`/repos/${owner}/${name}/issues?state=open&per_page=100`);
    const closedIssues = await this.makeRequest<GitHubIssue[]>(`/repos/${owner}/${name}/issues?state=closed&per_page=100`);
    return [...openIssues, ...closedIssues];
  }

  async getPullRequests(owner: string, name: string): Promise<GitHubPullRequest[]> {
    const openPRs = await this.makeRequest<GitHubPullRequest[]>(`/repos/${owner}/${name}/pulls?state=open&per_page=100`);
    const closedPRs = await this.makeRequest<GitHubPullRequest[]>(`/repos/${owner}/${name}/pulls?state=closed&per_page=100`);
    return [...openPRs, ...closedPRs];
  }

  async getContributors(owner: string, name: string): Promise<any[]> {
    return this.makeRequest<any[]>(`/repos/${owner}/${name}/contributors?per_page=100`);
  }

  async getBranches(owner: string, name: string): Promise<any[]> {
    return this.makeRequest<any[]>(`/repos/${owner}/${name}/branches?per_page=100`);
  }

  async getBranchCommits(owner: string, name: string, branch: string): Promise<GitHubCommit[]> {
    return this.makeRequest<GitHubCommit[]>(`/repos/${owner}/${name}/commits?sha=${branch}&per_page=1`);
  }

  async getReleases(owner: string, name: string): Promise<any[]> {
    return this.makeRequest<any[]>(`/repos/${owner}/${name}/releases?per_page=10`);
  }

  parseRepositoryUrl(url: string): { owner: string; name: string } | null {
    const regex = /github\.com\/([^\/]+)\/([^\/]+)/;
    const match = url.match(regex);
    
    if (!match) return null;
    
    return {
      owner: match[1],
      name: match[2].replace(/\.git$/, ''),
    };
  }
}
