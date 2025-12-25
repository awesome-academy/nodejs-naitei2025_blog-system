"use client";
import { useState } from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button"; // Import Button
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { usePathname, useRouter } from "next/navigation";
import { EditProfileDialog } from "./EditProfileDialog";
import { useAuth } from "@/hooks/useAuth";
import userApi from "@/api/user.api"; // Import API

export default function ProfileSidebar({ user }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user: me } = useAuth(); // Lấy token từ hook auth
  const { token } = me || "";

  // Logic kiểm tra xem có phải profile của chính mình không
  const isOwnProfile =
    pathname.includes("/profiles/me") || (me?.username === user.username);

  // State quản lý trạng thái follow (Khởi tạo từ prop user.following)
  // Giả định API getProfile trả về field 'following' (boolean)
  const [isFollowing, setIsFollowing] = useState(user.isFollowing || false);
  const [isLoading, setIsLoading] = useState(false);

  const handleFollowToggle = async () => {
    setIsLoading(true);
    try {
      if (isFollowing) {
        // Đang follow -> Gọi API Unfollow
        await userApi.unfollowUser(token, user.username);
        setIsFollowing(false);
      } else {
        // Chưa follow -> Gọi API Follow
        await userApi.followUser(token, user.username);
        setIsFollowing(true);
      }
    } catch (error) {
      console.error("Follow error:", error);
      alert("Có lỗi xảy ra khi cập nhật trạng thái theo dõi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <aside className="w-64 shrink-0">
      <Card>
        <CardHeader className="grid gap-1 items-center text-center">
          <Avatar className="h-24 w-24 mx-auto">
            <AvatarImage
              src={`${user.image || "/user_default.jpg"}`}
              className="object-cover"
            ></AvatarImage>
          </Avatar>
          <CardTitle className="mt-2">{user.name || "Jane Doe"}</CardTitle>
          <CardDescription>@{user.username}</CardDescription>
          <p className="text-sm text-muted-foreground mt-2 text-left w-full">
            {user.bio || "Chưa có tiểu sử."}
          </p>
        </CardHeader>

        <CardContent>
          {isOwnProfile ? (
            // Nếu là chính mình -> Hiện nút sửa
            <EditProfileDialog user={user} />
          ) : (
            // Nếu là người khác -> Hiện nút Follow/Unfollow
            <Button
              className="w-full"
              variant={isFollowing ? "outline" : "default"} // Đổi style nút
              onClick={handleFollowToggle}
              disabled={isLoading}
            >
              {isLoading
                ? "Đang xử lý..."
                : isFollowing
                ? "Đang theo dõi"
                : "Theo dõi"}
            </Button>
          )}
        </CardContent>
      </Card>
    </aside>
  );
}
