import { Request } from 'itty-router';

export default interface requestCommentId extends Request {
  locals: {
    userName: string;
  };
  params: {
    postId: string;
    commentId: string;
  };
}
