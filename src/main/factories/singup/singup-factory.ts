import { DbAddAccount } from "../../../data/usecases/add-account/db-add-account";
import { BcryptAdapter } from "../../../infra/criptography/bcrypt-adapter/bcrypt-adapter";
import { AccountMongoRepository } from "../../../infra/db/mongodb/account/account-mongo-repository";
import { LogMongoRepository } from "../../../infra/db/mongodb/log/log-mongo-repository";
import { SingUpController } from "../../../presentation/controllers/singup/singup-controller";
import { Controller } from "../../../presentation/protocols";
import env from "../../config/env";
import { LogControllerDecorator } from "../../decorators/log-controller-decorator";
import { makeSingUpValidation } from "./singup-validation-factory";

export const makeSingUpController = (): Controller => {
  const bcryptAdapter = new BcryptAdapter(env.salt);
  const addAccountRepository = new AccountMongoRepository();
  const dbAddAccount = new DbAddAccount(bcryptAdapter, addAccountRepository);

  const singUpController = new SingUpController(
    dbAddAccount,
    makeSingUpValidation()
  );

  const logMongoRepository = new LogMongoRepository();

  return new LogControllerDecorator(singUpController, logMongoRepository);
};
