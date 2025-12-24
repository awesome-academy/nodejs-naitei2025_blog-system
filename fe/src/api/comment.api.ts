import { Comment } from "@/interfaces/comment.interface";
import http from "@/lib/http";

const commentApi = {
  // SỬA: Gửi object { body: string } thay vì string trần
  addComment: async (slug: string, body: string, token: string) =>
    http.post<Comment>(`/comments/${slug}/comment`, { body }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }),

  addReply: async (parentId: number, body: string, token: string) =>
    http.post<Comment>(`/comments/${parentId}/replies`, { body }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }),
};

export default commentApi;