'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Behavior } from '@/types';
import { BehaviorForm } from './behavior-form';
import { Id } from '@/convex/_generated/dataModel';

interface BehaviorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  animalId: Id<"animals">;
  behavior?: Behavior;
}

export function BehaviorDialog({ open, onOpenChange, animalId, behavior }: BehaviorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{behavior ? 'Edit Behavior' : 'Record New Behavior'}</DialogTitle>
        </DialogHeader>
        <BehaviorForm
          animalId={animalId}
          behavior={behavior}
          onSuccess={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
} 