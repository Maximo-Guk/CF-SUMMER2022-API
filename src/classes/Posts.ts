import { v1 as uuidv1 } from 'uuid';

export default class Posts {
  private title: string;
  private userName: string;
  private content: string;
  private id = uuidv1();
  constructor(title: string, userName: string, content: string) {
    this.title = title;
    this.userName = userName;
    this.content = content;
  }
  public getTitle(): string {
    return this.title;
  }
  public getUserName(): string {
    return this.userName;
  }
  public getContent(): string {
    return this.content;
  }
  public getId(): string {
    return this.id;
  }
  public setTitle(title: string): void {
    this.title = title;
  }
  public setUserName(userName: string): void {
    this.userName = userName;
  }
  public setContent(content: string): void {
    this.content = content;
  }
  toString(): string {
    return JSON.stringify({
      title: this.getTitle(),
      userName: this.getUserName(),
      content: this.getContent(),
    });
  }
}
