import { Container, decorate, injectable } from "inversify";
import { buildProviderModule } from "inversify-binding-decorators";
import { Controller } from "tsoa";
import { UsersRepository } from "./api/users/UsersRepository";
import { UsersRepositoryDynamoDB } from "./api/users/UsersRepositoryDynamoDB";

const iocContainer = new Container();

decorate(injectable(), Controller);

iocContainer.load(buildProviderModule());

iocContainer
  .bind<UsersRepository>("UsersRepository")
  .toDynamicValue(() => new UsersRepositoryDynamoDB());

export { iocContainer };
