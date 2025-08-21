import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { GitBranch, Search } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useToast } from "../hooks/use-toast";
import { apiRequest } from "../lib/queryClient";
import { Repository, AnalyzeRequest } from "../types/github";

interface RepositoryInputProps {
  onAnalysisStart: () => void;
  onAnalysisComplete: (repository: Repository) => void;
  onAnalysisError: () => void;
}

export function RepositoryInput({ 
  onAnalysisStart, 
  onAnalysisComplete, 
  onAnalysisError 
}: RepositoryInputProps) {
  const [url, setUrl] = useState("");
  const { toast } = useToast();

  const analyzeMutation = useMutation({
    mutationFn: async (data: AnalyzeRequest) => {
      const response = await apiRequest("POST", "/api/analyze", data);
      return response.json() as Promise<Repository>;
    },
    onMutate: () => {
      onAnalysisStart();
    },
    onSuccess: (repository) => {
      onAnalysisComplete(repository);
      toast({
        title: "Analysis Complete",
        description: `Successfully analyzed ${repository.fullName}`,
      });
    },
    onError: (error: any) => {
      onAnalysisError();
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze repository",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    analyzeMutation.mutate({ url: url.trim() });
  };

  const handleQuickExample = (repoUrl: string) => {
    setUrl(`https://github.com/${repoUrl}`);
  };

  return (
    <section className="bg-github-card border border-github-border rounded-lg p-6" data-testid="repository-input">
      <div className="max-w-2xl">
        <h2 className="text-lg font-semibold text-github-text mb-2" data-testid="input-title">
          Repository Analysis
        </h2>
        <p className="text-github-text-muted mb-4" data-testid="input-description">
          Enter a GitHub repository URL to visualize commit history and bug patterns
        </p>

        <form onSubmit={handleSubmit} className="flex space-x-3">
          <div className="flex-1 relative">
            <GitBranch 
              size={16} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-github-text-muted" 
            />
            <Input
              type="url"
              placeholder="https://github.com/username/repository"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="pl-10 bg-github-dark border-github-border text-github-text placeholder-github-text-subtle focus:ring-2 focus:ring-github-blue focus:border-transparent"
              data-testid="repository-url-input"
            />
          </div>
          <Button
            type="submit"
            disabled={analyzeMutation.isPending || !url.trim()}
            className="bg-github-blue hover:bg-github-blue-dark text-white font-medium flex items-center space-x-2"
            data-testid="analyze-button"
          >
            <Search size={16} />
            <span>{analyzeMutation.isPending ? "Analyzing..." : "Analyze"}</span>
          </Button>
        </form>

        {/* Quick examples */}
        <div className="mt-3 flex flex-wrap gap-2" data-testid="quick-examples">
          <span className="text-github-text-muted text-sm">Try:</span>
          <button
            type="button"
            onClick={() => handleQuickExample("microsoft/vscode")}
            className="text-github-blue hover:underline text-sm"
            data-testid="example-vscode"
          >
            microsoft/vscode
          </button>
          <button
            type="button"
            onClick={() => handleQuickExample("facebook/react")}
            className="text-github-blue hover:underline text-sm"
            data-testid="example-react"
          >
            facebook/react
          </button>
          <button
            type="button"
            onClick={() => handleQuickExample("nodejs/node")}
            className="text-github-blue hover:underline text-sm"
            data-testid="example-node"
          >
            nodejs/node
          </button>
        </div>
      </div>
    </section>
  );
}
