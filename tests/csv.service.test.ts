import { describe, it, expect } from "vitest";
import { parseCSV, toCSV } from "../src/lib/utils";
import { CSVService } from "../src/services/csv.service";

describe("CSV Import & Export Engine with Duplicate Detection", () => {
  it("should accurately parse standard CSV text with quoted values and commas", () => {
    const csvSample = `product_code,product_name,district,purchase_price\n"TN-01","Country Tomato, Fresh",Chennai,28.5\nTN-02,Salem Onion,Salem,32`;
    const rows = parseCSV(csvSample);

    expect(rows.length).toBe(2);
    expect(rows[0]["product_code"]).toBe("TN-01");
    expect(rows[0]["product_name"]).toBe("Country Tomato, Fresh");
    expect(rows[0]["purchase_price"]).toBe("28.5");
    expect(rows[1]["district"]).toBe("Salem");
  });

  it("should correctly serialize records back to RFC compliant CSV", () => {
    const data = [
      { product_code: "TN-99", product_name: "Nilgiris Tea, Pure", price: 150 },
    ];
    const csvOutput = toCSV(data);
    expect(csvOutput).toContain('"Nilgiris Tea, Pure"');
    expect(csvOutput).toContain("TN-99");
  });

  it("should process CSV import with duplicate detection and error handling", async () => {
    const importData = `product_code,product_name,category,unit,district,market_location,purchase_price,selling_price,current_quantity,batch_number
CSV-TEST-001,Test Ooty Carrot,Vegetables,kg,Nilgiris,Ooty Municipal Market,35,50,80,BCH-TEST-001
,Invalid Missing Code,Vegetables,kg,Salem,Leigh Bazaar,20,30,50,BCH-TEST-002`;

    const result = await CSVService.importProductsCSV(importData);

    expect(result.totalProcessed).toBe(2);
    expect(result.created + result.updated).toBeGreaterThanOrEqual(1);
    expect(result.skipped).toBeGreaterThanOrEqual(1); // row 2 missing product_code
    expect(result.errors.length).toBeGreaterThanOrEqual(1);
  });
});
