'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Trash2 } from 'lucide-react';
import { Id } from '@/convex/_generated/dataModel';
import { cn } from '@/lib/utils';
import { Species } from '@/types';
import { SpeciesDialog } from '@/components/species/species-dialog';
import { CommonBehaviorDialog } from '@/components/species/common-behavior-dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function SpeciesPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<Id<"species"> | null>(null);
  const [showManageView, setShowManageView] = useState(false);
  const [showSpeciesDialog, setShowSpeciesDialog] = useState(false);
  const [showBehaviorDialog, setShowBehaviorDialog] = useState(false);
  const [selectedSpecies, setSelectedSpecies] = useState<Species | undefined>();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteBehaviorConfirm, setShowDeleteBehaviorConfirm] = useState(false);
  const [selectedBehaviorId, setSelectedBehaviorId] = useState<Id<"commonBehaviors"> | null>(null);

  const speciesResult = useQuery(
    api.species.getByOrganization,
    session?.user?.organizationId
      ? {
          organizationId: session.user.organizationId as Id<"organizations">,
          limit: 50,
        }
      : "skip"
  );

  const commonBehaviorsResult = useQuery(
    api.commonBehaviors.getBySpecies,
    selectedSpeciesId
      ? {
          speciesId: selectedSpeciesId,
          limit: 50,
        }
      : "skip"
  );

  const deleteSpecies = useMutation(api.species.deleteSpecies);
  const deleteCommonBehavior = useMutation(api.commonBehaviors.delete_);

  if (!session?.user?.organizationId) {
    return null;
  }

  const species = speciesResult?.page ?? [];
  const commonBehaviors = commonBehaviorsResult?.page ?? [];
  const currentSpecies = species.find((s) => s._id === selectedSpeciesId);

  // Convert Convex document to Species type
  const mapToSpecies = (doc: typeof species[0]): Species => ({
    id: doc._id,
    name: doc.name,
    description: doc.description,
    organizationId: doc.organizationId,
    createdAt: doc.createdAt,
    createdBy: doc.createdBy,
  });

  const handleDeleteSpecies = async () => {
    if (!selectedSpeciesId || !session?.user?.id) return;

    try {
      await deleteSpecies({
        id: selectedSpeciesId,
        userId: session.user.id as Id<"staff">,
      });
      toast.success('Species deleted successfully');
      setSelectedSpeciesId(null);
    } catch (error) {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Failed to delete species',
      });
    }
  };

  const handleDeleteBehavior = async () => {
    if (!selectedBehaviorId || !session?.user?.id) return;

    try {
      await deleteCommonBehavior({
        id: selectedBehaviorId,
        staffId: session.user.id as Id<"staff">,
      });
      toast.success('Common behavior deleted successfully');
      setSelectedBehaviorId(null);
    } catch (error) {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Failed to delete behavior',
      });
    }
  };

  // Navigate to animals page with species filter
  const navigateToAnimalsWithFilter = (speciesId: Id<"species">) => {
    router.push(`/dashboard/animals?species=${speciesId}`);
  };

  return (
    <>
      <div className="h-full space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Species</h1>
          <Button onClick={() => setShowManageView(!showManageView)}>
            {showManageView ? "View List" : "Manage Species"}
          </Button>
        </div>

        {!showManageView ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {species.map((species) => (
              <Card 
                key={species._id} 
                className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigateToAnimalsWithFilter(species._id)}
              >
                <CardHeader className="space-y-1">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{species.name}</CardTitle>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card click
                        setSelectedSpeciesId(species._id);
                        setShowDeleteConfirm(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {species.description && (
                    <p className="text-sm text-muted-foreground">
                      {species.description}
                    </p>
                  )}
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid h-[calc(100vh-12rem)] grid-cols-1 gap-4 md:grid-cols-2">
            {/* Species List */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Species List</CardTitle>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      setSelectedSpecies(undefined);
                      setShowSpeciesDialog(true);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Species
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[calc(100vh-16rem)]">
                  <div className="space-y-4">
                    {species.map((species) => (
                      <div
                        key={species._id}
                        className={cn(
                          "group cursor-pointer rounded-lg border p-4 transition-colors hover:bg-muted",
                          selectedSpeciesId === species._id && "bg-muted"
                        )}
                        onClick={() => setSelectedSpeciesId(species._id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">{species.name}</h3>
                            {species.description && (
                              <p className="mt-1 text-sm text-muted-foreground">
                                {species.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="opacity-0 group-hover:opacity-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedSpecies(mapToSpecies(species));
                                setShowSpeciesDialog(true);
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedSpeciesId(species._id);
                                setShowDeleteConfirm(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Common Behaviors */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {selectedSpeciesId
                      ? `Common Behaviors - ${currentSpecies?.name}`
                      : "Common Behaviors"}
                  </CardTitle>
                  {selectedSpeciesId && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setShowBehaviorDialog(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Behavior
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {selectedSpeciesId ? (
                  <ScrollArea className="h-[calc(100vh-16rem)]">
                    <div className="space-y-4">
                      {commonBehaviors.map((behavior) => (
                        <div
                          key={behavior._id}
                          className="group rounded-lg border p-4"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium">{behavior.name}</h3>
                              {behavior.description && (
                                <p className="mt-1 text-sm text-muted-foreground">
                                  {behavior.description}
                                </p>
                              )}
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                              onClick={() => {
                                setSelectedBehaviorId(behavior._id);
                                setShowDeleteBehaviorConfirm(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {commonBehaviors.length === 0 && (
                        <p className="text-center text-sm text-muted-foreground">
                          No common behaviors defined for this species.
                        </p>
                      )}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="flex h-[calc(100vh-16rem)] items-center justify-center">
                    <p className="text-center text-sm text-muted-foreground">
                      Select a species to view its common behaviors
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <SpeciesDialog
        open={showSpeciesDialog}
        onOpenChange={setShowSpeciesDialog}
        species={selectedSpecies}
      />

      {selectedSpeciesId && (
        <CommonBehaviorDialog
          open={showBehaviorDialog}
          onOpenChange={setShowBehaviorDialog}
          speciesId={selectedSpeciesId}
        />
      )}

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Species"
        description="Are you sure you want to delete this species? This action cannot be undone."
        onConfirm={handleDeleteSpecies}
      />

      <ConfirmDialog
        open={showDeleteBehaviorConfirm}
        onOpenChange={setShowDeleteBehaviorConfirm}
        title="Delete Common Behavior"
        description="Are you sure you want to delete this common behavior? This action cannot be undone."
        onConfirm={handleDeleteBehavior}
      />
    </>
  );
} 