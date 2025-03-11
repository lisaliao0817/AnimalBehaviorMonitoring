'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSession } from 'next-auth/react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Id } from '@/convex/_generated/dataModel';

const commonBehaviorSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  description: z.string().min(2, { message: 'Description must be at least 2 characters' }),
});

type CommonBehaviorFormValues = z.infer<typeof commonBehaviorSchema>;

interface CommonBehaviorFormProps {
  speciesId: Id<"species">;
  onSuccess?: () => void;
}

export function CommonBehaviorForm({ speciesId, onSuccess }: CommonBehaviorFormProps) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const createCommonBehavior = useMutation(api.commonBehaviors.create);

  const form = useForm<CommonBehaviorFormValues>({
    resolver: zodResolver(commonBehaviorSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  async function onSubmit(data: CommonBehaviorFormValues) {
    if (!session?.user?.organizationId) return;

    setIsLoading(true);

    try {
      await createCommonBehavior({
        name: data.name,
        description: data.description,
        speciesId,
        organizationId: session.user.organizationId as Id<"organizations">,
        staffId: session.user.id as Id<"staff">,
      });
      
      toast.success('Rehabilitation goal added successfully');
      form.reset();
      onSuccess?.();
    } catch (error) {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Something went wrong',
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter rehabilitation goal" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter description"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding...
            </>
          ) : (
            'Add Rehabilitation Goal'
          )}
        </Button>
      </form>
    </Form>
  );
} 