"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Search,
  Truck,
  Pencil,
  Trash2,
  Building2,
  DollarSign,
  Calendar,
  FileText,
  UploadCloud,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  ExternalLink,
  Eye,
  Download,
  CheckCircle2,
  Loader2,
  User,
  Mail,
  Phone,
  Briefcase,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { useData } from "@/hooks/useData";
import { SupplierDialog } from "@/components/SupplierDialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import type { Supplier } from "@/db/types";
import { toast } from "sonner";

// High-fidelity pre-populated ERP datasets mapped to Supplier Name/Company
const MOCK_SUPPLIER_METRICS: Record<string, {
  volume: string;
  outstanding: string;
  terms: string;
  activeContracts: number;
  activity: Array<{ id: string; date: string; type: string; title: string; desc: string }>;
  products: Array<{ id: string; date: string; name: string; sku: string; qty: number; price: number; warranty: "uploaded" | "missing" | "expired" }>;
  bills: Record<string, Array<{ id: string; date: string; amount: number; invoice: boolean; receipt: boolean; note: boolean }>>;
}> = {
  default: {
    volume: "$182,450",
    outstanding: "$14,200",
    terms: "Net 30",
    activeContracts: 2,
    activity: [
      { id: "a1", date: "May 18, 2026", type: "contract", title: "Contract Agreement Signed", desc: "Annual procurement contract finalized by Legal." },
      { id: "a2", date: "May 12, 2026", type: "payment", title: "Batch Bill Settlement", desc: "Cleared outstanding invoices for April 2026 batches." },
      { id: "a3", date: "May 04, 2026", type: "procurement", title: "New Inventory Intake", desc: "Successfully logged 120 units of wireless parts." },
      { id: "a4", date: "Apr 28, 2026", type: "document", title: "Warranty Certificate Uploaded", desc: "Assigned warranty cert to batch SKU-9082." }
    ],
    products: [
      { id: "p1", date: "2026-05-04", name: "Premium Wireless Receivers", sku: "SKU-9082", qty: 120, price: 85, warranty: "uploaded" },
      { id: "p2", date: "2026-04-15", name: "Hi-Fi Audio DAC Boards", sku: "SKU-4401", qty: 85, price: 120, warranty: "missing" },
      { id: "p3", date: "2026-03-10", name: "Amplifier Housing Enclosures", sku: "SKU-3112", qty: 200, price: 45, warranty: "uploaded" },
      { id: "p4", date: "2026-02-18", name: "Fiber Optic Terminals v2", sku: "SKU-1090", qty: 50, price: 210, warranty: "expired" },
      { id: "p5", date: "2026-01-22", name: "Bluetooth Shielding Plates", sku: "SKU-7723", qty: 350, price: 15, warranty: "uploaded" }
    ],
    bills: {
      "May 2026": [
        { id: "b1", date: "May 14, 2026", amount: 10200, invoice: true, receipt: true, note: true },
        { id: "b2", date: "May 05, 2026", amount: 4500, invoice: true, receipt: false, note: true }
      ],
      "April 2026": [
        { id: "b3", date: "Apr 20, 2026", amount: 15400, invoice: true, receipt: true, note: true },
        { id: "b4", date: "Apr 02, 2026", amount: 9800, invoice: true, receipt: true, note: false }
      ],
      "March 2026": [
        { id: "b5", date: "Mar 15, 2026", amount: 22000, invoice: true, receipt: true, note: true }
      ]
    }
  }
};

export default function SuppliersPage() {
  const { suppliers, deleteSupplier } = useData();
  const [q, setQ] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [activeTab, setActiveTab] = useState<"procurement" | "bills" | "erp">("procurement");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [confirming, setConfirming] = useState<Supplier | null>(null);

  // States for uploading animations
  const [uploadingWarrantyId, setUploadingWarrantyId] = useState<string | null>(null);
  const [uploadedWarranties, setUploadedWarranties] = useState<Record<string, boolean>>({});

  // States for monthly accordions
  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>({ "May 2026": true });

  // Bill management uploads states
  const [billInvoiceFile, setBillInvoiceFile] = useState<string | null>(null);
  const [billReceiptFile, setBillReceiptFile] = useState<string | null>(null);
  const [billNoteFile, setBillNoteFile] = useState<string | null>(null);
  const [billAmount, setBillAmount] = useState("");
  const [billMonth, setBillMonth] = useState("May 2026");
  const [isUploadingBill, setIsUploadingBill] = useState(false);

  // ERP actions form states
  const [intakeCategory, setIntakeCategory] = useState("electronics");
  const [paymentTerms, setPaymentTerms] = useState("Net 30");
  const [taxId, setTaxId] = useState("");
  const [contractFile, setContractFile] = useState<string | null>(null);
  const [isSubmittingERP, setIsSubmittingERP] = useState(false);

  // Active supplier history data
  const [supplierActivity, setSupplierActivity] = useState<any[]>(MOCK_SUPPLIER_METRICS.default.activity);
  const [supplierProducts, setSupplierProducts] = useState<any[]>(MOCK_SUPPLIER_METRICS.default.products);
  const [supplierBills, setSupplierBills] = useState<Record<string, any[]>>(MOCK_SUPPLIER_METRICS.default.bills);

  const filtered = suppliers.filter((s) =>
    [s.name, s.company, s.phone, s.email].some((v) => v?.toLowerCase().includes(q.toLowerCase()))
  );

  // Set default selected supplier when data loads
  useEffect(() => {
    if (suppliers.length > 0 && !selectedSupplier) {
      setSelectedSupplier(suppliers[0]);
    }
  }, [suppliers, selectedSupplier]);

  const toggleMonth = (month: string) => {
    setExpandedMonths((prev) => ({ ...prev, [month]: !prev[month] }));
  };

  // Simulate premium warranty upload progress
  const handleWarrantyUpload = (productId: string) => {
    setUploadingWarrantyId(productId);
    setTimeout(() => {
      setUploadingWarrantyId(null);
      setUploadedWarranties((prev) => ({ ...prev, [productId]: true }));
      setSupplierProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, warranty: "uploaded" } : p))
      );
      
      // Update activity logs dynamically
      const newActivity = {
        id: `a_dyn_${Date.now()}`,
        date: "Today",
        type: "document",
        title: "Warranty Certificate Uploaded",
        desc: `New digital certificate registered for product ID ${productId}.`
      };
      setSupplierActivity((prev) => [newActivity, ...prev]);
      toast.success("Warranty certificate uploaded successfully!");
    }, 1500);
  };

  // Simulate premium multiple asset bill uploads
  const handleBillAssetUpload = (type: "invoice" | "receipt" | "note") => {
    const assetNames = {
      invoice: "Invoice_PDF_5521.pdf",
      receipt: "Payment_Receipt_992.png",
      note: "Delivery_Note_8091.pdf"
    };

    toast.info(`Uploading ${type}...`);
    setTimeout(() => {
      if (type === "invoice") setBillInvoiceFile(assetNames.invoice);
      if (type === "receipt") setBillReceiptFile(assetNames.receipt);
      if (type === "note") setBillNoteFile(assetNames.note);
      toast.success(`${type.toUpperCase()} asset attached!`);
    }, 800);
  };

  const handleBillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!billAmount || isNaN(Number(billAmount))) {
      toast.error("Please enter a valid bill amount.");
      return;
    }
    if (!billInvoiceFile && !billReceiptFile && !billNoteFile) {
      toast.error("Please attach at least one document asset.");
      return;
    }

    setIsUploadingBill(true);
    setTimeout(() => {
      const newBill = {
        id: `b_dyn_${Date.now()}`,
        date: "Today",
        amount: Number(billAmount),
        invoice: !!billInvoiceFile,
        receipt: !!billReceiptFile,
        note: !!billNoteFile,
      };

      setSupplierBills((prev) => {
        const monthBills = prev[billMonth] || [];
        return {
          ...prev,
          [billMonth]: [newBill, ...monthBills],
        };
      });

      // Update activity timeline
      const newActivity = {
        id: `a_dyn_${Date.now()}`,
        date: "Today",
        type: "payment",
        title: "New Supplier Bill Logged",
        desc: `A bill of $${Number(billAmount).toLocaleString()} was archived under ${billMonth}.`
      };
      setSupplierActivity((prev) => [newActivity, ...prev]);

      // Reset Form State
      setBillAmount("");
      setBillInvoiceFile(null);
      setBillReceiptFile(null);
      setBillNoteFile(null);
      setIsUploadingBill(false);
      toast.success("Supplier transaction bills logged successfully!");
    }, 1800);
  };

  // Handle core ERP logistics log submit
  const handleERPSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taxId) {
      toast.error("Please provide the Supplier Tax/VAT Registration ID.");
      return;
    }

    setIsSubmittingERP(true);
    setTimeout(() => {
      // Update activity log with ERP submission
      const newActivity = {
        id: `a_dyn_${Date.now()}`,
        date: "Today",
        type: "contract",
        title: "ERP Supplier Registry Updated",
        desc: `Terms updated to ${paymentTerms}. Tax ID: ${taxId} confirmed.`
      };
      setSupplierActivity((prev) => [newActivity, ...prev]);

      setIsSubmittingERP(false);
      setContractFile(null);
      setTaxId("");
      toast.success("ERP logistics profiles and logs saved!");
    }, 1600);
  };

  const handleContractUpload = () => {
    toast.info("Uploading Procurement Contract...");
    setTimeout(() => {
      setContractFile("Procurement_Agreement_2026.pdf");
      toast.success("Contract file attached!");
    }, 1000);
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 items-stretch h-[calc(100vh-140px)] overflow-hidden no-scrollbar">
      
      {/* ==========================================
          LEFT PANE: SUPPLIER NAVIGATOR
         ========================================== */}
      <div className="w-full xl:w-80 flex flex-col shrink-0 card-elevated bg-card border border-slate-100/80 dark:border-slate-800/80 p-4 h-[300px] xl:h-full overflow-hidden shadow-sm">
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h2 className="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
            <Truck className="h-4.5 w-4.5 text-primary" /> Suppliers
          </h2>
          <Button size="sm" className="h-8 rounded-lg px-2.5 text-xs font-semibold" onClick={() => { setEditing(null); setOpen(true); }}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Add
          </Button>
        </div>

        <div className="relative mb-3 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/80" />
          <Input 
            className="pl-8.5 h-9 text-xs rounded-lg border-slate-100 bg-slate-50/50 dark:bg-slate-900/50 dark:border-slate-800" 
            placeholder="Search suppliers..." 
            value={q} 
            onChange={(e) => setQ(e.target.value)} 
          />
        </div>

        {/* Scrollable list zone */}
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-2">
          {filtered.length === 0 ? (
            <div className="py-6 text-center">
              <Truck className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground font-medium">No suppliers registered</p>
            </div>
          ) : (
            filtered.map((s) => {
              const isSelected = selectedSupplier?.id === s.id;
              return (
                <div
                  key={s.id}
                  onClick={() => setSelectedSupplier(s)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? "border-primary/25 bg-slate-50/70 dark:bg-slate-900/40 shadow-sm"
                      : "border-slate-100/60 dark:border-slate-800/30 bg-transparent hover:bg-slate-50/30 dark:hover:bg-slate-900/10"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-sm text-foreground truncate">{s.company}</p>
                      <p className="text-xs text-muted-foreground/80 mt-0.5 truncate flex items-center gap-1.5">
                        <User className="h-3 w-3" /> {s.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1 truncate">
                        {s.phone}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1 shrink-0 opacity-40 hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 rounded-lg" 
                        onClick={(e) => { e.stopPropagation(); setEditing(s); setOpen(true); }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 rounded-lg text-destructive" 
                        onClick={(e) => { e.stopPropagation(); setConfirming(s); }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ==========================================
          RIGHT PANE: SUPPLIER ERP WORKSPACE
         ========================================== */}
      {selectedSupplier ? (
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto no-scrollbar h-full pr-1">
          
          {/* PROFILE CARD & SUMMARY */}
          <div className="card-elevated border border-slate-100/80 dark:border-slate-800/80 bg-card p-6 shadow-sm shrink-0">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
              
              {/* Profile Details */}
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center shrink-0 shadow-inner">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/5 px-2.5 py-0.5 rounded-full">
                    Supplier Profile
                  </span>
                  <h1 className="text-xl font-bold tracking-tight text-foreground mt-1.5">{selectedSupplier.company}</h1>
                  <p className="text-xs text-muted-foreground mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="flex items-center gap-1"><User className="h-3.5 w-3.5 text-slate-400" /> {selectedSupplier.name}</span>
                    {selectedSupplier.email && <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5 text-slate-400" /> {selectedSupplier.email}</span>}
                    <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5 text-slate-400" /> {selectedSupplier.phone}</span>
                  </p>
                </div>
              </div>

              {/* ERP Metrics Grid */}
              <div className="grid grid-cols-3 gap-3 w-full lg:w-auto shrink-0">
                <div className="bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100/80 dark:border-slate-800/85 p-3.5 rounded-xl text-center min-w-[100px] lg:min-w-[125px]">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/80">Business Volume</p>
                  <p className="text-lg font-bold text-foreground mt-1 tracking-tight">{MOCK_SUPPLIER_METRICS.default.volume}</p>
                </div>
                <div className="bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100/80 dark:border-slate-800/85 p-3.5 rounded-xl text-center min-w-[100px] lg:min-w-[125px]">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/80 text-amber-600 dark:text-amber-400">Outstanding</p>
                  <p className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-1 tracking-tight">{MOCK_SUPPLIER_METRICS.default.outstanding}</p>
                </div>
                <div className="bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100/80 dark:border-slate-800/85 p-3.5 rounded-xl text-center min-w-[100px] lg:min-w-[125px]">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/80">Contract Terms</p>
                  <p className="text-lg font-bold text-foreground mt-1 tracking-tight">{MOCK_SUPPLIER_METRICS.default.terms}</p>
                </div>
              </div>
            </div>

            {/* Timeline Recent Activity Logs */}
            <div className="mt-6 pt-5 border-t border-slate-100/80 dark:border-slate-800/80">
              <h3 className="text-xs font-bold tracking-wider uppercase text-muted-foreground/85 mb-3.5 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" /> Recent Activity Timeline
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {supplierActivity.map((act) => (
                  <div key={act.id} className="relative pl-4 border-l-2 border-slate-100 dark:border-slate-800">
                    <span className="absolute left-[-5px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary shadow-sm" />
                    <span className="text-[9px] font-semibold text-muted-foreground/60">{act.date}</span>
                    <h4 className="text-xs font-bold text-foreground truncate mt-0.5">{act.title}</h4>
                    <p className="text-[11px] text-muted-foreground/80 mt-1 line-clamp-2 leading-relaxed">{act.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* DYNAMIC TABS WORKSPACE */}
          <div className="flex flex-col flex-1 shrink-0 h-auto">
            
            {/* Tab Triggers */}
            <div className="flex border-b border-slate-100 dark:border-slate-800 mb-6 shrink-0 gap-6">
              <button
                onClick={() => setActiveTab("procurement")}
                className={`pb-3 text-xs font-bold tracking-wider uppercase transition-all relative ${
                  activeTab === "procurement" 
                    ? "text-primary border-b-2 border-primary" 
                    : "text-muted-foreground/70 hover:text-foreground"
                }`}
              >
                Procurement & Warranties
              </button>
              <button
                onClick={() => setActiveTab("bills")}
                className={`pb-3 text-xs font-bold tracking-wider uppercase transition-all relative ${
                  activeTab === "bills" 
                    ? "text-primary border-b-2 border-primary" 
                    : "text-muted-foreground/70 hover:text-foreground"
                }`}
              >
                Bill Management
              </button>
              <button
                onClick={() => setActiveTab("erp")}
                className={`pb-3 text-xs font-bold tracking-wider uppercase transition-all relative ${
                  activeTab === "erp" 
                    ? "text-primary border-b-2 border-primary" 
                    : "text-muted-foreground/70 hover:text-foreground"
                }`}
              >
                ERP Logistics & Log Form
              </button>
            </div>

            {/* TAB CONTENT: PROCUREMENT & WARRANTIES */}
            {activeTab === "procurement" && (
              <div className="card-elevated border border-slate-100/80 dark:border-slate-800/80 bg-card p-6 shadow-sm animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-bold tracking-tight text-foreground">Procured Products Registry</h2>
                    <p className="text-xs text-muted-foreground/80 mt-0.5">Catalog of items supplied along with digital warranty certificates</p>
                  </div>
                  <Button variant="outline" size="sm" className="h-8.5 text-xs font-semibold gap-1.5 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900">
                    <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-500" /> Export Sheet
                  </Button>
                </div>

                <div className="overflow-x-auto no-scrollbar border rounded-xl border-slate-100 dark:border-slate-850">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="bg-slate-50/50 dark:bg-slate-900/30 border-b text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                        <th className="py-3.5 px-4.5">Receipt Date</th>
                        <th className="py-3.5 px-4.5">Product Name</th>
                        <th className="py-3.5 px-4.5">SKU Code</th>
                        <th className="py-3.5 px-4.5 text-right">Quantity</th>
                        <th className="py-3.5 px-4.5 text-right">Unit Price</th>
                        <th className="py-3.5 px-4.5 text-right">Total Net</th>
                        <th className="py-3.5 px-4.5 text-center">Warranty Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/60 dark:divide-slate-800/30 text-xs">
                      {supplierProducts.map((p) => {
                        const statusConfig = {
                          uploaded: { label: "Uploaded", cls: "bg-emerald-50/70 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-900/20" },
                          missing: { label: "Missing Cert", cls: "bg-amber-50/70 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-100/50 dark:border-amber-900/20" },
                          expired: { label: "Expired", cls: "bg-rose-50/70 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 border border-rose-100/50 dark:border-rose-900/20" },
                        }[p.warranty];

                        return (
                          <tr key={p.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-900/10 transition-colors duration-150">
                            <td className="py-4 px-4.5 font-semibold text-muted-foreground/80">{p.date}</td>
                            <td className="py-4 px-4.5 font-bold text-foreground">{p.name}</td>
                            <td className="py-4 px-4.5 font-mono text-[11px] text-muted-foreground">{p.sku}</td>
                            <td className="py-4 px-4.5 text-right font-semibold">{p.qty}</td>
                            <td className="py-4 px-4.5 text-right font-semibold">${p.price}</td>
                            <td className="py-4 px-4.5 text-right font-bold">${(p.qty * p.price).toLocaleString()}</td>
                            <td className="py-4 px-4.5">
                              <div className="flex items-center justify-center gap-2">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${statusConfig.cls}`}>
                                  {statusConfig.label}
                                </span>
                                {p.warranty === "missing" && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleWarrantyUpload(p.id)}
                                    disabled={uploadingWarrantyId === p.id}
                                    className="h-7 w-7 rounded-lg shrink-0 p-0 hover:bg-primary/10 hover:text-primary"
                                    variant="ghost"
                                  >
                                    {uploadingWarrantyId === p.id ? (
                                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                      <UploadCloud className="h-3.5 w-3.5" />
                                    )}
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB CONTENT: COMPREHENSIVE BILL MANAGEMENT */}
            {activeTab === "bills" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
                
                {/* Collapsible Monthly Breakdowns Accordion */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="card-elevated border border-slate-100/80 dark:border-slate-800/80 bg-card p-6 shadow-sm">
                    <h2 className="text-base font-bold tracking-tight text-foreground mb-4 flex items-center gap-2">
                      <FileSpreadsheet className="h-4.5 w-4.5 text-primary" /> Monthly Transactions Archive
                    </h2>

                    <div className="space-y-3">
                      {Object.keys(supplierBills).map((month) => {
                        const billsList = supplierBills[month];
                        const isExpanded = expandedMonths[month];
                        const monthTotal = billsList.reduce((acc, curr) => acc + curr.amount, 0);

                        return (
                          <div key={month} className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden">
                            {/* Accordion Trigger */}
                            <button
                              onClick={() => toggleMonth(month)}
                              className="w-full flex items-center justify-between px-5 py-4 bg-slate-50/50 dark:bg-slate-900/25 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <span className="font-bold text-sm text-foreground">{month}</span>
                                <span className="text-[10px] font-semibold text-muted-foreground bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                                  {billsList.length} transaction{billsList.length !== 1 ? "s" : ""}
                                </span>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="font-bold text-sm text-primary">
                                  Total: ${monthTotal.toLocaleString()}
                                </span>
                                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                              </div>
                            </button>

                            {/* Accordion Content */}
                            {isExpanded && (
                              <div className="p-4 bg-card divide-y divide-slate-100/50 dark:divide-slate-800/25">
                                {billsList.map((bill) => (
                                  <div key={bill.id} className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="space-y-0.5">
                                      <div className="flex items-center gap-2.5">
                                        <span className="font-bold text-sm text-foreground">${bill.amount.toLocaleString()}</span>
                                        <span className="text-[10px] text-muted-foreground/60">{bill.date}</span>
                                      </div>
                                      <p className="text-[10px] text-muted-foreground">Log Reference ID: {bill.id}</p>
                                    </div>

                                    {/* Asset Badges Triggering View/Download on Hover */}
                                    <div className="flex items-center gap-2">
                                      {/* Invoice PDF */}
                                      <div className={`group relative px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold flex items-center gap-1.5 transition-all ${
                                        bill.invoice 
                                          ? "bg-slate-50 border-slate-100 dark:bg-slate-900 dark:border-slate-800 text-foreground cursor-pointer" 
                                          : "bg-slate-50/20 border-slate-100/10 text-muted-foreground/30 border-dashed"
                                      }`}>
                                        <FileText className="h-3.5 w-3.5" />
                                        Invoice
                                        {bill.invoice && (
                                          <span className="absolute right-1 top-1 h-1.5 w-1.5 bg-emerald-500 rounded-full" />
                                        )}
                                        {/* Hover Overlay */}
                                        {bill.invoice && (
                                          <div className="absolute inset-0 bg-primary rounded-lg text-primary-foreground flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                            <Eye className="h-3 w-3" />
                                            <Download className="h-3 w-3" />
                                          </div>
                                        )}
                                      </div>

                                      {/* Payment Receipt */}
                                      <div className={`group relative px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold flex items-center gap-1.5 transition-all ${
                                        bill.receipt 
                                          ? "bg-slate-50 border-slate-100 dark:bg-slate-900 dark:border-slate-800 text-foreground cursor-pointer" 
                                          : "bg-slate-50/20 border-slate-100/10 text-muted-foreground/30 border-dashed"
                                      }`}>
                                        <CreditCardIcon className="h-3.5 w-3.5" />
                                        Receipt
                                        {bill.receipt && (
                                          <span className="absolute right-1 top-1 h-1.5 w-1.5 bg-emerald-500 rounded-full" />
                                        )}
                                        {/* Hover Overlay */}
                                        {bill.receipt && (
                                          <div className="absolute inset-0 bg-primary rounded-lg text-primary-foreground flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                            <Eye className="h-3 w-3" />
                                            <Download className="h-3 w-3" />
                                          </div>
                                        )}
                                      </div>

                                      {/* Delivery Note */}
                                      <div className={`group relative px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold flex items-center gap-1.5 transition-all ${
                                        bill.note 
                                          ? "bg-slate-50 border-slate-100 dark:bg-slate-900 dark:border-slate-800 text-foreground cursor-pointer" 
                                          : "bg-slate-50/20 border-slate-100/10 text-muted-foreground/30 border-dashed"
                                      }`}>
                                        <Briefcase className="h-3.5 w-3.5" />
                                        Note
                                        {bill.note && (
                                          <span className="absolute right-1 top-1 h-1.5 w-1.5 bg-emerald-500 rounded-full" />
                                        )}
                                        {/* Hover Overlay */}
                                        {bill.note && (
                                          <div className="absolute inset-0 bg-primary rounded-lg text-primary-foreground flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                            <Eye className="h-3 w-3" />
                                            <Download className="h-3 w-3" />
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Bill / Transaction Asset Uploader */}
                <div className="card-elevated border border-slate-100/80 dark:border-slate-800/80 bg-card p-6 shadow-sm h-fit">
                  <h3 className="text-sm font-bold tracking-tight text-foreground mb-1">Add Supplier Bill</h3>
                  <p className="text-xs text-muted-foreground/80 mb-5">Attach separate transaction documents to archive together</p>

                  <form onSubmit={handleBillSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="bill-month" className="text-xs font-semibold">Select Month</Label>
                      <select
                        id="bill-month"
                        value={billMonth}
                        onChange={(e) => setBillMonth(e.target.value)}
                        className="w-full h-9 rounded-lg border border-slate-100 bg-slate-50/50 dark:bg-slate-900 dark:border-slate-800 px-3 text-xs font-medium focus:ring-1 focus:ring-primary focus:outline-none"
                      >
                        <option value="May 2026">May 2026</option>
                        <option value="April 2026">April 2026</option>
                        <option value="March 2026">March 2026</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="bill-amount" className="text-xs font-semibold">Transaction Amount ($)</Label>
                      <Input
                        id="bill-amount"
                        type="number"
                        placeholder="e.g. 12500"
                        value={billAmount}
                        onChange={(e) => setBillAmount(e.target.value)}
                        className="h-9 text-xs rounded-lg border-slate-100 bg-slate-50/50 dark:bg-slate-900/50 dark:border-slate-800"
                      />
                    </div>

                    {/* Multiple Asset Dropzones */}
                    <div className="space-y-3 pt-1">
                      <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Document Attachments</Label>
                      
                      {/* Invoice PDF Upload */}
                      <div 
                        onClick={() => handleBillAssetUpload("invoice")}
                        className={`p-3 border rounded-xl cursor-pointer text-center flex items-center justify-between transition-all ${
                          billInvoiceFile 
                            ? "bg-slate-50 border-emerald-100/50 dark:bg-emerald-950/10 dark:border-emerald-900/20 text-foreground" 
                            : "bg-slate-50/50 border-slate-100 hover:bg-slate-50 dark:bg-slate-900/40 dark:border-slate-800 border-dashed"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <FileText className={`h-4.5 w-4.5 shrink-0 ${billInvoiceFile ? "text-emerald-500" : "text-slate-400"}`} />
                          <div className="text-left min-w-0">
                            <p className="text-[11px] font-bold truncate leading-none">Invoice Document</p>
                            <p className="text-[10px] text-muted-foreground mt-1 truncate">{billInvoiceFile || "Upload Invoice PDF"}</p>
                          </div>
                        </div>
                        {billInvoiceFile ? (
                          <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
                        ) : (
                          <UploadCloud className="h-4 w-4 text-slate-400 shrink-0" />
                        )}
                      </div>

                      {/* Payment Receipt Upload */}
                      <div 
                        onClick={() => handleBillAssetUpload("receipt")}
                        className={`p-3 border rounded-xl cursor-pointer text-center flex items-center justify-between transition-all ${
                          billReceiptFile 
                            ? "bg-slate-50 border-emerald-100/50 dark:bg-emerald-950/10 dark:border-emerald-900/20 text-foreground" 
                            : "bg-slate-50/50 border-slate-100 hover:bg-slate-50 dark:bg-slate-900/40 dark:border-slate-800 border-dashed"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <CreditCardIcon className={`h-4.5 w-4.5 shrink-0 ${billReceiptFile ? "text-emerald-500" : "text-slate-400"}`} />
                          <div className="text-left min-w-0">
                            <p className="text-[11px] font-bold truncate leading-none">Payment Receipt</p>
                            <p className="text-[10px] text-muted-foreground mt-1 truncate">{billReceiptFile || "Upload Bank Receipt"}</p>
                          </div>
                        </div>
                        {billReceiptFile ? (
                          <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
                        ) : (
                          <UploadCloud className="h-4 w-4 text-slate-400 shrink-0" />
                        )}
                      </div>

                      {/* Delivery Note Upload */}
                      <div 
                        onClick={() => handleBillAssetUpload("note")}
                        className={`p-3 border rounded-xl cursor-pointer text-center flex items-center justify-between transition-all ${
                          billNoteFile 
                            ? "bg-slate-50 border-emerald-100/50 dark:bg-emerald-950/10 dark:border-emerald-900/20 text-foreground" 
                            : "bg-slate-50/50 border-slate-100 hover:bg-slate-50 dark:bg-slate-900/40 dark:border-slate-800 border-dashed"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Briefcase className={`h-4.5 w-4.5 shrink-0 ${billNoteFile ? "text-emerald-500" : "text-slate-400"}`} />
                          <div className="text-left min-w-0">
                            <p className="text-[11px] font-bold truncate leading-none">Delivery Note</p>
                            <p className="text-[10px] text-muted-foreground mt-1 truncate">{billNoteFile || "Upload Signed Delivery Note"}</p>
                          </div>
                        </div>
                        {billNoteFile ? (
                          <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
                        ) : (
                          <UploadCloud className="h-4 w-4 text-slate-400 shrink-0" />
                        )}
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      disabled={isUploadingBill} 
                      className="w-full h-9 text-xs font-semibold mt-2 bg-primary text-primary-foreground hover:bg-primary/95 flex items-center justify-center gap-2 rounded-lg"
                    >
                      {isUploadingBill ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Log Transactions...
                        </>
                      ) : (
                        "Log Supplier Bills"
                      )}
                    </Button>
                  </form>
                </div>
              </div>
            )}

            {/* TAB CONTENT: CORE ERP LOGISTICS & LOG FORM */}
            {activeTab === "erp" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
                
                {/* Detailed Registry Information */}
                <div className="lg:col-span-2 card-elevated border border-slate-100/80 dark:border-slate-800/80 bg-card p-6 shadow-sm">
                  <h2 className="text-base font-bold tracking-tight text-foreground mb-4">Supplier Registration & Logistics Profile</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Tax & Legal Identity</span>
                        <h3 className="text-sm font-bold text-foreground mt-1">Tax / VAT ID Registry</h3>
                        <p className="text-xs text-muted-foreground/80 mt-1 leading-relaxed">
                          Under ERP protocols, every supplier must log a confirmed corporate tax profile for VAT clearances and audits.
                        </p>
                      </div>

                      <div className="border border-slate-100 dark:border-slate-800 p-4 rounded-xl space-y-2.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-muted-foreground">Verification Authority</span>
                          <span className="font-bold text-foreground">IRS / VAT Corporate</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-muted-foreground">Compliance Status</span>
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 font-semibold text-[10px]">
                            Verified
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Active Procurement Contracts</span>
                        <h3 className="text-sm font-bold text-foreground mt-1">Annual Master Agreements</h3>
                        <p className="text-xs text-muted-foreground/80 mt-1 leading-relaxed">
                          Master Service Agreements (MSAs) and pricing logs stored and mapped. Upload updated contracts to refresh terms.
                        </p>
                      </div>

                      <div className="border border-slate-100 dark:border-slate-800 p-4 rounded-xl flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="h-9 w-9 rounded-lg bg-slate-50 dark:bg-slate-900 border flex items-center justify-center shrink-0">
                            <FileText className="h-4.5 w-4.5 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] font-bold text-foreground truncate leading-none">MSA_Acme_2026.pdf</p>
                            <p className="text-[10px] text-muted-foreground mt-1 truncate">Expires Dec 31, 2026</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground">
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ERP LOGISTICS SUBMIT FORM */}
                <div className="card-elevated border border-slate-100/80 dark:border-slate-800/80 bg-card p-6 shadow-sm h-fit">
                  <h3 className="text-sm font-bold tracking-tight text-foreground mb-1">Add/Update Supplier Log</h3>
                  <p className="text-xs text-muted-foreground/80 mb-5">Register details, tax metrics, and contracts for active supplier</p>

                  <form onSubmit={handleERPSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="intake-category" className="text-xs font-semibold">Log Product Intake Category</Label>
                      <select
                        id="intake-category"
                        value={intakeCategory}
                        onChange={(e) => setIntakeCategory(e.target.value)}
                        className="w-full h-9 rounded-lg border border-slate-100 bg-slate-50/50 dark:bg-slate-900 dark:border-slate-800 px-3 text-xs font-medium focus:ring-1 focus:ring-primary focus:outline-none"
                      >
                        <option value="electronics">Electronics Components</option>
                        <option value="raw-materials">Raw Metal Housing</option>
                        <option value="audio-parts">Audio DAC & Hardware</option>
                        <option value="logistics">Shipping & Logistics Services</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="payment-terms" className="text-xs font-semibold">Payment Settlement Terms</Label>
                      <select
                        id="payment-terms"
                        value={paymentTerms}
                        onChange={(e) => setPaymentTerms(e.target.value)}
                        className="w-full h-9 rounded-lg border border-slate-100 bg-slate-50/50 dark:bg-slate-900 dark:border-slate-800 px-3 text-xs font-medium focus:ring-1 focus:ring-primary focus:outline-none"
                      >
                        <option value="Net 30">Net 30 Days</option>
                        <option value="Net 45">Net 45 Days</option>
                        <option value="Net 60">Net 60 Days</option>
                        <option value="COD">Due on Delivery (COD)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="tax-id" className="text-xs font-semibold">Corporate Tax / VAT Registration ID</Label>
                      <Input
                        id="tax-id"
                        placeholder="e.g. VAT-8820931"
                        value={taxId}
                        onChange={(e) => setTaxId(e.target.value)}
                        className="h-9 text-xs rounded-lg border-slate-100 bg-slate-50/50 dark:bg-slate-900/50 dark:border-slate-800"
                      />
                    </div>

                    {/* Contract File Attachment */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Procurement Contract Attachment</Label>
                      <div 
                        onClick={handleContractUpload}
                        className={`p-3 border rounded-xl cursor-pointer text-center flex items-center justify-between transition-all ${
                          contractFile 
                            ? "bg-slate-50 border-emerald-100/50 dark:bg-emerald-950/10 dark:border-emerald-900/20 text-foreground" 
                            : "bg-slate-50/50 border-slate-100 hover:bg-slate-50 dark:bg-slate-900/40 dark:border-slate-800 border-dashed"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <FileText className={`h-4.5 w-4.5 shrink-0 ${contractFile ? "text-emerald-500" : "text-slate-400"}`} />
                          <div className="text-left min-w-0">
                            <p className="text-[11px] font-bold truncate leading-none">Contract PDF</p>
                            <p className="text-[10px] text-muted-foreground mt-1 truncate">{contractFile || "Attach digital contract"}</p>
                          </div>
                        </div>
                        {contractFile ? (
                          <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
                        ) : (
                          <UploadCloud className="h-4 w-4 text-slate-400 shrink-0" />
                        )}
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      disabled={isSubmittingERP} 
                      className="w-full h-9 text-xs font-semibold mt-2 bg-primary text-primary-foreground hover:bg-primary/95 flex items-center justify-center gap-2 rounded-lg"
                    >
                      {isSubmittingERP ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Submitting Registry...
                        </>
                      ) : (
                        "Save ERP Registry"
                      )}
                    </Button>
                  </form>
                </div>
              </div>
            )}

          </div>

        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center card-elevated bg-card border border-slate-100/80 dark:border-slate-800/80 p-10 text-center">
          <div>
            <Truck className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-700 dark:text-slate-300">Select a Supplier</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">Choose a supplier from the left navigator to view procurement logs, outstanding receipts, and monthly transaction bills.</p>
          </div>
        </div>
      )}

      {/* dialog forms */}
      <SupplierDialog open={open} onOpenChange={setOpen} initial={editing} />

      <ConfirmDialog
        open={!!confirming}
        onOpenChange={(v) => !v && setConfirming(null)}
        title={`Delete ${confirming?.name}?`}
        description="This will permanently delete the supplier."
        onConfirm={async () => {
          if (confirming) await deleteSupplier(confirming.id);
          setConfirming(null);
          setSelectedSupplier(null);
        }}
      />

    </div>
  );
}

// Inline fallback CreditCard icon since Lucide imports CreditCard selectively
function CreditCardIcon(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  );
}
