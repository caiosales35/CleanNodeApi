import { SingUpController } from "../../../../presentation/controllers/login/singup/singup-controller";
import { Controller } from "../../../../presentation/protocols";
import { makeLogControllerDecorator } from "../../decorators/log-controller-decorator-factory";
import { makeDbAddAccount } from "../../usecases/add-account/db-add-account-factory";
import { makeDbAuthentication } from "../../usecases/authentication/dbAuthentication-factory";
import { makeSingUpValidation } from "../singup/singup-validation-factory";

export const makeSingUpController = (): Controller => {
  const singUpController = new SingUpController(
    makeDbAddAccount(),
    makeSingUpValidation(),
    makeDbAuthentication()
  );
  return makeLogControllerDecorator(singUpController);
};
