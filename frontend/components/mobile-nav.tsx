"use client";

import { useEffect, useState } from "react";
import { MenuIcon, X } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import useProfileStore from "@/zustand/useProfileStore";
import { usePathname } from "next/navigation";
import { useLogout } from "@/hooks/useLogout";

function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const { profile, isLoading } = useProfileStore();
  const pathname = usePathname();
  const logout = useLogout();

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("_lock");
    } else {
      document.body.classList.remove("_lock");
    }
  }, [isOpen]);

  if (isLoading || !profile) {
    return null;
  }

  const navLinkClassName = (route?: string) =>
    cn(
      "w-full text-left px-4 py-3 rounded-md text-base transition-colors hover:bg-gray-200",
      {
        "bg-emerald-50 text-emerald-500 border-l-4 border-emerald-500":
          pathname === route,
      }
    );

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="mr-2 transition-transform duration-300"
        style={{
          transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
        }}>
        {isOpen ? <X className="size-6" /> : <MenuIcon className="size-6" />}
      </Button>

      {isOpen && (
        <div className="fixed top-16 left-0 right-0 bottom-0 bg-white shadow-lg z-40 animate-in fade-in duration-300">
          <nav className="flex flex-col gap-2 p-6 h-full">
            {profile.team_id && (
              <>
                <Link
                  className={navLinkClassName(ROUTES.TEAM(profile.team_id))}
                  href={ROUTES.TEAM(profile.team_id)}
                  onClick={() => setIsOpen(false)}>
                  Home
                </Link>
                <Link
                  className={navLinkClassName(
                    ROUTES.TEAM_PRODUCTS(profile.team_id)
                  )}
                  href={ROUTES.TEAM_PRODUCTS(profile.team_id)}
                  onClick={() => setIsOpen(false)}>
                  Products
                </Link>
              </>
            )}
            <Link
              className={navLinkClassName(ROUTES.PROFILE(profile.id))}
              href={ROUTES.PROFILE(profile.id)}
              onClick={() => setIsOpen(false)}>
              Profile
            </Link>
            <div className="flex grow items-end">
              <Button
                onClick={handleLogout}
                className="w-full text-red-600 hover:text-red-600 hover:bg-red-50 border-red-600"
                variant="outline">
                Logout
              </Button>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}

export default MobileNav;
