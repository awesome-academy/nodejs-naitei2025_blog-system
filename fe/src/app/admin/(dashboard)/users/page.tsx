"use client";
import { Label } from "@/components/ui/label";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Column, DashboardTable } from "../components/dashboard-table";
import { Badge } from "@/components/ui/badge";
import { UserListItem } from "@/interfaces/user.interface";
import Image from "next/image";
import UserDetailModal from "../components/modals/detail-modals/UserDetailModal";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import userApi from "@/api/user.api";

export default function Page() {
  const { user } = useAuth();
  const { token } = user || "";
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<UserListItem[]>([]);
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

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await userApi.getUsers(token || "");
      if (response.success) {
        setUsers(response.data.items);
      } else {
        alert(response.error);
      }
      setIsLoading(false);
    };
    fetchUsers();
  }, []);

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
