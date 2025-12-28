import Sidebar from "@/components/sidebar";
import React from "react";

function TeamLayout({ children }: React.PropsWithChildren) {
  return (
    <div className="flex gap-8 mt-16 py-3">
      <Sidebar />
      <div className="grow">{children}</div>
    </div>
  );
}

export default TeamLayout;
