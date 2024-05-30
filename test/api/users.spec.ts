import { v4 } from "uuid";
import { request } from "../helpers/app";
import { getAuthToken } from "../helpers/auth";
import { API_PATH } from "../../config/constants";

describe("Users", () => {
  describe("GET /users", () => {
    it("responds with 200 status code and the array of all users", async () => {
      const response = await request
        .get(API_PATH.USERS)
        .set("Authorization", getAuthToken(v4()));

      expect(response.statusCode).toEqual(200);
      expect(response.body.users.length).toBeGreaterThan(0);
    });

    it("responds with 401 status code and unauthorized error message if auth token is invalid", async () => {
      const response = await request.get(API_PATH.USER_ID(v4()));

      expect(response.statusCode).toEqual(401);
      expect(response.body).toHaveProperty("type", "UNAUTHORIZED");
    });
  });
});
