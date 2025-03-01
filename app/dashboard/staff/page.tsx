'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useAction, useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Send } from 'lucide-react';
import { Id } from '@/convex/_generated/dataModel';

export default function StaffPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Get the current user's organization ID
  const user = session?.user;
  const organizationId = user?.organizationId as Id<"organizations"> | undefined;
  const userId = user?.id as Id<"staff"> | undefined;

  // Get organization details
  const organization = useQuery(
    api.organizations.getById, 
    organizationId ? { id: organizationId } : "skip"
  );

  // Check if user is admin
  const isAdmin = user?.role === 'admin';

  // Redirect if not admin
  if (status !== 'loading' && !isAdmin) {
    router.push('/dashboard');
    return null;
  }

  // Use the generateInviteCode mutation
  const generateInviteCode = useMutation(api.staff.generateInviteCode);
  
  // Use the sendInviteEmail action
  const sendInviteEmail = useAction(api.email.sendInviteEmail);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter an email address');
      return;
    }

    if (!organizationId || !userId) {
      toast.error('User or organization information is missing');
      return;
    }

    setIsLoading(true);

    try {
      // Generate invite code
      const result = await generateInviteCode({
        email,
        organizationId,
        userId,
      });

      if (result && result.inviteCode) {
        // Send invite email
        await sendInviteEmail({
          email,
          inviteCode: result.inviteCode,
          organizationName: organization?.name || 'our organization',
        });

        toast.success('Invitation sent', {
          description: `An invitation has been sent to ${email}`,
        });

        // Clear the form
        setEmail('');
      }
    } catch (error) {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Failed to send invitation',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Staff Management</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Invite New Staff</CardTitle>
            <CardDescription>
              Send an invitation email to add new staff members to your organization
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleInvite}>
            <CardContent>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    placeholder="Enter email address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Invitation
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        {/* Future enhancement: Add a list of current staff members here */}
        <Card>
          <CardHeader>
            <CardTitle>Staff Members</CardTitle>
            <CardDescription>
              View and manage your organization's staff members
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Staff management features coming soon...
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 