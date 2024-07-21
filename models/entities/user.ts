interface IUser {
  _id?: string;
  email: string;
  password: string;
  nickname: string;
}

class User implements IUser {
  _id?: string | undefined;
  email: string;
  password: string;
  nickname: string;

  constructor(email: string, password: string, nickname: string) {
    this.email = email;
    this.password = password;
    this.nickname = nickname;
  }
}

export { User, IUser };
