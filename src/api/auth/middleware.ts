import * as express from "express";
import * as jwt from "jsonwebtoken";
import config from "config";
import securities from "./securities";
import {
  AuthError,
  InvalidTokenError,
  NoTokenProvidedError,
} from "../errors/AuthError";

export type Claims = { uuid: string };
export type AuthenticatedRequest = express.Request & { user: Claims };

export const expressAuthentication = (
  request: express.Request,
  securityName: string,
  scopes?: string[]
): Promise<Claims> => {
  if (securityName === securities.USER_AUTH) {
    const token = removeBearerPrefix(request.headers["authorization"] || "");

    return new Promise((resolve, reject) => {
      if (!token || token === "") {
        return reject(new NoTokenProvidedError());
      }
      jwt.verify(token, config.get("authSecret"), function (err, decoded) {
        if (err) {
          reject(new InvalidTokenError());
        } else {
          resolve(decoded as Claims);
        }
      });
    });
  }

  return Promise.reject(
    new AuthError(
      "security scheme check not implemented, check src/auth/middleware.ts"
    )
  );
};

const removeBearerPrefix = (value: string) => value.slice(7);
