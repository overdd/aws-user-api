import { v4 } from "uuid";
import { request } from "../helpers/app";
import { getAuthToken } from "../helpers/auth";
import { iocContainer } from "../../src/ioc";
import { API_PATH } from "../../config/constants";
import { createUser } from "../../src/util/userHandler";
import { UsersRepository } from "../../src/api/users/UsersRepository";

describe("User", () => {
  const getUsersRepository = () =>
    iocContainer.get<UsersRepository>("UsersRepository");

  describe("POST /user", () => {
    it("responds with 201 status code and newly created user data if user has been created successfully", async () => {
      const requestBody = {
        user: createUser({}),
      };
      const expectedResponseBody = {
        user: {
          ...requestBody.user,
          id: expect.anything(),
          createdAt: expect.anything(),
        },
      };

      const response = await request
        .post(API_PATH.USER)
        .set("Authorization", getAuthToken(v4()))
        .send(requestBody);

      const userFromDB = await getUsersRepository().fetchById(
        response.body.user.id
      );

      expect(response.body).toEqual(expectedResponseBody);
      expect(response.statusCode).toEqual(201);
      expect(typeof response.body.user.id).toEqual("string");
      expect(
        new Date().getTime() - new Date(response.body.user.createdAt).getTime()
      ).toBeLessThan(5000);
      expect(userFromDB).toEqual({
        ...response.body.user,
        createdAt: new Date(response.body.user.createdAt), // reduction createdAt to one type with response
      });
    });

    it("responds with 401 status code and unauthorized error message if auth token is invalid", async () => {
      const response = await request.post(API_PATH.USER).send({
        user: createUser({
          id: undefined,
          createdAt: undefined,
        }),
      });

      expect(response.body).toHaveProperty("type", "UNAUTHORIZED");
      expect(response.statusCode).toEqual(401);
    });

    it("responds with 422 status code and validation error if request body has been invalid", async () => {
      const invalidRequestBody = {
        invalid: {
          invalidField: "invalid value",
        },
        user: {
          invalid: 0,
        },
      };
      const expectedErrorDetails = {
        "reqBody.invalid": {
          message:
            '"invalid" is an excess property and therefore is not allowed',
          value: "invalid",
        },
        "reqBody.user.firstName": {
          message: "'firstName' is required",
        },
        "reqBody.user.invalid": {
          message:
            '"invalid" is an excess property and therefore is not allowed',
          value: "invalid",
        },
        "reqBody.user.lastName": {
          message: "'lastName' is required",
        },
        "reqBody.user.email": {
          message: "'email' is required",
        },
      };

      const response = await request
        .post(API_PATH.USER)
        .set("Authorization", getAuthToken(v4()))
        .send(invalidRequestBody);

      expect(response.statusCode).toEqual(422);
      expect(response.body.details).toEqual(expectedErrorDetails);
    });
  });

  describe("GET /user/{id}", () => {
    it("responds with 200 status code and user data if user exists in database", async () => {
      const newUser = await getUsersRepository().create(createUser());
      const expectedUser = {
        ...newUser,
        createdAt: newUser.createdAt.toISOString(),
      };

      const response = await request
        .get(API_PATH.USER_ID(expectedUser.id))
        .set("Authorization", getAuthToken(expectedUser.id));

      expect(response.body).toEqual({ user: expectedUser });
      expect(response.statusCode).toEqual(200);
    });

    it("responds with 404 status code and error message if user does not exist in database", async () => {
      const notExistingId = v4();
      const uuid = v4();

      const response = await request
        .get(API_PATH.USER_ID(notExistingId))
        .set("Authorization", getAuthToken(uuid));

      expect(response.statusCode).toEqual(404);
      expect(response.body).toHaveProperty("type", "USER_NOT_FOUND");
    });

    it("responds with 401 status code and unauthorized error message if auth token is invalid", async () => {
      const response = await request.get(API_PATH.USER_ID(v4()));

      expect(response.statusCode).toEqual(401);
      expect(response.body).toHaveProperty("type", "UNAUTHORIZED");
    });
  });

  describe("GET /users", () => {
    it("responds with 200 status code and the array of all users", async () => {
      const newUser = await getUsersRepository().create(createUser());

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

  describe("PUT /user/{id}", () => {
    it("responds with 201 status code and user data if user exists in database and request is valid", async () => {
      const oldUserData = createUser({});

      const oldUser = await getUsersRepository().create(oldUserData);
      const newUserData = createUser({
        id: oldUser.id,
        createdAt: oldUser.createdAt,
      });
      const expectedUser = {
        ...oldUser,
        createdAt: oldUser.createdAt.toISOString(),
      };
      const requestBody = {
        user: newUserData,
      };

      const response = await request
        .put(API_PATH.USER_ID(expectedUser.id))
        .set("Authorization", getAuthToken(v4()))
        .send(requestBody);

      const expectedResponseBody = {
        user: {
          ...newUserData,
          id: oldUser.id,
          createdAt: oldUser.createdAt.toISOString(),
        },
      };
      expect(response.statusCode).toEqual(201);
      expect(response.body).toEqual(expectedResponseBody);
    });

    it("responds with 404 status code and error message if user does not exist in database", async () => {
      const notExistingId = v4();
      const uuid = v4();

      const response = await request
        .get(API_PATH.USER_ID(notExistingId))
        .set("Authorization", getAuthToken(uuid));

      expect(response.statusCode).toEqual(404);
      expect(response.body).toHaveProperty("type", "USER_NOT_FOUND");
    });

    it("responds with 401 status code and unauthorized error message if auth token is invalid", async () => {
      const response = await request.put(API_PATH.USER_ID(v4()));
      expect(response.statusCode).toEqual(401);
      expect(response.body).toHaveProperty("type", "UNAUTHORIZED");
    });
  });

  describe("DELETE /user/{id}", () => {
    it("responds with 204 status code if user has been deleted successfully", async () => {
      const newUser = await getUsersRepository().create(
        createUser({
          id: undefined,
          createdAt: undefined,
        })
      );
      const response = await request
        .delete(API_PATH.USER_ID(newUser.id))
        .set("Authorization", getAuthToken(v4()));

      const isDeleted = await getUsersRepository().fetchById(newUser.id);
      expect(response.statusCode).toEqual(204);
      expect(isDeleted).toBeUndefined();
    });

    it("responds with 404 status code and error message if user does not exist in database", async () => {
      const notExistingId = v4();
      const uuid = v4();

      const response = await request
        .delete(API_PATH.USER_ID(notExistingId))
        .set("Authorization", getAuthToken(uuid));

      expect(response.statusCode).toEqual(404);
      expect(response.body).toHaveProperty("type", "USER_NOT_FOUND");
    });

    it("responds with 401 status code and unauthorized error message if auth token is invalid", async () => {
      const response = await request.delete(API_PATH.USER_ID(v4()));
      expect(response.statusCode).toEqual(401);
      expect(response.body).toHaveProperty("type", "UNAUTHORIZED");
    });
  });
});
