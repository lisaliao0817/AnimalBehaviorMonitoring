import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await req.json();
    const { staffIds } = body;

    if (!staffIds || !Array.isArray(staffIds) || staffIds.length === 0) {
      return NextResponse.json({ error: "Invalid staff IDs" }, { status: 400 });
    }

    // Fetch staff from Convex
    const staff = await convex.query(api.staff.getByIds, {
      ids: staffIds as Id<"staff">[],
    });

    // Transform to the format needed for the PDF generator
    const staffData = staff.filter(Boolean).map(staffMember => ({
      id: staffMember._id,
      name: staffMember.name,
    }));

    return NextResponse.json(staffData);
  } catch (error) {
    console.error("Error fetching staff:", error);
    return NextResponse.json(
      { error: "Failed to fetch staff data" },
      { status: 500 }
    );
  }
} 