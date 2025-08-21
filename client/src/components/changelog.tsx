import { FileText, Download, Calendar, GitCommit, Bug, Zap, Settings, AlertTriangle } from "lucide-react";
import { Repository, ChangelogEntry } from "../types/github";

interface ChangelogProps {
  repository: Repository;
}

export function Changelog({ repository }: ChangelogProps) {
  const { changelog } = repository;
  
  if (!changelog || changelog.length === 0) {
    return (
      <div className="bg-github-card border border-github-border rounded-lg p-6" data-testid="changelog">
        <h3 className="text-lg font-semibold text-github-text mb-2">Auto-Generated Changelog</h3>
        <p className="text-github-text-muted">No recent changes to generate changelog from.</p>
      </div>
    );
  }

  const getChangeIcon = (type: string) => {
    switch (type) {
      case 'features': return <Zap className="text-github-green" size={14} />;
      case 'bugFixes': return <Bug className="text-github-red" size={14} />;
      case 'improvements': return <Settings className="text-github-blue" size={14} />;
      case 'breaking': return <AlertTriangle className="text-github-orange" size={14} />;
      default: return <GitCommit className="text-github-text-muted" size={14} />;
    }
  };

  const getChangePrefix = (type: string) => {
    switch (type) {
      case 'features': return '🚀';
      case 'bugFixes': return '🐛';
      case 'improvements': return '⚡';
      case 'breaking': return '💥';
      default: return '📝';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const generateMarkdown = () => {
    let markdown = `# Changelog - ${repository.fullName}\n\n`;
    
    changelog.forEach(entry => {
      markdown += `## ${entry.version} (${formatDate(entry.date)})\n\n`;
      
      if (entry.features.length > 0) {
        markdown += `### 🚀 Features\n`;
        entry.features.forEach(feature => {
          markdown += `- ${feature}\n`;
        });
        markdown += '\n';
      }
      
      if (entry.bugFixes.length > 0) {
        markdown += `### 🐛 Bug Fixes\n`;
        entry.bugFixes.forEach(fix => {
          markdown += `- ${fix}\n`;
        });
        markdown += '\n';
      }
      
      if (entry.improvements.length > 0) {
        markdown += `### ⚡ Improvements\n`;
        entry.improvements.forEach(improvement => {
          markdown += `- ${improvement}\n`;
        });
        markdown += '\n';
      }
      
      if (entry.breaking.length > 0) {
        markdown += `### 💥 Breaking Changes\n`;
        entry.breaking.forEach(breaking => {
          markdown += `- ${breaking}\n`;
        });
        markdown += '\n';
      }
      
      markdown += '---\n\n';
    });
    
    return markdown;
  };

  const downloadChangelog = () => {
    const markdown = generateMarkdown();
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CHANGELOG-${repository.name}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getTotalChanges = (entry: ChangelogEntry) => {
    return entry.features.length + entry.bugFixes.length + entry.improvements.length + entry.breaking.length;
  };

  return (
    <div className="bg-github-card border border-github-border rounded-lg p-6" data-testid="changelog">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-github-text flex items-center" data-testid="changelog-title">
            Auto-Generated Changelog
          </h3>
          <p className="text-github-text-muted text-sm">
            Automatically parsed from commit history and PR titles
          </p>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={downloadChangelog}
            className="px-3 py-2 bg-github-blue hover:bg-github-blue-dark text-white rounded-md transition-colors flex items-center space-x-2 text-sm"
            data-testid="download-changelog-button"
          >
            <Download size={14} />
            <span>Export Markdown</span>
          </button>
        </div>
      </div>

      <div className="space-y-6" data-testid="changelog-entries">
        {changelog.map((entry, entryIndex) => (
          <div 
            key={entry.version}
            className="bg-github-darker/30 rounded-lg p-5 border border-github-border/50"
            data-testid={`changelog-entry-${entryIndex}`}
          >
            {/* Version Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <h4 className="text-github-text font-semibold text-lg" data-testid={`version-${entryIndex}`}>
                  {entry.version}
                </h4>
                <span className="px-2 py-1 bg-github-blue/20 text-github-blue rounded-full text-xs">
                  {getTotalChanges(entry)} changes
                </span>
              </div>
              <div className="flex items-center space-x-2 text-github-text-muted text-sm">
                <Calendar size={14} />
                <span data-testid={`date-${entryIndex}`}>{formatDate(entry.date)}</span>
              </div>
            </div>

            {/* Changes */}
            <div className="space-y-4">
              {/* Features */}
              {entry.features.length > 0 && (
                <div data-testid={`features-${entryIndex}`}>
                  <h5 className="text-github-green font-medium mb-2 flex items-center space-x-2">
                    {getChangeIcon('features')}
                    <span>Features ({entry.features.length})</span>
                  </h5>
                  <ul className="space-y-1 ml-6">
                    {entry.features.map((feature, featureIndex) => (
                      <li 
                        key={featureIndex}
                        className="text-github-text text-sm flex items-start space-x-2"
                        data-testid={`feature-${entryIndex}-${featureIndex}`}
                      >
                        <span className="text-github-green mt-1">•</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Bug Fixes */}
              {entry.bugFixes.length > 0 && (
                <div data-testid={`bug-fixes-${entryIndex}`}>
                  <h5 className="text-github-red font-medium mb-2 flex items-center space-x-2">
                    {getChangeIcon('bugFixes')}
                    <span>Bug Fixes ({entry.bugFixes.length})</span>
                  </h5>
                  <ul className="space-y-1 ml-6">
                    {entry.bugFixes.map((fix, fixIndex) => (
                      <li 
                        key={fixIndex}
                        className="text-github-text text-sm flex items-start space-x-2"
                        data-testid={`bug-fix-${entryIndex}-${fixIndex}`}
                      >
                        <span className="text-github-red mt-1">•</span>
                        <span>{fix}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Improvements */}
              {entry.improvements.length > 0 && (
                <div data-testid={`improvements-${entryIndex}`}>
                  <h5 className="text-github-blue font-medium mb-2 flex items-center space-x-2">
                    {getChangeIcon('improvements')}
                    <span>Improvements ({entry.improvements.length})</span>
                  </h5>
                  <ul className="space-y-1 ml-6">
                    {entry.improvements.map((improvement, improvementIndex) => (
                      <li 
                        key={improvementIndex}
                        className="text-github-text text-sm flex items-start space-x-2"
                        data-testid={`improvement-${entryIndex}-${improvementIndex}`}
                      >
                        <span className="text-github-blue mt-1">•</span>
                        <span>{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Breaking Changes */}
              {entry.breaking.length > 0 && (
                <div data-testid={`breaking-${entryIndex}`}>
                  <h5 className="text-github-orange font-medium mb-2 flex items-center space-x-2">
                    {getChangeIcon('breaking')}
                    <span>Breaking Changes ({entry.breaking.length})</span>
                  </h5>
                  <ul className="space-y-1 ml-6">
                    {entry.breaking.map((breaking, breakingIndex) => (
                      <li 
                        key={breakingIndex}
                        className="text-github-text text-sm flex items-start space-x-2"
                        data-testid={`breaking-${entryIndex}-${breakingIndex}`}
                      >
                        <span className="text-github-orange mt-1">•</span>
                        <span>{breaking}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-github-border text-center">
        <p className="text-github-text-muted text-xs">
          Generated automatically from commit messages, PR titles, and issue references
        </p>
      </div>
    </div>
  );
}