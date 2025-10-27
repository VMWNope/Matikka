
// Fix: Import ReactNode to be used as a type.
import type { ReactNode } from 'react';

export interface ChartDataPoint {
  time: number;
  timeLabel: string;
  population: number;
}

export interface Milestone {
  label: string;
  value: string;
  // Fix: Use imported ReactNode type to resolve 'Cannot find namespace React' error.
  icon: ReactNode;
}

export interface CalculationResult {
  chartData: ChartDataPoint[];
  milestones: Milestone[];
}

export interface CalculationParams {
  doublingTime: number;
}
