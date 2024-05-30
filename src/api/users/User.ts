export interface User {
  id: string;
  createdAt: Date;
  firstName: string;
  lastName: string;
  email: string;
}

export interface NewUser extends Omit<User, "id" | "createdAt"> {}

export interface UserRequestBody {
  user: NewUser;
}

export interface UserUpdateRequestBody {
  user: User;
}

export interface UserResponseBody {
  user: User;
}

export interface UsersResponseBody {
  users: User[];
}
