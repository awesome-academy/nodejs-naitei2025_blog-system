"use client";
import { useState } from "react"; // 1. Import useState
import { useRouter } from "next/navigation"; // 2. Import useRouter
import { ArticleListItem } from "@/interfaces/article.interface";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemHeader,
  ItemMedia,
  ItemTitle,
} from "./ui/item";
import Link from "next/link";
import {
  getArticleLink,
  getDraftArticleLink,
  getProfileLink,
  getTagLink,
} from "@/lib/format-link";
import Image from "next/image";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Toggle } from "./ui/toggle";
import { Eye, Heart, MessageCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth"; // 3. Import useAuth
import articleApi from "@/api/article.api"; // 4. Import API

const PostList = ({ articles }: { articles: ArticleListItem[] }) => {
  if (!articles || articles.length === 0) {
    return <div>Chưa có bài viết nào.</div>;
  }
  return (
    <ItemGroup className="grid gap-4">
      {articles.map((article) => (
        <Post key={article.slug} article={article} />
      ))}
    </ItemGroup>
  );
};

const Post = ({ article }: { article: ArticleListItem }) => {
  const router = useRouter();
  const { user } = useAuth();
  const token = user?.token;

  // State quản lý trạng thái like và số lượng like
  // Khởi tạo giá trị ban đầu từ props
  const [isFavorited, setIsFavorited] = useState(article.favorited);
  const [favoritesCount, setFavoritesCount] = useState(article.favorites_count);
  const [isLoading, setIsLoading] = useState(false);

  const handleFavoriteToggle = async () => {
    if (!token) {
      // Nếu chưa đăng nhập, chuyển hướng sang trang login
      return router.push("/login");
    }

    if (isLoading) return;

    // Optimistic Update: Cập nhật UI trước khi gọi API để tạo cảm giác mượt mà
    const previousFavorited = isFavorited;
    const previousCount = favoritesCount;

    setIsFavorited(!isFavorited);
    setFavoritesCount((prev) => (isFavorited ? prev - 1 : prev + 1));
    setIsLoading(true);

    try {
      if (isFavorited) {
        // Đang like -> Gọi API Unfavorite
        await articleApi.unfavoriteArticle(article.slug, token);
      } else {
        // Chưa like -> Gọi API Favorite
        await articleApi.favoriteArticle(article.slug, token);
      }
    } catch (error) {
      console.error("Favorite error:", error);
      // Nếu lỗi, revert lại trạng thái cũ
      setIsFavorited(previousFavorited);
      setFavoritesCount(previousCount);
    } finally {
      setIsLoading(false);
    }
  };

  // FIX LOGIC LINK:
  // 1. Kiểm tra status không phân biệt hoa thường (Backend thường trả về DRAFT)
  const isDraft = article.status === "draft" || article.status === "DRAFT";

  // 2. Tạo link trực tiếp
  const postLink = isDraft
    ? `/articles/draft/${article.slug}`
    : `/articles/${article.slug}`;

  return (
    <Item key={article.slug} variant="outline">
      <ItemHeader className="p-0">
        {/* Sử dụng postLink đã tính toán ở trên */}
        <Link href={postLink} className="relative w-full h-52">
          <Image
            src={article.cover_image || "/article_default.jpg"}
            alt={article.title}
            fill
            className="object-cover rounded-md"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </Link>
      </ItemHeader>
      <ItemContent className="gap-4">
        <ItemMedia className="flex gap-2">
          <Avatar asChild>
            <Link href={getProfileLink(article.author.username)}>
              <AvatarImage
                src={article.author.image || "/user_default.jpg"}
                alt={article.author.name}
              />
            </Link>
          </Avatar>
          <div className="">
            <Link href={getProfileLink(article.author.username)} className="">
              {article.author.name}
            </Link>
            <div>
              <span className="text-sm text-muted-foreground">
                {new Date(article.published_at).toLocaleDateString()}
              </span>
              <span className="mx-1 text-sm text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">
                {article.reading_time} phút đọc
              </span>
            </div>
          </div>
        </ItemMedia>
        {/* Sử dụng postLink cho tiêu đề */}
        <Link href={postLink}>
          <ItemTitle className="text-lg font-semibold">
            {article.title}
            {/* Hiển thị badge Draft nếu là nháp */}
            {isDraft && (
              <span className="ml-2 text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">
                Draft
              </span>
            )}
          </ItemTitle>
          <ItemDescription>{article.description}</ItemDescription>
        </Link>
        <div className="flex gap-2 flex-wrap">
          {article.tagList.map((tag) => (
            <Button
              asChild
              key={tag}
              variant="secondary"
              className="rounded-xl"
              size="sm"
            >
              <Link key={tag} href={getTagLink(tag)}>
                #{tag}
              </Link>
            </Button>
          ))}
        </div>
      </ItemContent>
      <ItemFooter className="">
        <div className="flex gap-6">
          <div className="flex items-center">
            <Toggle
              size="sm"
              pressed={isFavorited}
              onPressedChange={handleFavoriteToggle}
              // 1. Xóa các class phức tạp, chỉ giữ lại class để bỏ background xám khi active
              className="hover:bg-transparent data-[state=on]:bg-transparent px-0"
            >
              {/* 2. Áp dụng class màu trực tiếp vào Icon dựa trên state */}
              <Heart
                className={`h-4 w-4 transition-colors ${
                  isFavorited ? "fill-red-500 stroke-red-500" : ""
                }`}
              />
            </Toggle>
            <span className="text-sm ml-1">{favoritesCount}</span>
          </div>
          <div className="flex items-center">
            <MessageCircle className="h-4 w-4" />
            <span className="text-sm ml-1">{article.comments_count}</span>
          </div>
          <div className="flex items-center">
            <Eye className="h-4 w-4" />
            <span className="text-sm ml-1">{article.views}</span>
          </div>
        </div>
      </ItemFooter>
    </Item>
  );
};

export default PostList;
