'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  BarChart3, 
  Cat, 
  Home, 
  Menu, 
  PawPrint, 
  Users,
  Plus,
  Activity
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

type SidebarProps = React.HTMLAttributes<HTMLDivElement>;

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  const isAdmin = session?.user?.role === 'admin';

  const routes = [
    {
      label: 'Dashboard',
      icon: Home,
      href: '/dashboard',
      active: pathname === '/dashboard',
    },
    {
      label: 'Species',
      icon: Cat,
      href: '/dashboard/species',
      active: pathname === '/dashboard/species',
    },
    {
      label: 'Animals',
      icon: PawPrint,
      href: '/dashboard/animals',
      active: pathname === '/dashboard/animals',
    },
    // {
    //   label: 'Behaviors',
    //   icon: ClipboardList,
    //   href: '/dashboard/behaviors',
    //   active: pathname === '/dashboard/behaviors',
    // },
    // {
    //   label: 'Body Exams',
    //   icon: FileText,
    //   href: '/dashboard/body-exams',
    //   active: pathname === '/dashboard/body-exams',
    // },
    {
      label: 'Reports',
      icon: BarChart3,
      href: '/dashboard/reports',
      active: pathname === '/dashboard/reports',
    },
  ];

  // Admin-only routes
  if (isAdmin) {
    routes.push({
      label: 'Staff',
      icon: Users,
      href: '/dashboard/staff',
      active: pathname === '/dashboard/staff',
    });
  }

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild className="md:hidden">
          <Button variant="outline" size="icon" className="ml-2 mt-2">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[240px] p-0">
          <MobileSidebar routes={routes} setOpen={setOpen} />
        </SheetContent>
      </Sheet>
      <div className={cn("hidden border-r bg-background md:block", className)}>
        <div className="flex h-full w-[240px] flex-col">
          <div className="flex h-14 items-center border-b px-4">
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
              <PawPrint className="h-6 w-6" />
              <span>Animal Behavior</span>
            </Link>
          </div>
          <ScrollArea className="flex-1">
            <nav className="flex flex-col gap-1 p-2">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                    route.active ? "bg-accent text-accent-foreground" : "transparent"
                  )}
                >
                  <route.icon className="h-4 w-4" />
                  {route.label}
                </Link>
              ))}
              
              <Separator className="my-2" />
              
              <h3 className="px-3 text-xs font-medium text-muted-foreground">Quick Actions</h3>
              
              <Link
                href="/dashboard/animals/register"
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
              >
                <Plus className="h-4 w-4" />
                Register Animal
              </Link>
              
              <Link
                href="/dashboard/behaviors/record"
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
              >
                <Activity className="h-4 w-4" />
                Record Behavior
              </Link>
            </nav>
          </ScrollArea>
        </div>
      </div>
    </>
  );
}

interface MobileSidebarProps {
  routes: {
    label: string;
    icon: React.ElementType;
    href: string;
    active: boolean;
  }[];
  setOpen: (open: boolean) => void;
}

function MobileSidebar({ routes, setOpen }: MobileSidebarProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center border-b px-4">
        <Link 
          href="/dashboard" 
          className="flex items-center gap-2 font-semibold"
          onClick={() => setOpen(false)}
        >
          <PawPrint className="h-6 w-6" />
          <span>Animal Behavior</span>
        </Link>
      </div>
      <ScrollArea className="flex-1">
        <nav className="flex flex-col gap-1 p-2">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                route.active ? "bg-accent text-accent-foreground" : "transparent"
              )}
            >
              <route.icon className="h-4 w-4" />
              {route.label}
            </Link>
          ))}
          
          <Separator className="my-2" />
          
          <h3 className="px-3 text-xs font-medium text-muted-foreground">Quick Actions</h3>
          
          <Link
            href="/dashboard/animals/register"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            <Plus className="h-4 w-4" />
            Register Animal
          </Link>
          
          <Link
            href="/dashboard/behaviors/record"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            <Activity className="h-4 w-4" />
            Record Behavior
          </Link>
        </nav>
      </ScrollArea>
    </div>
  );
} 