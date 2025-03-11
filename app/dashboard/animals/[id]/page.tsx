'use client';

import { useState, use } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, ClipboardList, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { Id } from '@/convex/_generated/dataModel';
import { useRouter } from 'next/navigation';
import { AnimalDialog } from '@/components/animals/animal-dialog';
import { BehaviorDialog } from '@/components/behaviors/behavior-dialog';
import { BodyExamDialog } from '@/components/body-exams/body-exam-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import React from 'react';

export default function AnimalDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showBehaviorDialog, setShowBehaviorDialog] = useState(false);
  const [showBodyExamDialog, setShowBodyExamDialog] = useState(false);
  const [behaviorsLimit] = useState(7);
  const [behaviorsCursor, setBehaviorsCursor] = useState<string | null>(null);
  const [bodyExamsLimit] = useState(7);
  const [bodyExamsCursor, setBodyExamsCursor] = useState<string | null>(null);
  const [isLastBehaviorsPage, setIsLastBehaviorsPage] = useState(false);
  const [isLastBodyExamsPage, setIsLastBodyExamsPage] = useState(false);

  const animal = useQuery(
    api.animals.getById,
    { id: resolvedParams.id as Id<"animals"> }
  );

  const species = useQuery(
    api.species.getById,
    animal?.speciesId
      ? { id: animal.speciesId }
      : "skip"
  );

  const createdByStaff = useQuery(
    api.staff.getById,
    animal?.createdBy
      ? { id: animal.createdBy }
      : "skip"
  );

  const behaviors = useQuery(
    api.behaviors.getByAnimal,
    animal?._id
      ? { 
          animalId: animal._id, 
          limit: behaviorsLimit,
          cursor: behaviorsCursor || undefined
        }
      : "skip"
  );

  // Get staff information for each behavior
  const behaviorStaffMembers = useQuery(
    api.staff.getByIds,
    behaviors?.page && behaviors.page.length > 0
      ? { 
          ids: behaviors.page.map(behavior => behavior.staffId) 
        }
      : "skip"
  );

  // Check if we've reached the last page of behaviors
  React.useEffect(() => {
    if (behaviors) {
      // If we have fewer items than the limit, or no continuation cursor, we're on the last page
      setIsLastBehaviorsPage(!behaviors.continueCursor || (behaviors.page && behaviors.page.length < behaviorsLimit));
    }
  }, [behaviors, behaviorsLimit]);

  const bodyExams = useQuery(
    api.bodyExams.getByAnimal,
    animal?._id
      ? { 
          animalId: animal._id, 
          limit: bodyExamsLimit,
          cursor: bodyExamsCursor || undefined
        }
      : "skip"
  );

  // Get staff information for each body exam
  const bodyExamStaffMembers = useQuery(
    api.staff.getByIds,
    bodyExams?.page && bodyExams.page.length > 0
      ? { 
          ids: bodyExams.page.map(exam => exam.staffId) 
        }
      : "skip"
  );

  // Check if we've reached the last page of body exams
  React.useEffect(() => {
    if (bodyExams) {
      // If we have fewer items than the limit, or no continuation cursor, we're on the last page
      setIsLastBodyExamsPage(!bodyExams.continueCursor || (bodyExams.page && bodyExams.page.length < bodyExamsLimit));
    }
  }, [bodyExams, bodyExamsLimit]);

  if (!animal || !species) {
    return null;
  }

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

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return 'Not specified';
    return new Date(timestamp).toLocaleDateString();
  };

  const formatDateTime = (timestamp?: number) => {
    if (!timestamp) return 'Not specified';
    const date = new Date(timestamp);
    return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const getBehaviorStaffName = (staffId: Id<"staff">) => {
    if (!behaviorStaffMembers) return 'Unknown';
    const staff = behaviorStaffMembers.find(s => s?._id === staffId);
    return staff?.name || 'Unknown';
  };

  const getBodyExamStaffName = (staffId: Id<"staff">) => {
    if (!bodyExamStaffMembers) return 'Unknown';
    const staff = bodyExamStaffMembers.find(s => s?._id === staffId);
    return staff?.name || 'Unknown';
  };

  const handleNextBehaviorsPage = () => {
    if (!hasMoreBehaviors) {
      console.log("No more behaviors to load");
      return;
    }
    if (behaviors?.continueCursor && behaviors.continueCursor !== "") {
      setBehaviorsCursor(behaviors.continueCursor);
    }
  };

  const handlePreviousBehaviorsPage = () => {
    setBehaviorsCursor(null);
  };

  const handleNextBodyExamsPage = () => {
    if (!hasMoreBodyExams) {
      console.log("No more body exams to load");
      return;
    }
    if (bodyExams?.continueCursor && bodyExams.continueCursor !== "") {
      setBodyExamsCursor(bodyExams.continueCursor);
    }
  };

  const handlePreviousBodyExamsPage = () => {
    setBodyExamsCursor(null);
  };

  // Check if there are more behaviors to load
  const hasMoreBehaviors = Boolean(behaviors?.continueCursor) && !isLastBehaviorsPage;
  
  // Check if there are more body exams to load
  const hasMoreBodyExams = Boolean(bodyExams?.continueCursor) && !isLastBodyExamsPage;

  return (
    <div className="h-full space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">{animal.name}</h1>
          <Badge 
            variant="secondary"
            className={getStatusColor(animal.status)}
          >
            {animal.status.charAt(0).toUpperCase() + animal.status.slice(1)}
          </Badge>
        </div>
        <Button onClick={() => setShowEditDialog(true)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Animal
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Species</h3>
            <p className="mt-1">{species.name}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Date of Admission</h3>
            <p className="mt-1">{formatDate(animal.dateOfBirth)}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Gender</h3>
            <p className="mt-1">{animal.gender ? animal.gender.charAt(0).toUpperCase() + animal.gender.slice(1) : 'Not specified'}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Identification Number</h3>
            <p className="mt-1">{animal.identificationNumber || 'Not specified'}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Registration Date</h3>
            <p className="mt-1">{formatDate(animal.createdAt)}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Registered By</h3>
            <p className="mt-1">{createdByStaff?.name || 'Unknown'}</p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="behaviors" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="behaviors">
            <ClipboardList className="mr-2 h-4 w-4" />
            Behaviors
          </TabsTrigger>
          <TabsTrigger value="bodyExams">
            <FileText className="mr-2 h-4 w-4" />
            Body Exams
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="behaviors">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Behaviors</CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowBehaviorDialog(true)}
              >
                Record Behavior
              </Button>
            </CardHeader>
            <CardContent>
              {behaviors?.page && behaviors.page.length > 0 ? (
                <>
                  <div className="space-y-4">
                    {behaviors.page.map((behavior) => (
                      <div key={behavior._id} className="border-b pb-4 last:border-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{behavior.behavior}</h3>
                            {behavior.description && (
                              <p className="text-sm text-muted-foreground mt-1">{behavior.description}</p>
                            )}
                            {behavior.location && (
                              <p className="text-xs text-muted-foreground mt-1">Location: {behavior.location}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">{formatDateTime(behavior.createdAt)}</p>
                            <p className="text-xs text-muted-foreground mt-1">Recorded by {getBehaviorStaffName(behavior.staffId)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handlePreviousBehaviorsPage}
                      disabled={!behaviorsCursor}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    {hasMoreBehaviors ? (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleNextBehaviorsPage}
                        className={!hasMoreBehaviors ? "opacity-50 cursor-not-allowed" : ""}
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    ) : (
                      <div className="w-[80px]"></div> // Spacer to maintain layout
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No behaviors recorded yet</p>
                  <Button 
                    variant="outline" 
                    className="mt-2"
                    onClick={() => setShowBehaviorDialog(true)}
                  >
                    Record Behavior
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="bodyExams">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Body Exams</CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowBodyExamDialog(true)}
              >
                Record Body Exam
              </Button>
            </CardHeader>
            <CardContent>
              {bodyExams?.page && bodyExams.page.length > 0 ? (
                <>
                  <div className="space-y-4">
                    {bodyExams.page.map((exam) => (
                      <div key={exam._id} className="border-b pb-4 last:border-0">
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
                            <p className="text-xs text-muted-foreground mt-1">Recorded by {getBodyExamStaffName(exam.staffId)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handlePreviousBodyExamsPage}
                      disabled={!bodyExamsCursor}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    {hasMoreBodyExams ? (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleNextBodyExamsPage}
                        className={!hasMoreBodyExams ? "opacity-50 cursor-not-allowed" : ""}
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    ) : (
                      <div className="w-[80px]"></div> // Spacer to maintain layout
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No body exams recorded yet</p>
                  <Button 
                    variant="outline" 
                    className="mt-2"
                    onClick={() => setShowBodyExamDialog(true)}
                  >
                    Record Body Exam
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AnimalDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        animal={{
          id: animal._id,
          name: animal.name,
          speciesId: animal.speciesId,
          organizationId: animal.organizationId,
          dateOfBirth: animal.dateOfBirth,
          gender: animal.gender,
          identificationNumber: animal.identificationNumber,
          status: animal.status,
          createdAt: animal.createdAt,
          createdBy: animal.createdBy,
        }}
      />

      {animal._id && (
        <>
          <BehaviorDialog
            open={showBehaviorDialog}
            onOpenChange={setShowBehaviorDialog}
            animalId={animal._id}
          />
          <BodyExamDialog
            open={showBodyExamDialog}
            onOpenChange={setShowBodyExamDialog}
            animalId={animal._id}
          />
        </>
      )}
    </div>
  );
} 