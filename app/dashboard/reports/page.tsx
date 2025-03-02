import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">
          View and generate reports on animal behavior and health data
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reports Dashboard</CardTitle>
          <CardDescription>
            Access and generate various reports based on collected data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-blue-200 bg-blue-50 p-4 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200">
            <h3 className="mb-2 font-medium">Coming Soon</h3>
            <p>
              The reports functionality is currently under development. Check back soon for updates!
            </p>
          </div>
          
          {/* <div className="mt-6">
            <h3 className="text-lg font-medium">Planned Features:</h3>
            <ul className="mt-2 list-disc pl-6 text-muted-foreground">
              <li>Behavior trend analysis</li>
              <li>Health status reports</li>
              <li>Custom report generation</li>
              <li>Data export options</li>
              <li>Visualization tools</li>
            </ul>
          </div> */}
        </CardContent>
      </Card>
    </div>
  );
} 