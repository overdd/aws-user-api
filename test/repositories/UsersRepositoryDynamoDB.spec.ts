import { AttributeValue, DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { NewUser, User } from "../../src/api/users/User";
import { UsersRepositoryDynamoDB } from "../../src/api/users/UsersRepositoryDynamoDB";
import { createUser } from "../../src/util/userHandler";
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoDBConfig } from "../../config/constants";
import { v4 } from "uuid";

const getRepository = () => new UsersRepositoryDynamoDB();

describe("UsersRepositoryDynamoDB tests", () => {
  describe("create() method", () => {
    it("stores a NewUser in the DynamoDB and returns User with newly generated id and actual createdAt date", async () => {
      const newUser: NewUser = createUser({
        id: undefined,
        createdAt: undefined,
      });

      const actual = await getRepository().create(newUser);

      const dynamoDBClient = new DynamoDBClient({});
      const command = new GetCommand({
        TableName: dynamoDBConfig.tables.users,
        Key: {
          id: actual.id,
        },
      });
      const dbOutput = await dynamoDBClient.send(command);
      const user = dbOutput.Item as Record<string, AttributeValue>;
      expect(user).not.toBeUndefined();
      expect(user).not.toBeNull();
      expect(user.id).toEqual(actual.id);
    });
  });

  describe("fetchById() method", () => {
    it("returns a user details object if userId exists", async () => {
      const newUser: NewUser = createUser({
        id: undefined,
        createdAt: undefined,
      });
      const actualCreate = await getRepository().create(newUser);
      const actualFetch = (await getRepository().fetchById(
        actualCreate.id
      )) as User;
      expect(actualCreate).toEqual(actualFetch);
    });

    it("returns undefined if userId doesn't exist", async () => {
      const actual = await getRepository().fetchById(v4());
      expect(actual).toBeUndefined();
    });
  });

  describe("update() method", () => {
    it("updates existing User in DB if user.id actually exists", async () => {
      const newUser: NewUser = createUser({
        id: undefined,
        createdAt: undefined,
      });
      const actualCreatedUser = await getRepository().create(newUser);
      const updatedUserData = {
        ...actualCreatedUser,
        firstName: "updated",
        lastName: "updated",
      };
      await getRepository().update(updatedUserData);
      const fetchedUpdatedUser = await getRepository().fetchById(
        updatedUserData.id
      );
      expect(fetchedUpdatedUser?.firstName).toEqual("updated");
      expect(fetchedUpdatedUser?.lastName).toEqual("updated");
    });

    it("returns undefined if user id doesn't exist", async () => {
      const newUser: NewUser = createUser({
        id: v4(),
        createdAt: undefined,
      });

      const actual = await getRepository().update(newUser as User);
      expect(actual).toBeUndefined();
    });
  });

  describe("delete() method", () => {
    it("returns true if user with given id existed and it was deleted successfully", async () => {
      const newUser: NewUser = createUser({
        id: undefined,
        createdAt: undefined,
      });
      const actualCreate = await getRepository().create(newUser);
      const isDeleted: boolean = await getRepository().delete(actualCreate.id);
      expect(isDeleted).toBeTruthy();

      const actualFetch = await getRepository().fetchById(actualCreate.id);
      expect(actualFetch).toBeUndefined();
    });

    it("returns false if user id doesn't exist", async () => {
      const isDeleted: boolean = await getRepository().delete(v4());
      expect(isDeleted).toBeFalsy();
    });
  });

  describe("fetchAll() method", () => {
    it("returns all users from the DB as an array", async () => {
      const newUserA: NewUser = createUser({
        id: undefined,
        createdAt: undefined,
      });
      const newUserB: NewUser = createUser({
        id: undefined,
        createdAt: undefined,
      });
      const actualCreateA = await getRepository().create(newUserA);
      const actualCreateB = await getRepository().create(newUserB);
      const actualFetch = await getRepository().fetchAll();
      expect(actualFetch.length).toBeGreaterThan(1);
    });
  });
});
