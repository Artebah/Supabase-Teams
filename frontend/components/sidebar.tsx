"use client";

import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import useProfileStore from "@/zustand/useProfileStore";
import {
  HomeIcon,
  LogOutIcon,
  SettingsIcon,
  ShoppingBagIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarSkeleton } from "@/components/skeletons/sidebar-skeleton";
import { Button } from "./ui/button";
import { useLogout } from "@/hooks/useLogout";

function Sidebar() {
  const { profile, isLoading } = useProfileStore();
  const pathname = usePathname();
  const logout = useLogout();

  const navLinkClassName = (route?: string) =>
    cn(
      "h-12 px-3 flex items-center gap-3 rounded-md text-xl border-2 transition-colors border-transparent hover:bg-gray-200",
      {
        "border-emerald-500 text-emerald-500 hover:bg-emerald-50!":
          pathname === route,
      }
    );

  if (isLoading || !profile) {
    return <SidebarSkeleton />;
  }

  // If user doesn't have a team, they shouldn't be able to access team routes
  if (!profile.team_id) {
    return (
      <div className="flex flex-col gap-2 py-6 px-4 bg-gray-50 border-gray-200 border rounded-md grow">
        <Link
          className={navLinkClassName(ROUTES.PROFILE(profile.id))}
          href={ROUTES.PROFILE(profile.id)}>
          <SettingsIcon className="size-6" /> Profile
        </Link>
        <div className="flex grow items-end">
          <Button
            onClick={logout}
            className="h-12 w-full text-xl border-red-600 text-red-600 hover:text-red-600 hover:bg-red-50"
            variant="outline">
            <LogOutIcon className="size-6" /> Logout
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 py-6 px-4 bg-gray-50 border-gray-200 border rounded-md grow">
      <Link
        className={navLinkClassName(ROUTES.TEAM(profile.team_id))}
        href={ROUTES.TEAM(profile.team_id)}>
        <HomeIcon className="size-6" /> Home
      </Link>
      <Link
        className={navLinkClassName(ROUTES.TEAM_PRODUCTS(profile.team_id))}
        href={ROUTES.TEAM_PRODUCTS(profile.team_id)}>
        <ShoppingBagIcon className="size-6" /> Products
      </Link>
      <Link
        className={navLinkClassName(ROUTES.PROFILE(profile.id))}
        href={ROUTES.PROFILE(profile.id)}>
        <SettingsIcon className="size-6" /> Profile
      </Link>
      <div className="flex grow items-end">
        <Button
          onClick={logout}
          className="h-12 w-full text-xl border-red-600 text-red-600 hover:text-red-600 hover:bg-red-50"
          variant="outline">
          <LogOutIcon className="size-6" /> Logout
        </Button>
      </div>
    </div>
  );
}

export default Sidebar;
