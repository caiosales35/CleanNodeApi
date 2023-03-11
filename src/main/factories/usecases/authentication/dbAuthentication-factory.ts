import { DbAuthentication } from "../../../../data/usecases/authentication/db-authentication";
import { Authentication } from "../../../../domain/usecases/authentication";
import { BcryptAdapter } from "../../../../infra/criptography/bcrypt-adapter/bcrypt-adapter";
import { JwtAdapter } from "../../../../infra/criptography/jwt-adapter/jwt-adapter";
import { AccountMongoRepository } from "../../../../infra/db/mongodb/account/account-mongo-repository";
import env from "../../../config/env";

export const makeDbAuthentication = (): Authentication => {
  const bcryptAdapter = new BcryptAdapter(env.salt);
  const jwtAdapter = new JwtAdapter(env.secret);
  const accountRepository = new AccountMongoRepository();

  const dbAuthentication = new DbAuthentication(
    accountRepository,
    bcryptAdapter,
    jwtAdapter,
    accountRepository
  );

  return dbAuthentication;
};
