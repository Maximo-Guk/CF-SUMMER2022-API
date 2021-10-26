import { v1 as uuidv1 } from 'uuid';
import uuidValidateV1 from '../components/uuidValidateV1';
import ValidationError from './ValidationError';

declare const POSTS: KVNamespace;

interface reactionsTypes {
  '😀': string[];
  '😂': string[];
  '😭': string[];
  '🥰': string[];
  '😍': string[];
  '🤢': string[];
}

interface commentsTypes {
  commentId: string;
  content: string;
  userName: string;
  userBackgroundColor: string;
  upVotes: string[];
  reactions: reactionsTypes;
  createdAt: string;
}

export default class Posts {
  private postId!: string;
  private title: string;
  private userName: string;
  private userBackgroundColor: string;
  private content: string;
  private photo: string;
  private upVotes: string[] = [];
  private reactions = {
    '😀': [],
    '😂': [],
    '😭': [],
    '🥰': [],
    '😍': [],
    '🤢': [],
  } as reactionsTypes;
  private comments = [] as commentsTypes[];
  private createdAt: string;

  constructor(
    title: string,
    userName: string,
    userBackgroundColor: string,
    content: string,
    photo: string,
    upVotes: string[],
    reactions: reactionsTypes,
    comments: commentsTypes[],
    createdAt: string,
    postId?: string,
  ) {
    if (postId !== undefined && uuidValidateV1(postId)) {
      this.postId = postId;
    } else {
      this.postId = uuidv1();
    }
    this.title = title;
    this.userName = userName;
    this.userBackgroundColor = userBackgroundColor;
    this.content = content;
    this.photo = photo;
    this.upVotes = upVotes;
    this.reactions = reactions;
    this.comments = comments;
    this.createdAt = createdAt;
  }

  //getters
  public getPostId(): string {
    return this.postId;
  }
  public getTitle(): string {
    return this.title;
  }
  public getUserName(): string {
    return this.userName;
  }
  public getUserBackgroundColor(): string {
    return this.userBackgroundColor;
  }
  public getContent(): string {
    return this.content;
  }
  public getPhoto(): string {
    return this.photo;
  }
  public getUpvotes(): string[] {
    return this.upVotes;
  }
  public getReactions(): reactionsTypes {
    return this.reactions;
  }
  public getComments(): commentsTypes[] {
    return this.comments;
  }
  public getCreatedAt(): string {
    return this.createdAt;
  }
  //setters
  public setTitle(title: string): void {
    this.title = title;
    POSTS.put(this.getPostId(), this.toString());
  }
  public setContent(content: string): void {
    this.content = content;
    POSTS.put(this.getPostId(), this.toString());
  }
  public setPhoto(photo: string): void {
    this.photo = photo;
    POSTS.put(this.getPostId(), this.toString());
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
    if (newReactions[type as '😀'].includes(userName)) {
      throw new ValidationError('User has already reacted', 400);
    }
    newReactions[type as '😀'].push(userName);
    this.reactions = newReactions;
    POSTS.put(this.getPostId(), this.toString());
  }

  public async removeReaction(userName: string, type: string): Promise<void> {
    const newReactions = this.getReactions();
    if (!newReactions[type as '😀'].includes(userName)) {
      throw new ValidationError('User has not reacted', 400);
    }
    newReactions[type as '😀'].splice(newReactions[type as '😀'].indexOf(userName, 1));
    this.reactions = newReactions;
    POSTS.put(this.getPostId(), this.toString());
  }

  //end of post reactions

  //comment section

  public async addComment(userName: string, userBackgroundColor: string, content: string): Promise<void> {
    const newComments = this.getComments();
    newComments.push({
      commentId: uuidv1(),
      userName: userName,
      userBackgroundColor: userBackgroundColor,
      content: content,
      upVotes: [],
      reactions: {
        '😀': [],
        '😂': [],
        '😭': [],
        '🥰': [],
        '😍': [],
        '🤢': [],
      } as reactionsTypes,
      createdAt: Date.now().toString(),
    });
    this.comments = newComments;
    POSTS.put(this.getPostId(), this.toString());
  }

  public async removeComment(userName: string, commentId: string): Promise<void> {
    const newComments = this.getComments();
    for (const [index, comment] of newComments.entries()) {
      if (comment.commentId === commentId && comment.userName === userName) {
        newComments.splice(index, 1);
        this.comments = newComments;
        POSTS.put(this.getPostId(), this.toString());
        return;
      } else if (comment.commentId === commentId) {
        throw new ValidationError('User has not commented', 400);
      }
    }
    throw new ValidationError('Comment not found', 404);
  }

  //comment upvote

  public async addCommentUpVote(userName: string, commentId: string): Promise<void> {
    const newCommentUpVote = this.getComments();
    for (const [index, comment] of newCommentUpVote.entries()) {
      if (comment.commentId === commentId && comment.upVotes.includes(userName)) {
        throw new ValidationError('User has already upvoted this comment', 400);
      } else if (comment.commentId === commentId) {
        newCommentUpVote[index].upVotes.push(userName);
        this.comments = newCommentUpVote;
        POSTS.put(this.getPostId(), this.toString());
        return;
      }
    }
    throw new ValidationError('Comment not found', 404);
  }

  public async removeCommentUpVote(userName: string, commentId: string): Promise<void> {
    const newCommentUpVote = this.getComments();
    for (const [index, comment] of newCommentUpVote.entries()) {
      if (comment.commentId === commentId && comment.upVotes.includes(userName)) {
        newCommentUpVote[index].upVotes.splice(
          newCommentUpVote[index].upVotes.indexOf(userName, 1),
        );
        this.comments = newCommentUpVote;
        POSTS.put(this.getPostId(), this.toString());
        return;
      } else if (comment.commentId === commentId) {
        throw new ValidationError('User has not upvoted this comment', 400);
      }
    }
    throw new ValidationError('Comment not found', 404);
  }

  //end of comment upvote

  //comment reaction

  public async addCommentReaction(
    userName: string,
    commentId: string,
    type: string,
  ): Promise<void> {
    const newCommentReaction = this.getComments();
    for (const [index, comment] of newCommentReaction.entries()) {
      if (
        comment.commentId === commentId &&
        comment.reactions[type as '😀'].includes(userName)
      ) {
        throw new ValidationError('User has already reacted to this comment', 400);
      } else if (comment.commentId === commentId) {
        newCommentReaction[index].reactions[type as '😀'].push(userName);
        this.comments = newCommentReaction;
        POSTS.put(this.getPostId(), this.toString());
        return;
      }
    }
    throw new ValidationError('Comment not found', 404);
  }

  public async removeCommentReaction(
    userName: string,
    commentId: string,
    type: string,
  ): Promise<void> {
    const newCommentReaction = this.getComments();
    for (const [index, comment] of newCommentReaction.entries()) {
      if (
        comment.commentId === commentId &&
        comment.reactions[type as '😀'].includes(userName)
      ) {
        newCommentReaction[index].reactions[type as '😀'].splice(
          newCommentReaction[index].reactions[type as '😀'].indexOf(userName, 1),
        );
        this.comments = newCommentReaction;
        POSTS.put(this.getPostId(), this.toString());
        return;
      } else if (comment.commentId === commentId) {
        throw new ValidationError('User has not reacted to this comment', 400);
      }
    }
    throw new ValidationError('Comment not found', 404);
  }

  //end of comment reaction

  //end of comment section

  toString(): string {
    return JSON.stringify({
      postId: this.getPostId(),
      title: this.getTitle(),
      userName: this.getUserName(),
      userBackgroundColor: this.getUserBackgroundColor(),
      content: this.getContent(),
      photo: this.getPhoto(),
      upVotes: this.getUpvotes(),
      reactions: this.getReactions(),
      comments: this.getComments(),
      createdAt: this.getCreatedAt(),
    });
  }
}
