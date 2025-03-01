'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Species } from '@/types';
import { SpeciesForm } from './species-form';

interface SpeciesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  species?: Species;
}

export function SpeciesDialog({
  open,
  onOpenChange,
  species,
}: SpeciesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white dark:bg-gray-900 border shadow-lg">
        <DialogHeader>
          <DialogTitle>
            {species ? 'Edit Species' : 'Add Species'}
          </DialogTitle>
        </DialogHeader>
        <SpeciesForm
          species={species}
          onSuccess={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
} 