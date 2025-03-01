'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

interface SpeciesComboboxProps {
  value: string;
  onChange: (value: string) => void;
  species: Array<{ _id: Id<"species">; name: string }>;
}

const newSpeciesSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
});

type NewSpeciesFormValues = z.infer<typeof newSpeciesSchema>;

export function SpeciesCombobox({ value, onChange, species }: SpeciesComboboxProps) {
  const { data: session } = useSession();
  const [showNewSpeciesDialog, setShowNewSpeciesDialog] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  const createSpecies = useMutation(api.species.createSpecies);
  
  const form = useForm<NewSpeciesFormValues>({
    resolver: zodResolver(newSpeciesSchema),
    defaultValues: {
      name: '',
    },
  });

  async function onSubmit(data: NewSpeciesFormValues) {
    if (!session?.user?.organizationId) return;

    setIsCreating(true);

    try {
      const result = await createSpecies({
        name: data.name,
        organizationId: session.user.organizationId as Id<"organizations">,
        userId: session.user.id as Id<"staff">,
      });
      
      toast.success('Species created successfully');
      form.reset();
      setShowNewSpeciesDialog(false);
      
      // Set the newly created species as the selected value
      if (result?.speciesId) {
        onChange(result.speciesId);
      }
    } catch (error) {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Something went wrong',
      });
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <>
      <div className="space-y-2">
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select a species" />
          </SelectTrigger>
          <SelectContent>
            {species.map((species) => (
              <SelectItem key={species._id} value={species._id}>
                {species.name}
              </SelectItem>
            ))}
            <Button
              variant="ghost"
              className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
              onClick={(e) => {
                e.preventDefault();
                setShowNewSpeciesDialog(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add New Species
            </Button>
          </SelectContent>
        </Select>
      </div>

      <Dialog open={showNewSpeciesDialog} onOpenChange={setShowNewSpeciesDialog}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-[#1e1e1e] shadow-xl">
          <DialogHeader>
            <DialogTitle>Add New Species</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 bg-white dark:bg-[#1e1e1e] p-4 rounded-lg shadow-md">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="bg-transparent p-0">
                    <FormLabel>Species Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter species name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isCreating}>
                {isCreating ? 'Creating...' : 'Create Species'}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
} 