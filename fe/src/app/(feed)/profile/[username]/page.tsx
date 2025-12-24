import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation"; // Import thêm
import userApi from "@/api/user.api";
import PostList from "@/components/PostList";
import { ArticleListItem } from "@/interfaces/article.interface";
import { UserDetail } from "@/interfaces/user.interface";
import articleApi from "@/api/article.api";

export default async function Page({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || "";

  let user: UserDetail | null = null;
  let errorMsg = "";

  if (username === "me") {
    // Middleware đã lo việc check !token rồi, nên ở đây chắc chắn có token string
    // Nhưng ta cần check xem token đó gọi API có sống không

    const response = await userApi.getMe(token);

    if (response.success && response.data) {
      user = response.data;
    } else {
      // CASE QUAN TRỌNG: Có token nhưng API trả lỗi (Token hết hạn/Fake)
      // Redirect về login để user đăng nhập lại
      redirect("/login");
    }
  } else {
    // Logic xem profile người khác giữ nguyên
    const response = await userApi.getProfile(token, username);
    if (response.success && response.data) {
      user = response.data;
    } else {
      return notFound();
    }
  }

  // 2. Kiểm tra nếu user vẫn null (do lỗi API ở case 'me')
  if (!user) {
    return <div className="p-4 text-red-500">Lỗi: {errorMsg}</div>;
  }

  // 3. Phân loại bài viết an toàn (Safe Destructuring)
  // Dùng toán tử ?. và ?? [] để tránh lỗi nếu articles null
  const response = await articleApi.getArticleByAuthor(user.username, 100, 0, token);
  if (!response.success || !response.data) {
    return <div className="p-4 text-red-500">Lỗi tải bài viết.</div>;
  }
  const articles: ArticleListItem[] = response.data.items;

  const drafts = articles.filter((a) => a.status === "draft");
  const published = articles.filter((a) => a.status === "published");
  const pendings = articles.filter((a) => a.status === "pending");
  let favorited: ArticleListItem[] = [];
  const favoritedResponse = await articleApi.getArticleByFavorited(
    user.username,
    100,
    0,
    token
  );
  if (favoritedResponse.success && favoritedResponse.data) {
    favorited = favoritedResponse.data.items;
  }

  // 4. Xác định xem đây có phải là profile của chính người đang xem không
  // username === 'me' HOẶC username trên url trùng với username trong data trả về (trường hợp user đã login xem profile của chính mình qua url public)
  // Lưu ý: Logic này tương đối, tốt nhất API getProfile nên trả về trường `isOwner`
  const isOwnProfile = username === "me"; // Cần logic so sánh chuẩn xác hơn nếu có thông tin currentUser

  return (
    <div className="container mx-auto py-6">
      {/* Phần Header Profile (Avatar, Bio...) nên đặt ở đây */}
      <h1 className="text-2xl font-bold mb-4">{user.username}</h1>

      <Tabs defaultValue="published-articles" className="w-full">
        <TabsList>
          <TabsTrigger value="published-articles">Đã xuất bản</TabsTrigger>
          <TabsTrigger value="favorited-articles">Đã thích</TabsTrigger>

          {/* 5. Chỉ hiển thị Nháp và Chờ duyệt nếu là Chính chủ */}
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
