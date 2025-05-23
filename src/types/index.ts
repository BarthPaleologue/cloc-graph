/**
 * Type definitions for cloc-graph
 */

export interface CLOCStats {
  blank?: number;
  comment?: number;
  code: number;
  nFiles?: number;
}

export interface CLOCData {
  [language: string]: CLOCStats;
}

export interface Record {
  date: string;
  [language: string]: number | string;
}

export interface ChartDataset {
  label: string;
  data: number[];
  fill: boolean;
  borderWidth: number;
  tension: number;
  borderColor?: string;
  backgroundColor?: string;
}

export interface CLIOptions {
  path: string;
  step: string;
  granularity: string;
  top: string;
  exclude?: string;
  include?: string;
  from?: string;
  to?: string;
  maxSamples: string;
  smartSampling?: boolean;
}
