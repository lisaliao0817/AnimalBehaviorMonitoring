'use client';

import { useSession, signOut } from 'next-auth/react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ModeToggle } from '@/components/mode-toggle';
import { LogOut, Settings, User } from 'lucide-react';
import { Id } from '@/convex/_generated/dataModel';

export function Header() {
  const { data: session } = useSession();
  
  const organization = useQuery(
    api.organizations.getById, 
    session?.user?.organizationId 
      ? { id: session.user.organizationId as Id<"organizations"> } 
      : "skip"
  );

  const userInitials = session?.user?.name
    ? session.user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : 'U';

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 lg:px-6">
      <div className="flex flex-1 items-center justify-end gap-2">
        {organization && (
          <div className="mr-auto hidden md:block">
            <p className="text-sm font-medium">{organization.name}</p>
          </div>
        )}
        <ModeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{session?.user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {session?.user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {/* <DropdownMenuItem asChild>
              <Button variant="ghost" className="w-full justify-start" asChild>
                <a href="/dashboard/profile">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </a>
              </Button>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Button variant="ghost" className="w-full justify-start" asChild>
                <a href="/dashboard/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </a>
              </Button>
            </DropdownMenuItem>
            <DropdownMenuSeparator /> */}
            <DropdownMenuItem asChild>
              <Button
                variant="ghost"
                className="w-full justify-start text-red-600 hover:text-red-600"
                onClick={() => signOut({ callbackUrl: '/' })}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </Button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
} 