export interface Comment {
    body: string;
    author: {
        name: string;
        avatar: string;
        username: string;
    };
    parentComment: Comment | null;
    replies: Comment[];
}