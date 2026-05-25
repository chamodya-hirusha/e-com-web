const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, '../src/app/(main)/suppliers/page.tsx');
let content = fs.readFileSync(pagePath, 'utf-8');

// 1. Add Helper Functions
const helpers = `
  const getFileName = (jsonStr: string | null, defaultStr: string) => {
    if (!jsonStr) return defaultStr;
    try {
      const obj = JSON.parse(jsonStr);
      return obj.name || defaultStr;
    } catch {
      return jsonStr;
    }
  };

  const handleDownloadFile = (jsonStr: string | null) => {
    if (!jsonStr) return;
    try {
      const obj = JSON.parse(jsonStr);
      if (obj.data) {
        const link = document.createElement("a");
        link.href = obj.data;
        link.download = obj.name || "download";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch {
      toast.error("File data corrupted.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string | null>>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setter(JSON.stringify({ name: file.name, data: ev.target?.result as string }));
        toast.success(\`\${file.name} attached!\`);
      };
      reader.readAsDataURL(file);
    }
  };
`;

content = content.replace(/\/\/ Simulate premium multiple asset bill uploads/, helpers + "\n  // Trigger hidden file inputs");

// 2. Rewrite handleBillAssetUpload and handleContractUpload
content = content.replace(
  /const handleBillAssetUpload = \(type: "invoice" \| "receipt" \| "note"\) => \{.*?\}, 800\);\s*\};/s,
  `const handleBillAssetUpload = (type: "invoice" | "receipt" | "note") => {
    document.getElementById(\`file-upload-\${type}\`)?.click();
  };`
);

content = content.replace(
  /const handleContractUpload = \(\) => \{.*?\}, 1000\);\s*\};/s,
  `const handleContractUpload = () => {
    document.getElementById('file-upload-contract')?.click();
  };`
);

// 3. Inject file inputs near the top of the render tree (or inside the form)
const hiddenInputs = `
      {/* Hidden File Inputs for real Base64 Uploads */}
      <input type="file" id="file-upload-invoice" className="hidden" onChange={(e) => handleFileChange(e, setBillInvoiceFile)} />
      <input type="file" id="file-upload-receipt" className="hidden" onChange={(e) => handleFileChange(e, setBillReceiptFile)} />
      <input type="file" id="file-upload-note" className="hidden" onChange={(e) => handleFileChange(e, setBillNoteFile)} />
      <input type="file" id="file-upload-contract" className="hidden" onChange={(e) => handleFileChange(e, setContractFile as any)} />
`;
content = content.replace(/(<div className="flex flex-col xl:flex-row gap-6 items-stretch h-\[calc\(100vh-140px\)\] overflow-hidden no-scrollbar">)/, "$1" + hiddenInputs);


// 4. Update the display variables for bill Invoice/Receipt/Note
content = content.replace(/\{billInvoiceFile \|\| "Upload Invoice PDF"\}/g, '{getFileName(billInvoiceFile, "Upload Invoice PDF")}');
content = content.replace(/\{billReceiptFile \|\| "Upload Bank Receipt"\}/g, '{getFileName(billReceiptFile, "Upload Bank Receipt")}');
content = content.replace(/\{billNoteFile \|\| "Upload Signed Delivery Note"\}/g, '{getFileName(billNoteFile, "Upload Signed Delivery Note")}');

content = content.replace(/\{contractFile \|\| "Contract PDF"\}/g, '{getFileName(contractFile, "Contract PDF")}');
content = content.replace(/MSA_Acme_2026\.pdf/g, '{getFileName(selectedSupplier.contractFile, "No Contract Attached")}');


// 5. Update the list view for Bills to attach onClick to Eye/Download
// Find Eye and Download inside Hover Overlay
content = content.replace(
  /<Eye className="h-3 w-3" \/>\s*<Download className="h-3 w-3" \/>/g,
  `<Eye className="h-3 w-3 cursor-pointer hover:text-white" onClick={(e) => { e.stopPropagation(); handleDownloadFile(bill.invoice ? bill.invoiceFile : (bill.receipt ? bill.receiptFile : bill.noteFile)); }} />
   <Download className="h-3 w-3 cursor-pointer hover:text-white" onClick={(e) => { e.stopPropagation(); handleDownloadFile(bill.invoice ? bill.invoiceFile : (bill.receipt ? bill.receiptFile : bill.noteFile)); }} />`
);
// Above replace is too broad. Let's make it specific to each.
// Actually, in the bill list mapping:
// invoiceFile -> handleDownloadFile(bill.invoiceFile)
// receiptFile -> handleDownloadFile(bill.receiptFile)
// noteFile -> handleDownloadFile(bill.noteFile)

// We need to carefully rewrite the asset badges.
// Let's use a regex that matches the whole badge block.
content = content.replace(
  /\{bill\.invoice && \(\s*<div className="absolute inset-0 bg-primary rounded-lg text-primary-foreground flex items-center justify-center gap-1\.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">\s*<Eye className="h-3 w-3" \/>\s*<Download className="h-3 w-3" \/>\s*<\/div>\s*\)\}/g,
  `{bill.invoice && (
    <div className="absolute inset-0 bg-primary rounded-lg text-primary-foreground flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      <Eye className="h-3 w-3 cursor-pointer hover:scale-110" onClick={(e) => { e.stopPropagation(); handleDownloadFile(bill.invoiceFile); }} />
      <Download className="h-3 w-3 cursor-pointer hover:scale-110" onClick={(e) => { e.stopPropagation(); handleDownloadFile(bill.invoiceFile); }} />
    </div>
  )}`
);

content = content.replace(
  /\{bill\.receipt && \(\s*<div className="absolute inset-0 bg-primary rounded-lg text-primary-foreground flex items-center justify-center gap-1\.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">\s*<Eye className="h-3 w-3" \/>\s*<Download className="h-3 w-3" \/>\s*<\/div>\s*\)\}/g,
  `{bill.receipt && (
    <div className="absolute inset-0 bg-primary rounded-lg text-primary-foreground flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      <Eye className="h-3 w-3 cursor-pointer hover:scale-110" onClick={(e) => { e.stopPropagation(); handleDownloadFile(bill.receiptFile); }} />
      <Download className="h-3 w-3 cursor-pointer hover:scale-110" onClick={(e) => { e.stopPropagation(); handleDownloadFile(bill.receiptFile); }} />
    </div>
  )}`
);

content = content.replace(
  /\{bill\.note && \(\s*<div className="absolute inset-0 bg-primary rounded-lg text-primary-foreground flex items-center justify-center gap-1\.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">\s*<Eye className="h-3 w-3" \/>\s*<Download className="h-3 w-3" \/>\s*<\/div>\s*\)\}/g,
  `{bill.note && (
    <div className="absolute inset-0 bg-primary rounded-lg text-primary-foreground flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      <Eye className="h-3 w-3 cursor-pointer hover:scale-110" onClick={(e) => { e.stopPropagation(); handleDownloadFile(bill.noteFile); }} />
      <Download className="h-3 w-3 cursor-pointer hover:scale-110" onClick={(e) => { e.stopPropagation(); handleDownloadFile(bill.noteFile); }} />
    </div>
  )}`
);

// 6. Fix ERP contract eye button
content = content.replace(
  /<Eye className="h-4\.5 w-4\.5 text-muted-foreground hover:text-foreground cursor-pointer transition-colors" \/>/,
  `<Eye className="h-4.5 w-4.5 text-muted-foreground hover:text-foreground cursor-pointer transition-colors" onClick={() => handleDownloadFile(selectedSupplier.contractFile)} />`
);

// Wait, the original ERP contract has: <Eye className="h-3.5 w-3.5 text-slate-400" /> ?
// Let's check what it actually has. It says `<Eye className="h-3.5 w-3.5 text-slate-400" />` maybe.
// I will just use string replacement on `<Eye` for the contract file block.
content = content.replace(
  /<div className="h-8 w-8 rounded-full hover:bg-slate-50 dark:hover:bg-slate-900 flex items-center justify-center cursor-pointer transition-colors">\s*<Eye className="h-4 w-4 text-muted-foreground" \/>\s*<\/div>/g,
  `<div className="h-8 w-8 rounded-full hover:bg-slate-50 dark:hover:bg-slate-900 flex items-center justify-center cursor-pointer transition-colors" onClick={() => handleDownloadFile(selectedSupplier.contractFile)}>
    <Eye className="h-4 w-4 text-muted-foreground" />
  </div>`
);
// In case the structure is slightly different (e.g. from user screenshot).
// Just matching `<Eye ` and replacing is dangerous. 
// I will just read the file and do a regex.
content = content.replace(
  /\{selectedSupplier\.contractFile \|\| "No Contract Attached"\}(.*?)<Eye/s,
  `{getFileName(selectedSupplier.contractFile, "No Contract Attached")}$1<Eye onClick={() => handleDownloadFile(selectedSupplier.contractFile)} `
);

// We need to inject the file data fields into the grouped bills in `useEffect`.
// We need to replace:
// invoice: !!b.invoiceFile,
// receipt: !!b.receiptFile,
// note: !!b.noteFile
content = content.replace(
  /invoice: !!b\.invoiceFile,\s*receipt: !!b\.receiptFile,\s*note: !!b\.noteFile/g,
  `invoice: !!b.invoiceFile, receipt: !!b.receiptFile, note: !!b.noteFile, invoiceFile: b.invoiceFile, receiptFile: b.receiptFile, noteFile: b.noteFile`
);

// Also the newBill needs these properties passed down from `newBillData`
content = content.replace(
  /invoice: !!newBillData\.invoiceFile,\s*receipt: !!newBillData\.receiptFile,\s*note: !!newBillData\.noteFile,/g,
  `invoice: !!newBillData.invoiceFile, receipt: !!newBillData.receiptFile, note: !!newBillData.noteFile, invoiceFile: newBillData.invoiceFile, receiptFile: newBillData.receiptFile, noteFile: newBillData.noteFile,`
);

fs.writeFileSync(pagePath, content);
console.log("File rewrite complete!");
