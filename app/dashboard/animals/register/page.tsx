'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimalForm } from '@/components/animals/animal-form';

export default function RegisterAnimalPage() {
  const router = useRouter();
  
  const handleSuccess = () => {
    router.push('/dashboard/animals');
  };
  
  return (
    <div className="h-full space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Register New Animal</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Animal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <AnimalForm onSuccess={handleSuccess} />
        </CardContent>
      </Card>
    </div>
  );
} 