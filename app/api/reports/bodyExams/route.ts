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
    const { animalIds, startDate, endDate } = body;

    if (!animalIds || !Array.isArray(animalIds) || animalIds.length === 0) {
      return NextResponse.json({ error: "Invalid animal IDs" }, { status: 400 });
    }

    if (!startDate || !endDate) {
      return NextResponse.json({ error: "Invalid date range" }, { status: 400 });
    }

    // Fetch body exams for each animal from Convex
    const examsResult = await convex.query(api.bodyExams.getByAnimalsDateRange, {
      animalIds: animalIds as Id<"animals">[],
      startDate,
      endDate,
      limit: 1000, // High limit to get all exams
    });

    return NextResponse.json(examsResult.page);
  } catch (error) {
    console.error("Error fetching body exams:", error);
    return NextResponse.json(
      { error: "Failed to fetch body exams" },
      { status: 500 }
    );
  }
} 