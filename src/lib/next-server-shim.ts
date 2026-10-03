/**
 * Lightweight, zero-dependency drop-in replacement for NextRequest & NextResponse
 * Allows SICMS API routes to run in standard Node / Vite / Vercel Serverless environments
 * without requiring the Next.js runtime.
 */

export type NextRequest = Request;

export interface CookieOptions {
  name: string;
  value: string;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "lax" | "strict" | "none";
  path?: string;
  maxAge?: number;
  expires?: Date;
}

export class NextResponse extends Response {
  private _cookieHeaders: string[] = [];

  static json(data: unknown, init?: ResponseInit): NextResponse {
    const jsonStr = JSON.stringify(data);
    const headers = new Headers(init?.headers);
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    return new NextResponse(jsonStr, {
      ...init,
      headers,
    });
  }

  get cookies() {
    return {
      set: (opts: CookieOptions | string, value?: string) => {
        let cookieStr = "";
        if (typeof opts === "string") {
          cookieStr = `${opts}=${value || ""}; Path=/`;
        } else {
          cookieStr = `${opts.name}=${opts.value}; Path=${opts.path || "/"}`;
          if (opts.maxAge !== undefined) cookieStr += `; Max-Age=${opts.maxAge}`;
          if (opts.expires) cookieStr += `; Expires=${opts.expires.toUTCString()}`;
          if (opts.httpOnly) cookieStr += "; HttpOnly";
          if (opts.secure) cookieStr += "; Secure";
          if (opts.sameSite) cookieStr += `; SameSite=${opts.sameSite}`;
        }
        this.headers.append("Set-Cookie", cookieStr);
      },
      get: (name: string) => {
        const cookieHeader = this.headers.get("Cookie") || "";
        const match = cookieHeader.match(new RegExp(`(^|;\\s*)(${name})=([^;]*)`));
        return match ? { name, value: match[3] } : undefined;
      },
      delete: (name: string) => {
        this.headers.append("Set-Cookie", `${name}=; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`);
      },
    };
  }
}
