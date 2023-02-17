import { DuplicatedEmailError } from "../../errors";
import {
  badRequest,
  forbidden,
  ok,
  serverError,
} from "../../helpers/http/http-helper";
import {
  AddAccount,
  Authentication,
  Controller,
  HttpRequest,
  HttpResponse,
  Validation,
} from "./singup-controller-protocols";

export class SingUpController implements Controller {
  constructor(
    private readonly addAccount: AddAccount,
    private readonly validation: Validation,
    private readonly authentication: Authentication
  ) {}

  async handle(httpResquest: HttpRequest): Promise<HttpResponse> {
    try {
      const error = this.validation.validate(httpResquest.body);
      if (error) return badRequest(error);

      const { name, email, password } = httpResquest.body;
      const account = await this.addAccount.add({ name, email, password });
      if (!account) return forbidden(new DuplicatedEmailError());

      const accessToken = await this.authentication.auth({ email, password });
      return ok({ accessToken });
    } catch (error) {
      // console.error(error);
      return serverError(error);
    }
  }
}
