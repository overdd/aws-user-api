import { User, NewUser } from "./User";

export interface UsersRepository {
  create(newUser: NewUser): Promise<User>;
  fetchById(id: string): Promise<User | undefined>;
  update(user: User): Promise<User | undefined>;
  delete(id: string): Promise<boolean>;
  fetchAll(): Promise<User[]>;
}
