'use client';

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, FileDown, FileText, Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ReportPreview } from "@/components/reports/report-preview";
import { ScrollArea } from "@/components/ui/scroll-area";
import { generatePdf } from "@/components/reports/pdf-generator";
import { toast } from "sonner";

export default function ReportsPage() {
  const { data: session } = useSession();
  const [selectedAnimalIds, setSelectedAnimalIds] = useState<Id<"animals">[]>([]);
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    to: new Date(),
  });
  const [showPreview, setShowPreview] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch animals
  const animals = useQuery(
    api.animals.getByOrganization,
    session?.user?.organizationId
      ? {
          organizationId: session.user.organizationId as Id<"organizations">,
          limit: 100,
        }
      : "skip"
  );

  const handleAnimalToggle = (animalId: Id<"animals">) => {
    setSelectedAnimalIds((prev) => {
      if (prev.includes(animalId)) {
        return prev.filter((id) => id !== animalId);
      } else {
        return [...prev, animalId];
      }
    });
  };

  const generatePdfReport = async () => {
    setIsGenerating(true);
    
    // Fetch the necessary data for the report
    try {
      // Fetch animals
      const selectedAnimals = animals?.page?.filter(animal => 
        selectedAnimalIds.includes(animal._id)
      );
      
      if (!selectedAnimals || !session?.user?.organizationId) {
        toast.error("Failed to generate report", {
          description: "Could not retrieve animal data",
        });
        setIsGenerating(false);
        return;
      }
      
      // Fetch behaviors
      const behaviorsResponse = await fetch(`/api/reports/behaviors`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          animalIds: selectedAnimalIds,
          startDate: dateRange.from.getTime(),
          endDate: dateRange.to.getTime(),
        }),
      });
      
      // Fetch body exams
      const examsResponse = await fetch(`/api/reports/bodyExams`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          animalIds: selectedAnimalIds,
          startDate: dateRange.from.getTime(),
          endDate: dateRange.to.getTime(),
        }),
      });
      
      // Fetch species and staff data
      const speciesResponse = await fetch(`/api/reports/species`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          speciesIds: selectedAnimals.map(animal => animal.speciesId),
        }),
      });
      
      const staffIdsSet = new Set();
      
      if (!behaviorsResponse.ok || !examsResponse.ok || !speciesResponse.ok) {
        toast.error("Failed to generate report", {
          description: "Could not retrieve necessary data",
        });
        setIsGenerating(false);
        return;
      }
      
      const behaviorsData = await behaviorsResponse.json();
      const examsData = await examsResponse.json();
      const speciesData = await speciesResponse.json();
      
      // Collect staff IDs
      behaviorsData.forEach((behavior: { staffId?: string }) => {
        if (behavior.staffId) staffIdsSet.add(behavior.staffId);
      });
      
      examsData.forEach((exam: { staffId?: string }) => {
        if (exam.staffId) staffIdsSet.add(exam.staffId);
      });
      
      // Fetch staff data
      const staffResponse = await fetch(`/api/reports/staff`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          staffIds: Array.from(staffIdsSet),
        }),
      });
      
      if (!staffResponse.ok) {
        toast.error("Failed to generate report", {
          description: "Could not retrieve staff data",
        });
        setIsGenerating(false);
        return;
      }
      
      const staffData = await staffResponse.json();
      
      // Create maps for quick lookups
      const speciesMap: Record<string, { name: string }> = {};
      speciesData.forEach((species: any) => {
        speciesMap[species.id] = { name: species.name };
      });
      
      const staffMap: Record<string, { name: string }> = {};
      staffData.forEach((staff: any) => {
        staffMap[staff.id] = { name: staff.name };
      });
      
      // Generate the PDF
      const pdfBlob = await generatePdf({
        animals: selectedAnimals.map(animal => ({
          id: animal._id,
          name: animal.name,
          speciesId: animal.speciesId,
          dateOfBirth: animal.dateOfBirth,
          gender: animal.gender,
          identificationNumber: animal.identificationNumber,
          status: animal.status,
          createdAt: animal.createdAt,
          createdBy: animal.createdBy,
          organizationId: animal.organizationId,
        })),
        behaviors: behaviorsData,
        bodyExams: examsData,
        speciesMap,
        staffMap,
        startDate: dateRange.from.getTime(),
        endDate: dateRange.to.getTime(),
      });
      
      // Create a URL for the blob and trigger download
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Animal_Report_${format(dateRange.from, 'yyyy-MM-dd')}_to_${format(dateRange.to, 'yyyy-MM-dd')}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 0);
      
      toast.success("Report generated successfully");
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Failed to generate report", {
        description: "An unexpected error occurred",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">
          Generate and download reports on animal behavior and health data
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Report Parameters</CardTitle>
            <CardDescription>
              Select animals and date range for your report
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Select Animals</h3>
                <ScrollArea className="h-60 rounded-md border">
                  <div className="p-4 space-y-3">
                    {animals && animals.page && animals.page.length > 0 ? (
                      animals.page.map((animal) => (
                        <div key={animal._id} className="flex items-center space-x-2">
                          <div 
                            className={cn(
                              "flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border-2 cursor-pointer",
                              selectedAnimalIds.includes(animal._id) 
                                ? "bg-gray-600 border-gray-600" 
                                : "border-gray-300 hover:border-gray-500"
                            )}
                            onClick={() => handleAnimalToggle(animal._id)}
                          >
                            {selectedAnimalIds.includes(animal._id) && <Check className="h-4 w-4 text-white" />}
                          </div>
                          <div 
                            className="cursor-pointer flex-1"
                            onClick={() => handleAnimalToggle(animal._id)}
                          >
                            {animal.name}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No animals found</p>
                    )}
                  </div>
                </ScrollArea>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Date Range</h3>
                <div className="grid gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dateRange && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange?.from ? (
                          dateRange.to ? (
                            <>
                              {format(dateRange.from, "LLL dd, y")} -{" "}
                              {format(dateRange.to, "LLL dd, y")}
                            </>
                          ) : (
                            format(dateRange.from, "LLL dd, y")
                          )
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange?.from}
                        selected={{
                          from: dateRange?.from,
                          to: dateRange?.to,
                        }}
                        onSelect={(range) => {
                          if (range?.from && range?.to) {
                            setDateRange({
                              from: range.from,
                              to: range.to,
                            });
                          }
                        }}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <Button 
                  className="w-full"
                  onClick={() => setShowPreview(true)}
                  disabled={selectedAnimalIds.length === 0 || !dateRange.from || !dateRange.to}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Preview Report
                </Button>
                
                <Button 
                  className="w-full"
                  variant="outline"
                  onClick={generatePdfReport}
                  disabled={selectedAnimalIds.length === 0 || !dateRange.from || !dateRange.to || isGenerating}
                >
                  {isGenerating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <FileDown className="mr-2 h-4 w-4" />
                  )}
                  {isGenerating ? "Generating..." : "Generate PDF"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-8">
          <CardHeader>
            <CardTitle>Report Preview</CardTitle>
            <CardDescription>
              Preview of the report based on selected parameters
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!showPreview ? (
              <div className="flex items-center justify-center h-[600px] border rounded-md">
                <div className="text-center">
                  <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Preview Available</h3>
                  <p className="text-sm text-muted-foreground">
                    Select animals and date range to preview the report
                  </p>
                </div>
              </div>
            ) : (
              <ReportPreview 
                animalIds={selectedAnimalIds}
                startDate={dateRange.from.getTime()}
                endDate={dateRange.to.getTime()}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 