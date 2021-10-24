import { Request } from 'itty-router';

export default interface requestPostId extends Request {
  locals: {
    userName: string;
  };
  params: {
    postId: string;
  };
}
