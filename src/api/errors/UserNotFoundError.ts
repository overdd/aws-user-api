import { ApiError } from "./ApiError";

export class UserNotFoundError extends ApiError {
  constructor() {
    super({
      statusCode: 404,
      type: "USER_NOT_FOUND",
      message: "User not found",
    });
  }
}
