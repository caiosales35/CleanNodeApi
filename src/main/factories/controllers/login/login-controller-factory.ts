import { LoginController } from "../../../../presentation/controllers/login/login-controller";
import { Controller } from "../../../../presentation/protocols";
import { makeLogControllerDecorator } from "../../decorators/log-controller-decorator-factory";
import { makeDbAuthentication } from "../../usecases/authentication/dbAuthentication-factory";
import { makeLoginValidation } from "../login/login-validation-factory";

export const makeLoginUpController = (): Controller => {
  const loginController = new LoginController(
    makeLoginValidation(),
    makeDbAuthentication()
  );
  return makeLogControllerDecorator(loginController);
};
