import { LogErrorRepository } from "../../data/protocols/db/log/log-error-repository";
import { serverError } from "../../presentation/helpers/http/http-helper";
import {
  Controller,
  HttpRequest,
  HttpResponse,
} from "../../presentation/protocols";
import { LogControllerDecorator } from "./log-controller-decorator";

interface SutType {
  sut: LogControllerDecorator;
  controllerStub: ControllerStub;
  logErrorRepositoryStub: LogErrorRepository;
}

const mockedHttRequest: HttpRequest = {
  body: {
    name: "any name",
    email: "any@email.com",
    password: "any_password",
    passwordConfirmation: "any_password",
  },
};

const mockedHttpResponse: HttpResponse = {
  statusCode: 200,
  body: "any body",
};

class ControllerStub implements Controller {
  async handle(httpResquest: HttpRequest): Promise<HttpResponse> {
    const httpResponse = mockedHttpResponse;
    return new Promise((resolve) => resolve(httpResponse));
  }
}

const makelogErrorRepository = (): LogErrorRepository => {
  class LogErrorRepositoryStub implements LogErrorRepository {
    async logError(stack: string): Promise<void> {
      return new Promise((resolve) => resolve());
    }
  }
  return new LogErrorRepositoryStub();
};

const makeSut = (): SutType => {
  const controllerStub = new ControllerStub();
  const logErrorRepositoryStub = makelogErrorRepository();
  const sut = new LogControllerDecorator(
    controllerStub,
    logErrorRepositoryStub
  );
  return { controllerStub, sut, logErrorRepositoryStub };
};

describe("LogController Decorator", () => {
  test("Should call controller handle", async () => {
    const { sut, controllerStub } = makeSut();

    const handleSpy = jest.spyOn(controllerStub, "handle");
    await sut.handle(mockedHttRequest);
    expect(handleSpy).toHaveBeenCalledWith(mockedHttRequest);
  });
  test("Should return the same result of the controller", async () => {
    const { sut } = makeSut();
    const httpResponse = await sut.handle(mockedHttRequest);
    expect(httpResponse).toEqual(mockedHttpResponse);
  });
  test("Should call LogErrorRepository with correct error if controller returns a ServerError", async () => {
    const { sut, controllerStub, logErrorRepositoryStub } = makeSut();

    const fakeError = new Error();
    fakeError.stack = "any stack";
    const error = serverError(fakeError);

    const logSpy = jest.spyOn(logErrorRepositoryStub, "logError");

    jest
      .spyOn(controllerStub, "handle")
      .mockReturnValueOnce(new Promise((resolve) => resolve(error)));

    await sut.handle(mockedHttRequest);
    expect(logSpy).toHaveBeenCalledWith(fakeError.stack);
  });
});
