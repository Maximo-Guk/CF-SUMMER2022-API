import { Request } from 'itty-router';

export default interface requestLocals extends Request {
  locals: {
    userName: string;
  };
}
