'use client';

import { useState, useEffect } from 'react';
import { useQuery } from 'convex/react';
import { useSession } from 'next-auth/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface ReportPreviewProps {
  animalIds: Id<"animals">[];
  startDate: number;
  endDate: number;
}

interface BehaviorRecord {
  _id: Id<"behaviors">;
  animalId: Id<"animals">;
  behavior: string;
  description?: string;
  location?: string;
  staffId: Id<"staff">;
  createdAt: number;
}

interface BodyExamRecord {
  _id: Id<"bodyExams">;
  animalId: Id<"animals">;
  weight?: number;
  diagnosis?: string;
  notes?: string;
  staffId: Id<"staff">;
  createdAt: number;
}

interface StaffMember {
  _id: Id<"staff">;
  name: string;
}

interface SpeciesRecord {
  _id: Id<"species">;
  name: string;
}

export function ReportPreview({ animalIds, startDate, endDate }: ReportPreviewProps) {
  const { data: session } = useSession();
  const [isFetching, setIsFetching] = useState(true);

  // Fetch animal data
  const animals = useQuery(
    api.animals.getByIds,
    { ids: animalIds }
  );

  // Fetch behaviors for selected animals
  const behaviors = useQuery(
    api.behaviors.getByAnimalsDateRange,
    session?.user?.organizationId && animalIds.length > 0
      ? {
          animalIds,
          startDate,
          endDate,
          limit: 100,
        }
      : "skip"
  );

  // Fetch body exams for selected animals
  const bodyExams = useQuery(
    api.bodyExams.getByAnimalsDateRange,
    session?.user?.organizationId && animalIds.length > 0
      ? {
          animalIds,
          startDate,
          endDate,
          limit: 100,
        }
      : "skip"
  );

  // Fetch staff data for behaviors and body exams
  const staffIds = new Set<Id<"staff">>();
  
  behaviors?.page?.forEach((behavior: BehaviorRecord) => {
    if (behavior.staffId) staffIds.add(behavior.staffId);
  });
  
  bodyExams?.page?.forEach((exam: BodyExamRecord) => {
    if (exam.staffId) staffIds.add(exam.staffId);
  });
  
  const staffMembers = useQuery(
    api.staff.getByIds,
    staffIds.size > 0
      ? { 
          ids: Array.from(staffIds) as Id<"staff">[]
        }
      : "skip"
  );

  // Fetch species data
  const speciesIds = new Set<Id<"species">>();
  
  animals?.forEach((animal) => {
    if (animal?.speciesId) speciesIds.add(animal.speciesId);
  });
  
  const species = useQuery(
    api.species.getByIds,
    speciesIds.size > 0
      ? { 
          ids: Array.from(speciesIds) as Id<"species">[]
        }
      : "skip"
  );

  // Set loading state
  useEffect(() => {
    if (animals && behaviors && bodyExams && staffMembers && species) {
      setIsFetching(false);
    }
  }, [animals, behaviors, bodyExams, staffMembers, species]);

  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Loading report data...</p>
        </div>
      </div>
    );
  }

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return 'Not specified';
    return format(new Date(timestamp), 'MMM dd, yyyy');
  };

  const formatDateTime = (timestamp?: number) => {
    if (!timestamp) return 'Not specified';
    return format(new Date(timestamp), 'MMM dd, yyyy hh:mm a');
  };

  const getStaffName = (staffId: Id<"staff">) => {
    const staff = staffMembers?.find((s: StaffMember | null) => s?._id === staffId);
    return staff?.name || 'Unknown';
  };

  const getSpeciesName = (speciesId: Id<"species"> | undefined) => {
    if (!speciesId) return 'Unknown Species';
    const speciesItem = species?.find((s: SpeciesRecord | null) => s?._id === speciesId);
    return speciesItem?.name || 'Unknown Species';
  };

  return (
    <ScrollArea className="h-[600px]">
      <div className="p-4 space-y-8">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Animal Health & Behavior Report</h2>
          <p className="text-muted-foreground">
            {formatDate(startDate)} to {formatDate(endDate)}
          </p>
        </div>

        {animals?.map((animal) => (
          <Card key={animal?._id} className="mb-6">
            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold">{animal?.name}</h3>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Species</p>
                      <p>{getSpeciesName(animal?.speciesId)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Identification Number</p>
                      <p>{animal?.identificationNumber || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Date of Admission</p>
                      <p>{formatDate(animal?.dateOfBirth)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className="capitalize">{animal?.status}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <Tabs defaultValue="behaviors">
                  <TabsList>
                    <TabsTrigger value="behaviors">Behaviors</TabsTrigger>
                    <TabsTrigger value="bodyExams">Body Exams</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="behaviors" className="mt-4">
                    <div className="space-y-4">
                      <h4 className="font-medium">Behavior Records</h4>
                      {behaviors?.page?.filter((b: BehaviorRecord) => b.animalId === animal?._id).length === 0 ? (
                        <p className="text-muted-foreground text-sm">No behavior records found in the selected date range.</p>
                      ) : (
                        <div className="space-y-3">
                          {behaviors?.page
                            ?.filter((b: BehaviorRecord) => b.animalId === animal?._id)
                            .sort((a: BehaviorRecord, b: BehaviorRecord) => (b.createdAt || 0) - (a.createdAt || 0))
                            .map((behavior: BehaviorRecord) => (
                              <div key={behavior._id} className="border p-3 rounded-md">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-medium">{behavior.behavior}</p>
                                    {behavior.description && (
                                      <p className="text-sm mt-1">{behavior.description}</p>
                                    )}
                                    {behavior.location && (
                                      <p className="text-sm text-muted-foreground mt-1">Location: {behavior.location}</p>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xs text-muted-foreground">{formatDateTime(behavior.createdAt)}</p>
                                    <p className="text-xs text-muted-foreground mt-1">Recorded by {getStaffName(behavior.staffId)}</p>
                                  </div>
                                </div>
                              </div>
                            ))
                          }
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="bodyExams" className="mt-4">
                    <div className="space-y-4">
                      <h4 className="font-medium">Body Examination Records</h4>
                      {bodyExams?.page?.filter((e: BodyExamRecord) => e.animalId === animal?._id).length === 0 ? (
                        <p className="text-muted-foreground text-sm">No body exam records found in the selected date range.</p>
                      ) : (
                        <div className="space-y-3">
                          {bodyExams?.page
                            ?.filter((e: BodyExamRecord) => e.animalId === animal?._id)
                            .sort((a: BodyExamRecord, b: BodyExamRecord) => (b.createdAt || 0) - (a.createdAt || 0))
                            .map((exam: BodyExamRecord) => (
                              <div key={exam._id} className="border p-3 rounded-md">
                                <div className="flex justify-between items-start">
                                  <div>
                                    {exam.weight && (
                                      <p className="text-sm"><span className="font-medium">Weight:</span> {exam.weight} kg</p>
                                    )}
                                    {exam.diagnosis && (
                                      <p className="text-sm mt-1"><span className="font-medium">Diagnosis:</span> {exam.diagnosis}</p>
                                    )}
                                    {exam.notes && (
                                      <p className="text-sm text-muted-foreground mt-1">{exam.notes}</p>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xs text-muted-foreground">{formatDateTime(exam.createdAt)}</p>
                                    <p className="text-xs text-muted-foreground mt-1">Recorded by {getStaffName(exam.staffId)}</p>
                                  </div>
                                </div>
                              </div>
                            ))
                          }
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
} 