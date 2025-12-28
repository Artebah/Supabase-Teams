"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import useProfileStore from "@/zustand/useProfileStore";
import { HeaderProfileSkeleton } from "@/components/skeletons/header-profile-skeleton";
import { useLogout } from "@/hooks/useLogout";
import MobileNav from "./mobile-nav";

function Header() {
  const { profile, isLoading } = useProfileStore();
  const logout = useLogout();

  return (
    <header className="fixed top-0 left-0 bg-white z-30 shadow h-16 w-full px-4 md:px-8">
      <div className="flex justify-between items-center h-full">
        <p className="text-sm md:text-lg font-semibold">Supabase Teams</p>
        <div className="flex items-center gap-4">
          {isLoading ? (
            <HeaderProfileSkeleton />
          ) : (
            <>
              {profile ? (
                profile.profile_completed ? (
                  <div className="flex items-center gap-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="cursor-pointer focus:outline-0">
                        <div className="flex gap-2 items-center">
                          <Avatar className="size-10">
                            <AvatarImage
                              src={profile.avatar_url}
                              alt={profile.name}
                            />
                            <AvatarFallback>{profile.name[0]}</AvatarFallback>
                          </Avatar>
                          <span className="hidden sm:inline">
                            {profile.name}
                          </span>
                        </div>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={logout}
                          className="text-red-500 hover:text-red-500!">
                          Logout
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <MobileNav />
                  </div>
                ) : null
              ) : (
                <div className="flex gap-1 sm:gap-3">
                  <Button asChild>
                    <Link className="max-sm:px-3" href="/auth/login">
                      Login
                    </Link>
                  </Button>
                  <Button asChild variant="ghost">
                    <Link className="max-sm:px-3" href="/auth/sign-up">
                      Sign up
                    </Link>
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
