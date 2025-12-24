import { AvatarFallback, AvatarImage, Avatar } from "@/components/ui/avatar";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArticleListItem } from "@/interfaces/article.interface";
import { Clock, Eye, MessageSquare } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const ArticleDetailModal = ({ item }: { item: ArticleListItem }) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Published":
        return <Badge variant="approved">{status}</Badge>;
      case "Draft":
        return <Badge>{status}</Badge>;
      case "Rejected":
        return <Badge variant="destructive">{status}</Badge>;
      case "Pending":
        return <Badge variant="pending">{status}</Badge>;
    }
  };

  const statusBadge = getStatusBadge(item.status);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{statusBadge}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-3">
            <div className="text-3xl font-bold">{item.title}</div>
            <div className="flex gap-2">
              <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
              <AvatarImage src={item.author.image} />
              <AvatarFallback>{item.author.name}</AvatarFallback>
            </Avatar>
              <div className="flex items-center">{item.author.name}</div>
            </div>
          </div>
          <div className="grid grid-cols-3 text-sm">
            <div className="grid gap-2 border-t border-b border-r p-2">
              <div className="text-green-600">Ngày tạo</div>
              <div className="">{item.created_at}</div>
            </div>
            <div className="grid gap-2 border p-2">
              <div className="text-green-600">Cập nhật lần cuối</div>
              <div>{item.updated_at}</div>
            </div>
            <div className="grid gap-2 border-t border-b border-l p-2">
              <div className="text-green-600">Ngày xuất bản</div>
              <div className="">{item.published_at || "Not published yet"}</div>
            </div>
          </div>
          <div className="grid gap-3">
            <div>{item.description}</div>
            <div className="flex flex-wrap gap-2">
              {item.tagList.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter className="sm:justify-between border-t mt-4 pt-4">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Eye className="" />
              <span className="items-center">{item.views}</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageSquare className="" />
              {item.comments_count}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="" />
              {item.reading_time} phút đọc
            </div>
          </div>
          <Link href={`/articles/${item.slug}`}>
            <Button variant="default">Xem bài viết</Button>
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ArticleDetailModal;
