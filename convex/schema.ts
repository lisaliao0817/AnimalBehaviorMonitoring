import { v } from "convex/values";
import { defineSchema, defineTable } from "convex/server";
import { Id } from "./_generated/dataModel";

export default defineSchema({
    organizations: defineTable({
        name: v.string(),
        address: v.string(),
        contactEmail: v.string(),
        inviteCode: v.string(),
        createdAt: v.string(),
    }).index("by_name", ["name"])
      .index("by_invite_code", ["inviteCode"]),

    staff: defineTable({
        name: v.string(),
        email: v.string(),
        hashedPassword: v.string(),
        role: v.union(v.literal("admin"), v.literal("user")),
        organizationId: v.id("organizations"),
        createdAt: v.string(),
    }).index("by_email", ["email"])
      .index("by_organization", ["organizationId"]),

    sessions: defineTable({
        userId: v.id("staff"),
        token: v.string(),
        expiresAt: v.string(),
    }).index("by_token", ["token"]),

    behaviors: defineTable({
        animal: v.string(),
        behavior: v.string(),
        description: v.string(),
        createdAt: v.string(),
        organizationId: v.id("organizations"),
        staffId: v.id("staff"),
    }).index("by_organization", ["organizationId"]),
});

// Define our custom types
export type UserIdentity = {
  tokenIdentifier: string;
  userId: Id<"staff">;
  organizationId: Id<"organizations">;
  role: string;
};

export type ConvexAuth = {
  auth: UserIdentity | null;
};
