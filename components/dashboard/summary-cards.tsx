import { MetricCard } from './metric-card';
import { AnalyticsSummary } from '@/lib/types';
import {
  DollarSign,
  TrendingUp,
  Activity,
  PiggyBank,
  BarChart3,
  Calendar,
} from 'lucide-react';

interface SummaryCardsProps {
  summary: AnalyticsSummary;
  isLoading?: boolean;
}

export function SummaryCards({ summary, isLoading = false }: SummaryCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {/* Total M Tokens */}
      <MetricCard
        title="Total M Tokens"
        value={summary.totalTokens / 1000000}
        subtitle="Million tokens used"
        icon={BarChart3}
        format="number"
        isLoading={isLoading}
        className="col-span-1"
      />

      {/* Real API Cost */}
      <MetricCard
        title="Real API Cost"
        value={summary.realApiCost}
        subtitle="Direct provider rates"
        icon={DollarSign}
        format="currency"
        isLoading={isLoading}
        className="col-span-1"
      />

      {/* Your Cost */}
      <MetricCard
        title="Your Cost"
        value={summary.yourCost}
        subtitle="What you pay to Cursor"
        icon={Activity}
        format="currency"
        isLoading={isLoading}
        className="col-span-1"
      />

      {/* Projected Monthly */}
      <MetricCard
        title="Projected Monthly"
        value={summary.projectedMonthly}
        subtitle="30-day estimate"
        icon={Calendar}
        format="currency"
        isLoading={isLoading}
        className="col-span-1"
      />

      {/* Savings */}
      <MetricCard
        title="Savings"
        value={summary.savings}
        subtitle={`${summary.savingsPercentage.toFixed(1)}% vs direct API`}
        icon={PiggyBank}
        format="currency"
        badge={{
          text: 'SAVED',
          variant: 'default',
        }}
        isLoading={isLoading}
        className="col-span-1"
      />
    </div>
  );
}

interface SecondaryMetricsProps {
  summary: AnalyticsSummary;
  isLoading?: boolean;
}

export function SecondaryMetrics({ summary, isLoading = false }: SecondaryMetricsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Daily Average */}
      <MetricCard
        title="Daily Average"
        value={summary.dailyAverage}
        subtitle="Cost per day"
        format="currency"
        trend={{
          value: summary.trend,
          label: 'from last week',
        }}
        isLoading={isLoading}
      />

      {/* Trend */}
      <MetricCard
        title="Trend"
        value={`${summary.trend >= 0 ? '+' : ''}${summary.trend.toFixed(1)}%`}
        subtitle="Usage change"
        trend={{
          value: summary.trend,
          label: 'vs previous period',
        }}
        isLoading={isLoading}
      />

      {/* Anomalies */}
      <MetricCard
        title="Anomalies"
        value={summary.anomalies}
        subtitle="High-usage models"
        badge={{
          text: summary.anomalies > 0 ? 'FLAG' : 'CLEAR',
          variant: summary.anomalies > 0 ? 'destructive' : 'secondary',
        }}
        isLoading={isLoading}
      />
    </div>
  );
}
