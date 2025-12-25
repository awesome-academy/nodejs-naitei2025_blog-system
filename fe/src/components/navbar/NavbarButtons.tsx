"use client";

import { usePathname, useRouter } from "next/navigation";
import { Button } from "../ui/button";
import {
  Bell,
  LogIn,
  PenLine,
  Save,
  Upload,
  LogOut,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react"; // 1. Import hooks
import userApi from "@/api/user.api";

export default function NavbarButtons({ user }) {
  const pathname = usePathname();
  const router = useRouter();

  // 2. State quản lý thông báo
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoadingNoti, setIsLoadingNoti] = useState(false);

  // 3. Fetch thông báo khi có user
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user?.token) return;

      setIsLoadingNoti(true);
      try {
        const response: any = await userApi.getNotifications(user.token);
        // Theo yêu cầu: lấy response.data.items nếu success true
        if (response.success && response.data) {
          setNotifications(response.data.items || []);
        }
      } catch (error) {
        console.error("Failed to fetch notifications", error);
      } finally {
        setIsLoadingNoti(false);
      }
    };

    fetchNotifications();
  }, [user]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth", { method: "DELETE" });
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/login">
          <Button variant="ghost" className="hidden sm:flex">
            <LogIn className="h-4 w-4" />
            Đăng nhập
          </Button>
        </Link>
        <Link href="/register">
          <Button className="gap-2">Đăng ký</Button>
        </Link>
      </div>
    );
  } else {
    let ActionButtons;
    if (pathname === "/articles") {
      ActionButtons = (
        <>
          <Button variant="ghost" className="gap-2">
            <Save className="h-4 w-4" />
            <span className="hidden sm:inline">Lưu bản nháp</span>
          </Button>
          <Button className="gap-2">
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">Xuất bản</span>
          </Button>
        </>
      );
    } else {
      ActionButtons = (
        <>
          <Link href="/">
            <Button variant="ghost" className="gap-2">
              <span className="hidden sm:inline">Trang chủ</span>
            </Button>
          </Link>
          <Link href="/articles/draft/new">
            <Button className="gap-2">
              <PenLine className="h-4 w-4" />
              <span className="hidden sm:inline">Viết bài</span>
            </Button>
          </Link>
        </>
      );
    }

    return (
      <div className="flex items-center gap-2">
        {ActionButtons}

        {/* --- DROPDOWN THÔNG BÁO --- */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {/* Chỉ hiện chấm đỏ nếu có thông báo */}
              {notifications.length > 0 && (
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-600 border border-background"></span>
              )}
            </Button>
          </DropdownMenuTrigger>

          {/* Tăng độ rộng w-80 và căn lề phải */}
          <DropdownMenuContent className="w-80 p-0" align="end">
            <div className="p-3 border-b font-semibold text-sm flex justify-between items-center">
              <span>Thông báo</span>
              {notifications.length > 0 && (
                <span className="text-xs text-blue-600 cursor-pointer hover:underline">
                  Đánh dấu đã đọc
                </span>
              )}
            </div>

            <div className="max-h-[300px] overflow-y-auto">
              {isLoadingNoti ? (
                <div className="flex justify-center items-center py-6 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Đang tải...
                </div>
              ) : notifications.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  Không có thông báo mới
                </div>
              ) : (
                notifications.map((noti: any, index) => (
                  <DropdownMenuItem
                    key={noti.id || index}
                    className="cursor-pointer p-3 border-b last:border-0 w-full"
                  >
                    <Link
                      href={noti.action_url || "#"}
                      className="flex gap-3 items-start w-full"
                    >
                      {/* 1. Thêm Avatar người gửi */}
                      <div className="relative h-10 w-10 shrink-0">
                        <Image
                          src={noti.sender?.image || "/user_default.jpg"}
                          alt="Sender Avatar"
                          fill
                          className="rounded-full object-cover border"
                        />
                      </div>

                      {/* 2. Nội dung thông báo */}
                      <div className="flex flex-col gap-1 flex-1">
                        <span className="text-sm font-medium leading-none">
                          {noti.title || "Thông báo hệ thống"}
                        </span>
                        <span className="text-sm text-muted-foreground line-clamp-2">
                          {noti.body ||
                            noti.content ||
                            "Bạn có một thông báo mới."}
                        </span>
                        <span className="text-xs text-gray-400 mt-1">
                          {noti.created_at
                            ? new Date(noti.created_at).toLocaleDateString(
                                "vi-VN"
                              )
                            : "Vừa xong"}
                        </span>
                      </div>

                      {/* 3. Dấu chấm xanh chưa đọc */}
                      {!noti.isRead && (
                        <span className="h-2 w-2 bg-blue-500 rounded-full mt-2 shrink-0" />
                      )}
                    </Link>
                  </DropdownMenuItem>
                ))
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-2 border-t text-center">
                <Link
                  href="/notifications"
                  className="text-xs text-blue-600 hover:underline"
                >
                  Xem tất cả
                </Link>
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Avatar User */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-full"
            >
              <Image
                src={`${user.image || "/user_default.jpg"}`}
                alt="User Avatar"
                width={32}
                height={32}
                className="rounded-full object-cover aspect-square h-8 w-8"
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-full p-2" align="end">
            <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
            <DropdownMenuGroup>
              <DropdownMenuItem className="cursor-pointer" asChild>
                <Link href="/profiles/me">Hồ sơ của tôi</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                onClick={handleLogout}
              >
                Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  //   return (
  //     <div className="flex items-center gap-2">
  //       {/* Nút Trang chủ (Dùng variant ghost cho nhẹ nhàng) */}
  //       <Button variant="ghost" className="hidden sm:flex">
  //         Trang chủ
  //       </Button>

  //       {/* Nút Viết bài (Nổi bật) */}
  //       <Button className="gap-2">
  //         <PenLine className="h-4 w-4" />
  //         <span className="hidden sm:inline">Viết bài</span>
  //       </Button>

  //       {/* Nút Thông báo (Icon only) */}
  //       <DropdownMenu>
  //         <DropdownMenuTrigger asChild>
  //           <Button variant="ghost" size="icon" className="relative">
  //             <Bell className="h-5 w-5" />
  //             {/* Dấu chấm đỏ thông báo */}
  //             <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-600 border border-background"></span>
  //           </Button>
  //         </DropdownMenuTrigger>
  //         <DropdownMenuContent className="w-full p-2" align="start">
  //           <DropdownMenuItem>
  //             <Input
  //               type="search"
  //               placeholder="Tìm kiếm bài viết..."
  //               className="w-full bg-muted/50 pl-9 focus-visible:bg-background"
  //             />
  //           </DropdownMenuItem>
  //         </DropdownMenuContent>
  //       </DropdownMenu>

  //       {/* Avatar User (Nếu đã login) - Placeholder */}
  //       <DropdownMenu>
  //         <DropdownMenuTrigger asChild>
  //           <Button variant="ghost" size="icon" className="relative">
  //             <Image
  //               src="/user_default.jpg"
  //               alt="User Avatar"
  //               width={32}
  //               height={32}
  //               className="rounded-full"
  //             />
  //           </Button>
  //         </DropdownMenuTrigger>
  //         <DropdownMenuContent className="w-full p-2" align="start">
  //           <DropdownMenuLabel>User Name</DropdownMenuLabel>
  //           <DropdownMenuGroup>
  //             <DropdownMenuItem className="cursor-pointer" asChild>
  //               <Link href="/profile">Hồ sơ của tôi</Link>
  //             </DropdownMenuItem>
  //             <DropdownMenuItem className="cursor-pointer">
  //               Đăng xuất
  //             </DropdownMenuItem>
  //           </DropdownMenuGroup>
  //         </DropdownMenuContent>
  //       </DropdownMenu>
  //     </div>
  //   );
}
