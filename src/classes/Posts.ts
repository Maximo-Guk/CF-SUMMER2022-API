import { v1 as uuidv1 } from 'uuid';
import uuidValidateV1 from '../components/uuidValidateV1';
import ValidationError from './ValidationError';

declare const POSTS: KVNamespace;

interface reactionsTypes {
  type: string;
  userName: string;
}

interface commentsTypes {
  commentId: string;
  content: string;
  userName: string;
  upVotes: string[];
  reactions: reactionsTypes[];
}

export default class Posts {
  private postId!: string;
  private title: string;
  private userName: string;
  private content: string;
  private upVotes: string[] = [];
  private reactions = [] as reactionsTypes[];
  private comments = [] as commentsTypes[];

  constructor(
    title: string,
    userName: string,
    content: string,
    upVotes: string[],
    reactions: reactionsTypes[],
    comments: commentsTypes[],
    postId?: string,
  ) {
    if (postId !== undefined && uuidValidateV1(postId)) {
      this.postId = postId;
    } else {
      this.postId = uuidv1();
    }
    this.title = title;
    this.userName = userName;
    this.content = content;
    this.upVotes = upVotes;
    this.reactions = reactions;
    this.comments = comments;
  }

  //getters
  public getTitle(): string {
    return this.title;
  }
  public getUserName(): string {
    return this.userName;
  }
  public getContent(): string {
    return this.content;
  }
  public getPostId(): string {
    return this.postId;
  }
  public getUpvotes(): string[] {
    return this.upVotes;
  }
  public getReactions(): reactionsTypes[] {
    return this.reactions;
  }
  public getComments(): commentsTypes[] {
    return this.comments;
  }
  //setters
  public setTitle(title: string): void {
    this.title = title;
  }
  public setContent(content: string): void {
    this.content = content;
  }

  //post upvoting

  public async addUpvote(userName: string): Promise<void> {
    const newUpvotes = this.getUpvotes();
    if (newUpvotes.includes(userName)) {
      throw new ValidationError('User has already upvoted', 400);
    }
    newUpvotes.push(userName);
    this.upVotes = newUpvotes;
    POSTS.put(this.getPostId(), this.toString());
  }

  public async removeUpvote(userName: string): Promise<void> {
    const newUpvotes = this.getUpvotes();
    if (!newUpvotes.includes(userName)) {
      throw new ValidationError('User has not upvoted this post', 400);
    }
    newUpvotes.splice(newUpvotes.indexOf(userName, 1));
    this.upVotes = newUpvotes;
    POSTS.put(this.getPostId(), this.toString());
  }

  //end of post upvoting

  //post reactions

  public async addReaction(userName: string, type: string): Promise<void> {
    const newReactions = this.getReactions();
    newReactions.forEach((reaction) => {
      if (reaction.userName === userName) {
        throw new ValidationError('User has already reacted', 400);
      }
    });
    newReactions.push({ userName: userName, type: type });
    this.reactions = newReactions;
    POSTS.put(this.getPostId(), this.toString());
  }

  public async removeReaction(userName: string): Promise<void> {
    const newReactions = this.getReactions();
    newReactions.forEach((reaction, index) => {
      if (reaction.userName === userName) {
        newReactions.splice(index, 1);
        this.reactions = newReactions;
        POSTS.put(this.getPostId(), this.toString());
        return;
      }
    });
    throw new ValidationError('User has not reacted', 400);
  }

  //end of post reactions

  //comment section

  public async addComment(userName: string, content: string): Promise<void> {
    const newComments = this.getComments();
    newComments.push({
      commentId: uuidv1(),
      userName: userName,
      content: content,
      upVotes: [],
      reactions: [],
    });
    this.comments = newComments;
    POSTS.put(this.getPostId(), this.toString());
  }

  public async removeComment(userName: string): Promise<void> {
    const newComments = this.getComments();
    newComments.forEach((comment, index) => {
      if (comment.userName === userName) {
        newComments.splice(index, 1);
        this.comments = newComments;
        POSTS.put(this.getPostId(), this.toString());
        return;
      }
    });

    throw new ValidationError('User has not commented', 400);
  }

  //comment upvote

  public async addCommentUpVote(userName: string, commentId: string): Promise<void> {
    const newCommentUpVote = this.getComments();
    newCommentUpVote.forEach((comment, index) => {
      if (comment.upVotes.includes(userName) && comment.commentId === commentId) {
        throw new ValidationError('User has already upvoted this comment', 400);
      } else if (comment.commentId === commentId) {
        newCommentUpVote[index].upVotes.push(userName);
      }
    });
    this.comments = newCommentUpVote;
    POSTS.put(this.getPostId(), this.toString());
  }

  public async removeCommentUpVote(userName: string, commentId: string): Promise<void> {
    const newCommentUpVote = this.getComments();
    newCommentUpVote.forEach((comment, index) => {
      if (comment.upVotes.includes(userName) && comment.commentId === commentId) {
        newCommentUpVote[index].upVotes.splice(
          newCommentUpVote[index].upVotes.indexOf(userName, 1),
        );
        return;
      } else if (comment.commentId === commentId) {
        throw new ValidationError('User has not upvoted this comment', 400);
      }
    });
    this.comments = newCommentUpVote;
    POSTS.put(this.getPostId(), this.toString());
  }

  //end of comment upvote

  //comment reaction

  public async addCommentReaction(
    userName: string,
    commentId: string,
    type: string,
  ): Promise<void> {
    const newCommentReaction = this.getComments();
    newCommentReaction.forEach((comment, index) => {
      comment.reactions.forEach((reaction) => {
        if (comment.commentId === commentId && reaction.userName === userName) {
          throw new ValidationError('User has already reacted to this comment', 400);
        } else if (comment.commentId) {
          newCommentReaction[index].reactions.push({ userName: userName, type: type });
        }
      });
    });
    this.comments = newCommentReaction;
    POSTS.put(this.getPostId(), this.toString());
  }

  public async removeCommentReaction(userName: string, commentId: string): Promise<void> {
    const newCommentReaction = this.getComments();
    newCommentReaction.forEach((comment, index) => {
      comment.reactions.forEach((reaction, index2) => {
        if (comment.commentId === commentId && reaction.userName === userName) {
          newCommentReaction[index].reactions.splice(index2, 1);
          this.comments = newCommentReaction;
          POSTS.put(this.getPostId(), this.toString());
          return;
        } else if (comment.commentId) {
          throw new ValidationError('User has not reacted to this comment', 400);
        }
      });
    });
  }

  //end of comment reaction

  //end of comment section

  toString(): string {
    return JSON.stringify({
      title: this.getTitle(),
      userName: this.getUserName(),
      content: this.getContent(),
      upVotes: this.getUpvotes().toString(),
      reactions: this.getReactions().toString(),
      comments: this.getComments().toString(),
    });
  }
}
