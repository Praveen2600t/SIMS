import type { IncomingMessage, ServerResponse } from "http";
import { parseCookies } from "../lib/auth";

import * as authLogin from "../app/api/auth/login/route";
import * as authLogout from "../app/api/auth/logout/route";
import * as authMe from "../app/api/auth/me/route";
import * as products from "../app/api/products/route";
import * as productById from "../app/api/products/[id]/route";
import * as inventoryStockIn from "../app/api/inventory/stock-in/route";
import * as inventoryStockOut from "../app/api/inventory/stock-out/route";
import * as inventoryAdjust from "../app/api/inventory/adjust/route";
import * as inventoryBatches from "../app/api/inventory/batches/route";
import * as inventoryMovements from "../app/api/inventory/movements/route";
import * as monitoringAlerts from "../app/api/monitoring/alerts/route";
import * as alertResolve from "../app/api/monitoring/alerts/[id]/resolve/route";
import * as monitoringRun from "../app/api/monitoring/run/route";
import * as monitoringSettings from "../app/api/monitoring/settings/route";
import * as dashboardMetrics from "../app/api/dashboard/metrics/route";
import * as reports from "../app/api/reports/route";
import * as csvImport from "../app/api/csv/import/route";
import * as csvExport from "../app/api/csv/export/route";
import * as categories from "../app/api/categories/route";
import * as suppliers from "../app/api/suppliers/route";
import * as locations from "../app/api/locations/route";
import * as sales from "../app/api/sales/route";
import * as purchaseOrders from "../app/api/purchase-orders/route";
import * as poReceive from "../app/api/purchase-orders/[id]/receive/route";
import * as mcpStatus from "../app/api/mcp/status/route";

async function readRequestBody(req: IncomingMessage): Promise<string | undefined> {
  if (req.method === "GET" || req.method === "HEAD") return undefined;
  if ((req as any).body) {
    return typeof (req as any).body === "string"
      ? (req as any).body
      : JSON.stringify((req as any).body);
  }
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => resolve(data.length > 0 ? data : undefined));
    req.on("error", reject);
  });
}

export async function handleApiRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
  try {
    const rawUrl = req.url || "/";
    const host = req.headers.host || "localhost:3000";
    const protocol = (req.headers["x-forwarded-proto"] as string) || "http";
    const fullUrl = new URL(rawUrl, `${protocol}://${host}`);
    const pathname = fullUrl.pathname;
    const method = (req.method || "GET").toUpperCase();

    // Prepare Web API Request
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach((v) => headers.append(key, v));
        } else {
          headers.set(key, value);
        }
      }
    }

    const bodyString = await readRequestBody(req);
    const webReq = new Request(fullUrl.toString(), {
      method,
      headers,
      body: bodyString ? bodyString : undefined,
    });

    // Attach NextRequest-compatible cookies getter
    const cookieHeader = headers.get("cookie");
    const cookieMap = parseCookies(cookieHeader);
    (webReq as any).cookies = {
      get: (name: string) => (cookieMap[name] ? { value: cookieMap[name] } : undefined),
    };

    let handlerModule: any = null;
    let params: Record<string, string> = {};

    // Route matching
    if (pathname === "/api/auth/login") {
      handlerModule = authLogin;
    } else if (pathname === "/api/auth/logout") {
      handlerModule = authLogout;
    } else if (pathname === "/api/auth/me") {
      handlerModule = authMe;
    } else if (pathname === "/api/products") {
      handlerModule = products;
    } else if (pathname.startsWith("/api/products/")) {
      const id = pathname.replace("/api/products/", "").split("/")[0];
      params = { id };
      handlerModule = productById;
    } else if (pathname === "/api/inventory/stock-in") {
      handlerModule = inventoryStockIn;
    } else if (pathname === "/api/inventory/stock-out") {
      handlerModule = inventoryStockOut;
    } else if (pathname === "/api/inventory/adjust") {
      handlerModule = inventoryAdjust;
    } else if (pathname === "/api/inventory/batches") {
      handlerModule = inventoryBatches;
    } else if (pathname === "/api/inventory/movements") {
      handlerModule = inventoryMovements;
    } else if (pathname.startsWith("/api/monitoring/alerts/") && pathname.endsWith("/resolve")) {
      const match = pathname.match(/^\/api\/monitoring\/alerts\/([^/]+)\/resolve$/);
      if (match) {
        params = { id: match[1] };
        handlerModule = alertResolve;
      }
    } else if (pathname === "/api/monitoring/alerts") {
      handlerModule = monitoringAlerts;
    } else if (pathname === "/api/monitoring/run") {
      handlerModule = monitoringRun;
    } else if (pathname === "/api/monitoring/settings") {
      handlerModule = monitoringSettings;
    } else if (pathname === "/api/dashboard/metrics") {
      handlerModule = dashboardMetrics;
    } else if (pathname === "/api/reports") {
      handlerModule = reports;
    } else if (pathname === "/api/csv/import") {
      handlerModule = csvImport;
    } else if (pathname === "/api/csv/export") {
      handlerModule = csvExport;
    } else if (pathname === "/api/categories") {
      handlerModule = categories;
    } else if (pathname === "/api/suppliers") {
      handlerModule = suppliers;
    } else if (pathname === "/api/locations") {
      handlerModule = locations;
    } else if (pathname === "/api/sales") {
      handlerModule = sales;
    } else if (pathname.startsWith("/api/purchase-orders/") && pathname.endsWith("/receive")) {
      const match = pathname.match(/^\/api\/purchase-orders\/([^/]+)\/receive$/);
      if (match) {
        params = { id: match[1] };
        handlerModule = poReceive;
      }
    } else if (pathname === "/api/purchase-orders") {
      handlerModule = purchaseOrders;
    } else if (pathname === "/api/mcp/status") {
      handlerModule = mcpStatus;
    }

    if (!handlerModule) {
      res.statusCode = 404;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: `Route not found: ${method} ${pathname}` }));
      return;
    }

    const handlerFn = handlerModule[method];
    if (typeof handlerFn !== "function") {
      res.statusCode = 405;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: `Method ${method} not allowed on ${pathname}` }));
      return;
    }

    // Call route handler
    const response: Response = await handlerFn(webReq, { params: Promise.resolve(params) });

    // Send HTTP Response
    res.statusCode = response.status;

    // Handle Set-Cookie headers properly
    const setCookie = (response.headers as any).getSetCookie?.() || response.headers.get("set-cookie");
    if (setCookie) {
      res.setHeader("Set-Cookie", setCookie);
    }

    response.headers.forEach((val, key) => {
      if (key.toLowerCase() !== "set-cookie") {
        res.setHeader(key, val);
      }
    });

    const body = await response.text();
    res.end(body);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("API Router Error:", error);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: message }));
    }
  }
}
