import { Request } from 'itty-router';

export default interface requestPostId extends Request {
  params: {
    postId: string;
  };
}
