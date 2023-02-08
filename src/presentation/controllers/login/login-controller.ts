import {
  badRequest,
  ok,
  serverError,
  unauthorized,
} from "../../helpers/http/http-helper";
import {
  Authentication,
  Controller,
  HttpRequest,
  HttpResponse,
  Validation,
} from "./login-controller-protocols";

export class LoginController implements Controller {
  constructor(
    private readonly validation: Validation,
    private readonly authentication: Authentication
  ) {}

  async handle(httpResquest: HttpRequest): Promise<HttpResponse> {
    try {
      const error = this.validation.validate(httpResquest.body);
      if (error) return badRequest(error);

      const { email, password } = httpResquest.body;
      const accessToken = await this.authentication.auth({ email, password });
      if (!accessToken) return unauthorized();

      return new Promise((resolve) => resolve(ok({ accessToken })));
    } catch (error) {
      return serverError(error);
    }
  }
}
