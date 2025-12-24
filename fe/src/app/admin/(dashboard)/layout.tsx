import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { DashboardSidebar } from "./components/dashboard-sidebar";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="">
      <SidebarProvider>
        <DashboardSidebar />
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </div>
  );
};

export default Layout;
