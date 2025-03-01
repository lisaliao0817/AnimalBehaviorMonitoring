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
import { Behavior } from '@/types';

const behaviorSchema = z.object({
  behavior: z.string().min(2, { message: 'Behavior must be at least 2 characters' }),
  description: z.string().optional(),
  location: z.string().optional(),
});

type BehaviorFormValues = z.infer<typeof behaviorSchema>;

interface BehaviorFormProps {
  animalId: Id<"animals">;
  behavior?: Behavior;
  onSuccess?: () => void;
}

export function BehaviorForm({ animalId, behavior, onSuccess }: BehaviorFormProps) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const createBehavior = useMutation(api.behaviors.createBehavior);
  const updateBehavior = useMutation(api.behaviors.updateBehavior);

  const form = useForm<BehaviorFormValues>({
    resolver: zodResolver(behaviorSchema),
    defaultValues: {
      behavior: behavior?.behavior ?? '',
      description: behavior?.description ?? '',
      location: behavior?.location ?? '',
    },
  });

  async function onSubmit(data: BehaviorFormValues) {
    if (!session?.user?.organizationId || !session?.user?.id) return;

    setIsLoading(true);

    try {
      if (behavior) {
        await updateBehavior({
          id: behavior.id,
          behavior: data.behavior,
          description: data.description,
          location: data.location,
          staffId: session.user.id as Id<"staff">,
        });
        toast.success('Behavior updated successfully');
      } else {
        await createBehavior({
          animalId,
          behavior: data.behavior,
          description: data.description,
          location: data.location,
          organizationId: session.user.organizationId as Id<"organizations">,
          staffId: session.user.id as Id<"staff">,
        });
        toast.success('Behavior recorded successfully');
      }
      
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
          name="behavior"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Behavior</FormLabel>
              <FormControl>
                <Input placeholder="Enter behavior" {...field} />
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
                  placeholder="Enter description (optional)" 
                  {...field} 
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter location (optional)" 
                  {...field} 
                  value={field.value || ''}
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
              {behavior ? 'Updating...' : 'Recording...'}
            </>
          ) : (
            behavior ? 'Update Behavior' : 'Record Behavior'
          )}
        </Button>
      </form>
    </Form>
  );
} 