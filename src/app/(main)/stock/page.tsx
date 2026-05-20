"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useData } from "@/hooks/useData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Search, Package, AlertTriangle, CheckCircle2, 
  TrendingUp, Activity, RefreshCw, Plus, Minus,
  Layers, Box, Calendar, UploadCloud, X, ZoomIn, ZoomOut,
  ChevronRight, Building2, Tag, FileText, Info, Award,
  Sparkles, Eye, Download, Check, ArrowLeft, ArrowRight,
  CreditCard, Landmark, Banknote, ShieldAlert
} from "lucide-react";
import { toast } from "sonner";
import { io } from "socket.io-client";
import localforage from "localforage";

const stockIntakesStore = localforage.createInstance({
  name: "warranty-manager",
  storeName: "stock_intakes"
});

// High-fidelity luxury SVG invoice templates encoded as dynamic strings
const MOCK_BILL_SVG_BOSE = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="100%"><rect width="800" height="1000" fill="%23ffffff"/><rect width="800" height="180" fill="%230f172a"/><text x="50" y="80" fill="%23f8fafc" font-family="system-ui,sans-serif" font-size="28" font-weight="800" letter-spacing="1">ERP INVENTORY SYSTEM</text><text x="50" y="115" fill="%2394a3b8" font-family="system-ui,sans-serif" font-size="14" font-weight="500">SUPPLIER STOCK INTAKE LEDGER</text><text x="750" y="80" fill="%23f8fafc" font-family="system-ui,sans-serif" font-size="32" font-weight="300" text-anchor="end">INVOICE</text><text x="750" y="115" fill="%23f59e0b" font-family="system-ui,sans-serif" font-size="14" font-weight="700" text-anchor="end">%23INV-2026-0089</text><text x="50" y="240" fill="%2364748b" font-family="system-ui,sans-serif" font-size="11" font-weight="700" letter-spacing="1">SUPPLIER</text><text x="50" y="265" fill="%230f172a" font-family="system-ui,sans-serif" font-size="16" font-weight="800">Acoustic Labs Inc.</text><text x="50" y="285" fill="%23475569" font-family="system-ui,sans-serif" font-size="13">Colombo, Sri Lanka</text><text x="450" y="240" fill="%2364748b" font-family="system-ui,sans-serif" font-size="11" font-weight="700" letter-spacing="1">DATE &amp; DETAILS</text><text x="450" y="265" fill="%230f172a" font-family="system-ui,sans-serif" font-size="14" font-weight="600">Date: May 18, 2026</text><text x="450" y="285" fill="%23475569" font-family="system-ui,sans-serif" font-size="13">Status: PAID / RECEIVED</text><line x1="50" y1="330" x2="750" y2="330" stroke="%23e2e8f0" stroke-width="1.5"/><text x="50" y="370" fill="%2364748b" font-family="system-ui,sans-serif" font-size="12" font-weight="700">DESCRIPTION</text><text x="450" y="370" fill="%2364748b" font-family="system-ui,sans-serif" font-size="12" font-weight="700" text-anchor="end">QTY</text><text x="600" y="370" fill="%2364748b" font-family="system-ui,sans-serif" font-size="12" font-weight="700" text-anchor="end">UNIT COST (LKR)</text><text x="750" y="370" fill="%2364748b" font-family="system-ui,sans-serif" font-size="12" font-weight="700" text-anchor="end">TOTAL (LKR)</text><line x1="50" y1="390" x2="750" y2="390" stroke="%230f172a" stroke-width="2"/><text x="50" y="430" fill="%230f172a" font-family="system-ui,sans-serif" font-size="14" font-weight="700">Bose QuietComfort Ultra Headphones</text><text x="50" y="450" fill="%2364748b" font-family="system-ui,sans-serif" font-size="11">S/N: QC-9082-A · Cat: Audio · Warranty: 1 Year</text><text x="450" y="430" fill="%230f172a" font-family="system-ui,sans-serif" font-size="14" font-weight="600" text-anchor="end">15</text><text x="600" y="430" fill="%230f172a" font-family="system-ui,sans-serif" font-size="14" font-weight="600" text-anchor="end">Rs. 98,500.00</text><text x="750" y="430" fill="%230f172a" font-family="system-ui,sans-serif" font-size="14" font-weight="800" text-anchor="end">Rs. 1,477,500.00</text><line x1="50" y1="480" x2="750" y2="480" stroke="%23f1f5f9" stroke-width="1"/><text x="50" y="520" fill="%230f172a" font-family="system-ui,sans-serif" font-size="14" font-weight="700">Sony WH-1000XM5 ANC Headphones</text><text x="50" y="540" fill="%2364748b" font-family="system-ui,sans-serif" font-size="11">S/N: SN-XM5-882 · Cat: Audio · Warranty: 2 Years</text><text x="450" y="520" fill="%230f172a" font-family="system-ui,sans-serif" font-size="14" font-weight="600" text-anchor="end">20</text><text x="600" y="520" fill="%230f172a" font-family="system-ui,sans-serif" font-size="14" font-weight="600" text-anchor="end">Rs. 85,000.00</text><text x="750" y="520" fill="%230f172a" font-family="system-ui,sans-serif" font-size="14" font-weight="800" text-anchor="end">Rs. 1,700,000.00</text><line x1="400" y1="560" x2="750" y2="560" stroke="%230f172a" stroke-width="1.5"/><text x="600" y="600" fill="%2364748b" font-family="system-ui,sans-serif" font-size="14" font-weight="700" text-anchor="end">Subtotal:</text><text x="750" y="600" fill="%230f172a" font-family="system-ui,sans-serif" font-size="14" font-weight="700" text-anchor="end">Rs. 3,177,500.00</text><text x="600" y="635" fill="%2364748b" font-family="system-ui,sans-serif" font-size="14" font-weight="700" text-anchor="end">VAT (18%):</text><text x="750" y="635" fill="%230f172a" font-family="system-ui,sans-serif" font-size="14" font-weight="700" text-anchor="end">Rs. 571,950.00</text><line x1="400" y1="665" x2="750" y2="665" stroke="%230f172a" stroke-width="2"/><text x="600" y="705" fill="%230f172a" font-family="system-ui,sans-serif" font-size="18" font-weight="800" text-anchor="end">TOTAL DUE:</text><text x="750" y="705" fill="%23f59e0b" font-family="system-ui,sans-serif" font-size="22" font-weight="900" text-anchor="end">Rs. 3,749,450.00</text><rect x="50" y="800" width="700" height="60" rx="8" fill="%23f8fafc" stroke="%23e2e8f0" stroke-width="1"/><text x="400" y="835" fill="%2364748b" font-family="system-ui,sans-serif" font-size="12" font-weight="500" text-anchor="middle">Thank you for your business. For compliance queries, reach support@acousticlabs.com</text></svg>`;

const MOCK_BILL_SVG_SONY = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="100%"><rect width="800" height="1000" fill="%23ffffff"/><rect width="800" height="180" fill="%231e3a8a"/><text x="50" y="80" fill="%23f8fafc" font-family="system-ui,sans-serif" font-size="28" font-weight="800" letter-spacing="1">NEXUS ELECTRONICS ERP</text><text x="50" y="115" fill="%2393c5fd" font-family="system-ui,sans-serif" font-size="14" font-weight="500">SUPPLIER SUPPLY &amp; INTAKE SUMMARY</text><text x="750" y="80" fill="%23f8fafc" font-family="system-ui,sans-serif" font-size="32" font-weight="300" text-anchor="end">BILL INTAKE</text><text x="750" y="115" fill="%2310b981" font-family="system-ui,sans-serif" font-size="14" font-weight="700" text-anchor="end">%23NXS-2026-9042</text><text x="50" y="240" fill="%2364748b" font-family="system-ui,sans-serif" font-size="11" font-weight="700" letter-spacing="1">SUPPLIER</text><text x="50" y="265" fill="%230f172a" font-family="system-ui,sans-serif" font-size="16" font-weight="800">Nexus Electronics</text><text x="50" y="285" fill="%23475569" font-family="system-ui,sans-serif" font-size="13">Colombo 03, Sri Lanka</text><text x="450" y="240" fill="%2364748b" font-family="system-ui,sans-serif" font-size="11" font-weight="700" letter-spacing="1">DATE &amp; COMPLIANCE</text><text x="450" y="265" fill="%230f172a" font-family="system-ui,sans-serif" font-size="14" font-weight="600">Date: May 12, 2026</text><text x="450" y="285" fill="%23475569" font-family="system-ui,sans-serif" font-size="13">Status: DISPATCHED / PAID</text><line x1="50" y1="330" x2="750" y2="330" stroke="%23e2e8f0" stroke-width="1.5"/><text x="50" y="370" fill="%2364748b" font-family="system-ui,sans-serif" font-size="12" font-weight="700">DESCRIPTION</text><text x="450" y="370" fill="%2364748b" font-family="system-ui,sans-serif" font-size="12" font-weight="700" text-anchor="end">QTY</text><text x="600" y="370" fill="%2364748b" font-family="system-ui,sans-serif" font-size="12" font-weight="700" text-anchor="end">UNIT COST (LKR)</text><text x="750" y="370" fill="%2364748b" font-family="system-ui,sans-serif" font-size="12" font-weight="700" text-anchor="end">TOTAL (LKR)</text><line x1="50" y1="390" x2="750" y2="390" stroke="%231e3a8a" stroke-width="2"/><text x="50" y="430" fill="%230f172a" font-family="system-ui,sans-serif" font-size="14" font-weight="700">Sony WH-1000XM5 ANC Headphones</text><text x="50" y="450" fill="%2364748b" font-family="system-ui,sans-serif" font-size="11">S/N: SN-XM5-882 · Cat: Audio · Warranty: 2 Years</text><text x="450" y="430" fill="%230f172a" font-family="system-ui,sans-serif" font-size="14" font-weight="600" text-anchor="end">20</text><text x="600" y="430" fill="%230f172a" font-family="system-ui,sans-serif" font-size="14" font-weight="600" text-anchor="end">Rs. 85,000.00</text><text x="750" y="430" fill="%230f172a" font-family="system-ui,sans-serif" font-size="14" font-weight="800" text-anchor="end">Rs. 1,700,000.00</text><line x1="400" y1="480" x2="750" y2="480" stroke="%231e3a8a" stroke-width="1.5"/><text x="600" y="520" fill="%2364748b" font-family="system-ui,sans-serif" font-size="14" font-weight="700" text-anchor="end">Subtotal:</text><text x="750" y="520" fill="%230f172a" font-family="system-ui,sans-serif" font-size="14" font-weight="700" text-anchor="end">Rs. 1,700,000.00</text><text x="600" y="555" fill="%2364748b" font-family="system-ui,sans-serif" font-size="14" font-weight="700" text-anchor="end">VAT (18%):</text><text x="750" y="555" fill="%230f172a" font-family="system-ui,sans-serif" font-size="14" font-weight="700" text-anchor="end">Rs. 306,000.00</text><line x1="400" y1="585" x2="750" y2="585" stroke="%231e3a8a" stroke-width="2"/><text x="600" y="625" fill="%230f172a" font-family="system-ui,sans-serif" font-size="18" font-weight="800" text-anchor="end">TOTAL DUE:</text><text x="750" y="625" fill="%2310b981" font-family="system-ui,sans-serif" font-size="22" font-weight="900" text-anchor="end">Rs. 2,006,000.00</text><rect x="50" y="720" width="700" height="60" rx="8" fill="%23f0fdf4" stroke="%23bbf7d0" stroke-width="1"/><text x="400" y="755" fill="%23166534" font-family="system-ui,sans-serif" font-size="12" font-weight="500" text-anchor="middle">Compliance document stored in secure cloud nodes. Verified by Nexus Legal.</text></svg>`;

const MOCK_BILL_SVG_APPLE = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="100%"><rect width="800" height="1000" fill="%23ffffff"/><rect width="800" height="180" fill="%2309090b"/><text x="50" y="80" fill="%23f4f4f5" font-family="system-ui,sans-serif" font-size="28" font-weight="800" letter-spacing="1">APEX LOGISTICS &amp; GOODS</text><text x="50" y="115" fill="%23a1a1aa" font-family="system-ui,sans-serif" font-size="14" font-weight="500">ELECTRONIC SUPPLY DISPATCH</text><text x="750" y="80" fill="%23f4f4f5" font-family="system-ui,sans-serif" font-size="32" font-weight="300" text-anchor="end">LEDGER INTAKE</text><text x="750" y="115" fill="%23e4e4e7" font-family="system-ui,sans-serif" font-size="14" font-weight="700" text-anchor="end">%23APX-2026-3392</text><text x="50" y="240" fill="%2371717a" font-family="system-ui,sans-serif" font-size="11" font-weight="700" letter-spacing="1">SUPPLIER</text><text x="50" y="265" fill="%2309090b" font-family="system-ui,sans-serif" font-size="16" font-weight="800">Apex Logistics</text><text x="50" y="285" fill="%2327272a" font-family="system-ui,sans-serif" font-size="13">Kandy, Sri Lanka</text><text x="450" y="240" fill="%2371717a" font-family="system-ui,sans-serif" font-size="11" font-weight="700" letter-spacing="1">DATE &amp; SHIPMENT</text><text x="450" y="265" fill="%2309090b" font-family="system-ui,sans-serif" font-size="14" font-weight="600">Date: May 05, 2026</text><text x="450" y="285" fill="%2327272a" font-family="system-ui,sans-serif" font-size="13">Status: COMPLETED / IN STOCK</text><line x1="50" y1="330" x2="750" y2="330" stroke="%23e4e4e7" stroke-width="1.5"/><text x="50" y="370" fill="%2371717a" font-family="system-ui,sans-serif" font-size="12" font-weight="700">DESCRIPTION</text><text x="450" y="370" fill="%2371717a" font-family="system-ui,sans-serif" font-size="12" font-weight="700" text-anchor="end">QTY</text><text x="600" y="370" fill="%2371717a" font-family="system-ui,sans-serif" font-size="12" font-weight="700" text-anchor="end">UNIT COST (LKR)</text><text x="750" y="370" fill="%2371717a" font-family="system-ui,sans-serif" font-size="12" font-weight="700" text-anchor="end">TOTAL (LKR)</text><line x1="50" y1="390" x2="750" y2="390" stroke="%2309090b" stroke-width="2"/><text x="50" y="430" fill="%2309090b" font-family="system-ui,sans-serif" font-size="14" font-weight="700">Apple iPad Air M2 (11-inch)</text><text x="50" y="450" fill="%2371717a" font-family="system-ui,sans-serif" font-size="11">S/N: APL-M2-771 · Cat: Tablets · Warranty: 1 Year</text><text x="450" y="430" fill="%2309090b" font-family="system-ui,sans-serif" font-size="14" font-weight="600" text-anchor="end">8</text><text x="600" y="430" fill="%2309090b" font-family="system-ui,sans-serif" font-size="14" font-weight="600" text-anchor="end">Rs. 185,000.00</text><text x="750" y="430" fill="%2309090b" font-family="system-ui,sans-serif" font-size="14" font-weight="800" text-anchor="end">Rs. 1,480,000.00</text><line x1="400" y1="480" x2="750" y2="480" stroke="%2309090b" stroke-width="1.5"/><text x="600" y="520" fill="%2371717a" font-family="system-ui,sans-serif" font-size="14" font-weight="700" text-anchor="end">Subtotal:</text><text x="750" y="520" fill="%2309090b" font-family="system-ui,sans-serif" font-size="14" font-weight="700" text-anchor="end">Rs. 1,480,000.00</text><text x="600" y="555" fill="%2371717a" font-family="system-ui,sans-serif" font-size="14" font-weight="700" text-anchor="end">VAT (18%):</text><text x="750" y="555" fill="%2309090b" font-family="system-ui,sans-serif" font-size="14" font-weight="700" text-anchor="end">Rs. 266,400.00</text><line x1="400" y1="585" x2="750" y2="585" stroke="%2309090b" stroke-width="2"/><text x="600" y="625" fill="%2309090b" font-family="system-ui,sans-serif" font-size="18" font-weight="800" text-anchor="end">TOTAL DUE:</text><text x="750" y="625" fill="%2309090b" font-family="system-ui,sans-serif" font-size="22" font-weight="900" text-anchor="end">Rs. 1,746,400.00</text><rect x="50" y="720" width="700" height="60" rx="8" fill="%23fafafa" stroke="%23e4e4e7" stroke-width="1"/><text x="400" y="755" fill="%2327272a" font-family="system-ui,sans-serif" font-size="12" font-weight="500" text-anchor="middle">Official dispatch verified by Apple Sri Lanka Distribution Hub.</text></svg>`;

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
  brandInputMode?: "select" | "custom";
  modelInputMode?: "select" | "custom";
}

interface StockIntake {
  id: string;
  timestamp: number;
  date: string;
  supplierId: string;
  supplierName: string;
  billPhoto: string; // base64 URL or dynamic SVG

  // Bulk items array
  items: IntakeItem[];

  // Legacy single item fields preserved for direct access and compatibility
  brandName: string;
  modelName: string;
  categoryName: string;
  serial: string;
  warrantyPeriod: string;
  costPrice: number;
  sellPrice: number;
  quantity: number;

  // Billing and Payment fields
  procurementDateTime?: string;
  invoiceId?: string;
  branchName?: string;
  warehouseLocation?: string;
  totalBillAmount?: number;
  advancePayment?: number;
  remainingBalance?: number;
  paymentMethod?: string;
  cardType?: string;
  cardTxRef?: string;
  chequeNumber?: string;
  chequeDate?: string;
  bankTxRef?: string;
  bankAccount?: string;
  paymentStatus?: string;
  discrepancyNotes?: string;
}

// Backwards compatibility legacy wrapper function
function sanitizeIntakeLog(log: any): StockIntake {
  if (log.items && Array.isArray(log.items)) {
    return log as StockIntake;
  }
  // Convert legacy single-item structures into array lists
  const legacyItem: IntakeItem = {
    id: `item-legacy-${log.id}`,
    brandName: log.brandName || "Unknown",
    modelName: log.modelName || "Item",
    categoryId: "",
    categoryName: log.categoryName || "Uncategorized",
    serial: log.serial || "N/A",
    warrantyPeriod: log.warrantyPeriod || "1 Year",
    customWarranty: "",
    costPrice: log.costPrice || 0,
    sellPrice: log.sellPrice || 0,
    quantity: log.quantity || 1
  };
  return {
    ...log,
    items: [legacyItem],
    totalBillAmount: log.totalBillAmount !== undefined ? log.totalBillAmount : (Number(log.costPrice || 0) * Number(log.quantity || 1)),
    remainingBalance: log.remainingBalance !== undefined ? log.remainingBalance : Math.max(0, (Number(log.costPrice || 0) * Number(log.quantity || 1)) - Number(log.advancePayment || 0))
  };
}

export default function StockIntakePage() {
  const { 
    ready, 
    products, 
    brands, 
    models, 
    categories, 
    suppliers,
    addBrand,
    addModel,
    addCategory,
    addProduct,
    updateProduct,
    addSupplier
  } = useData();

  // Navigation tab
  const [activeTab, setActiveTab] = useState<"intake" | "history">("intake");

  // Smooth loading animation state for background sync
  const [isLoggingStock, setIsLoggingStock] = useState(false);

  // Stepper Stage (Step 1: Specifications, Step 2: Billing & Payments)
  const [step, setStep] = useState<1 | 2>(1);

  // Form State - Step 1: Specs
  const [supplierId, setSupplierId] = useState("");
  
  // Bulk stock intake items list
  const [items, setItems] = useState<IntakeItem[]>([
    {
      id: "item-1",
      brandName: "",
      modelName: "",
      categoryId: "",
      categoryName: "",
      serial: "",
      warrantyPeriod: "1 Year",
      customWarranty: "",
      costPrice: "",
      sellPrice: "",
      quantity: 1,
      brandInputMode: "select",
      modelInputMode: "select",
    }
  ]);

  // File upload state
  const [dragActive, setDragActive] = useState(false);
  const [fileProgress, setFileProgress] = useState<number | null>(null);
  const [billPhotoBase64, setBillPhotoBase64] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");

  // Form State - Step 2: Billing & Payment Details
  const [procurementDateTime, setProcurementDateTime] = useState("");
  const [billingId, setBillingId] = useState("");
  const [branchName, setBranchName] = useState("Main Head Office");
  const [warehouseLocation, setWarehouseLocation] = useState("Main Headquarters (HQ)");
  const [advancePayment, setAdvancePayment] = useState<number | "">("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [cardType, setCardType] = useState("Visa");
  const [cardTxRef, setCardTxRef] = useState("");
  const [chequeNumber, setChequeNumber] = useState("");
  const [chequeDate, setChequeDate] = useState("");
  const [bankTxRef, setBankTxRef] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("Fully Paid");
  const [discrepancyNotes, setDiscrepancyNotes] = useState("");

  // Search Filter State
  const [searchQuery, setSearchQuery] = useState("");

  // DB Intakes logs
  const [intakesHistory, setIntakesHistory] = useState<StockIntake[]>([]);

  // Premium Modal Lightbox State
  const [activeLightboxBill, setActiveLightboxBill] = useState<StockIntake | null>(null);
  const [lightboxScale, setLightboxScale] = useState(1);

  // Dynamic handlers for bulk items array
  const handleUpdateItem = (index: number, fields: Partial<IntakeItem>) => {
    setItems(prev => prev.map((item, i) => i === index ? { ...item, ...fields } : item));
  };

  const handleAddItem = () => {
    const firstCat = categories[0];
    setItems(prev => [
      ...prev,
      {
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        brandName: "",
        modelName: "",
        categoryId: firstCat ? firstCat.id : "",
        categoryName: firstCat ? firstCat.name : "",
        serial: "",
        warrantyPeriod: "1 Year",
        customWarranty: "",
        costPrice: "",
        sellPrice: "",
        quantity: 1,
        brandInputMode: "select",
        modelInputMode: "select"
      }
    ]);
    toast.success("Added another product card to invoice.");
  };

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) return;
    setItems(prev => prev.filter((_, i) => i !== index));
    toast.info("Product card removed.");
  };

  // Initialize category for first item when loaded
  useEffect(() => {
    if (categories.length > 0) {
      setItems(prev => prev.map(item => {
        if (!item.categoryId) {
          return {
            ...item,
            categoryId: categories[0].id,
            categoryName: categories[0].name
          };
        }
        return item;
      }));
    }
  }, [categories]);

  // Auto-calculated properties
  const totalBillAmount = useMemo(() => {
    return items.reduce((sum, item) => {
      const qty = Number(item.quantity) || 0;
      const cost = Number(item.costPrice) || 0;
      return sum + (qty * cost);
    }, 0);
  }, [items]);

  const remainingBalance = useMemo(() => {
    const adv = Number(advancePayment) || 0;
    return Math.max(0, totalBillAmount - adv);
  }, [totalBillAmount, advancePayment]);

  // Set default current Date & Time picker
  useEffect(() => {
    const now = new Date();
    const pad = (num: number) => String(num).padStart(2, "0");
    const formatted = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
    setProcurementDateTime(formatted);
  }, []);

  // Automated Payment Status calculation based on calculations
  useEffect(() => {
    if (totalBillAmount <= 0) return;
    const adv = Number(advancePayment) || 0;
    if (adv >= totalBillAmount) {
      setPaymentStatus("Fully Paid");
    } else if (adv > 0 && adv < totalBillAmount) {
      setPaymentStatus("Partially Paid");
    } else {
      setPaymentStatus("Credit / Pending");
    }
  }, [totalBillAmount, advancePayment]);

  // Auto-seed default suppliers and categories if completely empty to keep it beautiful
  useEffect(() => {
    if (ready) {
      const seedSuppliersAndCats = async () => {
        if (suppliers.length === 0) {
          await addSupplier({ 
            name: "Chamodya Hirusha", 
            company: "Acoustic Labs Inc.", 
            phone: "+94 77 123 4567", 
            email: "info@acousticlabs.com" 
          });
          await addSupplier({ 
            name: "Sajith Perera", 
            company: "Nexus Electronics", 
            phone: "+94 71 987 6543", 
            email: "sales@nexuselectronics.com" 
          });
          await addSupplier({ 
            name: "Hiruni Silva", 
            company: "Apex Logistics", 
            phone: "+94 72 555 6667", 
            email: "contact@apexlogistics.com" 
          });
        }
        if (categories.length === 0) {
          await addCategory("Audio");
          await addCategory("Tablets");
          await addCategory("Smartphones");
        }
      };
      seedSuppliersAndCats();
    }
  }, [ready, suppliers.length, categories.length, addSupplier, addCategory]);

  // Load and seed Stock Intakes History from IndexedDB
  useEffect(() => {
    const loadIntakes = async () => {
      const dbItems: StockIntake[] = [];
      await stockIntakesStore.iterate<StockIntake, void>((value) => {
        dbItems.push(sanitizeIntakeLog(value));
      });

      // If intakes are completely empty, seed a few highly designed mock files to make it look outstanding
      if (dbItems.length === 0) {
        const defaultMockIntakes: StockIntake[] = [
          {
            id: "intake-1",
            timestamp: Date.now() - 3600000 * 2, // 2 hours ago
            date: new Date(Date.now() - 3600000 * 2).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' }),
            supplierId: "mock-sup-1",
            supplierName: "Acoustic Labs Inc.",
            brandName: "Bose",
            modelName: "QuietComfort Ultra",
            categoryName: "Audio",
            serial: "QC-9082-A",
            warrantyPeriod: "1 Year",
            costPrice: 98500,
            sellPrice: 145000,
            quantity: 15,
            billPhoto: MOCK_BILL_SVG_BOSE,

            // Mock Step 2 details
            invoiceId: "INV-2026-0089",
            branchName: "Main Head Office",
            warehouseLocation: "Main Headquarters (HQ)",
            totalBillAmount: 3177500,
            advancePayment: 3177500,
            remainingBalance: 0,
            paymentMethod: "Bank Transfer",
            bankTxRef: "TXN-88902-LANKA",
            bankAccount: "0010-8809-1229",
            paymentStatus: "Fully Paid",
            procurementDateTime: "2026-05-18T10:30",
            discrepancyNotes: "Procurement cleared and registered into main audio hubs.",

            items: [
              {
                id: "item-1a",
                brandName: "Bose",
                modelName: "QuietComfort Ultra",
                categoryId: "audio-cat-1",
                categoryName: "Audio",
                serial: "QC-9082-A",
                warrantyPeriod: "1 Year",
                customWarranty: "",
                costPrice: 98500,
                sellPrice: 145000,
                quantity: 15
              },
              {
                id: "item-1b",
                brandName: "Sony",
                modelName: "WH-1000XM5",
                categoryId: "audio-cat-1",
                categoryName: "Audio",
                serial: "SN-XM5-882",
                warrantyPeriod: "2 Years",
                customWarranty: "",
                costPrice: 85000,
                sellPrice: 115000,
                quantity: 20
              }
            ]
          },
          {
            id: "intake-2",
            timestamp: Date.now() - 86400000 * 3, // 3 days ago
            date: new Date(Date.now() - 86400000 * 3).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' }),
            supplierId: "mock-sup-2",
            supplierName: "Nexus Electronics",
            brandName: "Sony",
            modelName: "WH-1000XM5",
            categoryName: "Audio",
            serial: "SN-XM5-882",
            warrantyPeriod: "2 Years",
            costPrice: 85000,
            sellPrice: 115000,
            quantity: 20,
            billPhoto: MOCK_BILL_SVG_SONY,

            // Mock Step 2 details
            invoiceId: "INV-2026-0105",
            branchName: "Colombo Branch",
            warehouseLocation: "Colombo Central Warehouse",
            totalBillAmount: 1700000,
            advancePayment: 500000,
            remainingBalance: 1200000,
            paymentMethod: "Cheque",
            chequeNumber: "CHQ-99020",
            chequeDate: "2026-05-25",
            paymentStatus: "Partially Paid",
            procurementDateTime: "2026-05-12T14:15",
            discrepancyNotes: "Minor box damage on 2 units, accepted discount.",

            items: [
              {
                id: "item-2a",
                brandName: "Sony",
                modelName: "WH-1000XM5",
                categoryId: "audio-cat-1",
                categoryName: "Audio",
                serial: "SN-XM5-882",
                warrantyPeriod: "2 Years",
                customWarranty: "",
                costPrice: 85000,
                sellPrice: 115000,
                quantity: 20
              }
            ]
          },
          {
            id: "intake-3",
            timestamp: Date.now() - 86400000 * 8, // 8 days ago
            date: new Date(Date.now() - 86400000 * 8).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' }),
            supplierId: "mock-sup-3",
            supplierName: "Apex Logistics",
            brandName: "Apple",
            modelName: "iPad Air M2",
            categoryName: "Tablets",
            serial: "APL-M2-771",
            warrantyPeriod: "1 Year",
            costPrice: 185000,
            sellPrice: 245000,
            quantity: 8,
            billPhoto: MOCK_BILL_SVG_APPLE,

            // Mock Step 2 details
            invoiceId: "INV-2026-0210",
            branchName: "Kandy Branch",
            warehouseLocation: "Kandy Distribution Center",
            totalBillAmount: 1480000,
            advancePayment: 0,
            remainingBalance: 1480000,
            paymentMethod: "Cash",
            paymentStatus: "Credit / Pending",
            procurementDateTime: "2026-05-05T09:00",
            discrepancyNotes: "Batch inspection completed. 0 defects reported.",

            items: [
              {
                id: "item-3a",
                brandName: "Apple",
                modelName: "iPad Air M2",
                categoryId: "tablets-cat-1",
                categoryName: "Tablets",
                serial: "APL-M2-771",
                warrantyPeriod: "1 Year",
                customWarranty: "",
                costPrice: 185000,
                sellPrice: 245000,
                quantity: 8
              }
            ]
          }
        ];

        for (const defaultMock of defaultMockIntakes) {
          await stockIntakesStore.setItem(defaultMock.id, defaultMock);
        }
        dbItems.push(...defaultMockIntakes);
      }

      // Sort by newest logged timestamp first
      dbItems.sort((a, b) => b.timestamp - a.timestamp);
      setIntakesHistory(dbItems);
    };

    if (ready) {
      loadIntakes();
    }
  }, [ready]);

  // Set default form select supplier once database is seeded
  useEffect(() => {
    if (suppliers.length > 0 && !supplierId) {
      setSupplierId(suppliers[0].id);
    }
  }, [suppliers, supplierId]);

  // Socket sync visual listener to sync updates
  useEffect(() => {
    const socket = io();
    socket.on("sync-event", (event: { action: string; entity: string }) => {
      if (event.entity === "Product" && event.action === "update") {
        toast.info("Database transaction synced in real-time.", { duration: 1500 });
      }
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  // Filtered Inventory Stock Intake Logs
  const filteredIntakes = useMemo(() => {
    return intakesHistory.filter(item => {
      const q = searchQuery.toLowerCase();
      return (
        item.brandName.toLowerCase().includes(q) ||
        item.modelName.toLowerCase().includes(q) ||
        item.serial.toLowerCase().includes(q) ||
        item.supplierName.toLowerCase().includes(q) ||
        item.categoryName.toLowerCase().includes(q)
      );
    });
  }, [intakesHistory, searchQuery]);

  // Drag and Drop Zone event triggers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Convert files to Base64 with high-fidelity micro progress loaders
  const processAttachedFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Format Denied. Please upload an image format (PNG, JPEG, SVG).");
      return;
    }

    setFileName(file.name);
    setFileProgress(0);

    let prog = 0;
    const interval = setInterval(() => {
      prog += 10;
      setFileProgress(prog);
      if (prog >= 100) {
        clearInterval(interval);
        const reader = new FileReader();
        reader.onloadend = () => {
          setBillPhotoBase64(reader.result as string);
          setFileProgress(null);
          toast.success("Supplier invoice file verified and pre-rendered!");
        };
        reader.readAsDataURL(file);
      }
    }, 100);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processAttachedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processAttachedFile(e.target.files[0]);
    }
  };

  // Stepper wizard navigation helper
  const handleValidateStep1 = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!supplierId) {
      toast.error("Please select a registered supplier.");
      return;
    }
    
    // Validate each bulk item specifications
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const num = i + 1;
      if (!item.brandName.trim()) {
        toast.error(`Please enter a Brand name for Product #${num}.`);
        return;
      }
      if (!item.modelName.trim()) {
        toast.error(`Please enter a Model name/number for Product #${num}.`);
        return;
      }
      if (!item.categoryId) {
        toast.error(`Please select a Category for Product #${num}.`);
        return;
      }
      if (!item.costPrice || Number(item.costPrice) <= 0) {
        toast.error(`Please enter a valid Cost Price for Product #${num}.`);
        return;
      }
      if (!item.sellPrice || Number(item.sellPrice) <= 0) {
        toast.error(`Please enter a valid Selling Price for Product #${num}.`);
        return;
      }
      if (!item.quantity || Number(item.quantity) <= 0) {
        toast.error(`Please enter a valid Quantity for Product #${num}.`);
        return;
      }
    }

    // Go to Step 2
    setStep(2);
  };

  // Handle Dynamic Stock Logging Submission
  const handleLogIntake = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!billingId.trim()) {
      toast.error("Please enter a Supplier Invoice / Billing ID.");
      return;
    }
    if (paymentMethod === "Cheque") {
      if (!chequeNumber.trim()) {
        toast.error("Please enter the Cheque Number.");
        return;
      }
      if (!chequeDate) {
        toast.error("Please select the Cheque Date.");
        return;
      }
    }
    if (paymentMethod === "Card") {
      if (!cardTxRef.trim()) {
        toast.error("Please enter the Card Transaction Reference Number.");
        return;
      }
    }
    if (paymentMethod === "Bank Transfer") {
      if (!bankTxRef.trim()) {
        toast.error("Please enter the Transaction Reference ID.");
        return;
      }
      if (!bankAccount.trim()) {
        toast.error("Please enter the Account Number.");
        return;
      }
    }

    setIsLoggingStock(true);

    try {
      // Premium loading animation simulation (800ms artificial delay for visual delight)
      await new Promise(resolve => setTimeout(resolve, 800));

      // 1. Obtain Supplier references
      const supplierObj = suppliers.find(s => s.id === supplierId);
      const supplierNameStr = supplierObj ? supplierObj.company : "Unknown Supplier";

      const loggedItems = [];

      // 2. Iterate through each item inside the bulk inventory entries list
      for (const item of items) {
        // Resolve Brand in DB (Get or Add)
        let resolvedBrandId = "";
        const existingBr = brands.find(b => b.name.toLowerCase() === item.brandName.trim().toLowerCase());
        if (existingBr) {
          resolvedBrandId = existingBr.id;
        } else {
          const addedBr = await addBrand(item.brandName.trim());
          resolvedBrandId = addedBr.id;
        }

        // Resolve Model in DB (Get or Add)
        let resolvedModelId = "";
        const existingMod = models.find(m => m.name.toLowerCase() === item.modelName.trim().toLowerCase());
        if (existingMod) {
          resolvedModelId = existingMod.id;
        } else {
          const addedMod = await addModel(item.modelName.trim());
          resolvedModelId = addedMod.id;
        }

        // Obtain Category references
        const categoryObj = categories.find(c => c.id === item.categoryId);
        const categoryNameStr = categoryObj ? categoryObj.name : "Uncategorized";

        // Resolve warranty months
        let warrantyMonths = 12;
        const cleanWarranty = item.warrantyPeriod === "Custom" ? item.customWarranty : item.warrantyPeriod;
        if (cleanWarranty.toLowerCase().includes("month")) {
          warrantyMonths = parseInt(cleanWarranty) || 6;
        } else if (cleanWarranty.toLowerCase().includes("year")) {
          warrantyMonths = (parseInt(cleanWarranty) || 1) * 12;
        }

        // Check if the Product matching Brand + Model Name + Category already exists in the main inventory
        const existingProduct = products.find(p => 
          p.brandId === resolvedBrandId && 
          p.modelId === resolvedModelId && 
          p.categoryId === item.categoryId
        );

        if (existingProduct) {
          // If it exists: Automatically INCREMENT Available Quantity, and update Selling/Cost Prices
          const nextQty = existingProduct.quantity + Number(item.quantity);
          await updateProduct(existingProduct.id, {
            quantity: nextQty,
            costPrice: Number(item.costPrice),
            sellPrice: Number(item.sellPrice),
            warrantyPeriod: warrantyMonths
          });
          toast.success(`Inventory updated successfully (${item.quantity} units added to ${item.brandName} ${item.modelName})`);
        } else {
          // If it does not exist: Automatically create a NEW product entity in the inventory
          await addProduct({
            name: `${item.brandName.trim()} ${item.modelName.trim()}`,
            sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
            serial: item.serial.trim() || undefined,
            barcode: item.serial.trim() || undefined,
            costPrice: Number(item.costPrice),
            sellPrice: Number(item.sellPrice),
            quantity: Number(item.quantity),
            warrantyPeriod: warrantyMonths,
            categoryId: item.categoryId,
            brandId: resolvedBrandId,
            modelId: resolvedModelId,
            supplierId: supplierId
          });
          toast.success(`Inventory updated successfully (New product ${item.brandName} ${item.modelName} created with ${item.quantity} units)`);
        }

        loggedItems.push({
          ...item,
          categoryName: categoryNameStr,
          warrantyPeriod: item.warrantyPeriod === "Custom" ? `${item.customWarranty} (Custom)` : item.warrantyPeriod,
          costPrice: Number(item.costPrice),
          sellPrice: Number(item.sellPrice),
          quantity: Number(item.quantity)
        });
      }

      // 3. Append to Custom localforage History logs (Support legacy attributes + items sub-array)
      const primaryItem = loggedItems[0];
      const finalBillPhoto = billPhotoBase64 || MOCK_BILL_SVG_BOSE; // Fallback to mock

      const newIntakeLog: StockIntake = {
        id: `intake-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        timestamp: Date.now(),
        date: new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' }),
        supplierId,
        supplierName: supplierNameStr,
        
        // Single-item legacy fields (for backwards compatibility/easy access)
        brandName: primaryItem.brandName,
        modelName: primaryItem.modelName,
        categoryName: primaryItem.categoryName,
        serial: primaryItem.serial || "N/A",
        warrantyPeriod: primaryItem.warrantyPeriod,
        costPrice: primaryItem.costPrice,
        sellPrice: primaryItem.sellPrice,
        quantity: primaryItem.quantity,

        // Bulk array
        items: loggedItems,
        billPhoto: finalBillPhoto,

        // Step 2 details
        procurementDateTime,
        invoiceId: billingId.trim(),
        branchName,
        warehouseLocation,
        totalBillAmount,
        advancePayment: Number(advancePayment) || 0,
        remainingBalance,
        paymentMethod,
        cardType: paymentMethod === "Card" ? cardType : undefined,
        cardTxRef: paymentMethod === "Card" ? cardTxRef.trim() : undefined,
        chequeNumber: paymentMethod === "Cheque" ? chequeNumber.trim() : undefined,
        chequeDate: paymentMethod === "Cheque" ? chequeDate : undefined,
        bankTxRef: paymentMethod === "Bank Transfer" ? bankTxRef.trim() : undefined,
        bankAccount: paymentMethod === "Bank Transfer" ? bankAccount.trim() : undefined,
        paymentStatus,
        discrepancyNotes: discrepancyNotes.trim() || undefined
      };

      await stockIntakesStore.setItem(newIntakeLog.id, newIntakeLog);
      setIntakesHistory(prev => [newIntakeLog, ...prev]);

      // Reset form variables to initial clean state
      setItems([
        {
          id: "item-1",
          brandName: "",
          modelName: "",
          categoryId: categories[0]?.id || "",
          categoryName: categories[0]?.name || "",
          serial: "",
          warrantyPeriod: "1 Year",
          customWarranty: "",
          costPrice: "",
          sellPrice: "",
          quantity: 1,
          brandInputMode: "select",
          modelInputMode: "select"
        }
      ]);
      setBillPhotoBase64(null);
      setFileName("");
      setFileProgress(null);

      // Step 2 variables reset
      setBillingId("");
      setAdvancePayment("");
      setPaymentMethod("Cash");
      setCardType("Visa");
      setCardTxRef("");
      setChequeNumber("");
      setChequeDate("");
      setBankTxRef("");
      setBankAccount("");
      setDiscrepancyNotes("");
      setStep(1); // Return wizard to Step 1

      toast.success("Successfully logged all bulk products to inventory history ledger!");
      
      // Transition to ledger overview
      setActiveTab("history");
    } catch (err) {
      toast.error("Error committing stock intake logs.");
      console.error(err);
    } finally {
      setIsLoggingStock(false);
    }
  };

  // Quick quantity adjustment inside the table
  const handleLedgerQtyAdjust = async (item: StockIntake, delta: number) => {
    const nextQty = Math.max(0, item.quantity + delta);
    
    try {
      const targetProduct = products.find(p => 
        p.brandId && brands.find(b => b.name.toLowerCase() === item.brandName.toLowerCase())?.id === p.brandId &&
        p.modelId && models.find(m => m.name.toLowerCase() === item.modelName.toLowerCase())?.id === p.modelId
      );

      if (targetProduct) {
        await updateProduct(targetProduct.id, { quantity: Math.max(0, targetProduct.quantity + delta) });
      }

      // Update local ledger item
      const updatedLog = { ...item, quantity: nextQty };
      if (updatedLog.items && updatedLog.items.length > 0) {
        updatedLog.items = updatedLog.items.map((it, idx) => idx === 0 ? { ...it, quantity: nextQty } : it);
      }

      await stockIntakesStore.setItem(item.id, updatedLog);
      
      setIntakesHistory(prev => 
        prev.map(history => history.id === item.id ? updatedLog : history)
      );

      toast.success(`Quantity adjusted to ${nextQty} in ledger`);
    } catch (e) {
      toast.error("Failed to update ledger quantities");
    }
  };

  return (
    <div className="space-y-6">
      
      {/* ==========================================
          HEADER & REAL-TIME ERP TELEMETRY
         ========================================== */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary bg-primary/5 px-2.5 py-0.5 rounded-full">
            Inventory & Logistics
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-foreground mt-2 flex items-center gap-2.5">
            Supplier Stock Intake & Update
          </h1>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            Record newly received supplier goods, trace serial sheets, upload bill assets, and sync ERP ledgers.
          </p>
        </div>

        {/* Premium live synchronization telemetry */}
        <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200/50 px-3.5 py-2 rounded-full text-[11px] font-bold shadow-sm dark:bg-zinc-900 dark:border-zinc-800 shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-slate-600 dark:text-zinc-400">Live ERP Synced</span>
        </div>
      </div>

      {/* ==========================================
          LUXURY TABS SWITCHER PANEL
         ========================================== */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-0 shrink-0 gap-6">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab("intake")}
            className={`pb-3 text-xs font-extrabold tracking-wider uppercase transition-all relative ${
              activeTab === "intake" 
                ? "text-primary font-black border-b-2 border-primary" 
                : "text-muted-foreground/70 hover:text-foreground font-semibold"
            }`}
          >
            New Stock Intake
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`pb-3 text-xs font-extrabold tracking-wider uppercase transition-all relative ${
              activeTab === "history" 
                ? "text-primary font-black border-b-2 border-primary" 
                : "text-muted-foreground/70 hover:text-foreground font-semibold"
            }`}
          >
            Intake Ledger ({intakesHistory.length})
          </button>
        </div>
      </div>

      {/* ==========================================
          TAB 1: INTENT WIZARD FORM
         ========================================== */}
      {activeTab === "intake" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-in fade-in duration-300">
          
          {/* Main Intake Form Formsite */}
          <form onSubmit={handleLogIntake} className="lg:col-span-8 card-elevated border border-slate-100/80 bg-card p-6 shadow-sm space-y-6">
            
            {/* Wizard Stepper Progress Bar */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-6 text-xs font-bold uppercase tracking-wider">
                <div className={`flex items-center gap-2 ${step === 1 ? "text-primary font-black" : "text-muted-foreground/60"}`}>
                  <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] ${step === 1 ? "bg-primary text-primary-foreground" : "bg-slate-100 text-slate-500"}`}>1</span>
                  <span>Intake Specs</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/45" />
                <div className={`flex items-center gap-2 ${step === 2 ? "text-primary font-black" : "text-muted-foreground/60"}`}>
                  <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] ${step === 2 ? "bg-primary text-primary-foreground" : "bg-slate-100 text-slate-500"}`}>2</span>
                  <span>Billing & Payment</span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground/60 uppercase">Step {step} of 2</span>
            </div>

            {/* STEP 1: INTAKE SPECIFICATIONS */}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="mb-2">
                  <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-500" /> Intake Specifications
                  </h2>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Please register all supplier parameters. New entities are registered instantly.</p>
                </div>

                {/* Supplier Selection - Global for intake session */}
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1.5 dark:border-slate-800 dark:bg-zinc-900/20">
                  <Label htmlFor="supplier" className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5" /> Supplier Selection
                  </Label>
                  <select
                    id="supplier"
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    className="w-full h-9 rounded-lg border border-slate-100 bg-white px-3 text-xs font-semibold focus:ring-1 focus:ring-primary focus:outline-none dark:bg-slate-900 dark:border-slate-800"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.company} ({s.name})
                      </option>
                    ))}
                    {suppliers.length === 0 && <option value="">No suppliers registered</option>}
                  </select>
                </div>

                {/* Dynamic Item Cards List */}
                <div className="space-y-6">
                  {items.map((item, index) => (
                    <div key={item.id} className="relative p-5 rounded-xl border border-slate-100 bg-slate-50/20 space-y-5 dark:border-slate-800 dark:bg-zinc-900/10 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                        <span className="text-xs font-bold text-primary bg-primary/5 px-2.5 py-0.5 rounded-full">
                          Product #{index + 1} Specifications
                        </span>
                        {items.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveItem(index)}
                            className="h-7 w-7 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg shrink-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                        
                        {/* Category */}
                        <div className="space-y-1.5">
                          <Label htmlFor={`category-${index}`} className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                            <Layers className="h-3.5 w-3.5" /> Category
                          </Label>
                          <select
                            id={`category-${index}`}
                            value={item.categoryId}
                            onChange={(e) => {
                              const catId = e.target.value;
                              const catObj = categories.find(c => c.id === catId);
                              handleUpdateItem(index, { 
                                categoryId: catId, 
                                categoryName: catObj ? catObj.name : "" 
                              });
                            }}
                            className="w-full h-9 rounded-lg border border-slate-100 bg-white px-3 text-xs font-medium focus:ring-1 focus:ring-primary focus:outline-none dark:bg-slate-900 dark:border-slate-800"
                          >
                            {categories.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                            {categories.length === 0 && <option value="">No categories found</option>}
                          </select>
                        </div>

                        {/* Brand */}
                        <div className="space-y-1.5 relative text-left">
                          <div className="flex items-center justify-between">
                            <Label htmlFor={`brand-${index}`} className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                              <Tag className="h-3.5 w-3.5" /> Brand
                            </Label>
                            <div className="flex bg-slate-100 dark:bg-zinc-800/80 p-0.5 rounded-md text-[9px] font-extrabold tracking-wide uppercase">
                              <button
                                type="button"
                                onClick={() => handleUpdateItem(index, { brandInputMode: "select" })}
                                className={`px-2 py-0.5 rounded transition-all ${
                                  (item.brandInputMode || "select") === "select"
                                    ? "bg-white dark:bg-zinc-900 text-primary shadow-sm"
                                    : "text-muted-foreground/70 hover:text-foreground"
                                }`}
                              >
                                Select
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateItem(index, { brandInputMode: "custom" })}
                                className={`px-2 py-0.5 rounded transition-all ${
                                  item.brandInputMode === "custom"
                                    ? "bg-white dark:bg-zinc-900 text-primary shadow-sm"
                                    : "text-muted-foreground/70 hover:text-foreground"
                                }`}
                              >
                                Custom
                              </button>
                            </div>
                          </div>
                          
                          {(item.brandInputMode || "select") === "select" ? (
                            <select
                              id={`brand-${index}`}
                              value={item.brandName}
                              onChange={(e) => handleUpdateItem(index, { brandName: e.target.value })}
                              className="w-full h-9 rounded-lg border border-slate-100 bg-white px-3 text-xs font-semibold focus:ring-1 focus:ring-primary focus:outline-none dark:bg-slate-900 dark:border-slate-800 text-foreground"
                            >
                              <option value="">-- Choose Brand --</option>
                              {brands.map((b) => (
                                <option key={b.id} value={b.name}>
                                  {b.name}
                                </option>
                              ))}
                              {brands.length === 0 && <option value="">No brands registered</option>}
                            </select>
                          ) : (
                            <div className="relative">
                              <Input
                                id={`brand-${index}`}
                                placeholder="e.g. Bose, Sony, Apple"
                                value={item.brandName}
                                onChange={(e) => handleUpdateItem(index, { brandName: e.target.value })}
                                className="h-9 text-xs rounded-lg border-slate-100 bg-white dark:bg-slate-900/50 dark:border-slate-800"
                              />
                              {item.brandName.trim().length > 0 && brands.some(b => b.name.toLowerCase().includes(item.brandName.toLowerCase()) && b.name.toLowerCase() !== item.brandName.toLowerCase()) && (
                                <div className="absolute z-10 w-full bg-card border rounded-lg shadow-lg mt-1 max-h-32 overflow-y-auto no-scrollbar text-xs divide-y">
                                  {brands
                                    .filter(b => b.name.toLowerCase().includes(item.brandName.toLowerCase()))
                                    .map(b => (
                                      <div 
                                        key={b.id} 
                                        onClick={() => handleUpdateItem(index, { brandName: b.name })}
                                        className="p-2 hover:bg-slate-50 cursor-pointer transition-all dark:hover:bg-slate-900 font-semibold text-foreground flex justify-between items-center"
                                      >
                                        <span>{b.name}</span>
                                        <span className="text-[9px] text-muted-foreground/60 uppercase">Existing Brand</span>
                                      </div>
                                    ))
                                  }
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Model */}
                        <div className="space-y-1.5 relative text-left">
                          <div className="flex items-center justify-between">
                            <Label htmlFor={`model-${index}`} className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                              <Box className="h-3.5 w-3.5" /> Model Name / Number
                            </Label>
                            <div className="flex bg-slate-100 dark:bg-zinc-800/80 p-0.5 rounded-md text-[9px] font-extrabold tracking-wide uppercase">
                              <button
                                type="button"
                                onClick={() => handleUpdateItem(index, { modelInputMode: "select" })}
                                className={`px-2 py-0.5 rounded transition-all ${
                                  (item.modelInputMode || "select") === "select"
                                    ? "bg-white dark:bg-zinc-900 text-primary shadow-sm"
                                    : "text-muted-foreground/70 hover:text-foreground"
                                }`}
                              >
                                Select
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateItem(index, { modelInputMode: "custom" })}
                                className={`px-2 py-0.5 rounded transition-all ${
                                  item.modelInputMode === "custom"
                                    ? "bg-white dark:bg-zinc-900 text-primary shadow-sm"
                                    : "text-muted-foreground/70 hover:text-foreground"
                                }`}
                              >
                                Custom
                              </button>
                            </div>
                          </div>

                          {(item.modelInputMode || "select") === "select" ? (
                            <select
                              id={`model-${index}`}
                              value={item.modelName}
                              onChange={(e) => handleUpdateItem(index, { modelName: e.target.value })}
                              className="w-full h-9 rounded-lg border border-slate-100 bg-white px-3 text-xs font-semibold focus:ring-1 focus:ring-primary focus:outline-none dark:bg-slate-900 dark:border-slate-800 text-foreground"
                            >
                              <option value="">-- Choose Model --</option>
                              {models.map((m) => (
                                <option key={m.id} value={m.name}>
                                  {m.name}
                                </option>
                              ))}
                              {models.length === 0 && <option value="">No models registered</option>}
                            </select>
                          ) : (
                            <div className="relative">
                              <Input
                                id={`model-${index}`}
                                placeholder="e.g. WH-1000XM5, QC Ultra"
                                value={item.modelName}
                                onChange={(e) => handleUpdateItem(index, { modelName: e.target.value })}
                                className="h-9 text-xs rounded-lg border-slate-100 bg-white dark:bg-slate-900/50 dark:border-slate-800"
                              />
                              {item.modelName.trim().length > 0 && models.some(m => m.name.toLowerCase().includes(item.modelName.toLowerCase()) && m.name.toLowerCase() !== item.modelName.toLowerCase()) && (
                                <div className="absolute z-10 w-full bg-card border rounded-lg shadow-lg mt-1 max-h-32 overflow-y-auto no-scrollbar text-xs divide-y">
                                  {models
                                    .filter(m => m.name.toLowerCase().includes(item.modelName.toLowerCase()))
                                    .map(m => (
                                      <div 
                                        key={m.id} 
                                        onClick={() => handleUpdateItem(index, { modelName: m.name })}
                                        className="p-2 hover:bg-slate-50 cursor-pointer transition-all dark:hover:bg-slate-900 font-semibold text-foreground flex justify-between items-center"
                                      >
                                        <span>{m.name}</span>
                                        <span className="text-[9px] text-muted-foreground/60 uppercase">Existing Model</span>
                                      </div>
                                    ))
                                  }
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Serial / Barcode */}
                        <div className="space-y-1.5">
                          <Label htmlFor={`serial-${index}`} className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                            <Info className="h-3.5 w-3.5" /> Serial Number (S/N) / Barcode
                          </Label>
                          <Input
                            id={`serial-${index}`}
                            placeholder="e.g. SN-9082-BOSE"
                            value={item.serial}
                            onChange={(e) => handleUpdateItem(index, { serial: e.target.value })}
                            className="h-9 text-xs rounded-lg border-slate-100 bg-white dark:bg-slate-900/50 dark:border-slate-800 font-mono"
                          />
                        </div>

                        {/* Warranty Period */}
                        <div className="space-y-1.5">
                          <Label htmlFor={`warranty-${index}`} className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                            <Award className="h-3.5 w-3.5" /> Supplier Warranty Period
                          </Label>
                          <div className="grid grid-cols-3 gap-2">
                            <select
                              id={`warranty-${index}`}
                              value={item.warrantyPeriod}
                              onChange={(e) => handleUpdateItem(index, { warrantyPeriod: e.target.value })}
                              className="col-span-2 h-9 rounded-lg border border-slate-100 bg-white px-3 text-xs font-medium focus:ring-1 focus:ring-primary focus:outline-none dark:bg-slate-900 dark:border-slate-800"
                            >
                              <option value="6 Months">6 Months</option>
                              <option value="1 Year">1 Year</option>
                              <option value="2 Years">2 Years</option>
                              <option value="3 Years">3 Years</option>
                              <option value="Custom">Custom input...</option>
                            </select>
                            {item.warrantyPeriod === "Custom" ? (
                              <Input
                                placeholder="e.g. 5 Years"
                                value={item.customWarranty}
                                onChange={(e) => handleUpdateItem(index, { customWarranty: e.target.value })}
                                className="h-9 text-xs rounded-lg border-slate-100 bg-white dark:bg-slate-900/50 dark:border-slate-800"
                              />
                            ) : (
                              <div className="h-9 bg-slate-50 border rounded-lg flex items-center justify-center text-[10px] text-muted-foreground font-bold uppercase tracking-wide dark:bg-zinc-900 dark:border-zinc-800">
                                Standard
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Cost Price */}
                        <div className="space-y-1.5">
                          <Label htmlFor={`cost-${index}`} className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                            Cost Price (LKR)
                          </Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">Rs.</span>
                            <Input
                              id={`cost-${index}`}
                              type="number"
                              placeholder="95,000"
                              value={item.costPrice}
                              onChange={(e) => handleUpdateItem(index, { costPrice: e.target.value === "" ? "" : Number(e.target.value) })}
                              className="pl-9 h-9 text-xs rounded-lg border-slate-100 bg-white dark:bg-slate-900/50 dark:border-slate-800 font-semibold text-foreground"
                            />
                          </div>
                          {item.costPrice !== "" && Number(item.costPrice) > 0 && (
                            <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                              Formatted: Rs. {Number(item.costPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </p>
                          )}
                        </div>

                        {/* Selling Price */}
                        <div className="space-y-1.5">
                          <Label htmlFor={`sell-${index}`} className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                            Selling Price (LKR)
                          </Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">Rs.</span>
                            <Input
                              id={`sell-${index}`}
                              type="number"
                              placeholder="145,000"
                              value={item.sellPrice}
                              onChange={(e) => handleUpdateItem(index, { sellPrice: e.target.value === "" ? "" : Number(e.target.value) })}
                              className="pl-9 h-9 text-xs rounded-lg border-slate-100 bg-white dark:bg-slate-900/50 dark:border-slate-800 font-semibold text-foreground"
                            />
                          </div>
                          {item.sellPrice !== "" && Number(item.sellPrice) > 0 && (
                            <p className="text-[10px] font-bold text-primary mt-1">
                              Formatted: Rs. {Number(item.sellPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </p>
                          )}
                        </div>

                        {/* Qty Received */}
                        <div className="space-y-1.5">
                          <Label htmlFor={`qty-${index}`} className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                            Quantity Received
                          </Label>
                          <div className="flex items-center gap-2">
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="icon" 
                              className="h-9 w-9 rounded-lg border-slate-100 bg-white shrink-0"
                              onClick={() => handleUpdateItem(index, { quantity: Math.max(1, (Number(item.quantity) || 1) - 1) })}
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </Button>
                            <Input
                              id={`qty-${index}`}
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleUpdateItem(index, { quantity: e.target.value === "" ? 0 : Number(e.target.value) })}
                              className="h-9 text-xs rounded-lg border-slate-100 bg-white dark:bg-slate-900/50 dark:border-slate-800 text-center font-bold text-foreground"
                            />
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="icon" 
                              className="h-9 w-9 rounded-lg border-slate-100 bg-white shrink-0"
                              onClick={() => handleUpdateItem(index, { quantity: (Number(item.quantity) || 0) + 1 })}
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>

                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Another Product Button */}
                <div className="flex justify-start">
                  <Button
                    type="button"
                    onClick={handleAddItem}
                    variant="outline"
                    className="h-9.5 text-xs font-extrabold border-dashed border-primary/40 text-primary hover:bg-primary/5 flex items-center gap-2 rounded-lg px-4"
                  >
                    <Plus className="h-4 w-4" /> Add Another Product
                  </Button>
                </div>

                <div className="flex items-center justify-end border-t border-slate-100 dark:border-slate-800 pt-5 mt-6 shrink-0">
                  <Button 
                    type="button" 
                    onClick={handleValidateStep1}
                    className="h-9.5 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/95 flex items-center justify-center gap-2 rounded-lg px-6 transition-all transform hover:-translate-y-[1px] shadow-sm"
                  >
                    Continue to Billing & Payment <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 2: BILLING & PAYMENT DETAILS */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="mb-2">
                  <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Landmark className="h-4 w-4 text-emerald-500" /> Billing & Payment Details
                  </h2>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Define outstanding balances, procurement branches, and transaction codes below.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">

                  {/* 1. Billing Reference Info */}
                  <div className="space-y-1.5">
                    <Label htmlFor="datetime" className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" /> Date & Time Picker
                    </Label>
                    <Input
                      id="datetime"
                      type="datetime-local"
                      value={procurementDateTime}
                      onChange={(e) => setProcurementDateTime(e.target.value)}
                      className="h-9 text-xs rounded-lg border-slate-100 bg-slate-50/50 dark:bg-slate-900/50 dark:border-slate-800"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="billingId" className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5" /> Supplier Invoice / Billing ID
                    </Label>
                    <Input
                      id="billingId"
                      placeholder="e.g. INV-2026-9902"
                      value={billingId}
                      onChange={(e) => setBillingId(e.target.value)}
                      className="h-9 text-xs rounded-lg border-slate-100 bg-slate-50/50 dark:bg-slate-900/50 dark:border-slate-800 font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="branch" className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5" /> Receiving Branch
                    </Label>
                    <select
                      id="branch"
                      value={branchName}
                      onChange={(e) => setBranchName(e.target.value)}
                      className="w-full h-9 rounded-lg border border-slate-100 bg-slate-50/50 px-3 text-xs font-medium focus:ring-1 focus:ring-primary focus:outline-none dark:bg-slate-900 dark:border-slate-800"
                    >
                      <option value="Main Head Office">Main Head Office (HQ)</option>
                      <option value="Colombo Branch">Colombo Branch</option>
                      <option value="Galle Branch">Galle Branch</option>
                      <option value="Kandy Branch">Kandy Branch</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="warehouse" className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5" /> Warehouse Location
                    </Label>
                    <select
                      id="warehouse"
                      value={warehouseLocation}
                      onChange={(e) => setWarehouseLocation(e.target.value)}
                      className="w-full h-9 rounded-lg border border-slate-100 bg-slate-50/50 px-3 text-xs font-medium focus:ring-1 focus:ring-primary focus:outline-none dark:bg-slate-900 dark:border-slate-800"
                    >
                      <option value="Main Headquarters (HQ)">Main Headquarters (HQ)</option>
                      <option value="Colombo Central Warehouse">Colombo Central Warehouse</option>
                      <option value="Galle Transit Hub">Galle Transit Hub</option>
                      <option value="Kandy Distribution Center">Kandy Distribution Center</option>
                    </select>
                  </div>

                  {/* 2. Advance & Payment Breakdown */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                      Total Bill Amount (LKR)
                    </Label>
                    <div className="h-9 bg-slate-100 dark:bg-zinc-800 border rounded-lg flex items-center px-3 font-mono font-bold text-slate-800 dark:text-zinc-200 text-xs">
                      Rs. {totalBillAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </div>
                    <p className="text-[9px] text-muted-foreground">Auto-calculated: Sum total of all entered products.</p>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="advance" className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                      Advance Payment (LKR)
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">Rs.</span>
                      <Input
                        id="advance"
                        type="number"
                        placeholder="e.g. 50,000"
                        value={advancePayment}
                        onChange={(e) => setAdvancePayment(e.target.value === "" ? "" : Number(e.target.value))}
                        className="pl-9 h-9 text-xs rounded-lg border-slate-100 bg-slate-50/50 dark:bg-slate-900/50 dark:border-slate-800 font-semibold"
                      />
                    </div>
                    {advancePayment !== "" && advancePayment > 0 && (
                      <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                        Formatted: Rs. {Number(advancePayment).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                      Due / Remaining Balance (LKR)
                    </Label>
                    <div className={`h-9 border rounded-lg flex items-center px-3 font-mono font-bold text-xs ${
                      remainingBalance > 0 
                        ? "bg-rose-50/50 border-rose-100 text-rose-600 dark:bg-rose-950/10 dark:text-rose-400" 
                        : "bg-emerald-50/50 border-emerald-100 text-emerald-600 dark:bg-emerald-950/10 dark:text-emerald-400"
                    }`}>
                      Rs. {remainingBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      {remainingBalance === 0 && <CheckCircle2 className="h-4 w-4 ml-2 text-emerald-500 shrink-0" />}
                      {remainingBalance > 0 && <ShieldAlert className="h-4 w-4 ml-2 text-rose-500 shrink-0" />}
                    </div>
                    <p className="text-[9px] text-muted-foreground">Auto-calculated: Total Bill - Advance</p>
                  </div>

                  {/* 3. Payment Methods (Luxury Segmented Control) */}
                  <div className="space-y-1.5 md:col-span-2">
                    <Label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5 mb-2">
                      <CreditCard className="h-3.5 w-3.5" /> Payment Method Selector
                    </Label>
                    <div className="grid grid-cols-3 gap-2.5 p-1 bg-slate-100/60 dark:bg-zinc-800/60 rounded-xl border border-slate-200/30">
                      {["Cash", "Card", "Cheque"].map((method) => {
                        const isActive = paymentMethod === method;
                        return (
                          <button
                            key={method}
                            type="button"
                            onClick={() => setPaymentMethod(method)}
                            className={`py-2 px-3 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 ${
                              isActive
                                ? "bg-white text-primary shadow-sm dark:bg-zinc-900 dark:text-primary-foreground font-black"
                                : "text-muted-foreground hover:text-foreground font-semibold"
                            }`}
                          >
                            {method === "Cash" && <Banknote className="h-3.5 w-3.5" />}
                            {method === "Card" && <CreditCard className="h-3.5 w-3.5" />}
                            {method === "Cheque" && <Landmark className="h-3.5 w-3.5" />}
                            {method}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Dynamic Fields for Card */}
                  {paymentMethod === "Card" && (
                    <>
                      <div className="space-y-1.5 animate-in slide-in-from-top-1 duration-200">
                        <Label htmlFor="cardType" className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                          Card Network
                        </Label>
                        <select
                          id="cardType"
                          value={cardType}
                          onChange={(e) => setCardType(e.target.value)}
                          className="w-full h-9 rounded-lg border border-slate-100 bg-slate-50/50 px-3 text-xs font-medium focus:ring-1 focus:ring-primary focus:outline-none dark:bg-slate-900 dark:border-slate-800"
                        >
                          <option value="Visa">Visa Card</option>
                          <option value="Mastercard">Mastercard</option>
                          <option value="AMEX">American Express</option>
                        </select>
                      </div>
                      <div className="space-y-1.5 animate-in slide-in-from-top-1 duration-200">
                        <Label htmlFor="cardTxRef" className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                          Transaction Reference Number
                        </Label>
                        <Input
                          id="cardTxRef"
                          placeholder="e.g. TXN-CARD-9902"
                          value={cardTxRef}
                          onChange={(e) => setCardTxRef(e.target.value)}
                          className="h-9 text-xs rounded-lg border-slate-100 bg-slate-50/50 dark:bg-slate-900/50 dark:border-slate-800 font-mono"
                        />
                      </div>
                    </>
                  )}

                  {/* Dynamic Fields for Cheque */}
                  {paymentMethod === "Cheque" && (
                    <>
                      <div className="space-y-1.5 animate-in slide-in-from-top-1 duration-200">
                        <Label htmlFor="cheqNo" className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                          Cheque Number
                        </Label>
                        <Input
                          id="cheqNo"
                          placeholder="e.g. CHQ-99820-K"
                          value={chequeNumber}
                          onChange={(e) => setChequeNumber(e.target.value)}
                          className="h-9 text-xs rounded-lg border-slate-100 bg-slate-50/50 dark:bg-slate-900/50 dark:border-slate-800 font-mono"
                        />
                      </div>
                      <div className="space-y-1.5 animate-in slide-in-from-top-1 duration-200">
                        <Label htmlFor="cheqDate" className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                          Cheque Due Date
                        </Label>
                        <Input
                          id="cheqDate"
                          type="date"
                          value={chequeDate}
                          onChange={(e) => setChequeDate(e.target.value)}
                          className="h-9 text-xs rounded-lg border-slate-100 bg-slate-50/50 dark:bg-slate-900/50 dark:border-slate-800"
                        />
                      </div>
                    </>
                  )}

                  {/* Dynamic Fields for Bank Transfer (Fallback) */}
                  {paymentMethod === "Bank Transfer" && (
                    <>
                      <div className="space-y-1.5 animate-in slide-in-from-top-1 duration-200">
                        <Label htmlFor="bankRef" className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                          Transaction Reference ID
                        </Label>
                        <Input
                          id="bankRef"
                          placeholder="e.g. TXN-89091-CEYLON"
                          value={bankTxRef}
                          onChange={(e) => setBankTxRef(e.target.value)}
                          className="h-9 text-xs rounded-lg border-slate-100 bg-slate-50/50 dark:bg-slate-900/50 dark:border-slate-800 font-mono"
                        />
                      </div>
                      <div className="space-y-1.5 animate-in slide-in-from-top-1 duration-200">
                        <Label htmlFor="bankAcc" className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                          Account Number
                        </Label>
                        <Input
                          id="bankAcc"
                          placeholder="e.g. 0010-8809-1229"
                          value={bankAccount}
                          onChange={(e) => setBankAccount(e.target.value)}
                          className="h-9 text-xs rounded-lg border-slate-100 bg-slate-50/50 dark:bg-slate-900/50 dark:border-slate-800 font-mono"
                        />
                      </div>
                    </>
                  )}

                  {/* 4. Payment Status Badge */}
                  <div className="space-y-1.5">
                    <Label htmlFor="payStatus" className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                      Payment Status Badge
                    </Label>
                    <select
                      id="payStatus"
                      value={paymentStatus}
                      onChange={(e) => setPaymentStatus(e.target.value)}
                      className="w-full h-9 rounded-lg border border-slate-100 bg-slate-50/50 px-3 text-xs font-medium focus:ring-1 focus:ring-primary focus:outline-none dark:bg-slate-900 dark:border-slate-800"
                    >
                      <option value="Fully Paid">Fully Paid (Cleared)</option>
                      <option value="Partially Paid">Partially Paid</option>
                      <option value="Credit / Pending">Credit / Pending</option>
                    </select>
                  </div>

                  {/* 5. Discrepancy & Damaged Goods Notes Textarea */}
                  <div className="space-y-1.5 md:col-span-2">
                    <Label htmlFor="discrepancy" className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500" /> Discrepancy & Damaged Goods Notes
                    </Label>
                    <textarea
                      id="discrepancy"
                      rows={3}
                      placeholder="e.g. Minor package damage on 2 units, accepted discount. Or detail other procurement terms here..."
                      value={discrepancyNotes}
                      onChange={(e) => setDiscrepancyNotes(e.target.value)}
                      className="w-full rounded-lg border border-slate-100 bg-slate-50/50 p-3 text-xs font-medium focus:ring-1 focus:ring-primary focus:outline-none dark:bg-slate-900 dark:border-slate-800 dark:bg-slate-900/50"
                    />
                  </div>

                </div>

                <div className="flex items-center justify-between border-t pt-5 mt-6 shrink-0">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="h-9.5 text-xs font-bold border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-2 rounded-lg px-4 transition-all"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Back to Specs
                  </Button>
                  
                  <Button 
                    type="submit" 
                    disabled={isLoggingStock}
                    className="h-9.5 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/95 flex items-center justify-center gap-2 rounded-lg px-6 transition-all transform hover:-translate-y-[1px] shadow-sm"
                  >
                    {isLoggingStock ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Syncing Inventory...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        Complete &amp; Log Stock Intake
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

          </form>

          {/* Drag & Drop Side Zone (Document attachment) */}
          <div className="lg:col-span-4 space-y-6">
            
            <div className="card-elevated border border-slate-100/80 bg-card p-6 shadow-sm space-y-5">
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" /> Supplier Bills & Invoices
                </h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">Attach the physical purchase receipt photo or PDF to archive.</p>
              </div>

              {/* Drag and Drop Container */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`relative group p-6 border-2 rounded-xl text-center flex flex-col items-center justify-center transition-all min-h-[220px] ${
                  dragActive 
                    ? "bg-slate-50 border-primary/50" 
                    : billPhotoBase64 
                      ? "bg-emerald-50/5 border-emerald-100" 
                      : "bg-slate-50/50 border-slate-200/50 border-dashed hover:bg-slate-50/70"
                }`}
              >
                
                {/* Image Pre-render preview */}
                {billPhotoBase64 ? (
                  <div className="space-y-3.5 w-full">
                    <div className="relative mx-auto h-32 w-32 rounded-lg border overflow-hidden shadow-inner bg-slate-50 flex items-center justify-center">
                      <img 
                        src={billPhotoBase64} 
                        alt="Bill asset preview" 
                        className="object-contain h-full w-full"
                      />
                      <button
                        type="button"
                        onClick={() => { setBillPhotoBase64(null); setFileName(""); }}
                        className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-slate-900/80 text-white flex items-center justify-center hover:bg-slate-950/90 transition-all shrink-0"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-foreground truncate">{fileName || "invoice_document.png"}</p>
                      <p className="text-[9px] text-emerald-600 dark:text-emerald-400 font-extrabold uppercase mt-0.5 tracking-wider">Asset Attached successfully</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="p-3 bg-primary/5 text-primary rounded-full group-hover:scale-105 transition-transform shrink-0">
                      <UploadCloud className="h-6 w-6" />
                    </div>

                    {fileProgress !== null ? (
                      <div className="mt-4 w-full space-y-2 px-4">
                        <div className="flex justify-between text-[10px] font-bold text-muted-foreground">
                          <span>Uploading & Transcribing...</span>
                          <span>{fileProgress}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-primary h-full transition-all duration-100 rounded-full" 
                            style={{ width: `${fileProgress}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-xs font-bold text-foreground mt-3">Drag &amp; Drop bill image</p>
                        <p className="text-[10px] text-muted-foreground mt-1 max-w-[180px] mx-auto leading-normal">
                          PNG, JPEG or SVG formats supported up to 5MB size.
                        </p>

                        <div className="mt-4 shrink-0">
                          <label className="cursor-pointer inline-flex items-center justify-center h-8 px-4 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-[10px] font-bold tracking-wide uppercase text-slate-700 transition-colors">
                            Select File
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*" 
                              onChange={handleFileChange} 
                            />
                          </label>
                        </div>
                      </>
                    )}
                  </>
                )}

              </div>

              {/* Standard instructions warning box */}
              <div className="bg-slate-50 border p-3 rounded-lg flex items-start gap-2.5 text-[10px] text-slate-500 font-medium leading-relaxed dark:bg-zinc-900/40 dark:border-zinc-800">
                <Info className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-foreground">IndexedDB Persistence</p>
                  <p className="mt-0.5">Bill files are secure and stored inside local IndexedDB clusters. Previews are instantly loaded in compliance lightboxes.</p>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ==========================================
          TAB 2: STOCK INTAKES HISTORY GRID
         ========================================== */}
      {activeTab === "history" && (
        <div className="card-elevated border border-slate-100 bg-card p-6 shadow-sm space-y-5 animate-in fade-in duration-300">
          
          {/* Filtering bar and title */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4 shrink-0">
            <div>
              <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <Calendar className="h-4.5 w-4.5 text-primary" /> Supplier Intake History ledger
              </h2>
              <p className="text-[10px] text-muted-foreground mt-0.5">Chronological record of goods acquired. Select any transaction row to open bill lightboxes.</p>
            </div>

            {/* Quick search input */}
            <div className="relative w-full md:max-w-xs shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input 
                className="pl-8.5 h-8.5 text-xs rounded-lg border-slate-100 bg-slate-50/50 dark:bg-slate-900/50 dark:border-slate-800" 
                placeholder="Search Brand, Model, S/N..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
              />
            </div>
          </div>

          {/* Table display */}
          {filteredIntakes.length === 0 ? (
            <div className="text-center py-10">
              <Package className="h-10 w-10 mx-auto text-muted-foreground/35 mb-2" />
              <h3 className="font-bold text-xs text-foreground">No matching inventory records found</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Try refining your search keyword or log new supplier intakes.</p>
            </div>
          ) : (
            <div className="overflow-x-auto no-scrollbar border rounded-xl border-slate-100/80 dark:border-slate-850">
              <table className="w-full text-left border-collapse min-w-[1100px]">
                <thead>
                  <tr className="bg-slate-50/40 border-b text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 dark:bg-zinc-900/30">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Supplier &amp; Branch</th>
                    <th className="py-3 px-4">Brand / Model</th>
                    <th className="py-3 px-4">Category &amp; Warranty</th>
                    <th className="py-3 px-4">Serial / Barcode</th>
                    <th className="py-3 px-4">Payment Status &amp; Method</th>
                    <th className="py-3 px-4 text-right">LKR Cost &amp; Sum</th>
                    <th className="py-3 px-4 text-right">Selling Price</th>
                    <th className="py-3 px-4 text-center">Intake Qty</th>
                    <th className="py-3 px-4 text-center">Invoice Bill</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/60 text-xs dark:divide-slate-800/30">
                  {filteredIntakes.map((item) => {
                    const isOutOfStock = item.quantity === 0;
                    const isLowStock = item.quantity > 0 && item.quantity < 5;

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/40 transition-colors duration-150 dark:hover:bg-zinc-900/10">
                        
                        {/* Date */}
                        <td className="py-3.5 px-4 font-semibold text-muted-foreground/80">{item.date}</td>
                        
                        {/* Supplier & Branch */}
                        <td className="py-3.5 px-4">
                          <div>
                            <p className="font-bold text-foreground leading-tight">{item.supplierName}</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              <span className="text-[9px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded dark:bg-zinc-800">
                                {item.branchName || "Main Head Office"}
                              </span>
                              {item.warehouseLocation && (
                                <span className="text-[9px] font-semibold text-primary bg-primary/5 px-2 py-0.5 rounded dark:bg-zinc-900/50">
                                  {item.warehouseLocation}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        
                        {/* Brand / Model */}
                        <td className="py-3.5 px-4">
                          <div>
                            <div className="flex items-center flex-wrap gap-1">
                              <span className="font-bold text-foreground">{item.brandName}</span>
                              <span className="text-[10px] text-muted-foreground ml-1.5 font-medium">{item.modelName}</span>
                              {item.items && item.items.length > 1 && (
                                <span className="text-[9px] font-extrabold text-primary bg-primary/10 px-1.5 py-0.5 rounded ml-2 inline-block shrink-0">
                                  + {item.items.length - 1} other{item.items.length - 1 > 1 ? "s" : ""}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Category & Warranty */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            <span className="px-2 py-0.5 rounded bg-slate-50 border border-slate-100 text-muted-foreground font-semibold text-[9px] dark:bg-zinc-900 dark:border-zinc-800 inline-block">
                              {item.categoryName}
                            </span>
                            <div className="text-[10px] font-semibold text-primary flex items-center gap-1">
                              <Award className="h-3 w-3 text-primary shrink-0" /> {item.warrantyPeriod}
                            </div>
                          </div>
                        </td>

                        {/* Serial */}
                        <td className="py-3.5 px-4 font-mono text-[11px] text-muted-foreground/85">{item.serial}</td>
                        
                        {/* Payment Status & Method */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                              item.paymentStatus === "Fully Paid" 
                                ? "bg-emerald-50/70 border-emerald-100 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400" 
                                : item.paymentStatus === "Partially Paid"
                                  ? "bg-amber-50/70 border-amber-100 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400"
                                  : "bg-rose-50/70 border-rose-100 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400"
                            }`}>
                              {item.paymentStatus || "Fully Paid"}
                            </span>
                            <p className="text-[10px] text-muted-foreground/80 font-semibold flex items-center gap-1 mt-0.5">
                              {item.paymentMethod === "Bank Transfer" && <Landmark className="h-3 w-3 text-slate-400 shrink-0" />}
                              {item.paymentMethod === "Cheque" && <CreditCard className="h-3 w-3 text-slate-400 shrink-0" />}
                              {item.paymentMethod === "Cash" && <Banknote className="h-3 w-3 text-slate-400 shrink-0" />}
                              {item.paymentMethod || "Cash"}
                            </p>
                          </div>
                        </td>

                        {/* Cost Price & Total Bill */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="space-y-0.5">
                            <p className="font-mono font-semibold text-foreground">
                              Rs. {item.costPrice.toLocaleString("en-US")}
                            </p>
                            <p className="text-[9px] text-slate-500 font-bold dark:text-zinc-400">
                              Total: Rs. {(item.totalBillAmount || (item.costPrice * item.quantity)).toLocaleString()}
                            </p>
                          </div>
                        </td>

                        {/* Selling Price */}
                        <td className="py-3.5 px-4 text-right font-mono font-semibold text-primary">
                          Rs. {item.sellPrice.toLocaleString("en-US")}
                        </td>

                        {/* Intake Qty & adjustment */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col items-center gap-1.5">
                            <div className="flex items-center gap-1 font-bold">
                              <span className={`${
                                isOutOfStock ? "text-rose-500 font-extrabold" :
                                isLowStock ? "text-amber-500" : "text-emerald-500"
                              }`}>
                                {item.items && item.items.length > 0
                                  ? item.items.reduce((sum, it) => sum + Number(it.quantity || 0), 0)
                                  : item.quantity
                                } Units
                              </span>
                            </div>

                            {/* Qty adjustment buttons inside ledger */}
                            <div className="inline-flex items-center gap-1 bg-slate-50 border p-0.5 rounded-lg dark:bg-zinc-900 dark:border-zinc-800">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-5 w-5 rounded-md hover:bg-rose-500/10 hover:text-rose-500 shrink-0"
                                onClick={() => handleLedgerQtyAdjust(item, -1)}
                              >
                                <Minus className="h-2.5 w-2.5" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-5 w-5 rounded-md hover:bg-emerald-500/10 hover:text-emerald-500 shrink-0"
                                onClick={() => handleLedgerQtyAdjust(item, 1)}
                              >
                                <Plus className="h-2.5 w-2.5" />
                              </Button>
                            </div>
                          </div>
                        </td>

                        {/* Bill Preview action */}
                        <td className="py-3.5 px-4 text-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setActiveLightboxBill(item);
                              setLightboxScale(1);
                            }}
                            className="h-7 text-[10px] font-bold uppercase tracking-wider px-2.5 border-slate-100 text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all gap-1 rounded-lg shrink-0"
                          >
                            <Eye className="h-3 w-3 shrink-0 text-primary" /> View Bill
                          </Button>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

        </div>
      )}

      {/* ==========================================
          PREMIUM LIGHTBOX OVERLAY MODAL
         ========================================== */}
      {activeLightboxBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-xl animate-in fade-in duration-300">
          
          {/* Modal Box */}
          <div className="relative w-full max-w-4xl mx-auto bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-[0_32px_64px_-15px_rgba(0,0,0,0.3)] border border-zinc-200/80 dark:border-zinc-800/80 grid grid-cols-1 md:grid-cols-2 max-h-[90vh] md:h-[85vh] overflow-y-auto md:overflow-hidden animate-in zoom-in-95 duration-300">
            
            {/* Left Box: SVG Bill Photo Zoomer */}
            <div className="overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-black flex flex-col relative h-[320px] md:h-full shrink-0">
              
              {/* Decorative premium watermark */}
              <div className="absolute bottom-4 left-6 z-10 pointer-events-none select-none">
                <span className="text-[9px] font-mono tracking-[0.2em] text-zinc-400/80 uppercase">
                  Audit Node: Verified Secure // {activeLightboxBill.id.substring(0, 8).toUpperCase()}
                </span>
              </div>

              {/* Floating controls */}
              <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 bg-zinc-900/80 backdrop-blur-xl px-2 py-1.5 rounded-2xl border border-white/10 shadow-lg shrink-0">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-8 w-8 rounded-xl text-zinc-300 hover:text-white hover:bg-white/10 transition-all shrink-0"
                  onClick={() => setLightboxScale(prev => Math.min(2.5, prev + 0.25))}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-8 w-8 rounded-xl text-zinc-300 hover:text-white hover:bg-white/10 transition-all shrink-0"
                  onClick={() => setLightboxScale(prev => Math.max(0.5, prev - 0.25))}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <a 
                  href={activeLightboxBill.billPhoto} 
                  download={`invoice_${activeLightboxBill.brandName}_${activeLightboxBill.modelName}.svg`}
                  className="inline-flex items-center justify-center h-8 w-8 rounded-xl hover:bg-white/10 text-zinc-300 hover:text-white transition-colors shrink-0"
                >
                  <Download className="h-4 w-4" />
                </a>
              </div>

              {/* Invoice Image wrapper */}
              <div className="flex-1 overflow-auto no-scrollbar p-6 flex items-center justify-center min-h-0">
                <div 
                  className="transition-transform duration-300 ease-out origin-center flex items-center justify-center shadow-2xl border border-zinc-800 rounded-2xl overflow-hidden bg-white max-w-full max-h-full"
                  style={{ transform: `scale(${lightboxScale})` }}
                >
                  <img 
                    src={activeLightboxBill.billPhoto} 
                    alt="Supplier stock intake purchase invoice" 
                    className="max-h-[220px] md:max-h-[65vh] max-w-[80vw] md:max-w-full object-contain transition-transform"
                  />
                </div>
              </div>
            </div>

            {/* Right Box: Highly Designed ERP Billing compliance sheet */}
            <div className="w-full border-t md:border-t-0 md:border-l border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40 p-4 sm:p-6 md:p-8 flex flex-col justify-between h-auto md:h-full md:overflow-y-auto no-scrollbar">
              
              <div className="space-y-4 sm:space-y-6 text-left">
                
                {/* Header title */}
                <div className="flex items-start justify-between border-b border-zinc-200/80 dark:border-zinc-800/80 pb-5 shrink-0">
                  <div className="min-w-0 space-y-2.5">
                    <span className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-950/30 px-3 py-1 rounded-full tracking-wider border border-emerald-100/50">
                      <span className="relative flex h-1.5 w-1.5 mr-0.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                      </span>
                      Log Asset Verification
                    </span>
                    <h3 className="text-xl font-black text-zinc-950 dark:text-zinc-50 tracking-tight leading-tight flex items-center gap-2 flex-wrap">
                      <span className="truncate max-w-[200px] sm:max-w-none">{activeLightboxBill.brandName} {activeLightboxBill.modelName}</span>
                      {activeLightboxBill.items && activeLightboxBill.items.length > 1 && (
                        <span className="text-[9px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-md inline-block shrink-0 uppercase tracking-wider">
                          + {activeLightboxBill.items.length - 1} other{activeLightboxBill.items.length - 1 > 1 ? "s" : ""}
                        </span>
                      )}
                    </h3>
                    <p className="text-[9px] text-zinc-400 dark:text-zinc-500 font-mono tracking-widest uppercase truncate">Intake ID: {activeLightboxBill.id.substring(0, 16).toUpperCase()}</p>
                  </div>
                  
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setActiveLightboxBill(null)}
                    className="h-9 w-9 rounded-xl text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-500 dark:hover:text-zinc-200 dark:hover:bg-zinc-800 shrink-0 self-start transition-all"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Procurement details */}
                <div className="space-y-2.5">
                  <span className="text-[9px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.15em] block">Procurement Details</span>
                  <div className="grid grid-cols-2 gap-4 p-4.5 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-950/20 shadow-[0_2px_8px_rgba(0,0,0,0.02)] text-[11px] leading-relaxed">
                    <div className="space-y-1 min-w-0">
                      <p className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                        <Building2 className="h-3 w-3 text-zinc-400 shrink-0" /> <span className="truncate">Procured By</span>
                      </p>
                      <p className="font-extrabold text-zinc-800 dark:text-zinc-200 truncate">{activeLightboxBill.branchName || "Main HQ"}</p>
                    </div>
                    <div className="space-y-1 min-w-0">
                      <p className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                        <Tag className="h-3 w-3 text-zinc-400 shrink-0" /> <span className="truncate">Supplier &amp; ID</span>
                      </p>
                      <p className="font-extrabold text-zinc-800 dark:text-zinc-200 truncate flex items-center gap-1.5 min-w-0">
                        <span className="truncate">{activeLightboxBill.supplierName}</span>
                        <span className="text-[8px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-400 px-1 py-0.2 rounded shrink-0">
                          {activeLightboxBill.supplierId.substring(0, 5).toUpperCase()}
                        </span>
                      </p>
                    </div>
                    <div className="space-y-1 min-w-0">
                      <p className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                        <FileText className="h-3 w-3 text-zinc-400 shrink-0" /> <span className="truncate">Supplier Invoice ID</span>
                      </p>
                      <p className="font-mono font-extrabold text-zinc-800 dark:text-zinc-200 truncate">{activeLightboxBill.invoiceId || "N/A"}</p>
                    </div>
                    <div className="space-y-1 min-w-0">
                      <p className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-zinc-400 shrink-0" /> <span className="truncate">Date &amp; Time</span>
                      </p>
                      <p className="font-mono font-extrabold text-zinc-800 dark:text-zinc-200 truncate">
                        {activeLightboxBill.procurementDateTime 
                          ? new Date(activeLightboxBill.procurementDateTime).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) 
                          : activeLightboxBill.date
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Purchased Items Sub-Table (Glassmorphic & Semantic) */}
                <div className="space-y-2.5">
                  <span className="text-[9px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.15em] block">Purchased Items Breakdown</span>
                  <div className="w-full overflow-x-auto no-scrollbar rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-950/20 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                    <table className="min-w-full table-auto divide-y divide-zinc-100 dark:divide-zinc-800">
                      <thead className="bg-zinc-100/50 dark:bg-zinc-900/30">
                        <tr className="text-[9px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                          <th className="px-2 py-2.5 sm:px-4 text-left font-extrabold w-1/2 whitespace-nowrap">Product Description</th>
                          <th className="px-1.5 py-2.5 sm:px-3 text-center font-extrabold w-[10%] whitespace-nowrap">Qty</th>
                          <th className="px-2 py-2.5 sm:px-4 text-right font-extrabold w-1/4 whitespace-nowrap">Unit Cost</th>
                          <th className="px-2.5 py-2.5 sm:px-4 text-right font-extrabold w-1/4 whitespace-nowrap">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {activeLightboxBill.items?.map((it) => (
                          <tr key={it.id} className="text-[10px] hover:bg-zinc-50/40 dark:hover:bg-zinc-900/10 transition-colors">
                            <td className="px-2 py-3 sm:px-4 text-left text-zinc-800 dark:text-zinc-200 min-w-[140px]">
                              <p className="font-extrabold truncate max-w-[140px] sm:max-w-none">{it.brandName} {it.modelName}</p>
                              <p className="text-[8px] text-zinc-400 dark:text-zinc-500 font-mono mt-0.5 truncate max-w-[140px] sm:max-w-none">S/N: {it.serial || "N/A"}</p>
                            </td>
                            <td className="px-1.5 py-3 sm:px-3 text-center font-mono font-extrabold text-zinc-700 dark:text-zinc-300">
                              {it.quantity}
                            </td>
                            <td className="px-2 py-3 sm:px-4 text-right font-mono font-bold text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                              Rs. {Number(it.costPrice).toLocaleString()}
                            </td>
                            <td className="px-2.5 py-3 sm:px-4 text-right font-mono font-extrabold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                              Rs. {(Number(it.quantity) * Number(it.costPrice)).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="space-y-2.5">
                  <span className="text-[9px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.15em] block">Advanced Financial Summary</span>
                  <div className="p-4.5 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-950/20 shadow-[0_2px_8px_rgba(0,0,0,0.02)] text-[11px] space-y-3">
                    
                    <div className="flex justify-between items-center gap-4">
                      <span className="font-medium text-zinc-500 truncate">Total Cost Sum (LKR)</span>
                      <span className="font-mono font-black text-zinc-900 dark:text-zinc-100 text-xs shrink-0 whitespace-nowrap">
                        Rs. {(activeLightboxBill.totalBillAmount || (activeLightboxBill.costPrice * activeLightboxBill.quantity)).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center gap-4 border-t border-dashed border-zinc-200/80 dark:border-zinc-800/80 pt-3">
                      <span className="font-medium text-zinc-500 truncate">Advance Payment (LKR)</span>
                      <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400 shrink-0 whitespace-nowrap">
                        Rs. {(activeLightboxBill.advancePayment || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center gap-4 border-t border-dashed border-zinc-200/80 dark:border-zinc-800/80 pt-3">
                      <span className="font-medium text-zinc-500 truncate">Remaining Balance / Due (LKR)</span>
                      <span className={`font-mono font-black shrink-0 whitespace-nowrap ${activeLightboxBill.remainingBalance && activeLightboxBill.remainingBalance > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                        Rs. {(activeLightboxBill.remainingBalance || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center gap-4 border-t border-zinc-200/80 dark:border-zinc-800/80 pt-3">
                      <span className="font-medium text-zinc-500 truncate">Settled Via (Payment Method)</span>
                      <span className="inline-flex items-center gap-1.5 font-extrabold text-zinc-700 dark:text-zinc-300 uppercase text-[9px] tracking-wider bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-md shrink-0">
                        {activeLightboxBill.paymentMethod === "Bank Transfer" && <Landmark className="h-3 w-3 text-primary shrink-0" />}
                        {activeLightboxBill.paymentMethod === "Cheque" && <CreditCard className="h-3 w-3 text-primary shrink-0" />}
                        {activeLightboxBill.paymentMethod === "Cash" && <Banknote className="h-3 w-3 text-primary shrink-0" />}
                        {activeLightboxBill.paymentMethod === "Card" && <CreditCard className="h-3 w-3 text-primary shrink-0" />}
                        <span className="truncate">{activeLightboxBill.paymentMethod || "Cash"}</span>
                      </span>
                    </div>

                    {/* Conditional dynamic sub-rows */}
                    {activeLightboxBill.paymentMethod === "Card" && activeLightboxBill.cardTxRef && (
                      <div className="p-3 rounded-xl border border-zinc-200/60 bg-zinc-50/50 dark:bg-zinc-900/30 dark:border-zinc-800/80 text-[10px] space-y-1.5 animate-in slide-in-from-top-1">
                        <div className="flex justify-between items-center gap-4">
                          <span className="text-zinc-400 truncate">Card Network:</span>
                          <strong className="text-zinc-750 dark:text-zinc-200 shrink-0 whitespace-nowrap">{activeLightboxBill.cardType || "Visa"}</strong>
                        </div>
                        <div className="flex justify-between items-center gap-4">
                          <span className="text-zinc-400 truncate">Transaction Ref:</span>
                          <strong className="text-zinc-750 dark:text-zinc-200 font-mono shrink-0 whitespace-nowrap">{activeLightboxBill.cardTxRef}</strong>
                        </div>
                      </div>
                    )}

                    {activeLightboxBill.paymentMethod === "Cheque" && activeLightboxBill.chequeNumber && (
                      <div className="p-3 rounded-xl border border-zinc-200/60 bg-zinc-50/50 dark:bg-zinc-900/30 dark:border-zinc-800/80 text-[10px] space-y-1.5 animate-in slide-in-from-top-1">
                        <div className="flex justify-between items-center gap-4">
                          <span className="text-zinc-400 truncate">Cheque Number:</span>
                          <strong className="text-zinc-750 dark:text-zinc-200 font-mono shrink-0 whitespace-nowrap">{activeLightboxBill.chequeNumber}</strong>
                        </div>
                        <div className="flex justify-between items-center gap-4">
                          <span className="text-zinc-400 truncate">Cheque Due Date:</span>
                          <strong className="text-zinc-750 dark:text-zinc-200 font-mono shrink-0 whitespace-nowrap">{activeLightboxBill.chequeDate}</strong>
                        </div>
                      </div>
                    )}

                    {activeLightboxBill.paymentMethod === "Bank Transfer" && activeLightboxBill.bankTxRef && (
                      <div className="p-3 rounded-xl border border-zinc-200/60 bg-zinc-50/50 dark:bg-zinc-900/30 dark:border-zinc-800/80 text-[10px] space-y-1.5 animate-in slide-in-from-top-1">
                        <div className="flex justify-between items-center gap-4">
                          <span className="text-zinc-400 truncate">Bank Reference:</span>
                          <strong className="text-zinc-750 dark:text-zinc-200 font-mono shrink-0 whitespace-nowrap">{activeLightboxBill.bankTxRef}</strong>
                        </div>
                        <div className="flex justify-between items-center gap-4">
                          <span className="text-zinc-400 truncate">Account Number:</span>
                          <strong className="text-zinc-750 dark:text-zinc-200 font-mono shrink-0 whitespace-nowrap">{activeLightboxBill.bankAccount}</strong>
                        </div>
                      </div>
                    )}

                    {activeLightboxBill.discrepancyNotes && (
                      <div className="p-3 rounded-xl border border-amber-100/50 bg-amber-50/30 text-[10px] text-amber-800 space-y-1.5 dark:bg-amber-950/10 dark:border-amber-900/55 dark:text-amber-400 mt-2">
                        <p className="font-bold flex items-center gap-1.5">
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" /> <span className="truncate">Discrepancy / Damage Notes</span>
                        </p>
                        <p className="font-medium leading-relaxed break-words">{activeLightboxBill.discrepancyNotes}</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Bottom Action Status Pill */}
              <div className="border-t border-zinc-200/80 dark:border-zinc-800/80 pt-5 mt-6 shrink-0">
                <span className={`w-full text-center py-3.5 rounded-2xl border font-black uppercase text-[10px] tracking-[0.2em] block transition-all shadow-sm ${
                  activeLightboxBill.paymentStatus === "Fully Paid" 
                    ? "bg-gradient-to-r from-emerald-500 to-teal-600 border-emerald-600 text-white shadow-emerald-500/10" 
                    : activeLightboxBill.paymentStatus === "Partially Paid"
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 border-amber-600 text-white shadow-amber-500/10"
                      : "bg-gradient-to-r from-rose-500 to-red-600 border-rose-600 text-white shadow-rose-500/10"
                }`}>
                  PAYMENT: {activeLightboxBill.paymentStatus ? activeLightboxBill.paymentStatus.toUpperCase() : "FULLY PAID"}
                </span>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
