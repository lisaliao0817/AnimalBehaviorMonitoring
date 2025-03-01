'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Animal } from '@/types';
import { AnimalForm } from './animal-form';

interface AnimalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  animal?: Animal;
}

export function AnimalDialog({ open, onOpenChange, animal }: AnimalDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-[#1e1e1e] shadow-xl">
        <DialogHeader>
          <DialogTitle>{animal ? 'Edit Animal' : 'Register New Animal'}</DialogTitle>
        </DialogHeader>
        <AnimalForm
          animal={animal}
          onSuccess={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
} 