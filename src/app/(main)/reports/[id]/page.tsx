import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";
import { ReportTemplate } from "@/reports/types";

// Force TS recompile

export default async function ReportPage({ params }: { params: { id: string } }) {
  const templatesDir = path.join(process.cwd(), "src/reports/templates");
  const filePath = path.join(templatesDir, `${params.id}.json`);

  let template: ReportTemplate;

  try {
    if (!fs.existsSync(filePath)) {
      notFound();
    }
    const fileContent = fs.readFileSync(filePath, "utf-8");
    template = JSON.parse(fileContent);
  } catch (error) {
    console.error(`Failed to load template ${params.id}`, error);
    notFound();
  }

  return (
    <div className="space-y-6">

    </div>
  );
}
