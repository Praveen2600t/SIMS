/**
 * Formats a numeric value into Indian Rupee format (e.g., ₹ 1,24,500.00)
 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formats a Date object or ISO string into readable Indian standard date
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "N/A";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "Invalid Date";
  return new Intl.DateTimeFormat("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return "N/A";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "Invalid Date";
  return new Intl.DateTimeFormat("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(d);
}

/**
 * Calculates days remaining until expiry
 */
export function getDaysUntilExpiry(expiryDate: string | Date | null | undefined): number | null {
  if (!expiryDate) return null;
  const expiry = new Date(expiryDate);
  const now = new Date();
  const diffTime = expiry.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Simple CSV parser for client & server use
 */
export function parseCSV(csvText: string): Record<string, string>[] {
  const lines = csvText.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]);
  const results: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVLine(lines[i]);
    if (row.length === 0) continue;
    const obj: Record<string, string> = {};
    headers.forEach((header, index) => {
      obj[header.trim()] = (row[index] ?? "").trim();
    });
    results.push(obj);
  }

  return results;
}

function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let currentValue = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (insideQuotes && line[i + 1] === '"') {
        currentValue += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === "," && !insideQuotes) {
      values.push(currentValue);
      currentValue = "";
    } else {
      currentValue += char;
    }
  }
  values.push(currentValue);
  return values;
}

export function toCSV(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const lines = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((h) => {
          const val = row[h] === null || row[h] === undefined ? "" : String(row[h]);
          if (val.includes(",") || val.includes('"') || val.includes("\n")) {
            return `"${val.replace(/"/g, '""')}"`;
          }
          return val;
        })
        .join(",")
    ),
  ];
  return lines.join("\n");
}
