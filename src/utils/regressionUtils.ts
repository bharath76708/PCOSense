/**
 * Linear Regression and Projection Utilities for PCOSense Wellness Analytics
 * Implements Ordinary Least Squares (OLS) to fit trendlines and project future metrics.
 */

export interface RegressionResult {
  slope: number; // m in y = mx + b
  intercept: number; // b in y = mx + b
  rSquared: number; // Coefficient of determination (0 to 1)
  correlation: number; // Pearson r (-1 to 1)
  trendDirection: 'increasing' | 'decreasing' | 'stable';
  dailyChangeRate: number; // Delta per day
  predict: (x: number) => number;
}

export interface ProjectedDataPoint {
  index: number;
  x: number;
  dateKey: string;
  displayDate: string;
  dayLabel: string;
  isProjected: boolean;
  actualValue?: number;
  regressionValue: number;
  projectedLowerBound?: number;
  projectedUpperBound?: number;
}

/**
 * Calculates Ordinary Least Squares (OLS) linear regression
 * for a sequence of 2D coordinates { x, y }
 */
export function calculateLinearRegression(points: { x: number; y: number }[]): RegressionResult {
  const n = points.length;
  if (n < 2) {
    const defaultY = points[0]?.y ?? 50;
    return {
      slope: 0,
      intercept: defaultY,
      rSquared: 0,
      correlation: 0,
      trendDirection: 'stable',
      dailyChangeRate: 0,
      predict: () => defaultY
    };
  }

  let sumX = 0;
  let sumY = 0;
  for (let i = 0; i < n; i++) {
    sumX += points[i].x;
    sumY += points[i].y;
  }

  const meanX = sumX / n;
  const meanY = sumY / n;

  let numerator = 0;
  let denomX = 0;
  let denomY = 0;

  for (let i = 0; i < n; i++) {
    const dx = points[i].x - meanX;
    const dy = points[i].y - meanY;
    numerator += dx * dy;
    denomX += dx * dx;
    denomY += dy * dy;
  }

  const slope = denomX === 0 ? 0 : numerator / denomX;
  const intercept = meanY - slope * meanX;

  const denom = Math.sqrt(denomX * denomY);
  const correlation = denom === 0 ? 0 : Math.max(-1, Math.min(1, numerator / denom));
  const rSquared = Math.max(0, Math.min(1, correlation * correlation));

  let trendDirection: 'increasing' | 'decreasing' | 'stable' = 'stable';
  if (slope > 0.5) {
    trendDirection = 'increasing';
  } else if (slope < -0.5) {
    trendDirection = 'decreasing';
  }

  return {
    slope: Number(slope.toFixed(3)),
    intercept: Number(intercept.toFixed(2)),
    rSquared: Number(rSquared.toFixed(3)),
    correlation: Number(correlation.toFixed(3)),
    trendDirection,
    dailyChangeRate: Number(slope.toFixed(2)),
    predict: (x: number) => {
      const pred = slope * x + intercept;
      return Number(Math.max(0, Math.min(100, pred)).toFixed(1));
    }
  };
}

/**
 * Projects a 7-day time series forward by a given number of days (default: 3 days)
 */
export function generateProjectedTimeSeries<T extends { dateKey: string; displayDate: string; dayLabel: string }>(
  historicalItems: T[],
  valueExtractor: (item: T) => number,
  futureDaysCount: number = 3
): {
  regression: RegressionResult;
  projectedSeries: Array<{
    dateKey: string;
    displayDate: string;
    dayLabel: string;
    isProjected: boolean;
    actualValue?: number;
    regressionValue: number;
    originalItem?: T;
  }>;
  summary: {
    currentAvg: number;
    projectedFinal: number;
    percentageDelta: number;
    clinicalInsight: string;
  };
} {
  const points = historicalItems.map((item, index) => ({
    x: index,
    y: valueExtractor(item)
  }));

  const regression = calculateLinearRegression(points);

  // Compute historical points with regression fitted line
  const projectedSeries = historicalItems.map((item, index) => ({
    dateKey: item.dateKey,
    displayDate: item.displayDate,
    dayLabel: item.dayLabel,
    isProjected: false,
    actualValue: points[index].y,
    regressionValue: regression.predict(index),
    originalItem: item
  }));

  // Generate future projection points
  const lastDate = new Date();
  if (historicalItems.length > 0) {
    const lastItemDate = new Date(historicalItems[historicalItems.length - 1].dateKey);
    if (!isNaN(lastItemDate.getTime())) {
      lastDate.setTime(lastItemDate.getTime());
    }
  }

  for (let step = 1; step <= futureDaysCount; step++) {
    const nextDate = new Date(lastDate);
    nextDate.setDate(lastDate.getDate() + step);

    const year = nextDate.getFullYear();
    const month = String(nextDate.getMonth() + 1).padStart(2, '0');
    const day = String(nextDate.getDate()).padStart(2, '0');
    const dateKey = `${year}-${month}-${day}`;
    const displayDate = nextDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const dayLabel = `+${step}d (${nextDate.toLocaleDateString('en-US', { weekday: 'narrow' })})`;

    const futureIndex = historicalItems.length - 1 + step;
    const projectedVal = regression.predict(futureIndex);

    projectedSeries.push({
      dateKey,
      displayDate,
      dayLabel,
      isProjected: true,
      actualValue: undefined,
      regressionValue: projectedVal,
      originalItem: undefined
    });
  }

  const currentValues = points.map(p => p.y);
  const currentAvg = currentValues.length
    ? Math.round(currentValues.reduce((a, b) => a + b, 0) / currentValues.length)
    : 0;
  const lastProjected = regression.predict(historicalItems.length - 1 + futureDaysCount);
  const percentageDelta = Number((lastProjected - currentAvg).toFixed(1));

  let clinicalInsight = '';
  if (regression.trendDirection === 'increasing') {
    clinicalInsight = `Positive trajectory: +${regression.dailyChangeRate}%/day. Sustained consistency at this slope reinforces luteal hormone stability and insulin receptor sensitivity.`;
  } else if (regression.trendDirection === 'decreasing') {
    clinicalInsight = `Downward trend: ${regression.dailyChangeRate}%/day. Proactive hydration or 15-min restorative yoga can quickly reverse this dip before symptoms flare.`;
  } else {
    clinicalInsight = `Steady baseline: consistency hovering at ${currentAvg}%. Consistent routine maintains metabolic homeostasis.`;
  }

  return {
    regression,
    projectedSeries,
    summary: {
      currentAvg,
      projectedFinal: lastProjected,
      percentageDelta,
      clinicalInsight
    }
  };
}
