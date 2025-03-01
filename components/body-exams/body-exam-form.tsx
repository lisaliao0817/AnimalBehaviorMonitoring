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
import { BodyExam } from '@/types';

const bodyExamSchema = z.object({
  weight: z.string().optional(),
  diagnosis: z.string().optional(),
  notes: z.string().optional(),
});

type BodyExamFormValues = z.infer<typeof bodyExamSchema>;

interface BodyExamFormProps {
  animalId: Id<"animals">;
  bodyExam?: BodyExam;
  onSuccess?: () => void;
}

export function BodyExamForm({ animalId, bodyExam, onSuccess }: BodyExamFormProps) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const createBodyExam = useMutation(api.bodyExams.createBodyExam);
  const updateBodyExam = useMutation(api.bodyExams.updateBodyExam);

  const form = useForm<BodyExamFormValues>({
    resolver: zodResolver(bodyExamSchema),
    defaultValues: {
      weight: bodyExam?.weight !== undefined ? bodyExam.weight.toString() : '',
      diagnosis: bodyExam?.diagnosis ?? '',
      notes: bodyExam?.notes ?? '',
    },
  });

  async function onSubmit(data: BodyExamFormValues) {
    if (!session?.user?.organizationId || !session?.user?.id) return;

    setIsLoading(true);

    try {
      // Convert weight string to number if provided
      const weight = data.weight ? parseFloat(data.weight) : undefined;
      
      if (bodyExam) {
        await updateBodyExam({
          id: bodyExam.id,
          weight,
          diagnosis: data.diagnosis,
          notes: data.notes,
          staffId: session.user.id as Id<"staff">,
        });
        toast.success('Body exam updated successfully');
      } else {
        await createBodyExam({
          animalId,
          weight,
          diagnosis: data.diagnosis,
          notes: data.notes,
          organizationId: session.user.organizationId as Id<"organizations">,
          staffId: session.user.id as Id<"staff">,
        });
        toast.success('Body exam recorded successfully');
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
              {bodyExam ? 'Updating...' : 'Recording...'}
            </>
          ) : (
            bodyExam ? 'Update Body Exam' : 'Record Body Exam'
          )}
        </Button>
      </form>
    </Form>
  );
} 