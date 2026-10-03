import { NextResponse } from "@/lib/next-server-shim";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const globalMcpPath = "C:\\Users\\Pc\\.gemini\\config\\mcp_config.json";
    const workspaceMcpPath = path.resolve(process.cwd(), ".agents/mcp_config.json");

    let globalConfig: { mcpServers?: Record<string, unknown> } = {};
    if (fs.existsSync(globalMcpPath)) {
      try {
        globalConfig = JSON.parse(fs.readFileSync(globalMcpPath, "utf-8"));
      } catch {
        // ignore
      }
    }

    const stitchConfigured = !!globalConfig.mcpServers?.stitch;

    const servers = [
      {
        id: "stitch",
        name: "Google Stitch MCP (UI/UX Design)",
        type: "Remote SSE / Google Cloud",
        url: "https://stitch.googleapis.com/mcp",
        status: stitchConfigured ? "CONNECTED" : "DISCONNECTED",
        role: "UI/UX Generation, Design System Sync & Screen Variants",
        project: "projects/16697580727251704127",
        projectTitle: "Smart Inventory Continuous Monitoring System (SICMS)",
        designTheme: "Industrial Telemetry & Inventory Surveillance",
        lastSync: new Date().toISOString(),
      },
      {
        id: "notebooks",
        name: "Jupyter Notebooks Engine",
        type: "Local Stdio Proxy",
        status: globalConfig.mcpServers?.notebooks ? "ACTIVE" : "OFFLINE",
        role: "Data Science, Exploratory Stock Analytics & Ad-hoc Queries",
      },
      {
        id: "visualization",
        name: "Visualization MCP",
        type: "Local Stdio Proxy",
        status: globalConfig.mcpServers?.visualization ? "ACTIVE" : "OFFLINE",
        role: "Dynamic SVG / Canvas Charts & Telemetry Visuals",
      },
      {
        id: "data-agent-kit",
        name: "Data Agent Kit",
        type: "Local Stdio Proxy",
        status: globalConfig.mcpServers?.["data-agent-kit"] ? "ACTIVE" : "OFFLINE",
        role: "GCP BigQuery / Cloud SQL Data Telemetry",
      },
    ];

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      activeServerCount: servers.filter((s) => s.status === "CONNECTED" || s.status === "ACTIVE").length,
      stitch: {
        connected: stitchConfigured,
        serverUrl: "https://stitch.googleapis.com/mcp",
        projectId: "16697580727251704127",
        title: "Smart Inventory Continuous Monitoring System (SICMS)",
        theme: "Industrial Telemetry & Inventory Surveillance",
        primaryColor: "#10b981",
        surfaceColor: "#0b1326",
      },
      servers,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
