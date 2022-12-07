import { LogErrorRepository } from "../../data/protocols/log-error-repository";
import { serverError } from "../../presentation/helpers/http-helper";
import {
  Controller,
  HttpRequest,
  HttpResponse,
} from "../../presentation/protocols";
import { LogControllerDecorator } from "./log";

interface SutType {
  sut: LogControllerDecorator;
  controllerStub: ControllerStub;
  logErrorRepositoryStub: LogErrorRepository;
}

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
    async log(stack: string): Promise<void> {
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
    const httpRequest: HttpRequest = {
      body: {
        email: "any@email.com",
        name: "any",
        password: "any",
        passwordConfirmation: "any",
      },
    };
    await sut.handle(httpRequest);
    expect(handleSpy).toHaveBeenCalledWith(httpRequest);
  });
  test("Should return the same result of the controller", async () => {
    const { sut } = makeSut();
    const httpRequest: HttpRequest = {
      body: {
        email: "any@email.com",
        name: "any",
        password: "any",
        passwordConfirmation: "any",
      },
    };
    const httpResponse = await sut.handle(httpRequest);
    expect(httpResponse).toEqual(mockedHttpResponse);
  });
  test("Should call LogErrorRepository with correct error if controller returns a ServerError", async () => {
    const { sut, controllerStub, logErrorRepositoryStub } = makeSut();

    const fakeError = new Error();
    fakeError.stack = "any stack";
    const error = serverError(fakeError);

    const logSpy = jest.spyOn(logErrorRepositoryStub, "log");

    jest
      .spyOn(controllerStub, "handle")
      .mockReturnValueOnce(new Promise((resolve) => resolve(error)));

    const httpRequest: HttpRequest = {
      body: {
        email: "any@email.com",
        name: "any",
        password: "any",
        passwordConfirmation: "any",
      },
    };
    await sut.handle(httpRequest);
    expect(logSpy).toHaveBeenCalledWith(fakeError.stack);
  });
});
