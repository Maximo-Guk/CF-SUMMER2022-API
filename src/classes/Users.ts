import randomColor from '../components/randomColor';

export default class Users {
  private userName: string;
  private avatarBackgroundColor!: string;

  constructor(userName: string, avatarBackgroundColor?: string) {
    if (avatarBackgroundColor !== undefined) {
      this.avatarBackgroundColor = avatarBackgroundColor;
    } else {
      this.avatarBackgroundColor = randomColor();
    }
    this.userName = userName;
  }

  public getUserName(): string {
    return this.userName;
  }
  public getAvatarBackgroundColor(): string {
    return this.avatarBackgroundColor;
  }

  toString(): string {
    return JSON.stringify({
      userName: this.getUserName(),
      avatarBackgroundColor: this.getAvatarBackgroundColor(),
    });
  }
}
