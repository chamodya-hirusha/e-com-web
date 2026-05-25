"use client";
// Force Next.js recompile

import { useState, useEffect, useCallback } from "react";
import { ReportTemplate, ReportDataResponse } from "@/reports/types";
import { ArrowLeft, Loader2, Download, Filter } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

export default function ReportViewer({ template }: { template: ReportTemplate }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ReportDataResponse | null>(null);
  const [filters, setFilters] = useState<Record<string, any>>({});

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/reports/engine?report=${template.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filters),
      });
      if (!response.ok) throw new Error("Failed to fetch report data");
      const result = await response.json();
      setData(result);
    } catch (error: any) {
      toast.error(error.message || "Error generating report");
    } finally {
      setLoading(false);
    }
  }, [template.id, filters]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleFilterChange = (id: string, value: string) => {
    setFilters((prev) => ({ ...prev, [id]: value }));
  };

  const renderChart = () => {
    if (!template.chart || !data?.chartData || data.chartData.length === 0) return null;
    const { chart } = template;
    
    return (
      <div className="card-elevated p-6 mt-6 h-[400px]">
        <h3 className="text-lg font-semibold mb-4">Analytics Chart</h3>
        <ResponsiveContainer width="100%" height="100%">
          {chart.type === "bar" ? (
            <BarChart data={data.chartData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey={chart.xAxis} />
              <YAxis />
              <Tooltip contentStyle={{ borderRadius: '8px', backgroundColor: 'var(--background)' }} />
              <Legend />
              {chart.yAxis.map((y, idx) => (
                <Bar key={y} dataKey={y} fill={idx % 2 === 0 ? "hsl(var(--primary))" : "hsl(var(--secondary))"} radius={[4, 4, 0, 0]} />
              ))}
            </BarChart>
          ) : chart.type === "line" ? (
            <LineChart data={data.chartData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey={chart.xAxis} />
              <YAxis />
              <Tooltip contentStyle={{ borderRadius: '8px', backgroundColor: 'var(--background)' }} />
              <Legend />
              {chart.yAxis.map((y, idx) => (
                <Line key={y} type="monotone" dataKey={y} stroke={idx % 2 === 0 ? "hsl(var(--primary))" : "hsl(var(--secondary))"} strokeWidth={3} />
              ))}
            </LineChart>
          ) : (
            <PieChart>
              <Tooltip />
              <Legend />
              <Pie data={data.chartData} dataKey={chart.yAxis[0]} nameKey={chart.xAxis} cx="50%" cy="50%" outerRadius={120} fill="hsl(var(--primary))" label />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>
    );
  };

  const formatValue = (val: any, type: string) => {
    if (val == null) return "-";
    if (type === "currency") return typeof val === 'number' ? `$${val.toFixed(2)}` : val;
    if (type === "date") return new Date(val).toLocaleDateString();
    return val;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link href="/reports" className="text-sm text-muted-foreground hover:text-primary mb-2 inline-flex items-center gap-1 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Reports
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">{template.title}</h1>
          <p className="text-muted-foreground">{template.description}</p>
        </div>
        <div className="flex gap-2">
          {template.exportOptions.includes("pdf") && (
            <Button variant="outline" className="gap-2"><Download className="h-4 w-4" /> PDF</Button>
          )}
          {template.exportOptions.includes("excel") && (
            <Button variant="outline" className="gap-2"><Download className="h-4 w-4" /> Excel</Button>
          )}
        </div>
      </div>

      {/* Filters */}
      {template.filters.length > 0 && (
        <div className="card-elevated p-4 flex flex-wrap gap-4 items-end">
          <div className="flex items-center gap-2 font-medium text-sm text-muted-foreground mr-2">
            <Filter className="h-4 w-4" /> Filters:
          </div>
          {template.filters.map(f => (
            <div key={f.id} className="space-y-1 min-w-[150px]">
              <label className="text-xs font-medium">{f.label}</label>
              {f.type === 'select' ? (
                <select 
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  onChange={(e) => handleFilterChange(f.id, e.target.value)}
                >
                  <option value="">All</option>
                  {f.options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              ) : (
                <Input 
                  type={f.type === 'date-range' ? 'date' : 'text'} 
                  placeholder={f.label}
                  onChange={(e) => handleFilterChange(f.id, e.target.value)}
                  className="h-9"
                />
              )}
            </div>
          ))}
          <Button onClick={fetchReport} disabled={loading} className="ml-auto">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Apply Filters
          </Button>
        </div>
      )}

      {/* Summary Cards */}
      {data?.summary && template.summaryCards.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {template.summaryCards.map((card) => (
            <div key={card.id} className="card-elevated p-5 border-l-4 border-l-primary">
              <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
              <h4 className="text-2xl font-bold mt-2">
                {formatValue(data.summary[card.id], card.type)}
              </h4>
            </div>
          ))}
        </div>
      )}

      {/* Chart */}
      {renderChart()}

      {/* Table */}
      <div className="card-elevated overflow-hidden">
        <div className="p-4 border-b bg-muted/40">
          <h3 className="font-semibold">Detailed Records</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/20">
              <tr>
                {template.columns.map(col => (
                  <th key={col.id} className="px-4 py-3 font-medium">{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && !data ? (
                <tr><td colSpan={template.columns.length} className="text-center py-10"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></td></tr>
              ) : data?.data && data.data.length > 0 ? (
                data.data.map((row, i) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-muted/10 transition-colors">
                    {template.columns.map(col => (
                      <td key={col.id} className="px-4 py-3">
                        {formatValue(row[col.id], col.type)}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr><td colSpan={template.columns.length} className="text-center py-10 text-muted-foreground">No records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
