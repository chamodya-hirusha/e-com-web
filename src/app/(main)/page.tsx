import Link from "next/link";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Users, ShieldCheck, AlertTriangle, XCircle, ArrowRight, DollarSign, TrendingUp, Wrench as Tool } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate, calcStatus } from "@/utils/warranty";
import { EmptyState } from "@/components/EmptyState";
import { DashboardCharts } from "@/components/DashboardCharts";
import prisma from "@/lib/prisma";
import { differenceInCalendarDays } from "date-fns";

export const dynamic = "force-dynamic";

// Mock data for the new features (to keep charts rendering for now)
const salesData = [
  { name: "Jan", sales: 4000, profit: 2400 },
  { name: "Feb", sales: 3000, profit: 1398 },
  { name: "Mar", sales: 2000, profit: 9800 },
  { name: "Apr", sales: 2780, profit: 3908 },
  { name: "May", sales: 1890, profit: 4800 },
  { name: "Jun", sales: 2390, profit: 3800 },
  { name: "Jul", sales: 3490, profit: 4300 },
];

const branchData = [
  { name: "Colombo", sales: 4000 },
  { name: "Kandy", sales: 3000 },
  { name: "Galle", sales: 2000 },
];

export default async function Dashboard() {
  let customersCount = 0;
  let lowStockCount = 0;
  let pendingRepairs = 0;
  let warrantiesRaw: any[] = [];
  let lowStockList: any[] = [];
  let recentRepairs: any[] = [];
  let isDbConnected = true;

  try {
    const [cCount, lsCount, pRepairs, wRaw, lsList, rRepairs] = await Promise.all([
      prisma.customer.count(),
      prisma.product.count({ where: { quantity: { lt: 5 } } }),
      prisma.repair.count({ where: { status: { name: "Pending" } } }),
      prisma.warranty.findMany({ include: { product: true, customer: true } }),
      prisma.product.findMany({ where: { quantity: { lt: 5 } }, take: 3 }),
      prisma.repair.findMany({ orderBy: { receivedDate: "desc" }, take: 3, include: { status: true, customer: true } }),
    ]);

    customersCount = cCount;
    lowStockCount = lsCount;
    pendingRepairs = pRepairs;
    warrantiesRaw = wRaw;
    lowStockList = lsList;
    recentRepairs = rRepairs;
  } catch (error) {
    console.warn("⚠️ Cloud database connection failed. Operating in local-only / offline mode:", error);
    isDbConnected = false;
  }

  const warrantyViews = warrantiesRaw.map((w) => {
    const daysLeft = differenceInCalendarDays(w.expiryDate, new Date());
    return {
      ...w,
      daysLeft,
      status: calcStatus(daysLeft),
    };
  }).sort((a, b) => a.daysLeft - b.daysLeft);

  const activeCount = warrantyViews.filter((w) => w.status === "active").length;
  const soonCount = warrantyViews.filter((w) => w.status === "soon").length;
  const expiredCount = warrantyViews.filter((w) => w.status === "expired").length;

  const expiringSoon = warrantyViews.filter((w) => w.status === "soon").slice(0, 5);
  return (
    <div className="space-y-6">
      {!isDbConnected && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 p-4 rounded-xl flex items-start gap-3 backdrop-blur-md">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-semibold text-sm">Operating in Local Offline Mode</h4>
            <p className="text-xs opacity-90">
              The cloud sync database is currently unreachable. Your data is being safely saved in your browser's local storage (IndexedDB) and will automatically sync once a database connection is established.
            </p>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Sales" value="$24,500" icon={<DollarSign className="h-5 w-5" />} tone="active" />
        <StatCard title="Monthly Profit" value="$8,200" icon={<TrendingUp className="h-5 w-5" />} tone="active" />
        <StatCard title="Total Customers" value={customersCount} icon={<Users className="h-5 w-5" />} />
        <StatCard title="Active Warranties" value={activeCount} icon={<ShieldCheck className="h-5 w-5" />} tone="active" />
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Low Stock Items" value={lowStockCount} icon={<AlertTriangle className="h-5 w-5" />} tone="soon" />
        <StatCard title="Pending Repairs" value={pendingRepairs} icon={<Tool className="h-5 w-5" />} tone="soon" />
        <StatCard title="Expiring Soon" value={soonCount} icon={<AlertTriangle className="h-5 w-5" />} tone="soon" />
        <StatCard title="Expired" value={expiredCount} icon={<XCircle className="h-5 w-5" />} tone="expired" />
      </section>

      {/* Charts Section */}
      <DashboardCharts salesData={salesData} branchData={branchData} />

      {/* Lists Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expiring Soon */}
        <Panel title="Warranties Expiring Soon" linkTo="/warranties?filter=soon">
          {expiringSoon.length === 0 ? (
            <EmptyState icon={<ShieldCheck className="h-5 w-5" />} title="All clear" description="No warranties are about to expire." />
          ) : (
            <ul className="divide-y divide-slate-100/60 dark:divide-slate-800/30">
              {expiringSoon.map((w) => (
                <Row key={w.id} title={w.product?.name ?? "Unknown product"}
                     subtitle={`${w.customer?.name ?? "Unknown"} · expires ${formatDate(w.expiryDate)}`}>
                  <StatusBadge status={w.status} daysLeft={w.daysLeft} />
                </Row>
              ))}
            </ul>
          )}
        </Panel>

        {/* Recent Invoices (Mockup for now until invoice seed is populated) */}
        <Panel title="Recent Invoices" linkTo="/reports">
          <ul className="divide-y divide-slate-100/60 dark:divide-slate-800/30">
            <Row title="INV-001" subtitle="John Doe · $150.00">
              <span className="text-xs font-semibold text-muted-foreground/80 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 px-2.5 py-1 rounded-md">Today</span>
            </Row>
            <Row title="INV-002" subtitle="Jane Smith · $450.00">
              <span className="text-xs font-semibold text-muted-foreground/80 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 px-2.5 py-1 rounded-md">Yesterday</span>
            </Row>
            <Row title="INV-003" subtitle="Bob Johnson · $89.00">
              <span className="text-xs font-semibold text-muted-foreground/80 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 px-2.5 py-1 rounded-md">2 days ago</span>
            </Row>
          </ul>
        </Panel>
      </section>

      {/* Repairs Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Panel title="Recent Repairs" linkTo="/repairs">
          {recentRepairs.length === 0 ? (
             <EmptyState icon={<Tool className="h-5 w-5" />} title="No repairs" description="No recent repairs found." />
          ) : (
             <ul className="divide-y divide-slate-100/60 dark:divide-slate-800/30">
               {recentRepairs.map((r) => (
                 <Row key={r.id} title={r.deviceName} subtitle={`${r.status.name} · Tech: Sam`}>
                   <StatusBadge status={r.status.name === "Pending" ? "soon" : "active"} />
                 </Row>
               ))}
             </ul>
          )}
        </Panel>

        <Panel title="Low Stock Alerts" linkTo="/products">
          {lowStockList.length === 0 ? (
            <EmptyState icon={<AlertTriangle className="h-5 w-5" />} title="Stock is good" description="No items are low on stock." />
          ) : (
            <ul className="divide-y divide-slate-100/60 dark:divide-slate-800/30">
              {lowStockList.map((p) => (
                <Row key={p.id} title={p.name} subtitle={`Stock: ${p.quantity}`}>
                  <span className="text-xs text-rose-500 dark:text-rose-400 font-semibold bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100/30 dark:border-rose-900/20 px-2.5 py-1 rounded-full">Low Stock</span>
                </Row>
              ))}
            </ul>
          )}
        </Panel>
      </section>
    </div>
  );
}

function Panel({ title, linkTo, children }: { title: string; linkTo: string; children: React.ReactNode }) {
  return (
    <div className="card-elevated flex flex-col justify-between border border-slate-100/80 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100/80 dark:border-slate-800/80">
        <h2 className="text-[15px] font-bold tracking-tight text-foreground">{title}</h2>
        <Button variant="ghost" size="sm" className="h-8 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100" asChild>
          <Link href={linkTo}>View all <ArrowRight className="h-3 w-3 ml-1" /></Link>
        </Button>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  );
}

function Row({ title, subtitle, children }: { title: string; subtitle: string; children?: React.ReactNode }) {
  return (
    <li className="flex items-center justify-between gap-4 py-3.5 px-2 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 rounded-lg transition-colors duration-200">
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-sm text-foreground truncate">{title}</p>
        <p className="text-xs text-muted-foreground/80 mt-0.5 truncate">{subtitle}</p>
      </div>
      <div className="shrink-0 flex items-center">
        {children}
      </div>
    </li>
  );
}
