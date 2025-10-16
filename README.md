# Cursor Usage Analytics Dashboard

A production-ready analytics dashboard that connects to the Cursor API to display real-time usage metrics, costs, token consumption, and insights across different AI models.

## Features

-   **Real-time Analytics**: Live data from Cursor API with automatic refresh
-   **Cost Analysis**: Compare real API costs vs Cursor charges with savings calculations
-   **Model Breakdown**: Detailed usage statistics grouped by AI model families
-   **Interactive Table**: Sortable table with collapsible model family sections
-   **Responsive Design**: Works on desktop, tablet, and mobile devices
-   **Dark Mode Support**: Built-in light/dark theme support

## Dashboard Metrics

### Primary Metrics

-   **Total M Tokens**: Million tokens used across all models
-   **Real API Cost**: Direct provider rates for all usage
-   **Cursor Reports**: Actual Cursor billing charges
-   **Your Cost**: Amount paid for usage
-   **Savings**: Cost savings vs direct API usage
-   **Total Calls**: Count of all API requests

### Secondary Metrics

-   **Daily Average**: Average cost per day
-   **Projected Monthly**: 30-day cost estimate
-   **Trend**: Usage change percentage
-   **Anomalies**: High-usage model flags

### Model Analysis

-   Per-model token usage and costs
-   Paid vs free call breakdown
-   Savings calculations by model
-   Model family grouping (Claude, Cursor Models, Grok, GPT)
-   Status badges (MIXED, MAX, HIGH usage indicators)

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Environment Setup

See [ENV_CONFIG.md](./ENV_CONFIG.md) for detailed environment setup instructions.

Create a `.env.local` file with your Cursor API token:

```bash
CURSOR_API_TOKEN=your_cursor_api_token_here
```

### 3. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## API Token Setup

1. Visit [https://cursor.sh/settings/api](https://cursor.sh/settings/api)
2. Sign in to your Cursor account
3. Generate a new API token
4. Add the token to your `.env.local` file

## Project Structure

```
app/
├── app/
│   ├── api/usage/route.ts    # API route for Cursor data
│   ├── page.tsx              # Main dashboard page
│   └── globals.css           # Global styles
├── components/
│   ├── ui/                   # shadcn/ui components
│   └── dashboard/            # Dashboard-specific components
│       ├── metric-card.tsx   # Reusable metric card
│       ├── summary-cards.tsx # Primary and secondary metrics
│       └── model-table.tsx   # Model breakdown table
└── lib/
    ├── analytics.ts          # Data processing utilities
    ├── api-client.ts         # Cursor API client
    └── types.ts              # TypeScript interfaces
```

## Technology Stack

-   **Framework**: Next.js 15 with App Router
-   **Styling**: Tailwind CSS with shadcn/ui components
-   **TypeScript**: Full type safety
-   **Icons**: Lucide React
-   **State Management**: React hooks (useState, useEffect)

## Security

-   API tokens are stored server-side only
-   All Cursor API requests are proxied through Next.js API routes
-   No sensitive data is exposed to the client
-   Environment variables are properly validated

## Development

### Available Scripts

-   `pnpm dev` - Start development server
-   `pnpm build` - Build for production
-   `pnpm start` - Start production server
-   `pnpm lint` - Run ESLint

### Code Quality

-   TypeScript for type safety
-   ESLint for code quality
-   Prettier for code formatting
-   shadcn/ui for accessible components

## Deployment

This app can be deployed to any platform that supports Next.js:

-   **Vercel** (recommended): `vercel --prod`
-   **Netlify**: Connect your repository
-   **Railway**: Automatic deployment from GitHub
-   **Self-hosted**: Build and serve the `.next` directory

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).
