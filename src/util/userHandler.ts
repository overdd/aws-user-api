import Chance from "chance";
import { NewUser, User } from "../api/users/User";
import { v4 } from "uuid";

const chance = new Chance();

export const createUser = (user?: Partial<User>): NewUser => ({
  firstName: chance.first(),
  lastName: chance.last(),
  email: chance.email(),
  ...user,
});
