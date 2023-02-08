import { DbAuthentication } from "../../../data/usecases/authentication/db-authentication";
import { BcryptAdapter } from "../../../infra/criptography/bcrypt-adapter/bcrypt-adapter";
import { JwtAdapter } from "../../../infra/criptography/jwt-adapter/jwt-adapter";
import { AccountMongoRepository } from "../../../infra/db/mongodb/account/account-mongo-repository";
import { LogMongoRepository } from "../../../infra/db/mongodb/log/log-mongo-repository";
import { LoginController } from "../../../presentation/controllers/login/login-controller";
import { Controller } from "../../../presentation/protocols";
import env from "../../config/env";
import { LogControllerDecorator } from "../../decorators/log-controller-decorator";
import { makeLoginValidation } from "./login-validation-factory";

export const makeLoginUpController = (): Controller => {
  const bcryptAdapter = new BcryptAdapter(env.salt);
  const jwtAdapter = new JwtAdapter(env.secret);
  const accountRepository = new AccountMongoRepository();

  const dbAuthentication = new DbAuthentication(
    accountRepository,
    bcryptAdapter,
    jwtAdapter,
    accountRepository
  );

  const loginController = new LoginController(
    makeLoginValidation(),
    dbAuthentication
  );

  const logMongoRepository = new LogMongoRepository();

  return new LogControllerDecorator(loginController, logMongoRepository);
};
