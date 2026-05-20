"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";

export function DashboardCharts({ salesData, branchData }: { salesData: any[]; branchData: any[] }) {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
      {/* Sales & Profit Chart */}
      <div className="lg:col-span-2 card-elevated p-6 flex flex-col justify-between overflow-x-auto no-scrollbar border border-slate-100/80 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all duration-300">
        <div>
          <h2 className="text-base font-bold tracking-tight text-foreground mb-1">Sales & Profit Analytics</h2>
          <p className="text-xs text-muted-foreground/80 mb-5">Monthly performance comparison of revenue and profits</p>
        </div>
        <div className="h-80 w-full min-w-[550px] lg:min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={salesData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.01} />
                </linearGradient>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--status-active))" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(var(--status-active))" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.6)" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontWeight: 500 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontWeight: 500 }} 
                dx={-10}
              />
              <Tooltip 
                contentStyle={{ 
                  background: "hsl(var(--card))", 
                  borderColor: "hsl(var(--border) / 0.8)", 
                  borderRadius: "10px", 
                  boxShadow: "var(--shadow-elevated)",
                  padding: "10px 14px",
                  fontSize: "12px",
                  fontWeight: 500
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="sales" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorSales)" 
                name="Sales"
              />
              <Area 
                type="monotone" 
                dataKey="profit" 
                stroke="hsl(var(--status-active))" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorProfit)" 
                name="Profit"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Branch Wise Sales */}
      <div className="card-elevated p-6 flex flex-col justify-between overflow-x-auto no-scrollbar border border-slate-100/80 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all duration-300">
        <div>
          <h2 className="text-base font-bold tracking-tight text-foreground mb-1">Branch-wise Sales</h2>
          <p className="text-xs text-muted-foreground/80 mb-5">Sales contribution breakdown across key regions</p>
        </div>
        <div className="h-80 w-full min-w-[280px] lg:min-w-0 flex flex-col justify-between">
          <div className="flex-1 h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={branchData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.6)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontWeight: 500 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontWeight: 500 }} 
                  dx={-10}
                />
                <Tooltip 
                  contentStyle={{ 
                    background: "hsl(var(--card))", 
                    borderColor: "hsl(var(--border) / 0.8)", 
                    borderRadius: "10px", 
                    boxShadow: "var(--shadow-elevated)",
                    padding: "10px 14px",
                    fontSize: "12px",
                    fontWeight: 500
                  }} 
                />
                <Bar 
                  dataKey="sales" 
                  fill="hsl(var(--primary))" 
                  radius={[6, 6, 0, 0]} 
                  maxBarSize={45}
                  name="Sales ($)"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="pt-2 flex justify-center text-xs font-semibold text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[hsl(var(--primary))]" />
              Sales volume per branch
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
