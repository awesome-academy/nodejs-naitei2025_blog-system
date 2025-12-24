"use client";
import { Label } from "@/components/ui/label";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Column, DashboardTable } from "../components/dashboard-table";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { CircleCheck, CircleX, Eye, Pencil, Trash } from "lucide-react";
import { Input } from "@/components/ui/input";
import DashboardDetailModal from "../components/dashboard-detail-modal";
import { Article } from "@/types/article.type";
import { ArticleListItem } from "@/interfaces/article.interface";
import ArticleDetailModal from "../components/modals/detail-modals/ArticleDetailModal";
import ConfirmModal from "@/components/modals/ConfirmModal";
import articleApi from "@/api/article.api";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function Page() {
  const { user } = useAuth();
  const { token } = user || '';
  const [articles, setArticles] = useState<ArticleListItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const columns: Column<ArticleListItem & { actions: string }>[] = [
    {
      key: "title",
      header: "Title",
      render: (value: string, item: ArticleListItem) => {
        return (
          <div className="flex items-center gap-2">
            <Image
              src={item.cover_image || "/article_default.jpg"}
              alt={"blog image"}
              width={40}
              height={40}
              className="size-10 rounded-md object-cover"
            />
            <span className="font-semibold">{value}</span>
          </div>
        );
      },
    },
    {
      key: "author",
      header: "Author",
      render: (value: Article["author"]) => value.name,
    },
    {
      key: "status",
      header: "Status",
      render: (value: string) => {
        switch (value) {
          case "published":
            return <Badge variant="approved">Published</Badge>;
          case "draft":
            return <Badge>Draft</Badge>;
          case "rejected":
            return <Badge variant="destructive">Rejected</Badge>;
          case "pending":
            return <Badge variant="pending">Pending</Badge>;
        }
      },
    },
    {
      key: "updated_at",
      header: "Last Updated",
    },
    {
      key: "actions",
      header: "Actions",
      render: (value: string, item: ArticleListItem) => {
        let buttons;
        if (item.status === "pending") {
          buttons = (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="text-green-700 font-semibold"
                onClick={async () => {
                  console.log(token);
                  setIsLoading(true);
                  const response = await articleApi.approveArticle(
                    item.slug,
                    token
                  );
                  if (response.success) {
                    setArticles((prevArticles) =>
                      prevArticles.map((article) =>
                        article.slug === item.slug
                          ? { ...article, status: "published" }
                          : article
                      )
                    );
                    setIsLoading(false);
                  } else {
                    alert(response.error);
                  }
                }}
              >
                <CircleCheck className="h-4 w-4 mr-2" />
                Approve
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive font-semibold"
                onClick={async () => {
                  setIsLoading(true);
                  const response = await articleApi.rejectArticle(
                    item.slug,
                    token
                  );
                  if (response.success) {
                    setArticles((prevArticles) =>
                      prevArticles.map((article) =>
                        article.slug === item.slug
                          ? { ...article, status: "rejected" }
                          : article
                      )
                    );
                  } else {
                    alert(response.error);
                  }
                  setIsLoading(false);
                }}
              >
                <CircleX className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </>
          );
        } else {
          buttons = (
            <>
              <Button variant="ghost" size="icon">
                <Pencil className="h-4 w-4" />
              </Button>
              <ArticleDetailModal item={item} />
              <ConfirmModal
                triggerButton={
                  <Button variant="ghost" size="icon">
                    <Trash className="h-4 w-4 text-destructive" />
                  </Button>
                }
                action="delete"
                entityType="article"
              />
            </>
          );
        }
        return <div className="flex gap-2">{buttons}</div>;
      },
    },
  ];

  useEffect(() => {
    const fetchArticles = async () => {
      const response = await articleApi.getArticles({});
      if (response.data.items) {
        setArticles(response.data.items);
        setIsLoading(false);
      }
    };
    fetchArticles();
  }, []);

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Label className="text-xl font-semibold">Quản lý bài viết</Label>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4">
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <DashboardTable data={articles} columns={columns} />
        )}
      </div>
    </>
  );
}
