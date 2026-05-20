"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useData } from "@/hooks/useData";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { uid } from "@/db/store";
import type { ProcuredPart } from "@/db/types";
import { 
  ArrowLeft, Wrench, Calendar, Phone, MessageSquare, 
  User, Cpu, DollarSign, FileText, Pencil, Printer, ShieldAlert,
  Plus, Trash2, Paperclip, Boxes, Sparkles, UploadCloud
} from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { RepairDialog } from "@/components/RepairDialog";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export default function RepairDetailPage({ params }: { params: { id: string } }) {
  const id = params.id;
  const router = useRouter();
  const { repairs, customers, products, updateRepair } = useData();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // States for Procured Parts Form
  const [isAddingPart, setIsAddingPart] = useState(false);
  const [newPartName, setNewPartName] = useState("");
  const [newSupplierName, setNewSupplierName] = useState("");
  const [newSupplierBillId, setNewSupplierBillId] = useState("");
  const [newCostPrice, setNewCostPrice] = useState("");
  const [newWarrantyPeriod, setNewWarrantyPeriod] = useState("");
  const [newPartBillPhoto, setNewPartBillPhoto] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  // States for Lightbox
  const [activeBillLightbox, setActiveBillLightbox] = useState<{ title: string; base64: string } | null>(null);
  const [lightboxScale, setLightboxScale] = useState(1);

  const repair = repairs.find((r) => r.id === id);

  const customer = useMemo(() => {
    if (!repair) return null;
    return customers.find((c) => c.id === repair.customerId);
  }, [customers, repair]);

  const product = useMemo(() => {
    if (!repair || !repair.deviceId) return null;
    return products.find(
      (p) => p.id === repair.deviceId || (p.serial && p.serial === repair.deviceId)
    );
  }, [products, repair]);

  // Formats currency as LKR
  const formatLKR = (num: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 0
    }).format(num);
  };

  // Live calculation hooks
  const totalPartsCost = useMemo(() => {
    if (!repair) return 0;
    return (repair.procuredParts || []).reduce((acc, curr) => acc + curr.costPrice, 0);
  }, [repair]);

  const serviceCost = useMemo(() => {
    if (!repair || !repair.cost) return 0;
    const cleanStr = repair.cost.replace(/[^0-9.]/g, "");
    const parsed = parseFloat(cleanStr);
    return isNaN(parsed) ? 0 : parsed;
  }, [repair]);

  const netProfit = useMemo(() => {
    return serviceCost - totalPartsCost;
  }, [serviceCost, totalPartsCost]);

  // Form Upload / File Drag and Drop Event Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Supplier bill image must be smaller than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setNewPartBillPhoto(reader.result as string);
      toast.success("Supplier bill image loaded successfully");
    };
    reader.readAsDataURL(file);
  };

  // Add Part Trigger
  const handleAddPart = async () => {
    if (!newPartName.trim()) {
      toast.error("Please enter a part name");
      return;
    }
    if (!newSupplierName.trim()) {
      toast.error("Please enter a supplier name");
      return;
    }
    if (!newSupplierBillId.trim()) {
      toast.error("Please enter a supplier bill/invoice ID");
      return;
    }
    const cost = parseFloat(newCostPrice);
    if (isNaN(cost) || cost < 0) {
      toast.error("Please enter a valid cost price (LKR)");
      return;
    }

    const newPart: ProcuredPart = {
      id: uid(),
      partName: newPartName.trim(),
      supplierName: newSupplierName.trim(),
      supplierBillId: newSupplierBillId.trim(),
      costPrice: cost,
      warrantyPeriod: newWarrantyPeriod ? parseInt(newWarrantyPeriod) : undefined,
      billPhoto: newPartBillPhoto || undefined
    };

    if (repair) {
      const updatedParts = [...(repair.procuredParts || []), newPart];
      try {
        await updateRepair(repair.id, {
          ...repair,
          procuredParts: updatedParts
        });
        toast.success("Procurement expense linked successfully!");
        
        // Reset states
        setNewPartName("");
        setNewSupplierName("");
        setNewSupplierBillId("");
        setNewCostPrice("");
        setNewWarrantyPeriod("");
        setNewPartBillPhoto("");
        setIsAddingPart(false);
      } catch (err) {
        toast.error("Failed to link procurement expense");
      }
    }
  };

  // Delete Part Trigger
  const handleDeletePart = async (partId: string) => {
    if (repair) {
      const updatedParts = (repair.procuredParts || []).filter((p) => p.id !== partId);
      try {
        await updateRepair(repair.id, {
          ...repair,
          procuredParts: updatedParts
        });
        toast.success("Procurement expense removed");
      } catch (err) {
        toast.error("Failed to remove procurement expense");
      }
    }
  };

  if (!repair) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.push("/repairs")}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to repairs
        </Button>
        <EmptyState
          icon={<Wrench className="h-5 w-5" />}
          title="Repair record not found"
          description="This repair ticket may have been deleted."
        />
      </div>
    );
  }

  // Handle printing
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 print:p-0">
      {/* Top Action Bar - Hidden during printing */}
      <div className="flex items-center justify-between print:hidden">
        <Button variant="ghost" size="sm" onClick={() => router.push("/repairs")} className="-ml-2">
          <ArrowLeft className="h-4 w-4 mr-1" /> Repairs
        </Button>
        <div className="flex gap-2">
          <Button onClick={handlePrint} variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-1" /> Print Job Sheet
          </Button>
          <Button onClick={() => setIsEditDialogOpen(true)} size="sm">
            <Pencil className="h-4 w-4 mr-1" /> Edit Ticket
          </Button>
        </div>
      </div>

      {/* Main Repair Job Sheet Card */}
      <div className="card-elevated p-6 space-y-6 relative overflow-hidden bg-gradient-to-br from-card to-secondary/10 print:border-none print:shadow-none print:bg-white print:text-black">
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-border/40 pb-5">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest print:text-black/60">Repair Work Order</span>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground print:text-black">{repair.deviceName}</h1>
            <p className="text-sm font-medium text-destructive mt-1 italic print:text-black">
              Problem: {repair.problem}
            </p>
          </div>
          <span className={cn(
            "inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shrink-0 print:border print:text-black",
            repair.status.toLowerCase() === "pending" ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-500/25" :
            repair.status.toLowerCase() === "completed" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-500/25" :
            "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-500/25"
          )}>
            {repair.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Customer Details Block */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" /> Customer Info
            </h3>
            {customer ? (
              <div className="bg-background/40 p-4 rounded-lg border border-border/30 print:bg-gray-50 print:border-gray-200">
                <p className="font-bold text-lg text-foreground print:text-black">{customer.name}</p>
                
                <div className="space-y-2 mt-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                    <a href={`tel:${customer.phone}`} className="hover:text-primary transition-colors print:no-underline">
                      {customer.phone}
                    </a>
                  </div>

                  {customer.whatsapp && (
                    <div className="flex items-center gap-2 text-sm print:hidden">
                      <MessageSquare className="h-4 w-4 text-emerald-500 shrink-0" />
                      <a 
                        href={`https://wa.me/${customer.whatsapp.replace(/[^0-9]/g, "")}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="hover:text-primary transition-colors"
                      >
                        WhatsApp Chat
                      </a>
                    </div>
                  )}

                  {customer.address && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Address: <span className="text-foreground font-medium print:text-black">{customer.address}</span>
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">No customer linked</p>
            )}
          </div>

          {/* Product/Device Identification Block */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5" /> Linked Product Inventory Info
            </h3>
            {product ? (
              <div className="bg-background/40 p-4 rounded-lg border border-border/30 print:bg-gray-50 print:border-gray-200">
                <Link href={`/products/${product.id}`} className="font-bold text-lg text-foreground hover:text-primary transition-colors block print:no-underline print:text-black">
                  {product.name}
                </Link>
                <div className="space-y-1.5 mt-3 text-xs text-muted-foreground print:text-black">
                  {product.serial && <p>Serial Number: <span className="mono font-semibold text-foreground print:text-black">{product.serial}</span></p>}
                  {product.sku && <p>SKU: <span className="mono font-semibold text-foreground print:text-black">{product.sku}</span></p>}
                  {product.warrantyPeriod && <p>Base Warranty: <span className="font-medium text-foreground print:text-black">{product.warrantyPeriod} Months</span></p>}
                </div>
              </div>
            ) : (
              <div className="bg-background/20 p-4 rounded-lg border border-border/20 border-dashed">
                <p className="text-sm font-semibold text-foreground">Custom/Non-Stock Device</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Device ID/Serial: <span className="mono font-medium text-foreground">{repair.deviceId || "—"}</span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Cost and Timeline Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-border/40">
          <div className="bg-background/40 p-4 rounded-lg border border-border/30 print:bg-gray-50">
            <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
              <DollarSign className="h-3.5 w-3.5" /> Service Cost
            </span>
            <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
              {repair.cost ? (
                (() => {
                  const cleanStr = repair.cost.replace(/[^0-9.]/g, "");
                  const parsed = parseFloat(cleanStr);
                  return isNaN(parsed) ? repair.cost : formatLKR(parsed);
                })()
              ) : "—"}
            </p>
          </div>

          <div className="bg-background/40 p-4 rounded-lg border border-border/30 print:bg-gray-50">
            <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" /> Date Received
            </span>
            <p className="text-lg font-bold text-foreground mt-1 print:text-black">
              {repair.receivedDate || "—"}
            </p>
          </div>

          <div className="bg-background/40 p-4 rounded-lg border border-border/30 print:bg-gray-50">
            <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" /> Promised Delivery Date
            </span>
            <p className="text-lg font-bold text-foreground mt-1 print:text-black">
              {repair.deliveryDate || "—"}
            </p>
          </div>
        </div>

        {/* Live Cost Calculation & Profitability Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border/40">
          <div className="bg-secondary/20 p-4 rounded-lg border border-border/20 flex flex-col justify-between">
            <div>
              <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5">
                <Boxes className="h-3.5 w-3.5" /> Total Parts Procurement Cost
              </span>
              <p className="text-2xl font-black text-slate-800 dark:text-slate-200 mt-1">
                {formatLKR(totalPartsCost)}
              </p>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">
              Sum of {repair.procuredParts?.length || 0} third-party component expense(s).
            </p>
          </div>

          <div className={cn(
            "p-4 rounded-lg border flex flex-col justify-between transition-all duration-300",
            netProfit > 0 
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-400" 
              : netProfit === 0
                ? "bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-400"
                : "bg-destructive/10 border-destructive/30 text-destructive dark:text-red-400"
          )}>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 opacity-80">
                <Sparkles className="h-3.5 w-3.5" /> Net Repair Profitability
              </span>
              <p className="text-2xl font-black mt-1">
                {netProfit >= 0 ? "+" : ""}{formatLKR(netProfit)}
              </p>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[10px] opacity-75">
                (Service Cost Charged - Total Parts Cost)
              </span>
              <span className={cn(
                "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest shrink-0",
                netProfit > 0 
                  ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300" 
                  : netProfit === 0
                    ? "bg-amber-500/20 text-amber-700 dark:text-amber-300"
                    : "bg-destructive/20 text-destructive dark:text-red-300"
              )}>
                {netProfit > 0 ? "PROFITABLE" : netProfit === 0 ? "ZERO MARGIN" : "LOSS LIMIT"}
              </span>
            </div>
          </div>
        </div>

        {/* Procured Parts & Expenses Section */}
        <div className="space-y-4 pt-6 border-t border-border/40">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Wrench className="h-3.5 w-3.5" /> Procured Parts & Expenses
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddingPart(!isAddingPart)}
              className="text-xs flex items-center gap-1.5 hover:bg-primary/5 hover:text-primary transition-all duration-300 print:hidden"
            >
              {isAddingPart ? (
                <span>Close Form</span>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5" />
                  <span>Log Procurement Expense</span>
                </>
              )}
            </Button>
          </div>

          {/* Add Part Form */}
          {isAddingPart && (
            <div className="bg-background/60 p-5 rounded-lg border border-primary/20 space-y-4 animate-in fade-in slide-in-from-top-3 duration-200 print:hidden">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-1">
                <Plus className="h-4 w-4 text-primary" /> Log Third-Party Component
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="partName">Part Name</Label>
                  <Input
                    id="partName"
                    placeholder="e.g. OLED Display Panel"
                    value={newPartName}
                    onChange={(e) => setNewPartName(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="supplierName">Supplier Name</Label>
                  <Input
                    id="supplierName"
                    placeholder="e.g. Apex Tech Wholesalers"
                    value={newSupplierName}
                    onChange={(e) => setNewSupplierName(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="supplierBillId">Supplier Bill / Invoice ID</Label>
                  <Input
                    id="supplierBillId"
                    placeholder="e.g. INV-2026-991"
                    value={newSupplierBillId}
                    onChange={(e) => setNewSupplierBillId(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="costPrice">Cost Price (LKR)</Label>
                  <Input
                    id="costPrice"
                    type="number"
                    placeholder="e.g. 15000"
                    value={newCostPrice}
                    onChange={(e) => setNewCostPrice(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="warrantyPeriod">Warranty Period (Months)</Label>
                  <Input
                    id="warrantyPeriod"
                    type="number"
                    placeholder="e.g. 6"
                    value={newWarrantyPeriod}
                    onChange={(e) => setNewWarrantyPeriod(e.target.value)}
                  />
                </div>
                
                {/* Drag-and-drop supplier bill upload */}
                <div className="space-y-1 lg:col-span-3">
                  <Label>Supplier Bill Asset Attachment</Label>
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={cn(
                      "border-2 border-dashed rounded-lg p-5 flex flex-col items-center justify-center transition-all duration-300 bg-background/20 cursor-pointer hover:bg-background/40 hover:border-primary/40",
                      isDragging ? "border-primary bg-primary/5 scale-[0.99]" : "border-border/60"
                    )}
                    onClick={() => document.getElementById("part-bill-upload")?.click()}
                  >
                    <input
                      id="part-bill-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    {newPartBillPhoto ? (
                      <div className="flex flex-col items-center gap-2">
                        <img
                          src={newPartBillPhoto}
                          alt="Supplier bill preview"
                          className="h-20 max-w-[200px] object-contain rounded border bg-white"
                        />
                        <p className="text-xs text-emerald-600 font-medium">✓ Bill asset loaded successfully</p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setNewPartBillPhoto("");
                          }}
                          className="text-[10px] text-destructive hover:bg-destructive/5 animate-in fade-in duration-200"
                        >
                          Remove image
                        </Button>
                      </div>
                    ) : (
                      <>
                        <UploadCloud className="h-8 w-8 text-muted-foreground mb-2 animate-pulse" />
                        <p className="text-xs font-semibold text-center text-foreground">
                          Drag & drop supplier invoice bill image here
                        </p>
                        <p className="text-[10px] text-muted-foreground text-center mt-1">
                          PNG, JPG or JPEG up to 2MB (or click to browse)
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAddingPart(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddPart}
                >
                  Save Procurement Part
                </Button>
              </div>
            </div>
          )}

          {/* Parts List */}
          {(!repair.procuredParts || repair.procuredParts.length === 0) ? (
            <div className="bg-background/20 p-6 rounded-lg border border-border/20 border-dashed text-center">
              <p className="text-sm text-muted-foreground italic">No external procurement parts logged for this repair ticket.</p>
              <p className="text-xs text-muted-foreground mt-1 print:hidden">Click "Log Procurement Expense" above to add replacement components.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border/40 bg-background/20">
              <table className="min-w-full divide-y divide-border/30 text-left">
                <thead className="bg-secondary/40 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Part Name</th>
                    <th className="px-4 py-3">Supplier Name</th>
                    <th className="px-4 py-3">Supplier Bill ID</th>
                    <th className="px-4 py-3 text-right">Cost Price</th>
                    <th className="px-4 py-3 text-center">Warranty</th>
                    <th className="px-4 py-3 text-center">Receipt Bill</th>
                    <th className="px-4 py-3 text-right print:hidden"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20 text-xs">
                  {repair.procuredParts.map((part) => (
                    <tr key={part.id} className="hover:bg-background/40 transition-colors">
                      <td className="px-4 py-3 font-semibold text-foreground">{part.partName}</td>
                      <td className="px-4 py-3 text-muted-foreground">{part.supplierName}</td>
                      <td className="px-4 py-3">
                        <code className="bg-secondary/60 text-destructive px-1.5 py-0.5 rounded text-[10px] font-mono">
                          {part.supplierBillId}
                        </code>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-foreground">{formatLKR(part.costPrice)}</td>
                      <td className="px-4 py-3 text-center">
                        {part.warrantyPeriod ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                            {part.warrantyPeriod} M
                          </span>
                        ) : (
                          <span className="text-[10px] text-muted-foreground">None</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {part.billPhoto ? (
                          <button
                            type="button"
                            onClick={() => {
                              setLightboxScale(1);
                              setActiveBillLightbox({ title: part.partName, base64: part.billPhoto! });
                            }}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 text-[10px] font-semibold transition-all duration-200"
                          >
                            <Paperclip className="h-3 w-3" /> Preview
                          </button>
                        ) : (
                          <span className="text-[10px] text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right print:hidden">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeletePart(part.id)}
                          className="h-7 w-7 text-destructive hover:bg-destructive/5 hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Technician Work Notes */}
        <div className="space-y-2 pt-4 border-t border-border/40">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5" /> Technician & Diagnostic Notes
          </h3>
          <div className="bg-secondary/40 p-4 rounded-lg border border-border/20 min-h-[80px] print:bg-gray-50 print:border-gray-200">
            {repair.techNotes ? (
              <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed print:text-black">{repair.techNotes}</p>
            ) : (
              <p className="text-sm text-muted-foreground italic">No technician notes logged yet.</p>
            )}
          </div>
        </div>

        {/* Print Disclaimer */}
        <div className="hidden print:block text-[10px] text-muted-foreground text-center pt-8 border-t border-dashed">
          Thank you for choosing our repair service. Please present this job sheet upon device collection.
        </div>
      </div>

      {/* Edit Repair Dialog */}
      <RepairDialog 
        open={isEditDialogOpen} 
        onOpenChange={setIsEditDialogOpen} 
        initial={repair} 
      />

      {/* Lightbox for Supplier Bill Attachment */}
      <Dialog open={!!activeBillLightbox} onOpenChange={(v) => !v && setActiveBillLightbox(null)}>
        <DialogContent className="max-w-3xl border-none bg-black/95 p-4 text-white overflow-hidden flex flex-col items-center">
          <div className="w-full flex items-center justify-between border-b border-white/10 pb-2 mb-4">
            <span className="text-xs font-bold truncate max-w-sm">Supplier Bill Attachment: {activeBillLightbox?.title}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveBillLightbox(null)}
              className="text-white hover:bg-white/10"
            >
              Close
            </Button>
          </div>
          {activeBillLightbox && (
            <div className="relative w-full flex items-center justify-center min-h-[400px] bg-slate-900/40 rounded border border-white/5 p-4">
              <img
                src={activeBillLightbox.base64}
                alt="Supplier bill attachment preview"
                className="max-h-[60vh] object-contain rounded-lg shadow-2xl transition-transform duration-300"
                style={{ transform: `scale(${lightboxScale})` }}
              />
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/80 border border-white/10 rounded-full px-4 py-1.5 text-white">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setLightboxScale(prev => Math.max(prev - 0.25, 0.5))} 
                  className="text-white hover:bg-white/10 h-8 w-8"
                >
                  <span className="text-lg font-bold">-</span>
                </Button>
                <span className="text-xs font-mono w-12 text-center">{Math.round(lightboxScale * 100)}%</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setLightboxScale(prev => Math.min(prev + 0.25, 3))} 
                  className="text-white hover:bg-white/10 h-8 w-8"
                >
                  <span className="text-lg font-bold">+</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setLightboxScale(1)} 
                  className="text-white hover:bg-white/10 text-[10px] ml-1"
                >
                  Reset
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
