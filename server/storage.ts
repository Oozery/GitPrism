import { type Repository, type InsertRepository } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getRepository(fullName: string): Promise<Repository | undefined>;
  createRepository(repository: InsertRepository): Promise<Repository>;
  updateRepository(id: string, updates: Partial<Repository>): Promise<Repository | undefined>;
  getAllRepositories(): Promise<Repository[]>;
}

export class MemStorage implements IStorage {
  private repositories: Map<string, Repository>;

  constructor() {
    this.repositories = new Map();
  }

  async getRepository(fullName: string): Promise<Repository | undefined> {
    return Array.from(this.repositories.values()).find(
      (repo) => repo.fullName === fullName,
    );
  }

  async createRepository(insertRepository: InsertRepository): Promise<Repository> {
    const id = randomUUID();
    const repository: Repository = {
      ...insertRepository,
      id,
      analyzedAt: new Date(),
      totalCommits: insertRepository.totalCommits ?? 0,
      bugFixes: insertRepository.bugFixes ?? 0,
      contributors: insertRepository.contributors ?? 0,
      healthScore: insertRepository.healthScore ?? 0,
      issuesOpen: insertRepository.issuesOpen ?? 0,
      issuesClosed: insertRepository.issuesClosed ?? 0,
      prMergeRate: insertRepository.prMergeRate ?? "0%",
      avgResolutionTime: insertRepository.avgResolutionTime ?? "0 days",
      commitData: insertRepository.commitData ?? null,
      bugKeywords: insertRepository.bugKeywords ?? null,
      topContributors: insertRepository.topContributors ?? null,
      recentBugFixes: insertRepository.recentBugFixes ?? null,
      busFactorScore: insertRepository.busFactorScore ?? 0,
      busFactor: insertRepository.busFactor ?? null,
      staleBranches: insertRepository.staleBranches ?? null,
      changelog: insertRepository.changelog ?? null,
    };
    this.repositories.set(id, repository);
    return repository;
  }

  async updateRepository(id: string, updates: Partial<Repository>): Promise<Repository | undefined> {
    const existing = this.repositories.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...updates, analyzedAt: new Date() };
    this.repositories.set(id, updated);
    return updated;
  }

  async getAllRepositories(): Promise<Repository[]> {
    return Array.from(this.repositories.values());
  }
}

export const storage = new MemStorage();
