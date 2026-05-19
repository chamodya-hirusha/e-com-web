"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useData } from "@/hooks/useData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, Package, AlertTriangle, CheckCircle, Flame, 
  TrendingUp, Activity, RefreshCw, Plus, Minus, DollarSign,
  TrendingDown, Layers, Box, Calendar
} from "lucide-react";
import { toast } from "sonner";
import { io } from "socket.io-client";
import { 
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";

interface ActivityLog {
  id: string;
  time: string;
  text: string;
  type: "success" | "warning" | "error" | "info";
}

export default function StockMonitorPage() {
  const { products, brands, models, categories, updateProduct } = useData();
  const [q, setQ] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "low" | "out">("all");
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [highlightedProductId, setHighlightedProductId] = useState<string | null>(null);

  // Brand and Model helpers
  const getBrandName = (id?: string) => brands.find(b => b.id === id)?.name || "Unknown Brand";
  const getModelName = (id?: string) => models.find(m => m.id === id)?.name || "";
  const getCategoryName = (id?: string) => categories.find(c => c.id === id)?.name || "Uncategorized";

  // Socket Listener for live visual feed & highlights
  useEffect(() => {
    const socket = io();

    socket.on("sync-event", (event: { action: string; entity: string; id: string; data: any }) => {
      const { action, entity, id, data } = event;
      let text = "";
      let type: "success" | "warning" | "error" | "info" = "info";

      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      if (entity === "Product") {
        setHighlightedProductId(id);
        setTimeout(() => setHighlightedProductId(null), 1500);

        if (action === "create") {
          text = `New Product "${data.name}" added with ${data.quantity} in stock.`;
          type = "success";
        } else if (action === "update") {
          text = `Stock updated for "${data.name}": Now ${data.quantity} units.`;
          type = data.quantity === 0 ? "error" : data.quantity < 5 ? "warning" : "success";
        } else if (action === "delete") {
          text = `Product was deleted from inventory.`;
          type = "error";
        }
      } else if (entity === "Invoice") {
        if (action === "create") {
          text = `Invoice ${data.number} issued: Sales total $${parseFloat(data.total).toFixed(2)}.`;
          type = "info";
        }
      }

      if (text) {
        setActivities((prev) => [
          { id: Math.random().toString(), time, text, type },
          ...prev.slice(0, 14) // Keep last 15 items
        ].filter(Boolean));
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Filter products
  const processedProducts = useMemo(() => {
    return products.map(p => ({
      ...p,
      brandName: getBrandName(p.brandId),
      modelName: getModelName(p.modelId),
      categoryName: getCategoryName(p.categoryId),
      sellPriceNum: parseFloat(String(p.sellPrice)) || 0,
      costPriceNum: parseFloat(String(p.costPrice)) || 0,
    }));
  }, [products, brands, models, categories]);

  const filteredProducts = useMemo(() => {
    return processedProducts.filter(p => {
      // Tab filter
      if (filterTab === "out" && p.quantity > 0) return false;
      if (filterTab === "low" && (p.quantity === 0 || p.quantity >= 5)) return false;

      // Text search
      const query = q.toLowerCase();
      return (
        p.name.toLowerCase().includes(query) ||
        (p.sku && p.sku.toLowerCase().includes(query)) ||
        p.brandName.toLowerCase().includes(query) ||
        p.modelName.toLowerCase().includes(query) ||
        p.categoryName.toLowerCase().includes(query)
      );
    });
  }, [processedProducts, filterTab, q]);

  // Statistics
  const stats = useMemo(() => {
    const totalUnique = products.length;
    const totalQty = products.reduce((acc, curr) => acc + curr.quantity, 0);
    const outOfStock = products.filter(p => p.quantity === 0).length;
    const lowStock = products.filter(p => p.quantity > 0 && p.quantity < 5).length;
    const healthyStock = products.filter(p => p.quantity >= 5).length;
    const totalVal = products.reduce((acc, curr) => acc + (curr.quantity * (parseFloat(String(curr.sellPrice)) || 0)), 0);

    return { totalUnique, totalQty, outOfStock, lowStock, healthyStock, totalVal };
  }, [products]);

  // Chart Data
  const chartData = useMemo(() => {
    return [
      { name: "Healthy Stock (≥5)", value: stats.healthyStock, color: "#10b981" },
      { name: "Low Stock (<5)", value: stats.lowStock, color: "#f59e0b" },
      { name: "Out of Stock (0)", value: stats.outOfStock, color: "#ef4444" },
    ].filter(d => d.value > 0);
  }, [stats]);

  const barChartData = useMemo(() => {
    return processedProducts
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 8)
      .map(p => ({
        name: p.name.length > 12 ? p.name.substring(0, 10) + ".." : p.name,
        Stock: p.quantity,
      }));
  }, [processedProducts]);

  // Inline adjustment handlers
  const handleQuickAdjust = async (id: string, currentQty: number, delta: number) => {
    const nextQty = Math.max(0, currentQty + delta);
    try {
      await updateProduct(id, { quantity: nextQty });
      toast.success(`Quantity adjusted to ${nextQty}`);
    } catch (err) {
      toast.error("Failed to adjust quantity");
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Real-time Indicator Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            Stock Control Center
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Monitor and manage your inventory levels across all categories in real-time
          </p>
        </div>

        <div className="flex items-center gap-2.5 bg-zinc-100 dark:bg-zinc-900 border px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-zinc-600 dark:text-zinc-400">Live Sync Engaged</span>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-elevated p-5 space-y-2 relative overflow-hidden">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground font-semibold uppercase">Total Catalog Items</span>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Layers className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-foreground">{stats.totalUnique}</div>
          <p className="text-[10px] text-muted-foreground">Unique product models</p>
        </div>

        <div className="card-elevated p-5 space-y-2 relative overflow-hidden">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground font-semibold uppercase">Total On Hand Stock</span>
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <Box className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-foreground">{stats.totalQty}</div>
          <p className="text-[10px] text-muted-foreground">Total physical inventory units</p>
        </div>

        <div className="card-elevated p-5 space-y-2 relative overflow-hidden border-rose-500/25 dark:border-rose-500/15">
          <div className="flex justify-between items-center">
            <span className="text-xs text-rose-600 dark:text-rose-400 font-semibold uppercase">Out Of Stock</span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <Flame className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-rose-600 dark:text-rose-400 flex items-center gap-2">
            {stats.outOfStock}
            {stats.outOfStock > 0 && (
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse" />
            )}
          </div>
          <p className="text-[10px] text-muted-foreground">Requires immediate restocking</p>
        </div>

        <div className="card-elevated p-5 space-y-2 relative overflow-hidden border-yellow-500/25 dark:border-yellow-500/15">
          <div className="flex justify-between items-center">
            <span className="text-xs text-yellow-600 dark:text-yellow-400 font-semibold uppercase">Low Stock</span>
            <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-yellow-600 dark:text-yellow-400">{stats.lowStock}</div>
          <p className="text-[10px] text-muted-foreground">Less than 5 items remaining</p>
        </div>
      </div>

      {/* Visual Charts & Real-time Log */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card-elevated p-6 space-y-4">
          <h2 className="text-base font-bold text-foreground flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-primary" /> Visual Analytics & Distributions
          </h2>
          <div className="grid md:grid-cols-2 gap-4 h-64">
            {/* Pie Chart */}
            <div className="relative flex flex-col justify-center items-center">
              <span className="text-xs font-semibold text-muted-foreground mb-1 block">Stock Status</span>
              {chartData.length === 0 ? (
                <div className="text-xs text-muted-foreground">No stock data available</div>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#27272a", border: "none", borderRadius: "8px", color: "#fff", fontSize: "11px" }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
              {/* Custom Legend */}
              <div className="flex gap-4 text-[10px] justify-center mt-2 font-medium">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500 block"></span> Healthy</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500 block"></span> Low</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-500 block"></span> Out</span>
              </div>
            </div>

            {/* Bar Chart */}
            <div className="relative flex flex-col justify-center items-center">
              <span className="text-xs font-semibold text-muted-foreground mb-2 block">Top 8 Highest Stocked Products</span>
              {barChartData.length === 0 ? (
                <div className="text-xs text-muted-foreground">No product data available</div>
              ) : (
                <ResponsiveContainer width="100%" height={190}>
                  <BarChart data={barChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                    <XAxis dataKey="name" tick={{ fontSize: 9 }} tickLine={false} />
                    <YAxis tick={{ fontSize: 9 }} tickLine={false} width={20} />
                    <Tooltip contentStyle={{ background: "#27272a", border: "none", borderRadius: "8px", color: "#fff", fontSize: "11px" }} />
                    <Bar dataKey="Stock" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Live Activity Log Widget */}
        <div className="card-elevated p-6 flex flex-col h-76 max-h-[320px] lg:max-h-none overflow-hidden">
          <h2 className="text-base font-bold text-foreground flex items-center gap-1.5 border-b pb-2 shrink-0">
            <Activity className="h-4 w-4 text-emerald-500 animate-pulse" /> Live Stock Adjustments
          </h2>
          
          <div className="flex-1 overflow-y-auto space-y-2.5 mt-3 pr-1">
            {activities.length === 0 ? (
              <div className="h-full flex flex-col justify-center items-center text-center p-4">
                <RefreshCw className="h-8 w-8 text-muted-foreground/30 animate-spin mb-2" />
                <p className="text-xs font-medium text-muted-foreground">Listening for real-time transactions...</p>
                <p className="text-[10px] text-muted-foreground/75 mt-0.5">Try adjusting stock or creating an invoice in another window!</p>
              </div>
            ) : (
              activities.map((act) => (
                <div key={act.id} className="text-xs p-2.5 rounded-lg bg-muted/40 border flex items-start gap-2 animate-in fade-in slide-in-from-right-3 duration-300">
                  <span className="mono text-[10px] font-semibold text-primary pt-0.5">{act.time}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-muted-foreground leading-relaxed break-words font-medium">
                      {act.text}
                    </p>
                  </div>
                  <span className={`h-1.5 w-1.5 rounded-full shrink-0 mt-1.5 ${
                    act.type === "success" ? "bg-emerald-500" :
                    act.type === "warning" ? "bg-amber-500" :
                    act.type === "error" ? "bg-rose-500" : "bg-blue-500"
                  }`} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Main Stock Table and Filters */}
      <div className="card-elevated p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
          <div className="flex gap-2">
            <Button 
              variant={filterTab === "all" ? "default" : "outline"} 
              size="sm" 
              onClick={() => setFilterTab("all")}
              className="rounded-full text-xs"
            >
              All Items ({stats.totalUnique})
            </Button>
            <Button 
              variant={filterTab === "low" ? "default" : "outline"} 
              size="sm" 
              onClick={() => setFilterTab("low")}
              className={`rounded-full text-xs ${
                filterTab !== "low" && stats.lowStock > 0 ? "border-yellow-500/40 text-yellow-600 dark:text-yellow-400" : ""
              }`}
            >
              Low Stock Warning ({stats.lowStock})
            </Button>
            <Button 
              variant={filterTab === "out" ? "default" : "outline"} 
              size="sm" 
              onClick={() => setFilterTab("out")}
              className={`rounded-full text-xs ${
                filterTab !== "out" && stats.outOfStock > 0 ? "border-rose-500/40 text-rose-500 dark:text-rose-400" : ""
              }`}
            >
              Out of Stock ({stats.outOfStock})
            </Button>
          </div>

          <div className="relative flex-1 md:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              className="pl-9 text-xs" 
              placeholder="Search SKU, brand, model, name..." 
              value={q} 
              onChange={(e) => setQ(e.target.value)} 
            />
          </div>
        </div>

        {/* Product Stock Table */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-10">
            <Package className="h-10 w-10 mx-auto text-muted-foreground/45 mb-2" />
            <h3 className="font-semibold text-sm">No inventory items found</h3>
            <p className="text-xs text-muted-foreground">Adjust your filters or add items to products catalog.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b text-muted-foreground font-semibold bg-muted/20">
                  <th className="p-3">Product Name & Specifications</th>
                  <th className="p-3">Category</th>
                  <th className="p-3 hidden sm:table-cell">SKU / SN</th>
                  <th className="p-3 text-right">Cost Price / Sell Price</th>
                  <th className="p-3">Stock Level & Meter</th>
                  <th className="p-3 text-center">Adjust Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredProducts.map((p) => {
                  const isHighlighted = highlightedProductId === p.id;
                  const isOutOfStock = p.quantity === 0;
                  const isLowStock = p.quantity > 0 && p.quantity < 5;

                  return (
                    <tr 
                      key={p.id} 
                      className={`hover:bg-muted/30 transition-all duration-200 ${
                        isHighlighted ? "bg-primary/10 dark:bg-primary/25 border-l-4 border-l-primary scale-[1.002]" : ""
                      }`}
                    >
                      <td className="p-3">
                        <div>
                          <p className="font-bold text-foreground text-sm">{p.name}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {p.brandName} {p.modelName ? `· ${p.modelName}` : ""}
                          </p>
                        </div>
                      </td>

                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-muted font-medium text-muted-foreground text-[10px]">
                          {p.categoryName}
                        </span>
                      </td>

                      <td className="p-3 hidden sm:table-cell">
                        <div className="space-y-0.5 text-[10px] mono">
                          {p.sku && <div>SKU: {p.sku}</div>}
                          {p.serial && <div className="text-muted-foreground">SN: {p.serial}</div>}
                          {!p.sku && !p.serial && <span className="text-muted-foreground/60">—</span>}
                        </div>
                      </td>

                      <td className="p-3 text-right">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-foreground">${p.sellPriceNum.toFixed(2)}</p>
                          <p className="text-[10px] text-muted-foreground">Cost: ${p.costPriceNum.toFixed(2)}</p>
                        </div>
                      </td>

                      <td className="p-3">
                        <div className="space-y-1.5 max-w-[140px]">
                          <div className="flex justify-between items-center font-bold">
                            <span className={`${
                              isOutOfStock ? "text-rose-500 font-extrabold" :
                              isLowStock ? "text-amber-500" : "text-emerald-500"
                            }`}>
                              {p.quantity} Units
                            </span>
                            <span className="text-[9px] px-1 rounded bg-muted font-normal text-muted-foreground">
                              {isOutOfStock ? "OUT" : isLowStock ? "LOW" : "OK"}
                            </span>
                          </div>
                          
                          {/* Stock Level Bar Indicator */}
                          <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-300 ${
                                isOutOfStock ? "w-0" :
                                isLowStock ? "bg-amber-500" : "bg-emerald-500"
                              }`}
                              style={{ width: `${Math.min(100, (p.quantity / 20) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="p-3 text-center">
                        <div className="inline-flex items-center gap-1 bg-muted/65 border p-1 rounded-lg">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 rounded-md hover:bg-rose-500/20 hover:text-rose-500 shrink-0"
                            onClick={() => handleQuickAdjust(p.id, p.quantity, -1)}
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </Button>
                          <span className="w-8 font-bold text-center text-sm">{p.quantity}</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 rounded-md hover:bg-emerald-500/20 hover:text-emerald-500 shrink-0"
                            onClick={() => handleQuickAdjust(p.id, p.quantity, 1)}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
