'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSession } from 'next-auth/react';
import { useMutation, useQuery } from 'convex/react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Id } from '@/convex/_generated/dataModel';
import { Animal, AnimalGender, AnimalStatus } from '@/types';
import { SpeciesCombobox } from '@/components/species/species-combobox';

const animalSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  speciesId: z.string().min(1, { message: 'Please select a species' }),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['male', 'female', 'unknown']).optional(),
  identificationNumber: z.string().optional(),
  status: z.enum(['active', 'released', 'deceased']),
});

type AnimalFormValues = z.infer<typeof animalSchema>;

interface AnimalFormProps {
  animal?: Animal;
  onSuccess?: () => void;
}

export function AnimalForm({ animal, onSuccess }: AnimalFormProps) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const createAnimal = useMutation(api.animals.createAnimal);
  const updateAnimal = useMutation(api.animals.updateAnimal);

  const species = useQuery(
    api.species.getByOrganization,
    session?.user?.organizationId
      ? {
          organizationId: session.user.organizationId as Id<"organizations">,
          limit: 50,
        }
      : "skip"
  );

  const form = useForm<AnimalFormValues>({
    resolver: zodResolver(animalSchema),
    defaultValues: {
      name: animal?.name ?? '',
      speciesId: animal?.speciesId ?? '',
      dateOfBirth: animal?.dateOfBirth 
        ? new Date(animal.dateOfBirth).toISOString().split('T')[0]
        : '',
      gender: animal?.gender,
      identificationNumber: animal?.identificationNumber ?? '',
      status: animal?.status ?? 'active',
    },
  });

  async function onSubmit(data: AnimalFormValues) {
    if (!session?.user?.organizationId) return;

    setIsLoading(true);

    try {
      const dateOfBirth = data.dateOfBirth ? new Date(data.dateOfBirth).getTime() : undefined;

      if (animal) {
        await updateAnimal({
          id: animal.id,
          name: data.name,
          speciesId: data.speciesId as Id<"species">,
          dateOfBirth,
          gender: data.gender,
          identificationNumber: data.identificationNumber,
          status: data.status,
          userId: session.user.id as Id<"staff">,
        });
        toast.success('Animal updated successfully');
      } else {
        await createAnimal({
          name: data.name,
          speciesId: data.speciesId as Id<"species">,
          organizationId: session.user.organizationId as Id<"organizations">,
          dateOfBirth,
          gender: data.gender,
          identificationNumber: data.identificationNumber,
          status: data.status,
          userId: session.user.id as Id<"staff">,
        });
        toast.success('Animal registered successfully');
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 bg-white dark:bg-[#1e1e1e] p-4 rounded-lg shadow-md">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="bg-transparent p-0">
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter animal name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="speciesId"
          render={({ field }) => (
            <FormItem className="bg-transparent p-0">
              <FormLabel>Species</FormLabel>
              <FormControl>
                <SpeciesCombobox 
                  value={field.value}
                  onChange={field.onChange}
                  species={species?.page || []}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dateOfBirth"
          render={({ field }) => (
            <FormItem className="bg-transparent p-0">
              <FormLabel>Date of Birth</FormLabel>
              <FormControl>
                <Input 
                  type="date" 
                  value={field.value || ''} 
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem className="bg-transparent p-0">
              <FormLabel>Gender</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender (optional)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="identificationNumber"
          render={({ field }) => (
            <FormItem className="bg-transparent p-0">
              <FormLabel>Identification Number</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter identification number (optional)" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem className="bg-transparent p-0">
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="released">Released</SelectItem>
                  <SelectItem value="deceased">Deceased</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {animal ? 'Updating...' : 'Registering...'}
            </>
          ) : (
            animal ? 'Update Animal' : 'Register Animal'
          )}
        </Button>
      </form>
    </Form>
  );
} 