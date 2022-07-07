class Users {
  constructor () {
     this.users = [];
  }

  addUser (user_id, socket_id ) {

    // user_id = parseInt(user_id);
    const user = { user_id, socket_id };
    this.users.push(user);
    return user;
  }

  removeUserByUserId (user_id) {
    const user = this.getUserByUserId(user_id);

    if (user) {
      this.users = this.users.filter((user) => user.user_id != user_id);
    }
    return user;
  }
  removeUserBySocketId (socket_id) {
    const user = this.getUserBySocketId(socket_id);

    if (user) {
      this.users = this.users.filter((user) => user.socket_id != socket_id);
    }
    return user;
  }

  getUserByUserId (user_id) {
    return this.users.filter((user) => user.user_id === user_id)[0];
  }
  getUserBySocketId (socket_id) {
    return this.users.filter((user) => user.socket_id === socket_id)[0];
  }

  getUserList () {
    // const namesArray = this.users.map((user) => user.user_id);
    // return namesArray;
    return this.users;
  }
}

module.exports = { Users };
