import { Label } from "@/components/ui/label";
import { Card, CardDescription, CardHeader } from "@/components/ui/card";
import { DashboardAreaChart } from "../components/dashboard-area-chart";
import { DashboardBarChart } from "../components/dashboard-bar-chart";
import { DashboardCard } from "@/types/dashboard-card.type";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Column, DashboardTable } from "../components/dashboard-table";
import { Badge } from "@/components/ui/badge";
import { UserListItem } from "@/interfaces/user.interface";
import Image from "next/image";
import DashboardDetailModal from "../components/dashboard-detail-modal";
import UserDetailModal from "../components/modals/detail-modals/UserDetailModal";

export default function Page() {
  const columns: Column<UserListItem & { actions: string }>[] = [
    {
      key: "name",
      header: "User",
      render: (value: string, item: UserListItem) => {
        return (
          <div className="flex items-center gap-2">
            <Image
              src={item.image || "/user_default.jpg"}
              alt="user avatar"
              width={40}
              height={40}
              className="size-10 rounded-full object-cover"
            />
            <div className="grid gap-1">
              <div className="font-semibold">{item.name}</div>
              <div className="text-muted-foreground">{item.email}</div>
            </div>
          </div>
        );
      },
    },
    {
      key: "role",
      header: "Role",
      render: (value: string) => {
        return value === "ADMIN" ? (
          <Badge variant="approved">ADMIN</Badge>
        ) : (
          <Badge>USER</Badge>
        );
      },
    },
    { key: "created_at", header: "Join Date" },
    {
      key: "actions",
      header: "Actions",
      render: (value: string, item: UserListItem) => {
        return <UserDetailModal item={item} />;
      },
    },
  ];

  const users: UserListItem[] = [
    {
      name: "Alex Johnson",
      email: "alex.johnson@example.com",
      username: "alexjohnson",
      bio: "Tech enthusiast and blogger.",
      image: "",
      article_count: 0,
      follower_count: 0,
      following_count: 0,
      role: "ADMIN",
      created_at: "2024-04-20",
    },
    {
      name: "Maria Garcia",
      email: "maria.garcia@example.com",
      username: "mariagarcia",
      bio: "Passionate about technology and education.",
      image: "",
      article_count: 36,
      follower_count: 63,
      following_count: 12,
      role: "USER",
      created_at: "2024-04-18",
    },
    {
      name: "Chen Wei",
      email: "chen.wei@example.com",
      username: "chenwei",
      bio: "Lifelong learner and tech blogger.",
      image: "",
      article_count: 15,
      follower_count: 45,
      following_count: 30,
      role: "USER",
      created_at: "2024-04-19",
    },
    {
      name: "David Smith",
      email: "david.smith@example.com",
      username: "davidsmith",
      bio: "Software developer and tech enthusiast.",
      image: "",
      article_count: 20,
      follower_count: 50,
      following_count: 25,
      role: "USER",
      created_at: "2024-04-17",
    },
  ];

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Label className="text-xl font-semibold">Quản lý người dùng</Label>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4">
        <DashboardTable data={users} columns={columns} />
      </div>
    </>
  );
}
