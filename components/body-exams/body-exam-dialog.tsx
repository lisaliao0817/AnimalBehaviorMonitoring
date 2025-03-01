'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { BodyExam } from '@/types';
import { BodyExamForm } from './body-exam-form';
import { Id } from '@/convex/_generated/dataModel';

interface BodyExamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  animalId: Id<"animals">;
  bodyExam?: BodyExam;
}

export function BodyExamDialog({ open, onOpenChange, animalId, bodyExam }: BodyExamDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{bodyExam ? 'Edit Body Exam' : 'Record New Body Exam'}</DialogTitle>
        </DialogHeader>
        <BodyExamForm
          animalId={animalId}
          bodyExam={bodyExam}
          onSuccess={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
} 