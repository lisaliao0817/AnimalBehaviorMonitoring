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
import { Species } from '@/types';

const speciesSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  description: z.string().optional(),
});

type SpeciesFormValues = z.infer<typeof speciesSchema>;

interface SpeciesFormProps {
  species?: Species;
  onSuccess?: () => void;
}

export function SpeciesForm({ species, onSuccess }: SpeciesFormProps) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const createSpecies = useMutation(api.species.createSpecies);
  const updateSpecies = useMutation(api.species.updateSpecies);

  const form = useForm<SpeciesFormValues>({
    resolver: zodResolver(speciesSchema),
    defaultValues: {
      name: species?.name ?? '',
      description: species?.description ?? '',
    },
  });

  async function onSubmit(data: SpeciesFormValues) {
    if (!session?.user?.organizationId) return;

    setIsLoading(true);

    try {
      if (species) {
        await updateSpecies({
          id: species.id,
          name: data.name,
          description: data.description,
          userId: session.user.id as Id<"staff">,
        });
        toast.success('Species updated successfully');
      } else {
        await createSpecies({
          name: data.name,
          description: data.description,
          organizationId: session.user.organizationId as Id<"organizations">,
          userId: session.user.id as Id<"staff">,
        });
        toast.success('Species created successfully');
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter species name" {...field} />
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
                  placeholder="Enter species description (optional)"
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
              {species ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            species ? 'Update Species' : 'Create Species'
          )}
        </Button>
      </form>
    </Form>
  );
} 