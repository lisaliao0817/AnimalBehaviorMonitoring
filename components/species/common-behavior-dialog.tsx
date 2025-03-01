'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Id } from '@/convex/_generated/dataModel';
import { CommonBehaviorForm } from './common-behavior-form';

interface CommonBehaviorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  speciesId: Id<"species">;
}

export function CommonBehaviorDialog({
  open,
  onOpenChange,
  speciesId,
}: CommonBehaviorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white dark:bg-gray-900 border shadow-lg">
        <DialogHeader>
          <DialogTitle>Add Common Behavior</DialogTitle>
        </DialogHeader>
        <CommonBehaviorForm
          speciesId={speciesId}
          onSuccess={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
} 