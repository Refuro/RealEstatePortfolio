import { NextResponse } from "next/server";
import { getAppUser } from "@/lib/auth";

const TEMPLATE_HEADERS = [
  "address",
  "nickname",
  "property type",
  "units",
  "purchase price",
  "purchase date",
  "value",
  "rent",
  "expenses",
  "vacancy %",
  "cash invested",
  "ownership %",
  "mortgage balance",
  "mortgage rate",
  "mortgage term",
  "monthly payment",
  "lender",
];

const SAMPLE_ROW = [
  "123 Main St, Dallas, TX, 75201",
  "My rental",
  "Single family",
  "1",
  "250000",
  "2023-01-15",
  "275000",
  "2200",
  "450",
  "5",
  "50000",
  "100",
  "200000",
  "6.5",
  "30",
  "1265",
  "ABC Mortgage",
];

export async function GET() {
  const user = await getAppUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const csv =
    TEMPLATE_HEADERS.join(",") + "\n" + SAMPLE_ROW.join(",") + "\n";

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="portfolio-import-template.csv"',
    },
  });
}
