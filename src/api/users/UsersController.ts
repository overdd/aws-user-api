import { inject } from "inversify";
import {
  Body,
  Controller,
  Get,
  Path,
  Route,
  Security,
  SuccessResponse,
} from "tsoa";

import securities from "../auth/securities";
import { provideSingleton } from "../../util/provideSingleton";
import { User, UserResponseBody, UsersResponseBody } from "./User";
import { UsersRepository } from "./UsersRepository";
import { ApiError } from "../errors/ApiError";

@Route("users")
@provideSingleton(UsersController)
export class UsersController extends Controller {
  constructor(
    @inject("UsersRepository") private usersRepository: UsersRepository
  ) {
    super();
  }

  @Security(securities.USER_AUTH)
  @Get()
  public async getUser(): Promise<UsersResponseBody> {
    const users = await this.usersRepository.fetchAll();
    return { users };
  }
}
