"use client";

import { usePathname } from "next/navigation";
import { Button } from "../ui/button";
import { Bell, LogIn, PenLine, Save, Upload } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Input } from "../ui/input";
import Image from "next/image";
import Link from "next/link";
import { getAuthServer } from "@/lib/auth-server";

export default function NavbarButtons({ user }) {
  const pathname = usePathname();
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

          {/* Nút Viết bài (Nổi bật) */}
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

          {/* Nút Viết bài (Nổi bật) */}
          <Link href="/articles/draft">
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
        {/* Nút Trang chủ (Dùng variant ghost cho nhẹ nhàng) */}
        {ActionButtons}
        {/* Nút Thông báo (Icon only) */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {/* Dấu chấm đỏ thông báo */}
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-600 border border-background"></span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-full p-2" align="start">
            <DropdownMenuItem>
              <Input
                type="search"
                placeholder="Tìm kiếm bài viết..."
                className="w-full bg-muted/50 pl-9 focus-visible:bg-background"
              />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Avatar User (Nếu đã login) - Placeholder */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Image
                src="/user_default.jpg"
                alt="User Avatar"
                width={32}
                height={32}
                className="rounded-full"
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-full p-2" align="start">
            <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
            <DropdownMenuGroup>
              <DropdownMenuItem className="cursor-pointer" asChild>
                <Link href="/profile/me">Hồ sơ của tôi</Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
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
