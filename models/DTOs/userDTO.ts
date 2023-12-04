class UserDTO {
  id: string;
  nickname: string;

  constructor(id: string, nickname: string) {
    this.id = id;
    this.nickname = nickname;
  }
}

export default UserDTO;
