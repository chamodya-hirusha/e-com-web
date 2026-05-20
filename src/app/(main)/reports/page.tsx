"use client";
 
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  BarChart3, 
  FileText, 
  PieChart, 
  TrendingUp, 
  Boxes, 
  CreditCard, 
  TrendingDown, 
  ShieldCheck,
  Loader2
} from "lucide-react";
 
export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Reports & Analytics</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Existing Cards */}
        <ReportCard reportType="daily_sales" title="Daily Sales Report" description="Summary of sales for today." icon={<BarChart3 className="h-6 w-6" />} />
        <ReportCard reportType="monthly_profit" title="Monthly Profit/Loss" description="Detailed profit and loss statement." icon={<TrendingUp className="h-6 w-6" />} />
        <ReportCard reportType="best_selling" title="Best Selling Products" description="Top products by sales volume." icon={<PieChart className="h-6 w-6" />} />
        <ReportCard reportType="expense_summary" title="Expense Summary" description="Breakdown of expenses by category." icon={<FileText className="h-6 w-6" />} />
        <ReportCard reportType="repair_income" title="Repair Income" description="Income generated from repairs." icon={<FileText className="h-6 w-6" />} />
        
        {/* New Cards */}
        <ReportCard reportType="inventory_valuation" title="Inventory Valuation Report" description="Total monetary value of current warehouse stock at cost and retail price." icon={<Boxes className="h-6 w-6" />} />
        <ReportCard reportType="supplier_outstanding" title="Supplier Outstanding Ledger" description="Summary of all pending credits and outstanding balances due to suppliers." icon={<CreditCard className="h-6 w-6" />} />
        <ReportCard reportType="dead_stock" title="Dead Stock & Slow-Moving Items" description="Identify products with zero sales activity to optimize cash flow." icon={<TrendingDown className="h-6 w-6" />} />
        <ReportCard reportType="warranty_liability" title="Warranty Liability Analytics" description="Track shop-guaranteed warranties versus original supplier coverage risks." icon={<ShieldCheck className="h-6 w-6" />} />
      </div>
    </div>
  );
}
 
interface ReportCardProps {
  reportType: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}
 
function ReportCard({ reportType, title, description, icon }: ReportCardProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/reports/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reportType }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Generation failed");
      }

      toast.success("Report compiled and archived successfully!", {
        description: `${result.reportTitle} archived at: ${result.filePath}`,
        duration: 6000,
      });
    } catch (err: any) {
      console.error(err);
      toast.error(`Failed to compile report: ${err.message || "Unknown error"}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="card-elevated p-5 flex flex-col justify-between h-40 hover:border-primary/20 transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className="p-2 bg-primary/10 rounded-lg text-primary">
          {icon}
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          disabled={isGenerating}
          onClick={handleGenerate}
          className="hover:bg-primary/5 hover:text-primary transition-all duration-300 flex items-center gap-1.5 text-xs font-medium"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <span>Generate</span>
          )}
        </Button>
      </div>
      <div className="space-y-1">
        <h3 className="font-semibold text-sm tracking-tight text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground leading-normal">{description}</p>
      </div>
    </div>
  );
}
