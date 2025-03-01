'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { Id } from '@/convex/_generated/dataModel';

const behaviorSchema = z.object({
  animalId: z.string().min(1, { message: 'Please select an animal' }),
  behavior: z.string().min(2, { message: 'Behavior must be at least 2 characters' }),
  description: z.string().optional(),
  location: z.string().optional(),
});

type BehaviorFormValues = z.infer<typeof behaviorSchema>;

export default function RecordBehaviorPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  
  const createBehavior = useMutation(api.behaviors.createBehavior);
  
  const animals = useQuery(
    api.animals.getByOrganization,
    session?.user?.organizationId
      ? {
          organizationId: session.user.organizationId as Id<"organizations">,
          limit: 100,
        }
      : "skip"
  );
  
  const form = useForm<BehaviorFormValues>({
    resolver: zodResolver(behaviorSchema),
    defaultValues: {
      animalId: '',
      behavior: '',
      description: '',
      location: '',
    },
  });
  
  async function onSubmit(data: BehaviorFormValues) {
    if (!session?.user?.organizationId || !session?.user?.id) return;

    setIsLoading(true);

    try {
      await createBehavior({
        animalId: data.animalId as Id<"animals">,
        behavior: data.behavior,
        description: data.description,
        location: data.location,
        organizationId: session.user.organizationId as Id<"organizations">,
        staffId: session.user.id as Id<"staff">,
      });
      
      toast.success('Behavior recorded successfully');
      form.reset();
      router.push(`/dashboard/animals/${data.animalId}`);
    } catch (error) {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Something went wrong',
      });
    } finally {
      setIsLoading(false);
    }
  }
  
  return (
    <div className="h-full space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Record Behavior</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Behavior Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="animalId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Animal</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        {...field}
                      >
                        <option value="">Select an animal</option>
                        {animals?.page?.map((animal) => (
                          <option key={animal._id} value={animal._id}>
                            {animal.name}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
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
                    Recording...
                  </>
                ) : (
                  'Record Behavior'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
} 