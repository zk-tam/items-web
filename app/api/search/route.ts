import { NextRequest, NextResponse } from "next/server";
import { listArtists, listProducts } from "@/lib/db/items-repository";
import { searchCatalog } from "@/lib/search/catalog-search";
import { hasMaintenanceAccess } from "@/lib/auth/maintenance";
import { isSiteMaintenanceModeEnabled } from "@/lib/site-settings/repository";

export const runtime = "nodejs";

const MAX_QUERY_LENGTH = 100;

export async function GET(request: NextRequest) {
  if (await isSiteMaintenanceModeEnabled() && !(await hasMaintenanceAccess())) {
    return NextResponse.json({ results: [] }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }

  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (query.length > MAX_QUERY_LENGTH) {
    return NextResponse.json({ error: "Search query is too long." }, { status: 400 });
  }

  if (!query) {
    return NextResponse.json({ results: [] }, { headers: { "Cache-Control": "no-store" } });
  }

  try {
    const [artists, items] = await Promise.all([listArtists(), listProducts()]);
    return NextResponse.json(
      { results: searchCatalog(query, artists, items) },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Catalog search could not be completed.", error);
    return NextResponse.json({ error: "Search is temporarily unavailable." }, { status: 503 });
  }
}
