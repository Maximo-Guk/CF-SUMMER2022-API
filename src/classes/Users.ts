import randomColor from '../components/randomColor';

export default class Users {
  private userName: string;
  private avatarBackgroundColor!: string;

  // take note that avatarBackgroundColor is an optional parameter,
  // when Users object is first created it will not have avatarBackgroundColor,
  // avatarBackgroundUrl is only generated once constructed for the first time,
  // later on, will be retrieved from KV so won't be optional anymore
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
