import { DbAddAccount } from "../../data/usecases/add-account/db-add-account";
import { BcryptAdapter } from "../../infra/criptography/bcrypt-adapter";
import { AccountMongoRepository } from "../../infra/db/mongodb/account-repository/account";
import { SingUpController } from "../../presentation/controllers/singup/singup";
import { Controller } from "../../presentation/protocols";
import { EmailValidatorAdapter } from "../../utils/email-validator-adapter";
import { LogControllerDecorator } from "../decorators/log";

export const makeSingUpController = (): Controller => {
  const salt = 12;
  const bcryptAdapter = new BcryptAdapter(salt);
  const addAccountRepository = new AccountMongoRepository();

  const dbAddAccount = new DbAddAccount(bcryptAdapter, addAccountRepository);
  const emailValidatorAdapter = new EmailValidatorAdapter();

  const singUpController = new SingUpController(
    emailValidatorAdapter,
    dbAddAccount
  );
  return new LogControllerDecorator(singUpController);
};
