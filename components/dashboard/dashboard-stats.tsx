'use client'

import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { PawPrint, Activity, Stethoscope, Users } from 'lucide-react'

interface DashboardStatsProps {
  organizationId: Id<'organizations'>
  startDate?: number
  endDate?: number
}

export function DashboardStats({
  organizationId,
  startDate,
  endDate
}: DashboardStatsProps) {
  const animals = useQuery(api.animals.countByOrganization, { 
    organizationId 
  })
  
  const behaviors = useQuery(api.behaviors.countByOrganization, { 
    organizationId,
    startDate,
    endDate
  })
  
  const bodyExams = useQuery(api.bodyExams.countByOrganization, { 
    organizationId,
    startDate,
    endDate
  })
  
  const staff = useQuery(api.staff.countByOrganization, { 
    organizationId 
  })

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Animals"
        value={animals}
        icon={<PawPrint className="h-4 w-4 text-muted-foreground" />}
        description="Total animals in your organization"
      />
      <StatCard
        title="Behaviors"
        value={behaviors}
        icon={<Activity className="h-4 w-4 text-muted-foreground" />}
        description="Behaviors recorded in selected period"
      />
      <StatCard
        title="Body Exams"
        value={bodyExams}
        icon={<Stethoscope className="h-4 w-4 text-muted-foreground" />}
        description="Exams performed in selected period"
      />
      <StatCard
        title="Staff"
        value={staff}
        icon={<Users className="h-4 w-4 text-muted-foreground" />}
        description="Total staff members"
      />
    </div>
  )
}

interface StatCardProps {
  title: string
  value: number | undefined
  icon: React.ReactNode
  description: string
}

function StatCard({ title, value, icon, description }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {value !== undefined ? (
          <div className="text-2xl font-bold">{value}</div>
        ) : (
          <Skeleton className="h-8 w-20" />
        )}
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
} 