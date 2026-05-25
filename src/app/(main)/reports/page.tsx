import fs from "fs";
import path from "path";
import Link from "next/link";
import { 
  BarChart3, 
  FileText, 
  PieChart, 
  TrendingUp, 
  Boxes, 
  CreditCard, 
  TrendingDown, 
  ShieldCheck,
  Wrench,
  ChevronRight
} from "lucide-react";
import { ReportTemplate } from "@/reports/types";

// Icon mapper
const IconMap: Record<string, React.ElementType> = {
  BarChart3,
  FileText,
  PieChart,
  TrendingUp,
  Boxes,
  CreditCard,
  TrendingDown,
  ShieldCheck,
  Wrench,
};

export default async function ReportsPage() {
  // Read all templates from the JSON files dynamically on the server
  const templatesDir = path.join(process.cwd(), "src/reports/templates");
  let templates: ReportTemplate[] = [];

  try {
    const files = fs.readdirSync(templatesDir);
    for (const file of files) {
      if (file.endsWith(".json")) {
        const filePath = path.join(templatesDir, file);
        const fileContent = fs.readFileSync(filePath, "utf-8");
        templates.push(JSON.parse(fileContent));
      }
    }
  } catch (error) {
    console.error("Failed to read report templates", error);
  }

  // Sort by title
  templates.sort((a, b) => a.title.localeCompare(b.title));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Reports & Analytics</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => {
          const Icon = IconMap[template.icon] || FileText;
          return (
            <Link 
              href={`/reports/${template.id}`} 
              key={template.id}
              className="card-elevated p-5 flex flex-col justify-between h-40 hover:border-primary/50 transition-all duration-300 group"
            >
              <div className="flex items-start justify-between">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="text-muted-foreground group-hover:text-primary transition-colors">
                  <ChevronRight className="h-5 w-5" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-sm tracking-tight text-foreground">{template.title}</h3>
                <p className="text-xs text-muted-foreground leading-normal line-clamp-2">{template.description}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
