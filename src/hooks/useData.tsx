// ============================================================
// Central data store (React Context) backed by Real Next.js APIs.
// All pages read/write through here so the UI updates instantly
// after any change. Now powered by Prisma & MySQL.
// ============================================================

import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import type { Customer, Product, Warranty, WarrantyView, BackupFile, Category, Brand, Model, Supplier, Repair, Expense, Cheque, Invoice, InvoiceItem } from "@/db/types";
import { describeWarranty } from "@/utils/warranty";
import { toast } from "sonner";

interface DataCtx {
  ready: boolean;
  customers: Customer[];
  products: Product[];
  warranties: Warranty[];
  warrantyViews: WarrantyView[];
  categories: Category[];
  brands: Brand[];
  models: Model[];
  suppliers: Supplier[];
  repairs: Repair[];
  expenses: Expense[];
  cheques: Cheque[];
  invoices: Invoice[];
  invoiceItems: InvoiceItem[];

  // Customers
  addCustomer: (data: Omit<Customer, "id" | "createdAt">) => Promise<Customer>;
  updateCustomer: (id: string, data: Partial<Omit<Customer, "id">>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;

  // Products
  addProduct: (data: Omit<Product, "id" | "createdAt">) => Promise<Product>;
  updateProduct: (id: string, data: Partial<Omit<Product, "id">>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

  // Warranties
  addWarranty: (data: Omit<Warranty, "id" | "createdAt">) => Promise<Warranty>;
  updateWarranty: (id: string, data: Partial<Omit<Warranty, "id">>) => Promise<void>;
  deleteWarranty: (id: string) => Promise<void>;

  // Attributes
  addCategory: (name: string) => Promise<Category>;
  updateCategory: (id: string, name: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  
  addBrand: (name: string) => Promise<Brand>;
  updateBrand: (id: string, name: string) => Promise<void>;
  deleteBrand: (id: string) => Promise<void>;

  addModel: (name: string) => Promise<Model>;
  updateModel: (id: string, name: string) => Promise<void>;
  deleteModel: (id: string) => Promise<void>;

  addSupplier: (data: Omit<Supplier, "id" | "createdAt">) => Promise<Supplier>;
  updateSupplier: (id: string, data: Partial<Omit<Supplier, "id">>) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;

  addRepair: (data: Omit<Repair, "id" | "createdAt">) => Promise<Repair>;
  updateRepair: (id: string, data: Partial<Omit<Repair, "id">>) => Promise<void>;
  deleteRepair: (id: string) => Promise<void>;

  addExpense: (data: Omit<Expense, "id" | "createdAt">) => Promise<Expense>;
  updateExpense: (id: string, data: Partial<Omit<Expense, "id">>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;

  addCheque: (data: Omit<Cheque, "id" | "createdAt">) => Promise<Cheque>;
  updateCheque: (id: string, data: Partial<Omit<Cheque, "id">>) => Promise<void>;
  deleteCheque: (id: string) => Promise<void>;

  addInvoice: (data: Omit<Invoice, "id" | "createdAt">, items: Omit<InvoiceItem, "id" | "invoiceId">[]) => Promise<Invoice>;
  deleteInvoice: (id: string) => Promise<void>;

  // Backup
  exportBackup: () => BackupFile;
  importBackup: (file: BackupFile, mode: "merge" | "replace") => Promise<void>;
  resetAll: () => Promise<void>;
}

const Ctx = createContext<DataCtx | null>(null);

// Helper to interact with real APIs
async function apiCall(endpoint: string, method: "GET" | "POST" | "PUT" | "DELETE" = "GET", body?: any) {
  const headers: HeadersInit = { "x-tenant-id": "cmpc620w20007ezgn2axsmt9p" };
  if (body) headers["Content-Type"] = "application/json";
  
  const res = await fetch(`/api/${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `API Error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warranties, setWarranties] = useState<Warranty[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [cheques, setCheques] = useState<Cheque[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [, setTick] = useState(0);

  // Load everything once on mount from Real APIs
  useEffect(() => {
    (async () => {
      try {
        const [c, p, w, cat, br, mod, sup, rep, exp, chq, inv] = await Promise.all([
          apiCall("customers"), apiCall("products"), apiCall("warranties"),
          apiCall("categories"), apiCall("brands"), apiCall("models"),
          apiCall("suppliers"), apiCall("repairs"), apiCall("expenses"),
          apiCall("cheques"), apiCall("invoices")
        ]);
        setCustomers(c || []);
        setProducts(p || []);
        setWarranties(w || []);
        setCategories(cat || []);
        setBrands(br || []);
        setModels(mod || []);
        setSuppliers(sup || []);
        setRepairs(rep || []);
        setExpenses(exp || []);
        setCheques(chq || []);
        
        // Extract invoice items from invoices (if nested) or fetch them separately
        // Usually prisma invoice include items would return them nested.
        // Let's flatten them for the context if they are nested.
        let items: InvoiceItem[] = [];
        const flatInvoices = (inv || []).map((i: any) => {
          if (i.items) {
            items = [...items, ...i.items];
            const { items: _, ...rest } = i;
            return rest;
          }
          return i;
        });

        setInvoices(flatInvoices);
        setInvoiceItems(items);
        setReady(true);
      } catch (e: any) {
        toast.error("Failed to load data from backend: " + e.message);
        setReady(true);
      }
    })();
  }, []);

  // Recompute "days left" every minute so cards refresh over time.
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  // ---------- Customers ----------
  const addCustomer: DataCtx["addCustomer"] = useCallback(async (data) => {
    const c = await apiCall("customers", "POST", data);
    setCustomers((prev) => [...prev, c]);
    return c;
  }, []);
  const updateCustomer: DataCtx["updateCustomer"] = useCallback(async (id, data) => {
    const updated = await apiCall(`customers/${id}`, "PUT", data);
    setCustomers((prev) => prev.map((c) => (c.id === id ? updated : c)));
  }, []);
  const deleteCustomer: DataCtx["deleteCustomer"] = useCallback(async (id) => {
    await apiCall(`customers/${id}`, "DELETE");
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    setWarranties((prev) => prev.filter((w) => w.customerId !== id));
  }, []);

  // ---------- Products ----------
  const addProduct: DataCtx["addProduct"] = useCallback(async (data) => {
    const p = await apiCall("products", "POST", data);
    setProducts((prev) => [...prev, p]);
    return p;
  }, []);
  const updateProduct: DataCtx["updateProduct"] = useCallback(async (id, data) => {
    const updated = await apiCall(`products/${id}`, "PUT", data);
    setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
  }, []);
  const deleteProduct: DataCtx["deleteProduct"] = useCallback(async (id) => {
    await apiCall(`products/${id}`, "DELETE");
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setWarranties((prev) => prev.filter((w) => w.productId !== id));
  }, []);

  // ---------- Warranties ----------
  const addWarranty: DataCtx["addWarranty"] = useCallback(async (data) => {
    const w = await apiCall("warranties", "POST", data);
    setWarranties((prev) => [...prev, w]);
    return w;
  }, []);
  const updateWarranty: DataCtx["updateWarranty"] = useCallback(async (id, data) => {
    const updated = await apiCall(`warranties/${id}`, "PUT", data);
    setWarranties((prev) => prev.map((w) => (w.id === id ? updated : w)));
  }, []);
  const deleteWarranty: DataCtx["deleteWarranty"] = useCallback(async (id) => {
    await apiCall(`warranties/${id}`, "DELETE");
    setWarranties((prev) => prev.filter((w) => w.id !== id));
  }, []);

  // ---------- Attributes ----------
  const addCategory: DataCtx["addCategory"] = useCallback(async (name) => {
    const c = await apiCall("categories", "POST", { name: name.trim() });
    setCategories((prev) => [...prev, c]);
    return c;
  }, []);
  const updateCategory: DataCtx["updateCategory"] = useCallback(async (id, name) => {
    const updated = await apiCall(`categories/${id}`, "PUT", { name: name.trim() });
    setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)));
  }, []);
  const deleteCategory: DataCtx["deleteCategory"] = useCallback(async (id) => {
    await apiCall(`categories/${id}`, "DELETE");
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const addBrand: DataCtx["addBrand"] = useCallback(async (name) => {
    const b = await apiCall("brands", "POST", { name: name.trim() });
    setBrands((prev) => [...prev, b]);
    return b;
  }, []);
  const updateBrand: DataCtx["updateBrand"] = useCallback(async (id, name) => {
    const updated = await apiCall(`brands/${id}`, "PUT", { name: name.trim() });
    setBrands((prev) => prev.map((b) => (b.id === id ? updated : b)));
  }, []);
  const deleteBrand: DataCtx["deleteBrand"] = useCallback(async (id) => {
    await apiCall(`brands/${id}`, "DELETE");
    setBrands((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const addModel: DataCtx["addModel"] = useCallback(async (name) => {
    const m = await apiCall("models", "POST", { name: name.trim() });
    setModels((prev) => [...prev, m]);
    return m;
  }, []);
  const updateModel: DataCtx["updateModel"] = useCallback(async (id, name) => {
    const updated = await apiCall(`models/${id}`, "PUT", { name: name.trim() });
    setModels((prev) => prev.map((m) => (m.id === id ? updated : m)));
  }, []);
  const deleteModel: DataCtx["deleteModel"] = useCallback(async (id) => {
    await apiCall(`models/${id}`, "DELETE");
    setModels((prev) => prev.filter((m) => m.id !== id));
  }, []);

  // ---------- Suppliers ----------
  const addSupplier: DataCtx["addSupplier"] = useCallback(async (data) => {
    const s = await apiCall("suppliers", "POST", data);
    setSuppliers((prev) => [...prev, s]);
    return s;
  }, []);
  const updateSupplier: DataCtx["updateSupplier"] = useCallback(async (id, data) => {
    const updated = await apiCall(`suppliers/${id}`, "PUT", data);
    setSuppliers((prev) => prev.map((s) => (s.id === id ? updated : s)));
  }, []);
  const deleteSupplier: DataCtx["deleteSupplier"] = useCallback(async (id) => {
    await apiCall(`suppliers/${id}`, "DELETE");
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
  }, []);

  // ---------- Repairs ----------
  const addRepair: DataCtx["addRepair"] = useCallback(async (data) => {
    const r = await apiCall("repairs", "POST", data);
    setRepairs((prev) => [...prev, r]);
    return r;
  }, []);
  const updateRepair: DataCtx["updateRepair"] = useCallback(async (id, data) => {
    const updated = await apiCall(`repairs/${id}`, "PUT", data);
    setRepairs((prev) => prev.map((r) => (r.id === id ? updated : r)));
  }, []);
  const deleteRepair: DataCtx["deleteRepair"] = useCallback(async (id) => {
    await apiCall(`repairs/${id}`, "DELETE");
    setRepairs((prev) => prev.filter((r) => r.id !== id));
  }, []);

  // ---------- Expenses ----------
  const addExpense: DataCtx["addExpense"] = useCallback(async (data) => {
    const e = await apiCall("expenses", "POST", data);
    setExpenses((prev) => [...prev, e]);
    return e;
  }, []);
  const updateExpense: DataCtx["updateExpense"] = useCallback(async (id, data) => {
    const updated = await apiCall(`expenses/${id}`, "PUT", data);
    setExpenses((prev) => prev.map((e) => (e.id === id ? updated : e)));
  }, []);
  const deleteExpense: DataCtx["deleteExpense"] = useCallback(async (id) => {
    await apiCall(`expenses/${id}`, "DELETE");
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const addCheque: DataCtx["addCheque"] = useCallback(async (data) => {
    const c = await apiCall("cheques", "POST", data);
    setCheques((prev) => [...prev, c]);
    return c;
  }, []);
  const updateCheque: DataCtx["updateCheque"] = useCallback(async (id, data) => {
    const updated = await apiCall(`cheques/${id}`, "PUT", data);
    setCheques((prev) => prev.map((c) => (c.id === id ? updated : c)));
  }, []);
  const deleteCheque: DataCtx["deleteCheque"] = useCallback(async (id) => {
    await apiCall(`cheques/${id}`, "DELETE");
    setCheques((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const addInvoice: DataCtx["addInvoice"] = useCallback(async (data, items) => {
    const inv = await apiCall("invoices", "POST", { ...data, items });
    
    // The backend should return the created invoice with items
    const { items: savedItems, ...invData } = inv;
    setInvoices((prev) => [...prev, invData]);
    if (savedItems) setInvoiceItems((prev) => [...prev, ...savedItems]);

    // Refresh products to update quantities correctly from the backend
    try {
      const p = await apiCall("products");
      setProducts(p || []);
    } catch(e){}

    return inv;
  }, []);

  const deleteInvoice: DataCtx["deleteInvoice"] = useCallback(async (id) => {
    await apiCall(`invoices/${id}`, "DELETE");
    setInvoices((prev) => prev.filter((i) => i.id !== id));
    setInvoiceItems((prev) => prev.filter((ii) => ii.invoiceId !== id));
  }, []);

  // ---------- Joined view ----------
  const warrantyViews = useMemo<WarrantyView[]>(() => {
    const cMap = new Map(customers.map((c) => [c.id, c]));
    const pMap = new Map(products.map((p) => [p.id, p]));
    return warranties
      .map((w) => {
        const { expiry, daysLeft, status } = describeWarranty(w);
        return {
          ...w,
          customer: cMap.get(w.customerId),
          product: pMap.get(w.productId),
          expiryDate: expiry.toISOString(),
          daysLeft,
          status,
        };
      })
      .sort((a, b) => a.daysLeft - b.daysLeft);
  }, [warranties, customers, products]);

  // ---------- Backup ----------
  const exportBackup = useCallback<DataCtx["exportBackup"]>(() => ({
    app: "warranty-manager",
    version: 1,
    exportedAt: new Date().toISOString(),
    customers,
    products,
    warranties,
  }), [customers, products, warranties]);

  const importBackup = useCallback<DataCtx["importBackup"]>(async (file, mode) => {
    toast.error("Import backup is disabled in online-first mode.");
  }, []);

  const resetAll = useCallback(async () => {
    toast.error("Reset all is disabled in online-first mode.");
  }, []);

  const value: DataCtx = {
    ready, customers, products, warranties, warrantyViews, categories, brands, models, suppliers, repairs, expenses, cheques, invoices, invoiceItems,
    addCustomer, updateCustomer, deleteCustomer,
    addProduct, updateProduct, deleteProduct,
    addWarranty, updateWarranty, deleteWarranty,
    addCategory, updateCategory, deleteCategory,
    addBrand, updateBrand, deleteBrand,
    addModel, updateModel, deleteModel,
    addSupplier, updateSupplier, deleteSupplier,
    addRepair, updateRepair, deleteRepair,
    addExpense, updateExpense, deleteExpense,
    addCheque, updateCheque, deleteCheque,
    addInvoice, deleteInvoice,
    exportBackup, importBackup, resetAll,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useData() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useData must be inside <DataProvider>");
  return ctx;
}
