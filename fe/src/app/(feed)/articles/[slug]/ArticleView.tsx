'use client';

import { ArticleDetail } from "@/interfaces/article.interface";
import { Comment } from "@/interfaces/comment.interface";
import { useState, useMemo } from "react";
import Image from "next/image";
import commentApi from "@/api/comment.api"; // Import API
import { 
  Heart, 
  MessageCircle, 
  Calendar, 
  Clock, 
  Eye, 
  Share2,
  Send,
  X,
  Loader2 // Import icon loading
} from "lucide-react";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
// import { useToast } from "@/components/ui/use-toast"; // Uncomment nếu dùng toast

interface ArticleViewProps {
  initialArticle: ArticleDetail;
}

type CommentWithChildren = Comment & {
  children: CommentWithChildren[];
};

// --- 1. Component Form Nhập liệu ---
interface CommentFormProps {
  onSubmit: (text: string) => Promise<void>; // Chuyển thành Promise
  onCancel?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  isReply?: boolean;
}

const CommentForm = ({ onSubmit, onCancel, placeholder, autoFocus, isReply }: CommentFormProps) => {
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); // State loading

  const handleSubmit = async () => {
    if (!text.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(text);
      setText(""); // Chỉ clear text khi thành công
      if (onCancel) onCancel();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`flex gap-3 ${isReply ? "mt-4 animate-in fade-in slide-in-from-top-2" : "mb-8"}`}>
      <Avatar className="h-8 w-8 mt-1">
        <AvatarFallback className="bg-primary text-primary-foreground text-xs">ME</AvatarFallback>
      </Avatar>
      <div className="flex-1 gap-2 flex flex-col">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder || "Viết bình luận của bạn..."}
          className="min-h-[80px] resize-none bg-background"
          autoFocus={autoFocus}
          disabled={isSubmitting}
        />
        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel} disabled={isSubmitting}>
              Hủy
            </Button>
          )}
          <Button size="sm" onClick={handleSubmit} disabled={!text.trim() || isSubmitting}>
            {isSubmitting ? <Loader2 className="h-3 w-3 mr-2 animate-spin" /> : <Send className="h-3 w-3 mr-2" />}
            {isReply ? "Trả lời" : "Gửi bình luận"}
          </Button>
        </div>
      </div>
    </div>
  );
};

// --- 2. Component Node Comment ---
interface CommentNodeProps {
  comment: CommentWithChildren;
  formatDate: (d: string) => string;
  activeReplyId: number | null;
  setActiveReplyId: (id: number | null) => void;
  onReplySubmit: (text: string, parentId: number) => Promise<void>;
}

const CommentNode = ({ 
  comment, 
  formatDate, 
  activeReplyId, 
  setActiveReplyId, 
  onReplySubmit 
}: CommentNodeProps) => {
  const isReplying = activeReplyId === comment.id;

  return (
    <div className="flex flex-col gap-3">
      <Card className={`border-none shadow-sm transition-colors ${isReplying ? 'bg-slate-50 dark:bg-slate-900' : 'bg-white dark:bg-slate-950'}`}>
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={comment.author.image} />
              <AvatarFallback>{comment.author.name}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm">{comment.author.username}</span>
                <span className="text-xs text-muted-foreground">{formatDate(comment.created_at)}</span>
              </div>
              <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">{comment.body}</p>
              
              <div className="flex items-center gap-2 mt-2">
                <button 
                  onClick={() => setActiveReplyId(isReplying ? null : comment.id)}
                  className={`text-xs font-medium flex items-center gap-1 transition-colors ${isReplying ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
                >
                  {isReplying ? <X className="h-3 w-3" /> : <MessageCircle className="h-3 w-3" />}
                  {isReplying ? "Đóng" : "Trả lời"}
                </button>
              </div>

              {isReplying && (
                <CommentForm 
                  isReply 
                  autoFocus
                  placeholder={`Trả lời @${comment.author.username}...`}
                  onSubmit={(text) => onReplySubmit(text, comment.id)}
                  onCancel={() => setActiveReplyId(null)}
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {comment.children && comment.children.length > 0 && (
        <div className="pl-4 md:pl-8 border-l-2 border-slate-200 dark:border-slate-800 ml-4 space-y-3">
          {comment.children.map((child) => (
            <CommentNode 
              key={child.id} 
              comment={child} 
              formatDate={formatDate}
              activeReplyId={activeReplyId}
              setActiveReplyId={setActiveReplyId}
              onReplySubmit={onReplySubmit}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// --- 3. Main Component ---
export default function ArticleView({ initialArticle }: ArticleViewProps) {
  const [article, setArticle] = useState<ArticleDetail>(initialArticle);
  const [isLiked, setIsLiked] = useState(false);
  const [activeReplyId, setActiveReplyId] = useState<number | null>(null);
  // const { toast } = useToast(); // Uncomment nếu dùng toast
  const { user } = useAuth();
  const { token } = user || "";

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setArticle((prev) => ({
      ...prev,
      favorites_count: isLiked ? prev.favorites_count - 1 : prev.favorites_count + 1,
    }));
  };

  // --- TÍCH HỢP API Ở ĐÂY ---
  const handleAddComment = async (text: string, parentId: number | null = null) => {
    try {
      let response;
      
      if (parentId) {
        // Case 1: Reply comment
        response = await commentApi.addReply(parentId, text, token);
      } else {
        // Case 2: Root comment (cần slug)
        response = await commentApi.addComment(article.slug, text, token);
      }

      if (response.data) {
        const newComment = response.data;
        
        // Cập nhật state với dữ liệu thật từ server
        setArticle(prev => ({
          ...prev,
          comments: [newComment, ...prev.comments], // Thêm vào đầu danh sách
          comments_count: prev.comments_count + 1
        }));

        setActiveReplyId(null);
      }
    } catch (error: any) {
      console.error("Lỗi khi đăng bình luận:", error);
      // toast({ title: "Lỗi", description: error.message, variant: "destructive" });
      alert("Có lỗi xảy ra khi đăng bình luận: " + (error.message || "Unknown error"));
    }
  };

  // Logic chuyển đổi Flat List -> Tree Structure (Giữ nguyên)
  const commentTree = useMemo(() => {
    const comments = article.comments || [];
    const map: Record<number, CommentWithChildren> = {};
    const roots: CommentWithChildren[] = [];

    comments.forEach((c) => {
      map[c.id] = { ...c, children: [] };
    });

    comments.forEach((c) => {
      const node = map[c.id];
      if (c.parentId && map[c.parentId]) {
        map[c.parentId].children.push(node);
      } else {
        roots.push(node);
      }
    });

    const sortComments = (nodes: CommentWithChildren[]) => {
      nodes.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      nodes.forEach(node => {
        if (node.children.length > 0) sortComments(node.children);
      });
    };

    sortComments(roots);
    return roots;
  }, [article.comments]);

  return (
    <div className="container max-w-4xl mx-auto py-10 px-4">
      {/* Header & Content (Giữ nguyên) */}
      <div className="space-y-6 mb-10">
        <div className="space-y-2">
          <div className="flex gap-2 mb-4">
            {article.tagList.map((tag) => (
              <Badge key={tag} variant="secondary">#{tag}</Badge>
            ))}
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">{article.title}</h1>
          <p className="text-xl text-muted-foreground italic border-l-4 border-primary/20 pl-4 py-1">{article.description}</p>
        </div>
        
        {/* Author Info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-y">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
              <AvatarImage src={article.author.image} />
              <AvatarFallback>{article.author.name}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">{article.author.name}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{formatDate(article.created_at)}</span>
                <span>•</span>
                <span>{article.reading_time} phút đọc</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {article.cover_image && (
        <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-md mb-10">
          <Image src={article.cover_image} alt={article.title} fill className="object-cover" priority />
        </div>
      )}

      <article 
        className="prose prose-lg prose-slate dark:prose-invert max-w-none mb-12"
        dangerouslySetInnerHTML={{ __html: article.body }}
      />

      <Separator className="my-8" />

      {/* Actions */}
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-4">
          <Button variant={isLiked ? "default" : "secondary"} size="lg" onClick={handleLike} className="gap-2">
            <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
            {article.favorites_count} Yêu thích
          </Button>
          <Button variant="ghost" size="lg" className="gap-2">
            <MessageCircle className="h-5 w-5" />
            {article.comments_count} Bình luận
          </Button>
        </div>
      </div>

      {/* Comments Section */}
      <div className="space-y-6 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl">
        <h3 className="text-2xl font-bold tracking-tight">
          Bình luận <span className="text-muted-foreground text-lg font-normal">({article.comments_count})</span>
        </h3>

        {/* Form nhập comment gốc */}
        <CommentForm onSubmit={(text) => handleAddComment(text, null)} />
        
        <div className="space-y-4">
          {commentTree.length > 0 ? (
            commentTree.map((rootComment) => (
              <CommentNode 
                key={rootComment.id} 
                comment={rootComment} 
                formatDate={formatDate}
                activeReplyId={activeReplyId}
                setActiveReplyId={setActiveReplyId}
                onReplySubmit={handleAddComment}
              />
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Chưa có bình luận nào. Hãy là người đầu tiên bình luận về bài viết này!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}