import { v4 } from "uuid";
import { NewUser, User } from "./User";
import { UsersRepository } from "./UsersRepository";
import {
  AttributeValue,
  DynamoDBClient,
  ItemResponse,
  ScanCommand,
} from "@aws-sdk/client-dynamodb";
import { DeleteCommand, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoDBConfig } from "../../../config/constants";
import { unmarshall } from "@aws-sdk/util-dynamodb";

export class UsersRepositoryDynamoDB implements UsersRepository {
  private dynamoDBClient: DynamoDBClient;

  constructor() {
    this.dynamoDBClient = new DynamoDBClient({});
  }

  async create(newUser: NewUser): Promise<User> {
    const user = { ...newUser, id: v4(), createdAt: new Date() };
    const putCommand = new PutCommand({
      TableName: dynamoDBConfig.tables.users,
      Item: {
        id: user.id,
        createdAt: user.createdAt.toISOString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
    await this.dynamoDBClient.send(putCommand);
    return user;
  }

  async fetchById(id: string): Promise<User | undefined> {
    const getCommand = new GetCommand({
      TableName: dynamoDBConfig.tables.users,
      Key: {
        id: id,
      },
    });
    const dbOutput = await this.dynamoDBClient.send(getCommand);
    if (!dbOutput.Item) return;
    return {
      id: dbOutput.Item.id,
      createdAt: new Date(dbOutput.Item.createdAt),
      firstName: dbOutput.Item.firstName,
      lastName: dbOutput.Item.lastName,
      email: dbOutput.Item.email,
    };
  }

  async update(user: User): Promise<User | undefined> {
    const existingUser = await this.fetchById(user.id);
    if (!existingUser) return;
    const putCommand = new PutCommand({
      TableName: dynamoDBConfig.tables.users,
      Item: {
        id: user.id,
        createdAt: user.createdAt.toISOString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
    await this.dynamoDBClient.send(putCommand);
    return user;
  }

  async delete(id: string): Promise<boolean> {
    const existingUser = await this.fetchById(id);
    if (!existingUser) return false;

    const deleteCommand = new DeleteCommand({
      TableName: dynamoDBConfig.tables.users,
      Key: {
        id: id,
      },
    });
    await this.dynamoDBClient.send(deleteCommand);
    return true;
  }

  async fetchAll(): Promise<User[]> {
    const scanCommand = new ScanCommand({
      TableName: dynamoDBConfig.tables.users,
    });
    const dbOutput = await this.dynamoDBClient.send(scanCommand);
    return dbOutput.Items?.map((value) => unmarshall(value) as User) || [];
  }
}
