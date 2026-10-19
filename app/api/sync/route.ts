import { NextResponse, type NextRequest } from "next/server";
import { getCollegePortalAdapter } from "@/lib/integrations/development-adapter";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const syncType = body.type || "full";
    const adapter = getCollegePortalAdapter();

    if (syncType === "students") {
      const res = await adapter.syncStudents(body.options);
      return NextResponse.json({ success: true, result: res });
    }

    if (syncType === "courses") {
      const res = await adapter.syncCourses(body.options);
      return NextResponse.json({ success: true, result: res });
    }

    if (syncType === "attendance") {
      const res = await adapter.syncAttendance(body.options);
      return NextResponse.json({ success: true, result: res });
    }

    const res = await adapter.runFullSync(body.options);
    return NextResponse.json({ success: true, results: res });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Sync execution failed",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  const adapter = getCollegePortalAdapter();
  const status = await adapter.testConnection();
  return NextResponse.json(status);
}
