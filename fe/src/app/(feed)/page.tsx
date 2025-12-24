import PostList from "@/components/PostList";
import { articleList } from "../mock-data/article.mock-data";

export default function Page() {
  const articles = articleList;
  return (
    <>
      <h2 className="text-2xl font-bold mt-8">Bài viết mới nhất</h2>
      <PostList articles={articles} />
    </>
  );
}
