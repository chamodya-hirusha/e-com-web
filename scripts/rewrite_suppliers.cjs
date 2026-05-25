const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, '../src/app/(main)/suppliers/page.tsx');
let content = fs.readFileSync(pagePath, 'utf-8');

// 1. Remove MOCK_SUPPLIER_METRICS
content = content.replace(/\/\/ High-fidelity pre-populated ERP datasets.*?export default function SuppliersPage/s, 'export default function SuppliersPage');

// 2. Replace state initializations
content = content.replace(
  /const \[supplierActivity, setSupplierActivity\] = useState<any\[\]>\(MOCK_SUPPLIER_METRICS\.default\.activity\);\s*const \[supplierProducts, setSupplierProducts\] = useState<any\[\]>\(MOCK_SUPPLIER_METRICS\.default\.products\);\s*const \[supplierBills, setSupplierBills\] = useState<Record<string, any\[\]>>\(MOCK_SUPPLIER_METRICS\.default\.bills\);/,
  `const [supplierActivity, setSupplierActivity] = useState<any[]>([]);
  const [supplierProducts, setSupplierProducts] = useState<any[]>([]);
  const [supplierBills, setSupplierBills] = useState<Record<string, any[]>>({});
  const [loadingMetrics, setLoadingMetrics] = useState(false);`
);

// 3. Add useEffect to fetch data when selectedSupplier changes
const newUseEffect = `
  // Fetch real data when supplier changes
  useEffect(() => {
    if (!selectedSupplier) return;
    
    // Set initial ERP values
    setTaxId(selectedSupplier.taxId || "");
    setPaymentTerms(selectedSupplier.paymentTerms || "Net 30");
    setContractFile(selectedSupplier.contractFile || null);

    const fetchData = async () => {
      setLoadingMetrics(true);
      try {
        const headers = { "x-tenant-id": "cmpc620w20007ezgn2axsmt9p" };
        
        // Fetch products
        const prodRes = await fetch(\`/api/suppliers/\${selectedSupplier.id}/products\`, { headers });
        if (prodRes.ok) {
          const prods = await prodRes.json();
          setSupplierProducts(prods.map((p: any) => ({
            id: p.id,
            date: p.stockIntake?.date || "Unknown",
            name: p.brandName + " " + p.modelName,
            sku: p.serial || "N/A",
            qty: p.quantity,
            price: Number(p.costPrice),
            warranty: "uploaded" // default simulate
          })));
        }

        // Fetch bills
        const billRes = await fetch(\`/api/suppliers/\${selectedSupplier.id}/bills\`, { headers });
        let billsList = [];
        if (billRes.ok) {
          billsList = await billRes.json();
          const grouped: Record<string, any[]> = {};
          billsList.forEach((b: any) => {
            if (!grouped[b.month]) grouped[b.month] = [];
            grouped[b.month].push({
              id: b.id,
              date: new Date(b.date).toLocaleDateString(),
              amount: Number(b.amount),
              invoice: !!b.invoiceFile,
              receipt: !!b.receiptFile,
              note: !!b.noteFile
            });
          });
          setSupplierBills(grouped);
        }

        // Generate activity dynamically
        const activity = [];
        if (selectedSupplier.createdAt) {
          activity.push({
            id: "a_created", date: new Date(selectedSupplier.createdAt).toLocaleDateString(),
            type: "contract", title: "Supplier Registered", desc: "Added to ERP registry."
          });
        }
        billsList.slice(0, 3).forEach((b: any) => {
          activity.push({
            id: \`a_bill_\${b.id}\`, date: new Date(b.date).toLocaleDateString(),
            type: "payment", title: "Supplier Bill Logged", desc: \`Logged \$\${Number(b.amount).toLocaleString()} for \${b.month}\`
          });
        });
        setSupplierActivity(activity.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingMetrics(false);
      }
    };
    fetchData();
  }, [selectedSupplier]);
`;

content = content.replace(
  /\/\/ Set default selected supplier when data loads\s*useEffect\(\(\) => \{\s*if \(suppliers\.length > 0 && !selectedSupplier\) \{\s*setSelectedSupplier\(suppliers\[0\]\);\s*\}\s*\}, \[suppliers, selectedSupplier\]\);/,
  `// Set default selected supplier when data loads
  useEffect(() => {
    if (suppliers.length > 0 && !selectedSupplier) {
      setSelectedSupplier(suppliers[0]);
    }
  }, [suppliers, selectedSupplier]);
${newUseEffect}`
);

// 4. Update handleBillSubmit to call API
const newBillSubmit = `const handleBillSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier) return;
    if (!billAmount || isNaN(Number(billAmount))) {
      toast.error("Please enter a valid bill amount.");
      return;
    }
    if (!billInvoiceFile && !billReceiptFile && !billNoteFile) {
      toast.error("Please attach at least one document asset.");
      return;
    }

    setIsUploadingBill(true);
    try {
      const res = await fetch(\`/api/suppliers/\${selectedSupplier.id}/bills\`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-tenant-id": "cmpc620w20007ezgn2axsmt9p" },
        body: JSON.stringify({
          month: billMonth,
          amount: billAmount,
          invoiceFile: billInvoiceFile,
          receiptFile: billReceiptFile,
          noteFile: billNoteFile
        })
      });

      if (!res.ok) throw new Error("Failed to save bill");
      const newBillData = await res.json();

      const newBill = {
        id: newBillData.id,
        date: new Date(newBillData.date).toLocaleDateString(),
        amount: Number(newBillData.amount),
        invoice: !!newBillData.invoiceFile,
        receipt: !!newBillData.receiptFile,
        note: !!newBillData.noteFile,
      };

      setSupplierBills((prev) => {
        const monthBills = prev[billMonth] || [];
        return { ...prev, [billMonth]: [newBill, ...monthBills] };
      });

      const newActivity = {
        id: \`a_dyn_\${Date.now()}\`,
        date: "Today",
        type: "payment",
        title: "New Supplier Bill Logged",
        desc: \`A bill of \$\${Number(billAmount).toLocaleString()} was archived under \${billMonth}.\`
      };
      setSupplierActivity((prev) => [newActivity, ...prev]);

      setBillAmount("");
      setBillInvoiceFile(null);
      setBillReceiptFile(null);
      setBillNoteFile(null);
      toast.success("Supplier transaction bills logged successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to log bill.");
    } finally {
      setIsUploadingBill(false);
    }
  };`;

content = content.replace(/const handleBillSubmit = \(e: React\.FormEvent\) => \{.*?\}, 1800\);\s*\};/s, newBillSubmit);

// 5. Update handleERPSubmit to call API
const newERPSubmit = `const handleERPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier) return;
    if (!taxId) {
      toast.error("Please provide the Supplier Tax/VAT Registration ID.");
      return;
    }

    setIsSubmittingERP(true);
    try {
      const res = await fetch(\`/api/suppliers/\${selectedSupplier.id}\`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-tenant-id": "cmpc620w20007ezgn2axsmt9p" },
        body: JSON.stringify({
          taxId,
          paymentTerms,
          contractFile
        })
      });

      if (!res.ok) throw new Error("Failed to update ERP details");

      // Update local state if needed
      setSelectedSupplier(prev => prev ? { ...prev, taxId, paymentTerms, contractFile } : prev);

      const newActivity = {
        id: \`a_dyn_\${Date.now()}\`,
        date: "Today",
        type: "contract",
        title: "ERP Supplier Registry Updated",
        desc: \`Terms updated to \${paymentTerms}. Tax ID: \${taxId} confirmed.\`
      };
      setSupplierActivity((prev) => [newActivity, ...prev]);
      toast.success("ERP logistics profiles and logs saved!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update ERP details.");
    } finally {
      setIsSubmittingERP(false);
    }
  };`;

content = content.replace(/const handleERPSubmit = \(e: React\.FormEvent\) => \{.*?\}, 1600\);\s*\};/s, newERPSubmit);

// 6. Fix Business Volume / Outstanding Display to use selectedSupplier
content = content.replace(/\{MOCK_SUPPLIER_METRICS\.default\.volume\}/g, '{selectedSupplier.businessVolume ? `$${Number(selectedSupplier.businessVolume).toLocaleString()}` : "$0"}');
content = content.replace(/\{MOCK_SUPPLIER_METRICS\.default\.outstanding\}/g, '{selectedSupplier.outstanding ? `$${Number(selectedSupplier.outstanding).toLocaleString()}` : "$0"}');
content = content.replace(/\{MOCK_SUPPLIER_METRICS\.default\.terms\}/g, '{selectedSupplier.paymentTerms || "Net 30"}');

fs.writeFileSync(pagePath, content);
console.log("Successfully rewrote suppliers/page.tsx");
