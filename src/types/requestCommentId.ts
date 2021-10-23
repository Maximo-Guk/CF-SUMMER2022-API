import { Request } from 'itty-router';

export default interface requestCommentId extends Request {
  params: {
    postId: string;
    commentId: string;
  };
}
