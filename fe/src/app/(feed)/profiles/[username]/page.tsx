import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { notFound, redirect } from "next/navigation";
import userApi from "@/api/user.api";
import PostList from "@/components/PostList";
import { ArticleListItem } from "@/interfaces/article.interface";
import { UserDetail } from "@/interfaces/user.interface";
import articleApi from "@/api/article.api";
import { getAuthServer } from "@/lib/auth-server";

export default async function Page({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const me = await getAuthServer();
  const token = me?.token || ""; // Lấy token an toàn

  let user: UserDetail | null = null;

  try {
    if (username === "me") {
      if (!token) {
        redirect("/login");
      }
      const response = await userApi.getMe(token);
      if (response.success && response.data) {
        user = response.data;
      } else {
        redirect("/login"); // Token sai/hết hạn -> Login lại
      }
    } else {
      // 1. Sửa lỗi logic: Kiểm tra me tồn tại trước khi so sánh username
      if (me && username === me.username) {
        redirect("/profiles/me");
      }

      // 2. Gọi API lấy profile người khác
      const response = await userApi.getProfile(token, username);
      if (response.success && response.data) {
        user = response.data;
      } else {
        return notFound();
      }
    }
  } catch (error: any) {
    // QUAN TRỌNG: Dòng này giúp Next.js hiểu đây là lệnh chuyển hướng, không phải lỗi
    if (
      error.message === "NEXT_REDIRECT" ||
      error.digest?.startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }

    console.error("Error fetching profile:", error);
    if (error?.status === 401 || error?.message === "Unauthorized") {
      redirect("/login");
    }
    return notFound();
  }

  // Nếu vẫn không có user sau khi chạy logic trên
  if (!user) {
    return notFound();
  }

  // --- PHẦN DƯỚI GIỮ NGUYÊN ---
  // Lấy danh sách bài viết (Cũng nên bọc try/catch nếu cần thiết)
  let articles: ArticleListItem[] = [];
  try {
    const response = await articleApi.getArticleByAuthor(
      user.username,
      100,
      0,
      token
    );
    if (response.success && response.data) {
      articles = response.data.items;
    }
  } catch (error) {
    console.error("Lỗi tải bài viết:", error);
  }

  const drafts = articles.filter((a) => a.status === "draft");
  const published = articles.filter((a) => a.status === "published");
  const pendings = articles.filter((a) => a.status === "pending");

  const favorited: ArticleListItem[] = articles.filter((a) => a.favorited);

  const isOwnProfile = username === "me";

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">{user.username}</h1>

      <Tabs defaultValue="published-articles" className="w-full">
        <TabsList>
          <TabsTrigger value="published-articles">Đã xuất bản</TabsTrigger>
          <TabsTrigger value="favorited-articles">Đã thích</TabsTrigger>

          {isOwnProfile && (
            <>
              <TabsTrigger value="pending-articles">Chờ duyệt</TabsTrigger>
              <TabsTrigger value="drafts-articles">Bản nháp</TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="published-articles">
          {published.length > 0 ? (
            <PostList articles={published} />
          ) : (
            <p className="text-gray-500 mt-4">Chưa có bài viết nào.</p>
          )}
        </TabsContent>

        <TabsContent value="favorited-articles">
          {favorited.length > 0 ? (
            <PostList articles={favorited} />
          ) : (
            <p className="text-gray-500 mt-4">Chưa thích bài viết nào.</p>
          )}
        </TabsContent>

        {isOwnProfile && (
          <>
            <TabsContent value="drafts-articles">
              <PostList articles={drafts} />
            </TabsContent>
            <TabsContent value="pending-articles">
              <PostList articles={pendings} />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
