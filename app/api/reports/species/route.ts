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
    const { speciesIds } = body;

    if (!speciesIds || !Array.isArray(speciesIds) || speciesIds.length === 0) {
      return NextResponse.json({ error: "Invalid species IDs" }, { status: 400 });
    }

    // Fetch species from Convex
    const species = await convex.query(api.species.getByIds, {
      ids: speciesIds as Id<"species">[],
    });

    // Transform to the format needed for the PDF generator
    const speciesData = species
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .map(speciesItem => ({
        id: speciesItem._id,
        name: speciesItem.name,
        description: speciesItem.description,
      }));

    return NextResponse.json(speciesData);
  } catch (error) {
    console.error("Error fetching species:", error);
    return NextResponse.json(
      { error: "Failed to fetch species data" },
      { status: 500 }
    );
  }
} 