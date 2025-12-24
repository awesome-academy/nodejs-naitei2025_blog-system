import articleApi from "@/api/article.api";
import ArticleView from "./ArticleView";

// Đây là Server Component (không có 'use client')
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Fetch dữ liệu mới nhất từ server mỗi khi user truy cập trang này
  const response = await articleApi.getArticleBySlug(slug);

  if (!response.data) {
    return <div>Không tìm thấy bài viết</div>;
  }

  // Truyền dữ liệu ban đầu xuống Client Component
  return <ArticleView initialArticle={response.data} />;
}