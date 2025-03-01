'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Filter, X } from 'lucide-react';
import { Id } from '@/convex/_generated/dataModel';
import { AnimalDialog } from '@/components/animals/animal-dialog';
import { Badge } from '@/components/ui/badge';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AnimalsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const speciesFilter = searchParams.get('species');
  
  const { data: session } = useSession();
  const [showAnimalDialog, setShowAnimalDialog] = useState(false);
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<string | null>(speciesFilter);

  // Update the selected species when the URL parameter changes
  useEffect(() => {
    setSelectedSpeciesId(speciesFilter);
  }, [speciesFilter]);

  const speciesResult = useQuery(
    api.species.getByOrganization,
    session?.user?.organizationId
      ? {
          organizationId: session.user.organizationId as Id<"organizations">,
          limit: 50,
        }
      : "skip"
  );

  // Query animals by species if a species filter is applied, otherwise get all animals
  const animalsResult = useQuery(
    selectedSpeciesId 
      ? api.animals.getBySpecies
      : api.animals.getByOrganization,
    selectedSpeciesId && session?.user?.organizationId
      ? {
          speciesId: selectedSpeciesId as Id<"species">,
          limit: 50,
        }
      : session?.user?.organizationId
      ? {
          organizationId: session.user.organizationId as Id<"organizations">,
          limit: 50,
        }
      : "skip"
  );

  if (!session?.user?.organizationId) {
    return null;
  }

  const animals = animalsResult?.page ?? [];
  const species = speciesResult?.page ?? [];

  const getSpeciesName = (speciesId: Id<"species">) => {
    const species = speciesResult?.page?.find((s) => s._id === speciesId);
    return species?.name ?? 'Unknown Species';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'released':
        return 'bg-blue-500';
      case 'deceased':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Handle species filter change
  const handleSpeciesFilterChange = (value: string) => {
    if (value === "all") {
      // Remove the species filter
      router.push('/dashboard/animals');
      setSelectedSpeciesId(null);
    } else {
      // Apply the species filter
      router.push(`/dashboard/animals?species=${value}`);
      setSelectedSpeciesId(value);
    }
  };

  // Clear the species filter
  const clearSpeciesFilter = () => {
    router.push('/dashboard/animals');
    setSelectedSpeciesId(null);
  };

  return (
    <div className="h-full space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Animals</h1>
        <Button onClick={() => setShowAnimalDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Register Animal
        </Button>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filter by Species:</span>
        </div>
        <Select
          value={selectedSpeciesId || "all"}
          onValueChange={handleSpeciesFilterChange}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Species" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Species</SelectItem>
            {species.map((species) => (
              <SelectItem key={species._id} value={species._id}>
                {species.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {selectedSpeciesId && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearSpeciesFilter}
            className="text-muted-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Clear Filter
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {animals.map((animal) => {
          const speciesName = getSpeciesName(animal.speciesId);
          
          return (
            <Card 
              key={animal._id} 
              className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push(`/dashboard/animals/${animal._id}`)}
            >
              <CardHeader className="space-y-1">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{animal.name}</CardTitle>
                  <Badge 
                    variant="secondary"
                    className={getStatusColor(animal.status)}
                  >
                    {animal.status.charAt(0).toUpperCase() + animal.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm">
                  <span className="font-medium">Species:</span> {speciesName}
                </div>
                {animal.identificationNumber && (
                  <div className="text-sm">
                    <span className="font-medium">ID:</span> {animal.identificationNumber}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {animals.length === 0 && (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-16rem)] space-y-4">
          <p className="text-lg text-muted-foreground">
            {selectedSpeciesId 
              ? `No animals found for the selected species` 
              : `No animals registered yet`}
          </p>
          <Button onClick={() => setShowAnimalDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Register Your First Animal
          </Button>
        </div>
      )}

      <AnimalDialog
        open={showAnimalDialog}
        onOpenChange={setShowAnimalDialog}
      />
    </div>
  );
} 