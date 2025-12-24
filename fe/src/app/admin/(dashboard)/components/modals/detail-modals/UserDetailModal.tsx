import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UserListItem } from "@/interfaces/user.interface";
import { Clock, Eye, MessageSquare } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const UserDetailModal = ({ item }: { item: UserListItem }) => {
  const getRoleBadge = (role: string) => {
    if (role === "ADMIN") {
      return <Badge variant="approved">{role}</Badge>;
    }
    return <Badge>{role}</Badge>;
  };
  const roleBadge = getRoleBadge(item.role);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <div className="grid gap-6 items-center">
          <div className="flex flex-col items-center gap-1">
            <Image
              src={item.image || "/user_default.jpg"}
              alt="user avatar"
              width={120}
              height={120}
              className="rounded-full object-cover"
            />
            <h2 className="text-xl font-bold">{item.name}</h2>
            <p className="text-muted-foreground">{`@${item.username}`}</p>
            <p className="text-muted-foreground">{item.bio}</p>
          </div>
          <div className="grid grid-cols-3 w-full">
            <div className="flex flex-col items-center border p-2">
              <span className="font-semibold text-lg">
                {item.article_count}
              </span>
              <span className="text-sm text-muted-foreground">Bài viết</span>
            </div>
            <div className="flex flex-col items-center border p-2">
              <span className="font-semibold text-lg">
                {item.follower_count}
              </span>
              <span className="text-sm text-muted-foreground">
                Người theo dõi
              </span>
            </div>
            <div className="flex flex-col items-center border p-2">
              <span className="font-semibold text-lg">
                {item.following_count}
              </span>
              <span className="text-sm text-muted-foreground">
                Đang theo dõi
              </span>
            </div>
          </div>
          <div className="grid gap-6 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span className="font-semibold">{item.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Role</span>
              <span>{roleBadge}</span>
            </div>
          </div>
        </div>
        <DialogFooter className="border-t mt-4 pt-4">
          <Link href={`/profile/${item.username}`}>
            <Button variant="default">Xem chi tiết hồ sơ</Button>
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailModal;
