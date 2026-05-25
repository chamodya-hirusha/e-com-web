import { NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import { executeReport } from '@/reports/services/reportEngine';

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { tenantId } = getAuthContext();
    const url = new URL(req.url);
    const reportId = url.searchParams.get('report');

    if (!reportId) {
      return NextResponse.json({ error: 'Report ID is required' }, { status: 400 });
    }

    const filters = await req.json();

    const data = await executeReport(reportId, tenantId, filters);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error(`[REPORT_ENGINE_ERROR] ${error.message}`);
    return NextResponse.json({ error: error.message || 'Failed to generate report data' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  // Allow GET for simple testing, but usually POST is better for sending complex filters
  try {
    const { tenantId } = getAuthContext();
    const url = new URL(req.url);
    const reportId = url.searchParams.get('report');

    if (!reportId) {
      return NextResponse.json({ error: 'Report ID is required' }, { status: 400 });
    }

    // Convert search params to a simple filter object
    const filters = Object.fromEntries(url.searchParams.entries());
    delete filters.report;

    const data = await executeReport(reportId, tenantId, filters);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error(`[REPORT_ENGINE_ERROR] ${error.message}`);
    return NextResponse.json({ error: error.message || 'Failed to generate report data' }, { status: 500 });
  }
}
