import Sidebar from "@/components/sidebar";
import React from "react";

function ProfileLayout({ children }: React.PropsWithChildren) {
  return (
    <div className="flex gap-8 mt-16 py-3">
      <div className="basis-[300px]">
        <div className="fixed top-[76px] flex flex-col left-3 w-[300px] min-h-[calc(100vh-90px)]">
          <Sidebar />
        </div>
      </div>
      <div className="grow">{children}</div>
    </div>
  );
}

export default ProfileLayout;
