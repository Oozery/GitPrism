# Git Prism - Repository Health Dashboard

A comprehensive GitHub repository analysis tool with advanced features like Bus Factor scoring, stale branch detection, and automated changelog generation.

## 🚀 Features

- **Repository Health Analysis** - Complete health scoring and metrics
- **Commit Activity Heatmap** - Visual representation of commit patterns
- **Bug Fix Tracking** - Intelligent detection and analysis of bug-related commits
- **Bus Factor Score 🚌** - Knowledge distribution risk assessment
- **Stale Branch Detector 🌿** - Automated branch cleanup recommendations
- **Changelog Auto-Generator 📝** - Professional release notes from commit history
- **GitHub Dark Theme** - Authentic GitHub styling throughout

## 📋 Prerequisites

- Node.js 20+ 
- npm or yarn
- GitHub API token (optional, for higher rate limits)

## 🛠️ Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables** (optional)
   ```bash
   # Create .env file
   echo "GITHUB_TOKEN=your_github_token_here" > .env
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   - Navigate to `http://localhost:5001`
   - Enter any GitHub repository URL to analyze

## 🏗️ Project Structure

```
bug-explorer-export/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Main pages
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility functions
│   │   └── types/         # TypeScript type definitions
│   └── index.html
├── server/                # Backend Express server
│   ├── services/          # Business logic services
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API route definitions
│   └── storage.ts        # Data storage interface
├── shared/               # Shared types and schemas
└── package.json         # Dependencies and scripts
```

## 🔧 Configuration

### GitHub API Token
For better rate limits and access to private repositories:

1. Go to GitHub Settings > Developer settings > Personal access tokens
2. Generate a new token with `repo` scope
3. Add it to your environment: `GITHUB_TOKEN=your_token_here`

### Database (Optional)
- Currently uses in-memory storage
- To use PostgreSQL, update the storage configuration in `server/storage.ts`

## 🎯 Usage Examples

1. **Analyze a popular repository**
   - Try: `https://github.com/microsoft/vscode`
   - Try: `https://github.com/facebook/react`

2. **View Bus Factor Analysis**
   - See knowledge distribution risks
   - Get recommendations for team health

3. **Check Stale Branches**
   - Identify abandoned feature branches
   - Get cleanup suggestions

4. **Generate Changelog**
   - Export professional release notes
   - Download as Markdown file

## 🚀 Deployment

- Build: `npm run build`
- Start: `npm start`
- Deploy the `dist/` folder

## 🛡️ Security

- GitHub tokens are handled securely
- No sensitive data is stored permanently
- Rate limiting respects GitHub API limits

## 📊 Metrics Explained

- **Health Score**: Overall repository health (0-100)
- **Bus Factor**: Knowledge concentration risk
- **Bug Fix Ratio**: Percentage of commits that fix bugs
- **Branch Activity**: Recent development activity
- **Contributor Distribution**: Team participation balance

## 🤝 Contributing

This is a portfolio project showcasing:
- Full-stack TypeScript development
- GitHub API integration
- Data visualization with charts
- DevOps and repository management insights
