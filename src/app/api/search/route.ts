import { NextResponse, type NextRequest } from "next/server";
import { searchProducts } from "@/lib/products";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.slice(0, 80) ?? "";

  try {
    const results = await searchProducts(query, 6);
    return NextResponse.json(
      { results },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { results: [], error: "Search is temporarily unavailable." },
      { status: 500 },
    );
  }
}
