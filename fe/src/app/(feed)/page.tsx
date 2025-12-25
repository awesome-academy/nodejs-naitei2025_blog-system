import PostList from "@/components/PostList";
import { getAuthServer } from "@/lib/auth-server";
import articleApi from "@/api/article.api";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // 1. Await searchParams (Chuẩn Next.js 15)
  const resolvedParams = await searchParams;
  const tag = resolvedParams.tag as string | undefined;
  
  const user = await getAuthServer();
  let articles = [];

  // 2. Sửa logic ưu tiên:
  // Ưu tiên 1: Nếu có Tag -> Lấy theo Tag (bất kể đã login hay chưa)
  if (tag) {
    const response = await articleApi.getArticleByTag(
      tag,
      20,
      0,
      user?.token || ""
    );
    if (response.success && response.data) {
      articles = response.data.items;
    }
  } 
  // Ưu tiên 2: Nếu không có Tag mà Đã Login -> Lấy Feed cá nhân
  else if (user) {
    const response = await articleApi.getFeed(user.token);
    if (response.success && response.data) {
      articles = response.data.items;
    }
  } 

  return (
    <>
      <h2 className="text-2xl font-bold mt-8">
        {tag ? `Thẻ #${tag}` : user ? "Bảng tin của bạn" : "Bài viết mới nhất"}
      </h2>
      <PostList articles={articles} />
    </>
  );
}
