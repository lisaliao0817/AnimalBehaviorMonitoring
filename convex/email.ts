"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { Resend } from "resend";

export const sendInviteEmail = action({
  args: { 
    email: v.string(),
    inviteCode: v.string(),
    organizationName: v.string()
  },
  handler: async (ctx, args) => {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      throw new Error("Missing RESEND_API_KEY environment variable");
    }

    const resend = new Resend(resendApiKey);

    try {
      await resend.emails.send({
        from: "noreply@fahari.co",
        to: args.email,
        subject: `Invitation to join ${args.organizationName}`,
        text: `You've been invited to join ${args.organizationName}. Your invite code is: ${args.inviteCode}`,
        html: `
          <h1>Welcome to ${args.organizationName}</h1>
          <p>You've been invited to join our organization.</p>
          <p>Your invite code is: <strong>${args.inviteCode}</strong></p>
          <p>Click <a href="${process.env.SITE_URL}/signup?invite=${args.inviteCode}">here</a> to sign up.</p>
          <p>This invite code will allow you to create an account as a user in our organization.</p>
        `
      });
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send invitation email');
    }
  }
}); 