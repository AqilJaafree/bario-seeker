import { NextResponse } from "next/server";

import { listBatches } from "@/lib/chain/queries";

export async function GET() {
  try {
    return NextResponse.json({ batches: await listBatches() });
  } catch (error) {
    console.error("batch listing failed", error);
    return NextResponse.json({ batches: [], error: true }, { status: 502 });
  }
}
