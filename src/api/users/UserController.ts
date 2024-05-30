import { inject } from "inversify";
import {
  Body,
  Controller,
  Delete,
  Get,
  Path,
  Post,
  Put,
  Route,
  Security,
  SuccessResponse,
} from "tsoa";

import securities from "../auth/securities";
import { provideSingleton } from "../../util/provideSingleton";
import {
  User,
  UserRequestBody,
  UserResponseBody,
  UserUpdateRequestBody,
} from "./User";
import { UsersRepository } from "./UsersRepository";
import { ApiError } from "../ApiError";

@Route("user")
@provideSingleton(UserController)
export class UserController extends Controller {
  constructor(
    @inject("UsersRepository") private usersRepository: UsersRepository
  ) {
    super();
  }

  @Security(securities.USER_AUTH)
  @Get("{id}")
  public async getUser(@Path("id") id: string): Promise<UserResponseBody> {
    const user = (await this.usersRepository.fetchById(id)) as User;
    if (!user) {
      throw new ApiError({
        statusCode: 404,
        type: "USER_NOT_FOUND",
      });
    }
    return { user };
  }

  @SuccessResponse(201)
  @Security(securities.USER_AUTH)
  @Post()
  public async postUser(
    @Body() reqBody: UserRequestBody
  ): Promise<UserResponseBody> {
    const user = await this.usersRepository.create(reqBody.user);
    return { user };
  }

  @SuccessResponse(201)
  @Security(securities.USER_AUTH)
  @Put("{id}")
  public async putUser(
    @Path("id") id: string,
    @Body() reqBody: UserUpdateRequestBody
  ): Promise<UserResponseBody> {
    const user = await this.usersRepository.update(reqBody.user);
    if (!user) {
      throw new ApiError({
        statusCode: 404,
        type: "USER_NOT_FOUND",
      });
    }
    return { user };
  }

  @Security(securities.USER_AUTH)
  @Delete("{id}")
  public async deleteUser(@Path("id") id: string): Promise<void> {
    const user = await this.usersRepository.fetchById(id);
    if (!user) {
      throw new ApiError({
        statusCode: 404,
        type: "USER_NOT_FOUND",
      });
    }
    await this.usersRepository.delete(id);
  }
}
