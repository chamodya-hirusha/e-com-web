"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm, useFieldArray } from "react-hook-form";
import { useData } from "@/hooks/useData";
import { toast } from "sonner";
import { Plus, Trash2, ArrowLeft, DollarSign, CreditCard, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LineItem {
  productId: string;
  quantity: number;
  price: number;
  customerWarranty?: number;
}

interface FormValues {
  customerId: string;
  paymentMethod: "cash" | "cheque";
  chequeNumber?: string;
  bankName?: string;
  chequeDate?: string;
  items: LineItem[];
}

export default function NewInvoicePage() {
  const { customers, products, addInvoice, addCheque } = useData();
  const router = useRouter();

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      paymentMethod: "cash",
      items: [{ productId: "", quantity: 1, price: 0, customerWarranty: 0 }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items"
  });

  const paymentMethod = watch("paymentMethod");
  const items = watch("items") || [];

  // Calculate dynamic running total
  const calculatedTotal = items.reduce((acc, curr) => {
    const qty = parseInt(String(curr.quantity), 10) || 0;
    const prc = parseFloat(String(curr.price)) || 0;
    return acc + (qty * prc);
  }, 0);

  // Global stock validation check
  const hasStockError = items.some((item) => {
    if (!item.productId) return false;
    const prod = products.find((p) => p.id === item.productId);
    if (!prod) return false;
    const qty = parseInt(String(item.quantity), 10) || 0;
    return qty > prod.quantity;
  });

  const handleProductSelect = (index: number, productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (prod) {
      setValue(`items.${index}.price`, parseFloat(String(prod.sellPrice)) || 0);
      setValue(`items.${index}.customerWarranty`, prod.warrantyPeriod || 0);
    }
  };

  const onSubmit = async (data: FormValues) => {
    if (!data.customerId) {
      toast.error("Please select a customer");
      return;
    }

    if (!data.items || data.items.length === 0 || data.items.some(i => !i.productId)) {
      toast.error("Please add at least one valid product line item");
      return;
    }

    // Submit-time stock validation check
    for (const item of data.items) {
      const prod = products.find(p => p.id === item.productId);
      if (prod) {
        const qty = parseInt(String(item.quantity), 10) || 0;
        if (qty > prod.quantity) {
          toast.error(`Insufficient Stock! Only ${prod.quantity} units left for ${prod.name}`);
          return;
        }
      }
    }

    try {
      const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
      
      const payloadItems = data.items.map((item) => ({
        productId: item.productId,
        quantity: parseInt(String(item.quantity), 10) || 1,
        price: parseFloat(String(item.price)) || 0,
        customerWarranty: item.customerWarranty !== undefined ? parseInt(String(item.customerWarranty), 10) : 0,
      }));

      // 1. Create Invoice
      const invoice = await addInvoice({
        number: invoiceNumber,
        customerId: data.customerId,
        total: calculatedTotal,
        date: new Date().toISOString().slice(0, 10),
      }, payloadItems);

      // 2. If cheque, automatically register in Cheques store too
      if (data.paymentMethod === "cheque" && data.chequeNumber && data.bankName && data.chequeDate) {
        await addCheque({
          number: data.chequeNumber,
          bank: data.bankName,
          amount: calculatedTotal,
          date: data.chequeDate,
          status: "pending",
        });
        toast.success("Cheque payment logged automatically");
      }

      // Premium success toast notification with units and names
      const itemsListText = data.items.map((item) => {
        const prod = products.find(p => p.id === item.productId);
        const name = prod ? prod.name : "Product";
        const qty = parseInt(String(item.quantity), 10) || 1;
        return `-${qty} units for ${name}`;
      }).join(", ");

      toast.success(`Invoice created successfully. Inventory updated (${itemsListText}).`);
      router.push("/invoices");
    } catch (err) {
      toast.error("Failed to save invoice");
      console.error(err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/invoices">
          <Button variant="outline" size="icon" className="rounded-full">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Create Invoice</h1>
          <p className="text-xs text-muted-foreground">Draft a new invoice for client billing</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Customer & Info Card */}
        <div className="card-elevated p-6 space-y-4">
          <h3 className="font-semibold text-base border-b pb-2 text-foreground">Client Details</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="customerId">Select Customer</Label>
              <select
                id="customerId"
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-950"
                {...register("customerId", { required: "Customer is required" })}
              >
                <option value="" className="dark:text-black">-- Choose Customer --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id} className="dark:text-black">
                    {c.name} ({c.phone || "No phone"})
                  </option>
                ))}
              </select>
              {errors.customerId && <p className="text-xs text-red-500">{errors.customerId.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <select
                id="paymentMethod"
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-950"
                {...register("paymentMethod")}
              >
                <option value="cash" className="dark:text-black">Cash</option>
                <option value="cheque" className="dark:text-black">Cheque</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dynamic Line Items Card */}
        <div className="card-elevated p-6 space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="font-semibold text-base text-foreground">Product Line Items</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ productId: "", quantity: 1, price: 0, customerWarranty: 0 })}
            >
              <Plus className="h-4 w-4 mr-1" /> Add Item
            </Button>
          </div>

          <div className="space-y-4">
            {fields.map((field, index) => {
              const rowItem = items[index];
              const selectedProduct = rowItem?.productId ? products.find(p => p.id === rowItem.productId) : null;
              const availableStock = selectedProduct ? selectedProduct.quantity : 0;
              const isInsufficient = selectedProduct && (parseInt(String(rowItem.quantity), 10) || 0) > availableStock;

              return (
                <div key={field.id} className="flex flex-col gap-2 border-b sm:border-0 pb-3 sm:pb-0">
                  <div className="flex flex-col sm:flex-row items-end gap-3">
                    <div className="flex-1 w-full space-y-1">
                      <Label className="sm:hidden">Product</Label>
                      <select
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-zinc-950"
                        {...register(`items.${index}.productId` as const, { required: "Product is required" })}
                        onChange={(e) => handleProductSelect(index, e.target.value)}
                      >
                        <option value="" className="dark:text-black">-- Choose Product --</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id} className="dark:text-black">
                            {p.name} (${parseFloat(String(p.sellPrice)).toFixed(2)} · Stock: {p.quantity})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-full sm:w-28 space-y-1">
                      <Label className="sm:hidden">Price ($)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Price"
                        {...register(`items.${index}.price` as const, { required: true, valueAsNumber: true })}
                      />
                    </div>

                    <div className="w-full sm:w-24 space-y-1">
                      <Label className="sm:hidden">Qty</Label>
                      <Input
                        type="number"
                        placeholder="Qty"
                        {...register(`items.${index}.quantity` as const, { required: true, valueAsNumber: true })}
                      />
                    </div>

                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        className="text-destructive shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {/* High-fidelity responsive stock badges, supplier warranty, customer warranty dropdown and warnings */}
                  {selectedProduct && (
                    <div className="flex flex-col gap-2.5 px-3 py-2.5 bg-zinc-50 dark:bg-zinc-900/40 rounded-lg border border-zinc-100 dark:border-zinc-800/40 text-xs transition-all duration-300">
                      {/* Stock & Supplier Warranty Row */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-dashed border-zinc-200 dark:border-zinc-800/60 pb-2">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <span className={cn(
                            "w-2 h-2 rounded-full",
                            availableStock === 0 ? "bg-red-500 animate-pulse" : "bg-emerald-500"
                          )} />
                          <span>Available Stock: <span className="font-semibold text-foreground">{availableStock} units</span></span>
                        </div>
                        
                        {isInsufficient && (
                          <div className="text-red-500 font-bold flex items-center gap-1 animate-pulse">
                            <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                            Insufficient Stock! Only {availableStock} units left
                          </div>
                        )}

                        {/* Supplier Warranty Badge (Read-Only) */}
                        <div className="flex items-center gap-1 text-muted-foreground print:hidden">
                          <span className="px-2 py-0.5 rounded-full bg-zinc-200/60 dark:bg-zinc-800 text-[10px] font-medium text-foreground border border-zinc-300/40 dark:border-zinc-700/40">
                            Supplier Warranty: {selectedProduct.warrantyPeriod ? `${selectedProduct.warrantyPeriod} Months` : "No Warranty"}
                          </span>
                        </div>
                      </div>

                      {/* Customer Warranty Selector Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-0.5">
                        <div className="flex-1 flex items-center gap-2">
                          <Label htmlFor={`items.${index}.customerWarranty`} className="text-[10px] font-bold text-muted-foreground shrink-0 uppercase tracking-wider">
                            Customer Warranty:
                          </Label>
                          <select
                            id={`items.${index}.customerWarranty`}
                            className="flex h-8 w-full sm:w-48 rounded-md border border-input bg-transparent px-2.5 py-1 text-xs shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-zinc-950"
                            {...register(`items.${index}.customerWarranty` as const, { valueAsNumber: true })}
                          >
                            <option value={0} className="dark:text-black">No Warranty</option>
                            <option value={3} className="dark:text-black">3 Months</option>
                            <option value={6} className="dark:text-black">6 Months</option>
                            <option value={12} className="dark:text-black">1 Year (12 Months)</option>
                            <option value={24} className="dark:text-black">2 Years (24 Months)</option>
                            <option value={36} className="dark:text-black">3 Years (36 Months)</option>
                          </select>
                        </div>
                      </div>

                      {/* Dynamic Amber Disclaimer Alert */}
                      {selectedProduct && (parseInt(String(rowItem?.customerWarranty), 10) || 0) !== (selectedProduct.warrantyPeriod || 0) && (
                        <div className="mt-1 flex gap-2 p-2 rounded-md bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 text-[11px] text-amber-850 dark:text-amber-300 leading-relaxed font-medium transition-all duration-300">
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold">⚠️ Disclaimer:</span> The customer warranty differs from the supplier warranty. The shop/vendor bears full financial and service liability for any claims during this extended period.
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Cheque details (conditionally rendered) */}
        {paymentMethod === "cheque" && (
          <div className="card-elevated p-6 space-y-4 bg-muted/10 border-yellow-500/20">
            <h3 className="font-semibold text-base border-b pb-2 text-foreground flex items-center gap-1.5">
              <CreditCard className="h-5 w-5 text-yellow-500" /> Cheque Payment Details
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="chequeNumber">Cheque Number</Label>
                <Input id="chequeNumber" placeholder="CHQ-123456" {...register("chequeNumber", { required: "Required" })} />
                {errors.chequeNumber && <p className="text-xs text-red-500">{errors.chequeNumber.message}</p>}
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="bankName">Bank Name</Label>
                <Input id="bankName" placeholder="Bank of Ceylon" {...register("bankName", { required: "Required" })} />
                {errors.bankName && <p className="text-xs text-red-500">{errors.bankName.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="chequeDate">Due Date</Label>
                <Input id="chequeDate" type="date" {...register("chequeDate", { required: "Required" })} />
                {errors.chequeDate && <p className="text-xs text-red-500">{errors.chequeDate.message}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Form Actions Footer */}
        <div className="flex items-center justify-between border-t pt-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-semibold flex items-center gap-0.5 uppercase">
              <DollarSign className="h-3.5 w-3.5" /> Total Invoice Amount
            </p>
            <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
              ${calculatedTotal.toFixed(2)}
            </p>
          </div>
          
          <div className="flex justify-end gap-3">
            <Link href="/invoices">
              <Button type="button" variant="ghost">Cancel</Button>
            </Link>
            <Button 
              type="submit" 
              size="lg" 
              disabled={hasStockError}
              className={cn(hasStockError && "opacity-50 cursor-not-allowed bg-red-600 hover:bg-red-600 dark:bg-red-950 dark:hover:bg-red-950")}
            >
              {hasStockError ? "Stock Insufficient" : "Confirm Sale"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
