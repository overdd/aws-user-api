import { publicDecrypt } from "crypto";

export class AuthError extends Error {
  public type = "UNAUTHORIZED";

  constructor(message: string) {
    super(message);
  }

  toJSON() {
    return {
      type: this.type,
      message: this.message,
    };
  }
}

export class NoTokenProvidedError extends AuthError {
  public type = "UNAUTHORIZED";

  constructor(message = "No token provided") {
    super(message);
  }

  toJSON() {
    return {
      type: this.type,
      message: this.message,
    };
  }
}

export class InvalidTokenError extends AuthError {
  public type = "UNAUTHORIZED";

  constructor(message = "Token is not valid") {
    super(message);
  }

  toJSON() {
    return {
      type: this.type,
      message: this.message,
    };
  }
}
