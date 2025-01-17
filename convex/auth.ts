import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { query } from "./_generated/server";
import { randomBytes } from "crypto";

// Create organization and admin account
export const createOrganization = mutation({
  args: {
    organizationName: v.string(),
    address: v.string(),
    contactEmail: v.string(),
    adminName: v.string(),
    adminEmail: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if organization already exists
    const existingOrg = await ctx.db
      .query("organizations")
      .withIndex("by_name", (q) => q.eq("name", args.organizationName))
      .first();

    if (existingOrg) {
      throw new ConvexError("Organization already exists");
    }

    // Check if admin email already exists
    const existingAdmin = await ctx.db
      .query("staff")
      .withIndex("by_email", (q) => q.eq("email", args.adminEmail))
      .first();

    if (existingAdmin) {
      throw new ConvexError("Email already registered");
    }

    // Create organization
    const organizationId = await ctx.db.insert("organizations", {
      name: args.organizationName,
      address: args.address,
      contactEmail: args.contactEmail,
      createdAt: new Date().toISOString(),
    });

    // Create admin account
    const adminId = await ctx.db.insert("staff", {
      name: args.adminName,
      email: args.adminEmail,
      password: args.password, // Note: In production, hash this password
      role: "admin",
      organizationId,
      status: "active",
      createdAt: new Date().toISOString(),
    });

    return { organizationId, adminId };
  },
});

function generateToken() {
  return randomBytes(32).toString('hex');
}

// Login mutation
export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("staff")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user || user.password !== args.password) {
      throw new ConvexError("Invalid email or password");
    }

    // Create session
    const token = generateToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    await ctx.db.insert("sessions", {
      userId: user._id,
      token,
      expiresAt: expiresAt.toISOString(),
    });

    return {
      userId: user._id,
      organizationId: user.organizationId,
      role: user.role,
      token,
    };
  },
});

export const validateSession = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!session || new Date(session.expiresAt) < new Date()) {
      return null;
    }

    const user = await ctx.db.get(session.userId);
    return {
      userId: user._id,
      organizationId: user.organizationId,
      role: user.role,
    };
  },
});

export const logout = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (session) {
      await ctx.db.delete(session._id);
    }
  },
});

export const validateInvite = query({
  args: { inviteCode: v.string() },
  handler: async (ctx, args) => {
    const invite = await ctx.db
      .query("organizationInvites")
      .withIndex("by_invite_code", (q) => q.eq("inviteCode", args.inviteCode))
      .first();

    if (!invite || invite.status !== "pending" || new Date(invite.expiresAt) < new Date()) {
      throw new ConvexError("Invalid or expired invite code");
    }

    return {
      email: invite.email,
      role: invite.role,
      organizationId: invite.organizationId
    };
  },
});

export const createStaffMember = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    password: v.string(),
    inviteCode: v.string(),
  },
  handler: async (ctx, args) => {
    const invite = await ctx.db
      .query("organizationInvites")
      .withIndex("by_invite_code", (q) => q.eq("inviteCode", args.inviteCode))
      .first();

    if (!invite || invite.status !== "pending" || new Date(invite.expiresAt) < new Date()) {
      throw new ConvexError("Invalid or expired invite code");
    }

    if (invite.email !== args.email) {
      throw new ConvexError("Email doesn't match invite");
    }

    const staffId = await ctx.db.insert("staff", {
      name: args.name,
      email: args.email,
      password: args.password,
      role: invite.role,
      organizationId: invite.organizationId,
      status: "active",
      createdAt: new Date().toISOString(),
    });

    await ctx.db.patch(invite._id, { status: "accepted" });

    return staffId;
  },
}); 