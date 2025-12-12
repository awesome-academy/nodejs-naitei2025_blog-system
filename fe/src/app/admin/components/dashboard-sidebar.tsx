"use client";
import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import Link from "next/link";
import {
  Bookmark,
  BrickWallShield,
  LayoutDashboard,
  LogOut,
  Newspaper,
  UsersRound,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { usePathname } from "next/dist/client/components/navigation";
import { DashboardSidebarButton } from "@/types/dashboard-sidebar-button.type";

const items: DashboardSidebarButton[] = [
  {
    title: "Tổng quan",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Bài viết",
    url: "articles",
    icon: Newspaper,
  },
  {
    title: "Người dùng",
    url: "users",
    icon: UsersRound,
  },
  {
    title: "Tag",
    url: "tags",
    icon: Bookmark,
  },
];

export function DashboardSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const path = usePathname().replace("/admin", "") || "/dashboard";
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <Label className="flex items-center space-x-2 px-2 py-4">
              <div className="bg-sidebar-foreground text-sidebar rounded-md p-1">
                <BrickWallShield />
              </div>
              <span className="text-xl font-semibold">Admin Panel</span>
            </Label>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title} className="h-10 text-sm">
                  <SidebarMenuButton
                    asChild
                    className={`hover:bg-sidebar-foreground hover:text-sidebar ${
                      path === item.url && "bg-sidebar-foreground text-sidebar"
                    }`}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem className="text-sm">
            <SidebarMenuButton className="h-12 hover:bg-sidebar-foreground hover:text-sidebar cursor-pointer">
              <LogOut />
              <span>Đăng xuất</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      {/* <SidebarRail /> */}
    </Sidebar>
  );
}
