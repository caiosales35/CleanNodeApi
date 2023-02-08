import { LogErrorRepository } from "../../data/protocols/db/log/log-error-repository";
import {
  Controller,
  HttpRequest,
  HttpResponse,
} from "../../presentation/protocols";

export class LogControllerDecorator implements Controller {
  constructor(
    private readonly controller: Controller,
    private readonly logErrorRepository: LogErrorRepository
  ) {}

  async handle(httpResquest: HttpRequest): Promise<HttpResponse> {
    const httpResponse = await this.controller.handle(httpResquest);
    if (httpResponse.statusCode === 500) {
      await this.logErrorRepository.logError(httpResponse.body.stack);
      // console.error("erro", httpResponse.body);
    }
    return httpResponse;
  }
}
