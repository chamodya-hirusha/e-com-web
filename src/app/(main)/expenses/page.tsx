"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useData } from "@/hooks/useData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  TrendingUp, TrendingDown, Activity, DollarSign, Plus, Search, Trash2, Pencil,
  Calendar, Building2, Tag, FileText, CheckCircle2, AlertTriangle, CreditCard,
  Banknote, Landmark, Eye, Download, ZoomIn, ZoomOut, X, Filter, ChevronDown,
  Check, ArrowUpDown, Wallet, Receipt, ChevronRight, Upload, Info
} from "lucide-react";
import { toast } from "sonner";
import localforage from "localforage";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import type { Expense, Invoice, Repair } from "@/db/types";

// Connect to the IndexedDB localforage instance for stock intakes
const stockIntakesStore = localforage.createInstance({
  name: "warranty-manager",
  storeName: "stock_intakes"
});

interface IntakeItem {
  id: string;
  brandName: string;
  modelName: string;
  categoryId: string;
  categoryName: string;
  serial: string;
  warrantyPeriod: string;
  customWarranty: string;
  costPrice: number | "";
  sellPrice: number | "";
  quantity: number;
}

interface StockIntake {
  id: string;
  timestamp: number;
  date: string;
  supplierId: string;
  supplierName: string;
  billPhoto: string;
  items: IntakeItem[];
  brandName: string;
  modelName: string;
  categoryName: string;
  serial: string;
  warrantyPeriod: string;
  costPrice: number;
  sellPrice: number;
  quantity: number;
  procurementDateTime?: string;
  invoiceId?: string;
  branchName?: string;
  warehouseLocation?: string;
  totalBillAmount?: number;
  advancePayment?: number;
  remainingBalance?: number;
  paymentMethod?: string;
  paymentStatus?: string;
  discrepancyNotes?: string;
}

const CATEGORIES = [
  "Rent",
  "Salaries",
  "Utilities",
  "Marketing",
  "Internet & Phone",
  "Repairs & Maintenance",
  "Inventory & Supplies",
  "Other"
];

const BRANCHES = [
  "All Branches",
  "Main Head Office",
  "Colombo Branch",
  "Kandy Branch",
  "Galle Branch"
];

const PAYMENT_METHODS = ["Cash", "Card", "Cheque"];

export default function ExpensesPage() {
  const { expenses, invoices, repairs, addExpense, updateExpense, deleteExpense, ready } = useData();

  // Selected filters
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedBranch, setSelectedBranch] = useState<string>("All Branches");

  // Stock intakes history from IndexedDB
  const [intakes, setIntakes] = useState<StockIntake[]>([]);
  const [loadingIntakes, setLoadingIntakes] = useState<boolean>(true);

  // Search filter inside sub-tables
  const [leftSearchQuery, setLeftSearchQuery] = useState("");
  const [rightSearchQuery, setRightSearchQuery] = useState("");

  // Sub-tabs for Left column
  const [leftTab, setLeftTab] = useState<"expenses" | "revenue">("expenses");

  // Expense Logger side-drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // Receipt Preview Lightbox Modal
  const [activeReceiptPhoto, setActiveReceiptPhoto] = useState<{ title: string; base64: string } | null>(null);

  // Purchasing Bill/Invoice Lightbox Modal
  const [activeIntakeLightbox, setActiveIntakeLightbox] = useState<StockIntake | null>(null);
  const [lightboxScale, setLightboxScale] = useState(1);

  // Delete confirmation
  const [confirmingDelete, setConfirmingDelete] = useState<Expense | null>(null);

  // Form Fields State
  const [expenseTitle, setExpenseTitle] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("Other");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().slice(0, 10));
  const [expensePaymentMethod, setExpensePaymentMethod] = useState("Cash");
  const [expenseBranch, setExpenseBranch] = useState("Main Head Office");
  const [expenseReceipt, setExpenseReceipt] = useState<string>("");

  // Read Stock Intakes on Mount/Update
  const loadStockIntakes = async () => {
    try {
      setLoadingIntakes(true);
      const dbItems: StockIntake[] = [];
      await stockIntakesStore.iterate<StockIntake, void>((value) => {
        // Sanitize legacy entries
        const items = value.items || [
          {
            id: `item-legacy-${value.id}`,
            brandName: value.brandName || "Unknown",
            modelName: value.modelName || "Item",
            categoryId: "",
            categoryName: value.categoryName || "Uncategorized",
            serial: value.serial || "N/A",
            warrantyPeriod: value.warrantyPeriod || "1 Year",
            customWarranty: "",
            costPrice: value.costPrice || 0,
            sellPrice: value.sellPrice || 0,
            quantity: value.quantity || 1
          }
        ];
        const totalBillAmount = value.totalBillAmount !== undefined ? value.totalBillAmount : (Number(value.costPrice || 0) * Number(value.quantity || 1));
        dbItems.push({
          ...value,
          items,
          totalBillAmount
        });
      });
      // Sort newest first
      dbItems.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      setIntakes(dbItems);
    } catch (err) {
      console.error("Failed to read stock intakes history", err);
    } finally {
      setLoadingIntakes(false);
    }
  };

  useEffect(() => {
    loadStockIntakes();
  }, [ready]);

  // Robust date/month helper to extract "YYYY-MM"
  const getIntakeMonth = (intake: StockIntake) => {
    if (intake.procurementDateTime) {
      return intake.procurementDateTime.slice(0, 7); // "YYYY-MM"
    }
    if (intake.timestamp) {
      try {
        return new Date(intake.timestamp).toISOString().slice(0, 7);
      } catch (e) {}
    }
    try {
      const d = new Date(intake.date);
      if (!isNaN(d.getTime())) {
        return d.toISOString().slice(0, 7);
      }
    } catch (e) {}
    return "";
  };

  // Compile all unique months in "YYYY-MM" format dynamically
  const uniqueMonths = useMemo(() => {
    const months = new Set<string>();
    
    // Add current month by default
    months.add(new Date().toISOString().slice(0, 7));

    expenses.forEach((e) => {
      if (e.date && e.date.length >= 7) months.add(e.date.slice(0, 7));
    });
    invoices.forEach((i) => {
      if (i.date && i.date.length >= 7) months.add(i.date.slice(0, 7));
    });
    repairs.forEach((r) => {
      if (r.deliveryDate && r.deliveryDate.length >= 7) {
        months.add(r.deliveryDate.slice(0, 7));
      } else if (r.receivedDate && r.receivedDate.length >= 7) {
        months.add(r.receivedDate.slice(0, 7));
      }
    });
    intakes.forEach((intake) => {
      const m = getIntakeMonth(intake);
      if (m) months.add(m);
    });

    return Array.from(months).sort((a, b) => b.localeCompare(a));
  }, [expenses, invoices, repairs, intakes]);

  // Set default month on dynamic options load
  useEffect(() => {
    if (uniqueMonths.length > 0 && !selectedMonth) {
      const current = new Date().toISOString().slice(0, 7);
      if (uniqueMonths.includes(current)) {
        setSelectedMonth(current);
      } else {
        setSelectedMonth(uniqueMonths[0]);
      }
    }
  }, [uniqueMonths, selectedMonth]);

  // Format month (e.g. "2026-05" -> "May 2026")
  const formatMonthLabel = (mString: string) => {
    if (!mString) return "";
    try {
      const [year, month] = mString.split("-");
      const d = new Date(Number(year), Number(month) - 1, 15);
      return d.toLocaleDateString("en-US", { year: "numeric", month: "long" });
    } catch (e) {
      return mString;
    }
  };

  // ============================================
  // FILTERS APPLICATION
  // ============================================

  // 1. Invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((i) => {
      const matchesMonth = i.date && i.date.startsWith(selectedMonth);
      const matchesBranch = selectedBranch === "All Branches" || (i as any).branchName === selectedBranch || (selectedBranch === "Main Head Office" && !(i as any).branchName);
      return matchesMonth && matchesBranch;
    });
  }, [invoices, selectedMonth, selectedBranch]);

  // 2. Repairs
  const filteredRepairs = useMemo(() => {
    return repairs.filter((r) => {
      const dateStr = r.deliveryDate || r.receivedDate || new Date(r.createdAt).toISOString().slice(0, 10);
      const matchesMonth = dateStr.startsWith(selectedMonth);
      const matchesBranch = selectedBranch === "All Branches" || (r as any).branchName === selectedBranch || (selectedBranch === "Main Head Office" && !(r as any).branchName);
      // Only completed or delivered repairs with costs represent finalized service income
      const hasCost = r.cost && parseFloat(r.cost.replace(/[^0-9.]/g, "")) > 0;
      return matchesMonth && matchesBranch && hasCost;
    });
  }, [repairs, selectedMonth, selectedBranch]);

  // 3. Procurement (Stock Intakes)
  const filteredIntakes = useMemo(() => {
    return intakes.filter((intake) => {
      const intakeMonth = getIntakeMonth(intake);
      const matchesMonth = intakeMonth === selectedMonth;
      const matchesBranch = selectedBranch === "All Branches" || intake.branchName === selectedBranch || (selectedBranch === "Main Head Office" && !intake.branchName);
      return matchesMonth && matchesBranch;
    });
  }, [intakes, selectedMonth, selectedBranch]);

  // 4. Operational Expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const matchesMonth = e.date && e.date.startsWith(selectedMonth);
      const matchesBranch = selectedBranch === "All Branches" || e.branchName === selectedBranch || (selectedBranch === "Main Head Office" && !e.branchName);
      return matchesMonth && matchesBranch;
    });
  }, [expenses, selectedMonth, selectedBranch]);

  // ============================================
  // FINANCIAL CALCULATIONS (LKR)
  // ============================================

  // Total Revenue (Client Invoices + Service Repairs)
  const totalRevenue = useMemo(() => {
    const invoiceSum = filteredInvoices.reduce((sum, curr) => sum + (curr.total || 0), 0);
    const repairSum = filteredRepairs.reduce((sum, curr) => {
      const val = parseFloat(curr.cost?.replace(/[^0-9.]/g, "") || "0") || 0;
      return sum + val;
    }, 0);
    return invoiceSum + repairSum;
  }, [filteredInvoices, filteredRepairs]);

  // Total Procurement Cost
  const totalProcurementCost = useMemo(() => {
    return filteredIntakes.reduce((sum, curr) => {
      return sum + (curr.totalBillAmount || 0);
    }, 0);
  }, [filteredIntakes]);

  // Total Operational Expenses
  const totalExpenses = useMemo(() => {
    return filteredExpenses.reduce((sum, curr) => sum + (curr.amount || 0), 0);
  }, [filteredExpenses]);

  // Net Profit / Loss
  const netProfit = totalRevenue - totalProcurementCost - totalExpenses;

  // Search filters applied to columns lists
  const searchedExpenses = useMemo(() => {
    return filteredExpenses.filter((e) => {
      const q = leftSearchQuery.toLowerCase();
      return (e.title || "").toLowerCase().includes(q) || (e.category || "").toLowerCase().includes(q) || (e.paymentMethod || "").toLowerCase().includes(q);
    });
  }, [filteredExpenses, leftSearchQuery]);

  const searchedIncomes = useMemo(() => {
    const q = leftSearchQuery.toLowerCase();
    const invs = filteredInvoices.filter((i) => {
      return (i.number || "").toLowerCase().includes(q) || (i.customerId || "").toLowerCase().includes(q);
    });
    const reps = filteredRepairs.filter((r) => {
      return (r.deviceName || "").toLowerCase().includes(q) || (r.problem || "").toLowerCase().includes(q);
    });
    return { invoices: invs, repairs: reps };
  }, [filteredInvoices, filteredRepairs, leftSearchQuery]);

  const searchedIntakes = useMemo(() => {
    const q = rightSearchQuery.toLowerCase();
    return filteredIntakes.filter((intake) => {
      return (intake.invoiceId || intake.id).toLowerCase().includes(q) ||
        (intake.supplierName || "").toLowerCase().includes(q) ||
        (intake.paymentMethod || "").toLowerCase().includes(q);
    });
  }, [filteredIntakes, rightSearchQuery]);

  // ============================================
  // EXPENSE HANDLERS
  // ============================================

  const handleOpenNewExpense = () => {
    setEditingExpense(null);
    setExpenseTitle("");
    setExpenseCategory("Utilities");
    setExpenseAmount("");
    setExpenseDate(new Date().toISOString().slice(0, 10));
    setExpensePaymentMethod("Cash");
    setExpenseBranch("Main Head Office");
    setExpenseReceipt("");
    setDrawerOpen(true);
  };

  const handleOpenEditExpense = (exp: Expense) => {
    setEditingExpense(exp);
    setExpenseTitle(exp.title);
    setExpenseCategory(exp.category);
    setExpenseAmount(exp.amount.toString());
    setExpenseDate(exp.date);
    setExpensePaymentMethod(exp.paymentMethod || "Cash");
    setExpenseBranch(exp.branchName || "Main Head Office");
    setExpenseReceipt(exp.receiptPhoto || "");
    setDrawerOpen(true);
  };

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Receipt image must be smaller than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setExpenseReceipt(reader.result as string);
      toast.success("Receipt image loaded successfully");
    };
    reader.readAsDataURL(file);
  };

  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();

    const amt = parseFloat(expenseAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.error("Please enter a valid amount greater than 0");
      return;
    }

    if (!expenseTitle.trim()) {
      toast.error("Please enter a description / title");
      return;
    }

    const payload = {
      title: expenseTitle.trim(),
      category: expenseCategory,
      amount: amt,
      date: expenseDate,
      paymentMethod: expensePaymentMethod,
      branchName: expenseBranch,
      receiptPhoto: expenseReceipt || undefined
    };

    try {
      if (editingExpense) {
        await updateExpense(editingExpense.id, payload);
        toast.success("Operational expense updated successfully");
      } else {
        await addExpense(payload);
        toast.success("Operational expense logged successfully");
      }
      setDrawerOpen(false);
    } catch (err) {
      toast.error("Failed to save operational expense");
    }
  };

  // Lightbox controllers
  const zoomIn = () => setLightboxScale(prev => Math.min(prev + 0.25, 3));
  const zoomOut = () => setLightboxScale(prev => Math.max(prev - 0.25, 0.5));
  const resetZoom = () => setLightboxScale(1);

  return (
    <div className="space-y-8 bg-slate-50/50 -m-6 p-6 min-h-screen">
      
      {/* Top Title & Quick Action bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 font-sans">
            Financial Analytics
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Centralized general ledger, operating expenses, procurement logs, and profitability tracking
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleOpenNewExpense}
            className="bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-sm transition-all duration-200 rounded-xl px-5 flex items-center gap-2"
          >
            <Plus className="h-4.5 w-4.5" /> Log Expense
          </Button>
        </div>
      </div>

      {/* FILTER CONTROL SECTION */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center gap-5 justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          {/* Month Selector */}
          <div className="space-y-1.5 flex-1 max-w-[280px]">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" /> Financial Period
            </Label>
            <div className="relative">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-3 text-sm font-medium focus:ring-2 focus:ring-slate-200 focus:outline-none appearance-none cursor-pointer text-slate-800"
              >
                {uniqueMonths.map((m) => (
                  <option key={m} value={m}>
                    {formatMonthLabel(m)}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Branch Selector */}
          <div className="space-y-1.5 flex-1 max-w-[280px]">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5" /> Receiving Location
            </Label>
            <div className="relative">
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-3 text-sm font-medium focus:ring-2 focus:ring-slate-200 focus:outline-none appearance-none cursor-pointer text-slate-800"
              >
                {BRANCHES.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Info label about filtering */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 max-w-[320px] self-start sm:self-center">
          <Info className="h-4.5 w-4.5 text-slate-500 shrink-0" />
          <p className="text-[11px] font-medium text-slate-500 leading-normal">
            Displaying metrics for <strong className="text-slate-800 font-semibold">{formatMonthLabel(selectedMonth)}</strong> at <strong className="text-slate-800 font-semibold">{selectedBranch}</strong>.
          </p>
        </div>
      </div>

      {/* EXECUTIVE KEY METRICS SUMMARY ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Revenue */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:border-slate-300 transition-all duration-300">
          <div className="absolute right-0 top-0 h-24 w-24 bg-emerald-500/5 rounded-full translate-x-6 -translate-y-6 group-hover:scale-110 transition-transform duration-300" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Revenue / Income</span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-[11px] font-medium text-slate-400">Monthly gross income</h3>
            <p className="text-2xl font-bold tracking-tight text-emerald-600 mt-1">
              LKR {totalRevenue.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <span>Invoices: {filteredInvoices.length}</span>
            <span className="text-slate-300">•</span>
            <span>Repairs: {filteredRepairs.length}</span>
          </div>
        </div>

        {/* Total Procurement */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:border-slate-300 transition-all duration-300">
          <div className="absolute right-0 top-0 h-24 w-24 bg-indigo-500/5 rounded-full translate-x-6 -translate-y-6 group-hover:scale-110 transition-transform duration-300" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Inventory Procurement</span>
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Activity className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-[11px] font-medium text-slate-400">Stock intake costs combined</h3>
            <p className="text-2xl font-bold tracking-tight text-slate-800 mt-1">
              LKR {totalProcurementCost.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <span>Orders Intake: {filteredIntakes.length}</span>
          </div>
        </div>

        {/* Operational Expenses */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:border-slate-300 transition-all duration-300">
          <div className="absolute right-0 top-0 h-24 w-24 bg-amber-500/5 rounded-full translate-x-6 -translate-y-6 group-hover:scale-110 transition-transform duration-300" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Operating Expenses</span>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <Wallet className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-[11px] font-medium text-slate-400">Rent, salaries, bills logged</h3>
            <p className="text-2xl font-bold tracking-tight text-amber-600 mt-1">
              LKR {totalExpenses.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <span>Operational Logs: {filteredExpenses.length}</span>
          </div>
        </div>

        {/* Net Profit Badge */}
        <div className={`rounded-2xl p-6 border-2 shadow-sm flex flex-col justify-between relative overflow-hidden group transition-all duration-300 ${
          netProfit >= 0
            ? "bg-emerald-50/20 border-emerald-500/20 hover:border-emerald-500/40"
            : "bg-red-50/20 border-red-500/20 hover:border-red-500/40"
        }`}>
          <div className={`absolute right-0 top-0 h-24 w-24 rounded-full translate-x-6 -translate-y-6 group-hover:scale-110 transition-transform duration-300 ${
            netProfit >= 0 ? "bg-emerald-500/5" : "bg-red-500/5"
          }`} />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Net Profit / Loss</span>
            <div className={`p-2.5 rounded-xl ${
              netProfit >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
            }`}>
              {netProfit >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-[11px] font-medium text-slate-400">Revenue - Intakes - Expenses</h3>
            <p className={`text-2xl font-extrabold tracking-tight mt-1 ${
              netProfit >= 0 ? "text-emerald-700" : "text-red-700"
            }`}>
              LKR {netProfit.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="mt-3 flex">
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
              netProfit >= 0 ? "bg-emerald-100/60 text-emerald-800" : "bg-red-100/60 text-red-800"
            }`}>
              {netProfit >= 0 ? "Surplus Profit" : "Net Loss"}
            </span>
          </div>
        </div>

      </div>

      {/* TWO-COLUMN FINANCIAL DETAIL LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: INCOME & EXPENSE BREAKDOWNS (8 Columns) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
            
            {/* Header with Segmented tabs and sub-search */}
            <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => { setLeftTab("expenses"); setLeftSearchQuery(""); }}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                    leftTab === "expenses"
                      ? "bg-white text-slate-800 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Operating Expenses ({filteredExpenses.length})
                </button>
                <button
                  onClick={() => { setLeftTab("revenue"); setLeftSearchQuery(""); }}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                    leftTab === "revenue"
                      ? "bg-white text-slate-800 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Client Income ({filteredInvoices.length + filteredRepairs.length})
                </button>
              </div>

              <div className="relative max-w-xs w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <Input
                  value={leftSearchQuery}
                  onChange={(e) => setLeftSearchQuery(e.target.value)}
                  className="pl-9 h-9.5 rounded-lg text-xs"
                  placeholder={leftTab === "expenses" ? "Search expenses..." : "Search sales/repairs..."}
                />
              </div>
            </div>

            {/* TAB CONTENT */}
            <div className="overflow-x-auto min-w-full">
              {leftTab === "expenses" ? (
                /* OPERATIONAL EXPENSES LOGS TABLE */
                searchedExpenses.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="inline-flex p-4 bg-slate-50 text-slate-400 rounded-full mb-3">
                      <Receipt className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-semibold text-slate-700">No operational expenses logged</p>
                    <p className="text-xs text-slate-400 mt-1">Log electricity, rent, wages, or other costs above.</p>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50/50">
                      <tr>
                        <th className="px-5 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Expense Item</th>
                        <th className="px-5 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Method & Location</th>
                        <th className="px-5 py-3 text-right text-[11px] font-bold text-slate-400 uppercase tracking-wider">Amount (LKR)</th>
                        <th className="px-5 py-3 text-right text-[11px] font-bold text-slate-400 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {searchedExpenses.map((exp) => (
                        <tr key={exp.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-5 py-3.5 whitespace-nowrap min-w-0">
                            <div className="flex items-center gap-3">
                              {exp.receiptPhoto ? (
                                <button
                                  onClick={() => setActiveReceiptPhoto({ title: exp.title, base64: exp.receiptPhoto! })}
                                  className="h-10 w-10 shrink-0 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 hover:opacity-85 transition-opacity relative group"
                                  title="Click to zoom receipt"
                                >
                                  <img src={exp.receiptPhoto} alt="Receipt" className="h-full w-full object-cover" />
                                  <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Eye className="h-3.5 w-3.5 text-white" />
                                  </div>
                                </button>
                              ) : (
                                <div className="h-10 w-10 shrink-0 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-400">
                                  <FileText className="h-4.5 w-4.5" />
                                </div>
                              )}
                              <div className="min-w-0">
                                <div className="font-semibold text-xs text-slate-800 truncate max-w-[180px]">{exp.title}</div>
                                <div className="flex items-center gap-2 mt-1 shrink-0">
                                  <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-medium border border-slate-200/50">
                                    {exp.category}
                                  </span>
                                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                    <Calendar className="h-3 w-3" /> {exp.date}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-slate-700 flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                                {exp.paymentMethod || "Cash"}
                              </span>
                              <span className="text-[10px] font-medium text-slate-400">
                                {exp.branchName || "Main Head Office"}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 whitespace-nowrap text-right font-bold text-xs text-red-500">
                            -LKR {exp.amount.toLocaleString("en-LK", { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-5 py-3.5 whitespace-nowrap text-right text-xs">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenEditExpense(exp)}
                                className="h-8 w-8 hover:bg-slate-100 text-slate-600 rounded-lg"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setConfirmingDelete(exp)}
                                className="h-8 w-8 hover:bg-red-50 text-red-500 rounded-lg"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
              ) : (
                /* INCOME STREAMS BREAKDOWN TABLE */
                (searchedIncomes.invoices.length === 0 && searchedIncomes.repairs.length === 0) ? (
                  <div className="p-12 text-center">
                    <div className="inline-flex p-4 bg-slate-50 text-slate-400 rounded-full mb-3">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-semibold text-slate-700">No client revenue logged</p>
                    <p className="text-xs text-slate-400 mt-1">Submit customer invoices or complete repairs for this month.</p>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50/50">
                      <tr>
                        <th className="px-5 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Revenue Source</th>
                        <th className="px-5 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Date & Status</th>
                        <th className="px-5 py-3 text-right text-[11px] font-bold text-slate-400 uppercase tracking-wider">Amount (LKR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      
                      {/* 1. Client Invoices (Product Sales) */}
                      {searchedIncomes.invoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center font-bold text-xs border border-emerald-100">
                                INV
                              </div>
                              <div>
                                <div className="font-semibold text-xs text-slate-800">
                                  Invoice: {inv.number}
                                </div>
                                <div className="text-[10px] text-slate-400 mt-0.5">
                                  Client ID: {inv.customerId}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-slate-600 flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-slate-400" /> {inv.date}
                              </span>
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-100/60 text-emerald-800 w-fit">
                                Product Sale
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 whitespace-nowrap text-right font-bold text-xs text-emerald-600">
                            +LKR {inv.total.toLocaleString("en-LK", { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}

                      {/* 2. Device Repairs */}
                      {searchedIncomes.repairs.map((rep) => {
                        const parsedCost = parseFloat(rep.cost?.replace(/[^0-9.]/g, "") || "0") || 0;
                        return (
                          <tr key={rep.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-5 py-3.5 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div className="h-9 w-9 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center font-bold text-xs border border-indigo-100">
                                  REP
                                </div>
                                <div>
                                  <div className="font-semibold text-xs text-slate-800">
                                    Repair: {rep.deviceName}
                                  </div>
                                  <div className="text-[10px] text-slate-400 mt-0.5">
                                    Issue: {rep.problem}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-3.5 whitespace-nowrap">
                              <div className="flex flex-col gap-1">
                                <span className="text-xs text-slate-600 flex items-center gap-1">
                                  <Calendar className="h-3 w-3 text-slate-400" /> {rep.deliveryDate || rep.receivedDate}
                                </span>
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold bg-indigo-100/60 text-indigo-800 w-fit">
                                  Service Repair
                                </span>
                              </div>
                            </td>
                            <td className="px-5 py-3.5 whitespace-nowrap text-right font-bold text-xs text-emerald-600">
                              +LKR {parsedCost.toLocaleString("en-LK", { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        );
                      })}

                    </tbody>
                  </table>
                )
              )}
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: SUPPLIER PURCHASING HISTORY LEDGER (5 Columns) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
            
            {/* Header & Search */}
            <div className="p-5 border-b border-slate-200 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Supplier Procurement logs</h3>
                <p className="text-xs text-slate-400 mt-0.5">Inventory stock intakes in this selected month</p>
              </div>

              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <Input
                  value={rightSearchQuery}
                  onChange={(e) => setRightSearchQuery(e.target.value)}
                  className="pl-9 h-9.5 rounded-lg text-xs"
                  placeholder="Search supplier, invoices..."
                />
              </div>
            </div>

            {/* Procurement Ledger Table */}
            <div className="overflow-x-auto min-w-full">
              {loadingIntakes ? (
                <div className="p-8 text-center text-xs text-slate-400">Loading procurement costs...</div>
              ) : searchedIntakes.length === 0 ? (
                <div className="p-10 text-center">
                  <div className="inline-flex p-3 bg-slate-50 text-slate-400 rounded-full mb-2">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-semibold text-slate-700">No procurement logs found</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">No purchases are registered for this filter.</p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Intake / Supplier</th>
                      <th className="px-4 py-3 text-right text-[10px] font-bold text-slate-400 uppercase tracking-wider">Qty & Total</th>
                      <th className="px-4 py-3 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status & View</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {searchedIntakes.map((intake) => (
                      <tr key={intake.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap min-w-0">
                          <div className="flex flex-col gap-1 min-w-0">
                            <span className="text-xs font-bold text-slate-800 truncate max-w-[130px]" title={intake.invoiceId || intake.id}>
                              #{intake.invoiceId || "Stock Intake"}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium truncate max-w-[130px]">
                              {intake.supplierName}
                            </span>
                            <span className="text-[9px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <Calendar className="h-2.5 w-2.5" /> {intake.date}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-bold text-slate-800">
                              LKR {(intake.totalBillAmount || 0).toLocaleString("en-LK")}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {intake.items.reduce((sum, item) => sum + (item.quantity || 0), 0)} items total
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex flex-col items-center gap-1.5">
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                              intake.paymentStatus === "Fully Paid"
                                ? "bg-emerald-100 text-emerald-800"
                                : intake.paymentStatus === "Partially Paid"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-red-100 text-red-800"
                            }`}>
                              {intake.paymentStatus || "Credit"}
                            </span>

                            <button
                              onClick={() => {
                                setLightboxScale(1);
                                setActiveIntakeLightbox(intake);
                              }}
                              className="text-[10px] font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
                            >
                              <Eye className="h-3 w-3" /> Details
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

          </div>
        </div>

      </div>

      {/* QUICK EXPENSE DRAWER / OVERLAY MODAL */}
      <Dialog open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl p-6 bg-white overflow-y-auto max-h-[92vh]">
          <DialogHeader className="border-b border-slate-100 pb-3 flex flex-row items-center justify-between">
            <DialogTitle className="text-lg font-bold text-slate-800">
              {editingExpense ? "Edit Operational Expense" : "Log Operational Expense"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveExpense} className="space-y-4 py-3">
            
            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="exp-title" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Title / Description
              </Label>
              <Input
                id="exp-title"
                value={expenseTitle}
                onChange={(e) => setExpenseTitle(e.target.value)}
                placeholder="e.g. Electric bill - May 2026"
                className="rounded-xl h-11 border-slate-200 focus:ring-slate-300"
              />
            </div>

            {/* Category & Branch (Two Columns) */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="exp-cat" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Category
                </Label>
                <div className="relative">
                  <select
                    id="exp-cat"
                    value={expenseCategory}
                    onChange={(e) => setExpenseCategory(e.target.value)}
                    className="w-full h-11 bg-transparent border border-slate-200 rounded-xl px-3 text-sm font-medium focus:ring-2 focus:ring-slate-200 focus:outline-none appearance-none cursor-pointer text-slate-800"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="exp-branch" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Receiving Branch
                </Label>
                <div className="relative">
                  <select
                    id="exp-branch"
                    value={expenseBranch}
                    onChange={(e) => setExpenseBranch(e.target.value)}
                    className="w-full h-11 bg-transparent border border-slate-200 rounded-xl px-3 text-sm font-medium focus:ring-2 focus:ring-slate-200 focus:outline-none appearance-none cursor-pointer text-slate-800"
                  >
                    {BRANCHES.filter(b => b !== "All Branches").map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Amount & Date (Two Columns) */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="exp-amount" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Amount (LKR)
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="exp-amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    className="pl-9 rounded-xl h-11 border-slate-200 focus:ring-slate-300"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="exp-date" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Expense Date
                </Label>
                <Input
                  id="exp-date"
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  className="rounded-xl h-11 border-slate-200 focus:ring-slate-300 text-slate-800"
                />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Payment Method
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {PAYMENT_METHODS.map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setExpensePaymentMethod(method)}
                    className={`h-11 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      expensePaymentMethod === method
                        ? "bg-slate-900 border-slate-900 text-white shadow-sm"
                        : "bg-transparent border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {method === "Cash" && <Banknote className="h-4 w-4" />}
                    {method === "Card" && <CreditCard className="h-4 w-4" />}
                    {method === "Cheque" && <Landmark className="h-4 w-4" />}
                    {method}
                  </button>
                ))}
              </div>
            </div>

            {/* File Receipt Upload Area */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Expense Receipt / Bill Photo
              </Label>
              
              {expenseReceipt ? (
                /* Uploaded Preview State */
                <div className="relative rounded-xl border border-slate-200 overflow-hidden h-36 bg-slate-50 flex items-center justify-center">
                  <img src={expenseReceipt} alt="Receipt Preview" className="h-full w-full object-contain" />
                  <div className="absolute inset-0 bg-black/35 flex items-center justify-center gap-2 opacity-0 hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => setActiveReceiptPhoto({ title: expenseTitle || "Receipt", base64: expenseReceipt })}
                      className="p-2 bg-white/95 rounded-lg text-slate-700 hover:bg-white"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setExpenseReceipt("")}
                      className="p-2 bg-red-600/95 rounded-lg text-white hover:bg-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Drag & Drop Upload trigger */
                <label className="border-2 border-dashed border-slate-200 hover:border-slate-300 cursor-pointer rounded-xl h-28 flex flex-col items-center justify-center gap-2 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <Upload className="h-5 w-5 text-slate-400" />
                  <div className="text-[11px] font-semibold text-slate-600">Click to upload receipt image</div>
                  <div className="text-[9px] text-slate-400">PNG, JPG up to 2MB</div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleReceiptUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <DialogFooter className="pt-3 border-t border-slate-100 flex flex-row items-center justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setDrawerOpen(false)}
                className="h-11 rounded-xl text-xs font-semibold px-4"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="h-11 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white px-5 shadow-sm"
              >
                {editingExpense ? "Save changes" : "Confirm log"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* CONFIRM EXPENSE DELETE DIALOG */}
      <ConfirmDialog
        open={!!confirmingDelete}
        onOpenChange={(v) => !v && setConfirmingDelete(null)}
        title={`Delete expense: "${confirmingDelete?.title}"?`}
        description="This operational expense will be permanently deleted from the ERP ledger."
        onConfirm={async () => {
          if (confirmingDelete) {
            await deleteExpense(confirmingDelete.id);
            toast.success("Expense permanently deleted");
          }
          setConfirmingDelete(null);
        }}
      />

      {/* RECEIPT LIGHTBOX POPUP */}
      <Dialog open={!!activeReceiptPhoto} onOpenChange={(v) => !v && setActiveReceiptPhoto(null)}>
        <DialogContent className="max-w-2xl bg-zinc-950 text-white rounded-2xl border-none p-0 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4.5 w-4.5 text-slate-400" />
              <span className="text-xs font-bold truncate max-w-sm">{activeReceiptPhoto?.title}</span>
            </div>
            <button
              onClick={() => setActiveReceiptPhoto(null)}
              className="p-1 bg-zinc-800 hover:bg-zinc-700 text-slate-300 rounded-lg"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 min-h-[450px] bg-zinc-900 flex items-center justify-center p-4">
            {activeReceiptPhoto && (
              <img src={activeReceiptPhoto.base64} alt="Receipt zoom" className="max-h-[70vh] object-contain rounded-lg" />
            )}
          </div>
          <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between">
            <span className="text-[10px] text-zinc-500">Attachment stored securely in secure local IndexedDB node</span>
            <a
              href={activeReceiptPhoto?.base64}
              download={`${activeReceiptPhoto?.title.toLowerCase().replace(/\s+/g, "-")}-receipt.png`}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Download className="h-3.5 w-3.5" /> Download receipt
            </a>
          </div>
        </DialogContent>
      </Dialog>

      {/* INTAKE / SUPPLIER BILL LIGHTBOX MODAL */}
      <Dialog open={!!activeIntakeLightbox} onOpenChange={(v) => !v && setActiveIntakeLightbox(null)}>
        <DialogContent className="max-w-4xl bg-white text-slate-800 rounded-2xl border-none p-0 overflow-hidden flex flex-col max-h-[92vh]">
          {activeIntakeLightbox && (
            <div className="flex flex-col h-[92vh] max-h-[92vh]">
              {/* Header */}
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                    Procurement ID: #{activeIntakeLightbox.invoiceId || activeIntakeLightbox.id}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">| {activeIntakeLightbox.supplierName}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Button variant="ghost" size="icon" onClick={zoomOut} className="h-8.5 w-8.5 rounded-lg">
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={zoomIn} className="h-8.5 w-8.5 rounded-lg">
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={resetZoom} className="h-8.5 w-8.5 text-xs rounded-lg px-2 w-auto">
                    Reset
                  </Button>
                  <button
                    onClick={() => setActiveIntakeLightbox(null)}
                    className="p-1.5 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors ml-1"
                  >
                    <X className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>

              {/* Lightbox Split Grid */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 overflow-hidden min-h-0">
                
                {/* Left Section: Bill/Invoice Preview */}
                <div className="bg-zinc-950 flex flex-col overflow-hidden relative border-r border-slate-200 h-full">
                  <div className="p-3 bg-zinc-900 text-white/70 text-[10px] font-bold tracking-wider uppercase shrink-0 flex items-center justify-between">
                    <span>Uploaded Bill document / Invoice</span>
                    <a
                      href={activeIntakeLightbox.billPhoto}
                      download={`bill-intake-${activeIntakeLightbox.invoiceId || activeIntakeLightbox.id}.svg`}
                      className="text-white hover:text-white/80 flex items-center gap-1"
                    >
                      <Download className="h-3 w-3" /> Download SVG
                    </a>
                  </div>
                  <div className="flex-1 overflow-auto flex items-center justify-center p-6 bg-zinc-900">
                    <div
                      style={{ transform: `scale(${lightboxScale})`, transformOrigin: "center center" }}
                      className="transition-transform duration-150 ease-out max-w-full bg-white rounded-lg shadow-2xl p-2"
                    >
                      <img
                        src={activeIntakeLightbox.billPhoto}
                        alt="Bill Intake"
                        className="max-h-[60vh] object-contain mx-auto"
                      />
                    </div>
                  </div>
                </div>

                {/* Right Section: Comprehensive Asset Details */}
                <div className="flex flex-col overflow-y-auto h-full p-6 space-y-6">
                  
                  {/* Header info */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Intake overview</h4>
                    <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                      {activeIntakeLightbox.supplierName}
                    </h2>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-800">
                        <Building2 className="h-3 w-3" /> {activeIntakeLightbox.branchName || "Main Head Office"}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        activeIntakeLightbox.paymentStatus === "Fully Paid"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}>
                        {activeIntakeLightbox.paymentStatus || "Credit"}
                      </span>
                    </div>
                  </div>

                  {/* Procurement Details */}
                  <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4.5 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Invoice ID</span>
                        <p className="text-xs font-semibold text-slate-800 mt-0.5">
                          {activeIntakeLightbox.invoiceId || "N/A"}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Procured Date & Time</span>
                        <p className="text-xs font-semibold text-slate-800 mt-0.5">
                          {activeIntakeLightbox.procurementDateTime ? activeIntakeLightbox.procurementDateTime.replace("T", " ") : activeIntakeLightbox.date}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-200/50">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Payment Method</span>
                        <p className="text-xs font-semibold text-slate-800 mt-0.5">
                          {activeIntakeLightbox.paymentMethod || "Bank Transfer"}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Warehouse location</span>
                        <p className="text-xs font-semibold text-slate-800 mt-0.5">
                          {activeIntakeLightbox.warehouseLocation || "Main Headquarters (HQ)"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Items Breakdown list */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Purchased Items Breakdown</h3>
                    <div className="border border-slate-200 rounded-xl overflow-hidden overflow-x-auto min-w-full">
                      <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="px-3.5 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Product Name</th>
                            <th className="px-3.5 py-2.5 text-right text-[10px] font-bold text-slate-400 uppercase tracking-wider">Qty</th>
                            <th className="px-3.5 py-2.5 text-right text-[10px] font-bold text-slate-400 uppercase tracking-wider">Unit Cost</th>
                            <th className="px-3.5 py-2.5 text-right text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {activeIntakeLightbox.items.map((item) => {
                            const cost = Number(item.costPrice || 0);
                            const total = cost * (item.quantity || 0);
                            return (
                              <tr key={item.id}>
                                <td className="px-3.5 py-2.5 whitespace-nowrap">
                                  <div className="text-xs font-bold text-slate-800">
                                    {item.brandName} {item.modelName}
                                  </div>
                                  <div className="text-[9px] text-slate-400 mt-0.5">
                                    S/N: {item.serial} · {item.categoryName}
                                  </div>
                                </td>
                                <td className="px-3.5 py-2.5 text-right text-xs font-semibold text-slate-800">
                                  {item.quantity}
                                </td>
                                <td className="px-3.5 py-2.5 text-right text-xs font-semibold text-slate-800">
                                  LKR {cost.toLocaleString("en-LK")}
                                </td>
                                <td className="px-3.5 py-2.5 text-right text-xs font-bold text-slate-900">
                                  LKR {total.toLocaleString("en-LK")}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Financial calculation totals breakdown */}
                  <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4.5 space-y-2.5 mt-auto">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                      <span>Total Procurement Bill</span>
                      <span className="text-slate-800">LKR {(activeIntakeLightbox.totalBillAmount || 0).toLocaleString("en-LK", { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                      <span>Advance Amount Paid</span>
                      <span className="text-emerald-600 font-semibold">-LKR {(activeIntakeLightbox.advancePayment || 0).toLocaleString("en-LK", { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="h-px bg-slate-200 my-1.5" />
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-800">Remaining Balance Due</span>
                      <span className={`${(activeIntakeLightbox.remainingBalance || 0) > 0 ? "text-amber-600" : "text-slate-800"}`}>
                        LKR {(activeIntakeLightbox.remainingBalance || 0).toLocaleString("en-LK", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
