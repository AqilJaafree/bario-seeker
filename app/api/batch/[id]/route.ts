import { NextResponse } from "next/server";

import { loadBatchByAnyId } from "@/lib/chain/queries";

/**
 * Resolve a batch address or a printed batch code to its full journey.
 *
 * `params` is a Promise in this version of Next — awaiting it is required.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const batch = await loadBatchByAnyId(decodeURIComponent(id));

    if (!batch) {
      // Not an error condition: a QR that resolves to nothing is exactly the
      // counterfeit case the product exists to surface.
      return NextResponse.json(
        { found: false, reason: "No certificate exists for this batch." },
        { status: 404 }
      );
    }

    return NextResponse.json({ found: true, batch });
  } catch (error) {
    console.error("batch lookup failed", error);
    return NextResponse.json(
      { found: false, reason: "Could not reach the network. Try again." },
      { status: 502 }
    );
  }
}
