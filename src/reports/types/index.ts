export interface ReportFilter {
  id: string;
  type: 'date-range' | 'select' | 'text';
  label: string;
  options?: { label: string; value: string }[];
}

export interface ReportColumn {
  id: string;
  label: string;
  type: 'string' | 'currency' | 'number' | 'date';
}

export interface ReportChart {
  type: 'bar' | 'line' | 'pie';
  xAxis: string;
  yAxis: string[];
}

export interface ReportSummaryCard {
  id: string;
  label: string;
  type: 'currency' | 'number' | 'string';
}

export interface ReportSort {
  column: string;
  direction: 'asc' | 'desc';
}

export interface ReportTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  filters: ReportFilter[];
  columns: ReportColumn[];
  chart: ReportChart | null;
  exportOptions: ('pdf' | 'excel' | 'csv')[];
  apiEndpoint: string;
  permissions: string[];
  defaultSort: ReportSort;
  summaryCards: ReportSummaryCard[];
}

export interface ReportDataResponse {
  data: any[];
  summary: Record<string, any>;
  chartData: any[];
  total: number;
}
