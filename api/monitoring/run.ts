import type { IncomingMessage, ServerResponse } from "http";
import { MonitoringService } from "../../src/services/monitoring.service";

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    const authHeader = req.headers.authorization;
    const cronSecret = process.env.CRON_SECRET || "sicms_monitoring_cron_secret_2026";

    // Vercel Cron authorization check
    if (authHeader && authHeader !== `Bearer ${cronSecret}` && process.env.NODE_ENV === "production") {
      res.statusCode = 401;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Unauthorized cron trigger" }));
      return;
    }

    const result = await MonitoringService.evaluateAll();
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        success: true,
        message: "Daily continuous surveillance completed",
        result,
        timestamp: new Date().toISOString(),
      })
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal surveillance error";
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: msg }));
  }
}
