'use client';

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { Animal, Behavior, BodyExam } from '@/types';
import { Id } from '@/convex/_generated/dataModel';

interface PdfGeneratorProps {
  animals: Animal[];
  behaviors: Behavior[];
  bodyExams: BodyExam[];
  speciesMap: Record<Id<"species">, { name: string }>;
  staffMap: Record<Id<"staff">, { name: string }>;
  startDate: number;
  endDate: number;
}

export async function generatePdf({
  animals,
  behaviors,
  bodyExams,
  speciesMap,
  staffMap,
  startDate,
  endDate,
}: PdfGeneratorProps): Promise<Blob> {
  // Create a new PDF document
  const doc = new jsPDF('p', 'mm', 'a4');
  
  // Set document properties
  doc.setProperties({
    title: 'Animal Behavior and Health Report',
    subject: `Report from ${format(startDate, 'MMM dd, yyyy')} to ${format(endDate, 'MMM dd, yyyy')}`,
    creator: 'Animal Behavior Monitoring System',
  });
  
  // Add title
  doc.setFontSize(20);
  doc.text('Animal Behavior and Health Report', 105, 15, { align: 'center' });
  
  // Add date range
  doc.setFontSize(12);
  doc.text(
    `Report Period: ${format(startDate, 'MMM dd, yyyy')} to ${format(endDate, 'MMM dd, yyyy')}`,
    105,
    22,
    { align: 'center' }
  );
  
  let yPos = 30;
  
  // Process each animal
  for (const animal of animals) {
    // Check if we need a new page
    if (yPos > 260) {
      doc.addPage();
      yPos = 20;
    }
    
    // Animal header
    doc.setFontSize(16);
    doc.text(`Animal: ${animal.name}`, 14, yPos);
    yPos += 8;
    
    // Animal details
    doc.setFontSize(11);
    doc.text(`Species: ${speciesMap[animal.speciesId]?.name || 'Unknown Species'}`, 14, yPos);
    yPos += 6;
    doc.text(`ID Number: ${animal.identificationNumber || 'Not specified'}`, 14, yPos);
    yPos += 6;
    doc.text(`Status: ${animal.status}`, 14, yPos);
    yPos += 6;
    doc.text(`Admission Date: ${animal.dateOfBirth ? format(animal.dateOfBirth, 'MMM dd, yyyy') : 'Not specified'}`, 14, yPos);
    yPos += 10;
    
    // Behavior Records
    const animalBehaviors = behaviors.filter(b => b.animalId === animal.id);
    
    if (animalBehaviors.length > 0) {
      doc.setFontSize(14);
      doc.text('Behavior Records', 14, yPos);
      yPos += 6;
      
      // Create behavior table
      const behaviorData = animalBehaviors.map(behavior => [
        format(behavior.createdAt, 'MMM dd, yyyy h:mm a'),
        behavior.behavior,
        behavior.description || '',
        behavior.location || '',
        staffMap[behavior.staffId]?.name || 'Unknown'
      ]);
      
      autoTable(doc, {
        startY: yPos,
        head: [['Date & Time', 'Behavior', 'Description', 'Location', 'Recorded By']],
        body: behaviorData,
        margin: { top: 10, right: 14, bottom: 10, left: 14 },
        styles: { fontSize: 10 },
        headStyles: { fillColor: [66, 66, 66] },
        columnStyles: {
          0: { cellWidth: 35 },
          4: { cellWidth: 25 },
        },
      });
      
      // @ts-ignore
      yPos = doc.lastAutoTable.finalY + 10;
    } else {
      doc.setFontSize(12);
      doc.text('No behavior records found for the selected period.', 14, yPos);
      yPos += 10;
    }
    
    // Check if we need a new page
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    // Body Exam Records
    const animalExams = bodyExams.filter(e => e.animalId === animal.id);
    
    if (animalExams.length > 0) {
      doc.setFontSize(14);
      doc.text('Body Examination Records', 14, yPos);
      yPos += 6;
      
      // Create body exam table
      const examData = animalExams.map(exam => [
        format(exam.createdAt, 'MMM dd, yyyy h:mm a'),
        exam.weight ? `${exam.weight} kg` : '-',
        exam.diagnosis || '-',
        exam.notes || '-',
        staffMap[exam.staffId]?.name || 'Unknown'
      ]);
      
      autoTable(doc, {
        startY: yPos,
        head: [['Date & Time', 'Weight', 'Diagnosis', 'Notes', 'Recorded By']],
        body: examData,
        margin: { top: 10, right: 14, bottom: 10, left: 14 },
        styles: { fontSize: 10 },
        headStyles: { fillColor: [66, 66, 66] },
        columnStyles: {
          0: { cellWidth: 35 },
          1: { cellWidth: 20 },
          4: { cellWidth: 25 },
        },
      });
      
      // @ts-ignore
      yPos = doc.lastAutoTable.finalY + 16;
    } else {
      doc.setFontSize(12);
      doc.text('No body exam records found for the selected period.', 14, yPos);
      yPos += 16;
    }
    
    // Add separator
    if (animals.indexOf(animal) < animals.length - 1) {
      doc.setDrawColor(200);
      doc.line(14, yPos - 6, 196, yPos - 6);
      yPos += 10;
    }
  }
  
  // Add page numbers
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.text(
      `Page ${i} of ${pageCount}`,
      196,
      286,
      { align: 'right' }
    );
  }
  
  // Return the PDF as a blob
  return doc.output('blob');
} 