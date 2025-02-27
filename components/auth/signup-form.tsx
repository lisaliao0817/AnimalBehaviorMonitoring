'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/convex/_generated/api';
import { useAction } from 'convex/react';
import { signIn } from 'next-auth/react';

// Define common fields
const commonFields = {
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  confirmPassword: z.string(),
};

// Create base schemas without refinement
const adminSchema = z.object({
  ...commonFields,
  role: z.literal('admin'),
  organizationName: z.string().min(2, { message: 'Organization name must be at least 2 characters' }),
  organizationAddress: z.string().min(5, { message: 'Please enter a valid address' }),
});

const userSchema = z.object({
  ...commonFields,
  role: z.literal('user'),
  inviteCode: z.string().min(4, { message: 'Please enter a valid invite code' }),
});

// Create the schema as a discriminated union and then apply refinement
const signupSchema = z.discriminatedUnion('role', [
  adminSchema,
  userSchema
]).refine(
  data => data.password === data.confirmPassword,
  {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  }
);

type SignupFormValues = z.infer<typeof signupSchema>;

// Define default values with proper typing
type DefaultValues = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'admin' | 'user';
  inviteCode: string;
  organizationName: string;
  organizationAddress: string;
};

export default function SignupForm() {
  const [isLoading, setIsLoading] = useState(false);
  
  // Use type assertion to fix the API reference errors
  const createAdmin = useAction(api.staff.createAdmin as any);
  const createUser = useAction(api.staff.createUser as any);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'user',
      inviteCode: '',
      organizationName: '',
      organizationAddress: '',
    } as DefaultValues,
  });

  const role = form.watch('role');

  async function onSubmit(data: SignupFormValues) {
    setIsLoading(true);

    try {
      if (data.role === 'admin') {
        await createAdmin({
          name: data.name,
          email: data.email,
          password: data.password,
          organizationName: data.organizationName,
          organizationAddress: data.organizationAddress,
        });
      } else {
        await createUser({
          name: data.name,
          email: data.email,
          password: data.password,
          inviteCode: data.inviteCode,
        });
      }

      toast.success('Account created', {
        description: 'Your account has been created successfully. You can now sign in.',
      });

      // Sign in the user
      await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });
    } catch (error) {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Something went wrong. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel>Account Type</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="admin" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Admin (Create a new organization)
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="user" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      User (Join an existing organization)
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter your name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Enter your email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Create a password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Confirm your password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {role === 'admin' && (
          <>
            <FormField
              control={form.control}
              name="organizationName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter organization name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="organizationAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter organization address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {role === 'user' && (
          <FormField
            control={form.control}
            name="inviteCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Invite Code</FormLabel>
                <FormControl>
                  <Input placeholder="Enter invite code" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            'Create account'
          )}
        </Button>
      </form>
    </Form>
  );
} 