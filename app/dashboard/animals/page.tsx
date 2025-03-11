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
import { AnimalStatus } from '@/types';

export default function AnimalsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const speciesFilter = searchParams.get('species');
  const statusFilter = searchParams.get('status') as AnimalStatus | null;
  
  const { data: session } = useSession();
  const [showAnimalDialog, setShowAnimalDialog] = useState(false);
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<string | null>(speciesFilter);
  const [selectedStatus, setSelectedStatus] = useState<AnimalStatus | null>(statusFilter);

  // Update the selected filters when URL parameters change
  useEffect(() => {
    setSelectedSpeciesId(speciesFilter);
    setSelectedStatus(statusFilter);
  }, [speciesFilter, statusFilter]);

  const speciesResult = useQuery(
    api.species.getByOrganization,
    session?.user?.organizationId
      ? {
          organizationId: session.user.organizationId as Id<"organizations">,
          limit: 50,
        }
      : "skip"
  );

  // Query animals with both species and status filters
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

  // Filter animals by status on the client side if status filter is applied
  const filteredAnimals = animalsResult?.page?.filter(animal => 
    !selectedStatus || animal.status === selectedStatus
  ) ?? [];

  if (!session?.user?.organizationId) {
    return null;
  }

  const animals = filteredAnimals;
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
    const newParams = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      newParams.delete('species');
    } else {
      newParams.set('species', value);
    }
    router.push(`/dashboard/animals?${newParams.toString()}`);
    setSelectedSpeciesId(value === "all" ? null : value);
  };

  // Handle status filter change
  const handleStatusFilterChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      newParams.delete('status');
    } else {
      newParams.set('status', value);
    }
    router.push(`/dashboard/animals?${newParams.toString()}`);
    setSelectedStatus(value === "all" ? null : value as AnimalStatus);
  };

  // Clear all filters
  const clearFilters = () => {
    router.push('/dashboard/animals');
    setSelectedSpeciesId(null);
    setSelectedStatus(null);
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
          <span className="text-sm font-medium">Filters:</span>
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

        <Select
          value={selectedStatus || "all"}
          onValueChange={handleStatusFilterChange}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="released">Released</SelectItem>
            <SelectItem value="deceased">Deceased</SelectItem>
          </SelectContent>
        </Select>
        
        {(selectedSpeciesId || selectedStatus) && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilters}
            className="text-muted-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Clear Filters
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
            Register Animal
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