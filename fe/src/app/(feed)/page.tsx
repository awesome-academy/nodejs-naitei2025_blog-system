import PostList from "@/components/PostList";
import { articleList } from "../mock-data/article.mock-data";
import { getAuthServer } from "@/lib/auth-server";
import articleApi from "@/api/article.api";

export default async function Page() {
  let articles = []
  const user = await getAuthServer();
  console.log(user)
  if (user) {
    // Lấy danh sách bài viết từ những người dùng mà user đang follow
    const response = await articleApi.getFeed(user.token);
    console.log(response);
    if (response.success && response.data) {
      articles = response.data.items;
      console.log(response.data)
    }
  }
  return (
    <>
      <h2 className="text-2xl font-bold mt-8">Bài viết mới nhất</h2>
      <PostList articles={articles} />
    </>
  );
}
