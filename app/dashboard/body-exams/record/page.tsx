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

const bodyExamSchema = z.object({
  animalId: z.string().min(1, { message: 'Please select an animal' }),
  weight: z.string().optional(),
  diagnosis: z.string().optional(),
  notes: z.string().optional(),
});

type BodyExamFormValues = z.infer<typeof bodyExamSchema>;

export default function RecordBodyExamPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  
  const createBodyExam = useMutation(api.bodyExams.createBodyExam);
  
  const animals = useQuery(
    api.animals.getByOrganization,
    session?.user?.organizationId
      ? {
          organizationId: session.user.organizationId as Id<"organizations">,
          limit: 100,
        }
      : "skip"
  );
  
  const form = useForm<BodyExamFormValues>({
    resolver: zodResolver(bodyExamSchema),
    defaultValues: {
      animalId: '',
      weight: '',
      diagnosis: '',
      notes: '',
    },
  });
  
  async function onSubmit(data: BodyExamFormValues) {
    if (!session?.user?.organizationId || !session?.user?.id) return;

    setIsLoading(true);

    try {
      // Convert weight string to number if provided
      const weight = data.weight ? parseFloat(data.weight) : undefined;
      
      await createBodyExam({
        animalId: data.animalId as Id<"animals">,
        weight,
        diagnosis: data.diagnosis,
        notes: data.notes,
        organizationId: session.user.organizationId as Id<"organizations">,
        staffId: session.user.id as Id<"staff">,
      });
      
      toast.success('Body exam recorded successfully');
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
        <h1 className="text-2xl font-bold tracking-tight">Record Body Exam</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Body Exam Information</CardTitle>
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
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (kg)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        placeholder="Enter weight in kg (optional)" 
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
                name="diagnosis"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Diagnosis</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter diagnosis (optional)" 
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
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter notes (optional)" 
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
                  'Record Body Exam'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
} 