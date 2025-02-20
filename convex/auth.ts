import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { generateInviteCode } from "./lib/utils";

// Helper function to convert ArrayBuffer to hex string
function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Helper function to generate secure token
async function generateSecureToken(): Promise<string> {
  const buffer = new Uint8Array(32);
  crypto.getRandomValues(buffer);
  return bufferToHex(buffer);
}

// Helper function to hash passwords using Web Crypto API
async function hashPassword(password: string, salt?: string): Promise<{ hash: string; salt: string }> {
  const encoder = new TextEncoder();
  const generatedSalt = salt || bufferToHex(crypto.getRandomValues(new Uint8Array(16)));
  
  const passwordData = encoder.encode(password + generatedSalt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', passwordData);
  const hash = bufferToHex(hashBuffer);
  
  return { hash, salt: generatedSalt };
}

// Create organization and admin account
export const createOrganization = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    password: v.string(),
    organizationName: v.string(),
    organizationAddress: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if organization exists
    const existingOrg = await ctx.db
      .query("organizations")
      .withIndex("by_name", (q) => q.eq("name", args.organizationName))
      .first();

    if (existingOrg) {
      throw new ConvexError("Organization already exists");
    }

    // Check if admin exists
    const existingAdmin = await ctx.db
      .query("staff")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingAdmin) {
      throw new ConvexError("Email already registered");
    }

    // Generate unique invite code
    let inviteCode: string = generateInviteCode();
    let isUnique = false;
    
    while (!isUnique) {
      const existing = await ctx.db
        .query("organizations")
        .withIndex("by_invite_code", (q) => q.eq("inviteCode", inviteCode))
        .first();
      
      if (!existing) {
        isUnique = true;
      } else {
        inviteCode = generateInviteCode();
      }
    }

    // Hash password
    const { hash, salt } = await hashPassword(args.password);

    // Create organization
    const organizationId = await ctx.db.insert("organizations", {
      name: args.organizationName,
      address: args.organizationAddress,
      contactEmail: args.email,
      inviteCode,
      createdAt: new Date().toISOString(),
    });

    // Create admin
    const adminId = await ctx.db.insert("staff", {
      name: args.name,
      email: args.email,
      hashedPassword: `${salt}:${hash}`,
      role: "admin",
      organizationId,
      createdAt: new Date().toISOString(),
    });

    return { organizationId, adminId };
  },
});

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

    if (!user) {
      throw new ConvexError("Invalid email or password");
    }

    // Verify password
    const [salt, storedHash] = user.hashedPassword.split(':');
    const { hash } = await hashPassword(args.password, salt);
    
    if (hash !== storedHash) {
      throw new ConvexError("Invalid email or password");
    }

    // Create session
    const token = await generateSecureToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

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
    if (!user) {
      return null;
    }

    return {
      tokenIdentifier: session.token,
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
    const organization = await ctx.db
      .query("organizations")
      .withIndex("by_invite_code", (q) => q.eq("inviteCode", args.inviteCode))
      .first();

    if (!organization) {
      throw new ConvexError("Invalid invite code");
    }

    return {
      organizationId: organization._id,
      organizationName: organization.name
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
    // Check if organization exists
    const organization = await ctx.db
      .query("organizations")
      .withIndex("by_invite_code", (q) => q.eq("inviteCode", args.inviteCode))
      .first();

    if (!organization) {
      throw new ConvexError("Invalid invite code");
    }

    // Check if user exists
    const existingUser = await ctx.db
      .query("staff")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingUser) {
      throw new ConvexError("Email already registered");
    }

    // Hash password
    const { hash, salt } = await hashPassword(args.password);

    // Create user
    const userId = await ctx.db.insert("staff", {
      name: args.name,
      email: args.email,
      hashedPassword: `${salt}:${hash}`,
      role: "user",
      organizationId: organization._id,
      createdAt: new Date().toISOString(),
    });

    return userId;
  },
});

export const getOrganizationInfo = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    const organization = await ctx.db.get(args.organizationId);
    
    if (!organization) {
      throw new ConvexError("Organization not found");
    }

    return {
      name: organization.name,
      inviteCode: organization.inviteCode
    };
  },
}); 