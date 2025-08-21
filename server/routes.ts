import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { GitHubService } from "./services/github.js";
import { RepositoryAnalyzer } from "./services/analyzer.js";
import { repositoryAnalysisSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const github = new GitHubService();
  const analyzer = new RepositoryAnalyzer();

  // Analyze repository endpoint
  app.post("/api/analyze", async (req, res) => {
    try {
      const { url } = repositoryAnalysisSchema.parse(req.body);
      
      const parsed = github.parseRepositoryUrl(url);
      if (!parsed) {
        return res.status(400).json({ 
          error: "Invalid GitHub repository URL. Please use format: https://github.com/owner/repo" 
        });
      }

      const { owner, name } = parsed;
      
      // Check if repository already exists
      let repository = await storage.getRepository(`${owner}/${name}`);
      
      if (repository) {
        // Check if analysis is recent (less than 1 hour old)
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        if (repository.analyzedAt && repository.analyzedAt > oneHourAgo) {
          return res.json(repository);
        }
      }

      // Fetch repository info
      const repoInfo = await github.getRepository(owner, name);
      
      // Analyze repository
      const analysis = await analyzer.analyzeRepository(owner, name);
      
      // Get issues and PRs for additional metrics
      const [issues, pullRequests] = await Promise.all([
        github.getIssues(owner, name),
        github.getPullRequests(owner, name),
      ]);

      const openIssues = issues.filter(i => i.state === 'open').length;
      const closedIssues = issues.filter(i => i.state === 'closed').length;
      const mergedPRs = pullRequests.filter(pr => pr.merged_at).length;
      const prMergeRate = pullRequests.length > 0 ? 
        `${((mergedPRs / pullRequests.length) * 100).toFixed(1)}%` : '0%';

      // Calculate average resolution time
      const closedIssuesWithTime = issues.filter(i => i.state === 'closed' && i.closed_at);
      let avgResolutionTime = '0 days';
      if (closedIssuesWithTime.length > 0) {
        const totalTime = closedIssuesWithTime.reduce((sum, issue) => {
          const created = new Date(issue.created_at).getTime();
          const closed = new Date(issue.closed_at!).getTime();
          return sum + (closed - created);
        }, 0);
        const avgMs = totalTime / closedIssuesWithTime.length;
        const avgDays = Math.round(avgMs / (1000 * 60 * 60 * 24));
        avgResolutionTime = `${avgDays} day${avgDays !== 1 ? 's' : ''}`;
      }

      const repositoryData = {
        owner,
        name,
        fullName: `${owner}/${name}`,
        url: repoInfo.html_url,
        totalCommits: analysis.totalCommits,
        bugFixes: analysis.bugFixes,
        contributors: analysis.contributors,
        healthScore: analysis.healthScore,
        issuesOpen: openIssues,
        issuesClosed: closedIssues,
        prMergeRate,
        avgResolutionTime,
        commitData: analysis.commitData,
        bugKeywords: analysis.bugKeywords,
        topContributors: analysis.topContributors,
        recentBugFixes: analysis.recentBugFixes,
        busFactorScore: analysis.busFactorScore,
        busFactor: analysis.busFactor,
        staleBranches: analysis.staleBranches,
        changelog: analysis.changelog,
      };

      if (repository) {
        repository = await storage.updateRepository(repository.id, repositoryData);
      } else {
        repository = await storage.createRepository(repositoryData);
      }

      res.json(repository);
    } catch (error: any) {
      console.error('Analysis error:', error);
      res.status(500).json({ 
        error: error.message || 'Failed to analyze repository' 
      });
    }
  });

  // Get all analyzed repositories
  app.get("/api/repositories", async (req, res) => {
    try {
      const repositories = await storage.getAllRepositories();
      res.json(repositories);
    } catch (error: any) {
      console.error('Error fetching repositories:', error);
      res.status(500).json({ error: 'Failed to fetch repositories' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
